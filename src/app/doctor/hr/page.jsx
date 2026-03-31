"use client";
import { useState, useMemo } from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  primary:"#059669",   primaryL:"#ECFDF5",  primaryDark:"#047857",  primaryDeep:"#064E3B",
  blue:"#2563EB",      blueL:"#EFF6FF",
  amber:"#D97706",     amberL:"#FFFBEB",
  red:"#DC2626",       redL:"#FEF2F2",
  violet:"#7C3AED",    violetL:"#F5F3FF",
  sky:"#0284C7",       skyL:"#E0F2FE",
  rose:"#E11D48",      roseL:"#FFF1F2",
  ink:"#0F172A",       slate:"#334155",     muted:"#64748B",
  border:"#E2E8F0",    bg:"#F8FAFC",        white:"#FFFFFF",
  sidebar:"#0F2027",   sidebarBorder:"rgba(255,255,255,0.07)",
};

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  ar: {
    dir:"rtl", lang:"ar",
    logo:"موعد HR", logoSub:"إدارة الموارد البشرية",
    roles:{ superAdmin:"المدير العام", hrAdmin:"مدير الموارد البشرية" },
    nav:{
      dashboard:"الرئيسية", employees:"الموظفون", attendance:"الحضور والدوام",
      payroll:"الرواتب", leaves:"الإجازات", departments:"الأقسام",
      performance:"الأداء", reports:"التقارير",
    },
    topbar:{ search:"ابحث عن موظف، قسم...", notifications:"الإشعارات" },
    dashboard:{
      title:"لوحة الموارد البشرية", sub:"نظرة عامة على القوى العاملة",
      kpis:[
        { label:"إجمالي الموظفين",  val:"٤٧",  delta:"+٣ هذا الشهر",  up:true,  icon:"👥", c:C.primary, bg:C.primaryL },
        { label:"حاضرون اليوم",      val:"٣٩",  delta:"٨٣٪ نسبة الحضور",up:true, icon:"✅", c:C.blue,    bg:C.blueL   },
        { label:"إجازات معلّقة",     val:"٦",   delta:"تنتظر الموافقة",  up:false,icon:"📋", c:C.amber,   bg:C.amberL  },
        { label:"إجمالي الرواتب",    val:"١٢.٤م",delta:"+٥٪ عن الشهر السابق",up:true,icon:"💰",c:C.violet,  bg:C.violetL },
      ],
      attendanceTitle:"الحضور — آخر ٧ أيام",
      deptTitle:"توزيع الموظفين بالأقسام",
      recentTitle:"آخر العمليات",
      birthdayTitle:"أعياد ميلاد هذا الشهر 🎂",
      expiryTitle:"عقود تنتهي قريباً",
    },
    employees:{
      title:"إدارة الموظفين", add:"+ موظف جديد",
      filters:["الكل","نشط","إجازة","منتهي العقد"],
      search:"ابحث بالاسم أو القسم...",
      cols:["الموظف","القسم","المنصب","نوع العقد","الراتب","الحالة","إجراء"],
      statusMap:{ active:"نشط", leave:"إجازة", expired:"منتهي" },
      actions:{ view:"الملف", edit:"تعديل", payslip:"قسيمة" },
      profileTitle:"ملف الموظف",
      tabs:["المعلومات","الحضور","الرواتب","الإجازات","الأداء"],
      addTitle:"إضافة موظف جديد",
      addFields:{
        name:"الاسم الكامل", nameEn:"الاسم بالإنجليزية",
        dept:"القسم", position:"المنصب", contract:"نوع العقد",
        salary:"الراتب الأساسي", startDate:"تاريخ الانضمام",
        phone:"الهاتف", email:"البريد الإلكتروني",
        id:"رقم الهوية", dob:"تاريخ الميلاد",
        address:"العنوان",
      },
      contractTypes:["دوام كامل","دوام جزئي","مؤقت","متعاقد"],
      save:"حفظ الموظف", close:"إلغاء",
    },
    attendance:{
      title:"الحضور والدوام", export:"تصدير",
      filters:["اليوم","هذا الأسبوع","هذا الشهر"],
      cols:["الموظف","التاريخ","وقت الدخول","وقت الخروج","ساعات العمل","الحالة","ملاحظة"],
      statusMap:{ present:"حاضر", absent:"غائب", late:"متأخر", half:"نصف يوم", leave:"إجازة" },
      clockIn:"تسجيل حضور",
      clockOut:"تسجيل انصراف",
      manualTitle:"إضافة سجل يدوي",
      fields:{ emp:"الموظف", date:"التاريخ", inTime:"وقت الدخول", outTime:"وقت الخروج", note:"ملاحظة", status:"الحالة" },
      save:"حفظ السجل",
      summaryTitle:"ملخص هذا الشهر",
      summary:["أيام العمل","أيام الحضور","أيام الغياب","أيام التأخر","الإجازات"],
    },
    payroll:{
      title:"إدارة الرواتب", runPayroll:"تشغيل الرواتب",
      monthTitle:"كشف رواتب",
      cols:["الموظف","الراتب الأساسي","الحوافز","الاستقطاعات","التأمين","الصافي","الحالة","إجراء"],
      statusMap:{ paid:"مدفوع", pending:"معلّق", processing:"جاري" },
      actions:{ payslip:"قسيمة", pay:"صرف" },
      summaryCards:[
        { label:"إجمالي كتلة الرواتب", icon:"💰" },
        { label:"إجمالي الحوافز",       icon:"🎯" },
        { label:"إجمالي الاستقطاعات",  icon:"📉" },
        { label:"صافي الصرف",           icon:"✅" },
      ],
      slipTitle:"قسيمة الراتب",
      slipFields:["الراتب الأساسي","بدل السكن","بدل النقل","بدل الاتصالات","الحوافز","إجمالي المستحقات","التأمين الصحي","الضريبة","غيابات","إجمالي الاستقطاعات","الصافي للصرف"],
    },
    leaves:{
      title:"إدارة الإجازات", newRequest:"طلب إجازة",
      tabs:["طلبات معلّقة","كل الطلبات","أرصدة الإجازات","التقويم"],
      cols:["الموظف","نوع الإجازة","من","إلى","الأيام","السبب","الحالة","إجراء"],
      typeMap:{ annual:"سنوية", sick:"مرضية", emergency:"طارئة", unpaid:"بدون راتب", maternity:"أمومة" },
      statusMap:{ pending:"معلّق", approved:"موافق", rejected:"مرفوض" },
      actions:{ approve:"موافقة", reject:"رفض", view:"عرض" },
      balanceTitle:"أرصدة الإجازات",
      balanceCols:["الموظف","سنوية","مرضية","طارئة","مُستهلك","متبقي"],
      requestTitle:"طلب إجازة جديدة",
      fields:{ type:"نوع الإجازة", from:"من تاريخ", to:"إلى تاريخ", reason:"السبب", attach:"إرفاق وثيقة" },
      save:"إرسال الطلب",
    },
    departments:{
      title:"الأقسام والهيكل التنظيمي", add:"+ قسم جديد",
      cols:["القسم","المدير","عدد الموظفين","كتلة الرواتب","الحالة","إجراء"],
      statusMap:{ active:"نشط", inactive:"معلّق" },
      actions:{ manage:"إدارة", view:"عرض" },
      addTitle:"إضافة قسم جديد",
      fields:{ name:"اسم القسم", manager:"المدير المسؤول", desc:"الوصف" },
      save:"إضافة القسم",
    },
    performance:{
      title:"إدارة الأداء", newReview:"تقييم جديد",
      tabs:["التقييمات","الأهداف","التحذيرات"],
      cols:["الموظف","فترة التقييم","المقيِّم","التواصل","الكفاءة","الالتزام","التعاون","المجموع","الحالة"],
      statusMap:{ completed:"مكتمل", pending:"معلّق", overdue:"متأخر" },
      kpiLabels:["ممتاز","جيد جداً","جيد","مقبول","ضعيف"],
      reviewTitle:"نموذج التقييم",
      criteria:["التواصل مع المرضى","الكفاءة المهنية","الالتزام بالدوام","التعاون مع الفريق","المبادرة والإبداع"],
      save:"حفظ التقييم",
    },
    reports:{
      title:"تقارير الموارد البشرية",
      cards:[
        { title:"تقرير الحضور الشهري",   icon:"📅", desc:"تفصيلي لجميع الموظفين" },
        { title:"تقرير كشف الرواتب",      icon:"💰", desc:"ملخص الصرف الشهري" },
        { title:"تقرير الإجازات",          icon:"🏖️", desc:"الأرصدة والاستهلاك" },
        { title:"تقرير الأداء",            icon:"📊", desc:"نتائج التقييمات" },
        { title:"تقرير دوران الموظفين",   icon:"🔄", desc:"الإضافات والمغادرات" },
        { title:"التقرير المالي للموارد", icon:"📈", desc:"إجمالي تكاليف القوى العاملة" },
      ],
      export:"تصدير PDF", preview:"معاينة",
    },
    statusColors:{
      active:   { bg:"#ECFDF5", c:"#059669" }, leave:   { bg:"#FEF3C7", c:"#D97706" },
      expired:  { bg:"#FEF2F2", c:"#DC2626" }, present: { bg:"#ECFDF5", c:"#059669" },
      absent:   { bg:"#FEF2F2", c:"#DC2626" }, late:    { bg:"#FEF3C7", c:"#D97706" },
      half:     { bg:"#EFF6FF", c:"#2563EB" }, paid:    { bg:"#ECFDF5", c:"#059669" },
      pending:  { bg:"#FEF3C7", c:"#D97706" }, processing:{ bg:"#EFF6FF", c:"#2563EB" },
      approved: { bg:"#ECFDF5", c:"#059669" }, rejected:{ bg:"#FEF2F2", c:"#DC2626" },
      completed:{ bg:"#ECFDF5", c:"#059669" }, overdue: { bg:"#FEF2F2", c:"#DC2626" },
      inactive: { bg:"#F1F5F9", c:"#64748B" },
    },
  },
  en: {
    dir:"ltr", lang:"en",
    logo:"Mawid HR", logoSub:"Human Resources",
    roles:{ superAdmin:"Super Admin", hrAdmin:"HR Manager" },
    nav:{
      dashboard:"Dashboard", employees:"Employees", attendance:"Attendance",
      payroll:"Payroll", leaves:"Leaves", departments:"Departments",
      performance:"Performance", reports:"Reports",
    },
    topbar:{ search:"Search employee, department...", notifications:"Notifications" },
    dashboard:{
      title:"HR Dashboard", sub:"Workforce Overview",
      kpis:[
        { label:"Total Employees",   val:"47",   delta:"+3 this month",     up:true,  icon:"👥", c:C.primary, bg:C.primaryL },
        { label:"Present Today",     val:"39",   delta:"83% attendance",    up:true,  icon:"✅", c:C.blue,    bg:C.blueL   },
        { label:"Pending Leaves",    val:"6",    delta:"Awaiting approval",  up:false, icon:"📋", c:C.amber,   bg:C.amberL  },
        { label:"Total Payroll",     val:"$8.4k",delta:"+5% vs last month",  up:true,  icon:"💰", c:C.violet,  bg:C.violetL },
      ],
      attendanceTitle:"Attendance — Last 7 Days",
      deptTitle:"Employees by Department",
      recentTitle:"Recent Activity",
      birthdayTitle:"Birthdays This Month 🎂",
      expiryTitle:"Contracts Expiring Soon",
    },
    employees:{
      title:"Employee Management", add:"+ New Employee",
      filters:["All","Active","On Leave","Expired"],
      search:"Search by name or department...",
      cols:["Employee","Department","Position","Contract","Salary","Status","Action"],
      statusMap:{ active:"Active", leave:"On Leave", expired:"Expired" },
      actions:{ view:"Profile", edit:"Edit", payslip:"Payslip" },
      profileTitle:"Employee Profile",
      tabs:["Info","Attendance","Payroll","Leaves","Performance"],
      addTitle:"Add New Employee",
      addFields:{
        name:"Full Name (Arabic)", nameEn:"Full Name (English)",
        dept:"Department", position:"Position", contract:"Contract Type",
        salary:"Base Salary", startDate:"Start Date",
        phone:"Phone", email:"Email",
        id:"National ID", dob:"Date of Birth",
        address:"Address",
      },
      contractTypes:["Full-time","Part-time","Temporary","Contractor"],
      save:"Save Employee", close:"Cancel",
    },
    attendance:{
      title:"Attendance Management", export:"Export",
      filters:["Today","This Week","This Month"],
      cols:["Employee","Date","Check-in","Check-out","Hours","Status","Note"],
      statusMap:{ present:"Present", absent:"Absent", late:"Late", half:"Half Day", leave:"On Leave" },
      clockIn:"Clock In",
      clockOut:"Clock Out",
      manualTitle:"Add Manual Record",
      fields:{ emp:"Employee", date:"Date", inTime:"Check-in Time", outTime:"Check-out Time", note:"Note", status:"Status" },
      save:"Save Record",
      summaryTitle:"This Month Summary",
      summary:["Work Days","Present","Absent","Late","On Leave"],
    },
    payroll:{
      title:"Payroll Management", runPayroll:"Run Payroll",
      monthTitle:"Payroll Sheet",
      cols:["Employee","Base","Bonuses","Deductions","Insurance","Net","Status","Action"],
      statusMap:{ paid:"Paid", pending:"Pending", processing:"Processing" },
      actions:{ payslip:"Payslip", pay:"Pay Now" },
      summaryCards:[
        { label:"Total Payroll Mass", icon:"💰" },
        { label:"Total Bonuses",      icon:"🎯" },
        { label:"Total Deductions",   icon:"📉" },
        { label:"Net Disbursement",   icon:"✅" },
      ],
      slipTitle:"Pay Slip",
      slipFields:["Base Salary","Housing Allowance","Transport Allowance","Communications Allowance","Bonuses","Gross Earnings","Health Insurance","Tax","Absences","Total Deductions","Net Salary"],
    },
    leaves:{
      title:"Leave Management", newRequest:"Request Leave",
      tabs:["Pending","All Requests","Leave Balances","Calendar"],
      cols:["Employee","Type","From","To","Days","Reason","Status","Action"],
      typeMap:{ annual:"Annual", sick:"Sick", emergency:"Emergency", unpaid:"Unpaid", maternity:"Maternity" },
      statusMap:{ pending:"Pending", approved:"Approved", rejected:"Rejected" },
      actions:{ approve:"Approve", reject:"Reject", view:"View" },
      balanceTitle:"Leave Balances",
      balanceCols:["Employee","Annual","Sick","Emergency","Used","Remaining"],
      requestTitle:"New Leave Request",
      fields:{ type:"Leave Type", from:"From Date", to:"To Date", reason:"Reason", attach:"Attach Document" },
      save:"Submit Request",
    },
    departments:{
      title:"Departments & Org Structure", add:"+ New Department",
      cols:["Department","Manager","Employees","Payroll","Status","Action"],
      statusMap:{ active:"Active", inactive:"Suspended" },
      actions:{ manage:"Manage", view:"View" },
      addTitle:"Add New Department",
      fields:{ name:"Department Name", manager:"Manager", desc:"Description" },
      save:"Add Department",
    },
    performance:{
      title:"Performance Management", newReview:"New Review",
      tabs:["Reviews","Goals","Warnings"],
      cols:["Employee","Period","Reviewer","Communication","Efficiency","Commitment","Teamwork","Total","Status"],
      statusMap:{ completed:"Completed", pending:"Pending", overdue:"Overdue" },
      kpiLabels:["Excellent","Very Good","Good","Acceptable","Poor"],
      reviewTitle:"Review Form",
      criteria:["Patient Communication","Professional Competency","Attendance & Punctuality","Team Collaboration","Initiative & Creativity"],
      save:"Save Review",
    },
    reports:{
      title:"HR Reports",
      cards:[
        { title:"Monthly Attendance Report", icon:"📅", desc:"Detailed for all employees" },
        { title:"Payroll Report",             icon:"💰", desc:"Monthly disbursement summary" },
        { title:"Leave Report",               icon:"🏖️", desc:"Balances and consumption" },
        { title:"Performance Report",         icon:"📊", desc:"Review results" },
        { title:"Employee Turnover Report",   icon:"🔄", desc:"Additions and departures" },
        { title:"HR Financial Report",        icon:"📈", desc:"Total workforce costs" },
      ],
      export:"Export PDF", preview:"Preview",
    },
    statusColors:{
      active:   { bg:"#ECFDF5", c:"#059669" }, leave:   { bg:"#FEF3C7", c:"#D97706" },
      expired:  { bg:"#FEF2F2", c:"#DC2626" }, present: { bg:"#ECFDF5", c:"#059669" },
      absent:   { bg:"#FEF2F2", c:"#DC2626" }, late:    { bg:"#FEF3C7", c:"#D97706" },
      half:     { bg:"#EFF6FF", c:"#2563EB" }, paid:    { bg:"#ECFDF5", c:"#059669" },
      pending:  { bg:"#FEF3C7", c:"#D97706" }, processing:{ bg:"#EFF6FF", c:"#2563EB" },
      approved: { bg:"#ECFDF5", c:"#059669" }, rejected:{ bg:"#FEF2F2", c:"#DC2626" },
      completed:{ bg:"#ECFDF5", c:"#059669" }, overdue: { bg:"#FEF2F2", c:"#DC2626" },
      inactive: { bg:"#F1F5F9", c:"#64748B" },
    },
  },
};

