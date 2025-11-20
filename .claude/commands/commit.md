---
allowed-tools: Bash, Grep, LS, Read, Edit, MultiEdit, Write, NotebookEdit, WebFetch, TodoWrite, WebSearch, Task
description: Create commits with conventional messages, emoji, and integrated documentation generation
---

You are an expert commit automation specialist with deep knowledge of conventional commit standards, version control best practices, and documentation workflows.

## Git Status Analysis

```
!`git status`
```

## OBJECTIVE:

Create commits with well-formatted conventional commit messages using emoji and integrate with the documentation-writer agent for comprehensive documentation updates.

## Workflow:

1. **Pre-commit Quality Checks** (unless --no-verify specified):
   - Run `cd next-app && npm run build` to verify build succeeds
   - Run `cd next-app && npm run type-check` to ensure TypeScript validity
   - If any checks fail, ask user if they want to proceed anyway or fix issues first

2. **Staging Strategy**:
   - If no files are staged, automatically stage all modified and new files with `git add .`
   - Review the staged changes and diff content
   - Analyze changes to determine if multiple distinct logical changes are present

3. **Commit Analysis & Splitting**:
   - Analyze the complete diff to identify different concerns (features, fixes, refactoring, docs, etc.)
   - If multiple distinct changes detected, suggest breaking into separate commits for better history hygiene
   - Guide user through staging and committing changes separately when splitting is needed

4. **Commit Message Format**:
   Use conventional commits with appropriate emoji:
   - ✨ `feat`: New feature
   - 🐛 `fix`: Bug fix
   - 📝 `docs`: Documentation changes
   - 💄 `style`: Code formatting/style changes
   - ♻️ `refactor`: Code refactoring
   - ⚡️ `perf`: Performance improvements
   - ✅ `test`: Adding or fixing tests
   - 🔧 `chore`: Tooling, configuration changes
   - 🚨 `fix`: Fix compiler/linter warnings
   - 🔒️ `fix`: Fix security issues
   - 👥 `chore`: Add or update contributors
   - 🚚 `refactor`: Move or rename resources
   - 🏗️ `refactor`: Make architectural changes
   - 🩹 `fix`: Simple fix for a non-critical issue
   - 🚑️ `fix`: Critical hotfix
   - 👔 `feat`: Add or update business logic
   - ♿️ `feat`: Improve accessibility
   - 🦺 `feat`: Add or update code related to validation
   - 💡 `docs`: Add or update comments in source code
   - 🗃️ `db`: Perform database related changes
   - 🌱 `chore`: Add or update seed files
   - 🧑‍💻 `chore`: Improve developer experience

5. **Post-Commit Documentation Workflow**:
   After successful commit(s), automatically invoke the documentation-writer agent to ensure documentation stays in sync with codebase evolution.

## Command Options:

- `--no-verify`: Skip pre-commit quality checks (build, type-check)
- `--no-docs`: Skip automatic documentation generation after commit
- `--split`: Force commit splitting analysis even for single logical changes

Execute the commit workflow based on the current git status and user-provided options.