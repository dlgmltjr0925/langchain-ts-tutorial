import { IterableReadableStream } from '@langchain/core/utils/stream';
import { BaseMessageChunk } from '@langchain/core/messages';

export const log = async (stream: IterableReadableStream<any>) => {
  for await (const chunk of stream) {
    const content = (chunk.content as string) ?? '';
    process.stdout.write(content);
  }
  process.stdout.write('\n');
};
