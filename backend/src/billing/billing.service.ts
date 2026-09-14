import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BillStatus, PaymentMode } from '@prisma/client';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async getAllInvoices() {
    return this.prisma.bill.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { name: true, patientCode: true, phone: true } },
        items: true,
        payments: true
      },
    });
  }

  async getInvoiceById(id: string) {
    return this.prisma.bill.findUnique({
      where: { id },
      include: {
        patient: true,
        items: true,
        payments: true
      }
    });
  }

  async createInvoice(data: {
    patientId: string;
    items: { description: string; cost: number; qty: number; }[];
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    gstPercent: number;
    gstAmount: number;
    total: number;
    paymentMethod: string;
  }) {
    // Generate Bill Number
    const count = await this.prisma.bill.count();
    const billNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(3, '0')}`;
    
    // Map payment mode string to Enum
    let mappedMode: PaymentMode = PaymentMode.CASH;
    if (data.paymentMethod.includes('UPI')) mappedMode = PaymentMode.UPI;
    if (data.paymentMethod.includes('Card')) mappedMode = PaymentMode.CARD;
    if (data.paymentMethod.includes('Insurance')) mappedMode = PaymentMode.INSURANCE;

    return this.prisma.bill.create({
      data: {
        billNumber,
        patientId: data.patientId,
        subtotal: data.subtotal,
        discountAmount: data.discountAmount,
        gstPercent: data.gstPercent,
        gstAmount: data.gstAmount,
        total: data.total,
        paidAmount: data.total, // Assume full payment for now at invoice creation
        dueAmount: 0,
        status: BillStatus.PAID,
        items: {
          create: data.items.map(item => ({
            description: item.description,
            quantity: item.qty,
            unitPrice: item.cost,
            gstPercent: data.gstPercent,
            lineTotal: item.cost * item.qty
          }))
        },
        payments: {
          create: {
            amount: data.total,
            mode: mappedMode
          }
        }
      },
      include: {
        patient: true,
        items: true,
        payments: true
      }
    });
  }

  async deleteInvoice(id: string) {
    // Delete payments and bill items first, then the bill itself
    // Or if cascade is enabled, just deleting the bill would work.
    // To be safe, we'll use a transaction to delete dependencies manually
    return this.prisma.$transaction(async (tx) => {
      await tx.payment.deleteMany({ where: { billId: id } });
      await tx.billItem.deleteMany({ where: { billId: id } });
      return tx.bill.delete({ where: { id } });
    });
  }
}
