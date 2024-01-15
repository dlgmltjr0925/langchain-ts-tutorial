import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { RunnableMap } from '@langchain/core/runnables';
import { PromptTemplate } from '@langchain/core/prompts';
import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { Document } from '@langchain/core/documents';
import {
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';

// const model = new ChatOllama({});
// const jokeChain = PromptTemplate.fromTemplate(
//   'Tell me a joke about {topic}'
// ).pipe(model);
// const poemChain = PromptTemplate.fromTemplate(
//   'write a 2-line poem about {topic}'
// ).pipe(model);

// const mapChain = RunnableMap.from({
//   joke: jokeChain,
//   poem: poemChain,
// });

// export const run = async () => {
//   const result = await mapChain.invoke({ topic: 'bear' });
//   console.log(result);
// };

/**
 * Manipulating outputs/inputs exmaple
 */
const formatDocs = (docs: Document[]) => docs.map((doc) => doc.pageContent);

export const run = async () => {
  const model = new ChatOllama({});
  const vectorStore = await HNSWLib.fromDocuments(
    [
      {
        pageContent: 'mitochondria is the powerhouse of the cell',
        metadata: {},
      },
    ],
    new OllamaEmbeddings({ model: 'llama2', maxConcurrency: 5 })
  );
  const retriever = vectorStore.asRetriever();
  const template = `Answer the question based only on the following context:
  {context}
  
  Question: {question}`;

  const prompt = PromptTemplate.fromTemplate(template);

  const retrievalChain = RunnableSequence.from([
    {
      context: retriever.pipe(formatDocs),
      question: new RunnablePassthrough(),
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  const result = await retrievalChain.invoke(
    'What is the powerhouse of the cell?'
  );
  console.log(result);
};
