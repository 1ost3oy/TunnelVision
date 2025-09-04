# TunnelVision System Context

## Architecture Overview
- **Frontend**: Next.js 14 with TypeScript
- **UI**: Tailwind CSS + shadcn/ui components
- **AI**: Google Gemini 2.5 Flash via Genkit
- **Database**: MongoDB
- **Network**: WireGuard, OpenVPN, V2Ray, SSH tunnels

## Core Components

### Server Management
- **Location**: `src/components/main-page/server-list-tab.tsx`
- **Features**: Add, edit, delete, ping servers
- **Data**: Server credentials, IP addresses, SSH keys
- **Actions**: Cleanup, backup, import/export

### Tunnel Types
```typescript
tunnelTypes = [
  'wireguard', 'openvpn', 'v2ray-ws-tls', 
  'gre', 'ipip', 'reverse-ssh'
]
```

### AI System
- **Chat**: Context-aware assistant (`/api/ai/chat`)
- **Analysis**: System health scoring (`/api/ai/analysis`)
- **Flows**: Tunnel suggestions, server ordering
- **Context**: Real-time server/tunnel/log data

### Database Schema
```typescript
Server {
  id: string
  name: string
  ipAddress: string
  username: string
  sshPort?: number
  sshKeyConfigured?: boolean
}

Tunnel {
  id: string
  type: string
  server1Id: string
  server2Id: string
  tunnelIp1: string
  tunnelIp2: string
  status?: string
}
```

### SDN Features
- **Network Visualizer**: SVG topology with animations
- **Auto-tunneling**: AI-powered tunnel creation
- **CLI Commands**: Built-in network management
- **Flow Manager**: Traffic control and monitoring

### Key Files
- `src/ai/genkit.ts` - AI configuration
- `src/app/actions/` - Server actions
- `src/components/main-page/` - UI components
- `src/lib/types.ts` - TypeScript definitions
- `src/hooks/use-main-page.ts` - State management

### Environment Variables
```env
MONGODB_URI=mongodb://...
GEMINI_API_KEY=...
API_SECRET_KEY=...
```

### Network Operations
- **Ping**: Server connectivity testing
- **SSH**: Remote command execution
- **Tunnel Creation**: Multi-protocol support
- **Log Streaming**: Real-time operation feedback

### UI Layout
- **5 Tabs**: Servers, Tunnels, SDN, Netmaker, Settings
- **Floating Components**: Logs, AI Chat
- **Responsive**: Mobile-friendly design
- **Animations**: CSS transitions and effects