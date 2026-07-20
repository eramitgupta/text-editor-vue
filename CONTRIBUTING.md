# Contributing

Thank you for helping improve `@erag/text-editor-vue`. Bug reports, documentation fixes, accessibility improvements, and focused feature contributions are welcome.

## Before You Start

- Search the [existing issues](https://github.com/eramitgupta/text-editor-vue/issues) before opening a new one.
- Discuss large features or public API changes in an issue before implementation.
- Use Node.js 24 or newer and a current npm release.

## Development Setup

```bash
git clone https://github.com/eramitgupta/text-editor-vue.git
cd text-editor-vue
npm install
npm run dev
```

The `dev` command rebuilds the library in watch mode. This repository intentionally has no demo application or test framework.

## Project Guidelines

- Use Vue 3 Composition API with `<script setup lang="ts">`.
- Keep Vue as a peer dependency and do not add runtime dependencies.
- Keep types, commands, composables, configuration, utilities, and components in their focused `src/` directories.
- Do not use `any`, suppress TypeScript or ESLint errors, or leave placeholder implementations.
- Prefix every package CSS class with `erag-` and every custom property with `--erag-`.
- Keep styles scoped beneath package selectors; never globally style native elements.
- Preserve keyboard access, selection restoration, SSR safety, sanitization, and the existing public API.

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run build
```

`npm run lint` formats files with Prettier and applies ESLint fixes. Before opening a pull request, run the non-mutating CI check too:

```bash
npm run lint:check
```

## Bug Reports

Open a [bug report](https://github.com/eramitgupta/text-editor-vue/issues/new) containing:

- A minimal reproduction and exact steps.
- Expected and actual behavior.
- Browser, operating system, Vue, Node.js, and package versions.
- Relevant configuration, console output, screenshots, or recordings.

Remove credentials, tokens, private URLs, and personal data before posting. Security vulnerabilities must follow the private process in [SECURITY.md](SECURITY.md).

## Pull Requests

1. Fork the repository and branch from `main`.
2. Keep the change focused and follow the existing architecture.
3. Update public types and README examples when behavior or configuration changes.
4. Run lint, typecheck, and build successfully.
5. Open a pull request explaining the problem, solution, verification, and browser limitations.

By contributing, you agree that your work is licensed under the [MIT License](LICENSE) and that you will follow the [Code of Conduct](.github/CODE_OF_CONDUCT.md).
