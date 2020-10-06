import { Module } from '@nestjs/common';

import { MemoryModule } from '../memory';
import { StateMachineService } from './state-machine.service';

@Module({
  imports: [MemoryModule],
  providers: [StateMachineService],
  exports: [StateMachineService],
})
export class StateMachineModule {}
