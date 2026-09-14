// ============================================================
// LAKSHMI DENTAL CARE — Prisma Seed File
// Preloads: roles/users, services, chairs, sample patients,
// sample appointments, inventory, and lab entries
// ============================================================

import {
  PrismaClient,
  RoleType,
  Gender,
  BloodGroup,
  AppointmentStatus,
  AppointmentType,
  ToothCondition,
  TreatmentStatus,
  BillStatus,
  PaymentMode,
  LabStatus,
  LabCaseType,
  InventoryCategory,
  StockTransactionType,
  NotificationChannel,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function today(hour = 10, minute = 0): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

// ─────────────────────────────────────────────────────────────
// CLEAR (order respects FK constraints)
// ─────────────────────────────────────────────────────────────

async function clearAll() {
  await prisma.aISuggestion.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationTemplate.deleteMany();
  await prisma.labCase.deleteMany();
  await prisma.laboratory.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.stockTransaction.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.insuranceClaim.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.billItem.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.treatmentNote.deleteMany();
  await prisma.treatmentPlanItem.deleteMany();
  await prisma.treatmentPlan.deleteMany();
  await prisma.clinicalNote.deleteMany();
  await prisma.toothState.deleteMany();
  await prisma.consentForm.deleteMany();
  await prisma.patientDocument.deleteMany();
  await prisma.patientCurrentMedication.deleteMany();
  await prisma.patientAllergy.deleteMany();
  await prisma.patientMedicalHistory.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.waitingList.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.chair.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ Cleared existing data');
}

// ─────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────

async function seedUsers() {
  const defaultPass = await hashPassword('Admin@1234');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@lakshmidental.com',
      name: 'Dr. Iswariya Lakshmi',
      role: RoleType.SUPER_ADMIN,
      passwordHash: defaultPass,
      phone: '9840001111',
      regNumber: 'DENT-TN-8827',
    },
  });

  const dentist1 = await prisma.user.create({
    data: {
      email: 'ramana@lakshmidental.com',
      name: 'Dr. Ramana Krishnamurthy',
      role: RoleType.DENTIST,
      passwordHash: defaultPass,
      phone: '9840002222',
      regNumber: 'DENT-TN-4155',
    },
  });

  const dentist2 = await prisma.user.create({
    data: {
      email: 'shruti@lakshmidental.com',
      name: 'Dr. Shruti Sen',
      role: RoleType.ASSOCIATE_DENTIST,
      passwordHash: defaultPass,
      phone: '9840003333',
      regNumber: 'DENT-TN-9988',
    },
  });

  const receptionist = await prisma.user.create({
    data: {
      email: 'reception@lakshmidental.com',
      name: 'Priya Nair',
      role: RoleType.RECEPTIONIST,
      passwordHash: defaultPass,
      phone: '9840004444',
    },
  });

  const assistant = await prisma.user.create({
    data: {
      email: 'assistant@lakshmidental.com',
      name: 'Kavitha Suresh',
      role: RoleType.DENTAL_ASSISTANT,
      passwordHash: defaultPass,
      phone: '9840005555',
    },
  });

  const accountant = await prisma.user.create({
    data: {
      email: 'accounts@lakshmidental.com',
      name: 'Suresh Babu',
      role: RoleType.ACCOUNTANT,
      passwordHash: defaultPass,
      phone: '9840006666',
    },
  });

  const labTech = await prisma.user.create({
    data: {
      email: 'lab@lakshmidental.com',
      name: 'Mohan Raj',
      role: RoleType.LAB_TECHNICIAN,
      passwordHash: defaultPass,
      phone: '9840007777',
    },
  });

  console.log(`✓ Seeded ${7} users`);
  return { admin, dentist1, dentist2, receptionist, assistant, accountant, labTech };
}

// ─────────────────────────────────────────────────────────────
// CHAIRS
// ─────────────────────────────────────────────────────────────

async function seedChairs() {
  const chairs = await Promise.all(
    ['Chair 1', 'Chair 2', 'Chair 3', 'Chair 4', 'Chair 5'].map((name) =>
      prisma.chair.create({ data: { name } }),
    ),
  );
  console.log(`✓ Seeded ${chairs.length} chairs`);
  return chairs;
}

// ─────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────

