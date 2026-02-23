#!/bin/bash
# ToWow + Xenos 试用脚本
# 模拟完整的承诺流程

BASE_URL="http://localhost:3000/api/v1"
PROMISER="towow_alice_$(date +%s)"
DELEGATOR="towow_bob"

echo "=== ToWow + Xenos 试用 ==="
echo "承诺方: $PROMISER"
echo "委托方: $DELEGATOR"
echo ""

# 1. 创建承诺
echo "1. 创建承诺..."
RESPONSE=$(curl -s -X POST "$BASE_URL/commitment" \
  -H "Content-Type: application/json" \
  -d "{
    \"promiserId\": \"$PROMISER\",
    \"delegatorId\": \"$DELEGATOR\",
    \"task\": \"完成登录页面开发\",
    \"context\": \"towow\",
    \"deadline\": \"2026-03-01T18:00:00Z\"
  }")

echo "$RESPONSE" | head -100

COMMITMENT_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo ""
echo "承诺 ID: $COMMITMENT_ID"
echo ""

# 2. 查询初始信誉
echo "2. 查询初始信誉..."
curl -s "$BASE_URL/reputation?userId=$PROMISER&context=towow" | head -100
echo ""
echo ""

# 3. 提交履约证据
echo "3. 提交履约证据..."
curl -s -X POST "$BASE_URL/commitment/evidence" \
  -H "Content-Type: application/json" \
  -d "{
    \"commitmentId\": \"$COMMITMENT_ID\",
    \"promiserId\": \"$PROMISER\",
    \"evidence\": {
      \"type\": \"github_pr\",
      \"content\": \"https://github.com/example/pull/123\",
      \"description\": \"登录页面已完成\"
    }
  }" | head -100
echo ""
echo ""

# 4. 验收通过
echo "4. 验收通过..."
curl -s -X POST "$BASE_URL/commitment/verify" \
  -H "Content-Type: application/json" \
  -d "{
    \"commitmentId\": \"$COMMITMENT_ID\",
    \"verifierId\": \"$DELEGATOR\",
    \"fulfilled\": true,
    \"comment\": \"完成得很好！\"
  }" | head -100
echo ""
echo ""

# 5. 查询更新后的信誉
echo "5. 查询更新后的信誉..."
curl -s "$BASE_URL/reputation?userId=$PROMISER&context=towow" | head -100
echo ""
echo ""

echo "=== 试用完成 ==="
echo "访问 http://localhost:3000/dashboard 查看结果"
