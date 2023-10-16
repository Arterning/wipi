import * as Minio from 'minio';

import minioConfig from './minio.config';
import { OssClient } from './oss-client';

export class MiniOssClient extends OssClient {
  deleteFile(url: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  async putFile(filepath: string, buffer: ReadableStream): Promise<string> {
    const client = this.buildClient();
    try {
      const bucketName = (this.config.bucket as string) || 'xiaohui';
      const objectName = bucketName + new Date().getTime() + '.png';
      await client.putObject(bucketName, objectName, buffer);
      return `http://${minioConfig.endPoint}/${bucketName}/${objectName}`;
    } catch (error) {
      throw new Error(`Minio upload error: ${error}`);
    }
  }

  private buildClient() {
    const config = this.config;
    const client = new Minio.Client({
      endPoint: 'localhost',
      port: 9000,
      useSSL: false,
      accessKey: (config.accessKeyId as string) || 'minioadmin',
      secretKey: (config.accessKeySecret as string) || 'minioadmin',
    });
    return client;
  }
}
