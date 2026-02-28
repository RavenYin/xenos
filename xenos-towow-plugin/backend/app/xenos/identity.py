"""Xenos Identity Service - 生成和管理 Xenos ID"""
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidSignature
import base58
import httpx
from typing import Optional, Dict, Any
from datetime import datetime


XENOS_API_BASE = "http://localhost:3000/api/v1"


def generate_xenos_id(agent_name: str = "", existing_xenos_id: str = "") -> dict:
    """
    生成或获取 Xenos ID

    Args:
        agent_name: Agent 名称
        existing_xenos_id: 已存在的 Xenos ID（用于查询）

    Returns:
        包含 xenosId, privateKey, didDocument 的字典
    """

    if existing_xenos_id:
        # 查询已存在的 Agent
        try:
            with httpx.Client() as client:
                response = client.get(f"{XENOS_API_BASE}/agent/{existing_xenos_id}")
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "agentId": data["data"].get("agentId", ""),
                        "xenosId": existing_xenos_id,
                        "privateKey": "",  # 不返回私钥
                        "didDocument": data["data"].get("didDocument", {})
                    }
        except:
            pass

        return {
            "agentId": "",
            "xenosId": existing_xenos_id,
            "privateKey": "",
            "didDocument": {}
        }

    # 生成新的 Xenos ID
    try:
        # 生成 Ed25519 密钥对
        private_key = ed25519.Ed25519PrivateKey.generate()
        public_key = private_key.public_key()

        # 公钥序列化
        public_key_bytes = public_key.public_bytes_raw()
        public_key_hex = public_key_bytes.hex()

        # 编码为 did:key 格式
        # Multicodec Ed25519-Public key: 0xed01 + public_key (32 bytes)
        # 参考规范: https://github.com/multiformats/multicodec/blob/master/table.csv
        multicodec = bytes([0xed, 0x01]) + public_key_bytes
        # 使用 base58.b58encode（不带校验和），这是 did:key 规范的要求
        public_key_b58 = base58.b58encode(multicodec)
        xenos_id = f"did:key:z{public_key_b58.decode('utf-8')}"

        # 构造 DID 文档
        did_document = {
            "@context": [
                "https://www.w3.org/ns/did/v1",
                "https://w3id.org/security/v2"
            ],
            "id": xenos_id,
            "type": ["DIDDocument", "VerifiableCredential"],
            "verificationMethod": [
                {
                    "id": f"{xenos_id}#key-1",
                    "type": "Ed25519VerificationKey2020",
                    "controller": xenos_id,
                    "publicKeyJwk": {
                        "kty": "OKP",
                        "crv": "Ed25519",
                        "x": public_key_hex
                    },
                    "publicKeyMultibase": f"z{public_key_b58.decode('utf-8')}"
                }
            ],
            "authentication": [f"{xenos_id}#key-1"],
            "assertionMethod": [f"{xenos_id}#key-1"]
        }

        # 尝试注册到 Xenos 服务
        try:
            with httpx.Client() as client:
                response = client.post(f"{XENOS_API_BASE}/agent/register", json={
                    "agentName": agent_name or f"Agent-{xenos_id[:8]}",
                    "agentType": "towow-agent",
                    "capabilities": ["negotiation", "task-execution", "communication"]
                })
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "agentId": data["data"].get("agentId", ""),
                        "xenosId": xenos_id,
                        "privateKey": private_key.private_bytes_raw().hex(),
                        "didDocument": did_document
                    }
        except:
            pass

        # 如果 Xenos 服务不可用，返回本地生成的 ID
        return {
            "agentId": "",
            "xenosId": xenos_id,
            "privateKey": private_key.private_bytes_raw().hex(),
            "didDocument": did_document,
            "notice": "Xenos service unavailable, using locally generated ID"
        }

    except Exception as e:
        raise Exception(f"Xenos ID generation failed: {str(e)}")


def extract_public_key_from_did(xenos_id: str) -> Optional[bytes]:
    """
    从 Xenos ID 中提取公钥

    Args:
        xenos_id: did:key 格式的 ID

    Returns:
        公钥字节，如果解析失败返回 None
    """
    try:
        # 移除 "did:key:z" 前缀
        if not xenos_id.startswith("did:key:z"):
            return None

        multicodec_b58 = xenos_id[9:]  # 去掉 "did:key:z" (9个字符)

        # Base58 解码（不带校验和）
        multicodec = base58.b58decode(multicodec_b58)

        # 检查 multicodec 头 (0xed, 0x01 = Ed25519-Public)
        if len(multicodec) < 2 or multicodec[0] != 0xed or multicodec[1] != 0x01:
            return None

        # 提取公钥（去掉前两个字节）
        public_key_bytes = multicodec[2:]
        return public_key_bytes

    except Exception as e:
        print(f"Failed to extract public key: {e}")
        return None


