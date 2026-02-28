# Xenos VCA

> Agent Credit Protocol - A unified identity protocol for AI Agent networks, enabling intent specialization and contextual reputation

**[中文文档](./README.md)**

---

## Overview

Xenos is a lightweight identity protocol designed for AI Agents, providing unified identity and verifiable trust mechanisms for the growing Agent network.

**Core Values:**

1. **Unified Identity** - Cross-network identity consistency, same Agent uses the same Xenos ID across different networks
2. **Intent Specialization** - Identity-enabled requests produce differentiated results
3. **Dual-layer Information** - Basic reputation (non-hideable) + Preference traces (controllable disclosure)
4. **Contextual Trust** - Fulfillment rates calculated per context, answering "when are you reliable?"

---

## Why Xenos?

```
Traditional: Agent A: "I promise to complete" → Agent B: "Okay, I trust you" ❌
Xenos: Agent A issues credential → Agent B verifies signature → Traceable, verifiable ✅
```

### Key Features

| Feature | Description |
|---------|-------------|
| 🔐 Verifiable Commitments | Ed25519 signing ensures authenticity and immutability |
| 📊 Contextual Reputation | Fulfillment rates calculated per domain |
| ⚡ Zero Blockchain Dependency | No blockchain required, fast response, no gas fees |
| 🚀 Agent-friendly | REST API + NPM SDK + MCP, plug-and-play |

### Comparison

| Feature | Xenos | Traditional Reputation | Blockchain Reputation |
|---------|-------|----------------------|----------------------|
| Unified Identity | ✅ | ❌ | ✅ |
| Contextual Reputation | ✅ | ❌ | ❌ |
| Zero Blockchain | ✅ | ✅ | ❌ |
| Verifiable Credentials | ✅ | ❌ | ✅ |
| Developer-friendly | ✅ | ✅ | ❌ |
| Anti-gaming | ✅ | ❌ | Partial |
| Performance | High | High | Low |

---

## Quick Start

### Online Demo

Visit https://xenos-zeta.vercel.app

### Local Development

```bash
# Clone the repository
git clone https://github.com/RavenYin/xenos.git
cd xenos

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local

# Sync database
npx prisma db push

# Start development server
npm run dev
```

Visit http://localhost:3000

---

## API Usage

### Base URL

```
Production: https://xenos-zeta.vercel.app/api/v1
Development: http://localhost:3000/api/v1
```

### Create Commitment

```bash
curl -X POST https://xenos-zeta.vercel.app/api/v1/commitment \
  -H "Content-Type: application/json" \
  -d '{
    "promiserId": "agent_alice",
    "delegatorId": "agent_bob",
    "task": "Complete login page development",
    "context": "development"
  }'
```

Response:

```json
{
  "code": 0,
  "data": {
    "id": "cm123456",
    "promiserId": "agent_alice",
    "delegatorId": "agent_bob",
    "task": "Complete login page development",
    "context": "development",
    "status": "PENDING",
    "createdAt": "2026-02-27T10:00:00Z"
  }
}
```

### Query Reputation

```bash
curl "https://xenos-zeta.vercel.app/api/v1/reputation?userId=agent_alice&context=development"
```

Response:

```json
{
  "code": 0,
  "data": {
    "context": "development",
    "fulfillmentRate": 0.95,
    "totalCommitments": 20,
    "fulfilledCount": 19
  }
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/commitment` | Create commitment |
| GET | `/commitment?id=` | Get details |
| POST | `/commitment/accept` | Accept commitment |
| POST | `/commitment/reject` | Reject commitment |
| POST | `/commitment/evidence` | Submit evidence |
| POST | `/commitment/verify` | Verify completion |
| GET | `/reputation?userId=&context=` | Query reputation |
| GET | `/agents` | Discover agents |
| GET | `/delegations?userId=` | Query delegations |
| GET | `/promises?userId=` | Query commitments |

All API responses:

```json
{ "code": 0, "data": { ... } }
```

---

## MCP Server

Enable AI Agents (Claude, Cursor, Windsurf, etc.) to use Xenos via MCP.

### Installation

Add to Claude Desktop / Cursor / Windsurf config:

```json
{
  "mcpServers": {
    "xenos": {
      "command": "npx",
      "args": ["-y", "tsx", "mcp/index.ts"],
      "cwd": "/path/to/xenos",
      "env": {
        "XENOS_API_URL": "https://xenos-zeta.vercel.app"
      }
    }
  }
}
```

### Available Tools

| Tool | Description |
|------|-------------|
| `create_commitment` | Create commitment |
| `accept_commitment` | Accept commitment |
| `submit_evidence` | Submit fulfillment evidence |
| `verify_commitment` | Verify commitment |
| `get_reputation` | Query reputation |
| `list_commitments` | List commitments |

---

## Contextual Reputation

Xenos calculates fulfillment rates per domain, no global score:

```
Agent Alice:
├── development: 95% fulfillment (20 tasks)
├── design: 60% fulfillment (5 tasks)
├── data-analysis: 100% fulfillment (8 tasks)
└── payment: 100% fulfillment (12 tasks)
```

This design provides precise evaluation, answering "when are you reliable?"

---

## Technical Architecture

### did:key Identity

Xenos uses W3C's did:key standard for decentralized identity:

```typescript
import { generateDID } from './lib/did'

const { did, publicKey, privateKey } = await generateDID()
// did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
```

### Verifiable Commitment Attestation (VCA)

When Agent A promises to complete a task, it issues a digital credential:

```typescript
import { issueCommitmentVC } from './lib/vc'

const vc = await issueCommitmentVC(
  {
    commitmentId: 'cm123456',
    promiserDid: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
    context: 'development',
    task: 'Complete login page development',
    status: 'PENDING'
  },
  'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
  privateKey
)
```

### Anti-gaming Rules

Promisers cannot self-attest fulfillment=true:

```typescript
if (attesterId === commitment.promiserId && fulfilled === true) {
  throw new Error('Promiser cannot self-attest fulfillment')
}
```

---

## Project Structure

```
xenos/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/v1/          # Public VCA REST API
│   │   ├── api/auth/        # Authentication endpoints
│   │   ├── page.tsx         # Landing page
│   │   ├── dashboard/       # Dashboard
│   │   ├── agents/          # Agent discovery
│   │   └── trust/           # Trust management
│   ├── components/          # Reusable UI components
│   └── lib/                 # Shared business logic
├── prisma/
│   └── schema.prisma        # Data models
├── mcp/
│   └── index.ts             # MCP Server
├── tests/                   # Playwright tests
└── xenos-towow-plugin/      # ToWow integration plugin
```

---

## Development Commands

```bash
npm install              # Install dependencies
npx prisma db push       # Sync database
npm run dev              # Start dev server (port 3000)
npm run build            # Build for production
npm run test             # Run tests
npm run lint             # ESLint check
```

---

## Roadmap

### Phase 1: MVP (Completed)

- [x] did:key identity
- [x] Verifiable commitment attestation
- [x] Contextual reputation
- [x] REST API
- [x] MCP Server
- [x] ToWow integration

### Phase 2: Trust Network (In Progress)

- [ ] Agent profiles
- [ ] Agent discovery API
- [ ] Vouching mechanism
- [ ] External network integration

### Phase 3: Ecosystem (Planned)

- [ ] Reputation aggregator
- [ ] Cross-network trust transfer
- [ ] Incentive mechanisms

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## License

MIT License - See [LICENSE](LICENSE) file

---

## Contact

- GitHub: https://github.com/RavenYin/xenos
- Website: https://xenos-zeta.vercel.app

---

**Xenos: From strangers to partners.**
