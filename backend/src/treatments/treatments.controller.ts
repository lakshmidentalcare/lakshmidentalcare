import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('treatments')
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Get('patient/:patientId/notes')
  async getClinicalNotes(@Param('patientId') patientId: string) {
    return this.treatmentsService.getPatientClinicalNotes(patientId);
  }

  @Post('patient/:patientId/notes')
  async createClinicalNote(@Param('patientId') patientId: string, @Body() data: any) {
    return this.treatmentsService.createClinicalNote(patientId, data);
  }

  @Get('patient/:patientId/plans')
  async getTreatmentPlans(@Param('patientId') patientId: string) {
    return this.treatmentsService.getPatientTreatmentPlans(patientId);
  }

  @Post('patient/:patientId/plans')
  async createTreatmentPlan(@Param('patientId') patientId: string, @Body() data: any) {
    return this.treatmentsService.createTreatmentPlan(patientId, data);
  }
}
