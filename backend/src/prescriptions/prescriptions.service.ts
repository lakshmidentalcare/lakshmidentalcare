import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  async getAllPrescriptions() {
    return this.prisma.prescription.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { id: true, name: true, patientCode: true, age: true, gender: true } },
        dentist: { select: { id: true, name: true, regNumber: true } },
        items: true
      }
    });
  }

  async getPrescriptionById(id: string) {
    return this.prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: true,
        dentist: true,
        items: true
      }
    });
  }

  async createPrescription(data: any) {
    return this.prisma.prescription.create({
      data: {
        patientId: data.patientId,
        dentistId: data.dentistId,
        diagnosis: data.diagnosis,
        instructions: data.instructions,
        items: {
          create: data.items.map((item: any) => ({
            medicineName: item.medicineName,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            remarks: item.remarks
          }))
        }
      },
      include: {
        patient: true,
        dentist: true,
        items: true
      }
    });
  }

  async updatePrescription(id: string, data: any) {
    if (data.items) {
      await this.prisma.prescriptionItem.deleteMany({
        where: { prescriptionId: id }
      });
    }

    return this.prisma.prescription.update({
      where: { id },
      data: {
        ...(data.patientId ? { patientId: data.patientId } : {}),
        ...(data.dentistId ? { dentistId: data.dentistId } : {}),
        ...(data.diagnosis !== undefined ? { diagnosis: data.diagnosis } : {}),
        ...(data.instructions !== undefined ? { instructions: data.instructions } : {}),
        ...(data.items ? {
          items: {
            create: data.items.map((item: any) => ({
              medicineName: item.medicineName,
              dosage: item.dosage,
              frequency: item.frequency,
              duration: item.duration,
              remarks: item.remarks
            }))
          }
        } : {})
      },
      include: {
        patient: true,
        dentist: true,
        items: true
      }
    });
  }

  async deletePrescription(id: string) {
    return this.prisma.prescription.delete({
      where: { id }
    });
  }
}

