/**
 * VC 服务 - 可验证凭证签发和验证
 * 简化实现，用于 MVP
 */

import { signWithDID, verifyDIDSignature, didToPublicKey } from './did'

export interface VerifiableCredential {
  '@context': string[]
  id: string
  type: string[]
  issuer: {
    id: string
  }
  issuanceDate: string
  expirationDate?: string
  credentialSubject: {
    id: string
    [key: string]: any
  }
  proof?: {
    type: string
    created: string
    proofPurpose: string
    verificationMethod: string
    proofValue: string
  }
}

export interface CommitmentCredential {
  commitmentId: string
  promiserDid: string
  receiverDid?: string
  context: string
  task: string
  deadline?: string
  status: 'PENDING' | 'FULFILLED' | 'FAILED' | 'CANCELLED'
}

export interface AttestationCredential {
  attestationId: string
  commitmentId: string
  attesterDid: string
  fulfilled: boolean
  evidence?: string
  comment?: string
}

const VC_CONTEXTS = [
  'https://www.w3.org/2018/credentials/v1',
  'https://w3id.org/security/suites/ed25519-2020/v1'
]

/**
 * 生成 VC ID
 */
function generateVCId(type: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10)
  return `urn:vc:xenos:${type}:${timestamp}:${random}`
}

/**
 * 签发承诺凭证
 */
export async function issueCommitmentVC(
  credential: CommitmentCredential,
  issuerDid: string,
  issuerPrivateKey: string
): Promise<VerifiableCredential> {
  const vcId = generateVCId('commitment')
  const now = new Date().toISOString()
  
  const vc: VerifiableCredential = {
    '@context': VC_CONTEXTS,
    id: vcId,
    type: ['VerifiableCredential', 'CommitmentCredential'],
    issuer: { id: issuerDid },
    issuanceDate: now,
    credentialSubject: {
      id: credential.promiserDid,
      commitmentId: credential.commitmentId,
      context: credential.context,
      task: credential.task,
      status: credential.status,
      ...(credential.receiverDid && { receiverDid: credential.receiverDid }),
      ...(credential.deadline && { deadline: credential.deadline })
    }
  }
  
  // 创建签名数据
  const signData = JSON.stringify({
    id: vc.id,
    type: vc.type,
    issuer: vc.issuer,
    issuanceDate: vc.issuanceDate,
    credentialSubject: vc.credentialSubject
  })
  
  const proofValue = await signWithDID(signData, issuerPrivateKey)
  
  vc.proof = {
    type: 'Ed25519Signature2020',
    created: now,
    proofPurpose: 'assertionMethod',
    verificationMethod: `${issuerDid}#key-1`,
    proofValue
  }
  
  return vc
}

/**
 * 签发履约证明凭证
 */
export async function issueAttestationVC(
  credential: AttestationCredential,
  issuerDid: string,
  issuerPrivateKey: string
): Promise<VerifiableCredential> {
  const vcId = generateVCId('attestation')
  const now = new Date().toISOString()
  
  const vc: VerifiableCredential = {
    '@context': VC_CONTEXTS,
    id: vcId,
    type: ['VerifiableCredential', 'AttestationCredential'],
    issuer: { id: issuerDid },
    issuanceDate: now,
    credentialSubject: {
      id: credential.attesterDid,
      attestationId: credential.attestationId,
      commitmentId: credential.commitmentId,
      fulfilled: credential.fulfilled,
      ...(credential.evidence && { evidence: credential.evidence }),
      ...(credential.comment && { comment: credential.comment })
    }
  }
  
  // 创建签名数据
  const signData = JSON.stringify({
    id: vc.id,
    type: vc.type,
    issuer: vc.issuer,
    issuanceDate: vc.issuanceDate,
    credentialSubject: vc.credentialSubject
  })
  
  const proofValue = await signWithDID(signData, issuerPrivateKey)
  
  vc.proof = {
    type: 'Ed25519Signature2020',
    created: now,
    proofPurpose: 'assertionMethod',
    verificationMethod: `${issuerDid}#key-1`,
    proofValue
  }
  
  return vc
}

/**
 * 验证可验证凭证
 */
export async function verifyVC(vc: VerifiableCredential): Promise<{
  valid: boolean
  error?: string
}> {
  if (!vc.proof) {
    return { valid: false, error: '缺少 proof 字段' }
  }
  
  const publicKey = didToPublicKey(vc.issuer.id)
  if (!publicKey) {
    return { valid: false, error: '无法从 issuer DID 提取公钥' }
  }
  
  // 重建签名数据
  const signData = JSON.stringify({
    id: vc.id,
    type: vc.type,
    issuer: vc.issuer,
    issuanceDate: vc.issuanceDate,
    credentialSubject: vc.credentialSubject
  })
  
  try {
    const isValid = await verifyDIDSignature(
      signData,
      vc.proof.proofValue,
      publicKey
    )
    
    if (!isValid) {
      return { valid: false, error: '签名验证失败' }
    }
    
    // 检查过期时间
    if (vc.expirationDate && new Date(vc.expirationDate) < new Date()) {
      return { valid: false, error: '凭证已过期' }
    }
    
    return { valid: true }
  } catch (error) {
    return { valid: false, error: `验证异常: ${error}` }
  }
}

/**
 * 将 VC 序列化为 JSON 字符串
 */
export function vcToString(vc: VerifiableCredential): string {
  return JSON.stringify(vc)
}

/**
 * 从 JSON 字符串解析 VC
 */
export function stringToVC(str: string): VerifiableCredential | null {
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}
