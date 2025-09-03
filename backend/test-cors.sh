#!/bin/bash

# CORS Test Script for ShopifyGenie Backend
# This script tests the CORS configuration to ensure frontend can connect

echo "🧪 Testing CORS Configuration for ShopifyGenie Backend"
echo "=================================================="

# Base URL for the backend
BASE_URL="http://localhost:8080/api"

# Test 1: Preflight OPTIONS request
echo ""
echo "1. Testing CORS Preflight Request..."
curl -X OPTIONS "${BASE_URL}/products" \
  -H "Origin: http://localhost:5000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization,Content-Type" \
  -v 2>&1 | grep -E "(Access-Control-|HTTP/)"

# Test 2: Simple GET request (should fail without auth, but CORS should work)
echo ""
echo ""
echo "2. Testing CORS GET Request..."
curl -X GET "${BASE_URL}/products" \
  -H "Origin: http://localhost:5000" \
  -H "Content-Type: application/json" \
  -v 2>&1 | grep -E "(Access-Control-|HTTP/)"

# Test 3: Test with different origin
echo ""
echo ""
echo "3. Testing with different origin (localhost:3000)..."
curl -X OPTIONS "${BASE_URL}/products" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization,Content-Type" \
  -v 2>&1 | grep -E "(Access-Control-|HTTP/)"

echo ""
echo ""
echo "✅ CORS Test Complete!"
echo ""
echo "Expected Results:"
echo "- Access-Control-Allow-Origin should include your origin"
echo "- Access-Control-Allow-Methods should include GET,POST,PUT,DELETE,PATCH,OPTIONS"
echo "- Access-Control-Allow-Headers should include * or specific headers"
echo "- Access-Control-Allow-Credentials should be true"
echo ""
echo "If you see these headers, CORS is properly configured! 🎉"
