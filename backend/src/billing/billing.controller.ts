import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('invoices')
  async getAllInvoices() {
    return this.billingService.getAllInvoices();
  }

  @Get('invoices/:id')
  async getInvoiceById(@Param('id') id: string) {
    return this.billingService.getInvoiceById(id);
  }

  @Post('invoices')
  async createInvoice(
    @Body() body: {
      patientId: string;
      items: { description: string; cost: number; qty: number; }[];
      subtotal: number;
      discountPercent: number;
      discountAmount: number;
      gstPercent: number;
      gstAmount: number;
      total: number;
      paymentMethod: string;
    }
  ) {
    return this.billingService.createInvoice(body);
  }

  @Delete('invoices/:id')
  async deleteInvoice(@Param('id') id: string) {
    return this.billingService.deleteInvoice(id);
  }
}
