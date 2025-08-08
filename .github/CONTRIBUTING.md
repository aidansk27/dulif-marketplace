# 🤝 Contributing to Dulif

Thank you for your interest in contributing to Dulif! This document provides guidelines for contributing to the UC Berkeley student marketplace.

## 🎯 Code of Conduct

### Our Commitment
We are committed to providing a welcoming and inclusive experience for all members of the UC Berkeley community.

### Community Standards
- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the Berkeley community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (use `nvm use` in the project directory)
- Firebase account with Firestore, Auth, and Storage enabled
- Google Maps API key
- @berkeley.edu email for testing

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/dulif-marketplace.git`
3. Install dependencies: `npm install`
4. Copy environment file: `cp .env.local.example .env.local`
5. Fill in your Firebase and Google Maps credentials
6. Start development server: `npm run dev`

## 📋 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing code style (Prettier configured)
- Use meaningful variable and function names
- Add comments for complex logic

### UI/UX Guidelines
- Follow Berkeley branding: Berkeley Blue (#003262) and California Gold (#FDB515)
- Ensure mobile-first responsive design
- Test on multiple browsers and devices
- Maintain accessibility standards (WCAG 2.1 AA)

### Feature Development
- Create feature branches from `main`
- Use descriptive commit messages
- Keep commits atomic and focused
- Add tests for new functionality

## 🧪 Testing

### Required Tests
- Unit tests for utility functions
- Integration tests for components
- E2E tests for critical user flows
- Manual testing on mobile devices

### Running Tests
```bash
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run lint          # Code linting
npm run build         # Production build test
```

## 📝 Pull Request Process

### Before Submitting
1. Ensure all tests pass
2. Update documentation if needed
3. Test on multiple browsers/devices
4. Verify Berkeley-specific features work correctly

### PR Requirements
- Clear description of changes
- Link to related issues
- Screenshots for UI changes
- Confirmation of mobile testing
- Passing CI/CD checks

### Review Process
1. Automated checks must pass
2. Code review by maintainers
3. Testing by community members
4. Approval and merge

## 🏫 Berkeley-Specific Considerations

### Authentication
- All users must have @berkeley.edu email addresses
- Email verification is required
- Profile completion is mandatory

### Community Guidelines
- Features should benefit the UC Berkeley community
- Respect campus policies and guidelines
- Maintain user privacy and safety
- Support campus-specific needs

### Safety Features
- Safe meeting spots on campus
- User verification and ratings
- Community reporting mechanisms
- Privacy protection measures

## 🐛 Bug Reports

### Before Reporting
- Check existing issues
- Reproduce the bug consistently
- Test on multiple browsers/devices

### Bug Report Information
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (browser, OS, device)
- Screenshots if applicable

## ✨ Feature Requests

### Guidelines
- Explain the problem being solved
- Describe the proposed solution
- Consider Berkeley community impact
- Provide user stories and acceptance criteria

### Evaluation Criteria
- Community benefit
- Technical feasibility
- Resource requirements
- Alignment with project goals

## 🔄 Release Process

### Version Numbering
We use semantic versioning (MAJOR.MINOR.PATCH):
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

### Release Schedule
- Regular releases every 2-4 weeks
- Hotfixes as needed for critical issues
- Major releases for significant new features

## 📞 Getting Help

### Resources
- Documentation in `/docs` folder
- README.md for setup instructions
- Issue templates for reporting problems

### Contact
- Create an issue for bugs or feature requests
- Join discussions in existing issues
- Follow the code of conduct in all interactions

## 🎉 Recognition

Contributors will be recognized in:
- Release notes
- Contributors section
- Community acknowledgments

Thank you for helping make Dulif better for the UC Berkeley community! 🐻
