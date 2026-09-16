import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics(startDate?: string, endDate?: string) {
    const from = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const to = endDate ? new Date(endDate) : new Date();

    // Group bills by date to get daily revenue
    const bills = await this.prisma.bill.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        status: { in: ['PAID', 'PARTIAL'] }
      },
      select: { createdAt: true, paidAmount: true }
    });

    const revenueByDate: Record<string, number> = {};
    let totalRevenue = 0;

    bills.forEach(bill => {
      const dateString = bill.createdAt.toISOString().split('T')[0];
      const amount = Number(bill.paidAmount);
      revenueByDate[dateString] = (revenueByDate[dateString] || 0) + amount;
      totalRevenue += amount;
    });

    const revenueChartData = Object.entries(revenueByDate).map(([date, amount]) => ({
      date,
      amount
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Get new patients in period
    const newPatients = await this.prisma.patient.count({
      where: { createdAt: { gte: from, lte: to } }
    });

    // Get appointments in period
    const totalAppointments = await this.prisma.appointment.count({
      where: { startTime: { gte: from, lte: to } }
    });

    return {
      period: { from, to },
      summary: {
        totalRevenue,
        newPatients,
        totalAppointments
      },
      revenueChartData
    };
  }
}
