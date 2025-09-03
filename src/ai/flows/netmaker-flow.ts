'use server';
/**
 * @fileOverview Generates WireGuard configurations for a mesh network.
 * 
 * - generateNetmakerConfig - Creates WireGuard configs for a broker and clients.
 * - NetmakerConfigInput - Input schema for the flow.
 * - NetmakerConfigOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ServerInfoSchema = z.object({
  id: z.string().describe('Unique identifier for the server.'),
  name: z.string().describe('The name of the server.'),
  ipAddress: z.string().describe('The public IP address of the server.'),
});

const NetmakerConfigInputSchema = z.object({
  broker: ServerInfoSchema.describe('The server acting as the central broker.'),
  clients: z.array(ServerInfoSchema).describe('A list of client servers that will connect to the broker.'),
  networkBaseIp: z.string().ip({ version: 'v4' }).describe('The base IP address for the WireGuard network (e.g., 10.10.0.0).'),
  listenPort: z.number().min(1024).max(65535).describe('The port the broker will listen on.'),
});
export type NetmakerConfigInput = z.infer<typeof NetmakerConfigInputSchema>;

const PromptInputSchema = NetmakerConfigInputSchema.extend({
    networkSubnet: z.string().describe('The calculated network subnet, e.g., 10.10.0.0/24'),
    brokerIpInTunnel: z.string().ip({ version: 'v4' }).describe('The calculated IP for the broker in the tunnel, e.g., 10.10.0.1.'),
});


const KeyPairSchema = z.object({
  privateKey: z.string().describe('The private key for a WireGuard interface.'),
  publicKey: z.string().describe('The public key for a WireGuard interface.'),
});

const ServerConfigSchema = z.object({
  serverId: z.string().describe('The ID of the server this configuration is for.'),
  configFile: z.string().describe('The full WireGuard configuration file content.'),
  keys: KeyPairSchema.describe('The generated key pair for this server.'),
  address: z.string().ip({ version: 'v4' }).describe('The assigned IP address within the WireGuard network.'),
});

const NetmakerConfigOutputSchema = z.object({
  brokerConfig: ServerConfigSchema.describe('The configuration for the broker server.'),
  clientConfigs: z.array(ServerConfigSchema).describe('A list of configurations for each client server.'),
});
export type NetmakerConfigOutput = z.infer<typeof NetmakerConfigOutputSchema>;


export async function generateNetmakerConfig(input: NetmakerConfigInput): Promise<NetmakerConfigOutput> {
  return generateNetmakerConfigFlow(input);
}

const prompt = ai.definePrompt({
  name: 'netmakerConfigPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: NetmakerConfigOutputSchema },
  prompt: `
You are a network engineer specializing in WireGuard. Your task is to generate all the necessary WireGuard configurations for a hub-and-spoke (broker) mesh network.

**Network Details:**
- **Broker Server:** {{broker.name}} ({{broker.ipAddress}})
- **Client Servers:** 
  {{#each clients}}
  - {{this.name}} ({{this.ipAddress}})
  {{/each}}
- **Network Base IP:** {{networkBaseIp}} (use a /24 subnet)
- **Broker Listen Port:** {{listenPort}}

**Instructions:**
1.  **Generate Key Pairs:** Create a unique private and public key pair for the broker and EACH client server. Use a secure method for key generation.
2.  **Assign IPs:**
    - Assign \`{{brokerIpInTunnel}}\` to the broker.
    - Assign IPs sequentially to each client (e.g., .2, .3, .4, ...).
3.  **Create Broker Configuration ('brokerConfig'):**
    - The broker's interface should have its assigned private key and IP address.
    - It must listen on the specified port.
    - Create a \`[Peer]\` section for EACH client.
    - Each client peer section must contain the client's public key and its assigned internal IP address.
4.  **Create Client Configurations ('clientConfigs'):**
    - Create a configuration for EACH client server.
    - The client's interface should have its assigned private key and IP address.
    - Create a single \`[Peer]\` section for the broker.
    - The broker peer section must contain the broker's public key.
    - The \`Endpoint\` for the broker peer must be the broker's public IP address and listen port ({{broker.ipAddress}}:{{listenPort}}).
    - The \`AllowedIPs\` for the broker peer should be the entire network subnet ({{networkSubnet}}) to allow clients to communicate with each other through the broker.
    - Include a \`PersistentKeepalive = 25\` for the broker peer on all client configurations.

Generate the complete configurations and adhere strictly to the output schema.
`,
});

const generateNetmakerConfigFlow = ai.defineFlow(
  {
    name: 'generateNetmakerConfigFlow',
    inputSchema: NetmakerConfigInputSchema,
    outputSchema: NetmakerConfigOutputSchema,
  },
  async (input) => {
      const ipPrefix = input.networkBaseIp.split('.').slice(0, 3).join('.');
      const networkSubnet = `${ipPrefix}.0/24`;
      const brokerIpInTunnel = `${ipPrefix}.1`;
      
      const promptInput = { 
        ...input, 
        networkSubnet,
        brokerIpInTunnel
      };
      
      const { output } = await prompt(promptInput);
      if (!output) {
        throw new Error('Failed to generate Netmaker configuration.');
      }
      return output;
  }
);
