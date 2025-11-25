# Pull Request Best Practices

## Branch Naming

### Format

```
<type>/<short-description>
```

### Types

- `feature/` - New features or enhancements
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `chore/` - Maintenance tasks
- `test/` - Test additions or modifications

### Examples

```
feature/user-authentication
feature/add-payment-integration
fix/login-redirect-bug
fix/memory-leak-api-client
refactor/database-queries
docs/api-documentation
chore/update-dependencies
test/integration-tests
```

## PR Title Guidelines

### Format

Concise, imperative mood, 50-72 characters:

```
Add user authentication with OAuth2
Fix memory leak in API client
Refactor database query optimization
Update API documentation for v2.0
```

### Best Practices

- ✅ Start with verb (Add, Fix, Update, Remove, Refactor)
- ✅ Be specific and descriptive
- ✅ Use present tense
- ✅ Keep under 72 characters
- ❌ Don't end with period
- ❌ Don't be vague ("Updates" or "Changes")

## PR Body Structure

### Template

```markdown
## Summary
Brief description of what this PR does and why.

## Changes
- Change 1: Description
- Change 2: Description
- Change 3: Description

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- Describe how changes were tested
- List test scenarios covered
- Note any edge cases

## Related Issues
Closes #123
Relates to #456
```

### Best Practices

**Summary:**
- Explain the "why" not just the "what"
- Provide context for reviewers
- Keep it concise but informative

**Changes:**
- List specific modifications
- Use bullet points for clarity
- Group related changes together

**Testing:**
- Describe test approach
- Include manual testing steps if applicable
- Note any automated tests added

**References:**
- Link to related issues
- Use GitHub keywords (Closes, Fixes, Resolves)
- Reference documentation if applicable

## Examples

### Example 1: Feature Addition

```markdown
Title: Add Clear Thought MCP integration with RAG

## Summary
Integrates Clear Thought MCP server to provide advanced reasoning capabilities
combined with our existing RAG system. This gives users access to step-by-step
problem solving while maintaining access to our knowledge base.

## Changes
- Created Clear Thought chat interface at `/clear-thought`
- Integrated MCP tools with existing RAG functionality
- Added user guide documentation (clear-thought.mdx)
- Updated navigation to include Clear Thought option
- Added support for dynamic-tool message rendering

## Type of Change
- [x] New feature (non-breaking change which adds functionality)
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Testing
- Verified Clear Thought MCP server connection
- Tested reasoning capabilities with sample queries
- Confirmed RAG integration works correctly
- Validated UI rendering of all message types

## Related Issues
Closes #42
```

### Example 2: Bug Fix

```markdown
Title: Fix authentication redirect loop on login

## Summary
Resolves an issue where users were stuck in a redirect loop after login
when accessing protected routes. The problem was caused by incorrect
session state handling in the middleware.

## Changes
- Fixed session state check in auth middleware
- Added proper redirect logic after successful login
- Updated session expiry handling
- Added error logging for auth failures

## Type of Change
- [x] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- Manually tested login flow 10+ times
- Verified protected route access works
- Tested session expiry behavior
- Added integration test for auth flow

## Related Issues
Fixes #89
```

### Example 3: Refactoring

```markdown
Title: Refactor database query layer for better performance

## Summary
Improves database query performance by implementing connection pooling,
query result caching, and optimizing N+1 query patterns. These changes
reduce average response time by ~40% without changing any public APIs.

## Changes
- Implemented connection pooling with pg-pool
- Added Redis caching for frequently accessed queries
- Refactored user query to use JOIN instead of multiple queries
- Updated query builder to use prepared statements
- Added query performance monitoring

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [x] Refactoring (no functional changes)

## Testing
- All existing tests pass
- Benchmarked queries showing 40% improvement
- Verified cache invalidation works correctly
- Tested with production data snapshot

## Related Issues
Relates to #156 (performance improvements roadmap)
```

## GitHub CLI Commands Reference

### Create PR

```bash
# Interactive mode (prompts for title and body)
gh pr create

# With title and body
gh pr create --title "Add feature X" --body "Description here"

# With template file
gh pr create --title "Add feature X" --body-file PR_TEMPLATE.md

# To specific base branch
gh pr create --base develop --title "Add feature X"

# As draft
gh pr create --draft --title "WIP: Add feature X"
```

### Common Options

- `--title` - PR title
- `--body` - PR description
- `--base` - Base branch (default: main)
- `--draft` - Create as draft PR
- `--assignee` - Assign to user
- `--reviewer` - Request review from user
- `--label` - Add labels

## PR Checklist

Before creating a PR, ensure:

- [ ] All commits follow conventional commit format
- [ ] Branch is up to date with base branch
- [ ] All tests pass locally
- [ ] Code has been self-reviewed
- [ ] Documentation updated if needed
- [ ] No console.log or debug code left in
- [ ] Sensitive data removed (API keys, passwords)
- [ ] Descriptive commit messages
- [ ] PR title and body are clear and informative
