import { NextRequest, NextResponse } from 'next/server'

// 微信公众号凭证 - 从环境变量获取，不硬编码
const WECHAT_APP_ID = process.env.WECHAT_APP_ID
const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET

// 缓存 access_token
let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (!WECHAT_APP_ID || !WECHAT_APP_SECRET) {
    throw new Error('微信公众号凭证未配置')
  }

  // 检查缓存
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }

  const res = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_APP_ID}&secret=${WECHAT_APP_SECRET}`
  )

  const data = await res.json()

  if (data.errcode) {
    throw new Error(`获取 access_token 失败: ${data.errmsg}`)
  }

  // 缓存 token（提前 5 分钟过期）
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000
  }

  return data.access_token
}

interface PublishRequest {
  title: string
  content: string
  thumb_media_id?: string  // 封面图 media_id（可选）
  author?: string
  digest?: string          // 摘要
  content_source_url?: string  // 原文链接
  need_open_comment?: number   // 是否打开评论
  only_fans_can_comment?: number  // 是否粉丝可评论
}

export async function POST(request: NextRequest) {
  try {
    const body: PublishRequest = await request.json()

    if (!body.title || !body.content) {
      return NextResponse.json(
        { code: 1, error: '标题和内容不能为空' },
        { status: 400 }
      )
    }

    const accessToken = await getAccessToken()

    // 1. 创建草稿
    const draftRes = await fetch(
      `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles: [{
            title: body.title,
            author: body.author || 'Xenos',
            content: body.content,
            thumb_media_id: body.thumb_media_id || '',
            digest: body.digest || body.content.substring(0, 120),
            content_source_url: body.content_source_url || '',
            need_open_comment: body.need_open_comment ?? 0,
            only_fans_can_comment: body.only_fans_can_comment ?? 0
          }]
        })
      }
    )

    const draftData = await draftRes.json()

    if (draftData.errcode) {
      return NextResponse.json(
        { code: 1, error: `创建草稿失败: ${draftData.errmsg}` },
        { status: 400 }
      )
    }

    const mediaId = draftData.media_id

    // 2. 发布草稿
    const publishRes = await fetch(
      `https://api.weixin.qq.com/cgi-bin/freepublish/submit?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_id: mediaId })
      }
    )

    const publishData = await publishRes.json()

    if (publishData.errcode) {
      // 如果是正在发布中，也算成功
      if (publishData.errcode === 0 || publishData.errcode === 40001) {
        return NextResponse.json({
          code: 0,
          data: {
            media_id: mediaId,
            publish_status: 'pending',
            msg_data_id: publishData.msg_data_id
          }
        })
      }
      return NextResponse.json(
        { code: 1, error: `发布失败: ${publishData.errmsg}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      code: 0,
      data: {
        media_id: mediaId,
        publish_status: 'success',
        msg_data_id: publishData.msg_data_id
      }
    })

  } catch (error) {
    console.error('微信发布错误:', error)
    return NextResponse.json(
      { code: 1, error: error instanceof Error ? error.message : '发布失败' },
      { status: 500 }
    )
  }
}

// 获取发布状态
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mediaId = searchParams.get('media_id')

  if (!mediaId) {
    return NextResponse.json(
      { code: 1, error: '缺少 media_id' },
      { status: 400 }
    )
  }

  try {
    const accessToken = await getAccessToken()

    const res = await fetch(
      `https://api.weixin.qq.com/cgi-bin/freepublish/get?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_id: mediaId })
      }
    )

    const data = await res.json()

    return NextResponse.json({ code: 0, data })

  } catch (error) {
    return NextResponse.json(
      { code: 1, error: error instanceof Error ? error.message : '查询失败' },
      { status: 500 }
    )
  }
}
