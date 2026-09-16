import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { StockTransactionType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getAllItems() {
    return this.prisma.inventoryItem.findMany({
      orderBy: { currentStock: 'asc' }, // show low stock first
      include: {
        supplier: true
      }
    });
  }

  async recordTransaction(data: {
    itemId: string;
    type: StockTransactionType;
    quantity: number;
    reference?: string;
  }) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: data.itemId }
    });

    if (!item) throw new Error('Item not found');

    // Types include PURCHASE, USAGE, ADJUSTMENT, RETURN, EXPIRED
    const isDeduction = ([StockTransactionType.USAGE, StockTransactionType.EXPIRED] as StockTransactionType[]).includes(data.type);
    const stockChange = isDeduction ? -data.quantity : data.quantity;
    const newStock = item.currentStock + stockChange;

    return this.prisma.$transaction(async (tx) => {
      // Create transaction log
      await tx.stockTransaction.create({
        data: {
          itemId: data.itemId,
          type: data.type,
          quantity: data.quantity,
          stockBefore: item.currentStock,
          stockAfter: newStock,
          reference: data.reference,
        }
      });

      // Update current stock
      return tx.inventoryItem.update({
        where: { id: data.itemId },
        data: { currentStock: newStock }
      });
    });
  }

  async createItem(data: any) {
    if (data.minStock) data.minStock = parseInt(data.minStock, 10);
    if (data.currentStock) data.currentStock = parseInt(data.currentStock, 10);
    if (data.unitCost) data.unitCost = parseFloat(data.unitCost);
    return this.prisma.inventoryItem.create({ data });
  }

  async updateItem(id: string, data: any) {
    if (data.minStock) data.minStock = parseInt(data.minStock, 10);
    if (data.currentStock) data.currentStock = parseInt(data.currentStock, 10);
    if (data.unitCost) data.unitCost = parseFloat(data.unitCost);
    return this.prisma.inventoryItem.update({ where: { id }, data });
  }

  async deleteItem(id: string) {
    return this.prisma.inventoryItem.delete({ where: { id } });
  }
}
