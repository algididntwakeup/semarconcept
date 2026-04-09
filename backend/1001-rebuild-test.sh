#!/bin/bash
# Quick test script to verify the tenant_id fix

echo "🎯 QUICK TEST - TENANT_ID FIX VERIFICATION"
echo "=========================================="

# Test health endpoint first
echo ""
echo "🔍 Step 1: Testing backend health..."
HEALTH_RESPONSE=$(curl -s https://breksolindo.opuschamber.com/api/v1/health)
if [[ $? -eq 0 && "$HEALTH_RESPONSE" == *"ok"* ]]; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    echo "Response: $HEALTH_RESPONSE"
    exit 1
fi

# Test authentication
echo ""
echo "🔐 Step 2: Testing authentication..."
AUTH_RESPONSE=$(curl -s --location 'https://breksolindo.opuschamber.com/api/v1/auth/login' \
  --header 'Content-Type: application/json' \
  --data '{
    "username": "admin",
    "password": "1019181716"
  }')

echo "Auth Response:"
echo "$AUTH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$AUTH_RESPONSE"

TOKEN=$(echo "$AUTH_RESPONSE" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if 'data' in data:
        print(data['data'].get('token', data['data'].get('access_token', '')))
    else:
        print(data.get('token', data.get('access_token', '')))
except:
    pass
" 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ Authentication failed"
    exit 1
fi

echo "✅ Authentication successful"

# Test user creation with role assignment
echo ""
echo "👥 Step 3: Testing user creation with role assignment..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RANDOM_SUFFIX=$(shuf -i 1000-9999 -n 1)

USER_CREATE_RESPONSE=$(curl -s --location 'https://breksolindo.opuschamber.com/api/v1/users' \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json' \
  --header "Authorization: Bearer $TOKEN" \
  --data "{
    \"username\": \"test.tenant.fix.${TIMESTAMP}.${RANDOM_SUFFIX}\",
    \"email\": \"test.tenant.fix.${TIMESTAMP}.${RANDOM_SUFFIX}@reksolindo.com\",
    \"password\": \"SecurePassword123!\",
    \"first_name\": \"Test Tenant\",
    \"last_name\": \"Fix ${RANDOM_SUFFIX}\",
    \"is_active\": true,
    \"is_superuser\": false,
    \"role_ids\": [1]
  }")

echo ""
echo "📋 User Creation Response:"
echo "$USER_CREATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$USER_CREATE_RESPONSE"

if echo "$USER_CREATE_RESPONSE" | grep -q "\"status\":\"success\""; then
    echo ""
    echo "🎉 SUCCESS! User created with role assignment!"
    echo "✅ The tenant_id fix is working correctly!"
    
    # Extract user ID for database verification
    USER_ID=$(echo "$USER_CREATE_RESPONSE" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if 'data' in data:
        print(data['data'].get('id', ''))
except:
    pass
" 2>/dev/null)
    
    if [ ! -z "$USER_ID" ] && [ "$USER_ID" != "null" ]; then
        echo ""
        echo "🔍 Database Verification:"
        echo "User ID: $USER_ID"
        echo "Check user_roles: SELECT * FROM user_roles WHERE user_id = $USER_ID;"
    fi
else
    echo ""
    echo "❌ FAILED! User creation with role assignment failed!"
    echo "The tenant_id issue may still exist."
fi

echo ""
echo "🏁 Test completed!"