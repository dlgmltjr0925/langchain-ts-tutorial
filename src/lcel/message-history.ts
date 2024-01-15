import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from '@langchain/core/prompts';
import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';
import { RedisChatMessageHistory } from '@langchain/community/stores/message/redis';

export const run = async () => {
  const model = new ChatOllama({
    model: 'llama2',
  });

  const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      `You're an assistant who's good at {ability}`
    ),
    new MessagesPlaceholder('history'),
    HumanMessagePromptTemplate.fromTemplate('{question}'),
  ]);

  const chain = prompt.pipe(model);

  const chainWithHistory = new RunnableWithMessageHistory({
    runnable: chain,
    getMessageHistory: (sessionId) =>
      new RedisChatMessageHistory({
        sessionId,
        config: {
          url: 'redis://192.168.100.24:6379',
        },
      }),
    inputMessagesKey: 'question',
    historyMessagesKey: 'history',
  });

  const result = await chainWithHistory.invoke(
    {
      ability: 'math',
      question: 'What does cosine mean?',
    },
    {
      configurable: {
        sessionId: 'foobarbaz',
      },
    }
  );

  console.log(result);

  const result2 = await chainWithHistory.invoke(
    {
      ability: 'math',
      question: "What's its inverse?",
    },
    {
      configurable: {
        sessionId: 'foobarbaz',
      },
    }
  );

  console.log(result2);
};
