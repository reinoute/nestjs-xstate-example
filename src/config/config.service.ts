import { Injectable } from '@nestjs/common';
import { RedisOptions } from 'ioredis';

@Injectable()
export class ConfigService {
  getRedisOptions(): RedisOptions {
    return {
      host: 'localhost',
      port: 6379,
      reconnectOnError: (): boolean => true,
      maxRetriesPerRequest: 100,
    };
  }
}
