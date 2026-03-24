"use client";
import { useState, useRef } from "react";

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  indigo:"#4F46E5", indigoL:"#EEF2FF", indigoDark:"#3730A3", indigoDeep:"#1E1B4B",
  mint:"#10B981",   mintL:"#ECFDF5",
  amber:"#F59E0B",  amberL:"#FFFBEB",
  red:"#EF4444",    redL:"#FEF2F2",
  sky:"#0EA5E9",    skyL:"#E0F2FE",
  violet:"#8B5CF6", violetL:"#F5F3FF",
  ink:"#0F172A",    slate:"#334155",  muted:"#64748B",
  border:"#E2E8F0", bg:"#F8FAFC",    white:"#FFFFFF",
  sidebarBg:"#1E1B4B", sidebarText:"#C7D2FE", sidebarActive:"#4F46E5",
};

// ── i18n ──────────────────────────────────────────────────────────────────────
const L = {
  ar:{
    dir:"rtl", lang:"ar",
    logo:"موعد",  logoSub:"لوحة الإدارة",
    nav:{
      dashboard:"الرئيسية", appointments:"المواعيد", doctors:"الأطباء",
      patients:"المرضى", clinics:"العيادات", reports:"التقارير",
      payments:"المدفوعات", settings:"الإعدادات",
    },
    topbar:{ search:"ابحث عن مريض، طبيب، موعد...", notif:"الإشعارات", profile:"د. أدمن" },
    dashboard:{
      welcome:"مرحباً، أدمن 👋", sub:"إليك ملخص اليوم",
      cards:[
        { label:"مواعيد اليوم",    value:"٤٨",    delta:"+١٢٪",  up:true,  icon:"📅", color:C.indigo, bg:C.indigoL },
        { label:"مرضى جدد",       value:"١٧",    delta:"+٥٪",   up:true,  icon:"👤", color:C.mint,   bg:C.mintL },
        { label:"إيرادات اليوم",  value:"٢٤٢,٠٠٠ د",delta:"+٨٪", up:true, icon:"💰", color:C.amber,  bg:C.amberL },
        { label:"مواعيد ملغاة",   value:"٣",     delta:"-٢",    up:false, icon:"❌", color:C.red,    bg:C.redL },
      ],
      recentTitle:"آخر المواعيد",
      chartTitle:"المواعيد — آخر ٧ أيام",
      quickTitle:"إجراءات سريعة",
      quick:[
        { icon:"➕", label:"موعد جديد",    color:C.indigo },
        { icon:"👨‍⚕️", label:"إضافة طبيب", color:C.mint },
        { icon:"👤", label:"مريض جديد",    color:C.violet },
        { icon:"📊", label:"تقرير اليوم",  color:C.amber },
      ],
      topDoctorsTitle:"الأطباء الأكثر حجزاً",
    },
    appointments:{
      title:"إدارة المواعيد",
      add:"+ موعد جديد",
      filters:["الكل","اليوم","هذا الأسبوع","قادم","مكتمل","ملغي"],
      cols:["#","المريض","الطبيب","التخصص","التاريخ","الوقت","الحالة","إجراء"],
      statuses:{ confirmed:"مؤكد", pending:"معلّق", completed:"مكتمل", cancelled:"ملغي" },
      actions:{ view:"عرض", edit:"تعديل", cancel:"إلغاء" },
      modalTitle:"موعد جديد",
      modalFields:{ patient:"اسم المريض", doctor:"الطبيب", date:"التاريخ", time:"الوقت", type:"نوع الجلسة", notes:"ملاحظات" },
      save:"حفظ الموعد", close:"إغلاق",
    },
    doctors:{
      title:"إدارة الأطباء",
      add:"+ إضافة طبيب",
      cols:["الطبيب","التخصص","العيادة","المرضى","التقييم","الحالة","إجراء"],
      statuses:{ active:"نشط", inactive:"غير نشط" },
      actions:{ view:"عرض", edit:"تعديل", toggle:"تعطيل" },
      modalTitle:"إضافة طبيب جديد",
      modalFields:{ name:"الاسم الكامل", spec:"التخصص", clinic:"العيادة", phone:"الهاتف", email:"البريد الإلكتروني", fee:"رسوم الجلسة" },
      save:"إضافة الطبيب", close:"إغلاق",
    },
    patients:{
      title:"سجلات المرضى",
      add:"+ مريض جديد",
      cols:["المريض","الهاتف","آخر زيارة","عدد الزيارات","المبلغ الكلي","الحالة","إجراء"],
      statuses:{ active:"نشط", new:"جديد" },
      actions:{ view:"ملف المريض", book:"حجز موعد" },
    },
    clinics:{
      title:"العيادات والفروع",
      add:"+ إضافة عيادة",
      cols:["العيادة","المدينة","الأطباء","المرضى","الإيرادات","الحالة","إجراء"],
      statuses:{ active:"نشطة", inactive:"معلّقة" },
      actions:{ manage:"إدارة", report:"تقرير" },
    },
    reports:{
      title:"التقارير والإحصائيات",
      tabs:["نظرة عامة","الإيرادات","المرضى","الأطباء"],
      period:["اليوم","هذا الأسبوع","هذا الشهر","هذا العام"],
      export:"تصدير PDF",
      kpis:[
        { label:"إجمالي الإيرادات",  value:"٤,٢٣٠,٠٠٠ د",  delta:"+٢٢٪" },
        { label:"إجمالي المرضى",     value:"٣,٨٤١",          delta:"+١٤٪" },
        { label:"إجمالي الجلسات",    value:"١٢,٦٠٩",         delta:"+١٨٪" },
        { label:"متوسط التقييم",     value:"٤.٨ / ٥",        delta:"+٠.٣" },
      ],
    },
    payments:{
      title:"المدفوعات والفواتير",
      add:"+ فاتورة جديدة",
      cols:["رقم الفاتورة","المريض","الطبيب","المبلغ","التاريخ","الحالة","إجراء"],
      statuses:{ paid:"مدفوع", pending:"معلّق", refunded:"مسترد" },
      actions:{ view:"عرض", receipt:"إيصال" },
    },
    settings:{
      title:"الإعدادات",
      tabs:["الحساب","الإشعارات","المظهر","النظام"],
      save:"حفظ التغييرات",
      fields:{
        clinicName:"اسم العيادة / المنصة",
        email:"البريد الإلكتروني",
        phone:"رقم الهاتف",
        address:"العنوان",
        currency:"العملة",
        lang:"اللغة الافتراضية",
        timezone:"المنطقة الزمنية",
        smsReminder:"تذكير SMS",
        waReminder:"تذكير واتساب",
        emailNotif:"إشعارات البريد",
        autoConfirm:"تأكيد تلقائي للمواعيد",
      },
    },
    statusColors:{
      confirmed:{ bg:"#ECFDF5", color:"#059669" },
      pending:{ bg:"#FFFBEB", color:"#D97706" },
      completed:{ bg:"#EEF2FF", color:"#4F46E5" },
      cancelled:{ bg:"#FEF2F2", color:"#DC2626" },
      active:{ bg:"#ECFDF5", color:"#059669" },
      inactive:{ bg:"#F1F5F9", color:"#64748B" },
      new:{ bg:"#E0F2FE", color:"#0284C7" },
      paid:{ bg:"#ECFDF5", color:"#059669" },
      refunded:{ bg:"#FEF2F2", color:"#DC2626" },
    },
  },
  en:{
    dir:"ltr", lang:"en",
    logo:"Mawid", logoSub:"Admin Panel",
    nav:{
      dashboard:"Dashboard", appointments:"Appointments", doctors:"Doctors",
      patients:"Patients", clinics:"Clinics", reports:"Reports",
      payments:"Payments", settings:"Settings",
    },
    topbar:{ search:"Search patient, doctor, appointment...", notif:"Notifications", profile:"Admin" },
    dashboard:{
      welcome:"Welcome back, Admin 👋", sub:"Here's your today's summary",
      cards:[
        { label:"Today's Appointments", value:"48",    delta:"+12%", up:true,  icon:"📅", color:C.indigo, bg:C.indigoL },
        { label:"New Patients",         value:"17",    delta:"+5%",  up:true,  icon:"👤", color:C.mint,   bg:C.mintL },
        { label:"Today's Revenue",      value:"$163",  delta:"+8%",  up:true,  icon:"💰", color:C.amber,  bg:C.amberL },
        { label:"Cancelled",            value:"3",     delta:"-2",   up:false, icon:"❌", color:C.red,    bg:C.redL },
      ],
      recentTitle:"Recent Appointments",
      chartTitle:"Appointments — Last 7 Days",
      quickTitle:"Quick Actions",
      quick:[
        { icon:"➕", label:"New Appointment", color:C.indigo },
        { icon:"👨‍⚕️", label:"Add Doctor",    color:C.mint },
        { icon:"👤", label:"New Patient",      color:C.violet },
        { icon:"📊", label:"Today's Report",   color:C.amber },
      ],
      topDoctorsTitle:"Top Booked Doctors",
    },
    appointments:{
      title:"Appointment Management",
      add:"+ New Appointment",
      filters:["All","Today","This Week","Upcoming","Completed","Cancelled"],
      cols:["#","Patient","Doctor","Specialty","Date","Time","Status","Action"],
      statuses:{ confirmed:"Confirmed", pending:"Pending", completed:"Completed", cancelled:"Cancelled" },
      actions:{ view:"View", edit:"Edit", cancel:"Cancel" },
      modalTitle:"New Appointment",
      modalFields:{ patient:"Patient Name", doctor:"Doctor", date:"Date", time:"Time", type:"Session Type", notes:"Notes" },
      save:"Save Appointment", close:"Close",
    },
    doctors:{
      title:"Doctor Management",
      add:"+ Add Doctor",
      cols:["Doctor","Specialty","Clinic","Patients","Rating","Status","Action"],
      statuses:{ active:"Active", inactive:"Inactive" },
      actions:{ view:"View", edit:"Edit", toggle:"Disable" },
      modalTitle:"Add New Doctor",
      modalFields:{ name:"Full Name", spec:"Specialty", clinic:"Clinic", phone:"Phone", email:"Email", fee:"Session Fee" },
      save:"Add Doctor", close:"Close",
    },
    patients:{
      title:"Patient Records",
      add:"+ New Patient",
      cols:["Patient","Phone","Last Visit","Visits","Total Paid","Status","Action"],
      statuses:{ active:"Active", new:"New" },
      actions:{ view:"Patient File", book:"Book Appointment" },
    },
    clinics:{
      title:"Clinics & Branches",
      add:"+ Add Clinic",
      cols:["Clinic","City","Doctors","Patients","Revenue","Status","Action"],
      statuses:{ active:"Active", inactive:"Suspended" },
      actions:{ manage:"Manage", report:"Report" },
    },
    reports:{
      title:"Reports & Analytics",
      tabs:["Overview","Revenue","Patients","Doctors"],
      period:["Today","This Week","This Month","This Year"],
      export:"Export PDF",
      kpis:[
        { label:"Total Revenue",    value:"$2,860",   delta:"+22%" },
        { label:"Total Patients",   value:"3,841",    delta:"+14%" },
        { label:"Total Sessions",   value:"12,609",   delta:"+18%" },
        { label:"Avg Rating",       value:"4.8 / 5",  delta:"+0.3" },
      ],
    },
    payments:{
      title:"Payments & Invoices",
      add:"+ New Invoice",
      cols:["Invoice #","Patient","Doctor","Amount","Date","Status","Action"],
      statuses:{ paid:"Paid", pending:"Pending", refunded:"Refunded" },
      actions:{ view:"View", receipt:"Receipt" },
    },
    settings:{
      title:"Settings",
      tabs:["Account","Notifications","Appearance","System"],
      save:"Save Changes",
      fields:{
        clinicName:"Clinic / Platform Name",
        email:"Email Address",
        phone:"Phone Number",
        address:"Address",
        currency:"Currency",
        lang:"Default Language",
        timezone:"Timezone",
        smsReminder:"SMS Reminder",
        waReminder:"WhatsApp Reminder",
        emailNotif:"Email Notifications",
        autoConfirm:"Auto-confirm Appointments",
      },
    },
    statusColors:{
      confirmed:{ bg:"#ECFDF5", color:"#059669" },
      pending:{ bg:"#FFFBEB", color:"#D97706" },
      completed:{ bg:"#EEF2FF", color:"#4F46E5" },
      cancelled:{ bg:"#FEF2F2", color:"#DC2626" },
      active:{ bg:"#ECFDF5", color:"#059669" },
      inactive:{ bg:"#F1F5F9", color:"#64748B" },
      new:{ bg:"#E0F2FE", color:"#0284C7" },
      paid:{ bg:"#ECFDF5", color:"#059669" },
      refunded:{ bg:"#FEF2F2", color:"#DC2626" },
    },
  },
};

