import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { TelemetryService } from './telemetry.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HistoryQueryDto } from './dto/history-query.dto';

@Controller('telemetry')
@UseGuards(JwtAuthGuard)
export class TelemetryRestController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Get('latest')
  async getLatest(
    @Query('deviceId') deviceId: string,
    @Res() res: Response,
  ) {
    const reading = await this.telemetryService.getLatestReading(deviceId);
    if (!reading) {
      return res.status(204).send();
    }
    return res.json(reading);
  }

  @Get('history')
  async getHistory(@Query() query: HistoryQueryDto) {
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    const limit = query.limit || 500;

    return this.telemetryService.getHistory(query.deviceId, from, to, limit);
  }
}
