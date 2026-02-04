// src/modules/databases/shared/zip.utils.ts

import archiver from 'archiver';
import { Writable } from 'stream';
import type { GeneratedFile } from './generator.types';

/**
 * Create a ZIP buffer from generated files
 */
export async function createZipBuffer(files: GeneratedFile[], projectName: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    const writableStream = new Writable({
      write(chunk: Buffer, _encoding: string, callback: () => void) {
        chunks.push(chunk);
        callback();
      }
    });

    writableStream.on('finish', () => {
      resolve(Buffer.concat(chunks));
    });

    archive.on('error', (err: Error) => {
      reject(err);
    });

    archive.pipe(writableStream);

    // Add each file to the archive with project name prefix
    for (const file of files) {
      archive.append(file.content, { name: `${projectName}/${file.path}` });
    }

    archive.finalize();
  });
}
