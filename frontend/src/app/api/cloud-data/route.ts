import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/utils/supabaseClient';

export const dynamic = 'force-dynamic';

const DEFAULT_STATE: Record<string, any> = {
  LDC_CLINIC_CONFIG: {
    superAdminName: 'Dr. Iswariya',
    superAdminSpecialization: 'Chief Dental Surgeon',
    clinicName: 'Lakshmi Dental Care',
    regNumber: '1463',
    phone: '+91 86808 55897',
    email: 'lakshmidentalcare5@gmail.com',
    address: 'No.72, Barathipuram Main Road, Govindasalai, Puducherry-605011',
    gstRate: 0,
    currencySymbol: '₹',
    invoicePrefix: 'INV-2026-',
    chair1Name: 'Chair 1 (Premium Operatory)',
    chair2Name: 'Chair 2 (Surgical Suite)',
    chair3Name: 'Chair 3 (Orthodontics & Hygiene)',
    autoBackup: true,
  },
  LDC_STAFF: [
    { id: '1', name: 'Dr. Iswariya', email: 'admin@lakshmidental.com', phone: '9840001111', role: 'SUPER_ADMIN', regNumber: '1463', specialization: 'Chief Dental Surgeon', status: 'ACTIVE' },
    { id: '2', name: 'Dr. Ramana Krishnamurthy', email: 'ramana@lakshmidental.com', phone: '9840002222', role: 'DENTIST', regNumber: 'DENT-TN-9912', specialization: 'Endodontist (Root Canal Specialist)', status: 'ACTIVE' },
    { id: '3', name: 'Dr. Shruti Viswanathan', email: 'shruti@lakshmidental.com', phone: '9840003333', role: 'ASSOCIATE_DENTIST', regNumber: 'DENT-TN-1045', specialization: 'Pediatric & Orthodontic Specialist', status: 'ACTIVE' },
    { id: '4', name: 'Ananya Sundaram', email: 'reception@lakshmidental.com', phone: '9840004444', role: 'RECEPTIONIST', specialization: 'Front Desk Operations', status: 'ACTIVE' },
  ],
  LDC_PATIENTS: [],
  LDC_APPOINTMENTS: [],
  LDC_INVENTORIES: []
};

let cloudStore: Record<string, any> = { ...DEFAULT_STATE };

export async function GET() {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('ldc_clinic_store').select('id, data');
      if (!error && Array.isArray(data)) {
        data.forEach((row: any) => {
          if (row.id && row.data !== undefined) {
            cloudStore[row.id] = row.data;
          }
        });
      }
    } catch (e) {
      console.warn('API cloud-data GET error:', e);
    }
  }
  return NextResponse.json(cloudStore);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.key && body.data !== undefined) {
      cloudStore[body.key] = body.data;
      if (isSupabaseConfigured() && supabase) {
        await supabase.from('ldc_clinic_store').upsert({
          id: body.key,
          data: body.data,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }
    } else if (typeof body === 'object') {
      cloudStore = { ...cloudStore, ...body };
      if (isSupabaseConfigured() && supabase) {
        for (const [k, v] of Object.entries(body)) {
          await supabase.from('ldc_clinic_store').upsert({
            id: k,
            data: v,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
        }
      }
    }

    return NextResponse.json({ success: true, state: cloudStore });
  } catch (error) {
    return NextResponse.json({ success: true, state: cloudStore });
  }
}