async function seedServices() {
  const serviceData = [
    {
      name: 'General Dentistry',
      services: [
        { name: 'Consultation', code: 'GD-001', price: 300, duration: 30 },
        { name: 'Scaling & Polishing', code: 'GD-002', price: 1200, duration: 60 },
        { name: 'Deep Cleaning', code: 'GD-003', price: 2500, duration: 90 },
        { name: 'Composite Filling (Single Surface)', code: 'GD-004', price: 1500, duration: 45 },
        { name: 'Composite Filling (Multi Surface)', code: 'GD-005', price: 2500, duration: 60 },
        { name: 'Glass Ionomer Filling', code: 'GD-006', price: 800, duration: 30 },
      ],
    },
    {
      name: 'Endodontics',
      services: [
        { name: 'Root Canal Treatment – Anterior', code: 'ENDO-001', price: 3500, duration: 90 },
        { name: 'Root Canal Treatment – Premolar', code: 'ENDO-002', price: 4500, duration: 90 },
        { name: 'Root Canal Treatment – Molar', code: 'ENDO-003', price: 6000, duration: 120 },
        { name: 'Re-Root Canal Treatment', code: 'ENDO-004', price: 7000, duration: 120 },
        { name: 'Post & Core Build-up', code: 'ENDO-005', price: 2000, duration: 45 },
      ],
    },
    {
      name: 'Oral Surgery',
      services: [
        { name: 'Simple Extraction', code: 'SURG-001', price: 800, duration: 30 },
        { name: 'Surgical Extraction', code: 'SURG-002', price: 2500, duration: 60 },
        { name: 'Wisdom Tooth Removal (Simple)', code: 'SURG-003', price: 3000, duration: 60 },
        { name: 'Impacted Wisdom Tooth Surgery', code: 'SURG-004', price: 8000, duration: 90 },
      ],
    },
    {
      name: 'Dental Implants',
      services: [
        { name: 'Single Implant (Fixture)', code: 'IMP-001', price: 25000, duration: 60 },
        { name: 'Implant Abutment', code: 'IMP-002', price: 8000, duration: 45 },
        { name: 'Implant Crown', code: 'IMP-003', price: 12000, duration: 45 },
        { name: 'Full Arch Implant (All-on-4)', code: 'IMP-004', price: 150000, duration: 180 },
        { name: 'Bone Grafting', code: 'IMP-005', price: 15000, duration: 60 },
        { name: 'Sinus Lift', code: 'IMP-006', price: 20000, duration: 90 },
      ],
    },
    {
      name: 'Orthodontics',
      services: [
        { name: 'Metal Braces', code: 'ORTHO-001', price: 25000, duration: 60 },
        { name: 'Ceramic Braces', code: 'ORTHO-002', price: 35000, duration: 60 },
        { name: 'Self-Ligating Braces', code: 'ORTHO-003', price: 45000, duration: 60 },
        { name: 'Invisible Aligners (Full)', code: 'ORTHO-004', price: 80000, duration: 60 },
        { name: 'Retainers (Pair)', code: 'ORTHO-005', price: 5000, duration: 30 },
        { name: 'Orthodontic Consultation', code: 'ORTHO-006', price: 500, duration: 30 },
      ],
    },
    {
      name: 'Pediatric Dentistry',
      services: [
        { name: 'Child Consultation', code: 'PED-001', price: 300, duration: 30 },
        { name: 'Pulpectomy (Primary Tooth)', code: 'PED-002', price: 2500, duration: 60 },
        { name: 'Space Maintainer', code: 'PED-003', price: 3500, duration: 45 },
        { name: 'Pit & Fissure Sealant', code: 'PED-004', price: 500, duration: 30 },
        { name: 'Fluoride Application', code: 'PED-005', price: 800, duration: 30 },
      ],
    },
    {
      name: 'Periodontics',
      services: [
        { name: 'Gum Disease Consultation', code: 'PERIO-001', price: 500, duration: 30 },
        { name: 'Flap Surgery (Per Quadrant)', code: 'PERIO-002', price: 8000, duration: 90 },
        { name: 'Laser Gum Therapy', code: 'PERIO-003', price: 5000, duration: 60 },
        { name: 'Crown Lengthening', code: 'PERIO-004', price: 6000, duration: 60 },
        { name: 'Gingival Graft', code: 'PERIO-005', price: 12000, duration: 90 },
      ],
    },
    {
      name: 'Cosmetic Dentistry',
      services: [
        { name: 'Teeth Whitening (In-Office)', code: 'COSM-001', price: 8000, duration: 90 },
        { name: 'Smile Design Consultation', code: 'COSM-002', price: 1000, duration: 60 },
        { name: 'Porcelain Veneer (Per Tooth)', code: 'COSM-003', price: 12000, duration: 90 },
        { name: 'Composite Veneer (Per Tooth)', code: 'COSM-004', price: 4000, duration: 60 },
        { name: 'Dental Bonding', code: 'COSM-005', price: 3000, duration: 45 },
        { name: 'Gum Depigmentation', code: 'COSM-006', price: 5000, duration: 45 },
      ],
    },
    {
      name: 'Laser Dentistry',
      services: [
        { name: 'Gingivectomy (Laser)', code: 'LASER-001', price: 4000, duration: 30 },
        { name: 'Frenectomy (Laser)', code: 'LASER-002', price: 5000, duration: 30 },
        { name: 'Laser Depigmentation', code: 'LASER-003', price: 5000, duration: 45 },
        { name: 'Laser Cavity Prep', code: 'LASER-004', price: 2000, duration: 30 },
      ],
    },
    {
      name: 'Prosthodontics',
      services: [
        { name: 'PFM Crown', code: 'PROS-001', price: 5000, duration: 60 },
        { name: 'Zirconia Crown', code: 'PROS-002', price: 12000, duration: 60 },
        { name: 'Full Porcelain Crown', code: 'PROS-003', price: 10000, duration: 60 },
        { name: 'Metal-Free Bridge (3-unit)', code: 'PROS-004', price: 30000, duration: 90 },
        { name: 'Complete Denture (Upper/Lower)', code: 'PROS-005', price: 12000, duration: 60 },
        { name: 'Partial Denture', code: 'PROS-006', price: 8000, duration: 60 },
        { name: 'Temporary Crown', code: 'PROS-007', price: 1500, duration: 30 },
      ],
    },
  ];

  let serviceCount = 0;

  for (let i = 0; i < serviceData.length; i++) {
    const cat = await prisma.serviceCategory.create({
      data: {
        name: serviceData[i].name,
        sortOrder: i + 1,
        services: {
          create: serviceData[i].services.map((s) => ({
            name: s.name,
            code: s.code,
            basePrice: s.price,
            defaultDuration: s.duration,
          })),
        },
      },
    });
    serviceCount += serviceData[i].services.length;
  }

  console.log(`✓ Seeded ${serviceData.length} categories and ${serviceCount} services`);
}

