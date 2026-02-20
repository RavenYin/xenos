// 创建测试用户并测试 VCA 功能
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // 创建测试用户
  const user = await prisma.user.upsert({
    where: { secondmeUserId: 'test-user-001' },
    update: {},
    create: {
      secondmeUserId: 'test-user-001',
      email: 'test@example.com',
      name: '测试用户',
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
      tokenExpiresAt: new Date(Date.now() + 86400000),
      did: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'
    }
  })
  
  console.log('✅ 测试用户创建成功:', user.id)

  // 创建承诺
  const commitment = await prisma.commitment.create({
    data: {
      promiserId: user.id,
      context: 'towow-agent',
      task: '测试承诺：明天完成 MVP 开发',
      deadline: new Date(Date.now() + 86400000),
      status: 'PENDING'
    }
  })
  
  console.log('✅ 承诺创建成功:', commitment.id)

  // 创建履约证明
  const attestation = await prisma.attestation.create({
    data: {
      commitmentId: commitment.id,
      attesterId: user.id,
      fulfilled: true,
      comment: '已完成测试'
    }
  })
  
  console.log('✅ 履约证明创建成功:', attestation.id)

  // 更新承诺状态为已完成
  const updatedCommitment = await prisma.commitment.update({
    where: { id: commitment.id },
    data: { status: 'FULFILLED' }
  })
  
  console.log('✅ 承诺状态更新:', updatedCommitment.status)

  // 查询统计
  const stats = await prisma.commitment.groupBy({
    by: ['status'],
    where: { promiserId: user.id },
    _count: true
  })
  
  console.log('\n📊 用户承诺统计:')
  stats.forEach(s => console.log(`  - ${s.status}: ${s._count}`))
  
  console.log('\n✅ 测试完成！用户 ID:', user.id)
  console.log('现在可以使用这个用户 ID 进行 API 测试')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
