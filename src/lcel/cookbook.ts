import {
  ChatOllama,
  ChatOllamaCallOptions,
} from '@langchain/community/chat_models/ollama';
import { OllamaFunctions } from 'langchain/experimental/chat_models/ollama_functions';

import {
  ChatPromptTemplate,
  PromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  AIMessagePromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { log } from '../utils/console';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  RunnableSequence,
  RunnablePassthrough,
} from '@langchain/core/runnables';
import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { formatDocumentsAsString } from 'langchain/util/document';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { DataSource } from 'typeorm';
import { SqlDatabase } from 'langchain/sql_db';
import { BufferMemory } from 'langchain/memory';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { ChatAnthropic } from '@langchain/anthropic';
import { AgentExecutor } from 'langchain/agents';
import { formatXml } from 'langchain/agents/format_scratchpad/xml';
import { XMLAgentOutputParser } from 'langchain/agents/xml/output_parser';
import { AgentStep } from 'langchain/schema';
import { Tool, ToolParams } from 'langchain/tools';
import { renderTextDescription } from 'langchain/tools/render';

/**
 * PromptTemplate + LLM
 */

/**
 * Basic
 */
// export const run = async () => {
//   const model = new ChatOllama({
//     temperature: 0.1,
//   });
//   const promptTemplate = PromptTemplate.fromTemplate(
//     'Tell me a joke about {topic} in Korean'
//   );

//   const chain = promptTemplate.pipe(model);

//   const stream = await chain.stream({ topic: 'bears' });

//   log(stream);
// };

/**
 * Attaching stop sequences
 */
// export const run = async () => {
//   const model = new ChatOllama({
//     temperature: 0.1,
//   });
//   const promptTemplate = PromptTemplate.fromTemplate(
//     'Tell me a joke about {topic}'
//   );

//   // stop;;;
//   const chain = promptTemplate.pipe(model.bind({ stop: ['\n'] }));

//   const stream = await chain.stream({ topic: 'bears' });

//   log(stream);
// };

/**
 * Attaching function call information
 */
// export const run = async () => {
//   const prompt = PromptTemplate.fromTemplate('Tell me a joke about {subject}');
//   const model = new OllamaFunctions({
//     temperature: 0.1,
//     model: 'llama2',
//     maxConcurrency: 5,
//   });
//   const functions = [
//     {
//       name: 'joke',
//       description: 'A Joke',
//       parameters: {
//         type: 'object',
//         properties: {
//           setup: {
//             type: 'string',
//             description: 'The setup for the joke',
//           },
//           punchline: {
//             type: 'string',
//             description: 'The punchline for the joke',
//           },
//         },
//         required: ['setup', 'punchline'],
//       },
//     },
//   ];

//   const chain = prompt.pipe(
//     model.bind({
//       functions,
//       function_call: { name: 'joke' },
//     })
//   );

//   const result = await chain.invoke({ subject: 'bears' });

//   console.log(result);
// };

/**
 * PromptTemplate + LLM + OutputParser
 */
// export const run = async () => {
//   const model = new ChatOllama({ temperature: 0.1, model: 'llama2' });
//   const promptTemplate = PromptTemplate.fromTemplate(
//     'Tell me a joke about {topic}'
//   );
//   const outputParser = new StringOutputParser();
//   const chain = RunnableSequence.from([promptTemplate, model, outputParser]);
//   const result = await chain.invoke({ topic: 'bears' });
//   console.log(result);
// };

/**
 * Multiple chains
 */
// export const run = async () => {
//   const prompt1 = PromptTemplate.fromTemplate(
//     'What is the city {person} is from? Only respond with the name of the city.'
//   );
//   const prompt2 = PromptTemplate.fromTemplate(
//     'What country is the city {city} in? Respond in {language}.'
//   );

//   const model = new ChatOllama({ model: 'llama2', temperature: 0.1 });

//   const stringOutputParser = new StringOutputParser();

//   const chain = prompt1.pipe(model).pipe(stringOutputParser);

//   const combinedChain = RunnableSequence.from([
//     {
//       city: chain,
//       language: (input) => input.language,
//     },
//     prompt2,
//     model,
//     stringOutputParser,
//   ]);

//   const result = await combinedChain.invoke({
//     person: 'Obama',
//     language: 'Korean',
//   });

//   console.log(result);
// };

/**
 * Retrieval augmented generation
 */

/**
 * Text RAG
 */
// export const run = async () => {
//   const model = new ChatOllama({ temperature: 0.1 });
//   const embeddings = new OllamaEmbeddings({
//     model: 'llama2',
//     maxConcurrency: 5,
//   });