// ─────────────────────────────────────────────────────────────
// PATIENTS
// ─────────────────────────────────────────────────────────────

async function seedPatients() {
  const patient1 = await prisma.patient.create({
    data: {
      patientCode: 'LDC-0001',
      name: 'Thamizhselvi Arumugam',
      gender: Gender.FEMALE,
      dob: new Date('1982-04-15'),
      age: 44,
      phone: '9840123456',
      whatsapp: '9840123456',
      email: 'thamizhselvi@example.com',
      address: '12, Annai Nagar, Chennai',
      city: 'Chennai',
      pincode: '600040',
      bloodGroup: BloodGroup.O_POS,
      occupation: 'Teacher',
      chiefComplaint: 'Tooth pain in lower left',
      medicalHistories: {
        create: [{ condition: 'Controlled Hypertension', since: '2018', notes: 'On Amlodipine 5mg' }],
      },
      allergies: {
        create: [{ allergen: 'Penicillin', reaction: 'Rash', severity: 'Moderate' }],
      },
      medications: {
        create: [{ name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' }],
      },
      toothStates: {
        create: [
          { toothNumber: 14, condition: ToothCondition.FILLING },
          { toothNumber: 26, condition: ToothCondition.ROOT_CANAL },
          { toothNumber: 36, condition: ToothCondition.CROWN },
          { toothNumber: 46, condition: ToothCondition.CARIES },
        ],
      },
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      patientCode: 'LDC-0002',
      name: 'Venkataraman Pillai',
      gender: Gender.MALE,
      dob: new Date('1965-09-22'),
      age: 61,
      phone: '9841234567',
      whatsapp: '9841234567',
      email: 'venkat.pillai@example.com',
      address: '45, T Nagar, Chennai',
      city: 'Chennai',
      pincode: '600017',
      bloodGroup: BloodGroup.B_POS,
      occupation: 'Retired Engineer',
      chiefComplaint: 'Missing teeth, wants implants',
      medicalHistories: {
        create: [
          { condition: 'Type 2 Diabetes', since: '2010', notes: 'HbA1c 7.2, on Metformin' },
          { condition: 'Dyslipidemia', since: '2015' },
        ],
      },
      medications: {
        create: [
          { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
          { name: 'Atorvastatin', dosage: '10mg', frequency: 'Once at night' },
        ],
      },
      toothStates: {
        create: [
          { toothNumber: 15, condition: ToothCondition.MISSING },
          { toothNumber: 25, condition: ToothCondition.MISSING },
          { toothNumber: 36, condition: ToothCondition.MISSING },
          { toothNumber: 37, condition: ToothCondition.CROWN },
          { toothNumber: 46, condition: ToothCondition.MISSING },
        ],
      },
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      patientCode: 'LDC-0003',
      name: 'Keerthi Subramaniam',
      gender: Gender.FEMALE,
      dob: new Date('2000-01-12'),
      age: 26,
      phone: '9842345678',
      whatsapp: '9842345678',
      email: 'keerthi.s@example.com',
      address: '78, Anna Salai, Chennai',
      city: 'Chennai',
      pincode: '600002',
      bloodGroup: BloodGroup.A_POS,
      occupation: 'Software Engineer',
      chiefComplaint: 'Crooked teeth, interested in aligners',
      toothStates: {
        create: [
          { toothNumber: 12, condition: ToothCondition.FILLING },
          { toothNumber: 22, condition: ToothCondition.FILLING },
        ],
      },
    },
  });

  const patient4 = await prisma.patient.create({
    data: {
      patientCode: 'LDC-0004',
      name: 'Arjun Balaji',
      gender: Gender.MALE,
      dob: new Date('2015-06-05'),
      age: 11,
      phone: '9843456789',
      whatsapp: '9843456789',
      city: 'Chennai',
      pincode: '600100',
      bloodGroup: BloodGroup.AB_POS,
      chiefComplaint: 'Child dental checkup, cavity',
      toothStates: {
        create: [
          { toothNumber: 54, condition: ToothCondition.CARIES },
          { toothNumber: 64, condition: ToothCondition.CARIES },
        ],
      },
    },
  });

  console.log(`✓ Seeded 4 patients`);
  return { patient1, patient2, patient3, patient4 };
}

// ─────────────────────────────────────────────────────────────
// APPOINTMENTS
// ─────────────────────────────────────────────────────────────

async function seedAppointments(
  users: Awaited<ReturnType<typeof seedUsers>>,
  patients: Awaited<ReturnType<typeof seedPatients>>,
  chairs: Awaited<ReturnType<typeof seedChairs>>,
) {
  const { dentist1, dentist2 } = users;
  const { patient1, patient2, patient3, patient4 } = patients;
  const [chair1, chair2, chair3] = chairs;

  const appointments = await Promise.all([
    prisma.appointment.create({
      data: {
        patientId: patient1.id,
        dentistId: dentist1.id,
        chairId: chair1.id,
        startTime: today(9, 0),
        endTime: today(9, 45),
        duration: 45,
        type: AppointmentType.REGULAR,
        status: AppointmentStatus.COMPLETED,
        chiefComplaint: 'Root canal treatment – tooth 46',
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patient2.id,
        dentistId: dentist1.id,
        chairId: chair2.id,
        startTime: today(10, 0),
        endTime: today(11, 0),
        duration: 60,
        type: AppointmentType.REGULAR,
        status: AppointmentStatus.WAITING,
        chiefComplaint: 'Implant consultation',
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patient3.id,
        dentistId: dentist2.id,
        chairId: chair3.id,
        startTime: today(11, 15),
        endTime: today(12, 0),
        duration: 45,
        type: AppointmentType.REGULAR,
        status: AppointmentStatus.SCHEDULED,
        chiefComplaint: 'Orthodontic consultation – aligners',
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patient4.id,
        dentistId: dentist2.id,
        chairId: chair1.id,
        startTime: today(12, 0),
        endTime: today(12, 30),
        duration: 30,
        type: AppointmentType.REGULAR,
        status: AppointmentStatus.SCHEDULED,
        chiefComplaint: 'Pediatric checkup, caries on 54',
      },
    }),
    // Tomorrow's appointments
    prisma.appointment.create({
      data: {
        patientId: patient1.id,
        dentistId: dentist1.id,
        chairId: chair1.id,
        startTime: (() => { const d = addDays(new Date(), 1); d.setHours(10, 0, 0, 0); return d; })(),
        endTime: (() => { const d = addDays(new Date(), 1); d.setHours(11, 0, 0, 0); return d; })(),
        duration: 60,
        type: AppointmentType.FOLLOW_UP,
        status: AppointmentStatus.SCHEDULED,
        chiefComplaint: 'Post-RCT crown placement',
      },
    }),
  ]);

  console.log(`✓ Seeded ${appointments.length} appointments`);
  return appointments;
}

// ─────────────────────────────────────────────────────────────
// TREATMENT PLANS & BILLING
// ─────────────────────────────────────────────────────────────

async function seedTreatmentsAndBilling(
  users: Awaited<ReturnType<typeof seedUsers>>,
  patients: Awaited<ReturnType<typeof seedPatients>>,
) {
  const { dentist1 } = users;
  const { patient1, patient2 } = patients;

  // Find services
  const rctMolar = await prisma.service.findFirst({ where: { code: 'ENDO-003' } });
  const zircCrown = await prisma.service.findFirst({ where: { code: 'PROS-002' } });
  const implant  = await prisma.service.findFirst({ where: { code: 'IMP-001' } });

  // Patient 1 — Treatment Plan
  const plan1 = await prisma.treatmentPlan.create({
    data: {
      patientId: patient1.id,
      title: 'RCT + Crown – Tooth 46',
      diagnosis: 'Pulpitis – Chronic irreversible, Tooth 46',
      status: TreatmentStatus.IN_PROGRESS,
      startedAt: new Date(),
      items: {
        create: [
          {
            serviceId: rctMolar!.id,
            toothNumber: 46,
            quantity: 1,
            unitPrice: 6000,
            status: TreatmentStatus.COMPLETED,
          },
          {
            serviceId: zircCrown!.id,
            toothNumber: 46,
            quantity: 1,
            unitPrice: 12000,
            status: TreatmentStatus.PLANNED,
          },
        ],
      },
    },
  });

  // Clinical Note for patient 1
  await prisma.clinicalNote.create({
    data: {
      patientId: patient1.id,
      authorId: dentist1.id,
      title: 'RCT Session 1 — Tooth 46',
      content: `S: Patient complains of severe throbbing pain in lower left molar.
O: Deep caries noted on tooth 46 extending to pulp. Periapical radiolucency on IOPA.
A: Chronic irreversible pulpitis with periapical pathology.
P: Root canal treatment initiated. Working length established. Canals shaped to #25 apically.
   Calcium hydroxide placed. Temporary restoration done. Next visit in 7 days.`,
    },
  });

  // Bill for patient 1 (RCT completed)
  const bill1 = await prisma.bill.create({
    data: {
      billNumber: 'LDC-BILL-0001',
      patientId: patient1.id,
      treatmentPlanId: plan1.id,
      subtotal: 6000,
      discountAmount: 0,
      gstPercent: 18,
      gstAmount: 1080,
      total: 7080,
      paidAmount: 7080,
      dueAmount: 0,
      status: BillStatus.PAID,
      items: {
        create: [
          {
            description: 'Root Canal Treatment – Molar (Tooth 46)',
            toothNumber: 46,
            quantity: 1,
            unitPrice: 6000,
            gstPercent: 18,
            lineTotal: 7080,
          },
        ],
      },
      payments: {
        create: [
          {
            amount: 7080,
            mode: PaymentMode.UPI,
            transactionId: 'UPI2026071401',
            receivedAt: new Date(),
          },
        ],
      },
    },
  });

  // Patient 2 — Implant Plan
  const plan2 = await prisma.treatmentPlan.create({
    data: {
      patientId: patient2.id,
      title: 'Multiple Implants – Teeth 15, 25, 36, 46',
      diagnosis: 'Edentulous spaces requiring implant supported prostheses',
      status: TreatmentStatus.PLANNED,
      items: {
        create: [
          { serviceId: implant!.id, toothNumber: 15, quantity: 1, unitPrice: 25000 },
          { serviceId: implant!.id, toothNumber: 25, quantity: 1, unitPrice: 25000 },
          { serviceId: implant!.id, toothNumber: 36, quantity: 1, unitPrice: 25000 },
          { serviceId: implant!.id, toothNumber: 46, quantity: 1, unitPrice: 25000 },
        ],
      },
    },
  });

  console.log(`✓ Seeded treatment plans and billing`);
}

// ─────────────────────────────────────────────────────────────
// PRESCRIPTIONS
// ─────────────────────────────────────────────────────────────

async function seedPrescriptions(
  users: Awaited<ReturnType<typeof seedUsers>>,
  patients: Awaited<ReturnType<typeof seedPatients>>,
) {
  const { dentist1 } = users;
  const { patient1 } = patients;

  await prisma.prescription.create({
    data: {
      patientId: patient1.id,
      dentistId: dentist1.id,
      diagnosis: 'Post-RCT pain management',
      instructions: 'Take medicines after food. Complete the full course. Return if pain persists.',
      items: {
        create: [
          {
            medicineName: 'Amoxicillin + Clavulanic Acid',
            strength: '625mg',
            form: 'Tablet',
            dosage: '1 tablet',
            frequency: '1-0-1',
            duration: '5 days',
            route: 'Oral',
          },
          {
            medicineName: 'Ibuprofen',
            strength: '400mg',
            form: 'Tablet',
            dosage: '1 tablet',
            frequency: '1-1-1',
            duration: '3 days',
            route: 'Oral',
            remarks: 'After food only',
          },
          {
            medicineName: 'Metronidazole',
            strength: '400mg',
            form: 'Tablet',
            dosage: '1 tablet',
            frequency: '1-0-1',
            duration: '5 days',
            route: 'Oral',
          },
          {
            medicineName: 'Chlorhexidine Mouthwash',
            strength: '0.2%',
            form: 'Liquid',
            dosage: '10ml',
            frequency: 'Twice daily',
            duration: '7 days',
            route: 'Oral rinse',
            remarks: 'Rinse for 30 seconds, do not swallow',
          },
        ],
      },
    },
  });

  console.log(`✓ Seeded prescriptions`);
}

// ─────────────────────────────────────────────────────────────
// INVENTORY
// ─────────────────────────────────────────────────────────────

async function seedInventory() {
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'Dentsply Sirona India',
      contactName: 'Ravi Kumar',
      phone: '9900112233',
      email: 'sales@dentsply.in',
      address: 'Bangalore, Karnataka',
      gstin: '29AABCD1234E1Z5',
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'GC India Dental Products',
      contactName: 'Sunita Sharma',
      phone: '9911223344',
      email: 'orders@gcindiadental.com',
      address: 'Mumbai, Maharashtra',
    },
  });

  const inventoryItems = [
    { name: 'Composite Resin – A2 Shade', sku: 'MAT-001', category: InventoryCategory.DENTAL_MATERIAL, stock: 8, minStock: 3, unitCost: 1200, supplierId: supplier1.id },
    { name: 'Composite Resin – A3 Shade', sku: 'MAT-002', category: InventoryCategory.DENTAL_MATERIAL, stock: 6, minStock: 3, unitCost: 1200, supplierId: supplier1.id },
    { name: 'Glass Ionomer Cement (Type II)', sku: 'MAT-003', category: InventoryCategory.DENTAL_MATERIAL, stock: 4, minStock: 2, unitCost: 800, supplierId: supplier2.id },
    { name: 'Zinc Phosphate Cement', sku: 'MAT-004', category: InventoryCategory.DENTAL_MATERIAL, stock: 3, minStock: 2, unitCost: 650 },
    { name: 'Endodontic Files – #15 (6pcs)', sku: 'INST-001', category: InventoryCategory.INSTRUMENT, stock: 12, minStock: 5, unitCost: 350 },
    { name: 'Endodontic Files – #20 (6pcs)', sku: 'INST-002', category: InventoryCategory.INSTRUMENT, stock: 10, minStock: 5, unitCost: 350 },
    { name: 'Scaling Tip – Universal', sku: 'INST-003', category: InventoryCategory.INSTRUMENT, stock: 6, minStock: 3, unitCost: 2500 },
    { name: 'Implant Fixture – 4.0x10mm', sku: 'IMP-001', category: InventoryCategory.IMPLANT, stock: 5, minStock: 3, unitCost: 8000, supplierId: supplier1.id },
    { name: 'Implant Fixture – 4.5x10mm', sku: 'IMP-002', category: InventoryCategory.IMPLANT, stock: 4, minStock: 2, unitCost: 8000, supplierId: supplier1.id },
    { name: 'Amoxicillin 500mg (Strip of 10)', sku: 'MED-001', category: InventoryCategory.MEDICINE, stock: 30, minStock: 10, unitCost: 85, expiry: addDays(new Date(), 365) },
    { name: 'Ibuprofen 400mg (Strip of 10)', sku: 'MED-002', category: InventoryCategory.MEDICINE, stock: 40, minStock: 15, unitCost: 45, expiry: addDays(new Date(), 365) },
    { name: 'Metronidazole 400mg (Strip of 10)', sku: 'MED-003', category: InventoryCategory.MEDICINE, stock: 25, minStock: 10, unitCost: 35 },
    { name: 'Chlorhexidine Mouthwash 0.2% (500ml)', sku: 'MED-004', category: InventoryCategory.MEDICINE, stock: 15, minStock: 5, unitCost: 180 },
    { name: 'Lidocaine 2% with Adrenaline (1.8ml)', sku: 'MED-005', category: InventoryCategory.MEDICINE, stock: 100, minStock: 30, unitCost: 22 },
    { name: 'Latex Gloves – Medium (100pcs)', sku: 'PPE-001', category: InventoryCategory.PPE, stock: 10, minStock: 4, unitCost: 350 },
    { name: 'Surgical Masks (50pcs)', sku: 'PPE-002', category: InventoryCategory.PPE, stock: 8, minStock: 3, unitCost: 200 },
    { name: 'Disposable Syringes – 2ml (100pcs)', sku: 'CONS-001', category: InventoryCategory.CONSUMABLE, stock: 5, minStock: 2, unitCost: 280 },
    { name: 'Cotton Rolls (500pcs)', sku: 'CONS-002', category: InventoryCategory.CONSUMABLE, stock: 3, minStock: 2, unitCost: 120 },
    { name: 'Gutta Percha Points #25 (60pcs)', sku: 'CONS-003', category: InventoryCategory.CONSUMABLE, stock: 8, minStock: 3, unitCost: 450 },
    { name: 'Dental Needles – 27G Short (100pcs)', sku: 'CONS-004', category: InventoryCategory.CONSUMABLE, stock: 2, minStock: 5, unitCost: 650 }, // Low stock!
  ];

  for (const item of inventoryItems) {
    await prisma.inventoryItem.create({
      data: {
        name: item.name,
        sku: item.sku,
        category: item.category,
        currentStock: item.stock,
        minStock: item.minStock,
        unitCost: item.unitCost,
        expiry: item.expiry,
        supplierId: item.supplierId,
        transactions: {
          create: [
            {
              type: StockTransactionType.PURCHASE,
              quantity: item.stock,
              stockBefore: 0,
              stockAfter: item.stock,
              reference: 'Initial stock',
            },
          ],
        },
      },
    });
  }

  console.log(`✓ Seeded ${inventoryItems.length} inventory items and 2 suppliers`);
}

