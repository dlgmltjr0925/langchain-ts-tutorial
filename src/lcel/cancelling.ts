import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { PromptTemplate } from '@langchain/core/prompts';
import { log } from '../utils/console';

const controller = new AbortController();

const llm = new ChatOllama({ temperature: 0.9 });
const model = llm.bind({ signal: controller.signal });
const prompt = PromptTemplate.fromTemplate(
  'Please write a 500 word essay about {topic}'
);
const chain = prompt.pipe(model);

export const run = async () => {
  setTimeout(() => {
    controller.abort();
  }, 30000);

  try {
    const stream = await chain.stream({ topic: 'Bonobos' });
    log(stream);
  } catch (error) {
    console.log(error);
  }
};
