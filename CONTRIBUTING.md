# Contributing to Maxwell Waste Tracker

## Project Status

This project is currently in the **specification phase**. The `.kiro/specs/` directory contains comprehensive technical specifications that need to be implemented.

## How to Contribute

### Implementing the Specs

The best way to contribute is to implement the specifications:

1. **Read the specs** in `.kiro/specs/` (start with `foundation.md`)
2. **Follow the order**: foundation → auth → logging → analytics → dashboard → demo
3. **Verify success criteria** after each spec
4. **Write tests** as specified in each requirement
5. **Follow conventions** in `.kiro/steering/`

See `.kiro/IMPLEMENTATION_GUIDE.md` for detailed instructions.

### Improving the Specs

If you find issues with the specifications themselves:

1. **Open an issue** describing the problem
2. **Suggest improvements** with specific examples
3. **Propose new features** with EARS-format requirements

## Coding Standards

### TypeScript
- Strict mode enabled
- No `any` types without documentation
- Explicit return types on functions

### Git Commits
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Test additions/changes
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

Examples:
```
feat: implement authentication endpoints
fix: correct waste rate calculation
docs: add OpenAPI spec for analytics endpoints
test: add unit tests for insights engine rules
```

### Code Style
- Use Prettier for formatting
- Use ESLint for linting
- Follow conventions in `.kiro/steering/tech.md`

### Testing
- Write tests for all new features
- Target 80%+ code coverage
- Use Vitest for unit/integration tests
- Use Supertest for API tests
- Include fixtures for complex scenarios

## Pull Request Process

1. **Create a branch** for your work
   ```bash
   git checkout -b feat/implement-foundation
   ```

2. **Implement the spec** following all requirements

3. **Verify success criteria**
   - All tests pass
   - TypeScript compiles
   - ESLint shows no errors
   - Success criteria in spec are met

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: implement foundation spec"
   ```

5. **Push to your fork**
   ```bash
   git push origin feat/implement-foundation
   ```

6. **Open a Pull Request** with:
   - Which spec you implemented
   - Link to the spec file
   - Verification that success criteria are met
   - Any deviations from the spec (with justification)

## PR Template

```markdown
## Spec Implemented
- [ ] Foundation
- [ ] Auth & Catalog
- [ ] Waste & Production Logging
- [ ] Analytics & Insights
- [ ] Manager Dashboard
- [ ] Demo Readiness

## Success Criteria
- [ ] All requirements from spec implemented
- [ ] All tests passing
- [ ] Success criteria in spec verified
- [ ] No TypeScript errors
- [ ] No ESLint errors

## Changes Made
- Brief list of what was built

## Deviations from Spec
- Any intentional changes (with explanation)

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing completed

## Screenshots (if UI changes)
[Add screenshots here]
```

## Questions?

- **Spec unclear?** Open an issue with the spec name and requirement number
- **Need help?** Check `.kiro/IMPLEMENTATION_GUIDE.md`
- **Found a bug in specs?** Open an issue with "spec-bug" label

## Code of Conduct

- Be respectful and constructive
- Focus on the problem, not the person
- Assume good intentions
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Maxwell Waste Tracker! 🙏
