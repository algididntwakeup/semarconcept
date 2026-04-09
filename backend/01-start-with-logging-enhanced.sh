#!/bin/bash

# Enhanced Backend Startup Script with Beautiful Logging
# File: 02-start-with-logging.sh

# =================== COLOR DEFINITIONS ===================
# Reset
RESET='\033[0m'       # Text Reset

# Regular Colors
BLACK='\033[0;30m'        # Black
RED='\033[0;31m'          # Red
GREEN='\033[0;32m'        # Green
YELLOW='\033[0;33m'       # Yellow
BLUE='\033[0;34m'         # Blue
PURPLE='\033[0;35m'       # Purple
CYAN='\033[0;36m'         # Cyan
WHITE='\033[0;37m'        # White

# Bold Colors
BOLD_BLACK='\033[1;30m'   # Bold Black
BOLD_RED='\033[1;31m'     # Bold Red
BOLD_GREEN='\033[1;32m'   # Bold Green
BOLD_YELLOW='\033[1;33m'  # Bold Yellow
BOLD_BLUE='\033[1;34m'    # Bold Blue
BOLD_PURPLE='\033[1;35m'  # Bold Purple
BOLD_CYAN='\033[1;36m'    # Bold Cyan
BOLD_WHITE='\033[1;37m'   # Bold White

# Background Colors
BG_BLACK='\033[40m'       # Black
BG_RED='\033[41m'         # Red
BG_GREEN='\033[42m'       # Green
BG_YELLOW='\033[43m'      # Yellow
BG_BLUE='\033[44m'        # Blue
BG_PURPLE='\033[45m'      # Purple
BG_CYAN='\033[46m'        # Cyan
BG_WHITE='\033[47m'       # White

# =================== ICON DEFINITIONS ===================
ICON_SUCCESS="✅"
ICON_ERROR="❌"
ICON_WARNING="⚠️ "
ICON_INFO="ℹ️ "
ICON_ROCKET="🚀"
ICON_GEAR="⚙️ "
ICON_FOLDER="📁"
ICON_FILE="📄"
ICON_DATABASE="🗄️ "
ICON_NETWORK="🌐"
ICON_LOCK="🔐"
ICON_CLOCK="⏰"
ICON_COMPUTER="💻"
ICON_LIGHTNING="⚡"
ICON_MAGNIFYING="🔍"
ICON_HAMMER="🔨"
ICON_STOP="🛑"
ICON_PLAY="▶️ "
ICON_PAUSE="⏸️ "
ICON_RESTART="🔄"
ICON_TRASH="🗑️ "
ICON_LOG="📝"
ICON_SHIELD="🛡️ "
ICON_KEY="🔑"
ICON_MONITOR="📊"

# =================== LOGGING FUNCTIONS ===================
log_header() {
    echo -e "${BOLD_CYAN}╔══════════════════════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${BOLD_CYAN}║                     ${ICON_ROCKET} REKSOLINDO BACKEND STARTUP ${ICON_ROCKET}                    ║${RESET}"
    echo -e "${BOLD_CYAN}╚══════════════════════════════════════════════════════════════════════════════╝${RESET}"
}

log_section() {
    echo -e "\n${BOLD_BLUE}┌─ $1 ─────────────────────────────────────────────────────────────────────${RESET}"
}

log_success() {
    echo -e "${GREEN}${ICON_SUCCESS} $1${RESET}"
}

log_error() {
    echo -e "${BOLD_RED}${ICON_ERROR} $1${RESET}"
}

log_warning() {
    echo -e "${YELLOW}${ICON_WARNING}$1${RESET}"
}

log_info() {
    echo -e "${CYAN}${ICON_INFO}$1${RESET}"
}

log_step() {
    echo -e "${BOLD_WHITE}${ICON_GEAR}$1${RESET}"
}

log_file() {
    echo -e "${PURPLE}${ICON_FILE} $1${RESET}"
}

