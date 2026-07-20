# Security Policy

## Supported Versions

| Version                  | Security support    |
| ------------------------ | ------------------- |
| Latest published release | Supported           |
| Older releases           | Upgrade recommended |

Security fixes are delivered through the latest published release. Consumers should keep Vue, browsers, and this package current.

## Reporting a Vulnerability

Do not disclose suspected vulnerabilities in public issues, discussions, or pull requests.

Submit a private report through [GitHub Security Advisories](https://github.com/eramitgupta/text-editor-vue/security/advisories/new). Include:

- The affected package version and environment.
- The vulnerability type and potential impact.
- Reproduction steps or a minimal proof of concept.
- Any known mitigations or suggested remediation.

Remove unrelated credentials, tokens, and personal information. Reports should receive an initial acknowledgement within 48 hours. Validation, remediation, and release timing depend on severity and complexity. Please allow time for a coordinated fix before public disclosure.

## Editor Content Security

The package sanitizer is a client-side defense-in-depth measure, not a complete XSS boundary. Applications must sanitize untrusted editor HTML again on the server before storing, rendering, emailing, or transforming it. Validate upload responses and URLs, restrict allowed HTML for the application, and serve user-controlled media from an appropriately isolated origin when possible.
