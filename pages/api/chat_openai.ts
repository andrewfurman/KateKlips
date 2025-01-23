
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.deepseek.com/v1'
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Set headers for streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const stream = await openai.chat.completions.create({
      messages: req.body.messages,
      model: "deepseek-chat",
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        // Ensure proper SSE format
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
        // Flush the response to ensure immediate sending
        res.flush?.();
      }
    }

    res.end();
  } catch (error: any) {
    console.error('Error:', error);
    const message = error.message || 'Error processing your request';
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
}