log_network() {
    echo -e "${BOLD_GREEN}${ICON_NETWORK} $1${RESET}"
}

log_security() {
    echo -e "${BOLD_YELLOW}${ICON_LOCK} $1${RESET}"
}

log_time() {
    echo -e "${BOLD_CYAN}${ICON_CLOCK} $1${RESET}"
}

log_process() {
    echo -e "${BOLD_PURPLE}${ICON_COMPUTER} $1${RESET}"
}

log_performance() {
    echo -e "${BOLD_GREEN}${ICON_LIGHTNING} $1${RESET}"
}

show_separator() {
    echo -e "${CYAN}────────────────────────────────────────────────────────────────────────────────${RESET}"
}

# =================== SYSTEM INFO FUNCTIONS ===================
show_system_info() {
    log_section "${ICON_MONITOR} SYSTEM INFORMATION"
    log_info "Hostname: $(hostname)"
    log_info "User: $(whoami)"
    log_info "OS: $(uname -s) $(uname -r)"
    log_info "Architecture: $(uname -m)"
    log_info "CPU Cores: $(nproc)"
    log_info "Memory: $(free -h | awk '/^Mem:/ {print $2}') total, $(free -h | awk '/^Mem:/ {print $7}') available"
    log_info "Disk Space: $(df -h . | awk 'NR==2 {print $4}') available"
    log_time "Current Time: $(date '+%Y-%m-%d %H:%M:%S %Z')"
}

show_environment_variables() {
    log_section "${ICON_GEAR} ENVIRONMENT CONFIGURATION"
    log_info "Log Level: ${BOLD_YELLOW}$REKSOLINDO_LOG_LEVEL${RESET}"
    log_info "Log Format: ${BOLD_YELLOW}$REKSOLINDO_LOG_FORMAT${RESET}"
    log_info "Log Colors: ${BOLD_YELLOW}$REKSOLINDO_LOG_COLORS${RESET}"
    log_info "Log Caller: ${BOLD_YELLOW}$REKSOLINDO_LOG_CALLER${RESET}"
    log_info "Log to File: ${BOLD_YELLOW}$REKSOLINDO_LOG_FILE${RESET}"
    log_file "Log File Path: ${BOLD_CYAN}$REKSOLINDO_LOG_FILE_PATH${RESET}"
    log_info "Log to Stdout: ${BOLD_YELLOW}$REKSOLINDO_LOG_STDOUT${RESET}"
    log_info "Log Request Body: ${BOLD_YELLOW}$REKSOLINDO_LOG_REQUEST_BODY${RESET}"
    log_info "Log Response Body: ${BOLD_YELLOW}$REKSOLINDO_LOG_RESPONSE_BODY${RESET}"
    log_security "Encryption Key: ${BOLD_GREEN}[SET - ${#REKSOLINDO_ENCRYPTION_KEY} chars]${RESET}"
}

check_dependencies() {
    log_section "${ICON_MAGNIFYING} DEPENDENCY CHECK"
    
    # Check if Go is installed
    if command -v go &> /dev/null; then
        GO_VERSION=$(go version | awk '{print $3}')
        log_success "Go: $GO_VERSION"
    else
        log_error "Go is not installed!"
        return 1
    fi
    
    # Check if Air is available (for hot reloading)
    if command -v air &> /dev/null; then
        log_success "Air (hot reload): Available"
    else
        log_warning "Air (hot reload): Not available - will use regular go run"
    fi
    
    # Check if PostgreSQL is running
    if pg_isready -q 2>/dev/null; then
        log_success "PostgreSQL: Running and accepting connections"
    else
        log_warning "PostgreSQL: Not responding or not installed"
    fi
    
    # Check if required files exist
    if [ -f "main.go" ]; then
        log_success "main.go: Found"
    else
        log_error "main.go: Not found!"
        return 1
    fi
    
    if [ -f "config.yaml" ]; then
        log_success "config.yaml: Found"
    else
        log_warning "config.yaml: Not found"
    fi
}

