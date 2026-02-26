@echo off
echo ================================================
echo Xenos CloudBase 部署脚本
echo ================================================
echo.

REM 检查是否安装 cloudbase/cli
cloudbase -v >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 CloudBase CLI
    echo 请先安装: npm install -g @cloudbase/cli
    pause
    exit /b 1
)

REM 登录
echo 正在登录 CloudBase...
cloudbase login
if errorlevel 1 (
    echo [错误] 登录失败
    pause
    exit /b 1
)

REM 选择环境
echo.
echo 请选择部署环境:
echo 1) 生产环境
echo 2) 测试环境
set /p choice="请输入序号 (1/2): "

if "%choice%"=="1" (
    set ENV_ID=your-prod-env-id
    set DOMAIN=your-prod-domain.cloudbase.xyz
) else (
    set ENV_ID=your-test-env-id
    set DOMAIN=your-test-domain.cloudbase.xyz
)

echo.
echo [重要] 请手动设置环境变量 (在 CloudBase 控制台):
echo SECONDME_CLIENT_ID=your_client_id
echo SECONDME_CLIENT_SECRET=your_client_secret
echo NEXTAUTH_SECRET=your_nextauth_secret
echo DATABASE_URL=your_database_url
echo.
pause

REM 部署
echo 开始部署...
cloudbase deploy --env %ENV_ID%

if errorlevel 1 (
    echo [错误] 部署失败
    pause
    exit /b 1
)

echo.
echo ================================================
echo 部署完成！
echo 访问地址: https://%DOMAIN%
echo ================================================
pause