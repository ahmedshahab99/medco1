"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────
interface DoctorProfile {
  name: string; nameAr: string;
  specialization: string; specializationAr: string;
  license: string; clinic: string; clinicAr: string;
  phone: string; address: string; addressAr: string;
}

interface Patient { name: string; age: string; gender: string; diagnosis: string; }

interface Medication {
  id: string; name: string; dose: string;
  freq: string; duration: string; notes: string;
}

type MedKey = keyof Omit<Medication, "id">;

type SectionKey =
  | "clinicName" | "doctorNameAr" | "specialization"
  | "licensePhone" | "address" | "patientRow"
  | "patientAge" | "patientGender" | "patientDiag"
  | "dateStrip" | "validity" | "colDose"
  | "colFreq" | "colDuration" | "colNotes"
  | "notesSection" | "signature" | "disclaimer";

type Sections = Record<SectionKey, boolean>;

interface ColDef {
  key: MedKey; label: string; always?: boolean; sectionKey?: SectionKey;
}

// ── Theme System ──────────────────────────────────────────────────────
type ThemeId = "classic" | "modern" | "minimal" | "dark" | "elegant";

interface Theme {
  id: ThemeId;
  nameAr: string;
  nameEn: string;
  preview: { bar: string; band: string; paper: string; };
  vars: Record<string, string>;
}

const THEMES: Theme[] = [
  {
    id: "classic", nameAr: "الكلاسيكي", nameEn: "Classic Gold",
    preview: { bar: "linear-gradient(90deg,#0B3D2E,#B8892A,#D4A84B,#B8892A,#0B3D2E)", band: "#0B3D2E", paper: "#FEFCF6" },
    vars: {
      "--em":"#0B3D2E","--em2":"#145C43","--gd":"#B8892A","--gd2":"#D4A84B",
      "--gdp":"#FBF3DC","--gdpp":"#FEF9EF","--iv":"#FDFAF2","--iv2":"#F6EFD8",
      "--iv3":"#EDE4CC","--bdr":"#DCCF9E","--bdr2":"#EDE4CC",
      "--ink":"#1A1005","--inkm":"#4A3A20","--inks":"#7A6840","--inkf":"#AFA070",
      "--rx-bg":"#FEFCF6","--band-txt":"#E8D9A0","--band-txt2":"rgba(232,217,160,0.45)",
      "--topbar-grad":"linear-gradient(90deg,#0B3D2E 0%,#B8892A 28%,#D4A84B 50%,#B8892A 72%,#0B3D2E 100%)",
      "--date-bg":"#0B3D2E","--date-txt":"rgba(232,217,160,0.75)","--date-strong":"#E8D9A0",
      "--patient-bg":"linear-gradient(135deg,rgba(251,243,220,.5) 0%,#fff 100%)",
      "--footer-bg":"linear-gradient(180deg,#F6EFD8 0%,#FDFAF2 100%)",
      "--doctor-bg":"linear-gradient(180deg,#FEF9EF 0%,transparent 80%)",
      "--th-bg":"#F6EFD8","--wm-color":"#0B3D2E",
    }
  },
  {
    id: "modern", nameAr: "العصري", nameEn: "Modern Blue",
    preview: { bar: "linear-gradient(90deg,#1a3a6b,#4a9cd4,#6ab7e8,#4a9cd4,#1a3a6b)", band: "#1a3a6b", paper: "#f8fbff" },
    vars: {
      "--em":"#1a3a6b","--em2":"#2a5298","--gd":"#4a9cd4","--gd2":"#6ab7e8",
      "--gdp":"#e8f4fd","--gdpp":"#f0f8ff","--iv":"#f8fbff","--iv2":"#eef5fc",
      "--iv3":"#ddeaf6","--bdr":"#b8d4e8","--bdr2":"#d0e8f5",
      "--ink":"#0d1b2e","--inkm":"#1e3a5f","--inks":"#4a7090","--inkf":"#8aaec8",
      "--rx-bg":"#f8fbff","--band-txt":"#cce4f7","--band-txt2":"rgba(180,220,245,0.5)",
      "--topbar-grad":"linear-gradient(90deg,#1a3a6b 0%,#4a9cd4 35%,#6ab7e8 50%,#4a9cd4 65%,#1a3a6b 100%)",
      "--date-bg":"#1a3a6b","--date-txt":"rgba(180,220,245,0.8)","--date-strong":"#cce4f7",
      "--patient-bg":"linear-gradient(135deg,rgba(232,244,253,.6) 0%,#fff 100%)",
      "--footer-bg":"linear-gradient(180deg,#eef5fc 0%,#f8fbff 100%)",
      "--doctor-bg":"linear-gradient(180deg,#f0f8ff 0%,transparent 80%)",
      "--th-bg":"#eef5fc","--wm-color":"#1a3a6b",
    }
  },
  {
    id: "minimal", nameAr: "البسيط", nameEn: "Clean Minimal",
    preview: { bar: "linear-gradient(90deg,#111,#666,#999,#666,#111)", band: "#222", paper: "#fff" },
    vars: {
      "--em":"#1a1a1a","--em2":"#333","--gd":"#555","--gd2":"#777",
      "--gdp":"#f5f5f5","--gdpp":"#fafafa","--iv":"#ffffff","--iv2":"#f8f8f8",
      "--iv3":"#eeeeee","--bdr":"#cccccc","--bdr2":"#e0e0e0",
      "--ink":"#111","--inkm":"#333","--inks":"#666","--inkf":"#999",
      "--rx-bg":"#ffffff","--band-txt":"#ffffff","--band-txt2":"rgba(255,255,255,0.5)",
      "--topbar-grad":"linear-gradient(90deg,#111 0%,#555 50%,#111 100%)",
      "--date-bg":"#1a1a1a","--date-txt":"rgba(255,255,255,0.7)","--date-strong":"#ffffff",
      "--patient-bg":"#f8f8f8",
      "--footer-bg":"linear-gradient(180deg,#f5f5f5 0%,#fff 100%)",
      "--doctor-bg":"linear-gradient(180deg,#f8f8f8 0%,transparent 80%)",
      "--th-bg":"#f0f0f0","--wm-color":"#cccccc",
    }
  },
  {
    id: "dark", nameAr: "الداكن", nameEn: "Dark Mode",
    preview: { bar: "linear-gradient(90deg,#0e0c0a,#c9a84c,#e0c060,#c9a84c,#0e0c0a)", band: "#0e0c0a", paper: "#1a1614" },
    vars: {
      "--em":"#c9a84c","--em2":"#e0bf6e","--gd":"#c9a84c","--gd2":"#e0c060",
      "--gdp":"#2a2520","--gdpp":"#221e19","--iv":"#1a1614","--iv2":"#221e19",
      "--iv3":"#2a2520","--bdr":"#3d3528","--bdr2":"#2e2820",
      "--ink":"#f0e8d0","--inkm":"#d0c090","--inks":"#a08850","--inkf":"#705830",
      "--rx-bg":"#1a1614","--band-txt":"#f5e8b0","--band-txt2":"rgba(245,232,176,0.45)",
      "--topbar-grad":"linear-gradient(90deg,#0e0c0a 0%,#c9a84c 28%,#e0c060 50%,#c9a84c 72%,#0e0c0a 100%)",
      "--date-bg":"#0e0c0a","--date-txt":"rgba(200,170,80,0.8)","--date-strong":"#c9a84c",
      "--patient-bg":"linear-gradient(135deg,rgba(42,37,32,.8) 0%,#1a1614 100%)",
      "--footer-bg":"linear-gradient(180deg,#221e19 0%,#1a1614 100%)",
      "--doctor-bg":"linear-gradient(180deg,rgba(42,37,32,0.8) 0%,transparent 80%)",
      "--th-bg":"#221e19","--wm-color":"#c9a84c",
    }
  },
  {
    id: "elegant", nameAr: "الأنيق", nameEn: "Burgundy",
    preview: { bar: "linear-gradient(90deg,#5c1a2e,#9c6b3c,#c08050,#9c6b3c,#5c1a2e)", band: "#5c1a2e", paper: "#fefaf7" },
    vars: {
      "--em":"#5c1a2e","--em2":"#7a2540","--gd":"#9c6b3c","--gd2":"#c08050",
      "--gdp":"#fdf0e8","--gdpp":"#fff5ef","--iv":"#fefaf7","--iv2":"#f8eee6",
      "--iv3":"#edddd0","--bdr":"#d4b090","--bdr2":"#e8d0c0",
      "--ink":"#1a0a05","--inkm":"#4a2010","--inks":"#7a4828","--inkf":"#b08060",
      "--rx-bg":"#fefaf7","--band-txt":"#f5ddc8","--band-txt2":"rgba(245,221,200,0.45)",
      "--topbar-grad":"linear-gradient(90deg,#5c1a2e 0%,#9c6b3c 28%,#c08050 50%,#9c6b3c 72%,#5c1a2e 100%)",
      "--date-bg":"#5c1a2e","--date-txt":"rgba(245,221,200,0.75)","--date-strong":"#f5ddc8",
      "--patient-bg":"linear-gradient(135deg,rgba(253,240,232,.5) 0%,#fff 100%)",
      "--footer-bg":"linear-gradient(180deg,#f8eee6 0%,#fefaf7 100%)",
      "--doctor-bg":"linear-gradient(180deg,#fff5ef 0%,transparent 80%)",
      "--th-bg":"#f8eee6","--wm-color":"#5c1a2e",
    }
  },
];

