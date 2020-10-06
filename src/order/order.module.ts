import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { StateMachineModule } from 'src/state-machine';

@Module({
  imports: [StateMachineModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
