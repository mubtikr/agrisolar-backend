import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, MqttContext } from '@nestjs/microservices';
import { TelemetryService } from './telemetry.service';
import { SensorTelemetryDto } from './dto/sensor-telemetry.dto';
import { StructuredLogger } from '../common/logging';

@Controller()
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @MessagePattern('farm/+/sensors')
  async handleTelemetry(@Payload() payload: any, @Ctx() context: MqttContext) {
    const topic = context.getTopic();
    const topicParts = topic.split('/');
    const deviceId = topicParts[1];

    try {
      const dto = new SensorTelemetryDto();
      dto.deviceId = payload.deviceId || deviceId;
      dto.soilPercent = payload.soilPercent;
      dto.airTemp = payload.airTemp;
      dto.humidity = payload.humidity;
      dto.waterTemp = payload.waterTemp;
      dto.rainDetected = payload.rainDetected;
      dto.motionDetected = payload.motionDetected ?? false;
      dto.pumpState = payload.pumpState;

      await this.telemetryService.saveReading(dto, deviceId);
    } catch (error) {
      StructuredLogger.warn('Malformed telemetry payload rejected', {
        deviceId,
        error: error.message,
      });
    }
  }
}
