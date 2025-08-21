# Testing Guide - Finance Tracker

This document provides comprehensive information about running and maintaining tests for the Finance Tracker application.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Test Types](#test-types)
5. [Writing Tests](#writing-tests)
6. [Test Configuration](#test-configuration)
7. [Debugging Tests](#debugging-tests)
8. [CI/CD Integration](#cicd-integration)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests Once (Non-Watch Mode)
```bash
npm run test:run
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

## Test Structure

```
tests/
├── setup.js                    # Global test setup
├── mocks/
│   ├── mockData.js             # Mock data for testing
│   └── mockUtils.js            # Mock utilities and helpers
├── unit/                       # Unit tests
│   ├── Categories.test.js      # Categories component tests
│   ├── Dashboard.test.js       # Dashboard component tests
│   ├── Expenses.test.js        # Expenses component tests
│   ├── Deposits.test.js        # Deposits component tests
│   ├── Settings.test.js        # Settings component tests
│   ├── useGlobalStore.test.js  # Global store composable tests
│   ├── useCurrency.test.js     # Currency composable tests
│   └── useToast.test.js        # Toast composable tests
├── server/                     # Server-side API tests
│   ├── setup.js                # Server test setup
│   ├── categories.test.js      # Categories API tests
│   ├── expenses.test.js        # Expenses API tests
│   ├── deposits.test.js        # Deposits API tests
│   └── server.test.js          # Server integration tests
└── integration/                # Integration tests
    └── app.test.js             # Full application integration tests
```

## Running Tests

### All Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests in watch mode |
| `npm run test:run` | Run all tests once |
| `npm run test:ui` | Run tests with Vitest UI |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:server` | Run only server-side tests |
| `npm run test:client` | Run only client-side tests |

### Specific Test Categories

#### Run Unit Tests Only
```bash
npm test tests/unit/
```

#### Run Server Tests Only
```bash
npm run test:server
```

#### Run Integration Tests Only
```bash
npm test tests/integration/
```

#### Run Specific Test Files
```bash
# Single file
npm test tests/unit/Categories.test.js

# Multiple files
npm test tests/unit/Categories.test.js tests/unit/Dashboard.test.js

# Pattern matching
npm test tests/unit/use*.test.js
```

#### Run Specific Test Cases
```bash
# Run tests matching pattern
npm test -- --reporter=verbose --testNamePattern="should create category"

# Run tests in specific describe block
npm test -- --reporter=verbose --testNamePattern="Categories Component"
```

### Watch Mode Options

When running `npm test` (watch mode), you can use these interactive commands:

- **`a`** - Run all tests
- **`f`** - Run only failed tests
- **`o`** - Run only tests related to changed files
- **`p`** - Filter by filename pattern
- **`t`** - Filter by test name pattern
- **`q`** - Quit watch mode
- **`Enter`** - Trigger a test run

## Test Types

### 1. Unit Tests (`tests/unit/`)

Test individual components and composables in isolation.

**Coverage:**
- Vue Components (Categories, Dashboard, Expenses, Deposits, Settings)
- Composables (useGlobalStore, useCurrency, useToast)
- Component methods, computed properties, lifecycle hooks
- User interactions (clicks, form submissions, etc.)

**Example Commands:**
```bash
# Run all unit tests
npm test tests/unit/

# Run specific component tests
npm test tests/unit/Categories.test.js

# Run composable tests
npm test tests/unit/use*.test.js
```

### 2. Server Tests (`tests/server/`)

Test API endpoints, database operations, and server logic.

**Coverage:**
- CRUD operations for all entities
- API validation and error handling
- Database model operations
- Middleware functionality
- Server integration

**Example Commands:**
```bash
# Run all server tests
npm run test:server

# Run specific API tests
npm test tests/server/categories.test.js --config vitest.config.server.js
```

### 3. Integration Tests (`tests/integration/`)

Test complete user workflows and cross-component functionality.

**Coverage:**
- Full application initialization
- Navigation between pages
- Data flow across components
- State management integration
- Error handling workflows

**Example Commands:**
```bash
# Run integration tests
npm test tests/integration/

# Run with detailed output
npm test tests/integration/ -- --reporter=verbose
```

## Writing Tests

### Test File Template

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Component from '../../src/components/Component.vue'
import { mockData } from '../mocks/mockData.js'

// Mock dependencies
vi.mock('../../src/composables/useGlobalStore.js', () => ({
  useGlobalStore: () => ({
    // Mock implementation
  })
}))

describe('Component', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Component, {
      props: {
        // Test props
      }
    })
  })

  it('should render correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  // More tests...
})
```

### Testing Patterns

#### Component Testing
```javascript
// Test props
expect(wrapper.props().title).toBe('Expected Title')

// Test emitted events
await wrapper.vm.$emit('update', newValue)
expect(wrapper.emitted().update).toBeTruthy()

// Test user interactions
await wrapper.find('button').trigger('click')
await wrapper.find('input').setValue('new value')

// Test computed properties
expect(wrapper.vm.computedProperty).toBe(expectedValue)

// Test DOM output
expect(wrapper.text()).toContain('Expected Text')
expect(wrapper.find('.css-class').exists()).toBe(true)
```

#### API Testing
```javascript
// Test successful API calls
const response = await request(app)
  .get('/api/categories')
  .expect(200)

expect(response.body).toEqual(expectedData)

// Test error handling
const errorResponse = await request(app)
  .post('/api/categories')
  .send({}) // Invalid data
  .expect(400)

expect(errorResponse.body.error).toBeTruthy()
```

#### Async Testing
```javascript
// Testing async operations
it('should handle async operations', async () => {
  const promise = asyncFunction()
  
  await expect(promise).resolves.toBe(expectedResult)
  // or
  await expect(promise).rejects.toThrow('Expected error')
})

// Testing with fake timers
it('should handle timeouts', async () => {
  vi.useFakeTimers()
  
  const callback = vi.fn()
  setTimeout(callback, 1000)
  
  vi.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalled()
  
  vi.useRealTimers()
})
```

## Test Configuration

### Main Config (`vitest.config.js`)
- Handles client-side tests (unit and integration)
- Uses jsdom environment for DOM testing
- Includes Vue.js support
- Excludes server tests

### Server Config (`vitest.config.server.js`)
- Handles server-side API tests
- Uses Node.js environment
- Includes supertest for HTTP testing
- Mocks database connections

### Global Setup (`tests/setup.js`)
```javascript
// Global mocks and configurations
// Applied to all tests automatically
```

## Debugging Tests

### Debug Mode
```bash
# Run tests in debug mode
npm test -- --inspect-brk

# Run specific test in debug mode
npm test tests/unit/Categories.test.js -- --inspect-brk
```

### Verbose Output
```bash
# Get detailed test output
npm test -- --reporter=verbose

# Show all console logs
npm test -- --reporter=verbose --no-coverage
```

### Browser Debugging with UI
```bash
# Open Vitest UI in browser
npm run test:ui
```

### Common Debug Techniques

```javascript
// Add console logs
console.log('Debug value:', wrapper.vm.someProperty)

// Inspect component HTML
console.log(wrapper.html())

// Check component data
console.log(wrapper.vm.$data)

// Debug async operations
console.log('Before async operation')
await someAsyncOperation()
console.log('After async operation')
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:run
    
    - name: Generate coverage
      run: npm run test:coverage
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
```

### Pre-commit Hooks

Install husky for pre-commit testing:

```bash
npm install --save-dev husky

# Add to package.json
"scripts": {
  "prepare": "husky install"
}

# Create pre-commit hook
npx husky add .husky/pre-commit "npm run test:run"
```

## Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names
- Follow the AAA pattern: Arrange, Act, Assert

### 2. Test Independence
- Each test should be independent
- Use `beforeEach` for test setup
- Clean up after tests when necessary

### 3. Mocking Strategy
- Mock external dependencies
- Use realistic mock data
- Keep mocks simple and focused

### 4. Coverage Goals
- Aim for 80%+ code coverage
- Focus on critical business logic
- Test edge cases and error conditions

### 5. Performance
- Keep tests fast (< 1 second per test)
- Use `vi.mock()` instead of real implementations
- Avoid unnecessary DOM operations

### 6. Maintainability
- Keep tests simple and readable
- Update tests when changing implementation
- Remove obsolete tests

## Coverage Reports

### Generate Coverage Report
```bash
npm run test:coverage
```

### View Coverage
```bash
# HTML report (opens in browser)
open coverage/index.html

# Terminal output
npm run test:coverage -- --reporter=text
```

### Coverage Thresholds

Configure in `vitest.config.js`:
```javascript
coverage: {
  statements: 80,
  branches: 80,
  functions: 80,
  lines: 80
}
```

## Troubleshooting

### Common Issues

#### Tests Not Running
```bash
# Clear cache
npm run test -- --run --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Mock Issues
```bash
# Clear all mocks
vi.clearAllMocks()

# Reset modules
vi.resetModules()
```

#### DOM Issues
```bash
# Ensure jsdom environment
// Add to test file
/**
 * @vitest-environment jsdom
 */
```

#### Async Test Issues
```bash
# Increase timeout
vi.setConfig({
  testTimeout: 10000
})
```

### Performance Issues

#### Slow Tests
- Check for real API calls (should be mocked)
- Reduce DOM operations
- Use `vi.mock()` more extensively

#### Memory Issues
- Clean up after tests
- Avoid creating large objects in tests
- Use `afterEach` for cleanup

### Debugging Failures

#### Test Failure Investigation
1. Run single failing test: `npm test path/to/test.js`
2. Add `console.log` statements
3. Check mock implementations
4. Verify test data
5. Review recent changes

#### Component Test Failures
1. Check component props and events
2. Verify DOM structure
3. Test user interactions step by step
4. Check async operations

#### API Test Failures
1. Verify mock database responses
2. Check request/response format
3. Test error scenarios
4. Validate middleware behavior

## Additional Resources

### Documentation
- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)

### Testing Philosophy
- Write tests for behavior, not implementation
- Test the happy path and edge cases
- Maintain tests as you maintain code
- Use tests as documentation

### Getting Help
1. Check this documentation
2. Review existing tests for patterns
3. Check Vitest documentation
4. Ask team members
5. Create GitHub issues for complex problems

---

**Happy Testing! 🧪✨**
