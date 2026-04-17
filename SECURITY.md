# Security Policy

## Supported Versions

Security updates are provided for the latest `main` branch.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately:

- Open a GitHub Security Advisory (preferred), or
- Contact the maintainer directly through repository contact channels.

Please include:

- A clear description of the issue
- Steps to reproduce
- Impact assessment
- Any suggested mitigation

Do not open public issues for active vulnerabilities.

## Response Expectations

- Initial acknowledgement target: within 72 hours
- Triage and severity assessment: as soon as possible
- Fix timeline: depends on severity and complexity

## Scope

This policy covers:

- API endpoints under `server/src/index.js`
- Data processing in `server/src/data/*`
- Front-end application in `client/src/*`
- Build and dependency configuration in `client/` and `server/`

## Best Practices for Contributors

- Never commit secrets (`.env`, API keys, tokens)
- Use least-privilege credentials for testing
- Keep dependencies up to date
- Validate user input on API endpoints
- Prefer responsible disclosure for security issues
