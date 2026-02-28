@echo off
REM Xenos ToWow Plugin 测试脚本 (Windows)

cd backend

REM 激活虚拟环境
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

REM 运行所有测试
echo 运行所有测试...
pytest tests/ -v -s --tb=short

REM 运行测试并生成覆盖率报告
echo.
echo 生成覆盖率报告...
pytest tests/ --cov=app --cov-report=html --cov-report=term

echo.
echo 测试完成！覆盖率报告在 backend\htmlcov\index.html

pause
