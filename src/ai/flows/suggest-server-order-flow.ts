'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestServerOrderInputSchema = z.object({
  servers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    ipAddress: z.string()
  })).describe('List of available servers'),
  context: z.string().describe('User context for server ordering')
});

const SuggestServerOrderOutputSchema = z.object({
  orderedServerIds: z.array(z.string()).describe('Server IDs in optimal order: [source, intermediate, destination]'),
  reason: z.string().describe('Explanation for the server ordering in Persian')
});

export type SuggestServerOrderInput = z.infer<typeof SuggestServerOrderInputSchema>;
export type SuggestServerOrderOutput = z.infer<typeof SuggestServerOrderOutputSchema>;

export async function suggestServerOrder(input: SuggestServerOrderInput): Promise<SuggestServerOrderOutput> {
  return suggestServerOrderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestServerOrderPrompt',
  input: {schema: SuggestServerOrderInputSchema},
  output: {schema: SuggestServerOrderOutputSchema},
  prompt: `شما متخصص شبکه هستید. وظیفه شما تعیین بهترین ترتیب سرورها برای combined tunnel است.

قوانین:
- سرور اول: Source (منبع)
- سرور دوم: Intermediate (واسط) 
- سرور سوم: Destination (مقصد)

راهنماییها:
- سرور ایران معمولاً بهتر است Source باشد
- سرور اروپا/آمریکا بهتر است Destination باشد
- سرور با بهترین اتصال بین دو سرور دیگر، Intermediate مناسبی است

سرورهای موجود:
{{{servers}}}

بافت کاربر:
{{{context}}}

بهترین ترتیب سرورها را تعیین کنید و دلیل انتخابتان را به فارسی توضیح دهید.`,
});

const suggestServerOrderFlow = ai.defineFlow(
  {
    name: 'suggestServerOrderFlow',
    inputSchema: SuggestServerOrderInputSchema,
    outputSchema: SuggestServerOrderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);