cleanup_processes() {
    log_section "${ICON_HAMMER} PROCESS CLEANUP"
    
    # Check for existing processes
    EXISTING_PIDS=$(pgrep -f "reksolindo-backend|air|go run main.go" || true)
    
    if [ -n "$EXISTING_PIDS" ]; then
        log_warning "Found existing backend processes: $EXISTING_PIDS"
        log_step "Terminating existing processes..."
        
        # Graceful shutdown first
        pkill -TERM -f "reksolindo-backend" 2>/dev/null || true
        pkill -TERM -f "air" 2>/dev/null || true
        pkill -TERM -f "go run main.go" 2>/dev/null || true
        
        # Wait a moment
        sleep 2
        
        # Force kill if still running
        pkill -KILL -f "reksolindo-backend" 2>/dev/null || true
        pkill -KILL -f "air" 2>/dev/null || true
        pkill -KILL -f "go run main.go" 2>/dev/null || true
        
        log_success "Process cleanup completed"
    else
        log_success "No existing backend processes found"
    fi
    
    # Check port availability
    PORT=${REKSOLINDO_PORT:-3500}
    if netstat -tuln 2>/dev/null | grep -q ":$PORT "; then
        log_warning "Port $PORT is still in use"
        PROCESS_ON_PORT=$(lsof -ti:$PORT 2>/dev/null || true)
        if [ -n "$PROCESS_ON_PORT" ]; then
            log_step "Killing process on port $PORT (PID: $PROCESS_ON_PORT)"
            kill -9 $PROCESS_ON_PORT 2>/dev/null || true
            sleep 1
        fi
    fi
    log_success "Port $PORT is available"
}

setup_directories() {
    log_section "${ICON_FOLDER} DIRECTORY SETUP"
    
    # Create logs directory
    if [ ! -d "./logs" ]; then
        mkdir -p ./logs
        log_success "Created logs directory"
    else
        log_info "Logs directory already exists"
    fi
    
    # Create tmp directory for air
    if [ ! -d "./tmp" ]; then
        mkdir -p ./tmp
        log_success "Created tmp directory"
    else
        log_info "Tmp directory already exists"
    fi
    
    # Set permissions
    chmod 755 ./logs 2>/dev/null || true
    chmod 755 ./tmp 2>/dev/null || true
    
    log_file "Log file will be written to: $REKSOLINDO_LOG_FILE_PATH"
}

show_startup_banner() {
    echo -e "${BOLD_GREEN}"
    cat << 'EOF'
    ╦═╗╔═╗╦╔═╔═╗╔═╗╦  ╦╔╗╔╔╦╗╔═╗  ╔╗ ╔═╗╔═╗╦╔═╔═╗╔╗╔╔╦╗
    ╠╦╝║╣ ╠╩╗╚═╗║ ║║  ║║║║ ║║║ ║  ╠╩╗╠═╣║  ╠╩╗║╣ ║║║ ║║
    ╩╚═╚═╝╩ ╩╚═╝╚═╝╩═╝╩╝╚╝═╩╝╚═╝  ╚═╝╩ ╩╚═╝╩ ╩╚═╝╝╚╝═╩╝
EOF
    echo -e "${RESET}"
    echo -e "${BOLD_CYAN}    Enterprise Asset Management System - Backend Server${RESET}"
    echo -e "${CYAN}    Version: 1.0.0 | Environment: Development | Mode: Hot Reload${RESET}"
    echo
}

monitor_startup() {
    log_section "${ICON_MONITOR} STARTUP MONITORING"
    
    PORT=${REKSOLINDO_PORT:-3500}
    log_info "Monitoring server startup on port $PORT..."
    
    # Wait for server to start
    for i in {1..30}; do
        if curl -s http://localhost:$PORT/api/v1/health > /dev/null 2>&1; then
            log_success "Server is responding on port $PORT"
            break
        elif [ $i -eq 30 ]; then
            log_error "Server failed to start within 30 seconds"
            return 1
        else
            echo -ne "${CYAN}${ICON_CLOCK} Waiting for server... ($i/30)\r${RESET}"
            sleep 1
        fi
    done
    echo # New line after progress
}

