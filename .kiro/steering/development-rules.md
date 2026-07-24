# Development Rules

> Coding conventions and process rules.

---

## Language Policy

- Code: English
- Documentation: English
- Commits and PRs: English

## TypeScript

- Strict mode enabled.
- No `any`. Use `unknown` + type guards.
- Prefer interfaces for objects.
- Prefer `const`. No `var`.
- No TypeScript enums. Use `as const`.
- Named exports only. No default exports.
- Named imports only. No `import *`.

## Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Variables, functions | camelCase | `getUserProfile` |
| Module constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Types, interfaces | PascalCase | `ProfileSection` |
| Files | kebab-case | `profile-service.ts` |
| Test files | kebab-case.test | `profile-service.test.ts` |
| Folders | kebab-case | `output-engine` |
| Env variables | OCP_ prefix | `OCP_DATABASE_URL` |

## Error Handling

- No generic try/catch. Catch specific errors.
- Services return Result<T, E> pattern for expected flows.
- Custom error classes with typed `code`.

## Git

- Conventional Commits: `<type>(<scope>): <description>`
- Types: feat, fix, docs, refactor, test, build, chore
- Branch: `main`, `develop`, `feat/<scope>/<desc>`, `fix/<scope>/<desc>`
- Squash merge to develop, merge commit to main.

## Testing

- Business logic: unit tests.
- API endpoints: integration tests.
- Coverage target: 80% on core packages.
- Test names describe behavior.

## Dependencies

- Exact versions (no ^ or ~).
- Evaluate before adding.
- Dev dependencies in devDependencies.

## Security

- Never log sensitive data.
- Sanitize all user input.
- Parameterized queries (Prisma default).
- Helmet for Express.
- pnpm audit in CI.

---

# End of Document
