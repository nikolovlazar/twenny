# Project Context

## Overview

**twenny – The Last 20% Ticketing App**

A deliberately fragile, single Next.js 15 demo built for the video/blog series "From MVP to Production with Sentry".

## Purpose

This project is designed to show developers exactly what breaks after the MVP when real traffic hits, and how to fix the final, painful 20% using Sentry as the hero tool.

## Target Audience

Developers learning about production issues and how to identify and resolve them in real-world applications.

## Core Concept

An intentionally fragile MVP that works great at first but progressively reveals critical issues as it scales. Each issue is then diagnosed and fixed in subsequent episodes, demonstrating best practices for production-ready applications.

## Series Outline (12-15 Episodes)

1. MVP in <2 hours (works great)
2. Seed 300k events → site dies
3. Find slow queries with Sentry Performance
4. Add missing indexes → 100-300× faster
5. Fix N+1 with Drizzle joins
6. Fix double-spend with SELECT FOR UPDATE
7. Replace setTimeout with BullMQ
8. Scale workers horizontally
9. Stop scalpers with Better-Auth + Redis rate limiting
10. Fix image bloat with Sharp
11. Add Redis caching
12. Full Sentry observability (Errors, Performance, Cron, Session Replay)

