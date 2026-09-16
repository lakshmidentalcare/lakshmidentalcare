import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.appointment.findMany({
      include: {
        patient: true,
        dentist: true,
        chair: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, dentist: true, chair: true },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async create(data: any) {
    // If no dentist is provided, default to the first available dentist for now
    let dentistId = data.dentistId;
    if (!dentistId) {
      const dentist = await this.prisma.user.findFirst({ where: { role: 'DENTIST' }});
      if (dentist) dentistId = dentist.id;
    }

    return this.prisma.appointment.create({
      data: {
        ...data,
        dentistId,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
      },
    });
  }

  async update(id: string, data: any) {
    if (data.startTime) data.startTime = new Date(data.startTime);
    if (data.endTime) data.endTime = new Date(data.endTime);

    return this.prisma.appointment.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.appointment.delete({
      where: { id },
    });
  }
}
