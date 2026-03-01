---
name: wechat-article-format
description: 微信公众号文章排版 - 将Markdown/HTML文章转换为微信公众号兼容的格式。用于排版技术文章、产品介绍等内容发布到微信公众号。
---

# 微信公众号文章排版 Skill

## 概述

将文章内容转换为微信公众号兼容的HTML格式，确保样式正确显示。

## 微信公众号 CSS 限制

### ❌ 不支持的属性
- `display: flex` / `display: grid` - 布局
- `linear-gradient` - 渐变背景
- `box-shadow` - 阴影
- `position: relative/absolute` - 定位
- `::before/::after` - 伪元素
- `transform` - 变换

### ✅ 支持的属性
- `background-color` - 纯色背景
- `border` / `border-radius` - 边框
- `color` / `font-size` / `font-weight` - 文字
- `margin` / `padding` - 间距
- `text-align` - 对齐
- `line-height` - 行高

## 推荐配色方案

### 春日风格（樱花粉 + 新芽绿）
```css
/* 主色 - 樱花粉 */
--primary: #E88580;
--primary-light: #FFF0F0;

/* 辅助色 - 新芽绿 */
--secondary: #7CB342;
--secondary-light: #F1F8E9;

/* 文字颜色 */
--text-dark: #2D3748;
--text-gray: #555555;
--text-light: #888888;

/* 背景色 */
--bg-white: #FFFAFA;
--bg-gray: #F5F5F5;
--bg-card: #FFF8E1;
```

## 标准组件模板

### 1. 章节编号（圆点）
```html
<p style="margin:0 0 8px 0;">
  <span style="background:#E88580;color:white;padding:4px 10px;border-radius:14px;font-size:14px;font-weight:bold;">01</span>
</p>
<h2 style="font-size:17px;font-weight:bold;color:#2D3748;margin:0 0 12px 0;">章节标题</h2>
```

### 2. 引用块
```html
<section style="border-left:4px solid #7CB342;background:#F1F8E9;padding:10px 14px;margin:12px 0;color:#555;">
  <span style="color:#7CB342;font-weight:bold;">"引用内容"</span>
</section>
```

### 3. 背景色块标签（核心格式）⭐
```html
<section style="background:#FFF8E1;border-radius:8px;padding:12px;margin:12px 0;border:1px solid #E88580;">
  <p style="margin:6px 0;"><span style="background:#E88580;color:white;padding:2px 8px;border-radius:4px;font-size:13px;">标签</span> 内容文字</p>
  <p style="margin:6px 0;"><span style="background:#7CB342;color:white;padding:2px 8px;border-radius:4px;font-size:13px;">标签2</span> 另一段内容</p>
</section>
```

**统一使用场景：**
- 隐私级别（Full/Partial/None）
- 信誉类型（基础信誉/偏好痕迹）
- 场景化信誉（代码生成/代码审查/Bug修复/文档编写）
- 任务信息（任务/客户/时间/地点/需求/价格）
- 匹配信息（匹配条件/匹配结果）
- 信誉更新（上下文/履约率/最近履约）
- 功能列表（意图个性化/信誉查询/承诺记录/履约证明/场景化信誉）
- 协议服务（Identity/Context/Trace/Reputation）
- 平台列表（ToWow/AgentHub/DataNet）

### 4. 分隔线
```html
<p style="text-align:center;color:#E88580;font-size:13px;margin:20px 0;">· · · · · · · · · · ·</p>
```

### 5. 小标题（带下划线）
```html
<h3 style="font-size:15px;font-weight:bold;color:#7CB342;margin:18px 0 10px 0;padding-bottom:6px;border-bottom:1px solid #C5E1A5;">小标题</h3>
```

### 6. 高亮框
```html
<section style="background:#FFF0F0;border:2px solid #E88580;border-radius:8px;padding:14px;margin:16px 0;text-align:center;">
  <span style="color:#E88580;font-size:16px;font-weight:bold;">高亮内容</span>
</section>
```

## 核心规则

### 1. 统一使用背景色块 ⭐

**禁止使用冒号的场景：**
- ❌ 标题和内容之间（如 `客户沟通：自动回复`）

**允许使用的标点：**
- ✅ 破折号 `——` 或 `—`
- ✅ 等号 `=`
- ✅ 加号 `+`
- ✅ 冒号（非标题内容分隔场景，如句子中）

