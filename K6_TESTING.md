# K6 Load Testing Setup

## Authentication Bypass for Testing

For load testing, authentication can be bypassed using environment variables.

### Setup for Local Testing

1. Add these variables to your `.env.local` file:

```bash
# ONLY FOR DEVELOPMENT/TESTING - NEVER IN PRODUCTION!
BYPASS_AUTH=true
BYPASS_AUTH_SECRET=k6-test-secret-123
```

2. Restart your dev server:

```bash
npm run dev
```

3. The k6 scripts will automatically send the bypass header.

### Security Notes

⚠️ **IMPORTANT**: 
- This bypass ONLY works in development (`NODE_ENV=development`)
- The `BYPASS_AUTH` environment variable must be explicitly set to `"true"`
- NEVER enable this in production
- The bypass creates a mock admin user for testing purposes only

### Running Tests

```bash
# Single browser test (15 minutes)
npm run loadtest:browser

# Full comparison test (unoptimized vs optimized, 30 minutes total)
npm run loadtest:compare-browser
```

### Environment Variables

- `BYPASS_AUTH` - Set to `"true"` to enable auth bypass (default: disabled)
- `BYPASS_AUTH_SECRET` - Secret key for bypass header (optional in dev)
- `BASE_URL` - Target URL for testing (default: `http://localhost:3000`)


