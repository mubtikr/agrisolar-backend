import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class PumpCommandDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsBoolean()
  pump: boolean;
}
