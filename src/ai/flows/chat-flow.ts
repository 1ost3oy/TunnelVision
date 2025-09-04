'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  message: z.string().describe('User message'),
  systemContext: z.object({
    servers: z.array(z.object({
      id: z.string(),
      name: z.string(),
      ipAddress: z.string(),
      username: z.string()
    })).optional(),
    tunnels: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      status: z.string()
    })).optional(),
    logs: z.array(z.object({
      type: z.string(),
      message: z.string()
    })).optional()
  }).describe('Current system state')
});

const ChatOutputSchema = z.object({
  response: z.string().describe('AI response in Persian'),
  suggestions: z.array(z.string()).optional().describe('Action suggestions')
});

export type ChatInput = z.infer<typeof ChatInputSchema>;
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chatWithAI(input: ChatInput): Promise<ChatOutput> {
  try {
    return await chatFlow(input);
  } catch (error: any) {
    if (error.status === 503) {
      return {
        response: 'متاسفانه سرویس AI در حال حاضر مشغول است. لطفاً چند لحظه دیگر تلاش کنید.',
        suggestions: ['دوباره تلاش کنید', 'سوال سادهتری بپرسید']
      };
    }
    throw error;
  }
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `شما TunnelVision AI هستید - دستیار هوشمند مدیریت تونل و شبکه.

## سیستم فعلی:
**سرورها**: {{{systemContext.servers}}}
**تونلها**: {{{systemContext.tunnels}}} 
**لاگها**: {{{systemContext.logs}}}

**پیام کاربر**: {{{message}}}

## دانش سیستم:
- **معماری**: Next.js + TypeScript + MongoDB + Gemini AI
- **تونلها**: WireGuard, OpenVPN, V2Ray, GRE, IPIP, SSH
- **SDN**: شبکه نرم‌افزار محور با کنترل خودکار
- **امنیت**: رمزگذاری end-to-end و مدیریت کلید
- **مانیتورینگ**: لاگ real-time و تحلیل عملکرد

## وظایف:
1. پاسخ دقیق و فنی به فارسی
2. استفاده از داده‌های real-time سیستم
3. پیشنهاد راه‌حل‌های عملی
4. تشخیص و حل مشکلات شبکه
5. بهینه‌سازی اتصالات و عملکرد`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
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