// ─────────────────────────────────────────────────────────────
// LABORATORIES & LAB CASES
// ─────────────────────────────────────────────────────────────

async function seedLaboratories(
  users: Awaited<ReturnType<typeof seedUsers>>,
  patients: Awaited<ReturnType<typeof seedPatients>>,
) {
  const { dentist1 } = users;
  const { patient1, patient2 } = patients;

  const lab1 = await prisma.laboratory.create({
    data: {
      name: 'Precise Dental Lab',
      contact: 'Karthik',
      phone: '9944332211',
      email: 'orders@precisedental.com',
      address: 'T Nagar, Chennai',
    },
  });

  const lab2 = await prisma.laboratory.create({
    data: {
      name: 'Crown Masters Lab',
      contact: 'Senthil',
      phone: '9922334455',
      email: 'lab@crownmasters.in',
      address: 'Nungambakkam, Chennai',
    },
  });

  const labCases = await Promise.all([
    prisma.labCase.create({
      data: {
        caseNumber: 'LDC-LAB-0001',
        patientId: patient1.id,
        dentistId: dentist1.id,
        laboratoryId: lab1.id,
        caseType: LabCaseType.CROWN,
        toothNumbers: [46],
        shade: 'A2',
        instructions: 'Zirconia full crown. Margin at gingival level. Tight occlusal contacts preferred.',
        status: LabStatus.IN_PROGRESS,
        sentDate: new Date(),
        expectedDate: addDays(new Date(), 7),
        cost: 3500,
      },
    }),
    prisma.labCase.create({
      data: {
        caseNumber: 'LDC-LAB-0002',
        patientId: patient2.id,
        dentistId: dentist1.id,
        laboratoryId: lab2.id,
        caseType: LabCaseType.IMPLANT_ABUTMENT,
        toothNumbers: [15, 25],
        instructions: 'Custom titanium abutments. Emergence profile to match adjacent teeth.',
        status: LabStatus.SENT,
        sentDate: new Date(),
        expectedDate: addDays(new Date(), 14),
        cost: 8000,
      },
    }),
  ]);

  console.log(`✓ Seeded 2 laboratories and ${labCases.length} lab cases`);
}

