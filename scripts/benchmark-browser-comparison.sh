#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔬 Starting Twenny Performance Benchmark Comparison (Browser E2E)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}❌ k6 is not installed. Install it with: brew install k6${NC}"
    exit 1
fi

# Store start time
START_TIME=$(date +%s)

# Ensure we start fresh
echo -e "${CYAN}📊 Phase 1: Testing UNOPTIMIZED version (45 minutes)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Switch to unoptimized
echo -e "${YELLOW}🔄 Switching to unoptimized version...${NC}"
npm run lesson:unopt

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to switch to unoptimized version${NC}"
    exit 1
fi

echo -e "\n${GREEN}✓ Switched to unoptimized version${NC}"
echo -e "${YELLOW}⏳ Waiting 5 seconds for Next.js to detect changes...${NC}\n"
sleep 5

# Run unoptimized browser test (45 minutes)
echo -e "${CYAN}🚀 Running browser E2E test on UNOPTIMIZED version (45 minutes)...${NC}\n"
K6_BROWSER_ENABLED=true K6_TEST_DURATION=45m k6 run --out json=k6-browser-results-unoptimized.json k6-browser-tickets.js

UNOPT_EXIT_CODE=$?
if [ $UNOPT_EXIT_CODE -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Unoptimized test encountered issues (exit code: $UNOPT_EXIT_CODE)${NC}"
fi

echo -e "\n${GREEN}✓ Unoptimized test complete${NC}\n"

# Phase 2: Optimized
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📊 Phase 2: Testing OPTIMIZED version (15 minutes)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Switch to optimized
echo -e "${YELLOW}🔄 Switching to optimized version...${NC}"
npm run lesson:opt

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to switch to optimized version${NC}"
    exit 1
fi

echo -e "\n${GREEN}✓ Switched to optimized version${NC}"
echo -e "${YELLOW}⏳ Waiting 5 seconds for Next.js to detect changes...${NC}\n"
sleep 5

# Run optimized browser test (15 minutes)
echo -e "${CYAN}🚀 Running browser E2E test on OPTIMIZED version (15 minutes)...${NC}\n"
K6_BROWSER_ENABLED=true K6_TEST_DURATION=15m k6 run --out json=k6-browser-results-optimized.json k6-browser-tickets.js

OPT_EXIT_CODE=$?
if [ $OPT_EXIT_CODE -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Optimized test encountered issues (exit code: $OPT_EXIT_CODE)${NC}"
fi

echo -e "\n${GREEN}✓ Optimized test complete${NC}\n"

# Calculate total duration
END_TIME=$(date +%s)
TOTAL_DURATION=$((END_TIME - START_TIME))
TOTAL_MINUTES=$((TOTAL_DURATION / 60))

# Summary
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Browser E2E Benchmark Comparison Complete!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo -e "${CYAN}⏱️  Total time: ${TOTAL_MINUTES} minutes${NC}\n"
echo -e "${CYAN}📊 Results saved to:${NC}"
echo -e "   • k6-browser-results-unoptimized.json (45 min test)"
echo -e "   • k6-browser-results-optimized.json (15 min test)\n"
echo -e "${CYAN}💡 Compare the results to see the performance improvement!${NC}\n"

# Exit with non-zero if either test failed
if [ $UNOPT_EXIT_CODE -ne 0 ] || [ $OPT_EXIT_CODE -ne 0 ]; then
    exit 1
fi

