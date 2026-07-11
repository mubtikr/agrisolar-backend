import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { StructuredLogger } from '../common/logging';

@Injectable()
export class CommandsService {
  constructor(@Inject('MQTT_CLIENT') private mqttClient: ClientProxy) {}

  async publishPumpCommand(deviceId: string, pump: boolean, userId: string) {
    const command = {
      deviceId,
      pump,
      source: 'manual',
      issuedAt: new Date().toISOString(),
    };

    try {
      await this.mqttClient.emit(`farm/${deviceId}/commands`, command).toPromise();

      StructuredLogger.info('Pump command issued', {
        deviceId,
        pump,
        userId,
        issuedAt: command.issuedAt,
      });

      return {
        deviceId: command.deviceId,
        pump: command.pump,
        issuedAt: command.issuedAt,
      };
    } catch (error) {
      StructuredLogger.error('Failed to publish pump command', {
        deviceId,
        error: error.message,
      });
      throw new HttpException('Broker unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
