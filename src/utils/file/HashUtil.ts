// utils/hash.ts
import CryptoJS from 'crypto-js';

/**
 * 计算文件的哈希值（支持大文件分片）
 * @param file 文件对象
 * @param algorithm 哈希算法：MD5、SHA1、SHA256
 * @param chunkSize 分片大小（默认 2MB）
 */
export function calculateFileHash(
  file: File,
  algorithm: 'MD5' | 'SHA1' | 'SHA256' = 'MD5',
  chunkSize: number = 2 * 1024 * 1024
): Promise<string> {
  return new Promise((resolve, reject) => {
    const algo = CryptoJS.algo[algorithm].create();
    const reader = new FileReader();
    let offset = 0;

    const readChunk = () => {
      const slice = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(slice);
    };

    reader.onload = () => {
      const wordArray = CryptoJS.lib.WordArray.create(reader.result as ArrayBuffer);
      algo.update(wordArray);
      offset += chunkSize;

      if (offset < file.size) {
        readChunk();
      } else {
        const hash = algo.finalize().toString();
        resolve(hash);
      }
    };

    reader.onerror = reject;
    readChunk();
  });
}