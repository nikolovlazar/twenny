#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔬 Starting Twenny Performance Benchmark Comparison (Browser E2E)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${YELLOW}⚠️  k6 is not installed. Install it with: brew install k6${NC}"
    exit 1
fi

# Ensure we start fresh
echo -e "${CYAN}📊 Phase 1: Testing UNOPTIMIZED version${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Switch to unoptimized
echo -e "${YELLOW}🔄 Switching to unoptimized version...${NC}"
npm run lesson:unopt

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}❌ Failed to switch to unoptimized version${NC}"
    exit 1
fi

echo -e "\n${GREEN}✓ Switched to unoptimized version${NC}"
echo -e "${YELLOW}⏳ Please restart your dev server (npm run dev) in another terminal${NC}"
echo -e "${YELLOW}   Press ENTER when ready to start the first test...${NC}"
read -r

# Run unoptimized browser test
echo -e "\n${CYAN}🚀 Running browser E2E test on UNOPTIMIZED version (15 minutes)...${NC}\n"
K6_BROWSER_ENABLED=true k6 run --out json=k6-browser-results-unoptimized.json k6-browser-tickets.js

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Unoptimized test encountered issues${NC}"
fi

echo -e "\n${GREEN}✓ Unoptimized test complete${NC}\n"

# Phase 2: Optimized
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📊 Phase 2: Testing OPTIMIZED version${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Switch to optimized
echo -e "${YELLOW}🔄 Switching to optimized version...${NC}"
npm run lesson:opt

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}❌ Failed to switch to optimized version${NC}"
    exit 1
fi

echo -e "\n${GREEN}✓ Switched to optimized version${NC}"
echo -e "${YELLOW}⏳ Please restart your dev server (npm run dev) in another terminal${NC}"
echo -e "${YELLOW}   Press ENTER when ready to start the second test...${NC}"
read -r

# Run optimized browser test
echo -e "\n${CYAN}🚀 Running browser E2E test on OPTIMIZED version (15 minutes)...${NC}\n"
K6_BROWSER_ENABLED=true k6 run --out json=k6-browser-results-optimized.json k6-browser-tickets.js

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Optimized test encountered issues${NC}"
fi

echo -e "\n${GREEN}✓ Optimized test complete${NC}\n"

# Summary
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Browser E2E Benchmark Comparison Complete!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo -e "${CYAN}📊 Results saved to:${NC}"
echo -e "   • k6-browser-results-unoptimized.json"
echo -e "   • k6-browser-results-optimized.json\n"
echo -e "${CYAN}💡 Compare the results to see the performance improvement!${NC}\n"

