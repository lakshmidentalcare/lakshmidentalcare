import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { OdontogramService } from './odontogram.service';
import { AuthGuard } from '../auth/auth.guard';
import { ToothCondition } from '@prisma/client';

@UseGuards(AuthGuard)
@Controller('odontogram')
export class OdontogramController {
  constructor(private readonly odontogramService: OdontogramService) {}

  @Get(':patientId')
  async getTeeth(@Param('patientId') patientId: string) {
    return this.odontogramService.getPatientTeeth(patientId);
  }

  @Post(':patientId')
  async updateTooth(
    @Param('patientId') patientId: string,
    @Body() body: { toothNumber: number; condition: ToothCondition; notes?: string },
  ) {
    return this.odontogramService.updateToothState(
      patientId,
      body.toothNumber,
      body.condition,
      body.notes,
    );
  }
}
