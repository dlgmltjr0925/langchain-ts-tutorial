import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { chatModel } from './chat-models';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { embeddings } from './embeddings';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { Document } from '@langchain/core/documents';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { createRetrieverTool } from 'langchain/tools/retriever';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { pull } from 'langchain/hub';
import { createOpenAIFunctionsAgent, AgentExecutor } from 'langchain/agents';
import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';

const loadSplitDocs = async (url: string) => {
  const loader = new CheerioWebBaseLoader(url);
  const splitter = new RecursiveCharacterTextSplitter();

  const docs = await loader.load();
  const splitDocs = await splitter.splitDocuments(docs);

  // console.log(docs.length);
  // console.log(docs[0].pageContent.length);

  // console.log(splitDocs.length);
  // console.log(splitDocs[0].pageContent.length);

  return splitDocs;
};

/*
const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a world class technical documentation writer.'],
  ['user', '{input}'],
]);

const chain = prompt.pipe(chatModel);

const run = async () => {
  const messageChunk = await chain.invoke({
    input: 'what is LangSmith?',
  });

  console.log(messageChunk.content);
};

run();
*/

/*
const outputParser = new StringOutputParser();

const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a world class technical documentation writer.'],
  ['user', '{input}'],
]);

const llmChain = prompt.pipe(chatModel).pipe(outputParser);

const run = async () => {
  const messageChunk = await llmChain.invoke({
    input: 'what is LangSmith?',
  });

  console.log(messageChunk);
};

run();
*/

/**
 * Retrieval Chain
 */
/*
export const run = async () => {
  const splitDocs = await loadSplitDocs(
    'https://docs.smith.langchain.com/overview'
  );
  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  );
  const prompt =
    ChatPromptTemplate.fromTemplate(`Answer the following question base only on the provided context:
  
  <context>
  {context}
  <context>
  
  Question: {input}`);

  const documentChain = await createStuffDocumentsChain({
    llm: chatModel,
    prompt,
  });

  // await documentChain.invoke({
  //   input: 'What is LangSmith?',
  //   context: [
  //     new Document({
  //       pageContent:
  //         'LangSmith is a platform for building production-grade LLM applications.',
  //     }),
  //   ],
  // });

  const retriever = vectorStore.asRetriever();

  const retrievalChain = await createRetrievalChain({
    combineDocsChain: documentChain,
    retriever,
  });

  const result = await retrievalChain.invoke({
    input: 'What is LangSmith?',
  });

  console.log(result.answer);
};
*/

/**
 * Conversation Retrieval Chain
 */
/*
export const run = async () => {
  const splitDocs = await loadSplitDocs(
    'https://docs.smith.langchain.com/overview'
  );
  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  );

  const retriever = vectorStore.asRetriever();

  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    new MessagesPlaceholder('chat_history'),
    ['user', '{input}'],
    [
      'user',
      'Given the above conversation, generate a search query to look up in order to get information relevant to the conversation',
    ],
  ]);

  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: chatModel,
    retriever,
    rephrasePrompt: historyAwarePrompt,
  });

  const chatHistory = [
    new HumanMessage('Can langSmith help test my LLM applications?'),
    new AIMessage('Yes!'),
  ];

  // const result = await historyAwareRetrieverChain.invoke({
  //   chat_history: chatHistory,
  //   input: 'Tell me how!',
  // });

  // console.log(result);

  const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `Answer the user's questions based on the below context:\n\n{context}`,
    ],
    new MessagesPlaceholder('chat_history'),
    ['user', '{input}'],
  ]);

  const historyAwareCombineDocsChain = await createStuffDocumentsChain({
    llm: chatModel,
    prompt: historyAwareRetrievalPrompt,
  });

  const conversationalRetrievalChain = await createRetrievalChain({
    retriever: historyAwareRetrieverChain,
    combineDocsChain: historyAwareCombineDocsChain,
  });

  const result2 = await conversationalRetrievalChain.invoke({
    chat_history: chatHistory,
    input: 'tell me how',
  });

  console.log(result2.answer);
};
*/

/**
 * Agent
 */

export const run = async () => {
  const splitDocs = await loadSplitDocs(
    'https://docs.smith.langchain.com/overview'
  );

  const embeddings = new OpenAIEmbeddings();

  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  );

  const retriever = vectorStore.asRetriever();

  const retrieverTool = await createRetrieverTool(retriever, {
    name: 'langsmith_search',
    description:
      'Search for information about LangSmith. For any questions about LangSmith, you must use this tool!',
  });

  const searchTool = new TavilySearchResults();

  const tools = [retrieverTool, searchTool];

  const agentPrompt = await pull<ChatPromptTemplate>(
    'hwchase17/openai-functions-agent'
  );

  const agentModel = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo-1106',
    temperature: 0,
  });

  const agent = await createOpenAIFunctionsAgent({
    llm: agentModel,
    tools,
    prompt: agentPrompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
  });

  const result = await agentExecutor.invoke({
    input: 'How can LangSmith help with testing?',
  });

  console.log(result.output);

  const agentResult2 = await agentExecutor.invoke({
    input: 'what is the weather in SF?',
  });

  console.log(agentResult2.output);

  const agentResult3 = await agentExecutor.invoke({
    chat_history: [
      new HumanMessage('Can LangSmith help test my LLM applications?'),
      new AIMessage('Yes!'),
    ],
    input: 'Tell me how',
  });

  console.log(agentResult3.output);
};