show_server_info() {
    log_section "${ICON_NETWORK} SERVER INFORMATION"
    PORT=${REKSOLINDO_PORT:-3500}
    
    log_network "Server URL: ${BOLD_GREEN}http://localhost:$PORT${RESET}"
    log_network "Health Check: ${BOLD_GREEN}http://localhost:$PORT/api/v1/health${RESET}"
    log_network "API Documentation: ${BOLD_GREEN}http://localhost:$PORT/swagger/index.html${RESET}"
    # log_network "Admin Panel: ${BOLD_GREEN}http://localhost:$PORT/admin${RESET}"
    
    log_performance "Process ID: $(pgrep -f 'air|go run main.go' | head -1 || echo 'Not found')"
    log_performance "Memory Usage: $(ps -o pid,ppid,pmem,pcpu,comm -p $(pgrep -f 'air|go run main.go' | head -1) 2>/dev/null | tail -n +2 || echo 'N/A')"
}

# =================== MAIN EXECUTION ===================

# Set environment variables for logging
export REKSOLINDO_ENCRYPTION_KEY="1566da56f61361c36dab9493b1f138d4"
export REKSOLINDO_LOG_LEVEL=debug
export REKSOLINDO_LOG_FORMAT=json
export REKSOLINDO_LOG_COLORS=true
export REKSOLINDO_LOG_CALLER=true
export REKSOLINDO_LOG_FILE=true
export REKSOLINDO_LOG_FILE_PATH="./logs/backend.log"
export REKSOLINDO_LOG_STDOUT=true
export REKSOLINDO_LOG_REQUEST_BODY=true
export REKSOLINDO_LOG_RESPONSE_BODY=true
export REKSOLINDO_PORT=3500

# Clear screen and show header
clear
log_header
show_startup_banner

# Execute startup sequence
show_system_info
show_environment_variables

# Check dependencies
if ! check_dependencies; then
    log_error "Dependency check failed. Please install missing dependencies."
    exit 1
fi

# Setup environment
cleanup_processes
setup_directories

# Start the server
log_section "${ICON_ROCKET} STARTING SERVER"
log_step "Executing startup script..."

# Check if 00-devstart.sh exists
if [ -f "./00-devstart.sh" ]; then
    log_file "Using startup script: ./00-devstart.sh"
    chmod +x ./00-devstart.sh
    
    # Start server in background to monitor
    log_info "Starting backend server with hot reload..."
    ./00-devstart.sh &
    SERVER_PID=$!
    
    # Monitor startup
    sleep 3
    monitor_startup
    
    # Show final information
    show_server_info
    
    log_section "${ICON_SUCCESS} STARTUP COMPLETE"
    log_success "Backend server is running successfully!"
    log_info "Press ${BOLD_YELLOW}Ctrl+C${RESET} to stop the server"
    log_info "Logs are being written to: ${BOLD_CYAN}$REKSOLINDO_LOG_FILE_PATH${RESET}"
    
    show_separator
    echo -e "${BOLD_GREEN}${ICON_LIGHTNING} Server is ready to accept requests! ${ICON_LIGHTNING}${RESET}"
    show_separator
    
    # Wait for the background process
    wait $SERVER_PID
    
else
    log_error "Startup script ./00-devstart.sh not found!"
    log_info "Available startup options:"
    ls -la ./*start*.sh 2>/dev/null || log_warning "No startup scripts found"
    exit 1
fi

# Cleanup on exit
trap 'log_warning "Shutting down server..."; kill $SERVER_PID 2>/dev/null; log_success "Server stopped."' EXIT