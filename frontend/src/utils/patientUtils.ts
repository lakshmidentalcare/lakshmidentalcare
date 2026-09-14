export type PatientRecord = {
  id: string;
  patientCode: string;
  name: string;
  phone: string;
  gender: string;
  age: number;
  lastVisit?: string;
  medicalHistory?: string;
};

export function generateNextPatientCode(patientList: { patientCode?: string }[]): string {
  if (!patientList || patientList.length === 0) {
    return 'LDC-P-001';
  }

  const existingCodes = new Set(
    patientList
      .map(p => (p.patientCode || '').trim().toUpperCase())
      .filter(Boolean)
  );

  let maxNum = 0;
  patientList.forEach(p => {
    if (p && p.patientCode) {
      const match = String(p.patientCode).match(/\d+/g);
      if (match) {
        match.forEach(numStr => {
          const val = parseInt(numStr, 10);
          if (!isNaN(val) && val > maxNum) {
            maxNum = val;
          }
        });
      }
    }
  });

  let nextNum = maxNum + 1;
  let candidate = `LDC-P-${String(nextNum).padStart(3, '0')}`;

  while (existingCodes.has(candidate.toUpperCase())) {
    nextNum++;
    candidate = `LDC-P-${String(nextNum).padStart(3, '0')}`;
  }

  return candidate;
}