// ── Sample Data ───────────────────────────────────────────────────────────────
const APPOINTMENTS_AR = [
  { id:"١٠٠١", patient:"أبو علي الموسوي",   doctor:"د. أحمد الكريمي",   spec:"أسنان",   date:"٢٦/٠٢/٢٠٢٥", time:"٩:٠٠ ص",  status:"confirmed"  },
  { id:"١٠٠٢", patient:"أم سارة الجبوري",   doctor:"د. سارة الحسيني",   spec:"أطفال",   date:"٢٦/٠٢/٢٠٢٥", time:"١٠:٣٠ ص", status:"pending"    },
  { id:"١٠٠٣", patient:"كريم العبيدي",       doctor:"د. محمد الزبيدي",   spec:"قلب",     date:"٢٦/٠٢/٢٠٢٥", time:"١١:٠٠ ص", status:"completed"  },
  { id:"١٠٠٤", patient:"نور البياتي",         doctor:"د. نور البياتي",     spec:"جلدية",   date:"٢٦/٠٢/٢٠٢٥", time:"١:٠٠ م",  status:"cancelled"  },
  { id:"١٠٠٥", patient:"هيثم الراوي",         doctor:"د. عمر الطائي",      spec:"عظام",    date:"٢٧/٠٢/٢٠٢٥", time:"٩:٣٠ ص",  status:"confirmed"  },
  { id:"١٠٠٦", patient:"زينب الموسوي",        doctor:"د. رنا العبيدي",     spec:"عيون",    date:"٢٧/٠٢/٢٠٢٥", time:"٢:٠٠ م",  status:"pending"    },
  { id:"١٠٠٧", patient:"عمر الجبوري",         doctor:"د. أحمد الكريمي",   spec:"أسنان",   date:"٢٨/٠٢/٢٠٢٥", time:"١٠:٠٠ ص", status:"confirmed"  },
];
const APPOINTMENTS_EN = [
  { id:"1001", patient:"Abu Ali Al-Musawi",   doctor:"Dr. Ahmed Al-Karimi",    spec:"Dentistry",    date:"26/02/2025", time:"9:00 AM",  status:"confirmed"  },
  { id:"1002", patient:"Um Sara Al-Jubouri",  doctor:"Dr. Sara Al-Husseini",   spec:"Pediatrics",   date:"26/02/2025", time:"10:30 AM", status:"pending"    },
  { id:"1003", patient:"Kareem Al-Obeidi",    doctor:"Dr. Mohammed Al-Zubaidi",spec:"Cardiology",   date:"26/02/2025", time:"11:00 AM", status:"completed"  },
  { id:"1004", patient:"Nour Al-Bayati",      doctor:"Dr. Nour Al-Bayati",     spec:"Dermatology",  date:"26/02/2025", time:"1:00 PM",  status:"cancelled"  },
  { id:"1005", patient:"Haytham Al-Rawi",     doctor:"Dr. Omar Al-Tai",        spec:"Orthopedics",  date:"27/02/2025", time:"9:30 AM",  status:"confirmed"  },
  { id:"1006", patient:"Zainab Al-Musawi",    doctor:"Dr. Rana Al-Obeidi",     spec:"Ophthalmology",date:"27/02/2025", time:"2:00 PM",  status:"pending"    },
  { id:"1007", patient:"Omar Al-Jubouri",     doctor:"Dr. Ahmed Al-Karimi",    spec:"Dentistry",    date:"28/02/2025", time:"10:00 AM", status:"confirmed"  },
];
const DOCTORS_AR = [
  { name:"د. أحمد الكريمي",  spec:"أسنان",  clinic:"عيادة الكريمي",   patients:312, rating:4.9, status:"active",   avatar:"أ", color:C.indigo  },
  { name:"د. سارة الحسيني",  spec:"أطفال",  clinic:"مركز حياة",        patients:248, rating:4.8, status:"active",   avatar:"س", color:C.mint    },
  { name:"د. محمد الزبيدي",  spec:"قلب",    clinic:"عيادة القلب",      patients:187, rating:4.9, status:"active",   avatar:"م", color:C.amber   },
  { name:"د. نور البياتي",    spec:"جلدية",  clinic:"ديرما كلينك",      patients:421, rating:4.7, status:"active",   avatar:"ن", color:"#EC4899" },
  { name:"د. عمر الطائي",     spec:"عظام",   clinic:"مركز النهضة",      patients:163, rating:4.8, status:"inactive", avatar:"ع", color:C.sky     },
  { name:"د. رنا العبيدي",    spec:"عيون",   clinic:"عيادة البصر",      patients:295, rating:4.9, status:"active",   avatar:"ر", color:C.violet  },
];
const DOCTORS_EN = [
  { name:"Dr. Ahmed Al-Karimi",     spec:"Dentistry",    clinic:"Al-Karimi Clinic",   patients:312, rating:4.9, status:"active",   avatar:"A", color:C.indigo  },
  { name:"Dr. Sara Al-Husseini",    spec:"Pediatrics",   clinic:"Hayat Center",       patients:248, rating:4.8, status:"active",   avatar:"S", color:C.mint    },
  { name:"Dr. Mohammed Al-Zubaidi", spec:"Cardiology",   clinic:"Heart Clinic",       patients:187, rating:4.9, status:"active",   avatar:"M", color:C.amber   },
  { name:"Dr. Nour Al-Bayati",      spec:"Dermatology",  clinic:"Derma Clinic",       patients:421, rating:4.7, status:"active",   avatar:"N", color:"#EC4899" },
  { name:"Dr. Omar Al-Tai",         spec:"Orthopedics",  clinic:"Al-Nahda Center",    patients:163, rating:4.8, status:"inactive", avatar:"O", color:C.sky     },
  { name:"Dr. Rana Al-Obeidi",      spec:"Ophthalmology",clinic:"Vision Clinic",      patients:295, rating:4.9, status:"active",   avatar:"R", color:C.violet  },
];
const PATIENTS_AR = [
  { name:"أبو علي الموسوي",  phone:"07701234567", lastVisit:"٢٦/٠٢/٢٠٢٥", visits:8,  total:"٩٦,٠٠٠ د", status:"active", avatar:"أ", color:C.indigo },
  { name:"أم سارة الجبوري",  phone:"07809876543", lastVisit:"٢٥/٠٢/٢٠٢٥", visits:3,  total:"٣٦,٠٠٠ د", status:"new",    avatar:"س", color:C.mint   },
  { name:"كريم العبيدي",      phone:"07711223344", lastVisit:"٢٤/٠٢/٢٠٢٥", visits:15, total:"٢١٠,٠٠٠ د",status:"active", avatar:"ك", color:C.amber  },
  { name:"هيثم الراوي",       phone:"07501122334", lastVisit:"٢٣/٠٢/٢٠٢٥", visits:6,  total:"٧٢,٠٠٠ د", status:"active", avatar:"ه", color:C.violet },
  { name:"زينب الموسوي",      phone:"07651234321", lastVisit:"٢٠/٠٢/٢٠٢٥", visits:2,  total:"٢٤,٠٠٠ د", status:"new",    avatar:"ز", color:"#EC4899"},
];
const PATIENTS_EN = [
  { name:"Abu Ali Al-Musawi",  phone:"07701234567", lastVisit:"26/02/2025", visits:8,  total:"$65",  status:"active", avatar:"A", color:C.indigo },
  { name:"Um Sara Al-Jubouri", phone:"07809876543", lastVisit:"25/02/2025", visits:3,  total:"$24",  status:"new",    avatar:"S", color:C.mint   },
  { name:"Kareem Al-Obeidi",   phone:"07711223344", lastVisit:"24/02/2025", visits:15, total:"$142", status:"active", avatar:"K", color:C.amber  },
  { name:"Haytham Al-Rawi",    phone:"07501122334", lastVisit:"23/02/2025", visits:6,  total:"$49",  status:"active", avatar:"H", color:C.violet },
  { name:"Zainab Al-Musawi",   phone:"07651234321", lastVisit:"20/02/2025", visits:2,  total:"$16",  status:"new",    avatar:"Z", color:"#EC4899"},
];
const CLINICS_AR = [
  { name:"عيادة الكريمي",     city:"بغداد",   doctors:3, patients:420, revenue:"٦٣٠,٠٠٠ د", status:"active"  },
  { name:"مركز حياة",          city:"البصرة",  doctors:5, patients:310, revenue:"٤٦٥,٠٠٠ د", status:"active"  },
  { name:"عيادة القلب السليم", city:"أربيل",   doctors:2, patients:188, revenue:"٢٨٢,٠٠٠ د", status:"active"  },
  { name:"ديرما كلينك",        city:"النجف",   doctors:1, patients:512, revenue:"٧٦٨,٠٠٠ د", status:"active"  },
  { name:"مركز النهضة",        city:"الموصل",  doctors:4, patients:220, revenue:"٣٣٠,٠٠٠ د", status:"inactive"},
];
const CLINICS_EN = [
  { name:"Al-Karimi Clinic",   city:"Baghdad", doctors:3, patients:420, revenue:"$426",  status:"active"  },
  { name:"Hayat Center",       city:"Basra",   doctors:5, patients:310, revenue:"$314",  status:"active"  },
  { name:"Healthy Heart Clinic",city:"Erbil",  doctors:2, patients:188, revenue:"$191",  status:"active"  },
  { name:"Derma Clinic",       city:"Najaf",   doctors:1, patients:512, revenue:"$519",  status:"active"  },
  { name:"Al-Nahda Center",    city:"Mosul",   doctors:4, patients:220, revenue:"$223",  status:"inactive"},
];
const PAYMENTS_AR = [
  { inv:"INV-٠٠١", patient:"أبو علي الموسوي",  doctor:"د. أحمد الكريمي",   amount:"١٢,٠٠٠ د", date:"٢٦/٠٢/٢٠٢٥", status:"paid"     },
  { inv:"INV-٠٠٢", patient:"أم سارة الجبوري",  doctor:"د. سارة الحسيني",   amount:"١٠,٠٠٠ د", date:"٢٦/٠٢/٢٠٢٥", status:"pending"  },
  { inv:"INV-٠٠٣", patient:"كريم العبيدي",      doctor:"د. محمد الزبيدي",   amount:"١٥,٠٠٠ د", date:"٢٥/٠٢/٢٠٢٥", status:"paid"     },
  { inv:"INV-٠٠٤", patient:"نور البياتي",        doctor:"د. نور البياتي",     amount:"١٢,٠٠٠ د", date:"٢٤/٠٢/٢٠٢٥", status:"refunded" },
  { inv:"INV-٠٠٥", patient:"هيثم الراوي",        doctor:"د. عمر الطائي",      amount:"١٤,٠٠٠ د", date:"٢٣/٠٢/٢٠٢٥", status:"paid"     },
];
const PAYMENTS_EN = [
  { inv:"INV-001", patient:"Abu Ali Al-Musawi",  doctor:"Dr. Ahmed Al-Karimi",    amount:"$8",   date:"26/02/2025", status:"paid"     },
  { inv:"INV-002", patient:"Um Sara Al-Jubouri", doctor:"Dr. Sara Al-Husseini",   amount:"$7",   date:"26/02/2025", status:"pending"  },
  { inv:"INV-003", patient:"Kareem Al-Obeidi",   doctor:"Dr. Mohammed Al-Zubaidi",amount:"$10",  date:"25/02/2025", status:"paid"     },
  { inv:"INV-004", patient:"Nour Al-Bayati",     doctor:"Dr. Nour Al-Bayati",     amount:"$8",   date:"24/02/2025", status:"refunded" },
  { inv:"INV-005", patient:"Haytham Al-Rawi",    doctor:"Dr. Omar Al-Tai",        amount:"$9",   date:"23/02/2025", status:"paid"     },
];
const CHART_DATA = [32,45,38,57,42,61,48];
const CHART_DAYS_AR = ["إثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت","أحد"];
const CHART_DAYS_EN = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const TOP_DOCS_AR = [
  { name:"د. أحمد الكريمي", spec:"أسنان",  pct:85, avatar:"أ", color:C.indigo },
  { name:"د. نور البياتي",   spec:"جلدية", pct:78, avatar:"ن", color:"#EC4899" },
  { name:"د. سارة الحسيني", spec:"أطفال", pct:71, avatar:"س", color:C.mint },
];
const TOP_DOCS_EN = [
  { name:"Dr. Ahmed Al-Karimi", spec:"Dentistry",   pct:85, avatar:"A", color:C.indigo },
  { name:"Dr. Nour Al-Bayati",  spec:"Dermatology", pct:78, avatar:"N", color:"#EC4899" },
  { name:"Dr. Sara Al-Husseini",spec:"Pediatrics",  pct:71, avatar:"S", color:C.mint },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const Badge = ({ status, map, sc }) => {
  const c = sc[status] || { bg:"#F1F5F9", color:"#64748B" };
  return (
    <span style={{ background:c.bg, color:c.color, padding:"3px 10px", borderRadius:20, fontSize:"0.72rem", fontWeight:700, whiteSpace:"nowrap" }}>
      {map[status] || status}
    </span>
  );
};

const Toggle = ({ on, onChange }) => (
  <div onClick={onChange} style={{
    width:44, height:24, borderRadius:12, padding:2, cursor:"pointer",
    background: on ? C.mint : "#CBD5E1",
    display:"flex", alignItems:"center",
    justifyContent: on ? "flex-end" : "flex-start",
    transition:"all 0.25s",
  }}>
    <div style={{ width:20, height:20, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)", transition:"all 0.25s" }} />
  </div>
);

// ── Modal Wrapper ─────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(15,23,42,0.55)", backdropFilter:"blur(4px)" }} />
      <div style={{ position:"relative", background:"#fff", borderRadius:20, padding:"2rem", width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 32px 80px rgba(0,0,0,0.25)", zIndex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
          <p style={{ fontWeight:800, fontSize:"1.05rem", color:C.ink, margin:0 }}>{title}</p>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, background:C.bg, border:`1px solid ${C.border}`, fontSize:"1rem", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ── MiniBar Chart ─────────────────────────────────────────────────────────────
const BarChart = ({ data, days }) => {
  const mx = Math.max(...data);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:"0.5rem", height:120, padding:"0 0 0.25rem" }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"0.4rem", height:"100%" }}>
          <div style={{ flex:1, display:"flex", alignItems:"flex-end", width:"100%" }}>
            <div style={{
              width:"100%", height:`${(v/mx)*100}%`,
              background:`linear-gradient(180deg, ${C.indigo} 0%, ${C.indigoDark} 100%)`,
              borderRadius:"6px 6px 0 0",
              transition:"height 0.5s ease",
              minHeight:4,
            }} />
          </div>
          <span style={{ fontSize:"0.65rem", color:C.muted, whiteSpace:"nowrap" }}>{days[i]}</span>
          <span style={{ fontSize:"0.65rem", fontWeight:700, color:C.indigo }}>{v}</span>
        </div>
      ))}
    </div>
  );
};

