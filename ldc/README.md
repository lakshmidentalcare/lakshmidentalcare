ldc# Lakshmi Dental Care — Clinic Management Dashboard

An enterprise-grade clinic management system designed for **Lakshmi Dental Care**. This application features a luxury purple-and-white visual identity, tailored for premium dental practices. It provides administrative, clinical, financial, and analytical capabilities.

---

## Project Structure

This repository is structured as a dual-delivery system containing both the full production codebase (frontend and backend) and an instantly runnable, interactive client-side web application.

```text
lakshmi-dental-care/
├── index.html                    # Instantly runnable premium browser dashboard
├── backend/                      # Production NestJS + Prisma application
│   ├── prisma/
│   │   ├── schema.prisma         # Normalized PostgreSQL schema definition
│   │   └── seed.ts               # Database seed script for dental services
│   ├── src/
│   │   ├── app.module.ts         # NestJS Root module
│   │   ├── auth/                 # JWT Auth & Role-Based Access Control (RBAC)
│   │   ├── patients/             # Patient CRUD, Timeline, Clinical findings
│   │   ├── appointments/         # Scheduling, Chair/Dentist allocation
│   │   ├── odontogram/           # Interactive tooth status (FDI 2-digit)
│   │   ├── billing/              # Invoice & Payment processors (Razorpay/UPI)
│   │   └── prescriptions/        # Prescription generators with PDF export
│   ├── package.json              # Backend package list
│   └── tsconfig.json             # TypeScript configuration
├── frontend/                     # Production Next.js 15 App Router application
│   ├── src/
│   │   ├── app/                  # App router directories (dashboard, patients, etc.)
│   │   ├── components/           # Custom components (FDI Odontogram, Calendar)
│   │   ├── hooks/                # React custom hooks
│   │   └── utils/                # Utility helpers (PDF exporter, chart formatters)
│   ├── package.json              # Frontend package list
│   └── tailwind.config.ts        # Luxury Theme and Palette configuration
└── README.md                     # Main documentation (this file)
```

---

## Delivery Mode 1: Instantly Runnable Browser App (`index.html`)

For immediate preview and testing in the current environment (which lacks Node.js and PostgreSQL):
1. Navigate to the `lakshmi-dental-care` root folder.
2. Open `index.html` in any modern web browser (Double-click the file).
3. Switch roles (Super Admin, Dentist, Receptionist, Patient) in the top-bar to test custom permissions, screens, and features.
4. Data is stored locally in your browser's `LocalStorage` and persists across refreshes.

---

## Delivery Mode 2: Production Setup (Next.js & NestJS)

Follow these instructions to run the production system on a developer machine with Node.js and PostgreSQL.

### Prerequisites
- **Node.js**: v18.0.0+
- **PostgreSQL**: v14.0+
- **Redis**: For cache/notifications (Optional, bypassable in local dev)

### 1. Database Setup (NestJS Backend)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by copying `.env.example` to `.env` and updating your connection strings:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lakshmi_dental_db?schema=public"
   JWT_SECRET="your-super-secret-jwt-key"
   REDIS_URL="redis://localhost:6379"
   ```
4. Run Prisma migrations to initialize database tables:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Seed the database with the preset dental services (Consultation, Scaling, Root Canal, Orthodontics, etc.):
   ```bash
   npx prisma db seed
   ```
6. Start the NestJS backend in development mode:
   ```bash
   npm run start:dev
   ```

### 2. Frontend Setup (Next.js)
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and add backend server endpoint:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-authjs-jwt-secret"
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Key Clinical Modules

### 1. FDI Odontogram (Tooth History)
- Fully interactive visual map utilizing the FDI 2-digit numbering system (11-18, 21-28, 31-38, 41-48).
- Allows clinicians to click any tooth and apply statuses: Caries, Fillings, Root Canal, Crowns, Implants, Extractions, Missing, Veneers, or Fractures.
- Saves historical dental logs with timeline tracking per patient.

### 2. Smart Appointment Scheduler
- Allocates dental chairs (Chair 1, Chair 2, Chair 3) and assigns primary dentists.
- Supports drag-and-drop rescheduling, status flags (Scheduled, Waiting, In-Chair, Completed, Cancelled), and automated reminders.

### 3. Patient Medical Timeline
- Consolidates allergies, medical history (diabetes, hypertension, cardiac details), treatment plans, clinical findings, prescriptions, and digital consent forms in a single unified timeline.

### 4. Billing, Invoices & PDF Export
- Auto-generates billing line items from completed dental procedures.
- Incorporates GST tax calculations, optional discounts, and logs payment methods (Cash, Card, UPI, Insurance).
- Exports professional print-ready PDF invoices.
