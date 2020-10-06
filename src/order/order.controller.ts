import { Controller, Get } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('create')
  async create(): Promise<void> {
    // create order with static data
    await this.orderService.create({
      userId: 1,
      productCode: 'exampleProductCode',
    });
  }

  @Get('approve')
  async approve(): Promise<void> {
    // approve order with static data
    await this.orderService.approve({
      userId: 1,
      approvalCode: 'exampleApprovalCode',
    });
  }

  @Get('reject')
  async reject(): Promise<void> {
    // reject order with static data
    await this.orderService.reject({ userId: 1 });
  }

  @Get('cancel')
  async cancel(): Promise<void> {
    // reject order with static data
    await this.orderService.cancel({ userId: 1, reasonCancelled: 'Whatever' });
  }
}
