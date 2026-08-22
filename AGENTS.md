# Min coding agent instructions

## Principles

- **Simplicity**: provide the simplest interface for the 85% use case; do not add complex options for every edge case.
- **Don't reimplement modern JS**: skip functions that are already covered by built-ins (Array.isArray, Number.isNaN, Math.min, typeof value === 'number', etc.) or by TC39 proposals at Stage 3 or above.
- **Accurate types**: match the inference behavior of TypeScript's strict

## Coding conventions

- Preferforloops overreduce. Local mutability is fine.
- Prefer built-in JavaScript over custom helpers (Array.isArray()overisArray(), typeof value === - 'string'overisString()).
- Use short type parameter names:Tfor elements,Kfor keys,Efor errors.
- Usereadonly T[]for array parameters that are not mutated.
- Write detailed JSDoc with@template, @param, @returns, @throws, and@exampleblocks.

## Changelog

User-facing changes go intoCHANGELOG.md. Keep the file readable as a release notes document for users, not as a commit log.

Conventions:

- **Reverse chronological order**— newest version at the top.
- Each version is a heading:`## Version v{version}`, followed by aReleased on {date}.line.
- Use-for list items. Wrap lines at roughly 80 columns and indent continuations with 4 spaces.
- **Writeuser-facing descriptions**: what changed, why it matters, and what users should do. Avoid implementation jargon.
