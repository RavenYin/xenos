import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000/api/v1'

test.describe('VCA REST API 测试', () => {
  
  test.describe('信誉 API', () => {
    test('GET /api/v1/reputation 应该返回用户信誉', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/reputation?userId=test_user`)
      
      expect(response.ok()).toBeTruthy()
      
      const data = await response.json()
      expect(data.code).toBe(0)
      expect(data.data).toHaveProperty('userId')
      expect(data.data).toHaveProperty('score')
      expect(data.data).toHaveProperty('level')
      expect(data.data).toHaveProperty('totalCommitments')
    })

    test('GET /api/v1/reputation 缺少 userId 应该返回 400', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/reputation`)
      
      expect(response.status()).toBe(400)
      
      const data = await response.json()
      expect(data.code).toBe(400)
    })
  })

  test.describe('承诺 API', () => {
    test('POST /api/v1/commitment 应该创建承诺', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/commitment`, {
        data: {
          promiserId: 'promiser_001',
          delegatorId: 'delegator_001',
          task: 'API 测试任务 - ' + Date.now(),
          context: 'api-test'
        }
      })
      
      expect(response.ok()).toBeTruthy()
      
      const data = await response.json()
      expect(data.code).toBe(0)
      expect(data.data).toHaveProperty('id')
      expect(data.data.status).toBe('PENDING_ACCEPT')
    })

    test('POST /api/v1/commitment 缺少必填字段应该返回 400', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/commitment`, {
        data: {
          task: '缺少 promiserId 和 delegatorId'
        }
      })
      
      expect(response.status()).toBe(400)
    })

    test('GET /api/v1/commitment 应该获取承诺详情', async ({ request }) => {
      // 先创建一个承诺
      const createResponse = await request.post(`${BASE_URL}/commitment`, {
        data: {
          promiserId: 'promiser_002',
          delegatorId: 'delegator_002',
          task: '测试获取详情',
          context: 'api-test'
        }
      })
      
      const createData = await createResponse.json()
      const commitmentId = createData.data.id
      
      // 获取承诺详情
      const getResponse = await request.get(`${BASE_URL}/commitment?id=${commitmentId}`)
      
      expect(getResponse.ok()).toBeTruthy()
      
      const getData = await getResponse.json()
      expect(getData.code).toBe(0)
      expect(getData.data.id).toBe(commitmentId)
    })

    test('GET /api/v1/commitment 不存在的 ID 应该返回 404', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/commitment?id=non_existent_id`)
      
      expect(response.status()).toBe(404)
    })
  })

  test.describe('承诺操作 API', () => {
    test('POST /api/v1/commitment/accept 应该接受承诺', async ({ request }) => {
      // 创建一个新的承诺
      const createRes = await request.post(`${BASE_URL}/commitment`, {
        data: {
          promiserId: 'promiser_accept_001',
          delegatorId: 'delegator_accept_001',
          task: '接受测试 - ' + Date.now(),
          context: 'accept-test'
        }
      })
      
      const createData = await createRes.json()
      const commitmentId = createData.data.id
      
      const response = await request.post(`${BASE_URL}/commitment/accept`, {
        data: {
          commitmentId,
          promiserId: 'promiser_accept_001'
        }
      })
      
      expect(response.ok()).toBeTruthy()
      
      const data = await response.json()
      expect(data.code).toBe(0)
      expect(data.data.status).toBe('ACCEPTED')
    })

    test('POST /api/v1/commitment/reject 应该拒绝承诺', async ({ request }) => {
      // 创建一个新的承诺
      const createRes = await request.post(`${BASE_URL}/commitment`, {
        data: {
          promiserId: 'promiser_reject_001',
          delegatorId: 'delegator_reject_001',
          task: '拒绝测试 - ' + Date.now(),
          context: 'reject-test'
        }
      })
      
      const createData = await createRes.json()
      const commitmentId = createData.data.id
      
      const response = await request.post(`${BASE_URL}/commitment/reject`, {
        data: {
          commitmentId,
          promiserId: 'promiser_reject_001',
          reason: '测试拒绝'
        }
      })
      
      expect(response.ok()).toBeTruthy()
      
      const data = await response.json()
      expect(data.code).toBe(0)
      expect(data.data.status).toBe('REJECTED')
    })
  })

  test.describe('查询 API', () => {
    test('GET /api/v1/promises 应该返回我的承诺列表', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/promises?promiserId=test_user`)
      
      expect(response.ok()).toBeTruthy()
      
      const data = await response.json()
      expect(data.code).toBe(0)
      expect(data.data).toHaveProperty('commitments')
      expect(data.data).toHaveProperty('total')
    })

    test('GET /api/v1/delegations 应该返回我的委托列表', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/delegations?delegatorId=test_user`)
      
      expect(response.ok()).toBeTruthy()
      
      const data = await response.json()
      expect(data.code).toBe(0)
      expect(data.data).toHaveProperty('commitments')
      expect(data.data).toHaveProperty('total')
    })
  })

  test.describe('完整承诺流程', () => {
    test('应该完成完整的承诺流程：创建→接受→提交→验收', async ({ request }) => {
      const uniqueId = Date.now()
      
      // 1. 创建承诺
      const createRes = await request.post(`${BASE_URL}/commitment`, {
        data: {
          promiserId: `flow_promiser_${uniqueId}`,
          delegatorId: `flow_delegator_${uniqueId}`,
          task: '完整流程测试任务',
          context: 'flow-test'
        }
      })
      
      expect(createRes.ok()).toBeTruthy()
      const createData = await createRes.json()
      const commitmentId = createData.data.id
      expect(createData.data.status).toBe('PENDING_ACCEPT')
      
      // 2. 接受承诺
      const acceptRes = await request.post(`${BASE_URL}/commitment/accept`, {
        data: {
          commitmentId,
          promiserId: `flow_promiser_${uniqueId}`
        }
      })
      
      expect(acceptRes.ok()).toBeTruthy()
      const acceptData = await acceptRes.json()
      expect(acceptData.data.status).toBe('ACCEPTED')
      
      // 3. 提交履约
      const submitRes = await request.post(`${BASE_URL}/commitment/submit`, {
        data: {
          commitmentId,
          promiserId: `flow_promiser_${uniqueId}`,
          evidence: 'https://example.com/evidence'
        }
      })
      
      expect(submitRes.ok()).toBeTruthy()
      const submitData = await submitRes.json()
      expect(submitData.data.status).toBe('PENDING')
      
      // 4. 验收通过
      const verifyRes = await request.post(`${BASE_URL}/commitment/verify`, {
        data: {
          commitmentId,
          verifierId: `flow_delegator_${uniqueId}`,
          fulfilled: true,
          comment: '验收通过'
        }
      })
      
      expect(verifyRes.ok()).toBeTruthy()
      const verifyData = await verifyRes.json()
      expect(verifyData.data.fulfilled).toBe(true)
      
      // 5. 验证最终状态
      const finalRes = await request.get(`${BASE_URL}/commitment?id=${commitmentId}`)
      const finalData = await finalRes.json()
      expect(finalData.data.status).toBe('FULFILLED')
    })
  })
})
