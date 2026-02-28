#!/bin/bash

# Xenos ToWow Plugin 测试脚本

cd backend

# 激活虚拟环境
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# 运行所有测试
echo "运行所有测试..."
pytest tests/ -v -s --tb=short

# 运行测试并生成覆盖率报告
echo ""
echo "生成覆盖率报告..."
pytest tests/ --cov=app --cov-report=html --cov-report=term

echo ""
echo "测试完成！覆盖率报告在 backend/htmlcov/index.html"
