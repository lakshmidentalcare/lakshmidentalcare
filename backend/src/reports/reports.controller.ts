import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('analytics')
  async getAnalytics(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.getAnalytics(startDate, endDate);
  }
}