def verify_xenos_signature(xenos_id: str, signature: str, message: str) -> bool:
    """
    验证 Xenos 签名

    Args:
        xenos_id: 签名者的 Xenos ID
        signature: 签名（十六进制字符串）
        message: 原始消息

    Returns:
        签名是否有效
    """
    try:
        # 提取公钥
        public_key_bytes = extract_public_key_from_did(xenos_id)
        if not public_key_bytes:
            return False

        # 创建公钥对象
        public_key = ed25519.Ed25519PublicKey.from_public_bytes(public_key_bytes)

        # 解码签名
        signature_bytes = bytes.fromhex(signature)

        # 验证签名
        public_key.verify(signature_bytes, message.encode())

        return True

    except InvalidSignature:
        return False
    except Exception as e:
        print(f"Signature verification error: {e}")
        return False


def sign_message(private_key_hex: str, message: str) -> str:
    """
    使用私钥签名消息

    Args:
        private_key_hex: 私钥（十六进制字符串）
        message: 要签名的消息

    Returns:
        签名（十六进制字符串）
    """
    try:
        # 解码私钥
        private_key_bytes = bytes.fromhex(private_key_hex)
        private_key = ed25519.Ed25519PrivateKey.from_private_bytes(private_key_bytes)

        # 签名
        signature = private_key.sign(message.encode())

        # 返回十六进制编码的签名
        return signature.hex()

    except Exception as e:
        raise Exception(f"Failed to sign message: {str(e)}")


def create_verifiable_credential(
    private_key_hex: str,
    xenos_id: str,
    credential_type: str,
    credential_data: Dict[str, Any],
    issuer_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    创建可验证凭证

    Args:
        private_key_hex: 签发者的私钥
        xenos_id: 主体 Xenos ID
        credential_type: 凭证类型
        credential_data: 凭证数据
        issuer_id: 签发者 ID（默认使用私钥对应的 ID）

    Returns:
        可验证凭证
    """
    try:
        # 构造凭证
        credential = {
            "@context": [
                "https://www.w3.org/2018/credentials/v1"
            ],
            "type": ["VerifiableCredential", credential_type],
            "issuer": issuer_id or xenos_id,
            "issuanceDate": datetime.utcnow().isoformat() + "Z",
            "credentialSubject": {
                "id": xenos_id,
                **credential_data
            }
        }

        # 序列化用于签名
        credential_str = f"{credential['type']}{credential['issuer']}{credential['issuanceDate']}{str(credential['credentialSubject'])}"

        # 签名
        signature = sign_message(private_key_hex, credential_str)

        # 添加证明
        credential["proof"] = {
            "type": "Ed25519Signature2020",
            "created": datetime.utcnow().isoformat() + "Z",
            "proofPurpose": "assertionMethod",
            "verificationMethod": f"{xenos_id}#key-1",
            "jws": f"{signature}"
        }

        return credential

    except Exception as e:
        raise Exception(f"Failed to create verifiable credential: {str(e)}")


def get_agent_reputation(xenos_id: str, context: Optional[str] = None) -> dict:
    """获取 Agent 场景化信誉（兼容旧接口）"""
    try:
        # 导入信誉服务
        from .reputation import calculate_agent_reputation

        return calculate_agent_reputation(xenos_id, context)

    except Exception as e:
        # 如果信誉服务不可用，返回模拟数据
        return {
            "xenosId": xenos_id,
            "agentName": "Demo Agent",
            "overallScore": 850,
            "contexts": [
                {
                    "context": "negotiation",
                    "contextName": "协商",
                    "fulfillmentRate": 0.92,
                    "fulfilledCount": 46,
                    "failedCount": 4,
                    "total": 50,
                    "score": 920,
                    "confidence": "high"
                },
                {
                    "context": "task_execution",
                    "contextName": "任务执行",
                    "fulfillmentRate": 0.88,
                    "fulfilledCount": 35,
                    "failedCount": 5,
                    "total": 40,
                    "score": 880,
                    "confidence": "medium"
                }
            ],
            "details": {
                "fulfillmentRate": 0.90,
                "fulfilledCount": 81,
                "failedCount": 9,
                "totalCount": 90
            },
            "timestamp": datetime.now().isoformat()
        }