//   const vectorStore = await HNSWLib.fromTexts(
//     [
//       'There are eggs, milk, and kiwi in the refrigerator!',
//       'There are water in the refrigerator!',
//       'There are oyster sauce in the refrigerator!',
//       'There are frozen strawberries in the refrigerator!',
//     ],
//     [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
//     embeddings
//   );

//   const retriever = vectorStore.asRetriever();
//   const prompt =
//     PromptTemplate.fromTemplate(`Answer the question based only on the following context:
//   {context}

//   Question: {question}`);

//   const chain = RunnableSequence.from([
//     {
//       context: retriever.pipe(formatDocumentsAsString),
//       question: new RunnablePassthrough(),
//     },
//     prompt,
//     model,
//     new StringOutputParser(),
//   ]);

//   const result = await chain.invoke(
//     `Tell me everything that’s in the refrigerator?`
//   );

//   console.log(result);
// };

/**
 * Conversational Retrieval Chain
 */
// type ConversationalRetrievalQAChainInput = {
//   question: string;
//   chat_history: [string, string][];
// };

// const formatChatHistory = (chatHistory: [string, string][]) => {
//   const formattedDialogueTurns = chatHistory.map(
//     (dialogueTurn) => `Human: ${dialogueTurn[0]}\nAssistant: ${dialogueTurn[1]}`
//   );
//   return formattedDialogueTurns.join('\n');
// };

// export const run = async () => {
//   const model = new ChatOpenAI({ temperature: 0.1 });
//   const condenseQuestionTemplate = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

//   Chat History:
//   {chat_history}
//   Follow Up Input: {question}
//   Standalone question:`;

//   const CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(
//     condenseQuestionTemplate
//   );

//   const answerTemplate = `Answer the question based only on the following context:
//   {context}

//   Question: {question}`;
//   const ANSWER_PROMPT = PromptTemplate.fromTemplate(answerTemplate);

//   const embeddings = new OpenAIEmbeddings({});

//   const vectorStore = await HNSWLib.fromTexts(
//     [
//       'mitochondria is the powerhouse of the cell',
//       'mitochondria is made of lipids',
//     ],
//     [{ id: 1 }, { id: 2 }],
//     embeddings
//   );

//   const retriever = vectorStore.asRetriever();

//   const standaloneQuestionChain = RunnableSequence.from([
//     {
//       question: (input: ConversationalRetrievalQAChainInput) => input.question,
//       chat_history: (input: ConversationalRetrievalQAChainInput) =>
//         formatChatHistory(input.chat_history),
//     },
//     CONDENSE_QUESTION_PROMPT,
//     model,
//     new StringOutputParser(),
//   ]);

//   const answerChain = RunnableSequence.from([
//     {
//       context: retriever.pipe(formatDocumentsAsString),
//       question: new RunnablePassthrough(),
//     },
//     ANSWER_PROMPT,
//     model,
//   ]);

//   const conversationalRetrievalQAChain =
//     standaloneQuestionChain.pipe(answerChain);

//   const result1 = await conversationalRetrievalQAChain.invoke({
//     question: 'What is the powerhouse of the cell',
//     chat_history: [],
//   });
//   console.log(result1);

//   const result2 = await conversationalRetrievalQAChain.invoke({
//     question: 'What are they made out of?',
//     chat_history: [
//       [
//         'What is the powerhouse of the cell?',
//         'The powerhouse of the cell is the mitochondria.',
//       ],
//     ],
//   });
//   console.log(result2);
// };

/**
 * Querying a SQL DB
 */
// export const run = async () => {
//   const datasource = new DataSource({
//     type: 'sqlite',
//     database: 'Chinook.db',
//   });

//   const db = await SqlDatabase.fromDataSourceParams({
//     appDataSource: datasource,
//   });

//   const prompt =
//     PromptTemplate.fromTemplate(`Based on the table schema below, write a SQL query that would answer the user's question:
//   {schema}

//   Question: {question}
//   SQL Query:`);

//   const model = new ChatOpenAI({ temperature: 0.1 });

//   const sqlQueryGeneratorChain = RunnableSequence.from([
//     RunnablePassthrough.assign({
//       schema: async () => db.getTableInfo(),
//     }),
//     prompt,
//     model,
//     new StringOutputParser(),
//   ]);

//   const result = await sqlQueryGeneratorChain.invoke({
//     question: 'How many "employees" are there?',
//   });

//   console.log(result);

//   const finalResponsePrompt =
//     PromptTemplate.fromTemplate(`Based on the table schema below, question, sql query, and sql response, write a natural language response:
//   {schema}

//   Question: {question}
//   SQL Query: {query}
//   SQL Response: {response}`);

