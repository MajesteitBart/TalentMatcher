#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Talent Matcher Development Environment...${NC}\n"

# Check if Redis is running
if ! docker ps | grep -q redis; then
  echo -e "${YELLOW}Redis not detected. Starting Redis...${NC}"
  docker-compose up -d
  sleep 2
fi

echo -e "${GREEN}Starting all services...${NC}\n"

# Trap SIGINT and SIGTERM to kill all background processes
trap 'echo -e "\n${YELLOW}Shutting down all services...${NC}"; kill 0' SIGINT SIGTERM

# Start Next.js dev server
echo -e "${BLUE}[Next.js]${NC} Starting on port 3000..." &
npm run dev &

# Start workflow worker
echo -e "${BLUE}[Worker:Workflow]${NC} Starting..." &
npm run worker:workflow &

# Start indexing worker
echo -e "${BLUE}[Worker:Indexing]${NC} Starting..." &
npm run worker:indexing &

# Wait for all background processes
wait
