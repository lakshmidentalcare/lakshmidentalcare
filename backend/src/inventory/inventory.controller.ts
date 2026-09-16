import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AuthGuard } from '../auth/auth.guard';
import { StockTransactionType } from '@prisma/client';

@UseGuards(AuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('items')
  async getAllItems() {
    return this.inventoryService.getAllItems();
  }

  @Post('transaction')
  async recordTransaction(
    @Body() body: {
      itemId: string;
      type: StockTransactionType;
      quantity: number;
      reference?: string;
    }
  ) {
    return this.inventoryService.recordTransaction(body);
  }

  @Post('items')
  async createItem(@Body() body: any) {
    return this.inventoryService.createItem(body);
  }

  @Put('items/:id')
  async updateItem(@Param('id') id: string, @Body() body: any) {
    return this.inventoryService.updateItem(id, body);
  }

  @Delete('items/:id')
  async deleteItem(@Param('id') id: string) {
    return this.inventoryService.deleteItem(id);
  }
}
