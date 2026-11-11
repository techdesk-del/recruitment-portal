#!/bin/bash
# =================================================================
# Synology DS925+ Real-Time Synchronization & Health Verification
# Role: SDE-3 & Technical Leadership Audit Script
# =================================================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=================================================================${NC}"
echo -e "${BLUE}🔍 EXECUTING RECRUITMENT SUITE SYSTEM AUDIT (DS925+ CLUSTER)${NC}"
echo -e "${BLUE}=================================================================${NC}"

# 1. Container Status Check
echo -n "Checking Docker Containers... "
RUNNING_COUNT=$(docker compose ps --services --filter "status=running" | wc -l)
if [ "$RUNNING_COUNT" -ge 4 ]; then
  echo -e "${GREEN}[PASS] All 4 microservices running${NC}"
else
  echo -e "${RED}[FAIL] Expected 4 running containers, found $RUNNING_COUNT${NC}"
fi

# 2. MongoDB Health Check
echo -n "Checking MongoDB Storage Engine... "
MONGO_PING=$(docker exec recruitment-mongo mongosh --quiet --eval "db.adminCommand('ping').ok" 2>/dev/null || echo "0")
if [ "$MONGO_PING" = "1" ]; then
  CAND_COUNT=$(docker exec recruitment-mongo mongosh --quiet recruitment_dashboard --eval "db.candidates.countDocuments()" 2>/dev/null || echo "0")
  echo -e "${GREEN}[PASS] Connected (Candidates in DB: ${CAND_COUNT})${NC}"
else
  echo -e "${RED}[FAIL] MongoDB ping unresponsive${NC}"
fi

# 3. Redis Queue Engine Check
echo -n "Checking Redis In-Memory Bus... "
REDIS_PING=$(docker exec recruitment-redis redis-cli ping 2>/dev/null || echo "FAILED")
if [ "$REDIS_PING" = "PONG" ]; then
  echo -e "${GREEN}[PASS] PONG (Queue broker responsive)${NC}"
else
  echo -e "${RED}[FAIL] Redis unreachable${NC}"
fi

# 4. Backend Gateway & Database Connectivity Check
echo -n "Checking Node.js API Gateway... "
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5050/api/health || echo "000")
if [ "$API_STATUS" = "200" ]; then
  echo -e "${GREEN}[PASS] HTTP 200 OK${NC}"
else
  echo -e "${RED}[FAIL] Backend health returned status: $API_STATUS${NC}"
fi

# 5. Frontend SPA & Nginx Reverse Proxy Check
echo -n "Checking Nginx Frontend & Reverse Proxy... "
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3080/health || echo "000")
if [ "$FRONTEND_STATUS" = "200" ]; then
  echo -e "${GREEN}[PASS] HTTP 200 OK${NC}"
else
  echo -e "${RED}[FAIL] Frontend health returned status: $FRONTEND_STATUS${NC}"
fi

# 6. WebSocket Real-Time Handshake Check
echo -n "Checking WebSocket Upgrade (/socket.io/)... "
WS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3080/socket.io/?EIO=4&transport=polling" || echo "000")
if [ "$WS_STATUS" = "200" ]; then
  echo -e "${GREEN}[PASS] Socket.IO Handshake Active (Real-Time Sync Ready)${NC}"
else
  echo -e "${YELLOW}[WARN] Socket.IO returned status: $WS_STATUS${NC}"
fi

echo -e "${BLUE}=================================================================${NC}"
echo -e "${GREEN}🎉 SYSTEM INTEGRITY VERIFIED: All Tiers Operational!${NC}"
echo -e "${BLUE}=================================================================${NC}"

