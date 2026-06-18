# Contributing to FlixMate

Thank you for your interest in contributing to **FlixMate**! This is a university portfolio project, so contributions are welcome in the form of bug reports, feature suggestions, and educational improvements.

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/flixmate-movie-booking-system.git
   cd flixmate-movie-booking-system
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Copy environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual DATABASE_URL
   ```
5. **Run in development mode**:
   ```bash
   npm run dev
   ```

---

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable, release-ready code |
| `feature/<name>` | New features under development |
| `fix/<name>` | Bug fixes |
| `docs/<name>` | Documentation-only changes |

---

## Pull Request Guidelines

- Keep PRs **focused** — one logical change per PR.
- Write a **clear description** of what changed and why.
- Reference any related issues with `Fixes #<issue-number>`.
- Ensure `npm run lint` passes (no TypeScript errors) before submitting.

---

## Code Standards

- **TypeScript**: Always use proper types — avoid `any`.
- **Naming**: Use `camelCase` for variables/functions, `PascalCase` for components/interfaces.
- **Comments**: Add JSDoc comments to all exported functions.
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/) format:
  ```
  feat: add movie search functionality
  fix: resolve seat double-booking in high concurrency
  docs: update README with setup steps
  ```

---

## Reporting Bugs

Please open a GitHub Issue with:
- A clear, descriptive title
- Steps to reproduce the bug
- Expected vs actual behaviour
- Browser / Node version if applicable

---

## Feature Requests

Open an Issue with the `enhancement` label and describe:
- The problem your feature would solve
- Your proposed solution
- Any trade-offs or alternatives you considered

---

## Code of Conduct

Be respectful, constructive, and inclusive. This project follows standard open-source community norms.

---

*Developed by Upe — AI Engineering Student*
