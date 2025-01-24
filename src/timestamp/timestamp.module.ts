import { Module } from '@nestjs/common';
import { TimestampService } from './timestamp.service';
import { TimestampController } from './timestamp.controller';

@Module({
  controllers: [TimestampController],
  providers: [TimestampService],
})
export class TimestampModule {}