// ── Sparkline ─────────────────────────────────────────────────────────────────
const DonutPct = ({ pct, color }) => {
  const r = 18, circ = 2*Math.PI*r;
  return (
    <svg width={44} height={44} viewBox="0 0 44 44">
      <circle cx={22} cy={22} r={r} fill="none" stroke="#E2E8F0" strokeWidth={5} />
      <circle cx={22} cy={22} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)}
        strokeLinecap="round" transform="rotate(-90 22 22)" />
      <text x={22} y={26} textAnchor="middle" fontSize={9} fontWeight={800} fill={color}>{pct}%</text>
    </svg>
  );
};

// ── Page Components ───────────────────────────────────────────────────────────
function DashboardPage({ t, locale }) {
  const d = t.dashboard;
  const appointments = locale==="ar" ? APPOINTMENTS_AR : APPOINTMENTS_EN;
  const topDocs = locale==="ar" ? TOP_DOCS_AR : TOP_DOCS_EN;
  const chartDays = locale==="ar" ? CHART_DAYS_AR : CHART_DAYS_EN;

  return (
    <div>
      <div style={{ marginBottom:"1.75rem" }}>
        <h1 style={{ fontWeight:900, fontSize:"1.5rem", color:C.ink, margin:"0 0 0.2rem" }}>{d.welcome}</h1>
        <p style={{ color:C.muted, fontSize:"0.875rem", margin:0 }}>{d.sub}</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"1.75rem" }}>
        {d.cards.map((card,i) => (
          <div key={i} style={{ background:C.white, borderRadius:16, padding:"1.25rem", border:`1px solid ${C.border}`, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.85rem" }}>
              <div style={{ width:44, height:44, borderRadius:12, background:card.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem" }}>{card.icon}</div>
              <span style={{ fontSize:"0.72rem", fontWeight:700, color: card.up ? C.mint : C.red, background: card.up ? C.mintL : C.redL, padding:"3px 8px", borderRadius:20 }}>
                {card.up ? "▲" : "▼"} {card.delta}
              </span>
            </div>
            <p style={{ fontSize:"1.75rem", fontWeight:900, color:card.color, margin:"0 0 0.2rem", lineHeight:1 }}>{card.value}</p>
            <p style={{ fontSize:"0.78rem", color:C.muted, margin:0 }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Chart + Quick Actions */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 0.55fr", gap:"1.25rem", marginBottom:"1.25rem" }}>
        {/* Chart */}
        <div style={{ background:C.white, borderRadius:16, padding:"1.5rem", border:`1px solid ${C.border}` }}>
          <p style={{ fontWeight:800, fontSize:"0.95rem", color:C.ink, margin:"0 0 1.25rem" }}>{d.chartTitle}</p>
          <BarChart data={CHART_DATA} days={chartDays} />
        </div>

        {/* Quick Actions */}
        <div style={{ background:C.white, borderRadius:16, padding:"1.5rem", border:`1px solid ${C.border}` }}>
          <p style={{ fontWeight:800, fontSize:"0.95rem", color:C.ink, margin:"0 0 1rem" }}>{d.quickTitle}</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
            {d.quick.map(q => (
              <button key={q.label} style={{
                background:`${q.color}12`, border:`1px solid ${q.color}30`,
                borderRadius:12, padding:"0.85rem 0.6rem",
                textAlign:"center", cursor:"pointer", transition:"all 0.2s",
              }}
                onMouseEnter={e=>e.currentTarget.style.background=`${q.color}22`}
                onMouseLeave={e=>e.currentTarget.style.background=`${q.color}12`}
              >
                <div style={{ fontSize:"1.4rem", marginBottom:"0.3rem" }}>{q.icon}</div>
                <p style={{ fontSize:"0.72rem", fontWeight:700, color:q.color, margin:0, lineHeight:1.3 }}>{q.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent appointments + Top doctors */}
      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 0.6fr", gap:"1.25rem" }}>
        {/* Recent */}
        <div style={{ background:C.white, borderRadius:16, padding:"1.5rem", border:`1px solid ${C.border}` }}>
          <p style={{ fontWeight:800, fontSize:"0.95rem", color:C.ink, margin:"0 0 1rem" }}>{d.recentTitle}</p>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <tbody>
              {appointments.slice(0,5).map(a => (
                <tr key={a.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                  <td style={{ padding:"0.65rem 0", fontSize:"0.78rem", color:C.muted }}>{a.id}</td>
                  <td style={{ padding:"0.65rem 0.5rem", fontSize:"0.8rem", fontWeight:600, color:C.ink }}>{a.patient}</td>
                  <td style={{ padding:"0.65rem 0.5rem", fontSize:"0.78rem", color:C.muted }}>{a.doctor}</td>
                  <td style={{ padding:"0.65rem 0.5rem", fontSize:"0.75rem", color:C.muted }}>{a.time}</td>
                  <td style={{ padding:"0.65rem 0" }}>
                    <Badge status={a.status} map={t.appointments.statuses} sc={t.statusColors} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top docs */}
        <div style={{ background:C.white, borderRadius:16, padding:"1.5rem", border:`1px solid ${C.border}` }}>
          <p style={{ fontWeight:800, fontSize:"0.95rem", color:C.ink, margin:"0 0 1.25rem" }}>{d.topDoctorsTitle}</p>
          {topDocs.map(doc => (
            <div key={doc.name} style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1rem" }}>
              <DonutPct pct={doc.pct} color={doc.color} />
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:"0.8rem", color:C.ink, margin:"0 0 0.1rem" }}>{doc.name}</p>
                <p style={{ fontSize:"0.7rem", color:C.muted, margin:0 }}>{doc.spec}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TablePage({ t, locale }) {
  const at = t.appointments;
  const [filter, setFilter] = useState(0);
  const [modal, setModal] = useState(false);
  const data = locale==="ar" ? APPOINTMENTS_AR : APPOINTMENTS_EN;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
        <h1 style={{ fontWeight:900, fontSize:"1.4rem", color:C.ink, margin:0 }}>{at.title}</h1>
        <button onClick={()=>setModal(true)} style={{ background:C.indigo, color:"#fff", padding:"9px 18px", borderRadius:9, fontWeight:700, fontSize:"0.85rem", border:"none", cursor:"pointer" }}>
          {at.add}
        </button>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
        {at.filters.map((f,i) => (
          <button key={f} onClick={()=>setFilter(i)} style={{
            padding:"7px 16px", borderRadius:20, fontSize:"0.8rem", fontWeight:600,
            background: filter===i ? C.indigo : C.white,
            color: filter===i ? "#fff" : C.muted,
            border:`1px solid ${filter===i ? C.indigo : C.border}`,
            cursor:"pointer", transition:"all 0.15s",
          }}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.bg }}>
                {at.cols.map(c => (
                  <th key={c} style={{ padding:"0.9rem 1rem", textAlign: locale==="ar"?"right":"left", fontSize:"0.75rem", fontWeight:700, color:C.muted, whiteSpace:"nowrap" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row,i) => (
                <tr key={row.id} style={{ borderTop:`1px solid ${C.border}`, transition:"background 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"0.85rem 1rem", fontSize:"0.78rem", color:C.muted }}>{row.id}</td>
                  <td style={{ padding:"0.85rem 1rem", fontSize:"0.82rem", fontWeight:600, color:C.ink, whiteSpace:"nowrap" }}>{row.patient}</td>
                  <td style={{ padding:"0.85rem 1rem", fontSize:"0.8rem", color:C.slate, whiteSpace:"nowrap" }}>{row.doctor}</td>
                  <td style={{ padding:"0.85rem 1rem", fontSize:"0.78rem", color:C.muted }}>{row.spec}</td>
                  <td style={{ padding:"0.85rem 1rem", fontSize:"0.78rem", color:C.muted }}>{row.date}</td>
                  <td style={{ padding:"0.85rem 1rem", fontSize:"0.78rem", fontWeight:600, color:C.ink }}>{row.time}</td>
                  <td style={{ padding:"0.85rem 1rem" }}>
                    <Badge status={row.status} map={at.statuses} sc={t.statusColors} />
                  </td>
                  <td style={{ padding:"0.85rem 1rem" }}>
                    <div style={{ display:"flex", gap:"0.4rem" }}>
                      {Object.entries(at.actions).map(([k,v]) => (
                        <button key={k} style={{
                          padding:"4px 10px", borderRadius:6, fontSize:"0.72rem", fontWeight:600,
                          background: k==="cancel" ? C.redL : C.indigoL,
                          color: k==="cancel" ? C.red : C.indigo,
                          border:"none", cursor:"pointer",
                        }}>{v}</button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Appointment Modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title={at.modalTitle}>
        <div style={{ display:"flex", flexDirection:"column", gap:"0.85rem" }}>
          {Object.entries(at.modalFields).map(([k,v]) => (
            k==="notes"
              ? <textarea key={k} placeholder={v} rows={3} style={{ width:"100%", padding:"10px 13px", border:`1.5px solid ${C.border}`, borderRadius:9, fontSize:"0.875rem", resize:"vertical" }} />
              : <input key={k} type={k==="date"?"date":k==="time"?"time":"text"} placeholder={v} style={{ width:"100%", padding:"10px 13px", border:`1.5px solid ${C.border}`, borderRadius:9, fontSize:"0.875rem" }} />
          ))}
          <div style={{ display:"flex", gap:"0.75rem", marginTop:"0.5rem" }}>
            <button onClick={()=>setModal(false)} style={{ flex:1, padding:"11px", borderRadius:9, border:`1px solid ${C.border}`, background:C.bg, fontWeight:700, fontSize:"0.875rem", color:C.muted, cursor:"pointer" }}>
              {at.close}
            </button>
            <button onClick={()=>setModal(false)} style={{ flex:2, padding:"11px", borderRadius:9, border:"none", background:C.indigo, color:"#fff", fontWeight:700, fontSize:"0.875rem", cursor:"pointer" }}>
              {at.save}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DoctorsPage({ t, locale }) {
  const dt = t.doctors;
  const [modal, setModal] = useState(false);
  const data = locale==="ar" ? DOCTORS_AR : DOCTORS_EN;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
        <h1 style={{ fontWeight:900, fontSize:"1.4rem", color:C.ink, margin:0 }}>{dt.title}</h1>
        <button onClick={()=>setModal(true)} style={{ background:C.indigo, color:"#fff", padding:"9px 18px", borderRadius:9, fontWeight:700, fontSize:"0.85rem", border:"none", cursor:"pointer" }}>
          {dt.add}
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"1.25rem" }}>
        {data.map(doc => (
          <div key={doc.name} style={{ background:C.white, borderRadius:18, padding:"1.5rem", border:`1px solid ${C.border}`, boxShadow:"0 2px 10px rgba(0,0,0,0.04)", transition:"all 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 12px 36px ${doc.color}18`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,0.04)";}}>
            <div style={{ display:"flex", gap:"0.85rem", alignItems:"flex-start", marginBottom:"1.1rem" }}>
              <div style={{ width:54, height:54, borderRadius:"50%", background:`linear-gradient(135deg,${doc.color}22,${doc.color}55)`, border:`2px solid ${doc.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:doc.color, fontSize:"1.3rem", flexShrink:0 }}>
                {doc.avatar}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:800, color:C.ink, margin:"0 0 0.15rem", fontSize:"0.92rem" }}>{doc.name}</p>
                <p style={{ color:doc.color, fontSize:"0.78rem", fontWeight:700, margin:"0 0 0.15rem" }}>{doc.spec}</p>
                <p style={{ color:C.muted, fontSize:"0.73rem", margin:0 }}>🏥 {doc.clinic}</p>
              </div>
              <Badge status={doc.status} map={dt.statuses} sc={t.statusColors} />
            </div>

            <div style={{ display:"flex", gap:"1rem", marginBottom:"1.1rem" }}>
              <div style={{ textAlign:"center", flex:1, padding:"0.6rem", background:C.bg, borderRadius:10 }}>
                <p style={{ fontWeight:800, color:C.ink, margin:0, fontSize:"1rem" }}>{doc.patients}</p>
                <p style={{ color:C.muted, margin:0, fontSize:"0.68rem" }}>{locale==="ar"?"مريض":"Patients"}</p>
              </div>
              <div style={{ textAlign:"center", flex:1, padding:"0.6rem", background:C.amberL, borderRadius:10 }}>
                <p style={{ fontWeight:800, color:C.amber, margin:0, fontSize:"1rem" }}>⭐ {doc.rating}</p>
                <p style={{ color:C.muted, margin:0, fontSize:"0.68rem" }}>{locale==="ar"?"التقييم":"Rating"}</p>
              </div>
            </div>

            <div style={{ display:"flex", gap:"0.5rem" }}>
              <button style={{ flex:1, padding:"7px", borderRadius:8, border:`1px solid ${C.border}`, background:C.bg, fontSize:"0.75rem", fontWeight:600, color:C.slate, cursor:"pointer" }}>
                {dt.actions.view}
              </button>
              <button style={{ flex:1, padding:"7px", borderRadius:8, border:`1px solid ${C.indigo}`, background:C.indigoL, fontSize:"0.75rem", fontWeight:600, color:C.indigo, cursor:"pointer" }}>
                {dt.actions.edit}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={dt.modalTitle}>
        <div style={{ display:"flex", flexDirection:"column", gap:"0.85rem" }}>
          {Object.entries(dt.modalFields).map(([k,v]) => (
            <input key={k} placeholder={v} type={k==="email"?"email":k==="fee"?"number":"text"} style={{ width:"100%", padding:"10px 13px", border:`1.5px solid ${C.border}`, borderRadius:9, fontSize:"0.875rem" }} />
          ))}
          <div style={{ display:"flex", gap:"0.75rem", marginTop:"0.5rem" }}>
            <button onClick={()=>setModal(false)} style={{ flex:1, padding:"11px", borderRadius:9, border:`1px solid ${C.border}`, background:C.bg, fontWeight:700, fontSize:"0.875rem", color:C.muted, cursor:"pointer" }}>{dt.close}</button>
            <button onClick={()=>setModal(false)} style={{ flex:2, padding:"11px", borderRadius:9, border:"none", background:C.indigo, color:"#fff", fontWeight:700, fontSize:"0.875rem", cursor:"pointer" }}>{dt.save}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function PatientsPage({ t, locale }) {
  const pt = t.patients;
  const data = locale==="ar" ? PATIENTS_AR : PATIENTS_EN;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
        <h1 style={{ fontWeight:900, fontSize:"1.4rem", color:C.ink, margin:0 }}>{pt.title}</h1>
        <button style={{ background:C.indigo, color:"#fff", padding:"9px 18px", borderRadius:9, fontWeight:700, fontSize:"0.85rem", border:"none", cursor:"pointer" }}>{pt.add}</button>
      </div>
      <div style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.bg }}>
              {pt.cols.map(c => <th key={c} style={{ padding:"0.9rem 1rem", textAlign:locale==="ar"?"right":"left", fontSize:"0.75rem", fontWeight:700, color:C.muted, whiteSpace:"nowrap" }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map(p => (
              <tr key={p.name} style={{ borderTop:`1px solid ${C.border}` }}
                onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding:"0.85rem 1rem" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${p.color}22,${p.color}55)`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:p.color, fontSize:"0.9rem", flexShrink:0 }}>{p.avatar}</div>
                    <span style={{ fontWeight:700, fontSize:"0.85rem", color:C.ink }}>{p.name}</span>
                  </div>
                </td>
                <td style={{ padding:"0.85rem 1rem", fontSize:"0.8rem", color:C.muted }}>{p.phone}</td>
                <td style={{ padding:"0.85rem 1rem", fontSize:"0.78rem", color:C.muted }}>{p.lastVisit}</td>
                <td style={{ padding:"0.85rem 1rem", fontSize:"0.82rem", fontWeight:700, color:C.indigo, textAlign:"center" }}>{p.visits}</td>
                <td style={{ padding:"0.85rem 1rem", fontSize:"0.82rem", fontWeight:700, color:C.ink }}>{p.total}</td>
                <td style={{ padding:"0.85rem 1rem" }}><Badge status={p.status} map={pt.statuses} sc={t.statusColors} /></td>
                <td style={{ padding:"0.85rem 1rem" }}>
                  <div style={{ display:"flex", gap:"0.4rem" }}>
                    {Object.entries(pt.actions).map(([k,v])=>(
                      <button key={k} style={{ padding:"4px 10px", borderRadius:6, fontSize:"0.72rem", fontWeight:600, background:C.indigoL, color:C.indigo, border:"none", cursor:"pointer" }}>{v}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClinicsPage({ t, locale }) {
  const ct = t.clinics;
  const data = locale==="ar" ? CLINICS_AR : CLINICS_EN;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
        <h1 style={{ fontWeight:900, fontSize:"1.4rem", color:C.ink, margin:0 }}>{ct.title}</h1>
        <button style={{ background:C.indigo, color:"#fff", padding:"9px 18px", borderRadius:9, fontWeight:700, fontSize:"0.85rem", border:"none", cursor:"pointer" }}>{ct.add}</button>
      </div>
      <div style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.bg }}>
              {ct.cols.map(c => <th key={c} style={{ padding:"0.9rem 1rem", textAlign:locale==="ar"?"right":"left", fontSize:"0.75rem", fontWeight:700, color:C.muted }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map(cl => (
              <tr key={cl.name} style={{ borderTop:`1px solid ${C.border}` }}
                onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding:"0.85rem 1rem", fontWeight:700, fontSize:"0.85rem", color:C.ink }}>{cl.name}</td>
                <td style={{ padding:"0.85rem 1rem", fontSize:"0.8rem", color:C.muted }}>📍 {cl.city}</td>
                <td style={{ padding:"0.85rem 1rem", fontSize:"0.82rem", fontWeight:700, color:C.indigo, textAlign:"center" }}>{cl.doctors}</td>
                <td style={{ padding:"0.85rem 1rem", fontSize:"0.82rem", color:C.slate, textAlign:"center" }}>{cl.patients}</td>
                <td style={{ padding:"0.85rem 1rem", fontSize:"0.82rem", fontWeight:700, color:C.mint }}>{cl.revenue}</td>
                <td style={{ padding:"0.85rem 1rem" }}><Badge status={cl.status} map={ct.statuses} sc={t.statusColors} /></td>
                <td style={{ padding:"0.85rem 1rem" }}>
                  <div style={{ display:"flex", gap:"0.4rem" }}>
                    {Object.entries(ct.actions).map(([k,v])=>(
                      <button key={k} style={{ padding:"4px 10px", borderRadius:6, fontSize:"0.72rem", fontWeight:600, background:C.indigoL, color:C.indigo, border:"none", cursor:"pointer" }}>{v}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsPage({ t, locale }) {
  const rt = t.reports;
  const [tab, setTab] = useState(0);
  const [period, setPeriod] = useState(2);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
        <h1 style={{ fontWeight:900, fontSize:"1.4rem", color:C.ink, margin:0 }}>{rt.title}</h1>
        <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
          <div style={{ display:"flex", background:C.white, borderRadius:9, border:`1px solid ${C.border}`, overflow:"hidden" }}>
            {rt.period.map((p,i)=>(
              <button key={p} onClick={()=>setPeriod(i)} style={{ padding:"7px 14px", fontSize:"0.78rem", fontWeight:600, background:period===i?C.indigo:"transparent", color:period===i?"#fff":C.muted, border:"none", cursor:"pointer" }}>{p}</button>
            ))}
          </div>
          <button style={{ background:C.indigo, color:"#fff", padding:"8px 16px", borderRadius:9, fontWeight:700, fontSize:"0.8rem", border:"none", cursor:"pointer" }}>{rt.export}</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:"0.25rem", background:C.white, borderRadius:12, padding:4, border:`1px solid ${C.border}`, marginBottom:"1.75rem", width:"fit-content" }}>
        {rt.tabs.map((tb,i)=>(
          <button key={tb} onClick={()=>setTab(i)} style={{ padding:"8px 20px", borderRadius:9, fontSize:"0.82rem", fontWeight:700, background:tab===i?C.indigo:"transparent", color:tab===i?"#fff":C.muted, border:"none", cursor:"pointer", transition:"all 0.2s" }}>{tb}</button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"1.75rem" }}>
        {rt.kpis.map(k=>(
          <div key={k.label} style={{ background:C.white, borderRadius:14, padding:"1.25rem", border:`1px solid ${C.border}` }}>
            <p style={{ fontSize:"0.75rem", color:C.muted, margin:"0 0 0.6rem" }}>{k.label}</p>
            <p style={{ fontSize:"1.5rem", fontWeight:900, color:C.ink, margin:"0 0 0.35rem", lineHeight:1 }}>{k.value}</p>
            <span style={{ fontSize:"0.72rem", fontWeight:700, color:C.mint, background:C.mintL, padding:"2px 8px", borderRadius:20 }}>▲ {k.delta}</span>
          </div>
        ))}
      </div>

      {/* Big chart */}
      <div style={{ background:C.white, borderRadius:16, padding:"1.75rem", border:`1px solid ${C.border}` }}>
        <p style={{ fontWeight:800, fontSize:"0.95rem", color:C.ink, margin:"0 0 1.5rem" }}>
          {locale==="ar" ? "مخطط الأداء الشهري" : "Monthly Performance Chart"}
        </p>
        <BarChart data={[120,145,138,165,142,175,158,180,162,190,178,195]} days={locale==="ar"
          ?["ينا","فبر","مار","أبر","ماي","يون","يول","أغس","سبت","أكت","نوف","ديس"]
          :["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        } />
      </div>
    </div>
  );
}

function PaymentsPage({ t, locale }) {
  const pyt = t.payments;
  const data = locale==="ar" ? PAYMENTS_AR : PAYMENTS_EN;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
        <h1 style={{ fontWeight:900, fontSize:"1.4rem", color:C.ink, margin:0 }}>{pyt.title}</h1>
        <button style={{ background:C.mint, color:"#fff", padding:"9px 18px", borderRadius:9, fontWeight:700, fontSize:"0.85rem", border:"none", cursor:"pointer" }}>{pyt.add}</button>
      </div>

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.5rem" }}>
        {[
          { label: locale==="ar"?"إجمالي الإيرادات":"Total Revenue",  value: locale==="ar"?"٢٤٢,٠٠٠ د":"$163", color:C.mint, bg:C.mintL, icon:"💰" },
          { label: locale==="ar"?"معلّق التحصيل":"Pending",             value: locale==="ar"?"١٠,٠٠٠ د":"$7",   color:C.amber,bg:C.amberL,icon:"⏳" },
          { label: locale==="ar"?"مستردّ":"Refunded",                   value: locale==="ar"?"١٢,٠٠٠ د":"$8",   color:C.red,  bg:C.redL,  icon:"↩️" },
        ].map(s=>(
          <div key={s.label} style={{ background:C.white, borderRadius:14, padding:"1.25rem", border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:"1rem" }}>
            <div style={{ width:46, height:46, borderRadius:12, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.25rem" }}>{s.icon}</div>
            <div>
              <p style={{ fontSize:"0.75rem", color:C.muted, margin:"0 0 0.2rem" }}>{s.label}</p>
              <p style={{ fontSize:"1.3rem", fontWeight:900, color:s.color, margin:0 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.bg }}>
              {pyt.cols.map(c=><th key={c} style={{ padding:"0.9rem 1rem", textAlign:locale==="ar"?"right":"left", fontSize:"0.75rem", fontWeight:700, color:C.muted, whiteSpace:"nowrap" }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map(row=>(
              <tr key={row.inv} style={{ borderTop:`1px solid ${C.border}` }}
                onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding:"0.85rem 1rem", fontSize:"0.78rem", fontWeight:700, color:C.indigo }}>{row.inv}</td>
                <td style={{ padding:"0.85rem 1rem", fontSize:"0.82rem", color:C.ink, fontWeight:600 }}>{row.patient}</td>
                <td style={{ padding:"0.85rem 1rem", fontSize:"0.8rem", color:C.muted }}>{row.doctor}</td>
                <td style={{ padding:"0.85rem 1rem", fontSize:"0.85rem", fontWeight:800, color:C.mint }}>{row.amount}</td>
                <td style={{ padding:"0.85rem 1rem", fontSize:"0.78rem", color:C.muted }}>{row.date}</td>
                <td style={{ padding:"0.85rem 1rem" }}><Badge status={row.status} map={pyt.statuses} sc={t.statusColors} /></td>
                <td style={{ padding:"0.85rem 1rem" }}>
                  <div style={{ display:"flex", gap:"0.4rem" }}>
                    {Object.entries(pyt.actions).map(([k,v])=>(
                      <button key={k} style={{ padding:"4px 10px", borderRadius:6, fontSize:"0.72rem", fontWeight:600, background:C.indigoL, color:C.indigo, border:"none", cursor:"pointer" }}>{v}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsPage({ t, locale }) {
  const st = t.settings;
  const [tab, setTab] = useState(0);
  const [toggles, setToggles] = useState({ smsReminder:true, waReminder:true, emailNotif:false, autoConfirm:true });

  return (
    <div>
      <h1 style={{ fontWeight:900, fontSize:"1.4rem", color:C.ink, margin:"0 0 1.5rem" }}>{st.title}</h1>

      <div style={{ display:"flex", gap:"0.25rem", background:C.white, borderRadius:12, padding:4, border:`1px solid ${C.border}`, marginBottom:"1.75rem", width:"fit-content" }}>
        {st.tabs.map((tb,i)=>(
          <button key={tb} onClick={()=>setTab(i)} style={{ padding:"8px 20px", borderRadius:9, fontSize:"0.82rem", fontWeight:700, background:tab===i?C.indigo:"transparent", color:tab===i?"#fff":C.muted, border:"none", cursor:"pointer", transition:"all 0.2s" }}>{tb}</button>
        ))}
      </div>

      <div style={{ background:C.white, borderRadius:16, padding:"2rem", border:`1px solid ${C.border}`, maxWidth:620 }}>
        {tab===0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            {[st.fields.clinicName, st.fields.email, st.fields.phone, st.fields.address].map(f=>(
              <div key={f}>
                <label style={{ display:"block", fontSize:"0.78rem", fontWeight:700, color:C.slate, marginBottom:"0.4rem" }}>{f}</label>
                <input style={{ width:"100%", padding:"10px 13px", border:`1.5px solid ${C.border}`, borderRadius:9, fontSize:"0.875rem", color:C.ink, background:C.bg }} placeholder={f} />
              </div>
            ))}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
              {[st.fields.currency, st.fields.lang, st.fields.timezone].slice(0,2).map(f=>(
                <div key={f}>
                  <label style={{ display:"block", fontSize:"0.78rem", fontWeight:700, color:C.slate, marginBottom:"0.4rem" }}>{f}</label>
                  <select style={{ width:"100%", padding:"10px 13px", border:`1.5px solid ${C.border}`, borderRadius:9, fontSize:"0.875rem", color:C.ink, background:C.bg }}>
                    <option>{f}</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab===1 && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
            {[
              { k:"smsReminder",   l:st.fields.smsReminder  },
              { k:"waReminder",    l:st.fields.waReminder   },
              { k:"emailNotif",    l:st.fields.emailNotif   },
              { k:"autoConfirm",   l:st.fields.autoConfirm  },
            ].map(item=>(
              <div key={item.k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"1rem", background:C.bg, borderRadius:12, border:`1px solid ${C.border}` }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:"0.88rem", color:C.ink, margin:"0 0 0.2rem" }}>{item.l}</p>
                  <p style={{ fontSize:"0.75rem", color:C.muted, margin:0 }}>
                    {toggles[item.k] ? (locale==="ar"?"مفعّل":"Enabled") : (locale==="ar"?"معطّل":"Disabled")}
                  </p>
                </div>
                <Toggle on={toggles[item.k]} onChange={()=>setToggles(p=>({...p,[item.k]:!p[item.k]}))} />
              </div>
            ))}
          </div>
        )}

        {(tab===2||tab===3) && (
          <div style={{ textAlign:"center", padding:"3rem 1rem", color:C.muted }}>
            <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>{tab===2?"🎨":"⚙️"}</div>
            <p style={{ fontWeight:700, fontSize:"0.9rem" }}>
              {locale==="ar" ? "قريباً..." : "Coming soon..."}
            </p>
          </div>
        )}

        {tab < 2 && (
          <button style={{ marginTop:"1.5rem", background:C.indigo, color:"#fff", padding:"11px 28px", borderRadius:9, fontWeight:700, fontSize:"0.875rem", border:"none", cursor:"pointer" }}>
            {st.save}
          </button>
        )}
      </div>
    </div>
  );
}

// ── MAIN LAYOUT ───────────────────────────────────────────────────────────────
export default function MawidAdmin() {
  const [locale, setLocale] = useState("ar");
  const [page, setPage] = useState("dashboard");
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const t = L[locale];
  const isRTL = t.dir==="rtl";
  const font = isRTL ? "'Cairo',sans-serif" : "'Sora',sans-serif";

  const navItems = [
    { key:"dashboard",    icon:"🏠", label:t.nav.dashboard    },
    { key:"appointments", icon:"📅", label:t.nav.appointments },
    { key:"doctors",      icon:"👨‍⚕️", label:t.nav.doctors   },
    { key:"patients",     icon:"👥", label:t.nav.patients     },
    { key:"clinics",      icon:"🏥", label:t.nav.clinics      },
    { key:"reports",      icon:"📊", label:t.nav.reports      },
    { key:"payments",     icon:"💳", label:t.nav.payments     },
    { key:"settings",     icon:"⚙️", label:t.nav.settings     },
  ];

  const SIDEBAR_W = sideCollapsed ? 68 : 228;

  const notifications = locale==="ar"
    ? ["موعد جديد: أبو علي — ٩:٠٠ ص","٣ مواعيد معلّقة تنتظر التأكيد","تقرير أسبوعي جاهز"]
    : ["New booking: Abu Ali — 9:00 AM","3 pending appointments awaiting confirmation","Weekly report ready"];

  return (
    <div dir={t.dir} lang={t.lang} style={{ fontFamily:font, background:C.bg, minHeight:"100vh", display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        button{cursor:pointer;border:none;font-family:inherit;}
        input,select,textarea{font-family:inherit;outline:none;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:#F1F5F9;}
        ::-webkit-scrollbar-thumb{background:${C.indigo}55;border-radius:3px;}
        @keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width:SIDEBAR_W, minHeight:"100vh",
        background:C.indigoDeep,
        display:"flex", flexDirection:"column",
        position:"fixed", top:0,
        [isRTL?"right":"left"]: 0,
        zIndex:100, transition:"width 0.25s ease",
        overflow:"hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: sideCollapsed?"1rem":"1.5rem 1.25rem", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent: sideCollapsed?"center":"space-between", gap:"0.5rem", minHeight:68 }}>
          {!sideCollapsed && (
            <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
              <div style={{ width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#6366F1,#4F46E5)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:"1rem" }}>م</div>
              <div>
                <p style={{ fontWeight:900, color:"#fff", margin:0, fontSize:"1rem", lineHeight:1 }}>{t.logo}</p>
                <p style={{ color:"#818CF8", margin:0, fontSize:"0.62rem", fontWeight:600 }}>{t.logoSub}</p>
              </div>
            </div>
          )}
          {sideCollapsed && <div style={{ width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#6366F1,#4F46E5)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:"1rem" }}>م</div>}
          {!sideCollapsed && (
            <button onClick={()=>setSideCollapsed(true)} style={{ background:"rgba(255,255,255,0.08)", border:"none", color:"#94A3B8", width:28,height:28, borderRadius:7, display:"flex",alignItems:"center",justifyContent:"center", fontSize:"0.8rem" }}>
              {isRTL?"›":"‹"}
            </button>
          )}
        </div>

        {sideCollapsed && (
          <button onClick={()=>setSideCollapsed(false)} style={{ margin:"0.6rem auto", background:"rgba(255,255,255,0.08)", border:"none", color:"#94A3B8", width:36,height:28, borderRadius:7, display:"flex",alignItems:"center",justifyContent:"center", fontSize:"0.8rem" }}>
            {isRTL?"‹":"›"}
          </button>
        )}

        {/* Nav */}
        <nav style={{ flex:1, padding:"0.75rem 0", overflowY:"auto" }}>
          {navItems.map(item=>{
            const active = page===item.key;
            return (
              <button key={item.key} onClick={()=>setPage(item.key)} style={{
                width:"100%", display:"flex", alignItems:"center",
                gap:"0.85rem", padding: sideCollapsed?"0.8rem":"0.75rem 1.25rem",
                justifyContent: sideCollapsed?"center":"flex-start",
                background: active?"rgba(99,102,241,0.25)":"transparent",
                borderRadius: sideCollapsed?0:"0",
                borderInlineStart: active?`3px solid ${C.indigo}`:"3px solid transparent",
                color: active?"#fff":C.sidebarText,
                fontSize:"0.875rem", fontWeight: active?700:500,
                transition:"all 0.15s",
              }}
                onMouseEnter={e=>{ if(!active) e.currentTarget.style.background="rgba(255,255,255,0.06)"; }}
                onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}
              >
                <span style={{ fontSize:"1.05rem", flexShrink:0 }}>{item.icon}</span>
                {!sideCollapsed && <span style={{ whiteSpace:"nowrap" }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom — locale toggle */}
        {!sideCollapsed && (
          <div style={{ padding:"1rem 1.25rem", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
            <button onClick={()=>setLocale(locale==="ar"?"en":"ar")} style={{
              width:"100%", background:"rgba(255,255,255,0.08)", color:"#94A3B8",
              padding:"9px", borderRadius:9, fontWeight:700, fontSize:"0.8rem",
              display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem",
            }}>
              🌐 {locale==="ar"?"English":"العربية"}
            </button>
          </div>
        )}
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex:1, [isRTL?"marginRight":"marginLeft"]:SIDEBAR_W, transition:"margin 0.25s ease", minHeight:"100vh", display:"flex", flexDirection:"column" }}>

        {/* ── TOPBAR ── */}
        <header style={{ height:68, background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 1.75rem", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
          {/* Search */}
          <div style={{ position:"relative", maxWidth:380, flex:1 }}>
            <span style={{ position:"absolute", top:"50%", transform:"translateY(-50%)", [isRTL?"right":"left"]:12, color:C.muted }}>🔍</span>
            <input placeholder={t.topbar.search} style={{
              width:"100%", padding:`9px 13px 9px ${isRTL?"13px":"36px"}`,
              paddingRight: isRTL?"36px":"13px",
              border:`1.5px solid ${C.border}`, borderRadius:10,
              fontSize:"0.845rem", color:C.ink, background:C.bg,
            }} />
          </div>

          {/* Right actions */}
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
            {/* Notif */}
            <div style={{ position:"relative" }}>
              <button onClick={()=>setNotifOpen(!notifOpen)} style={{ width:40,height:40,borderRadius:10, background:C.bg, border:`1px solid ${C.border}`, display:"flex",alignItems:"center",justifyContent:"center", fontSize:"1.1rem", position:"relative" }}>
                🔔
                <span style={{ position:"absolute", top:6, [isRTL?"left":"right"]:6, width:8,height:8, borderRadius:"50%", background:C.red, border:"2px solid #fff" }} />
              </button>
              {notifOpen && (
                <div style={{ position:"absolute", top:48, [isRTL?"left":"right"]:0, width:300, background:"#fff", borderRadius:14, boxShadow:"0 16px 48px rgba(0,0,0,0.14)", border:`1px solid ${C.border}`, zIndex:200, animation:"slideIn 0.2s ease", overflow:"hidden" }}>
                  <div style={{ padding:"0.85rem 1rem", borderBottom:`1px solid ${C.border}` }}>
                    <p style={{ fontWeight:800, fontSize:"0.85rem", color:C.ink, margin:0 }}>{t.topbar.notif}</p>
                  </div>
                  {notifications.map((n,i)=>(
                    <div key={i} style={{ padding:"0.75rem 1rem", borderBottom:`1px solid ${C.border}`, display:"flex", gap:"0.75rem", alignItems:"flex-start", cursor:"pointer" }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <span style={{ width:8,height:8,borderRadius:"50%",background:C.indigo,marginTop:5,flexShrink:0 }} />
                      <p style={{ fontSize:"0.78rem", color:C.slate, margin:0, lineHeight:1.5 }}>{n}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", padding:"6px 10px", background:C.bg, borderRadius:10, border:`1px solid ${C.border}`, cursor:"pointer" }}>
              <div style={{ width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${C.indigo},${C.indigoDark})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"0.8rem" }}>
                {isRTL?"أ":"A"}
              </div>
              <span style={{ fontSize:"0.8rem", fontWeight:700, color:C.ink }}>{t.topbar.profile}</span>
              <span style={{ color:C.muted, fontSize:"0.7rem" }}>▾</span>
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main style={{ flex:1, padding:"1.75rem", overflowY:"auto" }}>
          {page==="dashboard"    && <DashboardPage t={t} locale={locale} />}
          {page==="appointments" && <TablePage     t={t} locale={locale} />}
          {page==="doctors"      && <DoctorsPage   t={t} locale={locale} />}
          {page==="patients"     && <PatientsPage  t={t} locale={locale} />}
          {page==="clinics"      && <ClinicsPage   t={t} locale={locale} />}
          {page==="reports"      && <ReportsPage   t={t} locale={locale} />}
          {page==="payments"     && <PaymentsPage  t={t} locale={locale} />}
          {page==="settings"     && <SettingsPage  t={t} locale={locale} />}
        </main>
      </div>

      {/* Backdrop for notif */}
      {notifOpen && <div onClick={()=>setNotifOpen(false)} style={{ position:"fixed",inset:0,zIndex:49 }} />}
    </div>
  );
}
