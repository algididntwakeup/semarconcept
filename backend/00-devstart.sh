#!/bin/bash
# platform/backend/00-devstart.sh
#  ENHANCED: Auto-load .env file before starting Go application

# Colors for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
RESET='\033[0m'

echo -e "${BLUE}🚀 Starting Reksolindo Backend Server...${RESET}"

#  SURGICAL FIX: Load .env file into system environment
load_env_file() {
    local env_file=".env"
    
    echo -e "${CYAN}📋 Loading environment variables from ${env_file}...${RESET}"
    
    if [ -f "$env_file" ]; then
        # Read .env file and export variables
        while IFS= read -r line || [ -n "$line" ]; do
            # Skip empty lines and comments
            [[ $line =~ ^[[:space:]]*$ ]] && continue
            [[ $line =~ ^[[:space:]]*# ]] && continue
            
            # Remove inline comments
            line=$(echo "$line" | sed 's/#.*//')
            
            # Remove leading/trailing whitespace
            line=$(echo "$line" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
            
            # Skip if line is empty after processing
            [[ -z "$line" ]] && continue
            
            # Export the variable
            if [[ $line =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
                export "$line"
                # Echo only CORS variables for verification
                if [[ $line =~ ^CORS_ ]]; then
                    var_name=$(echo "$line" | cut -d'=' -f1)
                    echo -e "${GREEN}  ✅ Exported: ${WHITE}$var_name${RESET}"
                fi
            fi
        done < "$env_file"
        
        echo -e "${GREEN}✅ Environment variables loaded successfully${RESET}"
        
        #  VERIFICATION: Display critical CORS configuration
        echo -e "${YELLOW}🔧 CORS Configuration Verification:${RESET}"
        echo -e "${WHITE}  Origins: ${CYAN}$CORS_ALLOWED_ORIGINS${RESET}"
        echo -e "${WHITE}  Headers: ${CYAN}$CORS_ALLOWED_HEADERS${RESET}"
        echo -e "${WHITE}  Methods: ${CYAN}$CORS_ALLOWED_METHODS${RESET}"
        
        # Check if X-Tenant-Subdomain is included
        if [[ "$CORS_ALLOWED_HEADERS" == *"X-Tenant-Subdomain"* ]]; then
            echo -e "${GREEN}  ✅ X-Tenant-Subdomain header found in CORS config${RESET}"
        else
            echo -e "${RED}  ❌ X-Tenant-Subdomain header missing in CORS config${RESET}"
            echo -e "${YELLOW}  📝 Check your .env file CORS_ALLOWED_HEADERS setting${RESET}"
        fi
        
    else
        echo -e "${RED}❌ .env file not found at: $env_file${RESET}"
        echo -e "${YELLOW}⚠️  Using system environment variables only${RESET}"
    fi
}

# Load environment variables
load_env_file

echo -e "${PURPLE}📦 Building and running Go application...${RESET}"

# Check if Air is available for hot reloading
if command -v air &> /dev/null; then
    echo -e "${GREEN}🚀 Starting with Air (hot reload)...${RESET}"
    mkdir -p tmp
    air -c .air.toml
else
    echo -e "${YELLOW}⚡ Air not found, using go run...${RESET}"
    echo -e "${CYAN}💡 Install Air for hot reloading: go install github.com/cosmtrek/air@latest${RESET}"
    go run main.go
fi