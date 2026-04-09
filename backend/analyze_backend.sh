#!/bin/bash

# Backend Analysis Scripts for Reksolindo Platform
# Usage: ./analyze_backend.sh
# Output: Creates analysis files for debugging

echo "🔍 Analyzing Reksolindo Backend Structure..."

# Create output directory
mkdir -p backend_analysis
cd backend_analysis

# Go to backend directory (adjust path as needed)
if [ -d "../backend" ]; then
    BACKEND_DIR="../backend"
elif [ -d "./backend" ]; then
    BACKEND_DIR="./backend"
else
    echo "❌ Backend directory not found! Please run from project root."
    exit 1
fi

echo "📁 Backend directory: $BACKEND_DIR"

# 1. Current Request Models Analysis
echo "📝 1. Analyzing current request models..."
echo "=== ROLE REQUEST MODEL ===" > request_models_analysis.txt
if [ -f "$BACKEND_DIR/app/models/request/role_request.go" ]; then
    echo "✅ File exists: role_request.go" >> request_models_analysis.txt
    echo "--- Content ---" >> request_models_analysis.txt
    cat "$BACKEND_DIR/app/models/request/role_request.go" >> request_models_analysis.txt
else
    echo "❌ File NOT found: role_request.go" >> request_models_analysis.txt
fi

echo "" >> request_models_analysis.txt
echo "=== PERMISSION REQUEST MODEL ===" >> request_models_analysis.txt
if [ -f "$BACKEND_DIR/app/models/request/permission_request.go" ]; then
    echo "✅ File exists: permission_request.go" >> request_models_analysis.txt
    echo "--- Content ---" >> request_models_analysis.txt
    cat "$BACKEND_DIR/app/models/request/permission_request.go" >> request_models_analysis.txt
else
    echo "❌ File NOT found: permission_request.go" >> request_models_analysis.txt
fi

# 2. Current Handler Analysis
echo "🔧 2. Analyzing current handlers..."
echo "=== ROLE HANDLER ===" > handlers_analysis.txt
if [ -f "$BACKEND_DIR/app/api/handlers/role_handler.go" ]; then
    echo "✅ File exists: role_handler.go" >> handlers_analysis.txt
    echo "--- Key sections ---" >> handlers_analysis.txt
    grep -n -A5 -B5 "CreateRole\|c.Get.*user" "$BACKEND_DIR/app/api/handlers/role_handler.go" >> handlers_analysis.txt
else
    echo "❌ File NOT found: role_handler.go" >> handlers_analysis.txt
fi

echo "" >> handlers_analysis.txt
echo "=== PERMISSION HANDLER ===" >> handlers_analysis.txt
if [ -f "$BACKEND_DIR/app/api/handlers/permission_handler.go" ]; then
    echo "✅ File exists: permission_handler.go" >> handlers_analysis.txt
    echo "--- Key sections ---" >> handlers_analysis.txt
    grep -n -A5 -B5 "CreatePermission\|c.Get.*user" "$BACKEND_DIR/app/api/handlers/permission_handler.go" >> handlers_analysis.txt
else
    echo "❌ File NOT found: permission_handler.go" >> handlers_analysis.txt
fi

# 3. Route Registration Analysis
echo "🛤️ 3. Analyzing route registration..."
echo "=== ROUTER ANALYSIS ===" > router_analysis.txt
if [ -f "$BACKEND_DIR/app/api/routes/router.go" ]; then
    echo "✅ File exists: router.go" >> router_analysis.txt
    echo "--- Route registrations ---" >> router_analysis.txt
    grep -n -A10 -B5 "roles\|permissions\|menus\|configurations" "$BACKEND_DIR/app/api/routes/router.go" >> router_analysis.txt
else
    echo "❌ File NOT found: router.go" >> router_analysis.txt
fi

