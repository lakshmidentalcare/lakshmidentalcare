import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LabService {
  constructor(private prisma: PrismaService) {}

  async getAllCases() {
    return this.prisma.labCase.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { id: true, name: true, patientCode: true } },
        dentist: { select: { id: true, name: true } },
        laboratory: { select: { id: true, name: true } }
      }
    });
  }

  async getCaseById(id: string) {
    return this.prisma.labCase.findUnique({
      where: { id },
      include: {
        patient: true,
        dentist: true,
        laboratory: true
      }
    });
  }

  async createCase(data: any) {
    const count = await this.prisma.labCase.count();
    const caseNumber = `LDC-LAB-${(count + 1).toString().padStart(4, '0')}`;
    
    return this.prisma.labCase.create({
      data: {
        caseNumber,
        ...data
      },
      include: {
        patient: true,
        dentist: true,
        laboratory: true
      }
    });
  }

  async updateCase(id: string, data: any) {
    return this.prisma.labCase.update({
      where: { id },
      data,
      include: {
        patient: true,
        dentist: true,
        laboratory: true
      }
    });
  }

  async deleteCase(id: string) {
    return this.prisma.labCase.delete({
      where: { id }
    });
  }

  // Also methods for Laboratories
  async getLaboratories() {
    return this.prisma.laboratory.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async createLaboratory(data: any) {
    return this.prisma.laboratory.create({ data });
  }
}
