'use server';
/**
 * @fileOverview An AI flow to suggest the best tunnel type based on user context.
 *
 * - suggestTunnel - A function that suggests a tunnel type.
 * - SuggestTunnelInput - The input type for the suggestTunnel function.
 * - SuggestTunnelOutput - The return type for the suggestTunnel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { tunnelTypes } from '@/lib/types';

const SuggestTunnelInputSchema = z.object({
  context: z.string().describe('The user\'s description of their needs, network conditions, or goals.'),
});
export type SuggestTunnelInput = z.infer<typeof SuggestTunnelInputSchema>;

const SuggestTunnelOutputSchema = z.object({
  tunnelType: z.string().describe(`The suggested tunnel type. Must be one of the following values: [${tunnelTypes.join(', ')}]`),
  reason: z.string().describe('A brief explanation for why this tunnel type was recommended, based on the user\'s context.'),
});
export type SuggestTunnelOutput = z.infer<typeof SuggestTunnelOutputSchema>;


export async function suggestTunnel(input: SuggestTunnelInput): Promise<SuggestTunnelOutput> {
  return suggestTunnelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTunnelPrompt',
  input: {schema: SuggestTunnelInputSchema},
  output: {schema: SuggestTunnelOutputSchema},
  prompt: `شما یک متخصص شبکه و امنیت کامپیوتر هستید. وظیفه شما پیشنهاد بهترین نوع تونل برای کاربر بر اساس نیازهایش است.

بافت کاربر را تحلیل کنید و مناسب‌ترین نوع تونل را از گزینه‌های موجود انتخاب کنید.

انواع تونل موجود: ${tunnelTypes.join(', ')}

راهنمایی‌های تخصصی:
- برای سرورهای ایران، WireGuard بهترین تعادل سرعت و امنیت را ارائه می‌دهد. OpenVPN جایگزین خوبی است.
- از GRE/IPIP فقط زمانی استفاده کنید که رمزگذاری یا مخفی‌سازی نیاز نیست، معمولاً برای شبکه‌های داخلی تمیز.
- V2Ray (WS+TLS) بهترین انتخاب برای شبکه‌هایی با Deep Packet Inspection (DPI) یا سانسور سنگین است.
- Reverse Tunnel (via SSH) زمانی ضروری است که سرور مقصد پشت NAT یا فایروال باشد و پورت باز نداشته باشد.

بافت کاربر:
{{{context}}}

بر اساس بافت، بهترین نوع تونل و دلیل مختصر انتخابتان را به فارسی ارائه دهید.
`,
});

const suggestTunnelFlow = ai.defineFlow(
  {
    name: 'suggestTunnelFlow',
    inputSchema: SuggestTunnelInputSchema,
    outputSchema: SuggestTunnelOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
