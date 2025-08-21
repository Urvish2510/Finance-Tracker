# Test Commands Quick Reference

## 🚀 Quick Start Commands

### Run All Tests
```bash
npm test                    # Watch mode (interactive)
npm run test:run           # Run once and exit
```

### Run with Coverage
```bash
npm run test:coverage      # Generate coverage report
```

### Run Specific Test Types
```bash
npm test tests/unit/                    # Unit tests only
npm run test:server                     # Server/API tests only
npm test tests/integration/             # Integration tests only
```

### Run Specific Files
```bash
npm test tests/unit/Categories.test.js                    # Single file
npm test tests/unit/Categories.test.js tests/unit/Dashboard.test.js  # Multiple files
npm test tests/unit/use*.test.js                          # Pattern matching
```

## 🎯 Interactive Watch Mode Commands

When you run `npm test`, these commands are available:

| Key | Action |
|-----|--------|
| `a` | Run all tests |
| `f` | Run only failed tests |
| `o` | Run tests related to changed files |
| `p` | Filter by filename pattern |
| `t` | Filter by test name pattern |
| `u` | Update snapshots |
| `q` | Quit watch mode |
| `Enter` | Re-run tests |

## 🔍 Advanced Commands

### Debug Tests
```bash
npm test -- --reporter=verbose         # Detailed output
npm run test:ui                        # Browser UI
npm test -- --inspect-brk             # Debug mode
```

### Filter Tests
```bash
npm test -- --testNamePattern="Categories"     # Filter by test name
npm test -- --testPathPattern="unit"           # Filter by file path
```

### Coverage Options
```bash
npm run test:coverage -- --reporter=text       # Terminal coverage
npm run test:coverage -- --reporter=html       # HTML coverage report
```

## 📊 Test Structure

```
tests/
├── unit/           # Component & composable tests
├── server/         # API endpoint tests  
├── integration/    # Full app workflow tests
├── mocks/          # Mock data and utilities
└── setup.js        # Global test configuration
```

## 🏆 Coverage Goals

- **Statements**: 80%+
- **Branches**: 80%+  
- **Functions**: 80%+
- **Lines**: 80%+

## 🛠️ Troubleshooting

### Clear Cache
```bash
npm test -- --run --clearCache
```

### Reset Everything
```bash
rm -rf node_modules package-lock.json
npm install
npm test
```

### Common Issues
- **Tests not running**: Check file paths and patterns
- **Mocks not working**: Verify mock implementations in `vi.mock()`
- **Async issues**: Add `await` or increase timeout
- **DOM issues**: Ensure jsdom environment is set

---
*For detailed documentation, see [TESTING.md](./TESTING.md)*
