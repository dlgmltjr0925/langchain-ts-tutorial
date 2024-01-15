import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { RunnableBranch, RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { log } from '../utils/console';

const TEMPLATE1 = `Given the user question below, classify it as either being about \`LangChain\`, \`Anthropic\`, or \`Other\`.
                                     
Do not respond with more than one word.

<question>
{question}
</question>

Classification:`;
const promptTemplate = PromptTemplate.fromTemplate(TEMPLATE1);
const model = new ChatOllama({ temperature: 0.1 });

const classificationChain = RunnableSequence.from([
  promptTemplate,
  model,
  new StringOutputParser(),
]);

/**
 * RunnableBranch example
 */
// export const run = async () => {
//   const classificationChainResult = await classificationChain.invoke({
//     question: 'how do I call Anthropic?',
//   });

//   console.log(classificationChainResult);

//   const langChainChain = PromptTemplate.fromTemplate(
//     `You are an expert in langchain.
//   Always answer questions starting with "As Harrison Chase told me".
//   Respond to the following question:

//   Question: {question}
//   Answer:`
//   ).pipe(model);

//   const anthropicChain = PromptTemplate.fromTemplate(
//     `You are an expert in anthropic. \
//   Always answer questions starting with "As Dario Amodei told me". \
//   Respond to the following question:

//   Question: {question}
//   Answer:`
//   ).pipe(model);

//   const generalChain = PromptTemplate.fromTemplate(
//     `Respond to the following question:

//   Question: {question}
//   Answer:`
//   ).pipe(model);

//   const branch = RunnableBranch.from([
//     [
//       (x: { topic: string; question: string }) =>
//         x.topic.toLowerCase().includes('anthropic'),
//       anthropicChain,
//     ],
//     [
//       (x: { topic: string; question: string }) =>
//         x.topic.toLowerCase().includes('langchain'),
//       langChainChain,
//     ],
//     generalChain,
//   ]);

//   const fullChain = RunnableSequence.from([
//     {
//       topic: classificationChain,
//       question: (input: { question: string }) => input.question,
//     },
//     branch,
//   ]);

//   const result1 = await fullChain.invoke({
//     question: 'how do I use Anthropic?',
//   });

//   console.log(result1.content);

//   const result2 = await fullChain.invoke({
//     question: 'how do I use LangChain?',
//   });

//   console.log(result2.content);

//   const result3 = await fullChain.invoke({
//     question: 'what is 2 + 2?',
//   });

//   console.log(result3.content);
// };

/**
 * Custom function example
 */
export const run = async () => {
  const promptTemplate =
    PromptTemplate.fromTemplate(`Given the user question below, classify it as either being about \`LangChain\`, \`Anthropic\`, or \`Other\`.
                                     
  Do not respond with more than one word.
  
  <question>
  {question}
  </question>
  
  Classification:`);

  const model = new ChatOllama({ temperature: 0.1 });

  const classificationChain = RunnableSequence.from([
    promptTemplate,
    model,
    new StringOutputParser(),
  ]);

  const classificationChainResult = await classificationChain.invoke({
    question: 'How do I call Anthropic?',
  });

  console.log(classificationChainResult);

  const langChainChain = PromptTemplate.fromTemplate(
    `You are an expert in langchain.
  Always answer questions starting with "As Harrison Chase told me".
  Respond to the following question:
  
  Question: {question}
  Answer:`
  ).pipe(model);

  const anthropicChain = PromptTemplate.fromTemplate(
    `You are an expert in anthropic. \
  Always answer questions starting with "As Dario Amodei told me". \
  Respond to the following question:
  
  Question: {question}
  Answer:`
  ).pipe(model);

  const generalChain = PromptTemplate.fromTemplate(
    `Respond to the following question:
  
  Question: {question}
  Answer:`
  ).pipe(model);

  const route = ({ topic }: { input: string; topic: string }) => {
    if (topic.toLowerCase().includes('anthropic')) {
      return anthropicChain;
    } else if (topic.toLowerCase().includes('langchain')) {
      return langChainChain;
    } else {
      return generalChain;
    }
  };

  const fullChain = RunnableSequence.from([
    {
      topic: classificationChain,
      question: (input: { question: string }) => input.question,
    },
    route,
  ]);

  const result1 = await fullChain.invoke({
    question: 'how do I use Anthropic?',
  });

  console.log(result1);

  const result2 = await fullChain.invoke({
    question: 'how do I use LangChain?',
  });

  console.log(result2);

  const result3 = await fullChain.invoke({
    question: 'what is 2 + 2?',
  });

  console.log(result3);
};
