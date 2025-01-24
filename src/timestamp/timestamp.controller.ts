import { Controller } from '@nestjs/common';
import { TimestampService } from './timestamp.service';

@Controller('timestamp')
export class TimestampController {
  constructor(private readonly timestampService: TimestampService) {}
}
