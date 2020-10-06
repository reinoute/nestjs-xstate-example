import { Module } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';
import { ConfigService } from '../config';
import { MemoryService } from './memory.service';

@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) =>
        configService.getRedisOptions(),
      inject: [ConfigService],
    }),
  ],
  providers: [MemoryService],
  exports: [MemoryService],
})
export class MemoryModule {}