// ── Sample Data ───────────────────────────────────────────────────────────────
const mkEmp = (id,nameAr,nameEn,dept,pos,contract,salaryAr,salaryEn,status,avatar,color,dob) => ({
  id, nameAr, nameEn, dept, pos, contract, salaryAr, salaryEn, status, avatar, color,
  email:`${nameEn.split(" ")[1]?.toLowerCase()||"emp"}@mawid.iq`,
  phone:"07" + Math.floor(700000000+Math.random()*99999999),
  dob: dob||"1990-01-01", startDate:"2022-03-15",
  address: "بغداد، الكرادة"
});

const EMPLOYEES = [
  mkEmp(1,"سارة الحمداني","Sara Al-Hamdani","استقبال","مديرة الاستقبال","Full-time","٦٥٠,٠٠٠ د","$440","active","س",C.primary,"1992-05-15"),
  mkEmp(2,"علي المحمداوي","Ali Al-Muhammadawi","محاسبة","محاسب أول","Full-time","٨٠٠,٠٠٠ د","$540","active","ع",C.blue,"1988-08-23"),
  mkEmp(3,"نور الراشدي","Nour Al-Rashidi","تمريض","ممرضة","Full-time","٥٥٠,٠٠٠ د","$372","active","ن",C.violet,"1995-11-03"),
  mkEmp(4,"كريم العبيدي","Kareem Al-Obeidi","تقنية المعلومات","مطور أنظمة","Full-time","٩٠٠,٠٠٠ د","$608","active","ك",C.sky,"1991-03-19"),
  mkEmp(5,"هدى السامرائي","Huda Al-Samarrai","موارد بشرية","أخصائية موارد بشرية","Full-time","٧٠٠,٠٠٠ د","$473","leave","ه","#EC4899","1993-07-30"),
  mkEmp(6,"محمد الجبوري","Mohammed Al-Jubouri","استقبال","موظف استقبال","Part-time","٤٠٠,٠٠٠ د","$270","active","م",C.amber,"1997-02-12"),
  mkEmp(7,"زينب الكريمي","Zainab Al-Karimi","تمريض","ممرضة أولى","Full-time","٦٢٠,٠٠٠ د","$419","active","ز","#14B8A6","1990-09-05"),
  mkEmp(8,"حسن الموسوي","Hassan Al-Musawi","إدارة","مساعد إداري","Full-time","٥٨٠,٠٠٠ د","$392","active","ح",C.red,"1994-12-20"),
  mkEmp(9,"رنا البياتي","Rana Al-Bayati","محاسبة","مساعدة محاسبة","Temporary","٤٥٠,٠٠٠ د","$304","active","ر","#8B5CF6","1996-06-14"),
  mkEmp(10,"أحمد طارق","Ahmad Tariq","تقنية المعلومات","دعم تقني","Contractor","٣٨٠,٠٠٠ د","$257","expired","أ",C.muted,"1999-04-08"),
];

const DEPTS_DATA = [
  { nameAr:"استقبال",           nameEn:"Reception",         mgr:"سارة الحمداني", mgrEn:"Sara Al-Hamdani", count:4, salaryAr:"١.٨م د", salaryEn:"$1.2k", status:"active", icon:"🏥" },
  { nameAr:"تمريض",             nameEn:"Nursing",           mgr:"زينب الكريمي",  mgrEn:"Zainab Al-Karimi", count:8, salaryAr:"٤.٢م د", salaryEn:"$2.8k", status:"active", icon:"💉" },
  { nameAr:"محاسبة",            nameEn:"Accounting",        mgr:"علي المحمداوي", mgrEn:"Ali Al-Muhammadawi", count:3, salaryAr:"١.٩م د", salaryEn:"$1.3k", status:"active", icon:"💰" },
  { nameAr:"تقنية المعلومات",   nameEn:"IT",                mgr:"كريم العبيدي",  mgrEn:"Kareem Al-Obeidi", count:3, salaryAr:"٢.٣م د", salaryEn:"$1.6k", status:"active", icon:"💻" },
  { nameAr:"موارد بشرية",       nameEn:"Human Resources",   mgr:"هدى السامرائي", mgrEn:"Huda Al-Samarrai", count:2, salaryAr:"١.٤م د", salaryEn:"$0.9k", status:"active", icon:"👥" },
  { nameAr:"إدارة",             nameEn:"Administration",    mgr:"حسن الموسوي",   mgrEn:"Hassan Al-Musawi", count:5, salaryAr:"٢.١م د", salaryEn:"$1.4k", status:"active", icon:"📋" },
];

const ATTENDANCE_DATA = [
  { emp:EMPLOYEES[0], date:"26/02/2025", in:"08:02", out:"16:05", hours:"8.0",  status:"present", note:"" },
  { emp:EMPLOYEES[1], date:"26/02/2025", in:"08:45", out:"16:00", hours:"7.25", status:"late",    note:"ازدحام" },
  { emp:EMPLOYEES[2], date:"26/02/2025", in:"08:00", out:"16:00", hours:"8.0",  status:"present", note:"" },
  { emp:EMPLOYEES[3], date:"26/02/2025", in:"--",    out:"--",    hours:"--",   status:"absent",  note:"مرض" },
  { emp:EMPLOYEES[4], date:"26/02/2025", in:"--",    out:"--",    hours:"--",   status:"leave",   note:"إجازة سنوية" },
  { emp:EMPLOYEES[5], date:"26/02/2025", in:"09:00", out:"13:00", hours:"4.0",  status:"half",    note:"دوام جزئي" },
  { emp:EMPLOYEES[6], date:"26/02/2025", in:"07:58", out:"16:02", hours:"8.0",  status:"present", note:"" },
  { emp:EMPLOYEES[7], date:"26/02/2025", in:"08:15", out:"16:00", hours:"7.75", status:"present", note:"" },
];

