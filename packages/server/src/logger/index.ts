import * as fs from 'fs-extra';
import * as log4js from 'log4js';
import { join } from 'path';

const LOG_DIR_NAME = '../../logs';

/**
 * 确保当前文件所在目录下的 'logs' 目录中包含了 'request'、'response' 和 'error' 三个子目录。
 * 如果这些子目录不存在，则会创建它们；如果已经存在，则不做任何操作。
 * 这样在后续的日志记录操作中，就可以直接往这些子目录中写入日志，而不用再关心目录的创建问题。
 */
fs.ensureDirSync(join(__dirname, LOG_DIR_NAME));
void ['request', 'response', 'error'].forEach((t) => {
  fs.ensureDirSync(join(__dirname, LOG_DIR_NAME, t));
});

const resolvePath = (dir, filename) => join(__dirname, LOG_DIR_NAME, dir, filename);

const commonCinfig = {
  type: 'dateFile',
  pattern: '-yyyy-MM-dd.log',
  alwaysIncludePattern: true,
};

log4js.configure({
  appenders: {
    request: {
      ...commonCinfig,
      filename: resolvePath('request', 'request.log'),
      category: 'request',
    },
    response: {
      ...commonCinfig,
      filename: resolvePath('response', 'response.log'),
      category: 'response',
    },
    error: {
      ...commonCinfig,
      filename: resolvePath('error', 'error.log'),
      category: 'error',
    },
  },
  categories: {
    default: { appenders: ['request'], level: 'info' },
    response: { appenders: ['response'], level: 'info' },
    error: { appenders: ['error'], level: 'info' },
  },
});

export const requestLogger = log4js.getLogger('request');
export const responseLogger = log4js.getLogger('response');
export const errorLogger = log4js.getLogger('error');