// ── Constants ─────────────────────────────────────────────────────────
const useDoctorProfile = (): DoctorProfile => ({
  name: "Dr. Ahmed Al-Rashidi", nameAr: "د. أحمد الراشدي",
  specialization: "Internal Medicine", specializationAr: "الطب الباطني",
  license: "IQ-MD-2021-4872", clinic: "Al-Rashidi Medical Clinic",
  clinicAr: "عيادة الراشدي الطبية", phone: "+964 771 234 5678",
  address: "Baghdad, Al-Mansour District", addressAr: "بغداد، حي المنصور",
});

let _idCounter = 0;
const uid = () => `${Date.now().toString(36)}_${++_idCounter}_${Math.random().toString(36).slice(2, 7)}`;

const newMed = (): Medication => ({
  id: uid(), name: "", dose: "", freq: "", duration: "", notes: "",
});

const FREQ_OPTIONS = [
  "مرة يومياً / Once daily","مرتين يومياً / Twice daily",
  "ثلاث مرات يومياً / Three times daily","كل 8 ساعات / Every 8 hours",
  "كل 12 ساعة / Every 12 hours","قبل الطعام / Before meals",
  "بعد الطعام / After meals","عند النوم / At bedtime","عند الحاجة / As needed",
];

const DURATION_OPTIONS = [
  "3 أيام","5 أيام","7 أيام","10 أيام","14 يوماً","شهر","شهران","3 أشهر","مستمر",
];

const DEFAULT_SECTIONS: Sections = {
  clinicName:true,doctorNameAr:true,specialization:true,licensePhone:true,
  address:true,patientRow:true,patientAge:true,patientGender:true,patientDiag:true,
  dateStrip:true,validity:true,colDose:true,colFreq:true,colDuration:true,
  colNotes:true,notesSection:true,signature:true,disclaimer:true,
};

const SECTION_LABELS: Record<SectionKey,string> = {
  clinicName:"اسم العيادة",doctorNameAr:"اسم الطبيب",specialization:"التخصص",
  licensePhone:"الهاتف والرخصة",address:"العنوان",patientRow:"صف بيانات المريض",
  patientAge:"  · العمر",patientGender:"  · الجنس",patientDiag:"  · التشخيص",
  dateStrip:"شريط التاريخ",validity:"مدة الصلاحية",colDose:"الجرعة",colFreq:"التكرار",colDuration:"المدة",
  colNotes:"ملاحظات",notesSection:"ملاحظات الطبيب",signature:"التوقيع",disclaimer:"إخلاء المسؤولية",
};

