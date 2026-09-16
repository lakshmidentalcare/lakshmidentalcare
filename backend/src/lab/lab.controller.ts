import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { LabService } from './lab.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('lab')
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Get('cases')
  async getAllCases() {
    return this.labService.getAllCases();
  }

  @Get('cases/:id')
  async getCaseById(@Param('id') id: string) {
    return this.labService.getCaseById(id);
  }

  @Post('cases')
  async createCase(@Body() data: any) {
    return this.labService.createCase(data);
  }

  @Put('cases/:id')
  async updateCase(@Param('id') id: string, @Body() data: any) {
    return this.labService.updateCase(id, data);
  }

  @Delete('cases/:id')
  async deleteCase(@Param('id') id: string) {
    return this.labService.deleteCase(id);
  }

  @Get('laboratories')
  async getLaboratories() {
    return this.labService.getLaboratories();
  }

  @Post('laboratories')
  async createLaboratory(@Body() data: any) {
    return this.labService.createLaboratory(data);
  }
}
