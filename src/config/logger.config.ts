import { randomUUID } from 'node:crypto';

import type { Params } from 'nestjs-pino';

import type { EnvironmentVariables } from './environment.schema.js';

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

export function createLoggerConfig(environment: EnvironmentVariables['NODE_ENV']): Params {
  return {
    pinoHttp: {
      level: environment === 'test' ? 'silent' : 'info',
      genReqId(request, response) {
        const candidate = request.headers['x-request-id'];
        const requestId =
          typeof candidate === 'string' && REQUEST_ID_PATTERN.test(candidate)
            ? candidate
            : randomUUID();
        response.setHeader('x-request-id', requestId);
        return requestId;
      },
      redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'req.headers["set-cookie"]'],
        censor: '[REDACTED]',
      },
      ...(environment === 'development'
        ? { transport: { target: 'pino-pretty', options: { colorize: true, singleLine: true } } }
        : {}),
    },
  };
}
