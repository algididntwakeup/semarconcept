#!/bin/bash

# 🔥 Production-Ready Frontend Testing Script
# This script will verify your frontend is ready for production

set -e  # Exit on any error

echo "🚀 Starting Production-Ready Frontend Testing..."
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
WARNINGS=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((TESTS_FAILED++))
    fi
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

# Function to print info
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo
echo "🔍 STEP 1: ENVIRONMENT CHECK"
echo "================================"

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Not in frontend directory. Please run from platform/frontend-mui/${NC}"
    exit 1
fi
print_result 0 "Frontend directory confirmed"

# Check Node version
NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
if [[ "$NODE_VERSION" == "not found" ]]; then
    print_result 1 "Node.js installation"
else
    print_result 0 "Node.js version: $NODE_VERSION"
fi

# Check if npm/pnpm is available
if command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
    print_result 0 "Package manager: pnpm"
elif command -v npm &> /dev/null; then
    PACKAGE_MANAGER="npm"
    print_result 0 "Package manager: npm"
else
    print_result 1 "Package manager (npm/pnpm)"
    exit 1
fi

echo
echo "🔍 STEP 2: BACKEND CONNECTIVITY CHECK"
echo "======================================"

# Backend URL from environment or default
BACKEND_URL=${VITE_API_BASE_URL:-"https://breksolindo.opuschamber.com"}
print_info "Backend URL: $BACKEND_URL"