// ─────────────────────────────────────────────────────────────
// NOTIFICATION TEMPLATES
// ─────────────────────────────────────────────────────────────

async function seedNotificationTemplates() {
  const templates = [
    {
      name: 'appointment_reminder_whatsapp',
      channel: NotificationChannel.WHATSAPP,
      body: `Hello {{patientName}}, this is a reminder for your appointment at *Lakshmi Dental Care* on *{{date}}* at *{{time}}* with *{{dentistName}}*. Please arrive 10 minutes early. Reply STOP to unsubscribe.`,
    },
    {
      name: 'appointment_reminder_sms',
      channel: NotificationChannel.SMS,
      body: `Reminder: Appointment at Lakshmi Dental Care on {{date}} at {{time}} with Dr. {{dentistName}}. Call 9840001111 to reschedule.`,
    },
    {
      name: 'appointment_confirmation_email',
      channel: NotificationChannel.EMAIL,
      subject: 'Appointment Confirmed – Lakshmi Dental Care',
      body: `Dear {{patientName}},\n\nYour appointment has been confirmed.\n\nDate: {{date}}\nTime: {{time}}\nDentist: {{dentistName}}\nChair: {{chairName}}\n\nPlease bring any previous X-rays or medical records.\n\nBest regards,\nLakshmi Dental Care`,
    },
    {
      name: 'bill_due_whatsapp',
      channel: NotificationChannel.WHATSAPP,
      body: `Dear {{patientName}}, your invoice *{{billNumber}}* of ₹{{amount}} is pending at *Lakshmi Dental Care*. Kindly clear at your earliest convenience. For queries call 9840001111.`,
    },
    {
      name: 'follow_up_reminder_sms',
      channel: NotificationChannel.SMS,
      body: `Hi {{patientName}}, this is a follow-up reminder from Lakshmi Dental Care. Your next visit is scheduled for {{date}}. Call 9840001111 to confirm.`,
    },
    {
      name: 'lab_case_ready_in_app',
      channel: NotificationChannel.IN_APP,
      body: `Lab case {{caseNumber}} for patient {{patientName}} is {{status}} from {{labName}}. Expected delivery: {{expectedDate}}.`,
    },
    {
      name: 'low_stock_alert_in_app',
      channel: NotificationChannel.IN_APP,
      body: `⚠️ Low Stock Alert: {{itemName}} has only {{currentStock}} {{unit}} remaining (minimum: {{minStock}}). Please reorder.`,
    },
  ];

  await prisma.notificationTemplate.createMany({ data: templates });
  console.log(`✓ Seeded ${templates.length} notification templates`);
}

