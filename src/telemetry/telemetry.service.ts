import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SensorTelemetryDto } from './dto/sensor-telemetry.dto';
import { StructuredLogger } from '../common/logging';

@Injectable()
export class TelemetryService {
  constructor(private prisma: PrismaService) {}

  async saveReading(dto: SensorTelemetryDto, topicDeviceId?: string) {
    const deviceId = topicDeviceId || dto.deviceId;

    const reading = await this.prisma.sensorTelemetry.create({
      data: {
        deviceId,
        soilPercent: dto.soilPercent,
        tankWaterLevel: dto.tankWaterLevel ?? 0,
        airTemp: dto.airTemp,
        humidity: dto.humidity,
        waterTemp: dto.waterTemp,
        rainDetected: dto.rainDetected,
        motionDetected: dto.motionDetected ?? false,
        pumpState: dto.pumpState,
      },
    });

    StructuredLogger.info('Telemetry reading persisted', {
      deviceId,
      soilPercent: dto.soilPercent,
      pumpState: dto.pumpState,
    });

    return reading;
  }

  async getLatestReading(deviceId: string) {
    return this.prisma.sensorTelemetry.findFirst({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getHistory(deviceId: string, from?: Date, to?: Date, limit = 500) {
    const where: any = { deviceId };

    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = from;
      if (to) where.timestamp.lte = to;
    }

    const items = await this.prisma.sensorTelemetry.findMany({
      where,
      orderBy: { timestamp: 'asc' },
      take: limit,
    });

    return {
      deviceId,
      count: items.length,
      items,
    };
  }
}