# Test backend health
echo "Testing backend health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/health_response.json "$BACKEND_URL/health" 2>/dev/null || echo "000")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    print_result 0 "Backend health check"
    BACKEND_STATUS=$(cat /tmp/health_response.json | grep -o '"status":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "unknown")
    print_info "Backend status: $BACKEND_STATUS"
else
    print_result 1 "Backend health check (HTTP $HEALTH_RESPONSE)"
fi

# Test auth endpoint
echo "Testing backend auth endpoint..."
AUTH_TEST=$(curl -s -w "%{http_code}" -X POST "$BACKEND_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"invalid"}' 2>/dev/null | tail -c 3)
if [ "$AUTH_TEST" = "401" ] || [ "$AUTH_TEST" = "400" ]; then
    print_result 0 "Backend auth endpoint (returns proper error)"
else
    print_result 1 "Backend auth endpoint (HTTP $AUTH_TEST)"
fi

echo
echo "🔍 STEP 3: ENVIRONMENT VARIABLES CHECK"
echo "======================================"

# Check .env file exists
if [ -f ".env" ]; then
    print_result 0 ".env file exists"
    
    # Check critical environment variables
    source .env 2>/dev/null || true
    
    # VITE_API_BASE_URL
    if [ -n "$VITE_API_BASE_URL" ]; then
        print_result 0 "VITE_API_BASE_URL is set: $VITE_API_BASE_URL"
    else
        print_result 1 "VITE_API_BASE_URL is missing"
    fi
    
    # VITE_APP_ENV
    if [ -n "$VITE_APP_ENV" ]; then
        print_result 0 "VITE_APP_ENV is set: $VITE_APP_ENV"
        if [ "$VITE_APP_ENV" = "production" ]; then
            print_info "Environment set to production ✅"
        fi
    else
        print_warning "VITE_APP_ENV not set (will default to development)"
    fi
    
    # Debug mode checks
    if [ "$VITE_DEBUG_MODE" = "false" ] || [ -z "$VITE_DEBUG_MODE" ]; then
        print_result 0 "Debug mode properly disabled"
    else
        print_warning "Debug mode is enabled (VITE_DEBUG_MODE=$VITE_DEBUG_MODE)"
    fi
    
    # Mock data checks
    if [ "$VITE_USE_MOCK_DATA" = "false" ] || [ -z "$VITE_USE_MOCK_DATA" ]; then
        print_result 0 "Mock data properly disabled"
    else
        print_result 1 "Mock data is enabled (VITE_USE_MOCK_DATA=$VITE_USE_MOCK_DATA)"
    fi

else
    print_result 1 ".env file missing"
fi

echo
echo "🔍 STEP 4: SOURCE CODE ANALYSIS"
echo "==============================="

print_info "Checking for remaining mock data in source code..."

# Check for mock authentication
MOCK_AUTH_COUNT=$(grep -r "mockLogin\|mock.*[aA]uth\|dev.*[tT]oken\|fake.*[tT]oken" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
if [ "$MOCK_AUTH_COUNT" -eq 0 ]; then
    print_result 0 "No mock authentication found"
else
    print_result 1 "Found $MOCK_AUTH_COUNT potential mock authentication references"
    print_info "Run: grep -r 'mockLogin\\|mock.*[aA]uth' src/ --include='*.ts' --include='*.tsx'"
fi

# Check for hardcoded tokens/passwords
HARDCODED_COUNT=$(grep -r "password.*=.*['\"].*['\"]" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "placeholder\|Password\|''" | wc -l)
if [ "$HARDCODED_COUNT" -eq 0 ]; then
    print_result 0 "No hardcoded credentials found"
else
    print_result 1 "Found $HARDCODED_COUNT potential hardcoded credentials"
fi

# Check for console.log statements (should be minimal in production)
CONSOLE_COUNT=$(grep -r "console\.log\|console\.debug" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
if [ "$CONSOLE_COUNT" -lt 10 ]; then
    print_result 0 "Minimal console statements ($CONSOLE_COUNT found)"
else
    print_warning "Many console statements found ($CONSOLE_COUNT) - consider removing for production"
fi

# Check for TODO/FIXME comments
TODO_COUNT=$(grep -r "TODO\|FIXME\|XXX" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
if [ "$TODO_COUNT" -eq 0 ]; then
    print_result 0 "No TODO/FIXME comments found"
else
    print_info "$TODO_COUNT TODO/FIXME comments found"
fi

echo
echo "🔍 STEP 5: DEPENDENCY CHECK"
echo "==========================="

# Check if node_modules exists
if [ -d "node_modules" ]; then
    print_result 0 "Dependencies installed"
else
    print_result 1 "Dependencies not installed"
    print_info "Run: $PACKAGE_MANAGER install"
fi

# Check for security vulnerabilities (if npm)
if [ "$PACKAGE_MANAGER" = "npm" ]; then
    print_info "Checking for security vulnerabilities..."
    if npm audit --audit-level=high 2>/dev/null >/dev/null; then
        print_result 0 "No high-severity vulnerabilities"
    else
        print_warning "Security vulnerabilities found - run 'npm audit' for details"
    fi
fi

echo
echo "🔍 STEP 6: BUILD TEST"
echo "===================="

print_info "Testing production build..."

# Clean previous build
if [ -d "dist" ]; then
    rm -rf dist
    print_info "Cleaned previous build"
fi

# Attempt build
if $PACKAGE_MANAGER run build >/dev/null 2>&1; then
    print_result 0 "Production build successful"
    
    # Check build size
    if [ -d "dist" ]; then
        BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
        print_info "Build size: $BUILD_SIZE"
        
        # Check for critical files
        if [ -f "dist/index.html" ]; then
            print_result 0 "index.html generated"
        else
            print_result 1 "index.html missing"
        fi
        
        # Check for JS/CSS files
        JS_COUNT=$(find dist -name "*.js" | wc -l)
        CSS_COUNT=$(find dist -name "*.css" | wc -l)
        print_info "Generated files: $JS_COUNT JS, $CSS_COUNT CSS"
        
    fi
else
    print_result 1 "Production build failed"
    print_info "Run '$PACKAGE_MANAGER run build' to see detailed errors"
fi

echo
echo "🔍 STEP 7: MANUAL TESTING INSTRUCTIONS"
echo "======================================"

print_info "Manual tests to perform:"
echo
echo "1. 🌐 Start development server:"
echo "   $PACKAGE_MANAGER run dev"
echo
echo "2. 🔐 Test real authentication:"
echo "   - Navigate to http://localhost:4071/login"
echo "   - Use real credentials: admin / [your_password]"
echo "   - Verify no mock data appears"
echo
echo "3. 🔍 Test browser network tab:"
echo "   - All requests should go to: $BACKEND_URL"
echo "   - No requests to localhost:3000 or mock endpoints"
echo "   - Check for proper JWT tokens (not dev-mock-* tokens)"
echo
echo "4. 🚫 Test production safety:"
echo "   - DevAuthPanel should only appear in development"
echo "   - No TestLogin component should be accessible"
echo "   - No mock authentication options"
echo
echo "5. 📱 Test core functionality:"
echo "   - Login/logout flow"
echo "   - Dashboard loads with real data"
echo "   - User permissions work correctly"
echo "   - API calls return real backend data"

echo
echo "🔍 STEP 8: PRODUCTION DEPLOYMENT CHECKLIST"
echo "=========================================="

echo "Before deploying to production:"
echo
echo "✅ Set environment variables:"
echo "   VITE_APP_ENV=production"
echo "   VITE_DEBUG_MODE=false"
echo "   VITE_USE_MOCK_DATA=false"
echo "   VITE_API_BASE_URL=https://your-production-backend.com"
echo
echo "✅ Build and test:"
echo "   $PACKAGE_MANAGER run build"
echo "   $PACKAGE_MANAGER run preview  # Test production build locally"
echo
echo "✅ Security checklist:"
echo "   - No hardcoded credentials"
echo "   - No mock authentication bypasses"
echo "   - HTTPS enabled"
echo "   - Proper error handling"
echo "   - Debug panels disabled"

echo
echo "📊 TEST SUMMARY"
echo "==============="
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo
    echo -e "${GREEN}🎉 CONGRATULATIONS!${NC}"
    echo -e "${GREEN}Your frontend appears to be production-ready!${NC}"
    echo
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Please review the $WARNINGS warning(s) above.${NC}"
    fi
else
    echo
    echo -e "${RED}❌ Issues found that need attention:${NC}"
    echo -e "${RED}Please fix the $TESTS_FAILED failed test(s) before production deployment.${NC}"
    exit 1
fi

echo
echo "🔗 Quick Test Commands:"
echo "======================"
echo "# Test backend directly:"
echo "curl $BACKEND_URL/health"
echo
echo "# Test login API:"
echo "curl -X POST $BACKEND_URL/api/v1/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"username\":\"admin\",\"password\":\"your_password\"}'"
echo
echo "# Start development server:"
echo "$PACKAGE_MANAGER run dev"
echo
echo "# Build for production:"
echo "$PACKAGE_MANAGER run build"

# Cleanup
rm -f /tmp/health_response.json 2>/dev/null || true

echo
echo "🚀 Frontend production testing complete!"
echo "========================================"
