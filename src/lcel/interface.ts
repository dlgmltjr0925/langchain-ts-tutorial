import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { PromptTemplate } from '@langchain/core/prompts';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import {
  RunnableSequence,
  RunnablePassthrough,
} from '@langchain/core/runnables';
import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { formatDocumentsAsString } from 'langchain/util/document';
import { StringOutputParser } from '@langchain/core/output_parsers';

const model = new ChatOllama({
  temperature: 0.1,
});

const promptTemplate = PromptTemplate.fromTemplate(
  'Tell me a joke about {topic}'
);

export const print = async (stream: IterableReadableStream<any>) => {
  for await (const chunk of stream) {
    const content = (chunk.content as string) ?? '';
    process.stdout.write(content);
  }
  process.stdout.write('\n');
};

/**
 * Stream example
 */
// export const run = async () => {
//   const chain = promptTemplate.pipe(model);

//   const stream = await chain.stream({ topic: 'bears' });

//   print(stream);
// };

/**
 * Invoke example
 */
// export const run = async () => {
//   const chain = RunnableSequence.from([promptTemplate, model]);

//   const result = await chain.invoke({ topic: 'bears' });

//   console.log(result.content);
// };

/**
 * Batch exmaple
 */
// export const run = async () => {
//   const chain = promptTemplate.pipe(model);

//   const results = await chain.batch(
//     [{ topic: 'bears' }, { topic: 'cats' }],
//     {},
//     { returnExceptions: true, maxConcurrency: 1 }
//   );

//   console.log(results);
// };

/**
 * Stream log example
 */

export const run = async () => {
  const vectorStore = await HNSWLib.fromTexts(
    [
      'mitochondria is the powerhouse of the cell',
      'mitochondria is made of lipids',
    ],
    [{ id: 1 }, { id: 2 }],
    new OllamaEmbeddings({
      model: 'llama2',
      maxConcurrency: 5,
    })
  );

  const retriever = vectorStore.asRetriever();

  const SYSTEM_TEMPLATE = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
{context}`;
  const messages = [
    SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
    HumanMessagePromptTemplate.fromTemplate('{question}'),
  ];
  const prompt = ChatPromptTemplate.fromMessages(messages);
  const chain = RunnableSequence.from([
    {
      context: retriever.pipe(formatDocumentsAsString),
      question: new RunnablePassthrough(),
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  const streamLog = await chain.streamLog(
    'What is the powerhouse of the cell?'
  );

  for await (const chunk of streamLog) {
    console.log(JSON.stringify(chunk));
    console.log();
  }
};