# 4. Menu and Config Handler Analysis
echo "📋 4. Analyzing menu and config handlers..."
echo "=== MENU HANDLER ===" > menu_config_analysis.txt
if [ -f "$BACKEND_DIR/app/api/menu_handler.go" ]; then
    echo "✅ File exists: menu_handler.go (root level)" >> menu_config_analysis.txt
    echo "--- Function signatures ---" >> menu_config_analysis.txt
    grep -n "func.*Handler\|func.*Menu\|func.*Tree" "$BACKEND_DIR/app/api/menu_handler.go" >> menu_config_analysis.txt
elif [ -f "$BACKEND_DIR/app/api/handlers/menu_handler.go" ]; then
    echo "✅ File exists: menu_handler.go (handlers dir)" >> menu_config_analysis.txt
    echo "--- Function signatures ---" >> menu_config_analysis.txt
    grep -n "func.*Handler\|func.*Menu\|func.*Tree" "$BACKEND_DIR/app/api/handlers/menu_handler.go" >> menu_config_analysis.txt
else
    echo "❌ File NOT found: menu_handler.go" >> menu_config_analysis.txt
fi

echo "" >> menu_config_analysis.txt
echo "=== CONFIG HANDLER ===" >> menu_config_analysis.txt
if [ -f "$BACKEND_DIR/app/api/configuration_handler.go" ]; then
    echo "✅ File exists: configuration_handler.go (root level)" >> menu_config_analysis.txt
    echo "--- Function signatures ---" >> menu_config_analysis.txt
    grep -n "func.*Handler\|func.*Config" "$BACKEND_DIR/app/api/configuration_handler.go" >> menu_config_analysis.txt
elif [ -f "$BACKEND_DIR/app/api/handlers/configuration_handler.go" ]; then
    echo "✅ File exists: configuration_handler.go (handlers dir)" >> menu_config_analysis.txt
    echo "--- Function signatures ---" >> menu_config_analysis.txt
    grep -n "func.*Handler\|func.*Config" "$BACKEND_DIR/app/api/handlers/configuration_handler.go" >> menu_config_analysis.txt
else
    echo "❌ File NOT found: configuration_handler.go" >> menu_config_analysis.txt
fi

# 5. Current Models Analysis
echo "📊 5. Analyzing current models..."
echo "=== ROLE MODEL ===" > models_analysis.txt
if [ -f "$BACKEND_DIR/app/models/role.go" ]; then
    echo "✅ File exists: role.go" >> models_analysis.txt
    echo "--- Struct definition ---" >> models_analysis.txt
    grep -n -A20 "type.*Role.*struct" "$BACKEND_DIR/app/models/role.go" >> models_analysis.txt
else
    echo "❌ File NOT found: role.go" >> models_analysis.txt
fi

echo "" >> models_analysis.txt
echo "=== PERMISSION MODEL ===" >> models_analysis.txt
if [ -f "$BACKEND_DIR/app/models/permission.go" ]; then
    echo "✅ File exists: permission.go" >> models_analysis.txt
    echo "--- Struct definition ---" >> models_analysis.txt
    grep -n -A20 "type.*Permission.*struct" "$BACKEND_DIR/app/models/permission.go" >> models_analysis.txt
else
    echo "❌ File NOT found: permission.go" >> models_analysis.txt
fi

# 6. Services Analysis
echo "🔧 6. Analyzing services..."
echo "=== MENU SERVICE ===" > services_analysis.txt
if [ -f "$BACKEND_DIR/app/services/menu_service.go" ]; then
    echo "✅ File exists: menu_service.go" >> services_analysis.txt
    echo "--- Function signatures ---" >> services_analysis.txt
    grep -n "func.*Menu\|func.*Tree\|func.*service" "$BACKEND_DIR/app/services/menu_service.go" >> services_analysis.txt
else
    echo "❌ File NOT found: menu_service.go" >> services_analysis.txt
fi

# 7. File Structure Summary
echo "📁 7. Creating file structure summary..."
echo "=== CURRENT BACKEND STRUCTURE ===" > structure_summary.txt
echo "Backend directory: $BACKEND_DIR" >> structure_summary.txt
echo "" >> structure_summary.txt

echo "--- API Layer ---" >> structure_summary.txt
ls -la "$BACKEND_DIR/app/api/" >> structure_summary.txt 2>/dev/null || echo "Directory not found" >> structure_summary.txt
echo "" >> structure_summary.txt