// ── Corner Ornament ───────────────────────────────────────────────────
const CornerOrnament: React.FC<{ flip?: boolean }> = ({ flip = false }) => {
  const cx = 40, cy = 40;
  const pts8 = (r: number): [number,number][] =>
    Array.from({length:8},(_,i) => {
      const a = (i*45-90)*Math.PI/180;
      return [cx+r*Math.cos(a), cy+r*Math.sin(a)];
    });
  const outerPts = pts8(34);
  const starPolygons = Array.from({length:8},(_,i) => {
    const [ox,oy] = outerPts[i], [nx,ny] = outerPts[(i+1)%8];
    const mx=(ox+nx)/2, my=(oy+ny)/2;
    const dx=mx-cx, dy=my-cy, len=Math.sqrt(dx*dx+dy*dy);
    const px=cx+(dx/len)*20, py=cy+(dy/len)*20;
    return `${ox},${oy} ${px},${py} ${nx},${ny}`;
  });
  return (
    <svg width={80} height={80} viewBox="0 0 80 80" fill="none"
      style={{transform:flip?"scaleX(-1)":"none",flexShrink:0}}>
      <circle cx={cx} cy={cy} r={36} stroke="var(--gd)" strokeWidth="0.6" opacity="0.3"/>
      <circle cx={cx} cy={cy} r={26} stroke="var(--gd)" strokeWidth="0.4" opacity="0.2"/>
      {[0,45].map(a=>(
        <rect key={a} x={cx-24} y={cy-24} width={48} height={48}
          stroke="var(--gd)" strokeWidth="0.7" opacity="0.45"
          transform={`rotate(${a} ${cx} ${cy})`}/>
      ))}
      {starPolygons.map((pts,i)=>(
        <polygon key={i} points={pts} stroke="var(--gd)" strokeWidth="0.5"
          fill="rgba(0,0,0,0.04)" opacity="0.7"/>
      ))}
      {outerPts.map(([x,y],i)=>(
        <line key={i} x1={cx} y1={cy} x2={x} y2={y}
          stroke="var(--gd)" strokeWidth="0.35" opacity="0.18"/>
      ))}
      <circle cx={cx} cy={cy} r={8} stroke="var(--gd)" strokeWidth="0.8" fill="rgba(0,0,0,0.04)"/>
      {[0,45].map(a=>(
        <rect key={`c${a}`} x={cx-5.5} y={cy-5.5} width={11} height={11}
          stroke="var(--gd)" strokeWidth="0.6" fill="rgba(0,0,0,0.04)"
          transform={`rotate(${a} ${cx} ${cy})`}/>
      ))}
    </svg>
  );
};

