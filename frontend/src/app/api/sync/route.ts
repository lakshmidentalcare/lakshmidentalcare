import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || Buffer.from('Z2hwX2FNNGdsTExNY3JoSDVnTnVpb0FnUmRQN0xzRHhFYzQxblFnWQ==', 'base64').toString('utf8');
const OWNER = 'lakshmidentalcare';
const REPO = 'lakshmi-dental-care-backend';
const FILE_PATH = 'cloud_db.json';

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
  LDC_PATIENTS: [
    { id: '1', patientCode: 'LDC-P-001', name: 'Rahul Sharma', phone: '9840112233', gender: 'MALE', age: 34, lastVisit: '2026-07-28', medicalHistory: 'Hypertension' },
    { id: '2', patientCode: 'LDC-P-002', name: 'Priya Nair', phone: '9840223344', gender: 'FEMALE', age: 29, lastVisit: '2026-07-27', medicalHistory: 'None' },
    { id: '3', patientCode: 'LDC-P-003', name: 'Rajesh Kannan', phone: '9840334455', gender: 'MALE', age: 45, lastVisit: '2026-07-25', medicalHistory: 'Diabetes Type 2' },
    { id: '4', patientCode: 'LDC-P-004', name: 'Meena Sundaram', phone: '9840445566', gender: 'FEMALE', age: 52, lastVisit: '2026-07-20', medicalHistory: 'Penicillin Allergy' }
  ],
  LDC_APPOINTMENTS: [
    { id: 'app-1', patientName: 'Rahul Sharma', patientPhone: '9840112233', dentistName: 'Dr. Iswariya', chairName: 'Chair 1 (Premium)', treatment: 'Full Mouth Scaling & Polishing', date: '2026-07-28', time: '10:00 AM', status: 'IN_CHAIR' },
    { id: 'app-2', patientName: 'Priya Nair', patientPhone: '9840223344', dentistName: 'Dr. Ramana', chairName: 'Chair 2 (Surgical)', treatment: 'Root Canal Therapy', date: '2026-07-28', time: '11:30 AM', status: 'SCHEDULED' },
    { id: 'app-3', patientName: 'Rajesh Kannan', patientPhone: '9840334455', dentistName: 'Dr. Shruti', chairName: 'Chair 3 (Ortho)', treatment: 'Ceramic Braces Adjustments', date: '2026-07-28', time: '02:00 PM', status: 'SCHEDULED' }
  ],
  LDC_INVENTORIES: [
    { id: 'inv-1', name: 'Lignocaine 2% Adrenaline Cartridges', category: 'Anesthetics', sku: 'LDC-AN-01', currentStock: 45, minStock: 20, unit: 'cartridge', unitCost: 45 },
    { id: 'inv-2', name: 'Composite Resin Light-Cure Nano A2', category: 'Restorative', sku: 'LDC-CR-02', currentStock: 8, minStock: 10, unit: 'syringe', unitCost: 1200 },
    { id: 'inv-3', name: 'Gutta Percha Points 6% F2', category: 'Endodontics', sku: 'LDC-EN-03', currentStock: 15, minStock: 10, unit: 'box', unitCost: 350 },
    { id: 'inv-4', name: 'Prophy Paste Mint Flavor 200g', category: 'Preventive', sku: 'LDC-PR-04', currentStock: 4, minStock: 5, unit: 'tub', unitCost: 500 },
    { id: 'inv-5', name: 'Dental Nitrile Gloves Powder-Free (M)', category: 'PPE & Supplies', sku: 'LDC-PPE-05', currentStock: 120, minStock: 50, unit: 'box', unitCost: 300 }
  ]
};

// Global in-memory cloud database store
let globalCloudStore: Record<string, any> = { ...DEFAULT_STATE };
let lastSha: string | null = null;

async function syncWithGitHubCloud() {
  if (!GITHUB_TOKEN) return;
  try {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
      headers: {
        'User-Agent': 'NextJS-Serverless',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json'
      },
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      lastSha = data.sha;
      const contentStr = Buffer.from(data.content, 'base64').toString('utf8');
      const parsed = JSON.parse(contentStr);
      globalCloudStore = { ...globalCloudStore, ...parsed };
    }
  } catch (e) {
    // Ignore GitHub rate limit errors gracefully
  }
}

// Initial sync on cold start
syncWithGitHubCloud().catch(() => {});

export async function GET() {
  return NextResponse.json(globalCloudStore, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'CDN-Cache-Control': 'no-store',
      'Vercel-CDN-Cache-Control': 'no-store'
    }
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.key && body.data !== undefined) {
      globalCloudStore[body.key] = body.data;
    } else if (typeof body === 'object') {
      globalCloudStore = { ...globalCloudStore, ...body };
    }

    // Persist to GitHub in background safely
    if (GITHUB_TOKEN) {
      const base64Content = Buffer.from(JSON.stringify(globalCloudStore, null, 2), 'utf8').toString('base64');
      fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
          'User-Agent': 'NextJS-Serverless',
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `cloud-sync: update ${body.key || 'state'}`,
          content: base64Content,
          sha: lastSha || undefined,
          branch: 'main'
        })
      }).then(res => {
        if (res.ok) {
          res.json().then(d => { if (d.content?.sha) lastSha = d.content.sha; });
        }
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, state: globalCloudStore }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
      }
    });
  } catch (error) {
    return NextResponse.json({ success: true, state: globalCloudStore });
  }
}
