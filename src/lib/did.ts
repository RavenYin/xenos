/**
 * DID 服务 - did:key 生成和管理（简化版 MVP）
 */

import * as ed from '@noble/ed25519'

export interface DIDKeyPair {
  did: string           // did:key:z...
  publicKey: string     // hex
  privateKey: string    // hex
}

/**
 * Base58BTC 编码表
 */
const BASE58BTC_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function base58btcEncode(buffer: Uint8Array): string {
  const digits = [0]
  for (let i = 0; i < buffer.length; i++) {
    let carry = buffer[i]
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8
      digits[j] = carry % 58
      carry = (carry / 58) | 0
    }
    while (carry) {
      digits.push(carry % 58)
      carry = (carry / 58) | 0
    }
  }
  let result = ''
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    result += '1'
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    result += BASE58BTC_ALPHABET[digits[i]]
  }
  return result
}

function base58btcDecode(str: string): Uint8Array {
  const bytes = [0]
  for (let i = 0; i < str.length; i++) {
    const carry = BASE58BTC_ALPHABET.indexOf(str[i])
    if (carry === -1) throw new Error('Invalid base58 character')
    for (let j = 0; j < bytes.length; j++) {
      bytes[j] *= 58
    }
    bytes[0] += carry
    let k = 0
    while (bytes[k] > 255) {
      (bytes[k + 1] ??= 0)
      bytes[k + 1] += (bytes[k] / 256) | 0
      bytes[k] %= 256
      k++
    }
  }
  let leadingZeros = 0
  for (let i = 0; i < str.length && str[i] === '1'; i++) {
    leadingZeros++
  }
  const result = new Uint8Array(leadingZeros + bytes.length)
  result.set(bytes.reverse(), leadingZeros)
  return result
}

// did:key 多编解码器代码
const ED25519_PUB_MULTICODEC = new Uint8Array([0xed, 0x01])

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

/**
 * 生成新的 did:key 身份
 */
export async function generateDID(): Promise<DIDKeyPair> {
  const privateKey = ed.utils.randomSecretKey()
  const publicKey = await ed.getPublicKeyAsync(privateKey)
  
  const multicodecBytes = new Uint8Array(ED25519_PUB_MULTICODEC.length + publicKey.length)
  multicodecBytes.set(ED25519_PUB_MULTICODEC, 0)
  multicodecBytes.set(publicKey, ED25519_PUB_MULTICODEC.length)
  
  const encoded = base58btcEncode(multicodecBytes)
  const did = `did:key:z${encoded}`
  
  return {
    did,
    publicKey: bytesToHex(publicKey),
    privateKey: bytesToHex(privateKey)
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
  
  const encoded = base58btcEncode(multicodecBytes)
  return `did:key:z${encoded}`
}

/**
 * 从 did:key 提取公钥
 */
export function didToPublicKey(did: string): string | null {
  if (!did.startsWith('did:key:z')) return null
  
  try {
    const encoded = did.slice(9) // 去掉 'did:key:z'
    const decoded = base58btcDecode(encoded)
    
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
  const signature = await ed.signAsync(message, secretKey)
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
  
  return ed.verifyAsync(signature, message, publicKey)
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
