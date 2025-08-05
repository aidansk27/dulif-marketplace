# DULIF Marketplace Smoke Test

Complete these manual checks to verify the application is working correctly:

## Pre-deployment Checks
- [ ] Install deps without errors
- [ ] Env vars added
- [ ] Dev server boots at http://localhost:3000

## Authentication Flow
- [ ] Auth wall redirects to /signup
- [ ] Magic-link email received
- [ ] Verification completes → profile setup
- [ ] Profile saved → home feed visible

## Core Features
- [ ] Listing wizard publishes card + confetti
- [ ] Second user can chat & rate
- [ ] Safe-spot Google Map renders pins

## PWA & Testing
- [ ] PWA install prompt appears
- [ ] Jest & Cypress suites green

## Notes
Run these checks after deploying to staging and before releasing to production. Each feature should work end-to-end without errors.