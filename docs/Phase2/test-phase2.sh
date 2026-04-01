#!/bin/bash

# Phase 2 Testing Script
# Tests authentication endpoints and webhook functionality

BASE_URL="http://localhost:4000"
CLERK_JWT="your_clerk_jwt_token_here"

echo "================================"
echo "Phase 2 Testing - ViCare API"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "Test 1: Health Check"
response=$(curl -s -w "\n%{http_code}" $BASE_URL/health)
status_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$status_code" -eq 200 ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Health check returned 200"
    echo "$body" | jq '.'
else
    echo -e "${RED}✗ FAILED${NC} - Expected 200, got $status_code"
fi
echo ""

# Test 2: API Root
echo "Test 2: API Root"
response=$(curl -s -w "\n%{http_code}" $BASE_URL/api)
status_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$status_code" -eq 200 ]; then
    echo -e "${GREEN}✓ PASSED${NC} - API root returned 200"
    echo "$body" | jq '.'
else
    echo -e "${RED}✗ FAILED${NC} - Expected 200, got $status_code"
fi
echo ""

# Test 3: Auth Status without token (should fail)
echo "Test 3: Auth Status - No Token (Should Fail)"
response=$(curl -s -w "\n%{http_code}" $BASE_URL/api/auth/status)
status_code=$(echo "$response" | tail -n 1)

if [ "$status_code" -eq 401 ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Correctly rejected unauthorized request (401)"
else
    echo -e "${RED}✗ FAILED${NC} - Expected 401, got $status_code"
fi
echo ""

# Test 4: Auth Status with token (requires valid Clerk JWT)
echo "Test 4: Auth Status - With Token"
if [ "$CLERK_JWT" != "your_clerk_jwt_token_here" ]; then
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $CLERK_JWT" \
        $BASE_URL/api/auth/status)
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" -eq 200 ]; then
        echo -e "${GREEN}✓ PASSED${NC} - Auth status returned 200"
        echo "$body" | jq '.'
    else
        echo -e "${RED}✗ FAILED${NC} - Expected 200, got $status_code"
        echo "$body"
    fi
else
    echo -e "${YELLOW}⊘ SKIPPED${NC} - Set CLERK_JWT variable to test authenticated endpoints"
fi
echo ""

# Test 5: Complete Signup - Patient (requires token)
echo "Test 5: Complete Signup - Patient"
if [ "$CLERK_JWT" != "your_clerk_jwt_token_here" ]; then
    response=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Authorization: Bearer $CLERK_JWT" \
        -H "Content-Type: application/json" \
        -d '{
            "userType": "patient",
            "studentId": "21BCE0001",
            "phone": "+919876543210"
        }' \
        $BASE_URL/api/auth/complete-signup)
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" -eq 201 ] || [ "$status_code" -eq 400 ]; then
        echo -e "${GREEN}✓ PASSED${NC} - Complete signup endpoint working (201 or 400 if already exists)"
        echo "$body" | jq '.'
    else
        echo -e "${RED}✗ FAILED${NC} - Unexpected status code: $status_code"
        echo "$body"
    fi
else
    echo -e "${YELLOW}⊘ SKIPPED${NC} - Set CLERK_JWT variable to test"
fi
echo ""

# Test 6: Invalid Route (404)
echo "Test 6: 404 Handling"
response=$(curl -s -w "\n%{http_code}" $BASE_URL/api/nonexistent)
status_code=$(echo "$response" | tail -n 1)

if [ "$status_code" -eq 404 ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Correctly returned 404 for invalid route"
else
    echo -e "${RED}✗ FAILED${NC} - Expected 404, got $status_code"
fi
echo ""

echo "================================"
echo "Testing Complete"
echo "================================"
echo ""
echo "To test authenticated endpoints:"
echo "1. Sign up/in via Clerk in your frontend"
echo "2. Get the JWT token from Clerk"
echo "3. Set CLERK_JWT in this script and run again"
echo ""
echo "To test webhook:"
echo "1. Configure webhook in Clerk Dashboard"
echo "2. Endpoint: $BASE_URL/api/webhooks/clerk"
echo "3. Sign up a new user via Clerk UI"
echo "4. Check server logs for webhook processing"
