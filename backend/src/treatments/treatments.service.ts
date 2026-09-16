import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TreatmentsService {
  constructor(private prisma: PrismaService) {}

  async getPatientClinicalNotes(patientId: string) {
    return this.prisma.clinicalNote.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true } }
      }
    });
  }

  async createClinicalNote(patientId: string, data: any) {
    return this.prisma.clinicalNote.create({
      data: {
        patientId,
        authorId: data.authorId,
        title: data.title,
        content: data.content
      },
      include: {
        author: { select: { name: true } }
      }
    });
  }

  async getPatientTreatmentPlans(patientId: string) {
    return this.prisma.treatmentPlan.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            service: true,
            notes_history: true
          }
        }
      }
    });
  }

  async createTreatmentPlan(patientId: string, data: any) {
    return this.prisma.treatmentPlan.create({
      data: {
        patientId,
        title: data.title,
        diagnosis: data.diagnosis,
        status: 'PLANNED',
        items: {
          create: data.items.map((item: any) => ({
            serviceId: item.serviceId,
            toothNumber: item.toothNumber,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        }
      },
      include: {
        items: true
      }
    });
  }
}
