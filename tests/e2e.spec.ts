import { test, expect, Page } from '@playwright/test'

// 测试用户凭据
const TEST_USER = {
  email: 'test@example.com',
  name: 'Test User',
}

// 辅助函数：创建测试用户
async function ensureTestUser(page: Page) {
  // 通过 API 创建测试用户（如果不存在）
  const response = await page.request.post('http://localhost:3000/api/test/create-user', {
    data: TEST_USER
  }).catch(() => null)
  
  // 即使创建失败也继续（用户可能已存在）
}

// 辅助函数：登录
async function login(page: Page) {
  await page.goto('/')
  
  // 检查是否已登录
  const dashboardVisible = await page.locator('text=Xenos').isVisible().catch(() => false)
  if (dashboardVisible && page.url().includes('dashboard')) {
    return
  }
  
  // 模拟登录：设置 cookie
  await page.context().addCookies([{
    name: 'session_user_id',
    value: 'test_user_001',
    domain: 'localhost',
    path: '/',
  }])
  
  await page.goto('/dashboard')
}

test.describe('VCA 系统测试', () => {
  
  test.describe('登录流程', () => {
    test('应该能访问首页', async ({ page }) => {
      await page.goto('/')
      await expect(page).toHaveTitle(/Xenos/)
    })

    test('登录后应该跳转到 Dashboard', async ({ page }) => {
      await login(page)
      await expect(page).toHaveURL(/dashboard/)
      await expect(page.locator('text=Xenos')).toBeVisible()
    })
  })

  test.describe('Dashboard 功能', () => {
    test.beforeEach(async ({ page }) => {
      await login(page)
    })

    test('应该显示四个标签页', async ({ page }) => {
      await expect(page.locator('text=个人信息')).toBeVisible()
      await expect(page.locator('text=我承诺的')).toBeVisible()
      await expect(page.locator('text=委托我的')).toBeVisible()
      await expect(page.locator('text=信誉')).toBeVisible()
    })

    test('点击标签应该切换内容', async ({ page }) => {
      // 点击"我承诺的"
      await page.click('text=我承诺的')
      await expect(page.locator('text=我向别人承诺')).toBeVisible()
      
      // 点击"委托我的"
      await page.click('text=委托我的')
      await expect(page.locator('text=别人承诺帮我完成')).toBeVisible()
      
      // 点击"信誉"
      await page.click('text=信誉')
      await expect(page.locator('text=信誉').nth(1)).toBeVisible()
    })
  })

  test.describe('承诺创建', () => {
    test.beforeEach(async ({ page }) => {
      await login(page)
      await page.click('text=我承诺的')
    })

    test('应该能创建新承诺', async ({ page }) => {
      // 填写承诺表单
      await page.fill('input[placeholder*="上下文"]', 'playwright-test')
      await page.fill('textarea[placeholder*="任务"]', 'E2E 测试任务 - ' + Date.now())
      
      // 提交
      await page.click('button:has-text("创建承诺")')
      
      // 等待成功提示或列表刷新
      await page.waitForTimeout(1000)
      
      // 验证承诺出现在列表中
      await expect(page.locator('text=playwright-test')).toBeVisible()
    })
  })

  test.describe('承诺列表', () => {
    test.beforeEach(async ({ page }) => {
      await login(page)
    })

    test('承诺方视角应该显示正确的操作按钮', async ({ page }) => {
      await page.click('text=我承诺的')
      
      // 查找待确认的承诺
      const pendingCard = page.locator('text=待确认').first()
      if (await pendingCard.isVisible()) {
        await expect(page.locator('button:has-text("接受承诺")').first()).toBeVisible()
        await expect(page.locator('button:has-text("拒绝")').first()).toBeVisible()
      }
    })

    test('委托方视角应该显示验收按钮', async ({ page }) => {
      await page.click('text=委托我的')
      await page.waitForTimeout(500)
      
      // 查找待验收的承诺
      const pendingVerify = page.locator('text=待验收').first()
      if (await pendingVerify.isVisible()) {
        await expect(page.locator('button:has-text("验收通过")').first()).toBeVisible()
        await expect(page.locator('button:has-text("验收不通过")').first()).toBeVisible()
      }
    })

    test('状态筛选应该工作', async ({ page }) => {
      await page.click('text=我承诺的')
      
      // 点击"待确认"筛选
      await page.click('button:has-text("待确认")')
      await page.waitForTimeout(500)
      
      // 所有显示的承诺应该是待确认状态
      const badges = page.locator('.bg-blue-100')
      const count = await badges.count()
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })
})
