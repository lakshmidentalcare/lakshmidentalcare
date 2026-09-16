'use server';

import { supabase, isSupabaseConfigured } from '@/utils/supabaseClient';

// In-memory Cloud Data Store for real-time cross-device sync
const globalCloudStore: Record<string, any> = {
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

let hasHydratedFromSupabase = false;

export async function fetchServerCloudStore() {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('ldc_clinic_store')
        .select('id, data');
      if (!error && Array.isArray(data)) {
        data.forEach((row: any) => {
          if (row.id && row.data !== undefined) {
            globalCloudStore[row.id] = row.data;
          }
        });
        hasHydratedFromSupabase = true;
      }
    } catch (err) {
      console.warn('Error hydrating store from Supabase:', err);
    }
  }
  return globalCloudStore;
}

export async function saveServerCloudStore(key: string, data: any) {
  if (key && data !== undefined) {
    globalCloudStore[key] = data;

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('ldc_clinic_store')
          .upsert({
            id: key,
            data: data,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
      } catch (err) {
        console.warn(`Error persisting ${key} to Supabase:`, err);
      }
    }
  }
  return globalCloudStore;
}
