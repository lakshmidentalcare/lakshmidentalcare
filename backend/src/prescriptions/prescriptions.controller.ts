import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Get()
  async getAllPrescriptions() {
    return this.prescriptionsService.getAllPrescriptions();
  }

  @Get(':id')
  async getPrescriptionById(@Param('id') id: string) {
    return this.prescriptionsService.getPrescriptionById(id);
  }

  @Post()
  async createPrescription(@Body() data: any) {
    return this.prescriptionsService.createPrescription(data);
  }

  @Put(':id')
  async updatePrescription(@Param('id') id: string, @Body() data: any) {
    return this.prescriptionsService.updatePrescription(id, data);
  }

  @Patch(':id')
  async patchPrescription(@Param('id') id: string, @Body() data: any) {
    return this.prescriptionsService.updatePrescription(id, data);
  }

  @Delete(':id')
  async deletePrescription(@Param('id') id: string) {
    return this.prescriptionsService.deletePrescription(id);
  }
}