// ─────────────────────────────────────────────────────────────
// AUDIT LOGS (sample)
// ─────────────────────────────────────────────────────────────

async function seedAuditLogs(users: Awaited<ReturnType<typeof seedUsers>>) {
  const { admin, dentist1 } = users;
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: admin.id,
        ipAddress: '192.168.1.1',
      },
      {
        userId: admin.id,
        action: 'CREATE',
        entity: 'Patient',
        entityId: 'LDC-0001',
        newValue: { name: 'Thamizhselvi Arumugam', phone: '9840123456' },
      },
      {
        userId: dentist1.id,
        action: 'UPDATE',
        entity: 'Appointment',
        entityId: 'apt-001',
        oldValue: { status: 'SCHEDULED' },
        newValue: { status: 'COMPLETED' },
      },
    ],
  });
  console.log(`✓ Seeded sample audit logs`);
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🦷 Starting Lakshmi Dental Care database seed...\n');

  await clearAll();

  const users    = await seedUsers();
  const chairs   = await seedChairs();
  await seedServices();
  const patients = await seedPatients();
  await seedAppointments(users, patients, chairs);
  await seedTreatmentsAndBilling(users, patients);
  await seedPrescriptions(users, patients);
  await seedInventory();
  await seedLaboratories(users, patients);
  await seedNotificationTemplates();
  await seedAuditLogs(users);

  console.log('\n✅ Seed completed successfully!\n');
  console.log('Default credentials (all users):');
  console.log('  Password: Admin@1234\n');
  console.log('  admin@lakshmidental.com      → Super Admin');
  console.log('  ramana@lakshmidental.com     → Dentist');
  console.log('  shruti@lakshmidental.com     → Associate Dentist');
  console.log('  reception@lakshmidental.com  → Receptionist');
  console.log('  assistant@lakshmidental.com  → Dental Assistant');
  console.log('  accounts@lakshmidental.com   → Accountant');
  console.log('  lab@lakshmidental.com        → Lab Technician\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
