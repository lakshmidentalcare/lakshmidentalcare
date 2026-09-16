import { Module } from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { TreatmentsController } from './treatments.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TreatmentsController],
  providers: [TreatmentsService, PrismaService],
})
export class TreatmentsModule {}
