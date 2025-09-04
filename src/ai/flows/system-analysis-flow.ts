'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SystemAnalysisInputSchema = z.object({
  servers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    ipAddress: z.string(),
    status: z.string().optional()
  })),
  tunnels: z.array(z.object({
    id: z.string(),
    type: z.string(),
    status: z.string().optional(),
    server1Name: z.string(),
    server2Name: z.string()
  })),
  logs: z.array(z.object({
    type: z.string(),
    message: z.string()
  }))
});

const SystemAnalysisOutputSchema = z.object({
  healthScore: z.number().describe('System health score 0-100'),
  issues: z.array(z.string()).describe('Detected issues'),
  recommendations: z.array(z.string()).describe('Improvement recommendations'),
  summary: z.string().describe('Overall system summary in Persian')
});

export type SystemAnalysisInput = z.infer<typeof SystemAnalysisInputSchema>;
export type SystemAnalysisOutput = z.infer<typeof SystemAnalysisOutputSchema>;

export async function analyzeSystem(input: SystemAnalysisInput): Promise<SystemAnalysisOutput> {
  return systemAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'systemAnalysisPrompt',
  input: {schema: SystemAnalysisInputSchema},
  output: {schema: SystemAnalysisOutputSchema},
  prompt: `شما متخصص تحلیل سیستم TunnelVision هستید. وضعیت کامل سیستم را تحلیل کنید:

سرورها: {{{servers}}}
تونلها: {{{tunnels}}}
لاگهای اخیر: {{{logs}}}

تحلیل کنید:
1. امتیاز سلامت کلی (0-100)
2. مشکلات موجود
3. پیشنهادات بهبود
4. خلاصه وضعیت

معیارهای ارزیابی:
- تعداد سرورهای فعال
- وضعیت تونلها
- خطاهای اخیر در لاگ
- تنوع جغرافیایی سرورها
- امنیت اتصالات`,
});

const systemAnalysisFlow = ai.defineFlow(
  {
    name: 'systemAnalysisFlow',
    inputSchema: SystemAnalysisInputSchema,
    outputSchema: SystemAnalysisOutputSchema,
  },
  async input => {
    let retries = 3;
    while (retries > 0) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (error: any) {
        retries--;
        if (error.status === 503 && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }
);