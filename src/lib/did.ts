/**
 * DID 服务 - did:key 生成和管理
 * 使用 @noble/ed25519 实现去中心化身份
 */

import * as ed from '@noble/ed25519'
import { sha512 } from '@noble/hashes/sha512'
import { base58btc } from 'multibase'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'

// 启用同步方法
ed.hashes.sha512 = sha512

// did:key 多编解码器代码
const ED25519_PUB_MULTICODEC = new Uint8Array([0xed, 0x01])

export interface DIDKeyPair {
  did: string           // did:key:z...
  publicKey: string     // hex
  privateKey: string    // hex
}

/**
 * 生成新的 did:key 身份
 */
export async function generateDID(): Promise<DIDKeyPair> {
  const { secretKey, publicKey } = ed.keygen()
  
  const pubBytes = publicKey
  const multicodecBytes = new Uint8Array(ED25519_PUB_MULTICODEC.length + pubBytes.length)
  multicodecBytes.set(ED25519_PUB_MULTICODEC, 0)
  multicodecBytes.set(pubBytes, ED25519_PUB_MULTICODEC.length)
  
  const encoded = base58btc.encode(multicodecBytes)
  const did = `did:key:${encoded}`
  
  return {
    did,
    publicKey: bytesToHex(pubBytes),
    privateKey: bytesToHex(secretKey)
  }
}

/**
 * 从公钥生成 did:key
 */
export function publicKeyToDID(publicKeyHex: string): string {
  const pubBytes = hexToBytes(publicKeyHex)
  const multicodecBytes = new Uint8Array(ED25519_PUB_MULTICODEC.length + pubBytes.length)
  multicodecBytes.set(ED25519_PUB_MULTICODEC, 0)
  multicodecBytes.set(pubBytes, ED25519_PUB_MULTICODEC.length)
  
  const encoded = base58btc.encode(multicodecBytes)
  return `did:key:${encoded}`
}

/**
 * 从 did:key 提取公钥
 */
export function didToPublicKey(did: string): string | null {
  if (!did.startsWith('did:key:')) return null
  
  try {
    const encoded = did.slice(8) // 去掉 'did:key:'
    const decoded = base58btc.decode(encoded)
    
    // 跳过 multicodec 前缀 (0xed 0x01)
    const pubBytes = decoded.slice(2)
    return bytesToHex(pubBytes)
  } catch {
    return null
  }
}

/**
 * 使用私钥签名数据
 */
export async function signWithDID(data: string, privateKeyHex: string): Promise<string> {
  const message = new TextEncoder().encode(data)
  const secretKey = hexToBytes(privateKeyHex)
  const signature = ed.sign(message, secretKey)
  return bytesToHex(signature)
}

/**
 * 使用公钥验证签名
 */
export async function verifyDIDSignature(
  data: string, 
  signatureHex: string, 
  publicKeyHex: string
): Promise<boolean> {
  const message = new TextEncoder().encode(data)
  const signature = hexToBytes(signatureHex)
  const publicKey = hexToBytes(publicKeyHex)
  
  return ed.verify(signature, message, publicKey)
}

/**
 * 为用户生成或恢复 DID
 */
export async function ensureUserDID(
  existingDID?: string | null,
  existingPrivateKey?: string | null
): Promise<DIDKeyPair> {
  if (existingDID && existingPrivateKey) {
    return {
      did: existingDID,
      publicKey: didToPublicKey(existingDID) || '',
      privateKey: existingPrivateKey
    }
  }
  
  return generateDID()
}
