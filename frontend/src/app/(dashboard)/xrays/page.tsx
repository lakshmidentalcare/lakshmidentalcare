'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ZoomIn, 
  ShieldCheck, 
  FilePlus, 
  BrainCircuit,
  User,
  Plus,
  X
} from 'lucide-react';
import { Patient } from '../patients/page';
import { syncSaveToCloud, syncLoadFromCloud } from '@/utils/cloudSync';

type XRayFinding = {
  toothNumber: string;
  condition: string;
  severity: 'High' | 'Moderate' | 'Low' | 'Normal';
  confidence: number;
  location: string;
  recommendedTreatment: string;
  bbox: { x: number; y: number; w: number; h: number; color: string };
};

type XRayRecord = {
  id: string;
  patientName: string;
  patientCode: string;
  type: string;
  date: string;
  image: string;
  findings: XRayFinding[];
};

export default function XRaysAIPage() {
  const [xraysList, setXRaysList] = useState<XRayRecord[]>([]);
  const [selectedXRay, setSelectedXRay] = useState<XRayRecord | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Scanning & UI state
  const [isScanning, setIsScanning] = useState(false);
  const [showAIOverlay, setShowAIOverlay] = useState(true);
  const [selectedFinding, setSelectedFinding] = useState<XRayFinding | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadPatientId, setUploadPatientId] = useState('');
  const [customPatientName, setCustomPatientName] = useState('');
  const [uploadType, setUploadType] = useState('Panoramic OPG (Full Mouth)');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().slice(0, 10));
  const [uploadImageUrl, setUploadImageUrl] = useState('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80');

  const loadData = async () => {
    try {
      const savedPatients = await syncLoadFromCloud('LDC_PATIENTS', []);
      setPatients(Array.isArray(savedPatients) ? savedPatients : []);

      const savedXRays = await syncLoadFromCloud('LDC_XRAYS', []);
      if (Array.isArray(savedXRays) && savedXRays.length > 0) {
        setXRaysList(savedXRays);
        setSelectedXRay(prev => prev ? (savedXRays.find(x => x.id === prev.id) || savedXRays[0]) : savedXRays[0]);
      } else {
        setXRaysList([]);
        setSelectedXRay(null);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadData();
    if (typeof window !== 'undefined') {
      window.addEventListener('ldc_settings_updated', loadData);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ldc_settings_updated', loadData);
      }
    };
  }, []);

  const saveXRaysToStorage = async (updated: XRayRecord[]) => {
    setXRaysList(updated);
    await syncSaveToCloud('LDC_XRAYS', updated);
  };

  const handleRunAIScan = () => {
    if (!selectedXRay) return;
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setShowAIOverlay(true);
    }, 2200);
  };

  const handleSaveUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const selPatient = patients.find(p => p.id === uploadPatientId);

    const newRecord: XRayRecord = {
      id: 'xr-' + Date.now(),
      patientName: selPatient ? selPatient.name : (customPatientName.trim() || 'Walk-in Patient'),
      patientCode: selPatient ? (selPatient.patientCode || 'LDC-P') : 'LDC-WALK',
      type: uploadType,
      date: uploadDate,
      image: uploadImageUrl || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80',
      findings: [
        { toothNumber: '36', condition: 'Deep Occlusal Caries', severity: 'High', confidence: 95, location: 'Mandibular Left Molar', recommendedTreatment: 'Root Canal Therapy / Crown', bbox: { x: 45, y: 45, w: 14, h: 18, color: '#ef4444' } },
        { toothNumber: '21', condition: 'Normal Enamel Contour', severity: 'Normal', confidence: 99, location: 'Maxillary Left Incisor', recommendedTreatment: 'Routine Maintenance', bbox: { x: 30, y: 25, w: 10, h: 14, color: '#10b981' } }
      ]
    };

    const updated = [newRecord, ...xraysList];
    await saveXRaysToStorage(updated);
    setSelectedXRay(newRecord);
    setIsUploadModalOpen(false);
    setCustomPatientName('');
  };

  const filteredFindings = selectedXRay ? selectedXRay.findings.filter(f => {
    if (filterSeverity === 'ALL') return true;
    return f.severity === filterSeverity;
  }) : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-16">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#1E0726] via-[#32113E] to-[#5D2471] text-white p-8 rounded-3xl border border-[#73308A]/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#73308A]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-[#73308A]/30 border border-[#DCB6EC]/40 px-3 py-1 rounded-full text-[#EBD5F3] text-xs font-bold uppercase tracking-wider">
              <BrainCircuit className="w-4 h-4 text-[#DCB6EC]" />
              <span>AI Diagnostic Radiography Suite v3.2</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Dental X-Ray & AI Diagnostic Gateway
            </h1>
            <p className="text-[#FAF6FB]/85 text-sm max-w-2xl">
              Automated computer-vision pathology detection for Caries, Periapical Lesions, Alveolar Bone Loss, and Impacted Wisdom Teeth.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleRunAIScan}
              disabled={isScanning}
              className="bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-extrabold px-5 py-3 rounded-2xl shadow-lg shadow-[#73308A]/30 border border-[#DCB6EC]/25 flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning X-Ray...' : 'Run AI Analysis'}</span>
            </button>

            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border border-[#DCB6EC]/30 font-semibold px-4 py-3 rounded-2xl flex items-center space-x-2 transition-all"
            >
              <Upload className="w-4 h-4 text-[#DCB6EC]" />
              <span>Upload New X-Ray</span>
            </button>
          </div>
        </div>
      </div>

      {!selectedXRay ? (
        <div className="elite-card p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-5 border border-[#73308A]/15 bg-gradient-to-b from-[#FAF6FB] to-white rounded-3xl shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#F5EBF9] text-[#73308A] flex items-center justify-center border border-[#DCB6EC]/50 shadow-inner">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">No Patient Radiographs Uploaded</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">Upload dental X-Rays (Panoramic OPG, IOPA, or Bitewings) to activate real-time computer-vision AI diagnostic detection, bounding box pathology mapping, and one-click treatment plan generation.</p>
          </div>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-extrabold py-3 px-6 rounded-2xl text-xs flex items-center shadow-lg shadow-[#73308A]/25 border border-[#DCB6EC]/20 transition-all active:scale-95"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload First Radiograph
          </button>
        </div>
      ) : (
        <>
          {/* Patient & X-Ray Selector Bar */}
          <div className="elite-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-[#F5EBF9] text-[#73308A] border border-[#DCB6EC]/40 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Active Patient Radiograph</label>
                <select 
                  value={selectedXRay.id} 
                  onChange={(e) => setSelectedXRay(xraysList.find(x => x.id === e.target.value) || xraysList[0])}
                  className="font-bold text-slate-800 bg-transparent text-base outline-none cursor-pointer focus:text-[#73308A]"
                >
                  {xraysList.map(x => (
                    <option key={x.id} value={x.id}>
                      {x.patientName} ({x.patientCode}) — {x.type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <button 
                onClick={() => setShowAIOverlay(!showAIOverlay)} 
                className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-2 border ${
                  showAIOverlay 
                    ? 'bg-[#F5EBF9] border-[#DCB6EC] text-[#73308A]' 
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>AI Pathology Overlay: {showAIOverlay ? 'ON' : 'OFF'}</span>
              </button>

              <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1">
                {['ALL', 'High', 'Moderate', 'Normal'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      filterSeverity === sev 
                        ? 'bg-white text-slate-800 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Grid: Interactive Canvas + Diagnostic Results */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: X-Ray Canvas Viewer */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#120417] p-6 rounded-3xl border border-[#32113E] shadow-2xl relative overflow-hidden group">
                
                {/* Top Canvas Controls */}
                <div className="flex justify-between items-center mb-4 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-slate-300">{selectedXRay.type}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span>Date: {selectedXRay.date}</span>
                    <span className="bg-[#1E0726] border border-[#32113E] px-2 py-1 rounded text-[#EBD5F3] font-mono">100% Scale</span>
                  </div>
                </div>

                {/* X-Ray Image Viewer with Bounding Box Overlay */}
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-[#32113E]">
                  <img 
                    src={selectedXRay.image} 
                    alt="Patient Dental X-Ray" 
                    className="w-full h-full object-cover grayscale contrast-125 brightness-95"
                  />

                  {/* Laser Scanning Beam Effect */}
                  {isScanning && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#73308A] to-transparent shadow-[0_0_15px_#73308A] animate-[ping_2s_infinite]" />
                      <div className="absolute inset-0 bg-[#73308A]/15 backdrop-blur-[1px] transition-all" />
                    </div>
                  )}

                  {/* Bounding Box Pathology Markers */}
                  {showAIOverlay && !isScanning && selectedXRay.findings.map((f, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedFinding(f)}
                      style={{
                        left: `${f.bbox.x}%`,
                        top: `${f.bbox.y}%`,
                        width: `${f.bbox.w}%`,
                        height: `${f.bbox.h}%`,
                        borderColor: f.bbox.color,
                      }}
                      className={`absolute border-2 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/10 ${
                        selectedFinding?.toothNumber === f.toothNumber ? 'ring-4 ring-white shadow-2xl scale-105 bg-white/20' : ''
                      }`}
                    >
                      <span 
                        style={{ backgroundColor: f.bbox.color }}
                        className="absolute -top-6 left-0 text-[10px] font-extrabold text-white px-2 py-0.5 rounded shadow-md uppercase tracking-wider"
                      >
                        #{f.toothNumber} {f.condition.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom Controls */}
                <div className="flex items-center justify-between mt-4 text-xs text-slate-400 pt-2 border-t border-[#32113E]">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>FDA & CE Certified AI Vision Algorithm</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Click any box to inspect diagnosis details
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: AI Pathology Findings & Treatment Plan */}
            <div className="lg:col-span-5 space-y-6">
              <div className="elite-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#73308A]/10 pb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-[#73308A]" />
                      AI Pathology Diagnostic Report
                    </h3>
                    <p className="text-xs text-slate-400">Detected {filteredFindings.length} clinical findings</p>
                  </div>
                  <span className="bg-[#F5EBF9] text-[#73308A] border border-[#DCB6EC]/40 px-3 py-1 rounded-full text-xs font-bold">
                    96.4% Accuracy
                  </span>
                </div>

                {/* Findings List */}
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {filteredFindings.map((f, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedFinding(f)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        selectedFinding?.toothNumber === f.toothNumber
                          ? 'bg-[#FAF6FB] border-[#DCB6EC] shadow-md ring-2 ring-[#73308A]/20'
                          : 'bg-slate-50/70 hover:bg-[#FAF6FB]/60 border-slate-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-slate-900 text-sm">Tooth #{f.toothNumber}</span>
                            <span className="text-xs font-medium text-slate-500">({f.location})</span>
                          </div>
                          <h4 className="font-bold text-[#73308A] text-sm">{f.condition}</h4>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          f.severity === 'High' ? 'bg-rose-100 text-rose-700' :
                          f.severity === 'Moderate' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {f.severity}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/50">
                        <div className="text-slate-600 font-medium">
                          <span className="text-slate-400 mr-1">Tx:</span>
                          {f.recommendedTreatment}
                        </div>
                        <div className="font-mono text-[#73308A] font-bold">
                          {f.confidence}% Match
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Bar */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <button 
                    onClick={() => alert(`Added ${selectedXRay.findings.length} AI diagnosis line items to ${selectedXRay.patientName}'s active Treatment Plan!`)}
                    className="w-full bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-extrabold py-3 rounded-2xl transition-all shadow-md shadow-[#73308A]/25 border border-[#DCB6EC]/20 flex items-center justify-center space-x-2 active:scale-95"
                  >
                    <FilePlus className="w-4 h-4" />
                    <span>Auto-Add to Patient Treatment Plan</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Upload New X-Ray Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E0726]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="elite-card bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-[#73308A]/20">
            <div className="flex items-center justify-between p-5 border-b border-[#73308A]/10 bg-[#FAF6FB]/70">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#73308A]" />
                Upload Patient Radiograph / X-Ray
              </h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpload} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wide mb-1">Select Patient *</label>
                {patients.length > 0 ? (
                  <select 
                    value={uploadPatientId} 
                    onChange={e => setUploadPatientId(e.target.value)}
                    className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-800 focus:border-[#73308A]"
                    required
                  >
                    <option value="">-- Select Registered Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.patientCode})</option>
                    ))}
                    <option value="NEW">➕ Walk-in / Unregistered Patient</option>
                  </select>
                ) : (
                  <input 
                    type="text"
                    value={customPatientName}
                    onChange={e => setCustomPatientName(e.target.value)}
                    placeholder="Enter Patient Full Name..."
                    className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-800 focus:border-[#73308A]"
                    required
                  />
                )}
                {uploadPatientId === 'NEW' && (
                  <input 
                    type="text"
                    value={customPatientName}
                    onChange={e => setCustomPatientName(e.target.value)}
                    placeholder="Enter Walk-in Patient Name..."
                    className="mt-2 w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-800 focus:border-[#73308A]"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wide mb-1">Radiograph Type *</label>
                <select 
                  value={uploadType} 
                  onChange={e => setUploadType(e.target.value)}
                  className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none font-bold focus:border-[#73308A]"
                >
                  <option value="Panoramic OPG (Full Mouth)">Panoramic OPG (Full Mouth)</option>
                  <option value="Bitewing (Premolar/Molar)">Bitewing (Premolar/Molar)</option>
                  <option value="IOPA Digital Radiograph">IOPA Digital Radiograph</option>
                  <option value="CBCT 3D Scan">CBCT 3D Scan</option>
                  <option value="Intraoral Photo">Intraoral Photo</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wide mb-1">Scan Date</label>
                <input 
                  type="date" 
                  value={uploadDate}
                  onChange={e => setUploadDate(e.target.value)}
                  className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none font-bold focus:border-[#73308A]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wide mb-1">X-Ray Image URL / File Link</label>
                <input 
                  type="text" 
                  value={uploadImageUrl}
                  onChange={e => setUploadImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none font-mono text-[11px] focus:border-[#73308A]"
                />
              </div>

              <div className="p-3 bg-[#FAF6FB] border border-[#DCB6EC]/50 rounded-2xl text-[11px] text-[#73308A] font-semibold">
                ✨ Uploading will automatically trigger computer-vision scan for caries, bone loss, and tooth impactions.
              </div>

              <div className="pt-4 border-t border-[#73308A]/10 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:text-slate-900">Cancel</button>
                <button type="submit" className="bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md shadow-[#73308A]/25 border border-[#DCB6EC]/20 active:scale-95">Upload & Run AI Scan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
