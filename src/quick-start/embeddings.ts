import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';

export const embeddings = new OllamaEmbeddings({
  model: 'llama2',
  maxConcurrency: 5,
});