**正确格式：**
```html
<!-- 错误示例 -->
<span style="color:#E88580;">客户沟通</span>：自动回复

<!-- 正确示例 -->
<span style="background:#E88580;color:white;padding:2px 8px;border-radius:4px;font-size:13px;">ToWow</span> — Agent 协商平台
<span style="background:#E88580;color:white;padding:2px 8px;border-radius:4px;font-size:13px;">客户沟通</span> 自动回复
<section style="background:#FFF8E1;border-radius:8px;padding:12px;margin:12px 0;border:1px solid #E88580;">
<p style="margin:6px 0;"><span style="background:#E88580;color:white;padding:2px 8px;border-radius:4px;font-size:13px;">匹配条件</span> 北京市朝阳区 + 价格 50-100 元</p>
</section>
```

### 2. 章节编号对齐问题
- ❌ 错误：使用独立的 `<section>` 作为编号，会被当作块级元素
- ✅ 正确：使用 `<p><span>` 组合，确保编号是内联元素

### 3. 相关链接部分
- ❌ 错误：用 `<span>●</span>` 包裹符号，微信会添加额外间距
- ❌ 错误：用冒号分隔 `官网：https://...`
- ❌ 错误：符号和标题之间有空格 `◆ 官网`
- ✅ 正确：符号直接写在文字里，无空格，省略 https://

```html
<!-- 正确示例 -->
<section style="background:#F5F5F5;border-radius:8px;padding:16px;margin:16px 0;">
<p style="font-size:16px;font-weight:bold;color:#2D3748;margin:0 0 10px 0;">相关链接</p>
<p style="margin:6px 0;font-size:14px;color:#2D3748;">◆官网 example.com</p>
<p style="margin:6px 0;font-size:14px;color:#2D3748;">◆GitHub github.com/xxx</p>
</section>
```

**关键点：**
- 符号（◆）直接写在文字开头，不用空格
- 格式：`◆标题 域名`（符号和标题之间无空格，标题和域名之间一个空格）
- 省略 `https://` 前缀
- 不用冒号，不用 emoji

### 4. 封面图片 ⭐
- 推荐尺寸：900 × 383（微信公众号封面比例 2.35:1）
- **统一风格：粉紫色梦幻感**
  - 粉紫色风景/卡通图
  - 粉紫色渐变背景
  - 粉紫色梦幻插画
- 避免复杂截图，微信会压缩导致模糊

### 5. margin 设置
- 章节标题使用 `margin:0 0 12px 0`
- 段落使用 `margin:10px 0`
- 列表项使用 `margin:6px 0`
- 背景色块内段落使用 `margin:6px 0`

### 6. 字体设置
```html
style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','PingFang SC','Microsoft YaHei',sans-serif;"
```

## 上传脚本示例

```javascript
const content = `<section style="padding:20px;background:#FFFAFA;...">
  <!-- 文章内容 -->
</section>`;

const article = {
  title: '文章标题',
  content: content,
  digest: '文章摘要',
  author: '作者名'
};
```

## 检查清单

- [ ] 章节编号使用 `<p><span>` 格式（内联元素）
- [ ] 没有使用 flexbox/grid 布局
- [ ] 没有使用渐变背景
- [ ] **标题和内容之间的冒号已替换为背景色块**
- [ ] **封面图为粉紫色梦幻感风格**
- [ ] 相关链接部分用 `◆ 标题 URL` 格式
- [ ] 链接列表每行 `margin:6px 0` 保持一致
- [ ] margin 设置一致
- [ ] 颜色使用配色方案中的颜色

## 常见问题

### Q: 为什么相关链接不要加圆点？
A: 微信中圆点没有固定宽度，会导致文字不对齐。直接显示链接文字更简洁整齐。

### Q: 为什么链接冒号后不加空格？
A: 微信会自动把空格渲染成很大间距，看起来很丑。

### Q: 封面图片有什么要求？
A: 推荐使用 **900×383** 像素的图片。
- **统一风格：粉紫色梦幻感**
- 避免复杂截图，微信会压缩导致模糊

### Q: 标题和内容之间用什么格式？
A: 统一使用背景色块：
```html
<span style="background:#E88580;color:white;padding:2px 8px;border-radius:4px;font-size:13px;">标签</span> 内容文字
```
- **不要用** 冒号分隔标题和内容
- 标题用背景色块，内容直接跟在后面，用空格分隔

### Q: 列表信息如何排版？
A: 使用背景色块卡片格式，每条信息一行：
```html
<section style="background:#FFF8E1;border-radius:8px;padding:12px;margin:12px 0;border:1px solid #E88580;">
<p style="margin:6px 0;"><span style="background:#E88580;color:white;padding:2px 8px;border-radius:4px;font-size:13px;">任务</span> 理发服务</p>
<p style="margin:6px 0;"><span style="background:#E88580;color:white;padding:2px 8px;border-radius:4px;font-size:13px;">客户</span> 张三</p>
<p style="margin:6px 0;"><span style="background:#E88580;color:white;padding:2px 8px;border-radius:4px;font-size:13px;">时间</span> 本周六 14:00</p>
</section>
```
