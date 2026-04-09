#!/bin/bash
# platform/backend/scripts/redis_session_monitor.sh
# Monitor Redis sessions for hybrid authentication

REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD="1234567890"
REDIS_DB="3"

echo "🔍 REDIS SESSION MONITOR"
echo "========================"
echo "Database: $REDIS_DB"
echo "Press Ctrl+C to stop monitoring"
echo ""

# Function to display session info
show_session_info() {
    echo "📊 Session Statistics ($(date)):"
    
    # Total keys
    TOTAL_KEYS=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_DB" DBSIZE 2>/dev/null)
    echo "   Total keys in DB: $TOTAL_KEYS"
    
    # Session keys
    SESSION_KEYS=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_DB" KEYS "tenant:*:session:*" 2>/dev/null)
    SESSION_COUNT=$(echo "$SESSION_KEYS" | grep -v "^$" | wc -l)
    echo "   Active sessions: $SESSION_COUNT"
    
    if [ $SESSION_COUNT -gt 0 ]; then
        echo ""
        echo "🔑 Active Sessions:"
        echo "$SESSION_KEYS" | while read -r key; do
            if [ ! -z "$key" ]; then
                # Extract tenant and session ID
                TENANT_ID=$(echo "$key" | sed 's/tenant:\([0-9]*\):session:.*/\1/')
                SESSION_ID=$(echo "$key" | sed 's/.*session:\(.*\)/\1/')
                
                # Get session data
                SESSION_DATA=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_DB" GET "$key" 2>/dev/null)
                
                if [ ! -z "$SESSION_DATA" ]; then
                    # Extract username and last activity
                    USERNAME=$(echo "$SESSION_DATA" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('username', 'unknown'))
except:
    print('unknown')
" 2>/dev/null)
                    
                    LAST_SEEN=$(echo "$SESSION_DATA" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('last_seen', 'unknown'))
except:
    print('unknown')
" 2>/dev/null)
                    
                    echo "   • Tenant $TENANT_ID | User: $USERNAME | Session: ${SESSION_ID:0:20}... | Last: $LAST_SEEN"
                fi
            fi
        done
    fi
    
    echo ""
    echo "----------------------------------------"
}

# Initial display
show_session_info

# Monitor mode
if [ "$1" = "--monitor" ]; then
    echo "🔄 Monitoring Redis activity..."
    redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" MONITOR 2>/dev/null | while read line; do
        if echo "$line" | grep -q "session:"; then
            echo "$(date '+%H:%M:%S') | $line"
        fi
    done
else
    echo "💡 Tips:"
    echo "   Run with --monitor to watch real-time session activity"
    echo "   Commands:"
    echo "     Watch sessions: watch -n 2 './scripts/redis_session_monitor.sh'"
    echo "     Live monitor:   ./scripts/redis_session_monitor.sh --monitor"
    echo "     Clear all:      redis-cli -a '$REDIS_PASSWORD' -n $REDIS_DB FLUSHDB"
fi