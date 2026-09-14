import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  async getAll() {
    return this.patientsService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.patientsService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.patientsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
