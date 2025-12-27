#!/bin/bash

# YDS EduAI Platform - Smoke Test Script
# This script tests basic API endpoints to ensure the application is working

BASE_URL="http://localhost:5000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 YDS EduAI Platform - Smoke Tests"
echo "===================================="
echo ""

# Test 1: Health Check
echo "1. Testing Health Check..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/../health")
if [ "$HEALTH" == "200" ]; then
    echo -e "${GREEN}✓${NC} Health check passed"
else
    echo -e "${RED}✗${NC} Health check failed (Status: $HEALTH)"
    exit 1
fi

# Test 2: Register User
echo ""
echo "2. Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "smoketest@example.com",
    "password": "test123456",
    "role": "STUDENT",
    "isPublicStudent": true
  }')

if echo "$REGISTER_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓${NC} User registration successful"
    echo -e "${YELLOW}  Note:${NC} OTP sent to email (check email for OTP)"
else
    echo -e "${RED}✗${NC} User registration failed"
    echo "Response: $REGISTER_RESPONSE"
fi

# Test 3: Login (using seeded user)
echo ""
echo "3. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@yds.com",
    "password": "student123"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓${NC} Login successful"
    echo -e "${YELLOW}  Token:${NC} ${TOKEN:0:20}..."
else
    echo -e "${RED}✗${NC} Login failed"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

# Test 4: Get Student Profile
echo ""
echo "4. Testing Get Student Profile..."
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/student/me" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓${NC} Get student profile successful"
else
    echo -e "${RED}✗${NC} Get student profile failed"
    echo "Response: $PROFILE_RESPONSE"
fi

# Test 5: Get Student Stats
echo ""
echo "5. Testing Get Student Stats..."
STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/student/stats" \
  -H "Authorization: Bearer $TOKEN")

if echo "$STATS_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓${NC} Get student stats successful"
else
    echo -e "${RED}✗${NC} Get student stats failed"
    echo "Response: $STATS_RESPONSE"
fi

# Test 6: Get Internships (Public)
echo ""
echo "6. Testing Get Internships (Public)..."
INTERNSHIPS_RESPONSE=$(curl -s -X GET "$BASE_URL/internships")

if echo "$INTERNSHIPS_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓${NC} Get internships successful"
else
    echo -e "${RED}✗${NC} Get internships failed"
    echo "Response: $INTERNSHIPS_RESPONSE"
fi

# Test 7: Admin Stats (using admin token)
echo ""
echo "7. Testing Admin Stats..."
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yds.com",
    "password": "admin123"
  }')

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ]; then
    ADMIN_STATS=$(curl -s -X GET "$BASE_URL/admin/stats" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    
    if echo "$ADMIN_STATS" | grep -q "success"; then
        echo -e "${GREEN}✓${NC} Admin stats successful"
    else
        echo -e "${RED}✗${NC} Admin stats failed"
        echo "Response: $ADMIN_STATS"
    fi
else
    echo -e "${YELLOW}⚠${NC} Admin login failed, skipping admin stats test"
fi

echo ""
echo "===================================="
echo -e "${GREEN}✅ Smoke tests completed!${NC}"
echo ""
echo "Note: Some tests may require seeded data."
echo "Run 'npm run seed' in the backend directory if tests fail."

