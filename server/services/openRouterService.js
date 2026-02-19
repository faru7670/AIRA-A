import axios from 'axios';
import { env } from '../config/env.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function ensureKey() {
  if (!env.openRouterApiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured on server.');
  }
}

export async function requestChatCompletion({ model, messages }) {
  ensureKey();
  const { data } = await axios.post(
    OPENROUTER_URL,
    {
      model: model || env.openRouterModel,
      messages
    },
    {
      headers: {
        Authorization: `Bearer ${env.openRouterApiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 120000
    }
  );

  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenRouter returned an empty response.');
  }
  return content;
}

export async function streamChatCompletion({ model, messages, onDelta }) {
  ensureKey();
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.openRouterApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || env.openRouterModel,
      messages,
      stream: true
    })
  });

  if (!response.ok || !response.body) {
    const text = await response.text();
    throw new Error(`OpenRouter stream failed: ${text || response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const payload = line.replace(/^data:\s*/, '');
      if (payload === '[DONE]') return;
      try {
        const parsed = JSON.parse(payload);
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (delta) onDelta(delta);
      } catch {
        // ignore malformed server-sent events chunk
      }
    }
  }
}
