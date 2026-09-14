export type DentalTreatmentItem = {
  id: string;
  name: string;
  category: string;
  defaultCost: number;
  duration: string;
  description: string;
};

export const MASTER_DENTAL_TREATMENTS: DentalTreatmentItem[] = [
  // 1. General Dentistry — Examination & Diagnosis
  { id: 'gen-1', name: 'Dental Consultation', category: 'General Dentistry', defaultCost: 300, duration: '20 mins', description: 'Initial oral evaluation and consultation.' },
  { id: 'gen-2', name: 'Comprehensive Oral Examination', category: 'General Dentistry', defaultCost: 500, duration: '30 mins', description: 'Full mouth hard & soft tissue examination.' },
  { id: 'gen-3', name: 'Routine Dental Check-up', category: 'General Dentistry', defaultCost: 300, duration: '20 mins', description: 'Bi-annual recall check-up.' },
  { id: 'gen-4', name: 'Oral Cancer Screening', category: 'General Dentistry', defaultCost: 600, duration: '20 mins', description: 'Mucosal examination & screening for precancerous lesions.' },
  { id: 'gen-5', name: 'Dental X-rays (IOPA)', category: 'General Dentistry', defaultCost: 200, duration: '10 mins', description: 'Intraoral Periapical digital radiograph.' },
  { id: 'gen-6', name: 'Bitewing X-rays', category: 'General Dentistry', defaultCost: 300, duration: '10 mins', description: 'Interproximal caries detection radiograph.' },
  { id: 'gen-7', name: 'OPG (Panoramic X-ray)', category: 'General Dentistry', defaultCost: 800, duration: '15 mins', description: 'Full mouth panoramic extraoral X-Ray.' },
  { id: 'gen-8', name: 'CBCT Scan Referral', category: 'General Dentistry', defaultCost: 2500, duration: '20 mins', description: '3D Cone Beam Computed Tomography referral.' },
  { id: 'gen-9', name: 'Digital Intraoral Photography', category: 'General Dentistry', defaultCost: 400, duration: '15 mins', description: 'High-res clinical photo documentation.' },
  { id: 'gen-10', name: 'Treatment Planning & Case Consultation', category: 'General Dentistry', defaultCost: 500, duration: '30 mins', description: 'Comprehensive multi-phase treatment planning.' },
  { id: 'gen-11', name: 'Second Opinion Consultation', category: 'General Dentistry', defaultCost: 500, duration: '30 mins', description: 'Expert review of existing treatment plans.' },

  // General Dentistry — Preventive
  { id: 'gen-12', name: 'Professional Scaling', category: 'Preventive Dentistry', defaultCost: 1200, duration: '30 mins', description: 'Ultrasonic supragingival calculus removal.' },
  { id: 'gen-13', name: 'Ultrasonic Scaling & Stain Removal', category: 'Preventive Dentistry', defaultCost: 1500, duration: '35 mins', description: 'Deep ultrasonic scaling & stain removal.' },
  { id: 'gen-14', name: 'Tooth Polishing', category: 'Preventive Dentistry', defaultCost: 500, duration: '15 mins', description: 'Prophy paste tooth polishing.' },
  { id: 'gen-15', name: 'Air Polishing', category: 'Preventive Dentistry', defaultCost: 1000, duration: '20 mins', description: 'Sodium bicarbonate air-flow stain removal.' },
  { id: 'gen-16', name: 'Topical Fluoride Application', category: 'Preventive Dentistry', defaultCost: 800, duration: '15 mins', description: 'Enamel remineralization varnish.' },
  { id: 'gen-17', name: 'Pit & Fissure Sealants (Per Tooth)', category: 'Preventive Dentistry', defaultCost: 600, duration: '15 mins', description: 'Occlusal fissure sealant coating.' },
  { id: 'gen-18', name: 'Desensitization Therapy', category: 'Preventive Dentistry', defaultCost: 500, duration: '15 mins', description: 'Dentin hypersensitivity treatment.' },

  // General Dentistry — Restorative
  { id: 'gen-19', name: 'Tooth-Colored Composite Filling', category: 'Restorative Dentistry', defaultCost: 1500, duration: '30 mins', description: 'Light-cured composite resin restoration.' },
  { id: 'gen-20', name: 'Glass Ionomer Cement (GIC) Filling', category: 'Restorative Dentistry', defaultCost: 1000, duration: '25 mins', description: 'Fluoride releasing restorative cement.' },
  { id: 'gen-21', name: 'Temporary Filling', category: 'Restorative Dentistry', defaultCost: 400, duration: '15 mins', description: 'Intermediate zinc oxide eugenol filling.' },
  { id: 'gen-22', name: 'Composite Inlay / Onlay', category: 'Restorative Dentistry', defaultCost: 3500, duration: '45 mins', description: 'Indirect composite lab restoration.' },
  { id: 'gen-23', name: 'Core Build-up', category: 'Restorative Dentistry', defaultCost: 2000, duration: '30 mins', description: 'Structural core foundation for crowns.' },

  // 2. Endodontics (Root Canal Treatments)
  { id: 'endo-1', name: 'Single Visit Root Canal Treatment (RCT)', category: 'Endodontics', defaultCost: 4500, duration: '60 mins', description: 'Single sitting endodontic therapy with obturation.' },
  { id: 'endo-2', name: 'Multiple Visit Root Canal Treatment', category: 'Endodontics', defaultCost: 3500, duration: '45 mins', description: 'Multi-sitting RCT with intracanal dressing.' },
  { id: 'endo-3', name: 'Anterior Tooth RCT', category: 'Endodontics', defaultCost: 3500, duration: '45 mins', description: 'Root canal therapy for incisors/canines.' },
  { id: 'endo-4', name: 'Premolar RCT', category: 'Endodontics', defaultCost: 4000, duration: '50 mins', description: 'Root canal therapy for premolars.' },
  { id: 'endo-5', name: 'Molar RCT', category: 'Endodontics', defaultCost: 5000, duration: '60 mins', description: 'Root canal therapy for multi-rooted molars.' },
  { id: 'endo-6', name: 'Retreatment RCT (Re-RCT)', category: 'Endodontics', defaultCost: 6000, duration: '75 mins', description: 'Removal of failed gutta percha & re-obturation.' },
  { id: 'endo-7', name: 'Apicoectomy & Root-End Filling', category: 'Endodontics', defaultCost: 5500, duration: '60 mins', description: 'Surgical root tip resection & MTA retrograde filling.' },
  { id: 'endo-8', name: 'Pulpotomy', category: 'Endodontics', defaultCost: 1800, duration: '30 mins', description: 'Removal of coronal pulp tissue.' },
  { id: 'endo-9', name: 'Apexification / MTA Plug', category: 'Endodontics', defaultCost: 4000, duration: '45 mins', description: 'Apical barrier formation in immature teeth.' },
  { id: 'endo-10', name: 'Fiber Post & Core Placement', category: 'Endodontics', defaultCost: 2000, duration: '40 mins', description: 'Glass fiber post placement for crown support.' },
  { id: 'endo-11', name: 'Metal Post & Core', category: 'Endodontics', defaultCost: 2500, duration: '45 mins', description: 'Cast metal post & core foundation.' },

  // 3. Prosthodontics
  { id: 'prost-1', name: 'Monolithic Zirconia Crown', category: 'Prosthodontics', defaultCost: 12000, duration: '45 mins', description: 'High strength full zirconia crown.' },
  { id: 'prost-2', name: 'PFM (Porcelain Fused to Metal) Crown', category: 'Prosthodontics', defaultCost: 4000, duration: '45 mins', description: 'Standard metal-ceramic crown.' },
  { id: 'prost-3', name: 'E-Max All-Ceramic Crown', category: 'Prosthodontics', defaultCost: 10000, duration: '45 mins', description: 'Lithium disilicate ceramic crown.' },
  { id: 'prost-4', name: 'Temporary Acrylic Crown', category: 'Prosthodontics', defaultCost: 1000, duration: '30 mins', description: 'Provisional crown protection.' },
  { id: 'prost-5', name: '3-Unit Dental Bridge (PFM)', category: 'Prosthodontics', defaultCost: 12000, duration: '60 mins', description: 'Fixed 3-unit tooth replacement bridge.' },
  { id: 'prost-6', name: '3-Unit Zirconia Bridge', category: 'Prosthodontics', defaultCost: 30000, duration: '60 mins', description: 'All-ceramic 3-unit zirconia bridge.' },
  { id: 'prost-7', name: 'Complete Acrylic Denture Set', category: 'Prosthodontics', defaultCost: 15000, duration: '60 mins', description: 'Full upper & lower acrylic dentures.' },
  { id: 'prost-8', name: 'Cast Partial Denture (CPD)', category: 'Prosthodontics', defaultCost: 10000, duration: '60 mins', description: 'Cobalt-chromium framework partial denture.' },
  { id: 'prost-9', name: 'Flexible Valplast Partial Denture', category: 'Prosthodontics', defaultCost: 8000, duration: '45 mins', description: 'Unbreakable flexible nylon partial denture.' },

  // 4. Implantology
  { id: 'imp-1', name: 'Single Titanium Dental Implant', category: 'Implantology', defaultCost: 25000, duration: '60 mins', description: 'Osseointegrated premium implant fixture.' },
  { id: 'imp-2', name: 'Full Mouth Implants (All-on-4)', category: 'Implantology', defaultCost: 180000, duration: '180 mins', description: 'Fixed arch rehabilitation on 4 implants.' },
  { id: 'imp-3', name: 'Full Mouth Implants (All-on-6)', category: 'Implantology', defaultCost: 240000, duration: '240 mins', description: 'Fixed arch rehabilitation on 6 implants.' },
  { id: 'imp-4', name: 'Bone Grafting Surgery', category: 'Implantology', defaultCost: 8000, duration: '45 mins', description: 'Alveolar ridge bone augmentation.' },
  { id: 'imp-5', name: 'Direct / Indirect Sinus Lift', category: 'Implantology', defaultCost: 15000, duration: '60 mins', description: 'Maxillary sinus membrane elevation & grafting.' },
  { id: 'imp-6', name: 'Implant Screw-Retained Crown', category: 'Implantology', defaultCost: 12000, duration: '45 mins', description: 'Custom abutment & screw-retained crown.' },

  // 5. Oral & Maxillofacial Surgery
  { id: 'surg-1', name: 'Simple Tooth Extraction', category: 'Oral Surgery', defaultCost: 1000, duration: '30 mins', description: 'Non-surgical tooth removal.' },
  { id: 'surg-2', name: 'Surgical Tooth Extraction', category: 'Oral Surgery', defaultCost: 2500, duration: '45 mins', description: 'Surgical root elevation & sectioning.' },
  { id: 'surg-3', name: 'Wisdom Tooth Removal (Impacted)', category: 'Oral Surgery', defaultCost: 4500, duration: '60 mins', description: 'Surgical disimpaction of 3rd molar.' },
  { id: 'surg-4', name: 'Frenectomy (Labial / Lingual)', category: 'Oral Surgery', defaultCost: 3000, duration: '30 mins', description: 'Surgical release of lip/tongue tie.' },
  { id: 'surg-5', name: 'Alveoloplasty (Per Quadrant)', category: 'Oral Surgery', defaultCost: 3500, duration: '40 mins', description: 'Alveolar bone smoothing pre-denture.' },
  { id: 'surg-6', name: 'Cyst Enucleation Surgery', category: 'Oral Surgery', defaultCost: 8000, duration: '60 mins', description: 'Removal of odontogenic cyst.' },

  // 6. Orthodontics
  { id: 'ortho-1', name: 'Metal Braces Treatment (Full Arch)', category: 'Orthodontics', defaultCost: 25000, duration: '60 mins', description: 'Stainless steel alignment braces.' },
  { id: 'ortho-2', name: 'Ceramic Aesthetic Braces', category: 'Orthodontics', defaultCost: 35000, duration: '60 mins', description: 'Tooth-colored ceramic braces.' },
  { id: 'ortho-3', name: 'Clear Aligners Treatment (Full Series)', category: 'Orthodontics', defaultCost: 65000, duration: '45 mins', description: 'Invisible thermoformed aligner series.' },
  { id: 'ortho-4', name: 'Hawley / Essix Clear Retainers', category: 'Orthodontics', defaultCost: 3000, duration: '30 mins', description: 'Post-treatment retention appliance.' },
  { id: 'ortho-5', name: 'Habit Breaking Appliance', category: 'Orthodontics', defaultCost: 4000, duration: '30 mins', description: 'Appliance for thumb sucking / tongue thrusting.' },

  // 7. Pediatric Dentistry
  { id: 'ped-1', name: 'Pediatric Consultation & Checkup', category: 'Pediatric Dentistry', defaultCost: 300, duration: '20 mins', description: 'Child-friendly oral screening.' },
  { id: 'ped-2', name: 'Pediatric Pulpectomy', category: 'Pediatric Dentistry', defaultCost: 2500, duration: '40 mins', description: 'Root canal treatment for primary teeth.' },
  { id: 'ped-3', name: 'Stainless Steel Pediatric Crown', category: 'Pediatric Dentistry', defaultCost: 2500, duration: '30 mins', description: 'Preformed metal crown for primary molars.' },
  { id: 'ped-4', name: 'Space Maintainer (Band & Loop)', category: 'Pediatric Dentistry', defaultCost: 3000, duration: '30 mins', description: 'Prevents space loss after primary tooth extraction.' },

  // 8. Periodontics (Gum Treatments)
  { id: 'perio-1', name: 'Periodontal Flap Surgery (Per Quadrant)', category: 'Periodontics', defaultCost: 5000, duration: '60 mins', description: 'Surgical gum reflection & deep debridement.' },
  { id: 'perio-2', name: 'Gingivectomy / Gingivoplasty', category: 'Periodontics', defaultCost: 3000, duration: '40 mins', description: 'Surgical gum recontouring.' },
  { id: 'perio-3', name: 'Crown Lengthening Surgery', category: 'Periodontics', defaultCost: 3500, duration: '45 mins', description: 'Bone & soft tissue reduction for crown placement.' },
  { id: 'perio-4', name: 'Laser Gum Depigmentation', category: 'Periodontics', defaultCost: 6000, duration: '45 mins', description: 'Melanin hyperpigmentation removal with laser.' },

  // 9. Cosmetic Dentistry
  { id: 'cosm-1', name: 'In-Office Zoom Laser Teeth Whitening', category: 'Cosmetic Dentistry', defaultCost: 8000, duration: '60 mins', description: 'Instant multi-shade teeth bleaching.' },
  { id: 'cosm-2', name: 'Composite Veneer (Per Tooth)', category: 'Cosmetic Dentistry', defaultCost: 3500, duration: '45 mins', description: 'Direct composite cosmetic facing.' },
  { id: 'cosm-3', name: 'Porcelain Ceramic Veneer', category: 'Cosmetic Dentistry', defaultCost: 10000, duration: '60 mins', description: 'Custom ultra-thin ceramic aesthetic veneer.' },
  { id: 'cosm-4', name: 'Smile Design Makeover', category: 'Cosmetic Dentistry', defaultCost: 30000, duration: '90 mins', description: 'Digital smile design & aesthetic reconstruction.' },

  // 10. Laser Dentistry
  { id: 'laser-1', name: 'Laser Soft Tissue Frenectomy', category: 'Laser Dentistry', defaultCost: 4000, duration: '20 mins', description: 'Bloodless laser frenum release.' },
  { id: 'laser-2', name: 'Laser Periodontal Pocket Therapy', category: 'Laser Dentistry', defaultCost: 4500, duration: '30 mins', description: 'Diode laser pocket disinfection.' },
  { id: 'laser-3', name: 'Laser Ulcer / Aphthous Healing', category: 'Laser Dentistry', defaultCost: 1000, duration: '10 mins', description: 'Instant laser bio-stimulation for ulcers.' },

  // 11. Diagnostic & Emergency Services
  { id: 'diag-1', name: 'Emergency Toothache Relief', category: 'Emergency Dentistry', defaultCost: 500, duration: '30 mins', description: 'Immediate pain relief intervention & dressing.' },
  { id: 'diag-2', name: 'Night Guard / Bruxism Appliance', category: 'Dental Appliances', defaultCost: 3000, duration: '30 mins', description: 'Custom occlusal splint for teeth grinding.' },
  { id: 'diag-3', name: 'Sports Custom Mouth Guard', category: 'Dental Appliances', defaultCost: 3500, duration: '30 mins', description: 'Protective athletic mouthguard.' }
];
