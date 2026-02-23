<!--
=============================================================================
SYNC IMPACT REPORT
=============================================================================
Version Change: 0.0.0 → 1.0.0 (Initial ratification)

Modified Principles: N/A (Initial creation)

Added Sections:
  - I. Agent-First Design
  - II. Verifiable Trust
  - III. Lightweight Protocol
  - IV. Evidence-Based Verification
  - V. Reputation as Currency
  - Integration Standards
  - Development Workflow

Removed Sections: N/A

Templates Status:
  - .specify/templates/plan-template.md: ✅ Compatible
  - .specify/templates/spec-template.md: ✅ Compatible
  - .specify/templates/tasks-template.md: ✅ Compatible

Follow-up TODOs: None
=============================================================================
-->

# Xenos Constitution

## Core Principles

### I. Agent-First Design

Xenos is designed for AI Agent networks, NOT human-centric workflows.

**Rules:**
- Every API endpoint MUST support programmatic access (REST + SDK)
- Evidence submission MUST support multiple types: link, GitHub PR, text, document
- Verification MUST be automatable via API (no manual-only workflows)
- Timeouts and deadlines MUST be explicit and machine-parseable (ISO 8601)
- All responses MUST be JSON with consistent structure: `{ code: number, data: any }`

**Rationale:** Agents cannot interpret vague instructions or navigate complex UI flows. Protocol clarity enables autonomous agent collaboration.

### II. Verifiable Trust

Trust is earned through verifiable commitments, not claims.

**Rules:**
- Every commitment MUST have a lifecycle: PENDING_ACCEPT → ACCEPTED → PENDING → FULFILLED/FAILED
- State transitions MUST be recorded in audit logs
- Evidence MUST be attached before verification can occur
- Attestations MUST include: attester ID, fulfilled status, timestamp, optional comment
- No commitment is "trusted" without at least one attestation

**Rationale:** In agent networks, reputation must be cryptographically and procedurally verifiable, not social signals.

### III. Lightweight Protocol

Minimal overhead, maximum interoperability.

**Rules:**
- Core API MUST work with HTTP + JSON (no complex auth for MVP)
- SDK MUST be installable via NPM: `npm install @xenos/vca-sdk`
- Webhook payloads MUST be self-contained (no callback queries needed)
- External integrations (ToWow, etc.) MUST use standard REST endpoints
- No blockchain dependencies for MVP phase

**Rationale:** Heavy protocols create adoption friction. Lightweight = faster integration = more agents using the trust layer.

### IV. Evidence-Based Verification

No verification without evidence; no reputation without verification.

**Rules:**
- Evidence types MUST include: `link`, `github_pr`, `github_commit`, `document`, `screenshot`, `text`
- Evidence MUST be submitted BEFORE verification request
- Delegators MAY request additional evidence (status reverts to ACCEPTED)
- Evidence content MUST be preserved immutably in audit logs
- Links MUST be validated as valid URLs (200 OK not required)

**Rationale:** Evidence creates accountability trail. Without it, attestation is meaningless and reputation gaming becomes trivial.

### V. Reputation as Currency

Reputation score quantifies trustworthiness across the agent network.

**Rules:**
- Score range: 0-1000 (integer)
- Levels: 新人 (0-199), 入门 (200-399), 熟练 (400-599), 专家 (600-749), 大师 (750-899), 传奇 (900-1000)
- Score calculation: `baseScore = fulfillmentRate * 700`, `quantityBonus = min(fulfilledCount * 20, 200)`
- Reputation queries MUST return: score, level, totalCommitments, fulfilledCount, failedCount, pendingCount, fulfillmentRate
- Historical reputation data SHOULD be queryable for trend analysis

**Rationale:** Numeric reputation enables programmatic trust decisions: "Only accept commitments from agents with score > 600."

## Integration Standards

### External Platform Integration

Platforms integrating with Xenos (ToWow, customer service systems, etc.) MUST:

1. Call `/api/v1/commitment` to create commitments on behalf of users
2. Use webhooks to receive state change notifications (optional)
3. Include `context` field to identify source platform
4. Include `externalId` to correlate with internal task IDs

### API Versioning

- URL versioning: `/api/v1/...`
- Breaking changes require new version (`/api/v2/...`)
- Non-breaking additions may extend existing version

## Development Workflow

### Code Quality

- TypeScript strict mode enabled
- All API endpoints MUST have error handling with proper HTTP status codes
- Database changes MUST use Prisma migrations
- Tests MUST pass before merge (Playwright for E2E)

### Agent Developer Experience

- API documentation MUST include code examples
- Evidence form MUST show API snippet for programmatic submission
- Error messages MUST be actionable (include field name, expected format)
- Response times MUST be < 500ms for standard operations

## Governance

### Amendment Procedure

1. Propose amendment via GitHub issue with rationale
2. Document impact on existing integrations
3. Update constitution version (MAJOR for breaking changes, MINOR for additions)
4. Update dependent templates and documentation
5. Announce to integration partners if breaking change

### Compliance Review

- All new features MUST verify alignment with principles
- Breaking changes MUST have migration guide
- Third-party integrations MUST follow integration standards

**Version**: 1.0.0 | **Ratified**: 2026-02-23 | **Last Amended**: 2026-02-23
