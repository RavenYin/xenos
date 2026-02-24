#!/usr/bin/env node
/**
 * Xenos MCP Server
 * 让 AI Agent 能通过 MCP 调用 Xenos 信任协议
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const API_URL = process.env.XENOS_API_URL || 'http://localhost:3000'

const server = new McpServer({
  name: 'xenos-vca',
  version: '0.1.0',
})

// Tool: 创建承诺
server.tool(
  'create_commitment',
  '创建一个新的可验证承诺证明 (VCA)',
  {
    promiser_id: z.string().describe('承诺者 ID'),
    delegator_id: z.string().describe('委托方 ID'),
    task: z.string().describe('任务描述'),
    context: z.string().default('default').describe('上下文标签'),
    deadline: z.string().optional().describe('截止时间 (ISO)'),
  },
  async ({ promiser_id, delegator_id, task, context, deadline }) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/commitment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promiserId: promiser_id, delegatorId: delegator_id, task, context, deadline }),
      })
      const data = await res.json()
      if (data.code !== 0) return { content: [{ type: 'text', text: `失败: ${data.error}` }] }
      return { content: [{ type: 'text', text: `创建成功!\nID: ${data.data.id}\n状态: ${data.data.status}` }] }
    } catch (e) { return { content: [{ type: 'text', text: `错误: ${e}` }] } }
  }
)

// Tool: 接受承诺
server.tool(
  'accept_commitment',
  '承诺方接受一个承诺',
  { commitment_id: z.string().describe('承诺 ID') },
  async ({ commitment_id }) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/commitment/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitmentId: commitment_id }),
      })
      const data = await res.json()
      if (data.code !== 0) return { content: [{ type: 'text', text: `失败: ${data.error}` }] }
      return { content: [{ type: 'text', text: `已接受! 状态: ${data.data.status}` }] }
    } catch (e) { return { content: [{ type: 'text', text: `错误: ${e}` }] } }
  }
)

// Tool: 提交证据
server.tool(
  'submit_evidence',
  '承诺方提交履约证据',
  { commitment_id: z.string().describe('承诺 ID'), evidence: z.string().describe('证据') },
  async ({ commitment_id, evidence }) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/commitment/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitmentId: commitment_id, evidence }),
      })
      const data = await res.json()
      if (data.code !== 0) return { content: [{ type: 'text', text: `失败: ${data.error}` }] }
      return { content: [{ type: 'text', text: `证据已提交! 等待验收` }] }
    } catch (e) { return { content: [{ type: 'text', text: `错误: ${e}` }] } }
  }
)

// Tool: 验收
server.tool(
  'verify_commitment',
  '委托方验收承诺',
  { 
    commitment_id: z.string().describe('承诺 ID'), 
    result: z.enum(['approved', 'rejected', 'returned']).describe('结果'),
    comment: z.string().optional().describe('备注') 
  },
  async ({ commitment_id, result, comment }) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/commitment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitmentId: commitment_id, result, comment }),
      })
      const data = await res.json()
      if (data.code !== 0) return { content: [{ type: 'text', text: `失败: ${data.error}` }] }
      const msg = { approved: '通过', rejected: '不通过', returned: '退回补充' }[result]
      return { content: [{ type: 'text', text: `验收${msg}!` }] }
    } catch (e) { return { content: [{ type: 'text', text: `错误: ${e}` }] } }
  }
)

// Tool: 查询信誉
server.tool(
  'get_reputation',
  '查询 Agent 信誉',
  { user_id: z.string().describe('用户 ID'), context: z.string().default('default').describe('上下文') },
  async ({ user_id, context }) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/reputation?userId=${user_id}&context=${context}`)
      const data = await res.json()
      if (data.code !== 0) return { content: [{ type: 'text', text: `失败: ${data.error}` }] }
      const r = data.data
      return { content: [{ type: 'text', text: `信誉: ${(r.fulfillmentRate*100).toFixed(1)}%\n总数: ${r.totalCommitments}\n完成: ${r.fulfilledCount}` }] }
    } catch (e) { return { content: [{ type: 'text', text: `错误: ${e}` }] } }
  }
)

// Tool: 查询承诺列表
server.tool(
  'list_commitments',
  '查询承诺列表',
  { user_id: z.string().describe('用户 ID'), role: z.enum(['promiser', 'delegator']).describe('角色') },
  async ({ user_id, role }) => {
    try {
      const ep = role === 'promiser' ? 'promises' : 'delegations'
      const res = await fetch(`${API_URL}/api/v1/${ep}?userId=${user_id}`)
      const data = await res.json()
      if (data.code !== 0) return { content: [{ type: 'text', text: `失败: ${data.error}` }] }
      const list = (data.data || []).map((c: any) => `[${c.status}] ${c.task}`).join('\n')
      return { content: [{ type: 'text', text: list || '无承诺' }] }
    } catch (e) { return { content: [{ type: 'text', text: `错误: ${e}` }] } }
  }
)

// 启动
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Xenos MCP Server 已启动')
}

main().catch(console.error)