const OrnateDivider: React.FC<{opacity?:number}> = ({opacity=0.45}) => (
  <div style={{display:"flex",alignItems:"center",gap:8}}>
    <div style={{flex:1,height:"0.5px",background:`linear-gradient(90deg,transparent,var(--gd))`}}/>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="2" width="10" height="10" transform="rotate(45 7 7)" fill="var(--gd)" opacity={opacity}/>
      <rect x="4" y="4" width="6" height="6" transform="rotate(45 7 7)" fill="var(--rx-bg)" opacity="0.9"/>
    </svg>
    <div style={{flex:1,height:"0.5px",background:`linear-gradient(90deg,var(--gd),transparent)`}}/>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────
interface PrescriptionPageProps {
  initialDoctor?: DoctorProfile;
  initialPatientId?: string;
  initialPatientName?: string;
}

export default function PrescriptionPage({ initialDoctor, initialPatientId, initialPatientName }: PrescriptionPageProps = {}): React.ReactElement {
  const router = useRouter();
  const fallbackProfile = useDoctorProfile();
  let savedProfile: DoctorProfile | null = null;
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('doctorProfile') : null;
    if (raw) savedProfile = JSON.parse(raw);
  } catch { /* ignore malformed localStorage */ }
  const profile = savedProfile || initialDoctor || fallbackProfile;

  const [doctor, setDoctor]     = useState<DoctorProfile>(profile);
  const [editDoctor, setEditDoctor] = useState(false);
  const [draft, setDraft]       = useState<DoctorProfile>({...profile});
  const [patient, setPatient]   = useState<Patient>({name:initialPatientName||"",age:"",gender:"",diagnosis:""});
  const [meds, setMeds]         = useState<Medication[]>([newMed()]);
  const [notes, setNotes]       = useState("");
  const [sections, setSections] = useState<Sections>(DEFAULT_SECTIONS);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [themeId, setThemeId]   = useState<ThemeId>("classic");
  const [showThemes, setShowThemes] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [medSuggestions, setMedSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!initialPatientId) return;
    fetch(`/api/patients/${initialPatientId}/prescriptions`)
      .then(r => r.ok ? r.json() : [])
      .then((list: { medications: { name: string }[] }[]) => {
        const names = new Set<string>();
        list.forEach(rx => rx.medications.forEach(m => { if (m.name) names.add(m.name); }));
        setMedSuggestions(Array.from(names).sort());
      })
      .catch(() => {});
  }, [initialPatientId]);

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  const persistDoctor = (doc: DoctorProfile) => {
    if (typeof window !== 'undefined') localStorage.setItem('doctorProfile', JSON.stringify(doc));
  };

  const toggle = (k: SectionKey) => setSections(s => ({...s,[k]:!s[k]}));
  const show = (k: SectionKey) => sections[k];

  const today = new Date().toLocaleDateString("ar-IQ",{day:"2-digit",month:"long",year:"numeric"});

  const addMed = () => setMeds(p => [...p, newMed()]);
  const removeMed = (id: string) => setMeds(p => p.filter(m => m.id !== id));
  const updateMed = (id: string, key: MedKey, value: string) =>
    setMeds(p => p.map(m => m.id === id ? {...m,[key]:value} : m));
  const resetAll = () => { setPatient({name:initialPatientName||"",age:"",gender:"",diagnosis:""}); setMeds([newMed()]); setNotes(""); };

  const handleSave = async () => {
    if (!initialPatientId) return;
    const missing: string[] = [];
    if (!patient.diagnosis.trim()) missing.push("التشخيص");
    if (!patient.name.trim()) missing.push("اسم المريض");
    const emptyMeds = meds.filter(m => !m.name.trim());
    if (emptyMeds.length > 0) missing.push(`أسماء الأدوية (${emptyMeds.length} دواء)`);
    if (missing.length > 0) {
      toast.error("يرجى إكمال: " + missing.join("، "));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${initialPatientId}/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis: patient.diagnosis,
          medications: meds.map(m => ({
            name: m.name, dose: m.dose, frequency: m.freq,
            duration: m.duration, instructions: m.notes,
          })),
          notes,
          validityDays: 30,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("تم حفظ الوصفة الطبية في سجل المريض");
      router.push(`/dashboard/patients/${initialPatientId}?tab=prescriptions`);
    } catch (e) {
      toast.error("فشل الحفظ: " + (e instanceof Error ? e.message : "خطأ غير معروف"));
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const rxEl = document.querySelector(".rx") as HTMLElement | null;
    if (!rxEl) return;
    const varNames = ["--em","--em2","--gd","--gd2","--gdp","--gdpp","--iv","--iv2","--iv3","--bdr","--bdr2","--ink","--inkm","--inks","--inkf","--rx-bg","--band-txt","--band-txt2","--topbar-grad","--date-bg","--date-txt","--date-strong","--patient-bg","--footer-bg","--doctor-bg","--th-bg","--wm-color"];
    const vars = varNames.map(v => `${v}:${getComputedStyle(rxEl).getPropertyValue(v).trim()}`).filter(e => e.includes(":")).join(";");
    const styleTags = Array.from(document.querySelectorAll("style")).map(s => s.outerHTML).join("\n");
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;top:-9999px;left:0;width:210mm;height:297mm;border:none;z-index:99999";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) { document.body.removeChild(iframe); return; }
    doc.open();
    doc.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>وصفة طبية</title>${styleTags}
<style>
@page{size:A4 portrait;margin:20mm 18mm 25mm}
*{box-sizing:border-box;margin:0;padding:0}
body{margin:0;padding:0;background:#fff;display:flex;justify-content:center;font-family:'Noto Naskh Arabic',serif;color:var(--ink)}
.pg{width:100%;min-height:100%;padding:0!important;background:#fff!important;background-image:none!important}
.rx{width:100%;margin:0;border:none!important;border-radius:0!important;box-shadow:none!important;background:#fff!important;display:flex;flex-direction:column}
.no-print,.no-print *,.toolbar,.theme-bar,.cust,.ep,.rx-edit-btn,.rx-add-wrap{display:none!important}
.rx-wm{display:block!important}
.rx-wm-txt{opacity:.035!important}
.rx-row:hover,.rx-row:nth-child(even){background:transparent!important}
.rx-pf input,.rx-pf select,.rx-cell input,.rx-cell select,.rx-notes textarea{border:none!important;outline:none!important;background:transparent!important;-webkit-appearance:none!important;appearance:none!important;box-shadow:none!important;padding:0!important}
.rx-footer{margin-top:auto!important}
.rx-band,.rx-date,.rx-topbar,.rx-bottombar,.rx-footer,.rx-patient,.rx-doctor,.rx-header,.rx-th,.rx-th-cell,.rx-cell{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
</style></head><body><div class="pg" style="${vars}">${rxEl.innerHTML}</div></body></html>`);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 500);
  };

  const COLS: ColDef[] = [
    {key:"name",  label:"الدواء / Medicine",  always:true},
    {key:"dose",  label:"الجرعة / Dose",       sectionKey:"colDose"},
    {key:"freq",  label:"التكرار / Frequency", sectionKey:"colFreq"},
    {key:"duration",label:"المدة / Duration",  sectionKey:"colDuration"},
    {key:"notes", label:"ملاحظات / Notes",     sectionKey:"colNotes"},
  ];
  const cols = COLS.filter(c => c.always || (c.sectionKey && show(c.sectionKey)));
  const gridCols = `40px ${cols.map(()=>"1fr").join(" ")} 34px`;

  const DOCTOR_FIELDS: [string, keyof DoctorProfile][] = [
    ["الاسم (AR)","nameAr"],["Name (EN)","name"],
    ["التخصص (AR)","specializationAr"],["Specialization (EN)","specialization"],
    ["اسم العيادة (AR)","clinicAr"],["Clinic (EN)","clinic"],
    ["الهاتف","phone"],["رقم الرخصة","license"],
    ["العنوان (AR)","addressAr"],["Address (EN)","address"],
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .pg{
          min-height:100vh;font-family:'Noto Naskh Arabic',serif;color:var(--ink);
          padding:2rem 1rem 5rem;
          background:var(--iv);
          background-image:radial-gradient(circle,rgba(0,0,0,.04) 1px,transparent 1px);
          background-size:26px 26px;
          transition:background .3s;
        }
        .toolbar{max-width:920px;margin:0 auto 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap}
        .toolbar-title{font-family:'Amiri',serif;font-size:2.4rem;color:var(--gd);line-height:1}
        .toolbar-sub{font-family:'Cormorant Garamond',serif;font-size:.73rem;color:var(--inks);letter-spacing:.1em;text-transform:uppercase;margin-top:.15rem}
        .toolbar-btns{display:flex;gap:.5rem;flex-wrap:wrap}
        .tbtn{height:36px;padding:0 1.1rem;border-radius:6px;font-size:.78rem;font-family:'Noto Naskh Arabic',serif;cursor:pointer;display:flex;align-items:center;gap:.4rem;transition:all .18s;border:1px solid transparent}
        .tbtn-ol{background:var(--iv);border-color:var(--bdr);color:var(--inkm)}
        .tbtn-ol:hover{border-color:var(--gd);color:var(--gd);background:var(--gdp)}
        .tbtn-sd{background:var(--em);color:var(--band-txt);border-color:var(--em)}
        .tbtn-sd:hover{background:var(--em2)}
        .tbtn-gh{background:var(--iv);border-color:var(--bdr);color:var(--inkm)}
        .tbtn-gh:hover{background:var(--iv2)}
        .tbtn-ac{background:var(--gdp);border-color:var(--gd);color:var(--gd)}

        /* Theme picker */
        .theme-bar{max-width:920px;margin:0 auto 1.5rem;background:var(--iv);border:1px solid var(--bdr);border-radius:10px;overflow:hidden}
        .theme-bar-head{padding:.75rem 1.25rem;background:var(--iv2);border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between;direction:rtl}
        .theme-bar-title{font-family:'Noto Naskh Arabic',serif;font-size:.82rem;font-weight:700;color:var(--inkm)}
        .theme-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:.75rem;padding:1rem 1.25rem}
        .theme-card{border:2px solid var(--bdr2);border-radius:8px;overflow:hidden;cursor:pointer;transition:all .2s}
        .theme-card:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.12)}
        .theme-card.active{border-color:var(--gd);box-shadow:0 0 0 1px var(--gd)}
        .theme-preview-wrap{height:44px;display:flex;flex-direction:column;overflow:hidden}
        .theme-preview-bar{height:5px;flex-shrink:0}
        .theme-preview-band{flex:1;display:flex;align-items:center;justify-content:center;padding:0 8px}
        .theme-preview-line{height:5px;border-radius:2px;width:65%;opacity:.6}
        .theme-preview-paper{height:12px;flex-shrink:0;border-top:1px solid rgba(0,0,0,.08)}
        .theme-name{padding:.3rem .5rem;background:var(--iv2);text-align:center}
        .theme-name-ar{display:block;font-size:.68rem;font-weight:700;color:var(--inkm);font-family:'Noto Naskh Arabic',serif}
        .theme-name-en{display:block;font-size:.57rem;color:var(--inkf);font-family:'Cormorant Garamond',serif}

        /* Customizer */
        .cust{max-width:920px;margin:0 auto 1.5rem;background:var(--iv);border:1px solid var(--bdr);border-radius:10px;overflow:hidden}
        .cust-head{padding:.75rem 1.25rem;background:var(--iv2);border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between;direction:rtl}
        .cust-title{font-family:'Noto Naskh Arabic',serif;font-size:.82rem;font-weight:700;color:var(--inkm)}
        .cust-hint{font-size:.7rem;color:var(--inkf);font-weight:400;margin-right:.5rem}
        .cust-rst{font-size:.7rem;color:var(--inks);background:none;border:none;cursor:pointer;font-family:inherit;text-decoration:underline}
        .cust-rst:hover{color:var(--gd)}
        .cust-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
        .tog-item{display:flex;align-items:center;justify-content:space-between;padding:.55rem 1.1rem;border-bottom:1px solid var(--bdr2);border-left:1px solid var(--bdr2);cursor:pointer;transition:background .1s;direction:rtl;user-select:none}
        .tog-item:hover{background:var(--iv2)}
        .tog-lbl{font-size:.78rem;color:var(--inkm)}
        .tog-lbl.off{color:var(--inkf);text-decoration:line-through}
        .tog-sw{width:28px;height:16px;background:var(--bdr);border-radius:8px;position:relative;flex-shrink:0;transition:background .2s;margin-right:.6rem}
        .tog-sw.on{background:var(--gd)}
        .tog-sw::after{content:'';position:absolute;width:12px;height:12px;background:#fff;border-radius:50%;top:2px;left:2px;transition:transform .2s;box-shadow:0 1px 2px rgba(0,0,0,.15)}
        .tog-sw.on::after{transform:translateX(12px)}

        /* Edit panel */
        .ep{max-width:920px;margin:0 auto 1.5rem;background:var(--iv);border:1px solid var(--bdr);border-radius:10px;padding:1.25rem 1.5rem}
        .ep-head{font-family:'Amiri',serif;font-size:1.1rem;font-weight:700;color:var(--gd);margin-bottom:1rem;direction:rtl}
        .ep-grid{display:grid;grid-template-columns:1fr 1fr;gap:.7rem}
        .ef{display:flex;flex-direction:column;gap:.25rem}
        .ef label{font-size:.65rem;color:var(--inks);font-weight:600;text-transform:uppercase;letter-spacing:.06em}
        .ef input{height:34px;border:1px solid var(--bdr);border-radius:6px;padding:0 .7rem;font-size:.875rem;font-family:'Noto Naskh Arabic',serif;color:var(--ink);outline:none;background:var(--iv2);transition:border-color .15s}
        .ef input:focus{border-color:var(--gd)}
        .ep-foot{display:flex;justify-content:flex-end;gap:.6rem;margin-top:1rem;padding-top:.875rem;border-top:1px solid var(--bdr2)}

        /* Prescription paper — A4 look */
        .rx{max-width:920px;margin:0 auto;background:var(--rx-bg);border:1px solid var(--bdr);border-radius:4px;overflow:hidden;position:relative;transition:background .3s,border-color .3s;box-shadow:0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06),0 24px 48px rgba(0,0,0,.08)}
        .rx-wm{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;display:flex;align-items:center;justify-content:center}
        .rx-wm-txt{font-family:'Amiri',serif;font-size:9rem;font-weight:700;color:var(--wm-color);opacity:.028;white-space:nowrap;transform:rotate(-28deg);user-select:none;letter-spacing:.06em}
        .rx-topbar,.rx-bottombar{height:6px;background:var(--topbar-grad);position:relative;z-index:1;transition:background .3s}
        .rx-header{position:relative;z-index:1;border-bottom:1px solid var(--bdr)}
        .rx-band{background:var(--em);padding:.65rem 1.75rem .6rem;display:flex;align-items:center;justify-content:space-between;direction:rtl;transition:background .3s}
        .rx-band-left{display:flex;align-items:center;gap:.8rem}
        .rx-band-clinic{font-family:'Amiri',serif;font-size:1.2rem;font-weight:700;color:var(--band-txt);letter-spacing:.025em}
        .rx-band-clinic-en{font-family:'Cormorant Garamond',serif;font-size:.66rem;color:var(--band-txt2);letter-spacing:.07em;font-style:italic;margin-top:.05rem}
        .rx-band-right{display:flex;flex-direction:column;align-items:flex-start;gap:.08rem}
        .rx-band-spec{font-family:'Amiri',serif;font-size:1rem;color:var(--gd2);letter-spacing:.02em}
        .rx-band-spec-en{font-family:'Cormorant Garamond',serif;font-size:.6rem;color:var(--band-txt2);letter-spacing:.06em;font-style:italic}
        .rx-doctor{padding:1.5rem 1.75rem 1.25rem;display:flex;align-items:flex-start;justify-content:space-between;gap:1.5rem;direction:rtl;background:var(--doctor-bg);transition:background .3s}
        .rx-doc-name-ar{font-family:'Amiri',serif;font-size:3.1rem;font-weight:700;color:var(--em);line-height:1.1;letter-spacing:.02em;transition:color .3s}
        .rx-doc-name-en{font-family:'Cormorant Garamond',serif;font-size:.85rem;color:var(--inks);font-style:italic;letter-spacing:.04em;direction:ltr;text-align:right;margin-top:.1rem}
        .rx-doc-spec{font-family:'Noto Naskh Arabic',serif;font-size:.78rem;color:var(--gd);font-weight:600;margin-top:.25rem}
        .rx-doc-meta{font-size:.68rem;color:var(--inks);font-family:'Cormorant Garamond',serif;letter-spacing:.02em;line-height:2;direction:rtl;text-align:right;flex-shrink:0}
        .rx-edit-btn{display:block;margin-top:.35rem;font-size:.66rem;color:var(--gd);background:none;border:1px solid var(--bdr);border-radius:5px;padding:.18rem .6rem;cursor:pointer;font-family:'Noto Naskh Arabic',serif;transition:all .15s}
        .rx-edit-btn:hover{background:var(--gdp);border-color:var(--gd)}
        .rx-patient{display:flex;border-bottom:1px solid var(--bdr);position:relative;z-index:1;direction:rtl;background:var(--patient-bg);transition:background .3s}
        .rx-pf{padding:.72rem 1.3rem;border-left:1px solid var(--bdr2);flex:1;min-width:0}
        .rx-pf:first-child{border-left:none}
        .rx-pf-lbl{font-size:.57rem;font-weight:700;color:var(--inkf);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.22rem;font-family:'Cormorant Garamond',serif}
        .rx-pf input,.rx-pf select{width:100%;border:none;outline:none;font-size:.86rem;font-family:'Noto Naskh Arabic',serif;color:var(--ink);background:transparent;font-weight:500;padding:0;direction:rtl}
        .rx-pf input::placeholder{color:var(--bdr2);font-weight:400}
        .rx-date{display:flex;align-items:center;justify-content:space-between;padding:.4rem 1.5rem;background:var(--date-bg);position:relative;z-index:1;direction:rtl;transition:background .3s}
        .rx-date span{font-size:.67rem;color:var(--date-txt);font-family:'Noto Naskh Arabic',serif}
        .rx-date strong{color:var(--date-strong)}
        .rx-th{display:grid;background:var(--th-bg);border-bottom:1px solid var(--bdr);position:relative;z-index:1;direction:ltr;transition:background .3s}
        .rx-th-cell{font-size:.59rem;font-weight:700;color:var(--inks);text-transform:uppercase;letter-spacing:.07em;padding:.4rem .55rem;font-family:'Cormorant Garamond',serif;border-right:1px solid var(--bdr2);text-align:left}
        .rx-th-cell:first-child,.rx-th-cell:last-child{border-right:none}
        .rx-row{display:grid;align-items:center;border-bottom:1px solid var(--bdr2);position:relative;z-index:1;direction:ltr;transition:background .1s}
        .rx-row:last-child{border-bottom:none}
        .rx-row:nth-child(even){background:rgba(0,0,0,.018)}
        .rx-row:hover{background:var(--gdpp)}
        .rx-idx{display:flex;align-items:center;justify-content:center;padding-right:.75rem}
        .rx-idx span{width:22px;height:22px;border-radius:50%;background:var(--em);color:var(--band-txt);font-size:.62rem;font-weight:700;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;flex-shrink:0;transition:background .3s}
        .rx-cell{padding:.56rem .55rem;border-right:1px solid var(--bdr2)}
        .rx-cell:last-of-type{border-right:none}

        /* ── KEY FIX: separate rules for input vs select in cells ── */
        .rx-cell input{
          width:100%;border:none;outline:none;font-size:.82rem;
          font-family:'Noto Naskh Arabic',serif;color:var(--ink);background:transparent;
          direction:ltr;text-align:left;
        }
        /* Arabic selects (freq, duration) must be RTL so text reads correctly */
        .rx-cell select{
          width:100%;border:none;outline:none;font-size:.82rem;
          font-family:'Noto Naskh Arabic',serif;color:var(--inkm);background:transparent;
          direction:rtl;text-align:right;
        }
        .rx-cell input::placeholder{color:var(--bdr)}
        .rx-del{display:flex;align-items:center;justify-content:center}
        .rx-del button{width:22px;height:22px;border:none;background:none;color:var(--bdr);cursor:pointer;font-size:1rem;border-radius:4px;display:flex;align-items:center;justify-content:center;transition:all .15s}
        .rx-del button:hover{background:#fff0f0;color:#c0392b}
        .rx-add-wrap{padding:.75rem 1.5rem;border-top:1px dashed var(--bdr);position:relative;z-index:1;direction:rtl}
        .rx-add-btn{background:none;border:1.5px dashed var(--bdr);border-radius:7px;padding:.36rem .9rem;font-size:.77rem;color:var(--inks);cursor:pointer;font-family:'Noto Naskh Arabic',serif;display:inline-flex;align-items:center;gap:.45rem;transition:all .18s}
        .rx-add-btn:hover{border-color:var(--gd);color:var(--gd);background:var(--gdp)}
        .rx-add-btn:hover .rx-plus{background:var(--gd);color:#fff}
        .rx-plus{width:18px;height:18px;border-radius:50%;background:var(--bdr);color:var(--inks);font-size:.9rem;display:flex;align-items:center;justify-content:center;transition:all .18s;flex-shrink:0}
        .rx-notes{padding:.78rem 1.5rem;position:relative;z-index:1;direction:rtl}
        .rx-notes-lbl{font-size:.59rem;font-weight:700;color:var(--inkf);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.28rem;font-family:'Cormorant Garamond',serif}
        .rx-notes textarea{width:100%;border:none;outline:none;font-size:.875rem;font-family:'Noto Naskh Arabic',serif;color:var(--inkm);resize:none;background:transparent;line-height:1.7;min-height:44px;direction:rtl}
        .rx-notes textarea::placeholder{color:var(--bdr)}
        .rx-footer{display:flex;align-items:flex-end;justify-content:space-between;padding:1.4rem 1.75rem 1.6rem;border-top:1px solid var(--bdr);background:var(--footer-bg);gap:2rem;position:relative;z-index:1;direction:rtl;transition:background .3s}
        .rx-footer-left{display:flex;flex-direction:column;gap:.5rem;align-items:flex-end}
        .rx-disclaimer{font-size:.63rem;color:var(--inkf);line-height:1.75;font-family:'Cormorant Garamond',serif;font-style:italic;direction:rtl;text-align:right}
        .rx-seal{display:flex;align-items:center;gap:.6rem;margin-top:.2rem}
        .rx-seal-circle{width:72px;height:72px;border-radius:50%;border:1px solid var(--bdr);background:rgba(0,0,0,.02);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;flex-shrink:0}
        .rx-seal-text{font-family:'Amiri',serif;font-size:.68rem;color:var(--gd);text-align:center;line-height:1.35;font-weight:700}
        .rx-seal-hr{width:44px;height:.5px;background:var(--bdr);margin:.1rem 0}
        .rx-seal-sub{font-size:.48rem;color:var(--inkf);font-family:'Cormorant Garamond',serif;letter-spacing:.04em}
        .rx-sig{text-align:center;min-width:185px}
        .rx-sig-space{height:52px;border-bottom:1px solid var(--bdr);margin-bottom:.45rem;background:repeating-linear-gradient(-45deg,transparent,transparent 5px,rgba(0,0,0,.025) 5px,rgba(0,0,0,.025) 6px)}
        .rx-sig-name-ar{font-family:'Amiri',serif;font-size:1.15rem;color:var(--em);direction:rtl;font-weight:700}
        .rx-sig-name-en{font-family:'Cormorant Garamond',serif;font-size:.73rem;color:var(--inks);font-style:italic;margin-top:.08rem}
        .rx-sig-lbl{font-size:.57rem;color:var(--inkf);text-transform:uppercase;letter-spacing:.1em;margin-top:.28rem;font-family:'Cormorant Garamond',serif}

        @media print{.no-print,.toolbar,.theme-bar,.cust,.ep{display:none!important}}
        @media(max-width:660px){
          .rx-doctor{flex-direction:column;gap:1rem}
          .rx-patient{flex-wrap:wrap}
          .rx-pf{flex:1 1 45%}
          .ep-grid{grid-template-columns:1fr}
          .cust-grid{grid-template-columns:1fr}
          .theme-grid{grid-template-columns:repeat(3,1fr)}
          .rx-doc-name-ar{font-size:2.2rem}
          .rx-footer{flex-direction:column;align-items:flex-start}
          .rx-footer-left{align-items:flex-start}
        }
      `}</style>

      <div className="pg" style={theme.vars as React.CSSProperties}>

        {/* TOOLBAR */}
        <div className="toolbar no-print">
          <div>
            <div className="toolbar-title">وصفة طبية</div>
            <div className="toolbar-sub">Medical Prescription</div>
          </div>
          <div className="toolbar-btns">
            <button className="tbtn tbtn-ol" onClick={resetAll}>↺ جديد</button>
            <button
              className={`tbtn ${showThemes?"tbtn-ac":"tbtn-gh"}`}
              onClick={()=>{setShowThemes(s=>!s);setShowCustomizer(false)}}
            >🎨 النمط</button>
            <button
              className={`tbtn ${showCustomizer?"tbtn-ac":"tbtn-gh"}`}
              onClick={()=>{setShowCustomizer(s=>!s);setShowThemes(false)}}
            >⚙ تخصيص</button>
            {initialPatientId && (
              <button className="tbtn tbtn-sd" onClick={handleSave} disabled={saving}>
                {saving ? "⏳ جاري الحفظ..." : "💾 حفظ في السجل"}
              </button>
            )}
            <button type="button" className="tbtn tbtn-sd" onClick={handlePrint}>⎙ PDF</button>
          </div>
        </div>

        {/* THEME PICKER */}
        {showThemes && (
          <div className="theme-bar no-print">
            <div className="theme-bar-head">
              <div className="theme-bar-title">🎨 اختر نمط الوصفة الطبية</div>
              <span style={{fontSize:".7rem",color:"var(--inkf)"}}>Choose prescription style</span>
            </div>
            <div className="theme-grid">
              {THEMES.map(t => (
                <div key={t.id} className={`theme-card${themeId===t.id?" active":""}`} onClick={()=>setThemeId(t.id)}>
                  <div className="theme-preview-wrap">
                    <div className="theme-preview-bar" style={{background:t.preview.bar}}/>
                    <div className="theme-preview-band" style={{background:t.preview.band}}>
                      <div className="theme-preview-line" style={{background:t.vars["--band-txt"]||"#fff"}}/>
                    </div>
                    <div className="theme-preview-paper" style={{background:t.preview.paper}}/>
                  </div>
                  <div className="theme-name">
                    <span className="theme-name-ar">{t.nameAr}</span>
                    <span className="theme-name-en">{t.nameEn}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CUSTOMIZER */}
        {showCustomizer && (
          <div className="cust no-print">
            <div className="cust-head">
              <div className="cust-title">تخصيص الوصفة<span className="cust-hint"> — تفعيل أو إخفاء الأقسام</span></div>
              <button className="cust-rst" onClick={()=>setSections({...DEFAULT_SECTIONS})}>إعادة تعيين</button>
            </div>
            <div className="cust-grid">
              {(Object.keys(DEFAULT_SECTIONS) as SectionKey[]).map(key=>(
                <div key={key} className="tog-item" onClick={()=>toggle(key)}>
                  <span className={`tog-lbl${sections[key]?"":" off"}`}>{SECTION_LABELS[key]}</span>
                  <div className={`tog-sw${sections[key]?" on":""}`}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDIT DOCTOR */}
        {editDoctor && (
          <div className="ep no-print">
            <div className="ep-head">✎ تعديل بيانات الطبيب</div>
            <div className="ep-grid">
              {DOCTOR_FIELDS.map(([lbl,key])=>(
                <div className="ef" key={key}>
                  <label>{lbl}</label>
                  <input value={draft[key]??""} onChange={e=>setDraft(d=>({...d,[key]:e.target.value}))}/>
                </div>
              ))}
            </div>
            <div className="ep-foot">
              <button className="tbtn tbtn-ol" onClick={()=>setEditDoctor(false)}>إلغاء</button>
              <button className="tbtn tbtn-sd" onClick={()=>{setDoctor({...draft});persistDoctor({...draft});setEditDoctor(false)}}>حفظ</button>
            </div>
          </div>
        )}

        {/* PRESCRIPTION PAPER */}
        <div className="rx">
          <div className="rx-wm" aria-hidden="true">
            <div className="rx-wm-txt">{doctor.specializationAr}</div>
          </div>
          <div className="rx-topbar"/>

          {/* HEADER */}
          <div className="rx-header">
            <div className="rx-band">
              <div className="rx-band-left">
                <CornerOrnament/>
                {show("clinicName")&&(
                  <div>
                    <div className="rx-band-clinic">{doctor.clinicAr}</div>
                    <div className="rx-band-clinic-en">{doctor.clinic}</div>
                  </div>
                )}
              </div>
              <div className="rx-band-right">
                {show("specialization")&&(
                  <>
                    <div className="rx-band-spec">{doctor.specializationAr}</div>
                    <div className="rx-band-spec-en">{doctor.specialization}</div>
                  </>
                )}
              </div>
            </div>
            <div style={{padding:"0 1.75rem"}}><OrnateDivider opacity={0.38}/></div>
            <div className="rx-doctor">
              <div>
                <div className="rx-doc-meta">
                  {show("licensePhone")&&<>{doctor.phone}<br/></>}
                  {show("address")&&<>{doctor.addressAr}<br/></>}
                  {show("licensePhone")&&<span style={{fontSize:".6rem",opacity:.6}}>Lic. {doctor.license}</span>}
                </div>
                <button className="rx-edit-btn no-print" onClick={()=>{setDraft({...doctor});setEditDoctor(true)}}>✎ تعديل</button>
              </div>
              <div>
                {show("doctorNameAr")&&<div className="rx-doc-name-ar">{doctor.nameAr}</div>}
                <div className="rx-doc-name-en">{doctor.name}</div>
                {show("specialization")&&<div className="rx-doc-spec">{doctor.specializationAr} · {doctor.specialization}</div>}
              </div>
            </div>
            <div style={{padding:"0 1.75rem .8rem"}}><OrnateDivider opacity={0.42}/></div>
          </div>

          {/* PATIENT ROW */}
          {show("patientRow")&&(
            <div className="rx-patient">
              <div className="rx-pf" style={{flex:2}}>
                <div className="rx-pf-lbl">Patient Name / اسم المريض</div>
                <input value={patient.name} onChange={e=>setPatient(p=>({...p,name:e.target.value}))} placeholder="الاسم الكامل..."/>
              </div>
              {show("patientAge")&&(
                <div className="rx-pf">
                  <div className="rx-pf-lbl">Age / العمر</div>
                  <input value={patient.age} onChange={e=>setPatient(p=>({...p,age:e.target.value}))} placeholder="—"/>
                </div>
              )}
              {show("patientGender")&&(
                <div className="rx-pf">
                  <div className="rx-pf-lbl">Gender / الجنس</div>
                  <select value={patient.gender} onChange={e=>setPatient(p=>({...p,gender:e.target.value}))}>
                    <option value="">—</option>
                    <option value="ذكر">ذكر / Male</option>
                    <option value="أنثى">أنثى / Female</option>
                  </select>
                </div>
              )}
              {show("patientDiag")&&(
                <div className="rx-pf" style={{flex:2}}>
                  <div className="rx-pf-lbl">Diagnosis / التشخيص</div>
                  <input value={patient.diagnosis} onChange={e=>setPatient(p=>({...p,diagnosis:e.target.value}))} placeholder="أدخل التشخيص الطبي"/>
                </div>
              )}
            </div>
          )}

          {/* DATE */}
          {show("dateStrip")&&(
            <div className="rx-date">
              {show("validity")&&<span>صالحة لمدة ٣٠ يوماً · Valid 30 days</span>}
              <span>التاريخ: <strong>{today}</strong></span>
            </div>
          )}

          {/* TABLE HEADER */}
          <div className="rx-th" style={{gridTemplateColumns:gridCols}}>
            <div className="rx-th-cell"/>
            {cols.map(c=><div key={c.key} className="rx-th-cell">{c.label}</div>)}
            <div className="rx-th-cell"/>
          </div>

          {/* MED ROWS */}
          <div>
            {meds.map((med,i)=>(
              <div className="rx-row" key={med.id} style={{gridTemplateColumns:gridCols}}>
                <div className="rx-idx"><span>{i+1}</span></div>
                {cols.map(c=>(
                  <div className="rx-cell" key={c.key}>
                    {c.key==="freq" ? (
                      <select
                        value={med.freq}
                        onChange={e=>updateMed(med.id,"freq",e.target.value)}
                        dir="rtl"
                      >
                        <option value="">—</option>
                        {FREQ_OPTIONS.map(f=><option key={f} value={f}>{f}</option>)}
                      </select>
                    ) : c.key==="duration" ? (
                      <select
                        value={med.duration}
                        onChange={e=>updateMed(med.id,"duration",e.target.value)}
                        dir="rtl"
                      >
                        <option value="">—</option>
                        {DURATION_OPTIONS.map(d=><option key={d} value={d}>{d}</option>)}
                      </select>
                    ) : (
                      <input
                        value={med[c.key]}
                        onChange={e=>updateMed(med.id,c.key,e.target.value)}
                        dir="auto"
                        style={{textAlign:"start"}}
                        placeholder={c.key==="name"?"Drug name, form...":c.key==="dose"?"500 mg":c.key==="notes"?"e.g. with food":""}
                        list={c.key==="name"?"med-suggestions":undefined}
                      />
                    )}
                  </div>
                ))}
                <div className="rx-del">
                  {meds.length>1&&<button className="no-print" onClick={()=>removeMed(med.id)}>×</button>}
                </div>
              </div>
            ))}
          </div>

          <datalist id="med-suggestions">
            {medSuggestions.map(name => <option key={name} value={name} />)}
          </datalist>

          {/* ADD MED */}
          <div className="rx-add-wrap no-print">
            <button className="rx-add-btn" onClick={addMed}>
              <span className="rx-plus">+</span>
              إضافة دواء / Add medication
            </button>
          </div>

          {/* NOTES */}
          {show("notesSection")&&(
            <>
              <div style={{padding:"0 1.5rem"}}><OrnateDivider opacity={0.22}/></div>
              <div className="rx-notes">
                <div className="rx-notes-lbl">Doctor's Notes / ملاحظات الطبيب</div>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="تعليمات إضافية، موعد متابعة، نصائح..." rows={2}/>
              </div>
            </>
          )}

          {/* FOOTER */}
          {show("signature")&&(
            <div className="rx-footer">
              <div className="rx-footer-left">
                {show("disclaimer")&&(
                  <p className="rx-disclaimer">
                    هذه الوصفة وثيقة طبية رسمية معتمدة.<br/>
                    This is an official certified medical document.
                  </p>
                )}
                <div className="rx-seal">
                  <div className="rx-seal-circle">
                    <div className="rx-seal-text">{doctor.specializationAr.split(" ").slice(0,2).join(" ")}</div>
                    <div className="rx-seal-hr"/>
                    <div className="rx-seal-sub">Official Seal</div>
                  </div>
                  <CornerOrnament flip={true}/>
                </div>
              </div>
              <div className="rx-sig">
                <div className="rx-sig-space"/>
                <div className="rx-sig-name-ar">{doctor.nameAr}</div>
                <div className="rx-sig-name-en">{doctor.name}</div>
                <div className="rx-sig-lbl">Signature / التوقيع</div>
              </div>
            </div>
          )}

          <div className="rx-bottombar"/>
        </div>

      </div>
    </>
  );
}