echo "--- Handlers ---" >> structure_summary.txt
ls -la "$BACKEND_DIR/app/api/handlers/" >> structure_summary.txt 2>/dev/null || echo "Directory not found" >> structure_summary.txt
echo "" >> structure_summary.txt

echo "--- Models ---" >> structure_summary.txt
ls -la "$BACKEND_DIR/app/models/" >> structure_summary.txt 2>/dev/null || echo "Directory not found" >> structure_summary.txt
echo "" >> structure_summary.txt

echo "--- Request Models ---" >> structure_summary.txt
ls -la "$BACKEND_DIR/app/models/request/" >> structure_summary.txt 2>/dev/null || echo "Directory not found" >> structure_summary.txt
echo "" >> structure_summary.txt

echo "--- Services ---" >> structure_summary.txt
ls -la "$BACKEND_DIR/app/services/" >> structure_summary.txt 2>/dev/null || echo "Directory not found" >> structure_summary.txt

# 8. Create Quick Analysis Script
cat > quick_check.sh << 'EOF'
#!/bin/bash
echo "🔍 Quick Backend Analysis"
echo "========================="
echo ""

echo "📋 Files Analysis:"
echo "1. Request Models:"
[ -f "../backend/app/models/request/role_request.go" ] && echo "   ✅ role_request.go exists" || echo "   ❌ role_request.go missing"
[ -f "../backend/app/models/request/permission_request.go" ] && echo "   ✅ permission_request.go exists" || echo "   ❌ permission_request.go missing"

echo ""
echo "2. Handlers:"
[ -f "../backend/app/api/handlers/role_handler.go" ] && echo "   ✅ role_handler.go exists" || echo "   ❌ role_handler.go missing"
[ -f "../backend/app/api/handlers/permission_handler.go" ] && echo "   ✅ permission_handler.go exists" || echo "   ❌ permission_handler.go missing"
[ -f "../backend/app/api/menu_handler.go" ] && echo "   ✅ menu_handler.go exists (root)" || echo "   ❌ menu_handler.go missing (root)"
[ -f "../backend/app/api/handlers/menu_handler.go" ] && echo "   ✅ menu_handler.go exists (handlers)" || echo "   ❌ menu_handler.go missing (handlers)"

echo ""
echo "3. Routes:"
[ -f "../backend/app/api/routes/router.go" ] && echo "   ✅ router.go exists" || echo "   ❌ router.go missing"

echo ""
echo "📊 Key Issues to Check:"
echo "1. Check if 'level' field exists in role_request.go"
echo "2. Check if 'scope' field exists in permission_request.go"
echo "3. Check if menu/config routes are registered in router.go"
echo "4. Check context key usage in handlers (userID vs user_id)"
EOF

chmod +x quick_check.sh

# Create summary report
echo "📋 Creating summary report..."
cat > summary_report.txt << 'EOF'
# Backend Analysis Summary Report
# Generated: $(date)

## Issues from Production Tests:
1. Role creation failing: "level must be at least 1 characters long"
2. Permission creation failing: "scope is required"
3. Menu endpoints returning 404 (routes not registered)
4. System config endpoints returning 404 (routes not registered)

## Files to Check:
1. request_models_analysis.txt - Current request models
2. handlers_analysis.txt - Current handlers
3. router_analysis.txt - Route registration
4. menu_config_analysis.txt - Menu and config handlers
5. models_analysis.txt - Current models
6. services_analysis.txt - Services analysis
7. structure_summary.txt - File structure
8. quick_check.sh - Quick analysis script

## Next Steps:
1. Run ./quick_check.sh for quick overview
2. Check if missing fields exist in request models
3. Verify route registration in router.go
4. Check context key usage in handlers
EOF

echo "✅ Backend analysis complete! Files created in backend_analysis/ directory"
echo ""
echo "📁 Files created:"
ls -la

echo ""
echo "🎯 Critical files to check first:"
echo "1. request_models_analysis.txt - Shows if
