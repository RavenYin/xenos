import os
import datetime
import json
import sys
# ================= 配置区域 =================
# ⚠️ 请修改为你实际的 Obsidian 库路径 (绝对路径)
VAULT_PATH = "/home/wguo/Downloads/MyVault"
# 🛡️ 安全围栏：只允许修改特定文件，防止 AI 误删系统文件
ALLOWED_FILES = ["Inbox.md", "00-inbox.md"]
def append_to_note(file_name: str, content: str, timestamp: bool = True) -> str:
    """工具函数：向笔记追加内容"""
    try:
        # 1. 路径与权限校验 (Grounding)
        if file_name not in ALLOWED_FILES:
            return f"Error: 权限拒绝。AI 只能访问 {ALLOWED_FILES}"
        full_path = os.path.join(VAULT_PATH, file_name)
        # 2. 构造内容
        final_content = content
        if timestamp:
            time_str = datetime.datetime.now().strftime("%H:%M:%S")
            final_content = f"\n> 🕒 {time_str} {content}"
        # 3. 执行写入 (Append Mode)
        # 使用 'a' 模式打开，确保是追加而不是覆盖
        with open(full_path, 'a', encoding='utf-8') as f:
            f.write(final_content)
        return f"Success: 已成功写入 {file_name}。"
    except Exception as e:
        return f"Error: 写入失败 - {str(e)}"
# ================= 模拟 MCP 监听循环 =================
if __name__ == "__main__":
    print(f"🔌 Obsidian IO Server 已启动... 监听路径: {VAULT_PATH}")
    print("等待 JSON 指令 (输入 'exit' 退出):")
    while True:
        try:
            # 模拟接收指令：注意 input() 一次只读一行
            user_input = input()
            if user_input.strip() == "exit": break
            # 解析与路由 (Routing)
            data = json.loads(user_input)
            # 只有当 tool_name 匹配时才执行
            if data.get("tool_name") == "append_to_note":
                args = data.get("arguments", {})
                result = append_to_note(
                    args.get("file_name"),
                    args.get("content"),
                    args.get("timestamp", True)
                )
                # 返回标准 JSON 结果
                print(json.dumps({"status": "completed", "result": result}, ensure_ascii=False))
            else:
                print(json.dumps({"status": "error", "message": "未知工具"}, ensure_ascii=False))
        except json.JSONDecodeError:
            print(json.dumps({"status": "error", "message": "无效的 JSON 格式 (请确保输入为单行)"}, ensure_ascii=False))