const PAYROLL_DATA = EMPLOYEES.slice(0,8).map((e,i) => ({
  emp:e,
  base:    [650,800,550,900,700,400,620,580][i],
  bonuses: [50,100,30,120,0,20,40,30][i],
  deductions:[40,60,30,70,50,25,45,35][i],
  insurance:[25,30,20,35,25,15,22,20][i],
  status:  i<5 ? "paid" : i===5 ? "processing" : "pending",
}));

const LEAVES_DATA = [
  { emp:EMPLOYEES[4], type:"annual",    from:"20/02/2025", to:"05/03/2025", days:14, reason:"إجازة عائلية", status:"approved" },
  { emp:EMPLOYEES[1], type:"sick",      from:"25/02/2025", to:"26/02/2025", days:2,  reason:"مرض", status:"approved" },
  { emp:EMPLOYEES[2], type:"emergency", from:"27/02/2025", to:"27/02/2025", days:1,  reason:"ظرف عائلي", status:"pending" },
  { emp:EMPLOYEES[5], type:"annual",    from:"01/03/2025", to:"07/03/2025", days:7,  reason:"سفر", status:"pending" },
  { emp:EMPLOYEES[7], type:"sick",      from:"15/02/2025", to:"17/02/2025", days:3,  reason:"حمى", status:"approved" },
  { emp:EMPLOYEES[9], type:"unpaid",    from:"10/02/2025", to:"12/02/2025", days:3,  reason:"شخصي", status:"rejected" },
];

const PERF_DATA = EMPLOYEES.slice(0,6).map((e,i) => ({
  emp:e,
  period: "Q4 2024",
  reviewer: "هدى السامرائي",
  scores: [
    [4,5,5,4,3],[5,5,5,5,4],[4,3,4,4,3],[5,5,4,5,5],[3,4,3,3,2],[4,4,5,4,4]
  ][i],
  status: i<4 ? "completed" : "pending",
}));

const CHART_VALS = [38,42,35,45,41,39,47];
const CHART_DAYS_AR = ["إثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت","أحد"];
const CHART_DAYS_EN = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// ── UI Atoms ──────────────────────────────────────────────────────────────────
const Badge = ({ status, map, sc }) => {
  const s = sc[status] || { bg:"#F1F5F9", c:"#64748B" };
  return <span style={{ background:s.bg, color:s.c, padding:"3px 10px", borderRadius:20, fontSize:"0.7rem", fontWeight:700, whiteSpace:"nowrap" }}>{map[status]||status}</span>;
};