//   const fullChain = RunnableSequence.from([
//     RunnablePassthrough.assign({
//       query: sqlQueryGeneratorChain,
//     }),
//     {
//       schema: async () => db.getTableInfo(),
//       question: (input) => input.question,
//       query: (input) => input.query,
//       response: (input) => db.run(input.query),
//     },
//     finalResponsePrompt,
//     model,
//   ]);

//   const finalResponse = await fullChain.invoke({
//     question: 'How many employees are there?',
//   });

//   console.log(finalResponse);
// };

/**
 * Adding memory
 */
// export const run = async () => {
//   const model = new ChatOllama({ temperature: 0.1, model: 'llama2' });
//   const prompt = ChatPromptTemplate.fromMessages([
//     SystemMessagePromptTemplate.fromTemplate('You are a helpful chatbot'),
//     new MessagesPlaceholder('history'),
//     HumanMessagePromptTemplate.fromTemplate('{input}'),
//   ]);
//   const memory = new BufferMemory({
//     returnMessages: true,
//     inputKey: 'input',
//     outputKey: 'output',
//     memoryKey: 'history',
//   });

//   console.log(await memory.loadMemoryVariables({}));

//   const chain = RunnableSequence.from([
//     {
//       input: (initialInput) => initialInput.input,
//       memory: () => memory.loadMemoryVariables({}),
//     },
//     {
//       input: (previousOutput) => previousOutput.input,
//       history: (previousOutput) => previousOutput.memory.history,
//     },
//     prompt,
//     model,
//   ]);

//   const inputs = {
//     input: "Hey, I'm Bob!",
//   };

//   const response = await chain.invoke(inputs);

//   console.log(response);

//   await memory.saveContext(inputs, {
//     output: response.content,
//   });

//   console.log(await memory.loadMemoryVariables({}));

//   const inputs2 = {
//     input: "What's my name?",
//   };

//   const response2 = await chain.invoke(inputs2);

//   console.log(response2);
// };

/**
 * Using tools
 */
// export const run = async () => {
//   const search = new TavilySearchResults();

//   const prompt =
//     PromptTemplate.fromTemplate(`Turn the following user input into a search query for a search engine:

//   {input}`);

//   const model = new ChatOllama({ temperature: 0.1, model: 'llama2' });

//   const chain = prompt.pipe(model).pipe(new StringOutputParser()).pipe(search);

//   const result = await chain.invoke({
//     input: 'Who is the current prime minister of Malaysia?',
//   });

//   console.log(result);
// };

/**
 * Agent example
 */
class SearchTool extends Tool {
  static lc_name(): string {
    return 'SearchTool';
  }

  name = 'search-tool';

  description = 'This tool preforms a search about things and whatnot.';

  constructor(config?: ToolParams) {
    super(config);
  }

  async _call(_: string) {
    return '32 degrees';
  }
}

interface Input {
  input: string;
  tools: Tool[];
  steps: AgentStep[];
}

export const run = async () => {
  const model = new ChatOllama({ temperature: 0.1 }).bind({
    stop: ['</tool_input>', '</final_answer>'],
  });

  const tools = [new SearchTool()];

  const template = `You are a helpful assistant. Help the user answer any questions.

  You have access to the following tools:
  
  {tools}
  
  In order to use a tool, you can use <tool></tool> and <tool_input></tool_input> tags. \
  You will then get back a response in the form <observation></observation>
  For example, if you have a tool called 'search' that could run a google search, in order to search for the weather in SF you would respond:
  
  <tool>search</tool><tool_input>weather in SF</tool_input>
  <observation>64 degrees</observation>
  
  When you are done, respond with a final answer between <final_answer></final_answer>. For example:
  
  <final_answer>The weather in SF is 64 degrees</final_answer>
  
  Begin!
  
  Question: {input}`;

  const prompt = ChatPromptTemplate.fromMessages([
    HumanMessagePromptTemplate.fromTemplate(template),
    AIMessagePromptTemplate.fromTemplate('{agent_scratchpad}'),
  ]);

  const outputParser = new XMLAgentOutputParser();

  const runnableAgent = RunnableSequence.from([
    {
      input: (i: Input) => i.input,
      tools: (i: Input) => renderTextDescription(i.tools),
      agent_scratchpad: (i: Input) => formatXml(i.steps),
    },
    prompt,
    model,
    outputParser,
  ]);

  const executor = AgentExecutor.fromAgentAndTools({
    agent: runnableAgent,
    tools,
  });

  console.log('Loaded executor');
  const input = 'What is the weather in SF?';
  console.log(`Calling executor with input: ${input}`);
  const response = await executor.invoke({ input, tools });
  console.log(response);
};
