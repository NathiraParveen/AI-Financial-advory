import { OpenAI } from 'openai';
import prisma from '@/db/client';
import logger from '@/utils/logger';
import AIMetrics from '@/utils/aiMetrics';

interface ChatContext {
  portfolio?: any;
  goals?: any[];
  history: any[];
}

export class ChatService {
  private _openai: OpenAI | null = null;

  private get openai(): OpenAI {
    if (!this._openai) {
      const model = process.env.OPENAI_MODEL || 'gpt-4'
      const baseURL = process.env.OPENAI_BASE_URL
        ? `${process.env.OPENAI_BASE_URL}/openai/deployments/${model}`
        : undefined
      this._openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        ...(baseURL && {
          baseURL,
          defaultHeaders: { 'Api-Key': process.env.OPENAI_API_KEY },
          defaultQuery: { 'api-version': '2024-02-01' },
        }),
      });
    }
    return this._openai;
  }

  async processMessage(
    userId: string,
    message: string,
    conversationId?: string
  ): Promise<{ message: string; conversationId: string; tokens: { input: number; output: number } }> {
    const startTime = Date.now();
    let tokens = { input: 0, output: 0 };

    try {
      // Get or create conversation
      let convId = conversationId;
      if (!convId) {
        const conv = await prisma.chatConversation.create({
          data: { userId },
        });
        convId = conv.id;
      }

      // Fetch user context
      const context = await this.getUserContext(userId);

      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(context);

      // Get conversation history
      const history = await this.getChatHistory(convId, 10);

      // Build messages array
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...history.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user' as const, content: message },
      ];

      // Call OpenAI API
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages,
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
      });

      const assistantMessage = response.choices[0].message.content || '';
      tokens = {
        input: response.usage?.prompt_tokens || 0,
        output: response.usage?.completion_tokens || 0,
      };

      // Store messages
      await this.storeMessage(convId, 'user', message, tokens.input);
      await this.storeMessage(convId, 'assistant', assistantMessage, tokens.output);

      // Log usage
      const latencyMs = Date.now() - startTime;
      await AIMetrics.trackUsage(userId, 'chat', tokens.input, tokens.output, latencyMs, 'success');

      logger.info({
        message: 'Chat message processed',
        userId,
        conversationId: convId,
        latencyMs,
        tokens,
      });

      return {
        message: assistantMessage,
        conversationId: convId,
        tokens,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      logger.error('Chat processing error:', error);
      await AIMetrics.trackUsage(userId, 'chat', 0, 0, latencyMs, 'error', String(error));
      throw error;
    }
  }

  private async getUserContext(userId: string): Promise<ChatContext> {
    try {
      const portfolios = await prisma.portfolio.findMany({
        where: { userId },
        include: {
          holdings: true,
        },
        take: 1,
      });

      const goals = await prisma.savingsGoal.findMany({
        where: {
          savings: {
            userId,
          },
        },
        take: 5,
      });

      return {
        portfolio: portfolios[0],
        goals,
        history: [],
      };
    } catch (error) {
      logger.error('Error fetching user context:', error);
      return { portfolio: undefined, goals: [], history: [] };
    }
  }

  private buildSystemPrompt(context: ChatContext): string {
    const portfolioInfo = context.portfolio
      ? `\nUser Portfolio Summary:
- Portfolio Name: ${context.portfolio.name}
- Total Value: $${context.portfolio.totalValue?.toLocaleString() || 0}
- Number of Holdings: ${context.portfolio.holdings?.length || 0}`
      : '';

    const goalsInfo =
      context.goals && context.goals.length > 0
        ? `\nFinancial Goals:
${context.goals
  .map(
    (g) =>
      `- ${g.name}: $${g.targetAmount?.toLocaleString() || 0} by ${
        g.targetDate ? new Date(g.targetDate).toLocaleDateString() : 'TBD'
      }`
  )
  .join('\n')}`
        : '';

    return `You are an expert financial advisor AI assistant for an investment advisory platform.

Your role:
- Provide personalized financial advice based on the user's portfolio and goals
- Explain concepts in simple, non-technical terms
- Always include appropriate risk disclaimers
- Suggest concrete, actionable steps
- Consider tax implications when relevant
- Reference specific holdings when applicable

User Financial Profile:${portfolioInfo}${goalsInfo}

Important Guidelines:
1. You are NOT a substitute for professional financial advice
2. Always include risk disclaimers for significant recommendations
3. Explain your reasoning clearly
4. Ask clarifying questions if needed
5. Provide confidence level (low/medium/high) for recommendations
6. Consider both short-term and long-term implications
7. Be transparent about any assumptions you're making

Maintain a professional but friendly tone. Keep responses concise but thorough.`;
  }

  private async getChatHistory(conversationId: string, limit: number = 10): Promise<any[]> {
    try {
      return await prisma.chatMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        take: limit,
      });
    } catch (error) {
      logger.error('Error fetching chat history:', error);
      return [];
    }
  }

  private async storeMessage(
    conversationId: string,
    role: string,
    content: string,
    tokens?: number
  ): Promise<void> {
    try {
      await prisma.chatMessage.create({
        data: {
          conversationId,
          role,
          content,
          tokens,
        },
      });
    } catch (error) {
      logger.error('Error storing chat message:', error);
    }
  }

  async getConversationHistory(conversationId: string): Promise<any[]> {
    try {
      return await prisma.chatMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      logger.error('Error fetching conversation history:', error);
      throw error;
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      await prisma.chatConversation.delete({
        where: { id: conversationId },
      });
    } catch (error) {
      logger.error('Error deleting conversation:', error);
      throw error;
    }
  }

  async listUserConversations(userId: string, limit: number = 20): Promise<any[]> {
    try {
      return await prisma.chatConversation.findMany({
        where: { userId },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      logger.error('Error listing conversations:', error);
      throw error;
    }
  }
}

export default new ChatService();
