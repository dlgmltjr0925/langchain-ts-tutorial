import { ChatOllama } from '@langchain/community/chat_models/ollama';

export const chatModel = new ChatOllama({
  baseUrl: 'http://localhost:11434',
  model: 'llama2',
  temperature: 0.1,
});
