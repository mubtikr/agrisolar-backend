import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { PumpCommandDto } from './dto/pump-command.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('commands')
@UseGuards(JwtAuthGuard)
export class CommandsController {
  constructor(private readonly commandsService: CommandsService) {}

  @Post('pump')
  @HttpCode(HttpStatus.ACCEPTED)
  async issuePumpCommand(@Body() dto: PumpCommandDto, @Request() req: any) {
    const userId = req.user.id;
    return this.commandsService.publishPumpCommand(dto.deviceId, dto.pump, userId);
  }
}
