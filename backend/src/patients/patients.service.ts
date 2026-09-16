import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Gender, BloodGroup } from '@prisma/client';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.patient.findMany({
      where: { deletedAt: null },
      include: {
        toothStates: true,
        medicalHistories: true,
        allergies: true,
        medications: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        toothStates: true,
        medicalHistories: true,
        allergies: true,
        medications: true,
        documents: true,
        appointments: {
          orderBy: { startTime: 'desc' },
          take: 10,
        },
        prescriptions: { include: { items: true } },
        bills: true,
        treatmentPlans: { include: { items: { include: { service: true } } } },
        clinicalNotes: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient;
  }

  async create(data: any) {
    // Auto-generate guaranteed unique patient code
    const existingPatients = await this.prisma.patient.findMany({
      select: { patientCode: true }
    });
    const existingCodes = new Set(existingPatients.map(p => (p.patientCode || '').toUpperCase()));
    let maxNum = 0;
    existingPatients.forEach(p => {
      if (p.patientCode) {
        const match = String(p.patientCode).match(/\d+/g);
        if (match) {
          match.forEach(n => {
            const val = parseInt(n, 10);
            if (!isNaN(val) && val > maxNum) maxNum = val;
          });
        }
      }
    });
    let nextNum = maxNum + 1;
    let patientCode = `LDC-${String(nextNum).padStart(4, '0')}`;
    while (existingCodes.has(patientCode.toUpperCase())) {
      nextNum++;
      patientCode = `LDC-${String(nextNum).padStart(4, '0')}`;
    }

    return this.prisma.patient.create({
      data: {
        patientCode,
        name: data.name,
        gender: (data.gender?.toUpperCase() as Gender) || Gender.OTHER,
        age: data.age ? parseInt(data.age) : undefined,
        dob: data.dob ? new Date(data.dob) : undefined,
        phone: data.phone,
        whatsapp: data.whatsapp || data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        pincode: data.pincode,
        occupation: data.occupation,
        bloodGroup: (data.bloodGroup as BloodGroup) || BloodGroup.UNKNOWN,
        chiefComplaint: data.chiefComplaint,
        referredBy: data.referredBy,
        // Handle relational medical history
        ...(data.medicalHistory && {
          medicalHistories: {
            create: [{ condition: data.medicalHistory }],
          },
        }),
        ...(data.allergies && {
          allergies: {
            create: [{ allergen: data.allergies }],
          },
        }),
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.patient.update({
      where: { id },
      data: {
        name: data.name,
        gender: data.gender?.toUpperCase() as Gender,
        age: data.age ? parseInt(data.age) : undefined,
        dob: data.dob ? new Date(data.dob) : undefined,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        address: data.address,
        city: data.city,
        pincode: data.pincode,
        occupation: data.occupation,
        bloodGroup: data.bloodGroup as BloodGroup,
        chiefComplaint: data.chiefComplaint,
      },
    });
  }

  async remove(id: string) {
    // Soft delete
    return this.prisma.patient.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
