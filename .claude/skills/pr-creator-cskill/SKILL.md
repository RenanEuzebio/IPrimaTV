---
name: pr-creator-cskill
description: Creates GitHub pull requests from committed changes. Handles branch creation if on main and manages PR creation workflow.
---

# Pull Request Creator

## Instructions

Create GitHub pull requests from committed changes with proper branch management.

**CRITICAL RULES:**
1. ONLY work with COMMITTED changes - check `git log` to verify unpushed commits exist
2. NEVER run `git add`, `git commit`, or `git stash`
3. If on main/master branch, create a descriptive feature branch first
4. Push branch to remote with `-u` flag if needed
5. Create PR using `gh pr create` with descriptive title and body
6. If no unpushed commits exist, inform the user and stop

**Workflow:**
1. Check current branch (`git branch --show-current`)
2. Check for unpushed commits (`git log origin/$(git branch --show-current)..HEAD`)
3. If no unpushed commits, stop and inform user
4. If on main/master, create and checkout feature branch
5. Push to remote (`git push -u origin <branch>`)
6. Create PR with `gh pr create --title "..." --body "..."`
7. Return PR URL

**Branch naming convention:**
- Use format: `feature/description` or `fix/description`
- Based on commit messages and changes
- Example: `feature/add-clear-thought-guide`, `fix/authentication-bug`

**PR title and body:**
- Title: Concise summary of changes (50-72 chars)
- Body: Detailed description with bullet points of what changed
- Include context and motivation
- Reference any issues if applicable

Your sole responsibility is to create PRs from already-committed changes.
