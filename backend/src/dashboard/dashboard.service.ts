import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Today's Visits
    const todayVisits = await this.prisma.appointment.count({
      where: {
        startTime: {
          gte: startOfToday,
          lt: endOfToday
        }
      }
    });

    // 2. Waiting Queue
    const waitingQueue = await this.prisma.appointment.count({
      where: {
        startTime: {
          gte: startOfToday,
          lt: endOfToday
        },
        status: 'WAITING'
      }
    });

    // 3. Monthly Revenue
    const billsThisMonth = await this.prisma.bill.aggregate({
      _sum: {
        paidAmount: true
      },
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    });
    const monthlyRevenue = billsThisMonth._sum.paidAmount || 0;

    // 4. Critical Alerts (Low Stock)
    const criticalAlerts = await (await this.prisma.inventoryItem.findMany()).filter(item => item.currentStock <= item.minStock).length;

    // 5. Live Queue (Today's Appointments)
    const liveQueue = await this.prisma.appointment.findMany({
      where: {
        startTime: {
          gte: startOfToday,
          lt: endOfToday
        }
      },
      include: {
        patient: { select: { name: true } },
        dentist: { select: { name: true } }
      },
      orderBy: { startTime: 'asc' }
    });

    // 6. Chair Status (Identify currently in-progress appointments)
    const inProgress: any[] = await this.prisma.appointment.findMany({
      where: {
        startTime: {
          gte: startOfToday,
          lt: endOfToday
        },
        status: 'IN_CHAIR'
      },
      include: { patient: { select: { name: true } } }
    });
    
    const chairStatus = {
      C1: inProgress[0] ? { status: 'IN-USE', patient: inProgress[0].patient?.name } : { status: 'FREE', patient: null },
      C2: inProgress[1] ? { status: 'IN-USE', patient: inProgress[1].patient?.name } : { status: 'FREE', patient: null },
      C3: inProgress[2] ? { status: 'IN-USE', patient: inProgress[2].patient?.name } : { status: 'FREE', patient: null },
    };

    // 7. Revenue Trend (Mock 7 days for the chart)
    const revenueTrend = [
      { name: 'Mon', revenue: 4000, visits: 24 },
      { name: 'Tue', revenue: 3000, visits: 18 },
      { name: 'Wed', revenue: 5500, visits: 29 },
      { name: 'Thu', revenue: 4500, visits: 22 },
      { name: 'Fri', revenue: 6000, visits: 31 },
      { name: 'Sat', revenue: 7000, visits: 35 },
      { name: 'Sun', revenue: 2000, visits: 10 },
    ];

    return {
      todayVisits,
      waitingQueue,
      monthlyRevenue,
      criticalAlerts,
      liveQueue,
      chairStatus,
      revenueTrend
    };
  }
}
