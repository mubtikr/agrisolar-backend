import {
  IsInt,
  IsNumber,
  IsBoolean,
  IsString,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';

export class SensorTelemetryDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsInt()
  @Min(0)
  @Max(100)
  soilPercent: number;

  @IsInt()
  @Min(0)
  @Max(100)
  tankWaterLevel: number;

  @IsNumber()
  airTemp: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  humidity: number;

  @IsNumber()
  waterTemp: number;

  @IsBoolean()
  rainDetected: boolean;

  @IsBoolean()
  motionDetected: boolean;

  @IsBoolean()
  pumpState: boolean;
}
