import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [ConfigModule, OrderModule],
})
export class AppModule {}
