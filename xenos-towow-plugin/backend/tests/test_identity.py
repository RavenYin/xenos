"""Xenos 身份管理测试"""
import pytest
from app.xenos.identity import (
    generate_xenos_id,
    verify_xenos_signature,
    sign_message,
    extract_public_key_from_did
)


class TestIdentityService:
    """身份服务测试"""

    def test_generate_xenos_id(self):
        """测试生成 Xenos ID"""
        result = generate_xenos_id("Test Agent")

        # 验证返回结果
        assert "xenosId" in result
        assert "privateKey" in result
        assert "didDocument" in result
        assert result["xenosId"].startswith("did:key:")
        assert len(result["privateKey"]) == 64  # Ed25519 私钥是 32 字节 = 64 十六进制字符

        print(f"✅ Xenos ID 生成成功: {result['xenosId']}")

    def test_get_existing_agent(self):
        """测试获取已存在的 Agent"""
        xenos_id = "did:key:test123"

        result = generate_xenos_id("", xenos_id)

        assert "xenosId" in result
        assert result["xenosId"] == xenos_id

        print(f"✅ 查询 Agent 测试通过")

    def test_extract_public_key(self):
        """测试从 DID 中提取公钥"""
        # 首先生成一个 Xenos ID
        result = generate_xenos_id("Test Agent")
        xenos_id = result["xenosId"]

        # 提取公钥
        public_key = extract_public_key_from_did(xenos_id)

        assert public_key is not None
        assert len(public_key) == 32  # Ed25519 公钥是 32 字节

        print(f"✅ 公钥提取测试通过: {len(public_key)} bytes")

    def test_sign_and_verify(self):
        """测试签名和验证"""
        # 生成密钥对
        result = generate_xenos_id("Test Agent")
        xenos_id = result["xenosId"]
        private_key_hex = result["privateKey"]

        # 签名消息
        message = "Hello, Xenos!"
        signature = sign_message(private_key_hex, message)

        assert signature is not None
        assert len(signature) == 128  # Ed25519 签名是 64 字节 = 128 十六进制字符

        # 验证签名
        is_valid = verify_xenos_signature(xenos_id, signature, message)

        assert is_valid is True

        print(f"✅ 签名验证测试通过")

    def test_verify_invalid_signature(self):
        """测试验证无效签名"""
        result = generate_xenos_id("Test Agent")
        xenos_id = result["xenosId"]

        message = "Hello, Xenos!"
        invalid_signature = "0" * 128

        is_valid = verify_xenos_signature(xenos_id, invalid_signature, message)

        assert is_valid is False

        print(f"✅ 无效签名测试通过")

    def test_did_document_structure(self):
        """测试 DID 文档结构"""
        result = generate_xenos_id("Test Agent")
        did_document = result["didDocument"]

        # 验证 DID 文档结构
        assert "@context" in did_document
        assert "id" in did_document
        assert did_document["id"] == result["xenosId"]
        assert "verificationMethod" in did_document
        assert "authentication" in did_document
        assert "assertionMethod" in did_document

        print(f"✅ DID 文档结构测试通过")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