const Toggle = ({ on, onChange }) => (
  <div onClick={onChange} style={{ width:44,height:24,borderRadius:12,padding:2,cursor:"pointer", background:on?C.primary:"#CBD5E1", display:"flex",alignItems:"center", justifyContent:on?"flex-end":"flex-start", transition:"all .25s" }}>
    <div style={{ width:20,height:20,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,.2)" }} />
  </div>
);

const Modal = ({ open, onClose, title, wide, children }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem" }}>
      <div onClick={onClose} style={{ position:"absolute",inset:0,background:"rgba(15,32,39,.6)",backdropFilter:"blur(5px)" }} />
      <div style={{ position:"relative",background:"#fff",borderRadius:20,padding:"2rem",width:"100%",maxWidth:wide?760:520,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,.25)",zIndex:1 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem" }}>
          <p style={{ fontWeight:900,fontSize:"1.05rem",color:C.ink,margin:0 }}>{title}</p>
          <button onClick={onClose} style={{ width:32,height:32,borderRadius:8,background:C.bg,border:`1px solid ${C.border}`,fontSize:"1.1rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.muted }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const BarChart = ({ vals, days, color=C.primary }) => {
  const mx = Math.max(...vals);
  return (
    <div style={{ display:"flex",alignItems:"flex-end",gap:"0.5rem",height:100 }}>
      {vals.map((v,i)=>(
        <div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem",height:"100%" }}>
          <div style={{ flex:1,display:"flex",alignItems:"flex-end",width:"100%" }}>
            <div style={{ width:"100%",height:`${(v/mx)*100}%`,background:`linear-gradient(180deg,${color}CC,${color})`,borderRadius:"5px 5px 0 0",minHeight:4 }} />
          </div>
          <span style={{ fontSize:"0.62rem",color:C.muted,whiteSpace:"nowrap" }}>{days[i]}</span>
        </div>
      ))}
    </div>
  );
};

const RadialScore = ({ score, max=5, color=C.primary, size=60 }) => {
  const pct = score/max;
  const r=22, circ=2*Math.PI*r;
  return (
    <svg width={size} height={size} viewBox="0 0 52 52">
      <circle cx={26} cy={26} r={r} fill="none" stroke="#E2E8F0" strokeWidth={5}/>
      <circle cx={26} cy={26} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={circ*(1-pct)}
        strokeLinecap="round" transform="rotate(-90 26 26)" style={{transition:"stroke-dashoffset .5s ease"}}/>
      <text x={26} y={30} textAnchor="middle" fontSize={10} fontWeight={800} fill={color}>{score}</text>
    </svg>
  );
};

// ── Avatar ─────────────────────────────────────────────────────────────────────
const Av = ({ emp, size=38 }) => (
  <div style={{ width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${emp.color}33,${emp.color}77)`,border:`2px solid ${emp.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:emp.color,fontSize:size*0.36,flexShrink:0 }}>
    {emp.avatar}
  </div>
);

// ── Input / Select ──────────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div>
    <label style={{ display:"block",fontSize:"0.76rem",fontWeight:700,color:C.slate,marginBottom:"0.35rem" }}>{label}</label>
    {children}
  </div>
);
const Inp = (props) => <input {...props} style={{ width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:"0.85rem",color:C.ink,background:C.bg,...props.style }} />;
const Sel = ({ children, ...props }) => <select {...props} style={{ width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:"0.85rem",color:C.ink,background:C.bg,...props.style }}>{children}</select>;

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ t, locale }) {
  const d = t.dashboard;
  const days = locale==="ar" ? CHART_DAYS_AR : CHART_DAYS_EN;
  const recentActs = locale==="ar"
    ? ["تم إضافة موظفة جديدة: رنا البياتي","صرف رواتب شهر فبراير بنجاح","موافقة على إجازة هدى السامرائي","تحذير: عقد أحمد طارق ينتهي قريباً"]
    : ["New employee added: Rana Al-Bayati","February payroll disbursed successfully","Huda Al-Samarrai leave approved","Warning: Ahmad Tariq contract expiring soon"];
  const birthdays = locale==="ar"
    ? [{name:"هدى السامرائي",date:"٣٠ يوليو",avatar:"ه",color:"#EC4899"},{name:"علي المحمداوي",date:"٢٣ أغسطس",avatar:"ع",color:C.blue}]
    : [{name:"Huda Al-Samarrai",date:"Jul 30",avatar:"H",color:"#EC4899"},{name:"Ali Al-Muhammadawi",date:"Aug 23",avatar:"A",color:C.blue}];
  const expiring = locale==="ar"
    ? [{name:"أحمد طارق",days:"١٢ يوم",avatar:"أ",color:C.muted},{name:"محمد الجبوري",days:"٤٥ يوم",avatar:"م",color:C.amber}]
    : [{name:"Ahmad Tariq",days:"12 days",avatar:"A",color:C.muted},{name:"Mohammed Al-Jubouri",days:"45 days",avatar:"M",color:C.amber}];

  return (
    <div>
      <div style={{ marginBottom:"1.5rem" }}>
        <h1 style={{ fontWeight:900,fontSize:"1.45rem",color:C.ink,margin:"0 0 .2rem" }}>{d.title}</h1>
        <p style={{ color:C.muted,fontSize:"0.85rem",margin:0 }}>{d.sub}</p>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1rem",marginBottom:"1.5rem" }}>
        {d.kpis.map((k,i)=>(
          <div key={i} style={{ background:C.white,borderRadius:16,padding:"1.25rem",border:`1px solid ${C.border}`,boxShadow:"0 2px 8px rgba(0,0,0,.04)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.85rem" }}>
              <div style={{ width:44,height:44,borderRadius:12,background:k.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem" }}>{k.icon}</div>
              <span style={{ fontSize:"0.7rem",fontWeight:700,color:k.up?C.primary:C.amber,background:k.up?C.primaryL:C.amberL,padding:"3px 8px",borderRadius:20 }}>
                {k.up?"▲":"▼"} {k.delta}
              </span>
            </div>
            <p style={{ fontSize:"1.7rem",fontWeight:900,color:k.c,margin:"0 0 .2rem",lineHeight:1 }}>{k.val}</p>
            <p style={{ fontSize:"0.77rem",color:C.muted,margin:0 }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1.4fr 0.6fr",gap:"1.25rem",marginBottom:"1.25rem" }}>
        {/* Chart */}
        <div style={{ background:C.white,borderRadius:16,padding:"1.5rem",border:`1px solid ${C.border}` }}>
          <p style={{ fontWeight:800,fontSize:"0.9rem",color:C.ink,margin:"0 0 1.25rem" }}>{d.attendanceTitle}</p>
          <BarChart vals={CHART_VALS} days={days} color={C.primary} />
        </div>

        {/* Dept donut-style */}
        <div style={{ background:C.white,borderRadius:16,padding:"1.5rem",border:`1px solid ${C.border}` }}>
          <p style={{ fontWeight:800,fontSize:"0.9rem",color:C.ink,margin:"0 0 1rem" }}>{d.deptTitle}</p>
          {DEPTS_DATA.slice(0,4).map((d2,i)=>{
            const pct = [30,17,13,13][i];
            const colors = [C.primary,C.blue,C.amber,C.violet];
            return (
              <div key={i} style={{ marginBottom:"0.6rem" }}>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.75rem",marginBottom:"0.2rem" }}>
                  <span style={{ color:C.slate,fontWeight:600 }}>{locale==="ar"?d2.nameAr:d2.nameEn}</span>
                  <span style={{ color:colors[i],fontWeight:700 }}>{d2.count} ({pct}%)</span>
                </div>
                <div style={{ height:6,background:C.bg,borderRadius:3,overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${pct*2.8}%`,background:colors[i],borderRadius:3,transition:"width .5s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1.2fr 0.4fr 0.4fr",gap:"1.25rem" }}>
        {/* Recent activity */}
        <div style={{ background:C.white,borderRadius:16,padding:"1.5rem",border:`1px solid ${C.border}` }}>
          <p style={{ fontWeight:800,fontSize:"0.9rem",color:C.ink,margin:"0 0 1rem" }}>{d.recentTitle}</p>
          {recentActs.map((a,i)=>(
            <div key={i} style={{ display:"flex",gap:"0.7rem",alignItems:"flex-start",padding:"0.55rem 0",borderBottom:i<recentActs.length-1?`1px solid ${C.border}`:"none" }}>
              <span style={{ width:8,height:8,borderRadius:"50%",background:i===3?C.amber:C.primary,marginTop:5,flexShrink:0 }} />
              <p style={{ fontSize:"0.8rem",color:C.slate,margin:0,lineHeight:1.5 }}>{a}</p>
            </div>
          ))}
        </div>

        {/* Birthdays */}
        <div style={{ background:C.white,borderRadius:16,padding:"1.5rem",border:`1px solid ${C.border}` }}>
          <p style={{ fontWeight:800,fontSize:"0.88rem",color:C.ink,margin:"0 0 1rem" }}>{d.birthdayTitle}</p>
          {birthdays.map((b,i)=>(
            <div key={i} style={{ display:"flex",gap:"0.6rem",alignItems:"center",marginBottom:"0.85rem" }}>
              <div style={{ width:36,height:36,borderRadius:"50%",background:`${b.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:b.color,fontSize:"0.9rem" }}>{b.avatar}</div>
              <div>
                <p style={{ fontSize:"0.78rem",fontWeight:700,color:C.ink,margin:0 }}>{b.name}</p>
                <p style={{ fontSize:"0.7rem",color:C.muted,margin:0 }}>🎂 {b.date}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Expiring contracts */}
        <div style={{ background:C.white,borderRadius:16,padding:"1.5rem",border:`1px solid ${C.border}` }}>
          <p style={{ fontWeight:800,fontSize:"0.88rem",color:C.ink,margin:"0 0 1rem" }}>{d.expiryTitle}</p>
          {expiring.map((e,i)=>(
            <div key={i} style={{ display:"flex",gap:"0.6rem",alignItems:"center",marginBottom:"0.85rem" }}>
              <div style={{ width:36,height:36,borderRadius:"50%",background:`${e.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:e.color,fontSize:"0.9rem" }}>{e.avatar}</div>
              <div>
                <p style={{ fontSize:"0.78rem",fontWeight:700,color:C.ink,margin:0 }}>{e.name}</p>
                <p style={{ fontSize:"0.7rem",color:C.red,fontWeight:600,margin:0 }}>⚠️ {e.days}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── EMPLOYEES ─────────────────────────────────────────────────────────────────
function Employees({ t, locale }) {
  const et = t.employees;
  const [filter, setFilter] = useState(0);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileTab, setProfileTab] = useState(0);
  const [payslipModal, setPayslipModal] = useState(null);

  const filtered = useMemo(() => EMPLOYEES.filter(e => {
    const f = [null,"active","leave","expired"][filter];
    if(f && e.status!==f) return false;
    const q = search.toLowerCase();
    return !q || e.nameAr.includes(search) || e.nameEn.toLowerCase().includes(q) || e.dept.includes(search);
  }),[filter,search]);

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem" }}>
        <h1 style={{ fontWeight:900,fontSize:"1.4rem",color:C.ink,margin:0 }}>{et.title}</h1>
        <button onClick={()=>setModal(true)} style={{ background:C.primary,color:"#fff",padding:"9px 18px",borderRadius:9,fontWeight:700,fontSize:"0.85rem",cursor:"pointer" }}>{et.add}</button>
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex",gap:"0.75rem",marginBottom:"1.25rem",flexWrap:"wrap",alignItems:"center" }}>
        <div style={{ position:"relative",flex:1,maxWidth:340 }}>
          <span style={{ position:"absolute",top:"50%",transform:"translateY(-50%)",[locale==="ar"?"right":"left"]:12,color:C.muted }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={et.search} style={{ width:"100%",padding:`9px 12px 9px ${locale==="ar"?"12px":"36px"}`,paddingRight:locale==="ar"?"36px":"12px",border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:"0.845rem",color:C.ink,background:C.white }} />
        </div>
        <div style={{ display:"flex",gap:"0.5rem" }}>
          {et.filters.map((f,i)=>(
            <button key={f} onClick={()=>setFilter(i)} style={{ padding:"7px 16px",borderRadius:20,fontSize:"0.79rem",fontWeight:600,background:filter===i?C.primary:C.white,color:filter===i?"#fff":C.muted,border:`1px solid ${filter===i?C.primary:C.border}`,cursor:"pointer",transition:"all .15s" }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Grid cards view */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:"1rem" }}>
        {filtered.map(emp=>(
          <div key={emp.id} style={{ background:C.white,borderRadius:18,padding:"1.5rem",border:`1px solid ${C.border}`,boxShadow:"0 2px 10px rgba(0,0,0,.04)",transition:"all .22s",cursor:"pointer" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 12px 36px ${emp.color}18`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,.04)";}}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1rem" }}>
              <div style={{ display:"flex",gap:"0.7rem",alignItems:"center" }}>
                <Av emp={emp} size={50} />
                <div>
                  <p style={{ fontWeight:800,color:C.ink,margin:"0 0 .15rem",fontSize:"0.9rem" }}>{locale==="ar"?emp.nameAr:emp.nameEn}</p>
                  <p style={{ color:emp.color,fontSize:"0.75rem",fontWeight:700,margin:0 }}>{emp.pos}</p>
                  <p style={{ color:C.muted,fontSize:"0.72rem",margin:0 }}>🏢 {locale==="ar"?emp.dept:emp.dept}</p>
                </div>
              </div>
              <Badge status={emp.status} map={et.statusMap} sc={t.statusColors} />
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem",marginBottom:"1rem" }}>
              <div style={{ background:C.bg,borderRadius:9,padding:"0.6rem",textAlign:"center" }}>
                <p style={{ fontSize:"0.75rem",color:C.muted,margin:"0 0 .15rem" }}>{locale==="ar"?"الراتب":"Salary"}</p>
                <p style={{ fontSize:"0.85rem",fontWeight:800,color:C.primary,margin:0 }}>{locale==="ar"?emp.salaryAr:emp.salaryEn}</p>
              </div>
              <div style={{ background:C.bg,borderRadius:9,padding:"0.6rem",textAlign:"center" }}>
                <p style={{ fontSize:"0.75rem",color:C.muted,margin:"0 0 .15rem" }}>{locale==="ar"?"العقد":"Contract"}</p>
                <p style={{ fontSize:"0.75rem",fontWeight:700,color:C.slate,margin:0 }}>{emp.contract}</p>
              </div>
            </div>
            <div style={{ display:"flex",gap:"0.5rem" }}>
              <button onClick={()=>{setProfile(emp);setProfileTab(0);}} style={{ flex:2,padding:"7px",borderRadius:8,border:`1px solid ${C.primary}`,background:C.primaryL,fontSize:"0.74rem",fontWeight:700,color:C.primary,cursor:"pointer" }}>{et.actions.view}</button>
              <button style={{ flex:1,padding:"7px",borderRadius:8,border:`1px solid ${C.border}`,background:C.bg,fontSize:"0.74rem",fontWeight:600,color:C.muted,cursor:"pointer" }}>{et.actions.edit}</button>
              <button onClick={()=>setPayslipModal(emp)} style={{ flex:1,padding:"7px",borderRadius:8,border:`1px solid ${C.border}`,background:C.bg,fontSize:"0.74rem",fontWeight:600,color:C.muted,cursor:"pointer" }}>{et.actions.payslip}</button>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Modal */}
      <Modal open={!!profile} onClose={()=>setProfile(null)} title={et.profileTitle} wide>
        {profile && (
          <div>
            <div style={{ display:"flex",gap:"1.25rem",alignItems:"center",marginBottom:"1.5rem",padding:"1.25rem",background:C.bg,borderRadius:14 }}>
              <Av emp={profile} size={70} />
              <div style={{ flex:1 }}>
                <h2 style={{ fontWeight:900,fontSize:"1.15rem",color:C.ink,margin:"0 0 .25rem" }}>{locale==="ar"?profile.nameAr:profile.nameEn}</h2>
                <p style={{ color:profile.color,fontWeight:700,fontSize:"0.85rem",margin:"0 0 .2rem" }}>{profile.pos}</p>
                <p style={{ color:C.muted,fontSize:"0.78rem",margin:0 }}>📧 {profile.email} · 📞 {profile.phone}</p>
              </div>
              <Badge status={profile.status} map={et.statusMap} sc={t.statusColors} />
            </div>
            {/* Tabs */}
            <div style={{ display:"flex",gap:"0.2rem",background:C.bg,borderRadius:11,padding:3,marginBottom:"1.25rem",border:`1px solid ${C.border}` }}>
              {et.tabs.map((tb,i)=>(
                <button key={tb} onClick={()=>setProfileTab(i)} style={{ flex:1,padding:"7px",borderRadius:9,fontSize:"0.77rem",fontWeight:700,background:profileTab===i?C.primary:"transparent",color:profileTab===i?"#fff":C.muted,border:"none",cursor:"pointer",transition:"all .18s" }}>{tb}</button>
              ))}
            </div>
            {profileTab===0 && (
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.85rem" }}>
                {[["القسم / Department", profile.dept],["المنصب / Position",profile.pos],["نوع العقد / Contract",profile.contract],["الراتب / Salary",`${profile.salaryAr} / ${profile.salaryEn}`],["تاريخ الانضمام / Start",profile.startDate],["رقم الهوية / ID",profile.id||"123-456-789"],["تاريخ الميلاد / DOB",profile.dob],["العنوان / Address",profile.address]].map(([k,v])=>(
                  <div key={k} style={{ padding:"0.85rem",background:C.bg,borderRadius:10,border:`1px solid ${C.border}` }}>
                    <p style={{ fontSize:"0.7rem",color:C.muted,margin:"0 0 .25rem",fontWeight:600 }}>{k}</p>
                    <p style={{ fontSize:"0.83rem",fontWeight:700,color:C.ink,margin:0 }}>{v}</p>
                  </div>
                ))}
              </div>
            )}
            {profileTab===1 && (
              <div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"0.75rem",marginBottom:"1rem" }}>
                  {(locale==="ar"?["أيام العمل","الحضور","الغياب","التأخر","الإجازات"]:["Work Days","Present","Absent","Late","Leave"]).map((l,i)=>(
                    <div key={l} style={{ textAlign:"center",padding:"0.85rem",background:C.bg,borderRadius:10,border:`1px solid ${C.border}` }}>
                      <p style={{ fontSize:"1.3rem",fontWeight:900,color:[C.ink,C.primary,C.red,C.amber,C.blue][i],margin:"0 0 .2rem" }}>{[22,19,1,2,0][i]}</p>
                      <p style={{ fontSize:"0.68rem",color:C.muted,margin:0 }}>{l}</p>
                    </div>
                  ))}
                </div>
                <BarChart vals={[1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0].map(v=>v*8)} days={Array.from({length:22},(_,i)=>String(i+1))} color={C.primary} />
              </div>
            )}
            {(profileTab===2||profileTab===3||profileTab===4) && (
              <div style={{ textAlign:"center",padding:"2.5rem",color:C.muted }}>
                <div style={{ fontSize:"2.5rem",marginBottom:"0.75rem" }}>📋</div>
                <p style={{ fontWeight:700 }}>{locale==="ar"?"البيانات التفصيلية متاحة في القسم المخصص":"Detailed data available in the dedicated section"}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Employee Modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title={et.addTitle} wide>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.85rem" }}>
          {Object.entries(et.addFields).map(([k,v])=>(
            <Field key={k} label={v}>
              {k==="contract"
                ? <Sel><option value="">{v}</option>{et.contractTypes.map(c=><option key={c}>{c}</option>)}</Sel>
                : k==="startDate"||k==="dob" ? <Inp type="date" />
                : <Inp placeholder={v} type={k==="email"?"email":k==="salary"?"number":"text"} />
              }
            </Field>
          ))}
        </div>
        <div style={{ display:"flex",gap:"0.75rem",marginTop:"1.25rem" }}>
          <button onClick={()=>setModal(false)} style={{ flex:1,padding:"11px",borderRadius:9,border:`1px solid ${C.border}`,background:C.bg,fontWeight:700,color:C.muted,cursor:"pointer" }}>{et.close}</button>
          <button onClick={()=>setModal(false)} style={{ flex:2,padding:"11px",borderRadius:9,background:C.primary,color:"#fff",fontWeight:700,cursor:"pointer" }}>{et.save}</button>
        </div>
      </Modal>

      {/* Payslip Modal */}
      <Modal open={!!payslipModal} onClose={()=>setPayslipModal(null)} title={t.payroll.slipTitle}>
        {payslipModal && <PayslipContent emp={payslipModal} t={t} locale={locale} />}
      </Modal>
    </div>
  );
}

// ── PAYSLIP CONTENT ────────────────────────────────────────────────────────────
function PayslipContent({ emp, t, locale }) {
  const vals = [emp.salaryEn.replace("$",""),"120","80","40","50","","25","0","0","",""];
  const basePay = parseInt(emp.salaryEn.replace("$",""))||400;
  const gross = basePay+120+80+40+50;
  const deducts = 25+0+0;
  const net = gross-deducts;
  const numVals = [basePay,120,80,40,50,gross,25,0,0,deducts,net];
  return (
    <div>
      <div style={{ background:C.primaryDeep,borderRadius:14,padding:"1.25rem",color:"#fff",marginBottom:"1.25rem",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div>
          <p style={{ fontWeight:900,fontSize:"1.05rem",margin:"0 0 .2rem" }}>{locale==="ar"?emp.nameAr:emp.nameEn}</p>
          <p style={{ fontSize:"0.78rem",opacity:.75,margin:0 }}>{emp.pos} · {locale==="ar"?"فبراير ٢٠٢٥":"February 2025"}</p>
        </div>
        <div style={{ textAlign:"center" }}>
          <p style={{ fontSize:"0.7rem",opacity:.65,margin:"0 0 .15rem" }}>{locale==="ar"?"الصافي":"Net"}</p>
          <p style={{ fontSize:"1.5rem",fontWeight:900,color:"#6EE7B7",margin:0 }}>${net}</p>
        </div>
      </div>
      {t.payroll.slipFields.map((field,i)=>{
        const isDivider = i===5||i===9;
        const isTotal = i===5||i===10;
        const isDeduct = i>=6&&i<=9;
        return (
          <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.55rem 0.25rem",borderBottom:isDivider?`2px solid ${C.border}`:`1px solid ${C.bg}`,fontWeight:isTotal?800:400 }}>
            <span style={{ fontSize:"0.82rem",color:isDeduct&&!isTotal?C.red:C.slate,fontWeight:isTotal?800:500 }}>{field}</span>
            <span style={{ fontSize:"0.85rem",fontWeight:isTotal?900:600,color:i===10?C.primary:isDeduct&&!isTotal?C.red:C.ink }}>${numVals[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── ATTENDANCE ─────────────────────────────────────────────────────────────────
function Attendance({ t, locale }) {
  const at = t.attendance;
  const [period, setPeriod] = useState(0);
  const [modal, setModal] = useState(false);
  const summaryNums = [22,19,1,2,0];
  const summaryColors = [C.ink,C.primary,C.red,C.amber,C.blue];

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem",flexWrap:"wrap",gap:"0.75rem" }}>
        <h1 style={{ fontWeight:900,fontSize:"1.4rem",color:C.ink,margin:0 }}>{at.title}</h1>
        <div style={{ display:"flex",gap:"0.6rem" }}>
          <div style={{ display:"flex",background:C.white,borderRadius:9,border:`1px solid ${C.border}`,overflow:"hidden" }}>
            {at.filters.map((f,i)=>(
              <button key={f} onClick={()=>setPeriod(i)} style={{ padding:"7px 14px",fontSize:"0.78rem",fontWeight:600,background:period===i?C.primary:"transparent",color:period===i?"#fff":C.muted,border:"none",cursor:"pointer" }}>{f}</button>
            ))}
          </div>
          <button onClick={()=>setModal(true)} style={{ background:C.primary,color:"#fff",padding:"8px 16px",borderRadius:9,fontWeight:700,fontSize:"0.82rem",cursor:"pointer" }}>+ {at.clockIn}</button>
          <button style={{ background:C.bg,color:C.muted,padding:"8px 16px",borderRadius:9,fontWeight:600,fontSize:"0.82rem",border:`1px solid ${C.border}`,cursor:"pointer" }}>{at.export}</button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"0.85rem",marginBottom:"1.5rem" }}>
        {at.summary.map((s,i)=>(
          <div key={s} style={{ background:C.white,borderRadius:14,padding:"1rem",border:`1px solid ${C.border}`,textAlign:"center" }}>
            <p style={{ fontSize:"1.6rem",fontWeight:900,color:summaryColors[i],margin:"0 0 .2rem",lineHeight:1 }}>{summaryNums[i]}</p>
            <p style={{ fontSize:"0.73rem",color:C.muted,margin:0 }}>{s}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:C.white,borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.bg }}>
                {at.cols.map(c=><th key={c} style={{ padding:"0.85rem 1rem",textAlign:locale==="ar"?"right":"left",fontSize:"0.74rem",fontWeight:700,color:C.muted,whiteSpace:"nowrap" }}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {ATTENDANCE_DATA.map((row,i)=>(
                <tr key={i} style={{ borderTop:`1px solid ${C.border}`,transition:"background .15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"0.8rem 1rem" }}>
                    <div style={{ display:"flex",gap:"0.6rem",alignItems:"center" }}>
                      <Av emp={row.emp} size={34} />
                      <span style={{ fontWeight:700,fontSize:"0.82rem",color:C.ink }}>{locale==="ar"?row.emp.nameAr:row.emp.nameEn}</span>
                    </div>
                  </td>
                  <td style={{ padding:"0.8rem 1rem",fontSize:"0.78rem",color:C.muted }}>{row.date}</td>
                  <td style={{ padding:"0.8rem 1rem",fontSize:"0.82rem",fontWeight:600,color:row.status==="absent"||row.status==="leave"?C.muted:C.ink }}>{row.in}</td>
                  <td style={{ padding:"0.8rem 1rem",fontSize:"0.82rem",fontWeight:600,color:row.status==="absent"||row.status==="leave"?C.muted:C.ink }}>{row.out}</td>
                  <td style={{ padding:"0.8rem 1rem",fontSize:"0.82rem",fontWeight:700,color:parseFloat(row.hours)>=8?C.primary:row.hours==="--"?C.muted:C.amber }}>{row.hours}</td>
                  <td style={{ padding:"0.8rem 1rem" }}><Badge status={row.status} map={at.statusMap} sc={t.statusColors} /></td>
                  <td style={{ padding:"0.8rem 1rem",fontSize:"0.77rem",color:C.muted }}>{locale==="ar"?row.note:row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual record modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title={at.manualTitle}>
        <div style={{ display:"flex",flexDirection:"column",gap:"0.85rem" }}>
          {[at.fields.emp,at.fields.date,at.fields.inTime,at.fields.outTime,at.fields.status,at.fields.note].map((f,i)=>(
            <Field key={f} label={f}>
              {i===0 ? <Sel><option>{f}</option>{EMPLOYEES.map(e=><option key={e.id}>{locale==="ar"?e.nameAr:e.nameEn}</option>)}</Sel>
              : i===1 ? <Inp type="date" />
              : i===2||i===3 ? <Inp type="time" />
              : i===4 ? <Sel><option>{f}</option>{Object.entries(at.statusMap).map(([k,v])=><option key={k} value={k}>{v}</option>)}</Sel>
              : <Inp placeholder={f} />}
            </Field>
          ))}
          <button onClick={()=>setModal(false)} style={{ padding:"12px",borderRadius:9,background:C.primary,color:"#fff",fontWeight:700,fontSize:"0.875rem",marginTop:"0.5rem",cursor:"pointer" }}>{at.save}</button>
        </div>
      </Modal>
    </div>
  );
}

// ── PAYROLL ────────────────────────────────────────────────────────────────────
function Payroll({ t, locale }) {
  const pt = t.payroll;
  const [payslipEmp, setPayslipEmp] = useState(null);

  const totals = PAYROLL_DATA.reduce((acc,r)=>({ base:acc.base+r.base, bonus:acc.bonus+r.bonuses, ded:acc.ded+r.deductions+r.insurance, net:acc.net+(r.base+r.bonuses-r.deductions-r.insurance) }),{ base:0,bonus:0,ded:0,net:0 });

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem" }}>
        <h1 style={{ fontWeight:900,fontSize:"1.4rem",color:C.ink,margin:0 }}>{pt.title}</h1>
        <button style={{ background:C.primaryDeep,color:"#fff",padding:"9px 18px",borderRadius:9,fontWeight:700,fontSize:"0.85rem",cursor:"pointer" }}>{pt.runPayroll}</button>
      </div>

      {/* Summary cards */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1rem",marginBottom:"1.5rem" }}>
        {[
          { ...pt.summaryCards[0], val:`$${totals.base}`,  color:C.blue },
          { ...pt.summaryCards[1], val:`$${totals.bonus}`, color:C.primary },
          { ...pt.summaryCards[2], val:`$${totals.ded}`,   color:C.red },
          { ...pt.summaryCards[3], val:`$${totals.net}`,   color:C.primaryDark },
        ].map(c=>(
          <div key={c.label} style={{ background:C.white,borderRadius:14,padding:"1.25rem",border:`1px solid ${C.border}` }}>
            <p style={{ fontSize:"0.75rem",color:C.muted,margin:"0 0 .5rem" }}>{c.label}</p>
            <p style={{ fontSize:"1.5rem",fontWeight:900,color:c.color,margin:"0 0 .2rem",lineHeight:1 }}>{c.val}</p>
            <span style={{ fontSize:"0.8rem" }}>{c.icon}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:C.white,borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden" }}>
        <div style={{ padding:"1.1rem 1.25rem",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <p style={{ fontWeight:800,fontSize:"0.9rem",color:C.ink,margin:0 }}>{pt.monthTitle} — {locale==="ar"?"فبراير ٢٠٢٥":"February 2025"}</p>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.bg }}>
                {pt.cols.map(c=><th key={c} style={{ padding:"0.85rem 1rem",textAlign:locale==="ar"?"right":"left",fontSize:"0.74rem",fontWeight:700,color:C.muted,whiteSpace:"nowrap" }}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {PAYROLL_DATA.map((row,i)=>{
                const net = row.base+row.bonuses-row.deductions-row.insurance;
                return (
                  <tr key={i} style={{ borderTop:`1px solid ${C.border}`,transition:"background .15s" }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"0.85rem 1rem" }}>
                      <div style={{ display:"flex",gap:"0.6rem",alignItems:"center" }}>
                        <Av emp={row.emp} size={34} />
                        <div>
                          <p style={{ fontWeight:700,fontSize:"0.82rem",color:C.ink,margin:0 }}>{locale==="ar"?row.emp.nameAr:row.emp.nameEn}</p>
                          <p style={{ fontSize:"0.7rem",color:C.muted,margin:0 }}>{row.emp.pos}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"0.85rem 1rem",fontSize:"0.82rem",fontWeight:600,color:C.ink }}>${row.base}</td>
                    <td style={{ padding:"0.85rem 1rem",fontSize:"0.82rem",color:C.primary,fontWeight:600 }}>+${row.bonuses}</td>
                    <td style={{ padding:"0.85rem 1rem",fontSize:"0.82rem",color:C.red,fontWeight:600 }}>-${row.deductions}</td>
                    <td style={{ padding:"0.85rem 1rem",fontSize:"0.82rem",color:C.amber,fontWeight:600 }}>-${row.insurance}</td>
                    <td style={{ padding:"0.85rem 1rem",fontSize:"0.88rem",fontWeight:900,color:C.primaryDark }}>${net}</td>
                    <td style={{ padding:"0.85rem 1rem" }}><Badge status={row.status} map={pt.statusMap} sc={t.statusColors} /></td>
                    <td style={{ padding:"0.85rem 1rem" }}>
                      <div style={{ display:"flex",gap:"0.4rem" }}>
                        <button onClick={()=>setPayslipEmp(row.emp)} style={{ padding:"4px 10px",borderRadius:6,fontSize:"0.72rem",fontWeight:600,background:C.primaryL,color:C.primary,border:"none",cursor:"pointer" }}>{pt.actions.payslip}</button>
                        {row.status==="pending" && <button style={{ padding:"4px 10px",borderRadius:6,fontSize:"0.72rem",fontWeight:600,background:C.primaryDeep,color:"#fff",border:"none",cursor:"pointer" }}>{pt.actions.pay}</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!payslipEmp} onClose={()=>setPayslipEmp(null)} title={pt.slipTitle}>
        {payslipEmp && <PayslipContent emp={payslipEmp} t={t} locale={locale} />}
      </Modal>
    </div>
  );
}

// ── LEAVES ─────────────────────────────────────────────────────────────────────
function Leaves({ t, locale }) {
  const lt = t.leaves;
  const [tab, setTab] = useState(0);
  const [modal, setModal] = useState(false);

  const balances = EMPLOYEES.slice(0,6).map((e,i)=>({
    emp:e,
    annual:[21,21,21,21,14,21][i],
    sick:[10,10,10,10,5,10][i],
    emerg:[3,3,3,3,3,3][i],
    used:[5,2,0,7,14,1][i],
    rem:[22,25,27,20,8,26][i],
  }));

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem" }}>
        <h1 style={{ fontWeight:900,fontSize:"1.4rem",color:C.ink,margin:0 }}>{lt.title}</h1>
        <button onClick={()=>setModal(true)} style={{ background:C.primary,color:"#fff",padding:"9px 18px",borderRadius:9,fontWeight:700,fontSize:"0.85rem",cursor:"pointer" }}>{lt.newRequest}</button>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex",gap:"0.25rem",background:C.white,borderRadius:12,padding:3,border:`1px solid ${C.border}`,marginBottom:"1.5rem",width:"fit-content" }}>
        {lt.tabs.map((tb,i)=>(
          <button key={tb} onClick={()=>setTab(i)} style={{ padding:"7px 18px",borderRadius:9,fontSize:"0.8rem",fontWeight:700,background:tab===i?C.primary:"transparent",color:tab===i?"#fff":C.muted,border:"none",cursor:"pointer",transition:"all .2s" }}>{tb}</button>
        ))}
      </div>

      {(tab===0||tab===1) && (
        <div style={{ background:C.white,borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:C.bg }}>
                  {lt.cols.map(c=><th key={c} style={{ padding:"0.85rem 1rem",textAlign:locale==="ar"?"right":"left",fontSize:"0.74rem",fontWeight:700,color:C.muted,whiteSpace:"nowrap" }}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {LEAVES_DATA.filter(r=>tab===1||r.status==="pending").map((row,i)=>(
                  <tr key={i} style={{ borderTop:`1px solid ${C.border}`,transition:"background .15s" }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"0.85rem 1rem" }}>
                      <div style={{ display:"flex",gap:"0.6rem",alignItems:"center" }}>
                        <Av emp={row.emp} size={34} />
                        <span style={{ fontWeight:700,fontSize:"0.82rem",color:C.ink }}>{locale==="ar"?row.emp.nameAr:row.emp.nameEn}</span>
                      </div>
                    </td>
                    <td style={{ padding:"0.85rem 1rem" }}><span style={{ background:C.primaryL,color:C.primary,padding:"3px 9px",borderRadius:20,fontSize:"0.71rem",fontWeight:700 }}>{lt.typeMap[row.type]}</span></td>
                    <td style={{ padding:"0.85rem 1rem",fontSize:"0.78rem",color:C.muted }}>{row.from}</td>
                    <td style={{ padding:"0.85rem 1rem",fontSize:"0.78rem",color:C.muted }}>{row.to}</td>
                    <td style={{ padding:"0.85rem 1rem",fontSize:"0.82rem",fontWeight:800,color:C.ink,textAlign:"center" }}>{row.days}</td>
                    <td style={{ padding:"0.85rem 1rem",fontSize:"0.78rem",color:C.slate,maxWidth:160 }}>{locale==="ar"?row.reason:row.reason}</td>
                    <td style={{ padding:"0.85rem 1rem" }}><Badge status={row.status} map={lt.statusMap} sc={t.statusColors} /></td>
                    <td style={{ padding:"0.85rem 1rem" }}>
                      <div style={{ display:"flex",gap:"0.4rem" }}>
                        {row.status==="pending" && <>
                          <button style={{ padding:"4px 10px",borderRadius:6,fontSize:"0.72rem",fontWeight:600,background:C.primaryL,color:C.primary,border:"none",cursor:"pointer" }}>{lt.actions.approve}</button>
                          <button style={{ padding:"4px 10px",borderRadius:6,fontSize:"0.72rem",fontWeight:600,background:C.redL,color:C.red,border:"none",cursor:"pointer" }}>{lt.actions.reject}</button>
                        </>}
                        {row.status!=="pending" && <button style={{ padding:"4px 10px",borderRadius:6,fontSize:"0.72rem",fontWeight:600,background:C.bg,color:C.muted,border:`1px solid ${C.border}`,cursor:"pointer" }}>{lt.actions.view}</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab===2 && (
        <div style={{ background:C.white,borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden" }}>
          <p style={{ fontWeight:800,fontSize:"0.9rem",color:C.ink,margin:0,padding:"1.1rem 1.25rem",borderBottom:`1px solid ${C.border}` }}>{lt.balanceTitle}</p>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:C.bg }}>
                  {lt.balanceCols.map(c=><th key={c} style={{ padding:"0.85rem 1rem",textAlign:locale==="ar"?"right":"left",fontSize:"0.74rem",fontWeight:700,color:C.muted }}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {balances.map((b,i)=>(
                  <tr key={i} style={{ borderTop:`1px solid ${C.border}` }}>
                    <td style={{ padding:"0.85rem 1rem" }}>
                      <div style={{ display:"flex",gap:"0.6rem",alignItems:"center" }}>
                        <Av emp={b.emp} size={34} />
                        <span style={{ fontWeight:700,fontSize:"0.82rem",color:C.ink }}>{locale==="ar"?b.emp.nameAr:b.emp.nameEn}</span>
                      </div>
                    </td>
                    <td style={{ padding:"0.85rem 1rem",textAlign:"center",fontWeight:700,color:C.blue }}>{b.annual}</td>
                    <td style={{ padding:"0.85rem 1rem",textAlign:"center",fontWeight:700,color:C.amber }}>{b.sick}</td>
                    <td style={{ padding:"0.85rem 1rem",textAlign:"center",fontWeight:700,color:C.red }}>{b.emerg}</td>
                    <td style={{ padding:"0.85rem 1rem",textAlign:"center",fontWeight:700,color:C.muted }}>{b.used}</td>
                    <td style={{ padding:"0.85rem 1rem",textAlign:"center" }}>
                      <span style={{ background:C.primaryL,color:C.primary,padding:"3px 12px",borderRadius:20,fontSize:"0.78rem",fontWeight:800 }}>{b.rem}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab===3 && (
        <div style={{ background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:"2rem",textAlign:"center",color:C.muted }}>
          <div style={{ fontSize:"3rem",marginBottom:"1rem" }}>📅</div>
          <p style={{ fontWeight:700 }}>{locale==="ar"?"تقويم الإجازات — قيد التطوير":"Leave Calendar — Coming Soon"}</p>
        </div>
      )}

      <Modal open={modal} onClose={()=>setModal(false)} title={lt.requestTitle}>
        <div style={{ display:"flex",flexDirection:"column",gap:"0.85rem" }}>
          <Field label={lt.fields.type}><Sel><option>{lt.fields.type}</option>{Object.entries(lt.typeMap).map(([k,v])=><option key={k} value={k}>{v}</option>)}</Sel></Field>
          <Field label={locale==="ar"?"الموظف":"Employee"}><Sel><option>--</option>{EMPLOYEES.map(e=><option key={e.id}>{locale==="ar"?e.nameAr:e.nameEn}</option>)}</Sel></Field>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem" }}>
            <Field label={lt.fields.from}><Inp type="date" /></Field>
            <Field label={lt.fields.to}><Inp type="date" /></Field>
          </div>
          <Field label={lt.fields.reason}><textarea placeholder={lt.fields.reason} rows={3} style={{ width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:"0.85rem",resize:"vertical" }} /></Field>
          <div style={{ display:"flex",gap:"0.75rem",marginTop:"0.5rem" }}>
            <button onClick={()=>setModal(false)} style={{ flex:1,padding:"11px",borderRadius:9,border:`1px solid ${C.border}`,background:C.bg,fontWeight:700,color:C.muted,cursor:"pointer" }}>{t.employees.close}</button>
            <button onClick={()=>setModal(false)} style={{ flex:2,padding:"11px",borderRadius:9,background:C.primary,color:"#fff",fontWeight:700,cursor:"pointer" }}>{lt.save}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── DEPARTMENTS ───────────────────────────────────────────────────────────────
function Departments({ t, locale }) {
  const dt = t.departments;
  const [modal, setModal] = useState(false);
  const deptColors = [C.primary,C.blue,C.amber,C.sky,C.violet,C.red];

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem" }}>
        <h1 style={{ fontWeight:900,fontSize:"1.4rem",color:C.ink,margin:0 }}>{dt.title}</h1>
        <button onClick={()=>setModal(true)} style={{ background:C.primary,color:"#fff",padding:"9px 18px",borderRadius:9,fontWeight:700,fontSize:"0.85rem",cursor:"pointer" }}>{dt.add}</button>
      </div>

      {/* Org cards */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"1.25rem",marginBottom:"1.5rem" }}>
        {DEPTS_DATA.map((dept,i)=>(
          <div key={i} style={{ background:C.white,borderRadius:18,padding:"1.5rem",border:`1px solid ${C.border}`,boxShadow:"0 2px 10px rgba(0,0,0,.04)",transition:"all .22s" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor=deptColors[i];}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor=C.border;}}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1rem" }}>
              <div style={{ width:52,height:52,borderRadius:14,background:`${deptColors[i]}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem",border:`1.5px solid ${deptColors[i]}30` }}>
                {dept.icon}
              </div>
              <Badge status={dept.status} map={dt.statusMap} sc={t.statusColors} />
            </div>
            <h3 style={{ fontWeight:900,fontSize:"1rem",color:C.ink,margin:"0 0 .25rem" }}>{locale==="ar"?dept.nameAr:dept.nameEn}</h3>
            <p style={{ color:C.muted,fontSize:"0.77rem",margin:"0 0 1rem" }}>👤 {locale==="ar"?dept.mgr:dept.mgrEn}</p>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem",marginBottom:"1rem" }}>
              <div style={{ textAlign:"center",padding:"0.6rem",background:C.bg,borderRadius:9 }}>
                <p style={{ fontSize:"1.2rem",fontWeight:900,color:deptColors[i],margin:"0 0 .1rem" }}>{dept.count}</p>
                <p style={{ fontSize:"0.68rem",color:C.muted,margin:0 }}>{locale==="ar"?"موظف":"Employees"}</p>
              </div>
              <div style={{ textAlign:"center",padding:"0.6rem",background:C.bg,borderRadius:9 }}>
                <p style={{ fontSize:"0.85rem",fontWeight:800,color:C.primaryDark,margin:"0 0 .1rem" }}>{locale==="ar"?dept.salaryAr:dept.salaryEn}</p>
                <p style={{ fontSize:"0.68rem",color:C.muted,margin:0 }}>{locale==="ar"?"الرواتب":"Payroll"}</p>
              </div>
            </div>
            <div style={{ display:"flex",gap:"0.5rem" }}>
              <button style={{ flex:1,padding:"7px",borderRadius:8,border:`1px solid ${deptColors[i]}`,background:`${deptColors[i]}10`,fontSize:"0.74rem",fontWeight:700,color:deptColors[i],cursor:"pointer" }}>{dt.actions.manage}</button>
              <button style={{ flex:1,padding:"7px",borderRadius:8,border:`1px solid ${C.border}`,background:C.bg,fontSize:"0.74rem",fontWeight:600,color:C.muted,cursor:"pointer" }}>{dt.actions.view}</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={dt.addTitle}>
        <div style={{ display:"flex",flexDirection:"column",gap:"0.85rem" }}>
          <Field label={dt.fields.name}><Inp placeholder={dt.fields.name} /></Field>
          <Field label={dt.fields.manager}><Sel><option>{dt.fields.manager}</option>{EMPLOYEES.filter(e=>e.status==="active").map(e=><option key={e.id}>{locale==="ar"?e.nameAr:e.nameEn}</option>)}</Sel></Field>
          <Field label={dt.fields.desc}><textarea placeholder={dt.fields.desc} rows={3} style={{ width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:"0.85rem",resize:"vertical" }} /></Field>
          <button onClick={()=>setModal(false)} style={{ padding:"12px",borderRadius:9,background:C.primary,color:"#fff",fontWeight:700,marginTop:"0.5rem",cursor:"pointer" }}>{dt.save}</button>
        </div>
      </Modal>
    </div>
  );
}

// ── PERFORMANCE ───────────────────────────────────────────────────────────────
function Performance({ t, locale }) {
  const pt = t.performance;
  const [tab, setTab] = useState(0);
  const [modal, setModal] = useState(false);
  const [scores, setScores] = useState([3,3,3,3,3]);

  const avgScore = (scores) => (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1);
  const scoreColor = (s) => s>=4.5?C.primary:s>=3.5?C.blue:s>=2.5?C.amber:C.red;

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem" }}>
        <h1 style={{ fontWeight:900,fontSize:"1.4rem",color:C.ink,margin:0 }}>{pt.title}</h1>
        <button onClick={()=>setModal(true)} style={{ background:C.primary,color:"#fff",padding:"9px 18px",borderRadius:9,fontWeight:700,fontSize:"0.85rem",cursor:"pointer" }}>{pt.newReview}</button>
      </div>

      <div style={{ display:"flex",gap:"0.25rem",background:C.white,borderRadius:12,padding:3,border:`1px solid ${C.border}`,marginBottom:"1.5rem",width:"fit-content" }}>
        {pt.tabs.map((tb,i)=>(
          <button key={tb} onClick={()=>setTab(i)} style={{ padding:"7px 20px",borderRadius:9,fontSize:"0.8rem",fontWeight:700,background:tab===i?C.primary:"transparent",color:tab===i?"#fff":C.muted,border:"none",cursor:"pointer",transition:"all .2s" }}>{tb}</button>
        ))}
      </div>

      {tab===0 && (
        <div style={{ background:C.white,borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:C.bg }}>
                  {pt.cols.map(c=><th key={c} style={{ padding:"0.85rem 1rem",textAlign:locale==="ar"?"right":"left",fontSize:"0.73rem",fontWeight:700,color:C.muted,whiteSpace:"nowrap" }}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {PERF_DATA.map((row,i)=>{
                  const avg = parseFloat(avgScore(row.scores));
                  return (
                    <tr key={i} style={{ borderTop:`1px solid ${C.border}`,transition:"background .15s" }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"0.85rem 1rem" }}>
                        <div style={{ display:"flex",gap:"0.6rem",alignItems:"center" }}>
                          <Av emp={row.emp} size={34} />
                          <span style={{ fontWeight:700,fontSize:"0.82rem",color:C.ink }}>{locale==="ar"?row.emp.nameAr:row.emp.nameEn}</span>
                        </div>
                      </td>
                      <td style={{ padding:"0.85rem 1rem",fontSize:"0.78rem",color:C.muted }}>{row.period}</td>
                      <td style={{ padding:"0.85rem 1rem",fontSize:"0.78rem",color:C.slate }}>{locale==="ar"?row.reviewer:"Huda Al-Samarrai"}</td>
                      {row.scores.map((s,j)=>(
                        <td key={j} style={{ padding:"0.85rem 0.75rem",textAlign:"center" }}>
                          <span style={{ background:`${scoreColor(s)}15`,color:scoreColor(s),padding:"2px 8px",borderRadius:20,fontSize:"0.75rem",fontWeight:800 }}>{s}/5</span>
                        </td>
                      ))}
                      <td style={{ padding:"0.85rem 1rem",textAlign:"center" }}>
                        <RadialScore score={avg} color={scoreColor(avg)} size={48} />
                      </td>
                      <td style={{ padding:"0.85rem 1rem" }}><Badge status={row.status} map={pt.statusMap} sc={t.statusColors} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(tab===1||tab===2) && (
        <div style={{ background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:"3rem",textAlign:"center",color:C.muted }}>
          <div style={{ fontSize:"3rem",marginBottom:"1rem" }}>{tab===1?"🎯":"⚠️"}</div>
          <p style={{ fontWeight:700 }}>{locale==="ar"? (tab===1?"إدارة الأهداف — قيد التطوير":"التحذيرات والإنذارات — قيد التطوير") : (tab===1?"Goals Management — Coming Soon":"Warnings & Notices — Coming Soon")}</p>
        </div>
      )}

      {/* Review Modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title={pt.reviewTitle} wide>
        <div style={{ marginBottom:"1.25rem" }}>
          <Field label={locale==="ar"?"الموظف":"Employee"}>
            <Sel><option>--</option>{EMPLOYEES.map(e=><option key={e.id}>{locale==="ar"?e.nameAr:e.nameEn}</option>)}</Sel>
          </Field>
        </div>
        <p style={{ fontWeight:700,fontSize:"0.85rem",color:C.slate,marginBottom:"1rem" }}>{locale==="ar"?"معايير التقييم":"Evaluation Criteria"}</p>
        {pt.criteria.map((cr,i)=>(
          <div key={i} style={{ marginBottom:"1.25rem" }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:"0.5rem" }}>
              <span style={{ fontSize:"0.83rem",fontWeight:600,color:C.slate }}>{cr}</span>
              <span style={{ fontSize:"0.85rem",fontWeight:800,color:scoreColor(scores[i]) }}>{scores[i]}/5</span>
            </div>
            <div style={{ display:"flex",gap:"0.4rem" }}>
              {[1,2,3,4,5].map(v=>(
                <button key={v} onClick={()=>setScores(s=>{const n=[...s];n[i]=v;return n;})} style={{
                  flex:1,height:36,borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:"0.82rem",transition:"all .15s",
                  background:scores[i]>=v?scoreColor(scores[i]):C.bg,
                  color:scores[i]>=v?"#fff":C.muted,
                }}>
                  {v}
                </button>
              ))}
            </div>
            <div style={{ display:"flex",justifyContent:"space-between",marginTop:"0.25rem" }}>
              {pt.kpiLabels.map((l,j)=><span key={j} style={{ fontSize:"0.6rem",color:C.muted }}>{l}</span>)}
            </div>
          </div>
        ))}
        <div style={{ background:C.bg,borderRadius:12,padding:"1rem",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem" }}>
          <span style={{ fontWeight:700,fontSize:"0.88rem",color:C.ink }}>{locale==="ar"?"المعدل الإجمالي":"Overall Score"}</span>
          <span style={{ fontSize:"1.3rem",fontWeight:900,color:scoreColor(parseFloat(avgScore(scores))) }}>{avgScore(scores)}/5</span>
        </div>
        <button onClick={()=>setModal(false)} style={{ width:"100%",padding:"12px",borderRadius:9,background:C.primary,color:"#fff",fontWeight:700,cursor:"pointer" }}>{pt.save}</button>
      </Modal>
    </div>
  );
}

// ── REPORTS ────────────────────────────────────────────────────────────────────
function Reports({ t, locale }) {
  const rt = t.reports;
  const cardColors = [C.blue,C.primary,C.amber,C.violet,C.sky,C.red];
  return (
    <div>
      <h1 style={{ fontWeight:900,fontSize:"1.4rem",color:C.ink,margin:"0 0 1.5rem" }}>{rt.title}</h1>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"1.25rem",marginBottom:"2rem" }}>
        {rt.cards.map((card,i)=>(
          <div key={i} style={{ background:C.white,borderRadius:18,padding:"1.75rem",border:`1px solid ${C.border}`,boxShadow:"0 2px 10px rgba(0,0,0,.04)",transition:"all .22s",cursor:"pointer" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 12px 36px ${cardColors[i]}18`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,.04)";}}>
            <div style={{ width:52,height:52,borderRadius:14,background:`${cardColors[i]}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem",marginBottom:"1rem" }}>{card.icon}</div>
            <h3 style={{ fontWeight:800,fontSize:"0.95rem",color:C.ink,margin:"0 0 .35rem" }}>{card.title}</h3>
            <p style={{ fontSize:"0.78rem",color:C.muted,margin:"0 0 1.25rem" }}>{card.desc}</p>
            <div style={{ display:"flex",gap:"0.6rem" }}>
              <button style={{ flex:1,padding:"8px",borderRadius:8,border:`1px solid ${cardColors[i]}`,background:`${cardColors[i]}10`,fontSize:"0.76rem",fontWeight:700,color:cardColors[i],cursor:"pointer" }}>{rt.preview}</button>
              <button style={{ flex:1,padding:"8px",borderRadius:8,border:"none",background:cardColors[i],fontSize:"0.76rem",fontWeight:700,color:"#fff",cursor:"pointer" }}>{rt.export}</button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick analytics */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.25rem" }}>
        <div style={{ background:C.white,borderRadius:16,padding:"1.5rem",border:`1px solid ${C.border}` }}>
          <p style={{ fontWeight:800,fontSize:"0.9rem",color:C.ink,margin:"0 0 1.25rem" }}>{locale==="ar"?"توزيع العقود":"Contract Distribution"}</p>
          {[["Full-time",28,C.primary],["Part-time",8,C.blue],["Temporary",7,C.amber],["Contractor",4,C.violet]].map(([l,n,c])=>(
            <div key={l} style={{ marginBottom:"0.75rem" }}>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.78rem",marginBottom:"0.25rem" }}>
                <span style={{ color:C.slate,fontWeight:600 }}>{l}</span>
                <span style={{ color:c,fontWeight:700 }}>{n} ({Math.round(n/47*100)}%)</span>
              </div>
              <div style={{ height:7,background:C.bg,borderRadius:4,overflow:"hidden" }}>
                <div style={{ height:"100%",width:`${n/47*100}%`,background:c,borderRadius:4,transition:"width .5s ease" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:C.white,borderRadius:16,padding:"1.5rem",border:`1px solid ${C.border}` }}>
          <p style={{ fontWeight:800,fontSize:"0.9rem",color:C.ink,margin:"0 0 1.25rem" }}>{locale==="ar"?"تكلفة القوى العاملة — آخر ٦ أشهر":"Workforce Cost — Last 6 Months"}</p>
          <BarChart vals={[7200,7400,7100,7800,7600,8400]} days={locale==="ar"?["سبت","أكت","نوف","ديس","يناير","فبر"]:["Sep","Oct","Nov","Dec","Jan","Feb"]} color={C.primary} />
        </div>
      </div>
    </div>
  );
}

// ── MAIN LAYOUT ───────────────────────────────────────────────────────────────
export default function HRDashboard() {
  const [locale, setLocale] = useState("ar");
  const [page, setPage] = useState("dashboard");
  const [role, setRole] = useState("superAdmin");
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const t = T[locale];
  const isRTL = locale==="ar";
  const font = isRTL ? "'Cairo',sans-serif" : "'Sora',sans-serif";
  const W = collapsed ? 68 : 240;

  const navItems = [
    { k:"dashboard",   icon:"🏠", l:t.nav.dashboard   },
    { k:"employees",   icon:"👥", l:t.nav.employees   },
    { k:"attendance",  icon:"⏰", l:t.nav.attendance  },
    { k:"payroll",     icon:"💰", l:t.nav.payroll     },
    { k:"leaves",      icon:"🏖️", l:t.nav.leaves     },
    { k:"departments", icon:"🏢", l:t.nav.departments },
    { k:"performance", icon:"📊", l:t.nav.performance },
    { k:"reports",     icon:"📈", l:t.nav.reports     },
  ];

  const notifs = locale==="ar"
    ? ["طلب إجازة جديد من نور الراشدي","عقد أحمد طارق ينتهي خلال ١٢ يوم","صرف رواتب فبراير مكتمل","ذكرى ميلاد: هدى السامرائي"]
    : ["New leave request from Nour Al-Rashidi","Ahmad Tariq contract expiring in 12 days","February payroll disbursed","Birthday reminder: Huda Al-Samarrai"];

  return (
    <div dir={t.dir} lang={t.lang} style={{ fontFamily:font, background:C.bg, minHeight:"100vh", display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&family=Cairo:wght@400;600;700;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        button{cursor:pointer;border:none;font-family:inherit;}
        input,select,textarea{font-family:inherit;outline:none;border:none;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:#F1F5F9;}
        ::-webkit-scrollbar-thumb{background:${C.primary}55;border-radius:3px;}
        @keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .page{animation:fadeUp .35s ease both;}
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{ width:W, minHeight:"100vh", background:C.sidebar, display:"flex", flexDirection:"column", position:"fixed", top:0, [isRTL?"right":"left"]:0, zIndex:200, transition:"width .25s ease", overflow:"hidden", borderInlineEnd:`1px solid ${C.sidebarBorder}` }}>
        {/* Logo */}
        <div style={{ padding:collapsed?"1rem .5rem":"1.25rem 1rem", borderBottom:`1px solid ${C.sidebarBorder}`, display:"flex", alignItems:"center", justifyContent:collapsed?"center":"space-between", minHeight:68 }}>
          {!collapsed && (
            <div style={{ display:"flex",alignItems:"center",gap:"0.6rem" }}>
              <div style={{ width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:"0.95rem",flexShrink:0 }}>HR</div>
              <div>
                <p style={{ fontWeight:900,color:"#fff",margin:0,fontSize:"0.95rem",lineHeight:1 }}>{t.logo}</p>
                <p style={{ color:"#6EE7B7",margin:0,fontSize:"0.6rem",fontWeight:600 }}>{t.logoSub}</p>
              </div>
            </div>
          )}
          {collapsed && <div style={{ width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:"0.85rem" }}>HR</div>}
          {!collapsed && (
            <button onClick={()=>setCollapsed(true)} style={{ width:26,height:26,borderRadius:6,background:"rgba(255,255,255,.07)",color:"#94A3B8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.85rem" }}>
              {isRTL?"›":"‹"}
            </button>
          )}
        </div>
        {collapsed && <button onClick={()=>setCollapsed(false)} style={{ margin:"0.5rem auto",width:32,height:26,borderRadius:6,background:"rgba(255,255,255,.07)",color:"#94A3B8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.85rem" }}>{isRTL?"‹":"›"}</button>}

        {/* Role badge */}
        {!collapsed && (
          <div style={{ padding:"0.6rem 1rem",borderBottom:`1px solid ${C.sidebarBorder}` }}>
            <div style={{ display:"flex",gap:"0.4rem" }}>
              {["superAdmin","hrAdmin"].map(r=>(
                <button key={r} onClick={()=>setRole(r)} style={{ flex:1,padding:"5px 4px",borderRadius:7,fontSize:"0.62rem",fontWeight:700,background:role===r?C.primary:"rgba(255,255,255,.06)",color:role===r?"#fff":"#94A3B8",transition:"all .2s" }}>
                  {t.roles[r]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex:1,padding:"0.5rem 0",overflowY:"auto" }}>
          {navItems.map(item=>{
            const active = page===item.k;
            const disabled = role==="hrAdmin" && ["reports"].includes(item.k);
            return (
              <button key={item.k} onClick={()=>!disabled&&setPage(item.k)} disabled={disabled} style={{
                width:"100%", display:"flex", alignItems:"center",
                gap:"0.75rem", padding:collapsed?"0.75rem":"0.7rem 1rem",
                justifyContent:collapsed?"center":"flex-start",
                background:active?"rgba(16,185,129,.18)":"transparent",
                borderInlineStart:active?`3px solid ${C.primary}`:"3px solid transparent",
                color:disabled?"rgba(148,163,184,.35)":active?"#fff":"#94A3B8",
                fontSize:"0.855rem", fontWeight:active?700:500,
                transition:"all .15s", opacity:disabled?.5:1,
              }}
                onMouseEnter={e=>{ if(!active&&!disabled) e.currentTarget.style.background="rgba(255,255,255,.06)"; }}
                onMouseLeave={e=>{ if(!active) e.currentTarget.style.background=active?"rgba(16,185,129,.18)":"transparent"; }}
              >
                <span style={{ fontSize:"1rem",flexShrink:0 }}>{item.icon}</span>
                {!collapsed && <span style={{ whiteSpace:"nowrap" }}>{item.l}</span>}
                {!collapsed && disabled && <span style={{ fontSize:"0.6rem",marginInlineStart:"auto",color:"#94A3B844" }}>🔒</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        {!collapsed && (
          <div style={{ padding:"1rem",borderTop:`1px solid ${C.sidebarBorder}` }}>
            <button onClick={()=>setLocale(locale==="ar"?"en":"ar")} style={{ width:"100%",background:"rgba(255,255,255,.07)",color:"#94A3B8",padding:"9px",borderRadius:9,fontWeight:700,fontSize:"0.78rem",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem" }}>
              🌐 {locale==="ar"?"English":"العربية"}
            </button>
          </div>
        )}
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex:1, [isRTL?"marginRight":"marginLeft"]:W, transition:"margin .25s ease", display:"flex", flexDirection:"column", minHeight:"100vh" }}>

        {/* TOPBAR */}
        <header style={{ height:68, background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 1.75rem", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 6px rgba(0,0,0,.04)" }}>
          <div style={{ position:"relative",maxWidth:360,flex:1 }}>
            <span style={{ position:"absolute",top:"50%",transform:"translateY(-50%)",[isRTL?"right":"left"]:12,color:C.muted,fontSize:"0.9rem" }}>🔍</span>
            <input placeholder={t.topbar.search} style={{ width:"100%",padding:`9px 12px 9px ${isRTL?"12px":"36px"}`,paddingRight:isRTL?"36px":"12px",border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:"0.84rem",color:C.ink,background:C.bg }} />
          </div>

          <div style={{ display:"flex",alignItems:"center",gap:"0.75rem" }}>
            {/* Notif bell */}
            <div style={{ position:"relative" }}>
              <button onClick={()=>setNotifOpen(!notifOpen)} style={{ width:40,height:40,borderRadius:10,background:C.bg,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.05rem",position:"relative" }}>
                🔔
                <span style={{ position:"absolute",top:7,[isRTL?"left":"right"]:7,width:8,height:8,borderRadius:"50%",background:C.red,border:"2px solid #fff" }} />
              </button>
              {notifOpen && (
                <div style={{ position:"absolute",top:50,[isRTL?"left":"right"]:0,width:310,background:"#fff",borderRadius:14,boxShadow:"0 16px 48px rgba(0,0,0,.14)",border:`1px solid ${C.border}`,zIndex:300,animation:"slideIn .2s ease",overflow:"hidden" }}>
                  <div style={{ padding:"0.85rem 1rem",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <p style={{ fontWeight:800,fontSize:"0.85rem",color:C.ink,margin:0 }}>{t.topbar.notifications}</p>
                    <span style={{ background:C.redL,color:C.red,fontSize:"0.68rem",fontWeight:700,padding:"2px 7px",borderRadius:20 }}>4</span>
                  </div>
                  {notifs.map((n,i)=>(
                    <div key={i} style={{ padding:"0.7rem 1rem",borderBottom:i<notifs.length-1?`1px solid ${C.border}`:"none",display:"flex",gap:"0.7rem",alignItems:"flex-start",cursor:"pointer",transition:"background .15s" }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <span style={{ width:8,height:8,borderRadius:"50%",background:[C.primary,C.red,C.blue,C.amber][i],marginTop:5,flexShrink:0 }} />
                      <p style={{ fontSize:"0.78rem",color:C.slate,margin:0,lineHeight:1.55 }}>{n}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <div style={{ display:"flex",alignItems:"center",gap:"0.6rem",padding:"6px 12px",background:C.bg,borderRadius:10,border:`1px solid ${C.border}`,cursor:"pointer" }}>
              <div style={{ width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:"0.82rem" }}>
                {isRTL?"م":"M"}
              </div>
              <div>
                <p style={{ fontSize:"0.78rem",fontWeight:800,color:C.ink,margin:0,lineHeight:1 }}>{isRTL?"مدير النظام":"System Admin"}</p>
                <p style={{ fontSize:"0.65rem",color:C.primary,margin:0,fontWeight:600 }}>{t.roles[role]}</p>
              </div>
              <span style={{ color:C.muted,fontSize:"0.7rem" }}>▾</span>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="page" style={{ flex:1,padding:"1.75rem",overflowY:"auto" }}>
          {page==="dashboard"   && <Dashboard   t={t} locale={locale} />}
          {page==="employees"   && <Employees   t={t} locale={locale} />}
          {page==="attendance"  && <Attendance  t={t} locale={locale} />}
          {page==="payroll"     && <Payroll     t={t} locale={locale} />}
          {page==="leaves"      && <Leaves      t={t} locale={locale} />}
          {page==="departments" && <Departments t={t} locale={locale} />}
          {page==="performance" && <Performance t={t} locale={locale} />}
          {page==="reports"     && <Reports     t={t} locale={locale} />}
        </main>
      </div>

      {notifOpen && <div onClick={()=>setNotifOpen(false)} style={{ position:"fixed",inset:0,zIndex:99 }} />}
    </div>
  );
}
