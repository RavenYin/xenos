@echo off
REM Xenos ToWow Plugin 启动脚本 (Windows)

cd backend

REM 检查虚拟环境
if not exist "venv" (
    echo 创建虚拟环境...
    python -m venv venv
)

REM 激活虚拟环境
call venv\Scripts\activate.bat

REM 安装依赖
echo 安装依赖...
pip install -r requirements.txt

REM 启动服务
echo 启动 Xenos ToWow Plugin...
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

pause
