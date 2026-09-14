import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ToothCondition } from '@prisma/client';

@Injectable()
export class OdontogramService {
  constructor(private prisma: PrismaService) {}

  async getPatientTeeth(patientId: string) {
    return this.prisma.toothState.findMany({
      where: { patientId },
    });
  }

  async updateToothState(patientId: string, toothNumber: number, condition: ToothCondition, notes?: string) {
    // Check if tooth state already registered
    const existing = await this.prisma.toothState.findFirst({
      where: { patientId, toothNumber },
    });

    if (existing) {
      if (condition === ToothCondition.HEALTHY) {
        // Clear status
        return this.prisma.toothState.delete({
          where: { id: existing.id },
        });
      }
      return this.prisma.toothState.update({
        where: { id: existing.id },
        data: { condition, notes },
      });
    }

    if (condition === ToothCondition.HEALTHY) {
      return null;
    }

    return this.prisma.toothState.create({
      data: {
        patientId,
        toothNumber,
        condition,
        notes,
      },
    });
  }
}
