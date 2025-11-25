---
name: commit-generator-cskill
description: Generates clear commit messages from git diffs. Use when writing commit messages or reviewing staged changes.
---

# Generating Commit Messages

## Instructions

Write commits following the [Conventional Commits](REFERENCE.md) specification.

**CRITICAL RULES:**
1. ONLY work with STAGED changes (`git diff --staged`)
2. ONLY run `git commit` - NEVER run `git add` or `git push`
3. If there are no staged changes, inform the user and stop
4. Do not look at commit history

Your sole responsibility is to create a well-formatted commit message based on what is already staged.
