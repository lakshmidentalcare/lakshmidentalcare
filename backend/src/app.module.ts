import { AppController } from './app.controller';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { PrismaService } from './prisma.service';
import { PrismaModule } from './prisma.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthGuard } from './auth/auth.guard';

import { PatientsService } from './patients/patients.service';
import { PatientsController } from './patients/patients.controller';

import { OdontogramService } from './odontogram/odontogram.service';
import { OdontogramController } from './odontogram/odontogram.controller';

import { AppointmentsController } from './appointments/appointments.controller';
import { AppointmentsService } from './appointments/appointments.service';

import { BillingController } from './billing/billing.controller';
import { BillingService } from './billing/billing.service';

import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';

import { InventoryController } from './inventory/inventory.controller';
import { InventoryService } from './inventory/inventory.service';

import { LabController } from './lab/lab.controller';
import { LabService } from './lab/lab.service';

import { PrescriptionsController } from './prescriptions/prescriptions.controller';
import { PrescriptionsService } from './prescriptions/prescriptions.service';

import { ReportsController } from './reports/reports.controller';
import { ReportsService } from './reports/reports.service';

import { TreatmentsController } from './treatments/treatments.controller';
import { TreatmentsService } from './treatments/treatments.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'default-secret-key-change-in-prod',
      signOptions: { expiresIn: '1d' },
    }),
    PrismaModule,
  ],
  controllers: [
    AppController,
    AuthController,
    PatientsController,
    OdontogramController,
    AppointmentsController,
    BillingController,
    DashboardController,
    InventoryController,
    LabController,
    PrescriptionsController,
    ReportsController,
    TreatmentsController,
  ],
  providers: [
    PrismaService,
    AuthService,
    AuthGuard,
    PatientsService,
    OdontogramService,
    AppointmentsService,
    BillingService,
    DashboardService,
    InventoryService,
    LabService,
    PrescriptionsService,
    ReportsService,
    TreatmentsService,
    Reflector,
  ],
})
export class AppModule {}
