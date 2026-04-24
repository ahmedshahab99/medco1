'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = 'ar' | 'en';
type PageId =
  | 'dashboard'
  | 'profile'
  | 'performance'
  | 'leaves'
  | 'attendance'
  | 'payroll'
  | 'benefits'
  | 'requests'
  | 'notifications';
type ModalId = 'leave-req' | 'edit-profile' | 'payslip' | 'cert' | null;
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Task {
  id: number;
  ar: string;
  en: string;
  done: boolean;
}

interface AttendanceRow {
  date_ar: string;
  date_en: string;
  in: string;
  out: string;
  hrs: string;
  ot: string;
  status: 'present' | 'late' | 'absent';
}

interface ToastState {
  msg: string;
  type: ToastType;
  visible: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const attendanceData: AttendanceRow[] = [
  { date_ar: 'الإثنين، 13 أبريل',  date_en: 'Mon, Apr 13', in: '08:02', out: '17:08', hrs: '9.1',  ot: '1.1', status: 'present' },
  { date_ar: 'الأحد، 12 أبريل',    date_en: 'Sun, Apr 12', in: '08:15', out: '17:00', hrs: '8.8',  ot: '0.8', status: 'present' },
  { date_ar: 'الخميس، 10 أبريل',   date_en: 'Thu, Apr 10', in: '08:45', out: '17:20', hrs: '8.6',  ot: '0.6', status: 'late'    },
  { date_ar: 'الأربعاء، 9 أبريل',  date_en: 'Wed, Apr 9',  in: '08:01', out: '18:30', hrs: '10.5', ot: '2.5', status: 'present' },
  { date_ar: 'الثلاثاء، 8 أبريل',  date_en: 'Tue, Apr 8',  in: '08:05', out: '17:05', hrs: '9.0',  ot: '1.0', status: 'present' },
  { date_ar: 'الإثنين، 7 أبريل',   date_en: 'Mon, Apr 7',  in: '08:10', out: '17:00', hrs: '8.8',  ot: '0.8', status: 'present' },
  { date_ar: 'الأحد، 6 أبريل',     date_en: 'Sun, Apr 6',  in: '08:00', out: '17:00', hrs: '9.0',  ot: '1.0', status: 'present' },
  { date_ar: 'الخميس، 3 أبريل',    date_en: 'Thu, Apr 3',  in: '08:03', out: '19:00', hrs: '10.9', ot: '2.9', status: 'present' },
  { date_ar: 'الأربعاء، 2 أبريل',  date_en: 'Wed, Apr 2',  in: '08:30', out: '17:00', hrs: '8.5',  ot: '0.5', status: 'late'    },
  { date_ar: 'الثلاثاء، 1 أبريل',  date_en: 'Tue, Apr 1',  in: '08:00', out: '17:00', hrs: '9.0',  ot: '1.0', status: 'present' },
];

const initialTasks: Task[] = [
  { id: 1, ar: 'مراجعة تقرير الأداء الشهري',  en: 'Review monthly performance report', done: true  },
  { id: 2, ar: 'إرسال تقرير الأخطاء البرمجية', en: 'Submit bug report',                 done: true  },
  { id: 3, ar: 'اجتماع الفريق الأسبوعي',        en: 'Weekly team standup',               done: true  },
  { id: 4, ar: 'تحديث وثائق API الجديدة',       en: 'Update new API documentation',      done: false },
  { id: 5, ar: 'مراجعة الكود مع المتدربين',     en: 'Code review with interns',          done: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const t = (ar: string, en: string, lang: Lang): string => (lang === 'ar' ? ar : en);

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployeePortal() {
  const [lang, setLangState] = useState<Lang>('ar');
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [openModal, setOpenModal] = useState<ModalId>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>({ msg: '', type: 'info', visible: false });
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [notifsRead, setNotifsRead] = useState(false);
  const [todayDate, setTodayDate] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set document dir on lang change
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Compute today's date label
  useEffect(() => {
    const d = new Date();
    const days_ar = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const months_ar = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    setTodayDate(
      lang === 'ar'
        ? `${days_ar[d.getDay()]}، ${d.getDate()} ${months_ar[d.getMonth()]} ${d.getFullYear()}`
        : d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    );
  }, [lang]);

  const showToast = useCallback((msg: string, type: ToastType = 'info') => {
    setToast({ msg, type, visible: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  }, []);

  const navigate = (page: PageId) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  const setLang = (l: Lang) => {
    setLangState(l);
  };

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, done: !task.done } : task));
  };

  const markAllRead = () => {
    setNotifsRead(true);
    showToast(t('✅ تم تعليم جميع الإشعارات كمقروءة', '✅ All notifications marked as read', lang), 'success');
  };

  const unreadCount = notifsRead ? 0 : 3;

  // ── Sub-components ──────────────────────────────────────────────────────────

  const Topbar = ({ titleAr, titleEn, subAr, subEn, action }: {
    titleAr: string; titleEn: string;
    subAr?: string; subEn?: string;
    action?: React.ReactNode;
  }) => (
    <div className="topbar">
      <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
      <div className="topbar-title-wrap">
        <div className="topbar-title">{t(titleAr, titleEn, lang)}</div>
        {(subAr || subEn) && <div className="topbar-sub">{t(subAr ?? '', subEn ?? '', lang)}</div>}
      </div>
      {action && <div className="topbar-actions">{action}</div>}
    </div>
  );

  const StatCard = ({ color, iconBg, icon, value, labelAr, labelEn, chg, chgClass }: {
    color: string; iconBg: string; icon: string;
    value: string; labelAr: string; labelEn: string;
    chg?: string; chgClass?: string;
  }) => (
    <div className={`stat-card ${color}`}>
      <div className={`stat-icon ${iconBg}`}>{icon}</div>
      <div className="stat-val">{value}</div>
      <div className="stat-lbl">{t(labelAr, labelEn, lang)}</div>
      {chg && <div className={`stat-chg ${chgClass ?? 'snu'}`}>{chg}</div>}
    </div>
  );

  // ── Page: Dashboard ─────────────────────────────────────────────────────────

  const PageDashboard = () => (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Topbar
        titleAr={`أهلاً بك، أحمد 👋`} titleEn="Welcome back, Ahmed 👋"
        subAr={todayDate} subEn={todayDate}
        action={
          <button className="btn btn-primary btn-sm keep" onClick={() => setOpenModal('leave-req')}>
            🏖️ {t('طلب إجازة', 'Request Leave', lang)}
          </button>
        }
      />
      <div className="content">
        {/* Welcome Banner */}
        <div className="card mb6" style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.18),rgba(26,111,186,0.12))', borderColor: 'rgba(124,58,237,0.25)' }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div className="profile-avatar-lg">أ<div className="av-badge">🟢</div></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 900 }}>{t('أحمد الحسيني', 'Ahmed Al-Husseini', lang)}</div>
              <div style={{ fontSize: 13, color: 'var(--muted2)', marginTop: 3 }}>
                {t('مهندس برمجيات أول', 'Senior Software Engineer', lang)} &nbsp;·&nbsp; {t('قسم التقنية', 'Tech Dept', lang)}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <span className="badge b-green">✅ {t('نشط', 'Active', lang)}</span>
                <span className="badge b-purple">⭐ {t('موظف مميز', 'Star Employee', lang)}</span>
                <span className="badge b-blue">📅 {t('3 سنوات خدمة', '3 Years Service', lang)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('profile')}>✏️ {t('تعديل الملف', 'Edit Profile', lang)}</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { navigate('payroll'); setOpenModal('payslip'); }}>💰 {t('كشف الراتب', 'Payslip', lang)}</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="g4 mb6">
          <StatCard color="cp" iconBg="ip" icon="📊" value="4.7" labelAr="تقييم الأداء" labelEn="Performance Score" chg="↑ ممتاز" chgClass="sup" />
          <StatCard color="cg" iconBg="ig" icon="✅" value="94%" labelAr="نسبة الحضور" labelEn="Attendance Rate" chg={t('هذا الشهر','This Month',lang)} chgClass="sup" />
          <StatCard color="ca" iconBg="ia" icon="🏖️" value="14" labelAr="أيام إجازة متبقية" labelEn="Leave Days Left" chg={t('من 21 يوم','of 21 days',lang)} chgClass="snu" />
          <StatCard color="cb" iconBg="ib" icon="⏱️" value="18" labelAr="ساعات إضافية" labelEn="Overtime Hours" chg={t('↑ هذا الشهر','↑ This Month',lang)} chgClass="sup" />
        </div>

        <div className="g32 mb6">
          {/* Weekly Chart */}
          <div className="card">
            <div className="card-header">
              <div><div className="card-title">{t('📈 حضور هذا الأسبوع', "📈 This Week's Attendance", lang)}</div></div>
              <span className="badge b-green"><span className="pulse" style={{ marginInlineEnd: 4 }}></span>{t('مباشر','Live',lang)}</span>
            </div>
            <div className="card-body">
              <div className="chart-bars">
                {[
                  { h: '100%', bg: 'linear-gradient(to top,var(--purple),var(--blue))', tipAr: 'حاضر — الأحد',   tipEn: 'Present — Sun' },
                  { h: '100%', bg: 'linear-gradient(to top,var(--purple),var(--blue))', tipAr: 'حاضر — الإثنين', tipEn: 'Present — Mon' },
                  { h: '55%',  bg: 'rgba(246,173,85,0.6)',                              tipAr: 'متأخر — الثلاثاء',tipEn: 'Late — Tue' },
                  { h: '100%', bg: 'linear-gradient(to top,var(--purple),var(--blue))', tipAr: 'حاضر — الأربعاء', tipEn: 'Present — Wed' },
                  { h: '100%', bg: 'linear-gradient(to top,var(--purple),var(--blue))', tipAr: 'حاضر — الخميس',  tipEn: 'Present — Thu' },
                  { h: '20%',  bg: 'rgba(100,116,139,0.4)',                             tipAr: 'عطلة — الجمعة',  tipEn: 'Holiday — Fri' },
                  { h: '20%',  bg: 'rgba(100,116,139,0.4)',                             tipAr: 'عطلة — السبت',   tipEn: 'Holiday — Sat' },
                ].map((bar, i) => (
                  <div key={i} className="cbar" style={{ height: bar.h, background: bar.bg }}>
                    <div className="ctip">{t(bar.tipAr, bar.tipEn, lang)}</div>
                  </div>
                ))}
              </div>
              <div className="chart-labels">
                {[['أح','Su'],['إث','Mo'],['ث','Tu'],['أر','We'],['خ','Th'],['ج','Fr'],['س','Sa']].map(([a,e]) => (
                  <span key={a}>{t(a,e,lang)}</span>
                ))}
              </div>
              <div className="divider"></div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 4, fontSize: 11.5, fontWeight: 700 }}>
                {[
                  { bg: 'linear-gradient(135deg,var(--purple),var(--blue))', ar: 'حاضر',  en: 'Present' },
                  { bg: 'rgba(246,173,85,0.6)',                              ar: 'متأخر', en: 'Late'    },
                  { bg: 'rgba(100,116,139,0.4)',                             ar: 'عطلة',  en: 'Off'     },
                ].map(item => (
                  <span key={item.en} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: item.bg, flexShrink: 0 }}></span>
                    <span className="c-muted">{t(item.ar, item.en, lang)}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions + Upcoming */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="card">
              <div className="card-header"><div className="card-title">{t('⚡ إجراءات سريعة','⚡ Quick Actions',lang)}</div></div>
              <div className="qa-grid">
                {[
                  { icon: '🏖️', ar: 'طلب إجازة',   en: 'Request Leave', action: () => setOpenModal('leave-req') },
                  { icon: '💰', ar: 'كشف الراتب',  en: 'View Payslip',  action: () => { navigate('payroll'); setOpenModal('payslip'); } },
                  { icon: '📄', ar: 'طلب وثيقة',   en: 'Request Doc',   action: () => setOpenModal('cert') },
                  { icon: '📊', ar: 'تقييمي',       en: 'My Review',     action: () => navigate('performance') },
                ].map(item => (
                  <button key={item.en} className="qa-btn" onClick={item.action}>
                    <span className="qa-icon">{item.icon}</span>
                    <span className="qa-label">{t(item.ar, item.en, lang)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">{t('📅 قادمًا','📅 Upcoming',lang)}</div></div>
              <div className="card-body" style={{ padding: '12px 14px' }}>
                <div className="tl">
                  {[
                    { color: 'var(--amber)',  ar: 'اجتماع مراجعة الربع الثاني', en: 'Q2 Review Meeting',         subAr: 'الأحد، 19 أبريل 2026 — 10:00 ص', subEn: 'Sun, Apr 19, 2026 — 10:00 AM' },
                    { color: 'var(--green)',  ar: 'تقييم الأداء السنوي',        en: 'Annual Performance Review', subAr: 'الإثنين، 28 أبريل 2026',          subEn: 'Mon, Apr 28, 2026' },
                    { color: 'var(--purple)', ar: 'انتهاء العقد السنوي',        en: 'Annual Contract Renewal',   subAr: '1 يوليو 2026',                    subEn: 'Jul 1, 2026' },
                  ].map((item, i) => (
                    <div key={i} className="tl-item" style={i === 2 ? { marginBottom: 0 } : undefined}>
                      <div className="tl-dot" style={{ background: item.color }}></div>
                      <div className="tl-t">{t(item.ar, item.en, lang)}</div>
                      <div className="tl-s">{t(item.subAr, item.subEn, lang)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">{t('✅ مهامي اليوم',"✅ Today's Tasks",lang)}</div>
            <span className="badge b-purple">{tasks.filter(t => t.done).length}/{tasks.length}</span>
          </div>
          <div className="card-body" style={{ padding: '10px 18px' }}>
            {tasks.map(task => (
              <div key={task.id} className="task-item">
                <div className={`task-check${task.done ? ' done' : ''}`} onClick={() => toggleTask(task.id)}>
                  {task.done ? '✓' : ''}
                </div>
                <div className={`task-text${task.done ? ' done' : ''}`}>{t(task.ar, task.en, lang)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── Page: Profile ───────────────────────────────────────────────────────────

  const PageProfile = () => (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Topbar titleAr="ملفي الشخصي" titleEn="My Profile" subAr="إدارة بياناتك الشخصية" subEn="Manage your personal information"
        action={<button className="btn btn-primary btn-sm keep" onClick={() => setOpenModal('edit-profile')}>✏️ {t('تعديل','Edit',lang)}</button>}
      />
      <div className="content">
        <div className="card mb6" style={{ overflow: 'visible' }}>
          <div className="profile-cover"></div>
          <div style={{ padding: '0 20px 20px', marginTop: -40 }}>
            <div className="profile-avatar-lg" style={{ width: 80, height: 80, fontSize: 30, border: '4px solid var(--surface)' }}>
              أ<div className="av-badge">🟢</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 20, fontWeight: 900 }}>{t('أحمد الحسيني','Ahmed Al-Husseini',lang)}</div>
              <div style={{ fontSize: 13, color: 'var(--muted2)', marginTop: 4 }}>{t('مهندس برمجيات أول • قسم التقنية','Senior Software Engineer • Tech Dept',lang)}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <span className="badge b-green">✅ {t('نشط','Active',lang)}</span>
                <span className="badge b-purple">⭐ {t('موظف مميز','Star Employee',lang)}</span>
                <span className="badge b-blue">🆔 EMP-0042</span>
              </div>
            </div>
          </div>
        </div>

        <div className="g2 mb6">
          <div className="card">
            <div className="card-header"><div className="card-title">{t('👤 المعلومات الشخصية','👤 Personal Info',lang)}</div></div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                {[
                  { lAr:'الاسم الكامل',       lEn:'Full Name',      vAr:'أحمد علي الحسيني',          vEn:'Ahmed Ali Al-Husseini' },
                  { lAr:'رقم الموظف',          lEn:'Employee ID',    vAr:'EMP-0042',                   vEn:'EMP-0042' },
                  { lAr:'تاريخ الميلاد',       lEn:'Date of Birth',  vAr:'15 مارس 1992',               vEn:'March 15, 1992' },
                  { lAr:'الجنسية',             lEn:'Nationality',    vAr:'🇮🇶 عراقي',                 vEn:'🇮🇶 Iraqi' },
                  { lAr:'الحالة الاجتماعية',   lEn:'Marital Status', vAr:'متزوج',                      vEn:'Married' },
                ].map((row, i) => (
                  <div key={i}>
                    <div className="form-label">{t(row.lAr, row.lEn, lang)}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>{t(row.vAr, row.vEn, lang)}</div>
                    {i < 4 && <div className="divider" style={{ margin: '12px 0 0' }}></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card">
              <div className="card-header"><div className="card-title">{t('📞 معلومات التواصل','📞 Contact Info',lang)}</div></div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div><div className="form-label">{t('البريد الإلكتروني','Email',lang)}</div><div style={{ fontSize: 13, fontWeight: 700 }}>ahmed@digitalclinic.io</div></div>
                  <div className="divider" style={{ margin: 0 }}></div>
                  <div><div className="form-label">{t('الهاتف','Phone',lang)}</div><div style={{ fontSize: 13, fontWeight: 700 }}>+964 770 123 4567</div></div>
                  <div className="divider" style={{ margin: 0 }}></div>
                  <div><div className="form-label">{t('العنوان','Address',lang)}</div><div style={{ fontSize: 13, fontWeight: 700 }}>{t('بغداد، الكرادة، شارع 14','Baghdad, Karada, 14th St',lang)}</div></div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">{t('💼 المعلومات الوظيفية','💼 Job Info',lang)}</div></div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { lAr:'المسمى الوظيفي', lEn:'Job Title',        vAr:'مهندس برمجيات أول',          vEn:'Senior Software Engineer' },
                    { lAr:'القسم',           lEn:'Department',       vAr:'قسم التقنية والمعلومات',     vEn:'IT & Technology Dept' },
                    { lAr:'تاريخ التعيين',   lEn:'Hire Date',        vAr:'1 مارس 2023',                vEn:'March 1, 2023' },
                    { lAr:'المدير المباشر',   lEn:'Direct Manager',   vAr:'د. سامر النجار',             vEn:'Dr. Samer Al-Najjar' },
                  ].map((row, i) => (
                    <div key={i}>
                      <div className="form-label">{t(row.lAr, row.lEn, lang)}</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{t(row.vAr, row.vEn, lang)}</div>
                      {i < 3 && <div className="divider" style={{ margin: '10px 0 0' }}></div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">{t('🚨 جهة الاتصال في حالات الطوارئ','🚨 Emergency Contact',lang)}</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpenModal('edit-profile')}>{t('تعديل','Edit',lang)}</button>
          </div>
          <div className="card-body">
            <div className="g3">
              <div><div className="form-label">{t('الاسم','Name',lang)}</div><div style={{ fontSize: 13, fontWeight: 700 }}>{t('فاطمة الحسيني','Fatima Al-Husseini',lang)}</div></div>
              <div><div className="form-label">{t('العلاقة','Relation',lang)}</div><div style={{ fontSize: 13, fontWeight: 700 }}>{t('زوجة','Spouse',lang)}</div></div>
              <div><div className="form-label">{t('رقم الهاتف','Phone',lang)}</div><div style={{ fontSize: 13, fontWeight: 700 }}>+964 770 987 6543</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Page: Performance ───────────────────────────────────────────────────────

  const PagePerformance = () => (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Topbar titleAr="الأداء والتقييم" titleEn="Performance & Review" subAr="النتائج حتى أبريل 2026" subEn="Results through April 2026" />
      <div className="content">
        <div className="g4 mb6">
          <StatCard color="cp" iconBg="ip" icon="⭐" value="4.7" labelAr="التقييم العام" labelEn="Overall Rating" chg="↑ ممتاز" chgClass="sup" />
          <StatCard color="cg" iconBg="ig" icon="🎯" value="91%" labelAr="الأهداف المحققة" labelEn="Goals Achieved" chg="11/12" chgClass="sup" />
          <StatCard color="cb" iconBg="ib" icon="📚" value="6" labelAr="دورات مكتملة" labelEn="Courses Done" chg={t('هذا العام','This Year',lang)} chgClass="sup" />
          <StatCard color="ca" iconBg="ia" icon="🏆" value="2" labelAr="جوائز مستلمة" labelEn="Awards Received" chg="2026" chgClass="sup" />
        </div>
        <div className="g2 mb6">
          <div className="card">
            <div className="card-header"><div className="card-title">{t('💡 المهارات والكفاءات','💡 Skills & Competencies',lang)}</div></div>
            <div className="card-body">
              {[
                { ar:'جودة العمل',          en:'Work Quality',    pct:95, color:'c-purple', bg:'linear-gradient(90deg,var(--purple),var(--blue))' },
                { ar:'العمل الجماعي',        en:'Teamwork',        pct:88, color:'c-green',  bg:'var(--green)' },
                { ar:'الالتزام بالمواعيد',  en:'Punctuality',     pct:90, color:'c-blue',   bg:'var(--blue)' },
                { ar:'حل المشكلات',          en:'Problem Solving', pct:85, color:'c-amber',  bg:'var(--amber)' },
                { ar:'التواصل والتقارير',    en:'Communication',   pct:92, color:'c-purple', bg:'linear-gradient(90deg,var(--purple),var(--pink))' },
              ].map(skill => (
                <div key={skill.en} className="skill-row">
                  <div className="skill-info">
                    <span className="skill-name">{t(skill.ar, skill.en, lang)}</span>
                    <span className={`skill-pct ${skill.color}`}>{skill.pct}%</span>
                  </div>
                  <div className="prog prog-lg"><div className="prog-fill" style={{ width: `${skill.pct}%`, background: skill.bg }}></div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">{t('🎯 الأهداف الربعية','🎯 Quarterly Goals',lang)}</div>
              <span className="badge b-green">Q1 2026</span>
            </div>
            <div className="card-body" style={{ padding: '10px 18px' }}>
              {[
                { ar:'إطلاق نظام الحجز الإلكتروني', en:'Launch online booking system',   done:true,  pct:'100%', badgeCls:'b-green' },
                { ar:'تحسين سرعة قاعدة البيانات',   en:'Optimize database speed',        done:true,  pct:'100%', badgeCls:'b-green' },
                { ar:'تدريب 3 مبرمجين جدد',          en:'Train 3 new devs',               done:true,  pct:'100%', badgeCls:'b-green' },
                { ar:'إنجاز شهادة AWS المهنية',      en:'Complete AWS certification',      done:false, pct:'70%',  badgeCls:'b-amber' },
                { ar:'توثيق كامل لبروتوكولات API',   en:'Full API protocol documentation', done:false, pct:'40%',  badgeCls:'b-red'   },
              ].map((goal, i) => (
                <div key={i} className="task-item">
                  <div className={`task-check${goal.done ? ' done' : ''}`}>{goal.done ? '✓' : ''}</div>
                  <div style={{ flex: 1 }}><div className={`task-text${goal.done ? ' done' : ''}`}>{t(goal.ar, goal.en, lang)}</div></div>
                  <span className={`badge ${goal.badgeCls}`} style={{ flexShrink: 0 }}>{goal.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card mb6">
          <div className="card-header">
            <div className="card-title">{t('💬 تقييم المدير المباشر',"💬 Manager's Review",lang)}</div>
            <span className="badge b-blue">{t('أبريل 2026','April 2026',lang)}</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,var(--blue),var(--teal))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, flexShrink:0, color:'#fff' }}>س</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:800, marginBottom:3 }}>{t('د. سامر النجار','Dr. Samer Al-Najjar',lang)}</div>
                <div className="stars">★★★★★</div>
                <div style={{ fontSize:13, color:'var(--muted2)', marginTop:8, lineHeight:1.7 }}>
                  {t('أحمد موظف استثنائي؛ يتميز بجودة عمله العالية والتزامه الكامل. أنجز مشروع الحجز الإلكتروني قبل الموعد المحدد وأسهم في رفع كفاءة الفريق بشكل ملحوظ. ننصح بترقيته في الدورة القادمة.',
                     'Ahmed is an exceptional employee with high-quality work and full commitment. He delivered the booking system ahead of schedule and significantly improved team efficiency. We recommend his promotion in the next cycle.', lang)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">{t('🏆 الإنجازات والجوائز','🏆 Achievements & Awards',lang)}</div></div>
          <div className="card-body">
            <div className="g3">
              {[
                { emoji:'🥇', color:'var(--amber)',  textColor:'#f6ad55', ar:'موظف الشهر',   en:'Employee of the Month', periodAr:'مارس 2026',    periodEn:'March 2026',    border:'rgba(246,173,85,0.2)',   bg:'rgba(246,173,85,0.1)' },
                { emoji:'💡', color:'var(--purple)', textColor:'#a78bfa', ar:'جائزة الابتكار', en:'Innovation Award',      periodAr:'يناير 2026',   periodEn:'January 2026',  border:'rgba(124,58,237,0.2)',   bg:'rgba(124,58,237,0.1)' },
                { emoji:'🎓', color:'var(--teal)',   textColor:'var(--teal)', ar:'دورة React Advanced', en:'React Advanced Course', periodAr:'فبراير 2026', periodEn:'February 2026', border:'rgba(10,191,188,0.2)', bg:'rgba(10,191,188,0.1)' },
              ].map(award => (
                <div key={award.en} style={{ background:`linear-gradient(135deg,${award.bg},transparent)`, border:`1px solid ${award.border}`, borderRadius:'var(--rsm)', padding:16, textAlign:'center' }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>{award.emoji}</div>
                  <div style={{ fontSize:13, fontWeight:800, color:award.textColor }}>{t(award.ar, award.en, lang)}</div>
                  <div style={{ fontSize:11, color:'var(--muted2)', marginTop:4 }}>{t(award.periodAr, award.periodEn, lang)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Page: Leaves ────────────────────────────────────────────────────────────

  const PageLeaves = () => (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Topbar titleAr="إجازاتي" titleEn="My Leaves"
        action={<button className="btn btn-primary btn-sm keep" onClick={() => setOpenModal('leave-req')}>+ {t('طلب جديد','New Request',lang)}</button>}
      />
      <div className="content">
        <div className="g3 mb6">
          <StatCard color="cg" iconBg="ig" icon="🌴" value="14" labelAr="رصيد الإجازة السنوية" labelEn="Annual Leave Balance" chg={t('من 21 يوم','of 21 days',lang)} chgClass="sup" />
          <StatCard color="ca" iconBg="ia" icon="🤒" value="5" labelAr="رصيد الإجازة المرضية" labelEn="Sick Leave Balance" chg={t('من 10 أيام','of 10 days',lang)} chgClass="snu" />
          <StatCard color="cp" iconBg="ip" icon="📋" value="1" labelAr="طلبات قيد الانتظار" labelEn="Pending Requests" chg={t('بانتظار الموافقة','Awaiting Approval',lang)} chgClass="sdn" />
        </div>

        <div className="g2 mb6">
          <div className="card">
            <div className="card-header"><div className="card-title">{t('📅 تقويم الإجازات — أبريل 2026','📅 Leave Calendar — April 2026',lang)}</div></div>
            <div className="card-body">
              <div className="cal-grid" style={{ marginBottom: 6 }}>
                {[['أح','Su'],['إث','Mo'],['ث','Tu'],['أر','We'],['خ','Th'],['ج','Fr'],['س','Sa']].map(([a,e]) => (
                  <div key={a} className="cal-day-name">{t(a,e,lang)}</div>
                ))}
                {[{d:'29',cls:'other-month'},{d:'30',cls:'other-month'},{d:'31',cls:'other-month'},
                  {d:'1'},{d:'2'},{d:'3',cls:'other-month',op:.15},{d:'4',cls:'other-month',op:.15},
                  {d:'5'},{d:'6'},{d:'7'},{d:'8'},{d:'9'},{d:'10',cls:'other-month',op:.15},{d:'11',cls:'other-month',op:.15},
                  {d:'12'},{d:'13',cls:'today'},{d:'14'},{d:'15'},{d:'16'},{d:'17',cls:'other-month',op:.15},{d:'18',cls:'other-month',op:.15},
                  {d:'19'},{d:'20',cls:'leave'},{d:'21',cls:'leave'},{d:'22',cls:'leave'},{d:'23',cls:'leave'},{d:'24',cls:'other-month',op:.15},{d:'25',cls:'other-month',op:.15},
                  {d:'26'},{d:'27'},{d:'28'},{d:'29'},{d:'30'},{d:'1',cls:'other-month'},{d:'2',cls:'other-month'}
                ].map((day, i) => (
                  <div key={i} className={`cal-day ${day.cls ?? ''}`} style={day.op ? { opacity: day.op } : undefined}>{day.d}</div>
                ))}
              </div>
              <div style={{ display:'flex', gap:12, fontSize:11, fontWeight:700, marginTop:8, flexWrap:'wrap' }}>
                {[
                  { bg:'rgba(124,58,237,0.3)', ar:'اليوم',                    en:'Today' },
                  { bg:'rgba(246,173,85,0.3)', ar:'إجازة بانتظار الموافقة',  en:'Pending Leave' },
                  { bg:'rgba(46,204,113,0.3)', ar:'إجازة معتمدة',             en:'Approved Leave' },
                ].map(item => (
                  <span key={item.en} style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <span style={{ width:12, height:12, borderRadius:3, background:item.bg, flexShrink:0 }}></span>
                    <span className="c-muted">{t(item.ar, item.en, lang)}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">{t('📋 طلباتي','📋 My Requests',lang)}</div></div>
            <div className="card-body">
              {[
                { icon:'🌴', ar:'إجازة سنوية',    en:'Annual Leave',    subAr:'20 - 23 أبريل 2026 • 4 أيام', subEn:'Apr 20-23, 2026 • 4 days', cls:'b-amber',  lAr:'⏳ بانتظار',  lEn:'⏳ Pending'  },
                { icon:'🌴', ar:'إجازة سنوية',    en:'Annual Leave',    subAr:'15 - 17 مارس 2026 • 3 أيام',  subEn:'Mar 15-17, 2026 • 3 days', cls:'b-green',  lAr:'✅ معتمدة',   lEn:'✅ Approved'  },
                { icon:'🤒', ar:'إجازة مرضية',    en:'Sick Leave',      subAr:'2 فبراير 2026 • 1 يوم',       subEn:'Feb 2, 2026 • 1 day',      cls:'b-green',  lAr:'✅ معتمدة',   lEn:'✅ Approved'  },
                { icon:'📋', ar:'إجازة بدون راتب', en:'Unpaid Leave',    subAr:'10 يناير 2026 • 2 أيام',      subEn:'Jan 10, 2026 • 2 days',    cls:'b-red',    lAr:'❌ مرفوضة',   lEn:'❌ Rejected'  },
              ].map((req, i) => (
                <div key={i} className="leave-req-card">
                  <div className="leave-req-icon">{req.icon}</div>
                  <div className="leave-req-info">
                    <div className="leave-req-title">{t(req.ar, req.en, lang)}</div>
                    <div className="leave-req-sub">{t(req.subAr, req.subEn, lang)}</div>
                  </div>
                  <span className={`badge ${req.cls}`}>{t(req.lAr, req.lEn, lang)}</span>
                </div>
              ))}
            </div>
            <div className="card-footer">
              <button className="btn btn-primary btn-sm" onClick={() => setOpenModal('leave-req')}>+ {t('طلب إجازة جديد','New Leave Request',lang)}</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">{t('📊 تفاصيل رصيد الإجازات 2026','📊 Leave Balance Details 2026',lang)}</div></div>
          <div className="card-body">
            <div className="g3">
              {[
                { ar:'🌴 الإجازة السنوية', en:'🌴 Annual Leave', val:'14/21', valCls:'c-green', pct:67, bg:'var(--green)', usedAr:'7 أيام مستخدمة', usedEn:'7 days used' },
                { ar:'🤒 الإجازة المرضية', en:'🤒 Sick Leave',   val:'5/10',  valCls:'c-amber', pct:50, bg:'var(--amber)', usedAr:'5 أيام مستخدمة', usedEn:'5 days used' },
                { ar:'📋 بدون راتب',       en:'📋 Unpaid Leave', val:'0/5',   valCls:'c-muted', pct:0,  bg:'var(--muted)', usedAr:'0 أيام مستخدمة', usedEn:'0 days used' },
              ].map(lb => (
                <div key={lb.en}>
                  <div className="fbetween" style={{ marginBottom:8, fontSize:12.5 }}>
                    <span className="fw8">{t(lb.ar, lb.en, lang)}</span>
                    <span className={`${lb.valCls} fw8`}>{lb.val}</span>
                  </div>
                  <div className="prog prog-lg"><div className="prog-fill" style={{ width:`${lb.pct}%`, background:lb.bg }}></div></div>
                  <div style={{ fontSize:10.5, color:'var(--muted2)', marginTop:5 }}>{t(lb.usedAr, lb.usedEn, lang)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Page: Attendance ────────────────────────────────────────────────────────

  const PageAttendance = () => (
    <div className="page active" style={{ display:'flex', flexDirection:'column', minHeight:'100%' }}>
      <Topbar titleAr="سجل الحضور والانصراف" titleEn="Attendance Record" />
      <div className="content">
        <div className="g4 mb6">
          <StatCard color="cg" iconBg="ig" icon="✅" value="94%" labelAr="معدل الحضور" labelEn="Attendance Rate" chg={t('هذا الشهر','This Month',lang)} chgClass="sup" />
          <StatCard color="cb" iconBg="ib" icon="⏰" value="1"   labelAr="أيام التأخير" labelEn="Late Days" chg={t('أبريل','April',lang)} chgClass="snu" />
          <StatCard color="ca" iconBg="ia" icon="🚫" value="0"   labelAr="أيام الغياب" labelEn="Absent Days" chg={t('ممتاز','Excellent',lang)} chgClass="sup" />
          <StatCard color="cp" iconBg="ip" icon="⏱️" value="18h" labelAr="ساعات إضافية" labelEn="Overtime" chg={t('هذا الشهر','This Month',lang)} chgClass="sup" />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">{t('📋 سجل الحضور — أبريل 2026','📋 Attendance Log — April 2026',lang)}</div></div>
          <div className="table-wrap">
            <table className="dtable">
              <thead><tr>
                <th>{t('التاريخ','Date',lang)}</th>
                <th>{t('وقت الدخول','Clock In',lang)}</th>
                <th>{t('وقت الخروج','Clock Out',lang)}</th>
                <th>{t('ساعات العمل','Hours',lang)}</th>
                <th>{t('الإضافي','OT',lang)}</th>
                <th>{t('الحالة','Status',lang)}</th>
              </tr></thead>
              <tbody>
                {attendanceData.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight:700 }}>{lang==='ar' ? row.date_ar : row.date_en}</td>
                    <td>{row.in}</td>
                    <td>{row.out}</td>
                    <td style={{ fontWeight:700 }}>{row.hrs}h</td>
                    <td style={{ color: parseFloat(row.ot)>0 ? 'var(--amber)' : 'var(--muted2)', fontWeight: parseFloat(row.ot)>0 ? 800 : 400 }}>
                      {parseFloat(row.ot)>0 ? `+${row.ot}h` : '—'}
                    </td>
                    <td>
                      {row.status==='present' ? <span className="badge b-green">{t('✅ حاضر','✅ Present',lang)}</span>
                       : row.status==='late'    ? <span className="badge b-amber">{t('⏰ متأخر','⏰ Late',lang)}</span>
                       : <span className="badge b-red">{t('❌ غائب','❌ Absent',lang)}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Page: Payroll ───────────────────────────────────────────────────────────

  const PagePayroll = () => (
    <div className="page active" style={{ display:'flex', flexDirection:'column', minHeight:'100%' }}>
      <Topbar titleAr="رواتبي وكشوف المرتبات" titleEn="My Payroll & Payslips" />
      <div className="content">
        <div className="g3 mb6">
          <StatCard color="cp" iconBg="ip" icon="💰" value="3.5M" labelAr="الراتب الأساسي (د.ع)" labelEn="Base Salary (IQD)" chg={t('شهريًا','Monthly',lang)} chgClass="sup" />
          <StatCard color="cg" iconBg="ig" icon="📈" value="3.95M" labelAr="الراتب الإجمالي هذا الشهر" labelEn="Gross This Month" chg={t('+ بدلات وإضافي','+ Allowances & OT',lang)} chgClass="sup" />
          <StatCard color="ca" iconBg="ia" icon="💸" value="3.75M" labelAr="الصافي المستحق" labelEn="Net Payable" chg={t('بعد الاستقطاعات','After Deductions',lang)} chgClass="snu" />
        </div>

        <div className="card mb6">
          <div className="card-header"><div className="card-title">{t('🧾 سجل كشوف الراتب','🧾 Payslip History',lang)}</div></div>
          <div className="table-wrap">
            <table className="dtable">
              <thead><tr>
                <th>{t('الشهر','Month',lang)}</th>
                <th>{t('الراتب الأساسي','Base',lang)}</th>
                <th>{t('البدلات','Allowances',lang)}</th>
                <th>{t('الاستقطاعات','Deductions',lang)}</th>
                <th>{t('الصافي','Net',lang)}</th>
                <th>{t('الحالة','Status',lang)}</th>
                <th>{t('الإجراء','Action',lang)}</th>
              </tr></thead>
              <tbody>
                {[
                  { mAr:'أبريل 2026', mEn:'April 2026',   base:'3,500,000', all:'+450,000', ded:'-197,500', net:'3,752,500', cls:'b-amber', sAr:'⏳ معلق',  sEn:'⏳ Pending' },
                  { mAr:'مارس 2026',  mEn:'March 2026',   base:'3,500,000', all:'+380,000', ded:'-175,000', net:'3,705,000', cls:'b-green', sAr:'✅ مدفوع', sEn:'✅ Paid' },
                  { mAr:'فبراير 2026',mEn:'February 2026',base:'3,500,000', all:'+300,000', ded:'-175,000', net:'3,625,000', cls:'b-green', sAr:'✅ مدفوع', sEn:'✅ Paid' },
                  { mAr:'يناير 2026', mEn:'January 2026', base:'3,500,000', all:'+250,000', ded:'-175,000', net:'3,575,000', cls:'b-green', sAr:'✅ مدفوع', sEn:'✅ Paid' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight:800 }}>{t(row.mAr, row.mEn, lang)}</td>
                    <td>{row.base}</td>
                    <td style={{ color:'#4ade80' }}>{row.all}</td>
                    <td style={{ color:'#f87171' }}>{row.ded}</td>
                    <td style={{ fontWeight:900, color:'#4ade80' }}>{row.net}</td>
                    <td><span className={`badge ${row.cls}`}>{t(row.sAr, row.sEn, lang)}</span></td>
                    <td><button className="btn btn-ghost btn-xs" onClick={() => setOpenModal('payslip')}>{t('عرض','View',lang)}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">{t('📊 تفاصيل راتب أبريل 2026','📊 April 2026 Salary Breakdown',lang)}</div></div>
          <div className="card-body">
            <div className="g2">
              <div>
                <div className="sec-div">{t('الإضافات +','ADDITIONS +',lang)}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {[
                    { ar:'الراتب الأساسي', en:'Base Salary',       val:'3,500,000', cls:'' },
                    { ar:'بدل النقل',       en:'Transport Allowance', val:'+100,000', cls:'c-green' },
                    { ar:'الدوام الإضافي (18h)', en:'Overtime (18h)', val:'+350,000', cls:'c-green' },
                  ].map(row => (
                    <div key={row.en} className="fbetween" style={{ fontSize:12.5 }}>
                      <span className="c-muted">{t(row.ar, row.en, lang)}</span>
                      <span className={`fw8 ${row.cls}`}>{row.val}</span>
                    </div>
                  ))}
                  <div className="fbetween" style={{ fontSize:12.5, paddingTop:8, borderTop:'1px solid var(--border)' }}>
                    <span className="fw8">{t('الإجمالي','Total',lang)}</span>
                    <span className="fw8 c-green">3,950,000</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="sec-div">{t('الاستقطاعات -','DEDUCTIONS -',lang)}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {[
                    { ar:'الضمان الاجتماعي (5%)', en:'Social Security (5%)', val:'-197,500', cls:'c-red' },
                    { ar:'أيام الغياب',             en:'Absence Deduction',    val:'—',        cls:'c-muted' },
                  ].map(row => (
                    <div key={row.en} className="fbetween" style={{ fontSize:12.5 }}>
                      <span className="c-muted">{t(row.ar, row.en, lang)}</span>
                      <span className={`fw8 ${row.cls}`}>{row.val}</span>
                    </div>
                  ))}
                  <div className="fbetween" style={{ fontSize:12.5, paddingTop:8, borderTop:'1px solid var(--border)' }}>
                    <span className="fw8">{t('إجمالي الاستقطاع','Total Deductions',lang)}</span>
                    <span className="fw8 c-red">-197,500</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background:'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(26,111,186,0.12))', border:'1px solid rgba(124,58,237,0.25)', borderRadius:'var(--rsm)', padding:16, marginTop:14, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
              <span style={{ fontSize:15, fontWeight:800, color:'#a78bfa' }}>💰 {t('الراتب الصافي','Net Salary',lang)}</span>
              <span style={{ fontSize:22, fontWeight:900, color:'#4ade80' }}>3,752,500 <span style={{ fontSize:12, color:'var(--muted2)' }}>{t('د.ع','IQD',lang)}</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Page: Benefits ──────────────────────────────────────────────────────────

  const PageBenefits = () => (
    <div className="page active" style={{ display:'flex', flexDirection:'column', minHeight:'100%' }}>
      <Topbar titleAr="مزاياي ومكافآتي" titleEn="My Benefits & Perks" />
      <div className="content">
        <div className="g4 mb6">
          <StatCard color="cp" iconBg="ip" icon="🎁" value="8"    labelAr="مزايا نشطة"      labelEn="Active Benefits" />
          <StatCard color="cg" iconBg="ig" icon="🏥" value="✓"    labelAr="تأمين صحي"        labelEn="Health Insurance" />
          <StatCard color="ca" iconBg="ia" icon="📚" value="500$" labelAr="بدل تدريب سنوي"  labelEn="Training Budget" />
          <StatCard color="cb" iconBg="ib" icon="🚗" value="✓"    labelAr="بدل نقل"          labelEn="Transport" />
        </div>
        <div className="g2">
          <div className="card">
            <div className="card-header"><div className="card-title">{t('🎁 المزايا المتاحة','🎁 Available Benefits',lang)}</div></div>
            <div className="card-body">
              {[
                { icon:'🏥', ar:'تأمين صحي شامل',          en:'Comprehensive Health Insurance', vAr:'تغطية كاملة للموظف والعائلة', vEn:'Full coverage for employee & family', cls:'b-green', lAr:'نشط',          lEn:'Active' },
                { icon:'🦷', ar:'تغطية أسنان',              en:'Dental Coverage',                vAr:'حتى 200,000 د.ع سنويًا',       vEn:'Up to 200,000 IQD/year',            cls:'b-green', lAr:'نشط',          lEn:'Active' },
                { icon:'📚', ar:'بدل التدريب والتطوير',     en:'Training Budget',                vAr:'500$ سنويًا للدورات',           vEn:'$500/year for courses & certs',     cls:'b-amber', lAr:'150$ متبقي',   lEn:'$150 left' },
                { icon:'🚗', ar:'بدل النقل الشهري',          en:'Monthly Transport',              vAr:'100,000 د.ع/شهر',              vEn:'100,000 IQD/month',                 cls:'b-green', lAr:'نشط',          lEn:'Active' },
                { icon:'🌮', ar:'وجبة غداء مجانية',         en:'Free Lunch',                     vAr:'أيام الأحد - الخميس',           vEn:'Sun - Thu',                         cls:'b-green', lAr:'نشط',          lEn:'Active' },
                { icon:'🏋️', ar:'عضوية نادي رياضي',        en:'Gym Membership',                 vAr:'50% خصم في النوادي المشتركة',   vEn:'50% discount at partner gyms',      cls:'b-green', lAr:'نشط',          lEn:'Active' },
              ].map((b, i) => (
                <div key={i} className="benefit-item">
                  <div className="benefit-icon">{b.icon}</div>
                  <div className="benefit-info">
                    <div className="benefit-name">{t(b.ar, b.en, lang)}</div>
                    <div className="benefit-val">{t(b.vAr, b.vEn, lang)}</div>
                  </div>
                  <span className={`badge ${b.cls}`}>{t(b.lAr, b.lEn, lang)}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="card">
              <div className="card-header"><div className="card-title">{t('🏆 مكافآت الأداء','🏆 Performance Bonuses',lang)}</div></div>
              <div className="card-body">
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div className="fbetween"><span className="fs12 c-muted">{t('مكافأة Q1 2026','Q1 2026 Bonus',lang)}</span><span className="fw8 c-green">+350,000 {t('د.ع','IQD',lang)}</span></div>
                  <div className="fbetween"><span className="fs12 c-muted">{t('مكافأة نهاية السنة 2025','Year-End Bonus 2025',lang)}</span><span className="fw8 c-green">+700,000 {t('د.ع','IQD',lang)}</span></div>
                  <div className="fbetween"><span className="fs12 c-muted">{t('مكافأة موظف الشهر','Employee of Month Bonus',lang)}</span><span className="fw8 c-amber">+150,000 {t('د.ع','IQD',lang)}</span></div>
                  <div className="divider"></div>
                  <div className="fbetween"><span className="fw8">{t('إجمالي المكافآت 2026','Total Bonuses 2026',lang)}</span><span className="fw8 c-green">500,000 {t('د.ع','IQD',lang)}</span></div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">{t('🎓 بدل التدريب','🎓 Training Budget',lang)}</div></div>
              <div className="card-body">
                <div className="fbetween" style={{ marginBottom:10, fontSize:12.5 }}>
                  <span className="c-muted">{t('المستخدم','Used',lang)}</span>
                  <span className="fw8">350$ / 500$</span>
                </div>
                <div className="prog prog-lg" style={{ marginBottom:10 }}><div className="prog-fill" style={{ width:'70%', background:'linear-gradient(90deg,var(--purple),var(--blue))' }}></div></div>
                <div style={{ fontSize:11, color:'var(--muted2)', marginBottom:12 }}>{t('150$ متبقي لعام 2026','$150 remaining for 2026',lang)}</div>
                <button className="btn btn-purple btn-sm btn-block" onClick={() => setOpenModal('cert')}>📤 {t('طلب استخدام البدل','Request Budget Use',lang)}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Page: Requests ──────────────────────────────────────────────────────────

  const PageRequests = () => (
    <div className="page active" style={{ display:'flex', flexDirection:'column', minHeight:'100%' }}>
      <Topbar titleAr="طلباتي والوثائق" titleEn="My Requests & Documents"
        action={<button className="btn btn-primary btn-sm keep" onClick={() => setOpenModal('cert')}>+ {t('طلب جديد','New Request',lang)}</button>}
      />
      <div className="content">
        <div className="g2 mb6">
          <div className="card">
            <div className="card-header"><div className="card-title">{t('📋 الطلبات الأخيرة','📋 Recent Requests',lang)}</div></div>
            <div className="card-body">
              {[
                { icon:'📋', ar:'شهادة عمل',              en:'Employment Certificate', subAr:'مقدم بتاريخ 10 أبريل 2026', subEn:'Submitted Apr 10, 2026', cls:'b-amber', lAr:'⏳ قيد المعالجة', lEn:'⏳ Processing' },
                { icon:'💰', ar:'شهادة راتب',             en:'Salary Certificate',    subAr:'مقدم بتاريخ 5 أبريل 2026',  subEn:'Submitted Apr 5, 2026',  cls:'b-amber', lAr:'⏳ قيد المعالجة', lEn:'⏳ Processing' },
                { icon:'📊', ar:'تقرير الأداء السنوي 2025',en:'Annual Review 2025',   subAr:'مقدم بتاريخ 1 مارس 2026',   subEn:'Submitted Mar 1, 2026',  cls:'b-green', lAr:'✅ جاهزة',        lEn:'✅ Ready' },
                { icon:'🏥', ar:'خطاب لوزارة الصحة',      en:'Ministry of Health Letter', subAr:'مقدم بتاريخ 15 فبراير 2026', subEn:'Submitted Feb 15, 2026', cls:'b-green', lAr:'✅ مسلمة', lEn:'✅ Delivered' },
              ].map((req, i) => (
                <div key={i} className="leave-req-card">
                  <div className="leave-req-icon">{req.icon}</div>
                  <div className="leave-req-info">
                    <div className="leave-req-title">{t(req.ar, req.en, lang)}</div>
                    <div className="leave-req-sub">{t(req.subAr, req.subEn, lang)}</div>
                  </div>
                  <span className={`badge ${req.cls}`}>{t(req.lAr, req.lEn, lang)}</span>
                </div>
              ))}
            </div>
            <div className="card-footer">
              <button className="btn btn-primary btn-sm" onClick={() => setOpenModal('cert')}>+ {t('طلب وثيقة جديدة','Request New Document',lang)}</button>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="card">
              <div className="card-header"><div className="card-title">{t('⚡ طلب سريع','⚡ Quick Request',lang)}</div></div>
              <div className="qa-grid">
                {[
                  { icon:'📋', ar:'شهادة عمل',  en:'Work Cert',     action:() => setOpenModal('cert') },
                  { icon:'💰', ar:'شهادة راتب', en:'Salary Cert',   action:() => setOpenModal('cert') },
                  { icon:'🏥', ar:'خطاب رسمي',  en:'Official Letter',action:() => setOpenModal('cert') },
                  { icon:'🏖️', ar:'طلب إجازة', en:'Leave Req',     action:() => setOpenModal('leave-req') },
                ].map(item => (
                  <button key={item.en} className="qa-btn" onClick={item.action}>
                    <span className="qa-icon">{item.icon}</span>
                    <span className="qa-label">{t(item.ar, item.en, lang)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">{t('📁 وثائقي','📁 My Documents',lang)}</div></div>
              <div className="card-body">
                <div className="tl">
                  {[
                    { color:'var(--blue)',   ar:'عقد العمل 2026',          en:'Employment Contract 2026', size:'PDF • 2.3 MB' },
                    { color:'var(--green)',  ar:'تقرير الأداء 2025',       en:'Performance Report 2025',  size:'PDF • 1.1 MB' },
                    { color:'var(--amber)',  ar:'شهادة AWS الأساسية',       en:'AWS Foundational Cert',    size:'PDF • 0.8 MB' },
                  ].map((doc, i) => (
                    <div key={i} className="tl-item" style={i===2 ? { marginBottom:0 } : undefined}>
                      <div className="tl-dot" style={{ background:doc.color }}></div>
                      <div className="tl-t">{t(doc.ar, doc.en, lang)}</div>
                      <div className="tl-s" style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span>{doc.size}</span>
                        <button className="btn btn-ghost btn-xs" onClick={() => showToast(t('⬇️ جاري التحميل','⬇️ Downloading...',lang),'info')}>
                          ⬇️ {t('تحميل','Download',lang)}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Page: Notifications ─────────────────────────────────────────────────────

  const PageNotifications = () => (
    <div className="page active" style={{ display:'flex', flexDirection:'column', minHeight:'100%' }}>
      <Topbar titleAr="الإشعارات" titleEn="Notifications"
        action={<button className="btn btn-ghost btn-sm" onClick={markAllRead}>{t('قراءة الكل','Mark All Read',lang)}</button>}
      />
      <div className="content">
        <div className="card">
          <div className="card-body">
            {[
              { read:false, iconBg:'rgba(246,173,85,0.15)',   icon:'⏳', titleAr:'طلب إجازتك قيد المراجعة',           titleEn:'Your leave request is under review',   subAr:'إجازة سنوية 20-23 أبريل — المدير يراجع الطلب', subEn:'Annual leave Apr 20-23 — Dr. Samer is reviewing', timeAr:'منذ ساعة',    timeEn:'1h ago'  },
              { read:false, iconBg:'rgba(46,204,113,0.15)',   icon:'💰', titleAr:'كشف راتب مارس 2026 جاهز',            titleEn:'March 2026 payslip is ready',          subAr:'صافي الراتب: 3,705,000 د.ع — جاهز للتحميل',    subEn:'Net: 3,705,000 IQD — Ready to download',         timeAr:'منذ 3 ساعات', timeEn:'3h ago'  },
              { read:false, iconBg:'rgba(124,58,237,0.15)',   icon:'⭐', titleAr:'تم نشر نتائج تقييمك للربع الأول',   titleEn:'Q1 performance review published',      subAr:'حصلت على تقييم 4.7/5 — ممتاز. تهانينا!',       subEn:'You scored 4.7/5 — Excellent! Congratulations!', timeAr:'منذ يوم',     timeEn:'1d ago'  },
              { read:true,  iconBg:'rgba(26,111,186,0.12)',   icon:'📋', titleAr:'شهادة راتب جاهزة للاستلام',         titleEn:'Salary certificate ready',             subAr:'يمكنك زيارة قسم الموارد البشرية لاستلام الوثيقة', subEn:'Visit HR to collect your document',            timeAr:'منذ 3 أيام',  timeEn:'3d ago'  },
              { read:true,  iconBg:'rgba(46,204,113,0.12)',   icon:'🏆', titleAr:'مبروك! موظف شهر مارس 2026',         titleEn:'Congrats! Employee of March 2026',      subAr:'تم اختيارك موظف الشهر من قبل فريق القيادة',    subEn:'You were selected by the leadership team',        timeAr:'منذ 2 أسبوع', timeEn:'2w ago'  },
            ].map((notif, i) => (
              <div key={i} className="notif-item" style={{ opacity: (notifsRead || notif.read) ? 0.6 : 1 }}>
                {!notifsRead && !notif.read && <div className="notif-dot"></div>}
                <div className="notif-icon" style={{ background: notif.iconBg }}>{notif.icon}</div>
                <div className="notif-text">
                  <div className="notif-title">{t(notif.titleAr, notif.titleEn, lang)}</div>
                  <div className="notif-sub">{t(notif.subAr, notif.subEn, lang)}</div>
                </div>
                <div className="notif-time">{t(notif.timeAr, notif.timeEn, lang)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── Modals ──────────────────────────────────────────────────────────────────

  const ModalLeaveReq = () => (
    <div className={`modal-backdrop${openModal==='leave-req' ? ' open' : ''}`} onClick={() => setOpenModal(null)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🏖️ {t('طلب إجازة جديد','New Leave Request',lang)}</div>
          <button className="modal-close" onClick={() => setOpenModal(null)}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">{t('نوع الإجازة','Leave Type',lang)} <span className="req">*</span></label>
            <select className="form-control">
              <option>🌴 {t('إجازة سنوية','Annual Leave',lang)}</option>
              <option>🤒 {t('إجازة مرضية','Sick Leave',lang)}</option>
              <option>👶 {t('إجازة أمومة/أبوة','Maternity/Paternity',lang)}</option>
              <option>⚰️ {t('إجازة وفاة','Bereavement',lang)}</option>
              <option>📋 {t('إجازة بدون راتب','Unpaid Leave',lang)}</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('من تاريخ','From Date',lang)} <span className="req">*</span></label>
              <input type="date" className="form-control" defaultValue="2026-04-20" />
            </div>
            <div className="form-group">
              <label className="form-label">{t('إلى تاريخ','To Date',lang)} <span className="req">*</span></label>
              <input type="date" className="form-control" defaultValue="2026-04-24" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('سبب الإجازة','Reason',lang)}</label>
            <textarea className="form-control" placeholder={t('اكتب السبب هنا...','Write reason here...',lang)} rows={3}></textarea>
          </div>
          <div className="alert alert-info" style={{ marginTop:4, fontSize:11.5 }}>
            ℹ️ {t('رصيدك المتبقي:','Remaining balance:',lang)} <strong>14 {t('يوم','days',lang)}</strong> {t('من 21 يوم سنوي','of 21 annual days',lang)}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setOpenModal(null)}>{t('إلغاء','Cancel',lang)}</button>
          <button className="btn btn-primary" onClick={() => {
            setOpenModal(null);
            showToast(t('✅ تم إرسال طلب الإجازة بنجاح','✅ Leave request submitted successfully',lang),'success');
          }}>📤 {t('إرسال الطلب','Submit Request',lang)}</button>
        </div>
      </div>
    </div>
  );

  const ModalEditProfile = () => (
    <div className={`modal-backdrop${openModal==='edit-profile' ? ' open' : ''}`} onClick={() => setOpenModal(null)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">✏️ {t('تعديل الملف الشخصي','Edit Profile',lang)}</div>
          <button className="modal-close" onClick={() => setOpenModal(null)}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-section">👤 {t('المعلومات الشخصية','Personal Information',lang)}</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('الاسم الأول','First Name',lang)}</label>
              <input className="form-control" defaultValue={t('أحمد','Ahmed',lang)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('اسم العائلة','Last Name',lang)}</label>
              <input className="form-control" defaultValue={t('الحسيني','Al-Husseini',lang)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('رقم الهاتف','Phone',lang)}</label>
            <input className="form-control" defaultValue="+964 770 123 4567" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('البريد الإلكتروني','Email',lang)}</label>
            <input className="form-control" type="email" defaultValue="ahmed@digitalclinic.io" />
          </div>
          <div className="form-divider"></div>
          <div className="form-section">🔒 {t('تغيير كلمة المرور','Change Password',lang)}</div>
          <div className="form-group">
            <label className="form-label">{t('كلمة المرور الجديدة','New Password',lang)}</label>
            <input className="form-control" type="password" placeholder="••••••••" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('تأكيد كلمة المرور','Confirm Password',lang)}</label>
            <input className="form-control" type="password" placeholder="••••••••" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setOpenModal(null)}>{t('إلغاء','Cancel',lang)}</button>
          <button className="btn btn-primary" onClick={() => {
            setOpenModal(null);
            showToast(t('✅ تم حفظ التغييرات','✅ Changes saved successfully',lang),'success');
          }}>💾 {t('حفظ التغييرات','Save Changes',lang)}</button>
        </div>
      </div>
    </div>
  );

  const ModalPayslip = () => {
    const isAr = lang === 'ar';
    return (
      <div className={`modal-backdrop${openModal==='payslip' ? ' open' : ''}`} onClick={() => setOpenModal(null)}>
        <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title">💰 {t('كشف الراتب','Payslip',lang)}</div>
            <button className="modal-close" onClick={() => setOpenModal(null)}>✕</button>
          </div>
          <div className="modal-body">
            <div className="payslip" dir={isAr ? 'rtl' : 'ltr'}>
              <div className="ps-hd">
                <div>
                  <div className="ps-logo">👤 {isAr ? 'بوابة الموظف — العيادة الرقمية' : 'Employee Portal — Digital Clinic'}</div>
                  <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{isAr ? 'بغداد، العراق' : 'Baghdad, Iraq'}</div>
                </div>
                <div className="ps-badge">{isAr ? 'كشف الراتب' : 'PAYSLIP'}</div>
              </div>
              <div className="ps-emp">
                {[
                  { l: isAr?'الموظف':'Employee',    v: isAr?'أحمد الحسيني':'Ahmed Al-Husseini' },
                  { l: isAr?'المسمى':'Position',    v: isAr?'مهندس برمجيات أول':'Sr. Software Engineer' },
                  { l: isAr?'الشهر':'Month',        v: isAr?'أبريل 2026':'April 2026' },
                  { l: isAr?'رقم الموظف':'Emp ID',  v: 'EMP-0042' },
                  { l: isAr?'القسم':'Department',   v: isAr?'التقنية':'Technology' },
                  { l: isAr?'أيام العمل':'Working Days', v: `22 ${isAr?'يوم':'days'}` },
                ].map((f, i) => (
                  <div key={i} className="ps-field">
                    <div className="fl">{f.l}</div>
                    <div className="fv">{f.v}</div>
                  </div>
                ))}
              </div>
              <div className="ps-rows">
                {[
                  { cls:'add', l: isAr?'الراتب الأساسي':'Base Salary',                  v:'3,500,000' },
                  { cls:'add', l: isAr?'بدل النقل':'Transport Allowance',               v:'+100,000' },
                  { cls:'add', l: isAr?'الدوام الإضافي (18h × 1.5)':'Overtime (18h × 1.5)', v:'+350,000' },
                  { cls:'ded', l: isAr?'الضمان الاجتماعي (5%)':'Social Security (5%)',  v:'-197,500' },
                  { cls:'ded', l: isAr?'خصم الغياب':'Absence Deduction',               v:'—' },
                ].map((row, i) => (
                  <div key={i} className={`ps-row ${row.cls}`}>
                    <span className="pl">{row.l}</span>
                    <span className="pv">{row.v}</span>
                  </div>
                ))}
              </div>
              <div className="ps-net">
                <span className="nl">💰 {isAr ? 'الراتب الصافي' : 'Net Salary'}</span>
                <span className="nv">3,752,500 {isAr ? 'د.ع' : 'IQD'}</span>
              </div>
              <div className="ps-ft">
                <span>{isAr ? 'وثيقة رسمية لبوابة الموظف — العيادة الرقمية' : 'Official Employee Portal Document — Digital Clinic'}</span>
                <span>{isAr ? 'تاريخ الإصدار: 13 أبريل 2026' : 'Issued: April 13, 2026'}</span>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost btn-sm" onClick={() => setOpenModal(null)}>{t('إغلاق','Close',lang)}</button>
            <button className="btn btn-primary btn-sm" onClick={() => showToast(t('⬇️ جاري التحميل...','⬇️ Downloading...',lang),'info')}>
              ⬇️ {t('تحميل PDF','Download PDF',lang)}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ModalCert = () => (
    <div className={`modal-backdrop${openModal==='cert' ? ' open' : ''}`} onClick={() => setOpenModal(null)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">📄 {t('طلب وثيقة','Request Document',lang)}</div>
          <button className="modal-close" onClick={() => setOpenModal(null)}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">{t('نوع الوثيقة','Document Type',lang)} <span className="req">*</span></label>
            <select className="form-control">
              <option>📋 {t('شهادة عمل','Employment Certificate',lang)}</option>
              <option>💰 {t('شهادة راتب','Salary Certificate',lang)}</option>
              <option>📊 {t('تقرير الأداء السنوي','Annual Performance Report',lang)}</option>
              <option>🏥 {t('خطاب لجهة حكومية','Government Letter',lang)}</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('موجه إلى','Addressed To',lang)}</label>
            <input className="form-control" placeholder={t('اسم الجهة...','Organization name...',lang)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('ملاحظات إضافية','Additional Notes',lang)}</label>
            <textarea className="form-control" rows={2} placeholder={t('أي تفاصيل إضافية...','Any additional details...',lang)}></textarea>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setOpenModal(null)}>{t('إلغاء','Cancel',lang)}</button>
          <button className="btn btn-primary" onClick={() => {
            setOpenModal(null);
            showToast(t('📄 تم إرسال طلب الوثيقة — سيتم الرد خلال 2-3 أيام عمل','📄 Document request submitted — 2-3 business days',lang),'success');
          }}>📤 {t('إرسال الطلب','Submit Request',lang)}</button>
        </div>
      </div>
    </div>
  );

  // ── Toast ────────────────────────────────────────────────────────────────────

  const toastColors: Record<ToastType, string> = { success:'#4ade80', error:'#f87171', warning:'var(--amber)', info:'#60a5fa' };
  const toastIcons: Record<ToastType, string> = { success:'✓', error:'✕', warning:'⚠️', info:'ℹ️' };

  // ── Sidebar nav items ────────────────────────────────────────────────────────

  const navGroups = [
    { label: { ar:'الرئيسية', en:'Main' }, items: [
      { id:'dashboard' as PageId, icon:'🏠', ar:'لوحتي', en:'My Dashboard' },
    ]},
    { label: { ar:'ملفي الشخصي', en:'My Profile' }, items: [
      { id:'profile' as PageId,     icon:'👤', ar:'الملف الشخصي',   en:'My Profile' },
      { id:'performance' as PageId, icon:'📊', ar:'الأداء والتقييم', en:'Performance' },
    ]},
    { label: { ar:'الإجازات والحضور', en:'Leave & Attendance' }, items: [
      { id:'leaves' as PageId,     icon:'🏖️', ar:'إجازاتي',    en:'My Leaves',  badge:1 },
      { id:'attendance' as PageId, icon:'🕐', ar:'سجل الحضور', en:'Attendance' },
    ]},
    { label: { ar:'الرواتب والمزايا', en:'Payroll & Benefits' }, items: [
      { id:'payroll' as PageId,  icon:'💰', ar:'رواتبي', en:'My Payroll' },
      { id:'benefits' as PageId, icon:'🎁', ar:'المزايا', en:'Benefits' },
    ]},
    { label: { ar:'الوثائق والطلبات', en:'Documents & Requests' }, items: [
      { id:'requests' as PageId,      icon:'📋', ar:'طلباتي',     en:'My Requests',   badge:2 },
      { id:'notifications' as PageId, icon:'🔔', ar:'الإشعارات',  en:'Notifications', badge:unreadCount || undefined },
    ]},
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  const pageMap: Record<PageId, React.ReactNode> = {
    dashboard:     <PageDashboard />,
    profile:       <PageProfile />,
    performance:   <PagePerformance />,
    leaves:        <PageLeaves />,
    attendance:    <PageAttendance />,
    payroll:       <PagePayroll />,
    benefits:      <PageBenefits />,
    requests:      <PageRequests />,
    notifications: <PageNotifications />,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS_STYLES }} />

      {/* Toast */}
      <div id="toast" style={{ display: toast.visible ? 'block' : 'none' }}>
        <div id="toast-inner" style={{ borderColor: toastColors[toast.type] }}>
          <span style={{ fontSize: 16 }}>{toastIcons[toast.type]}</span>
          <span>{toast.msg}</span>
        </div>
      </div>

      {/* Modals */}
      <ModalLeaveReq />
      <ModalEditProfile />
      <ModalPayslip />
      <ModalCert />

      {/* Sidebar overlay */}
      <div className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)}></div>

      {/* Shell */}
      <div className="shell">
        {/* Sidebar */}
        <aside className={`sidebar${sidebarOpen ? ' open' : ''}`} id="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">👤</div>
            <div>
              <div className="logo-text-main">{t('بوابة الموظف','Employee Portal',lang)}</div>
              <div className="logo-text-sub">{t('العيادة الرقمية','Digital Clinic',lang)}</div>
            </div>
          </div>

          <div style={{ padding: '10px 10px 0' }}>
            <div className="lang-toggle">
              <button className={`lang-btn${lang==='ar' ? ' active' : ''}`} onClick={() => setLang('ar')}>🇮🇶 AR</button>
              <button className={`lang-btn${lang==='en' ? ' active' : ''}`} onClick={() => setLang('en')}>🇬🇧 EN</button>
            </div>
          </div>

          {navGroups.map(group => (
            <div key={group.label.ar}>
              <div className="nav-group-label">{t(group.label.ar, group.label.en, lang)}</div>
              {group.items.map(item => (
                <div key={item.id} className={`nav-item${activePage===item.id ? ' active' : ''}`} data-page={item.id} onClick={() => navigate(item.id)}>
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-lbl">{t(item.ar, item.en, lang)}</span>
                  {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
                </div>
              ))}
            </div>
          ))}

          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-av">أ</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="user-name">{t('أحمد الحسيني','Ahmed Al-Husseini',lang)}</div>
                <div className="user-role">{t('مهندس برمجيات','Software Engineer',lang)}</div>
              </div>
              <div className="user-dot"></div>
            </div>
          </div>
        </aside>

        {/* Main area */}
        <div className="main-area" id="main-area">
          {pageMap[activePage]}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        {[
          { id:'dashboard' as PageId,      icon:'🏠', ar:'الرئيسية', en:'Home' },
          { id:'leaves' as PageId,         icon:'🏖️', ar:'إجازاتي',  en:'Leave',  badge:1 },
          { id:'performance' as PageId,    icon:'📊', ar:'الأداء',   en:'Perf' },
          { id:'payroll' as PageId,        icon:'💰', ar:'الراتب',   en:'Pay' },
          { id:'notifications' as PageId,  icon:'🔔', ar:'إشعارات',  en:'Alerts', badge:unreadCount || undefined },
        ].map(item => (
          <button key={item.id} className={`bn-item${activePage===item.id ? ' active' : ''}`} onClick={() => navigate(item.id)}>
            <div className="bn-icon-wrap">
              <span className="bn-icon">{item.icon}</span>
              {item.badge ? <span className="bn-badge">{item.badge}</span> : null}
            </div>
            <span className="bn-text">{t(item.ar, item.en, lang)}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

// ─── CSS (move to globals.css for production) ─────────────────────────────────

const CSS_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
:root{
  --bg:#0b0f18;--surface:#111827;--s2:#1a2235;--s3:#222e42;--s4:#2a3850;
  --blue:#1a6fba;--blue2:#2e86de;--teal:#0abfbc;
  --green:#2ecc71;--amber:#f6ad55;--red:#e74c3c;--purple:#7c3aed;--pink:#ec4899;
  --text:#e2e8f0;--muted:#64748b;--muted2:#94a3b8;
  --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.11);--border3:rgba(255,255,255,0.16);
  --radius:14px;--rsm:9px;--rxs:6px;
  --sidebar-w:252px;--topbar-h:60px;--bottom-nav-h:64px;
  --shadow:0 4px 24px rgba(0,0,0,0.4);--shadow-lg:0 12px 48px rgba(0,0,0,0.55);
  --safe-bottom:env(safe-area-inset-bottom,0px);
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{scroll-behavior:smooth;height:100%}
body{font-family:'Cairo',sans-serif;background:var(--bg);color:var(--text);min-height:100%;overflow-x:hidden}
[dir="rtl"]{direction:rtl}[dir="ltr"]{direction:ltr}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--s3);border-radius:20px}
img{max-width:100%}
button{cursor:pointer;font-family:'Cairo',sans-serif;border:none}
input,select,textarea{font-family:'Cairo',sans-serif}
.shell{display:flex;height:100vh;overflow:hidden}
.main-area{flex:1;overflow-y:auto;overflow-x:hidden;display:flex;flex-direction:column;min-width:0}
.sidebar{width:var(--sidebar-w);min-width:var(--sidebar-w);background:var(--surface);border-inline-end:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden;z-index:200;flex-shrink:0;transition:transform .3s ease,width .3s ease}
.sidebar-logo{padding:18px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:11px}
.logo-mark{width:40px;height:40px;min-width:40px;background:linear-gradient(135deg,var(--purple),var(--blue));border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:19px;box-shadow:0 4px 14px rgba(124,58,237,0.4)}
.logo-text-main{font-size:14.5px;font-weight:800;color:var(--text);line-height:1.2}
.logo-text-sub{font-size:10.5px;color:var(--muted2);margin-top:2px}
.nav-group-label{padding:13px 16px 5px;font-size:9.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1.6px}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 14px;margin:1px 7px;border-radius:var(--rsm);cursor:pointer;font-size:13px;font-weight:600;color:var(--muted2);transition:all .17s;white-space:nowrap;position:relative}
.nav-item:hover{background:var(--s2);color:var(--text)}
.nav-item.active{background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(26,111,186,0.07));color:#a78bfa;border:1px solid rgba(124,58,237,0.22)}
.nav-item.active::before{content:'';position:absolute;inset-inline-end:calc(-7px - 1px);top:50%;transform:translateY(-50%);width:3px;height:18px;background:linear-gradient(180deg,var(--purple),var(--blue));border-radius:3px 0 0 3px}
[dir="ltr"] .nav-item.active::before{inset-inline-end:auto;inset-inline-start:calc(-7px - 1px);border-radius:0 3px 3px 0}
.nav-icon{font-size:16px;flex-shrink:0;width:21px;text-align:center}
.nav-lbl{flex:1;min-width:0}
.nav-badge{background:var(--red);color:#fff;font-size:9.5px;font-weight:800;padding:2px 6px;border-radius:20px}
.sidebar-footer{margin-top:auto;padding:12px 12px 16px;border-top:1px solid var(--border)}
.user-card{display:flex;align-items:center;gap:9px;padding:9px 11px;background:var(--s2);border-radius:var(--rsm);border:1px solid var(--border)}
.user-av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--blue));display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;flex-shrink:0;color:#fff}
.user-name{font-size:12px;font-weight:700;color:var(--text)}
.user-role{font-size:10px;color:var(--muted2)}
.user-dot{width:7px;height:7px;border-radius:50%;background:var(--green);margin-inline-start:auto;flex-shrink:0;box-shadow:0 0 5px var(--green)}
.lang-toggle{display:flex;gap:4px;margin-bottom:10px;background:var(--s3);padding:3px;border-radius:var(--rxs)}
.lang-btn{flex:1;padding:6px;border-radius:4px;font-size:11.5px;font-weight:700;background:none;color:var(--muted2);transition:all .18s}
.lang-btn.active{background:var(--surface);color:var(--text)}
.topbar{height:var(--topbar-h);background:rgba(17,24,39,0.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 18px;gap:12px;position:sticky;top:0;z-index:100;flex-shrink:0}
.topbar-menu-btn{width:38px;height:38px;border-radius:var(--rsm);background:var(--s2);border:1px solid var(--border2);color:var(--text);font-size:18px;display:none;align-items:center;justify-content:center;flex-shrink:0}
.topbar-title-wrap{flex:1;min-width:0}
.topbar-title{font-size:16px;font-weight:800;color:var(--text);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.topbar-sub{font-size:11px;color:var(--muted2);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.topbar-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;height:calc(var(--bottom-nav-h) + var(--safe-bottom));padding-bottom:var(--safe-bottom);background:var(--surface);border-top:1px solid var(--border);z-index:300;justify-content:space-around;align-items:center}
.bn-item{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 8px;border-radius:var(--rsm);cursor:pointer;font-size:9.5px;font-weight:700;color:var(--muted);background:none;transition:color .18s;flex:1;min-width:0}
.bn-item.active{color:#a78bfa}
.bn-icon{font-size:21px;line-height:1}
.bn-badge{position:absolute;top:-4px;inset-inline-end:-4px;background:var(--red);color:#fff;font-size:8px;font-weight:800;padding:1px 4px;border-radius:10px}
.bn-icon-wrap{position:relative;display:inline-block}
.content{padding:20px 18px;flex:1}
.sidebar-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:150;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}
.sidebar-overlay.open{display:block}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 16px;border-radius:var(--rsm);font-size:13px;font-weight:700;transition:all .17s;white-space:nowrap;line-height:1;min-height:38px}
.btn-primary{background:linear-gradient(135deg,var(--purple),var(--blue));color:#fff;box-shadow:0 4px 14px rgba(124,58,237,0.3)}
.btn-primary:hover{opacity:.9;transform:translateY(-1px)}
.btn-outline{background:transparent;border:1px solid var(--border3);color:var(--text)}
.btn-outline:hover{background:var(--s2)}
.btn-ghost{background:var(--s2);color:var(--muted2);border:1px solid var(--border)}
.btn-ghost:hover{background:var(--s3);color:var(--text)}
.btn-success{background:rgba(46,204,113,0.14);border:1px solid rgba(46,204,113,0.28);color:#4ade80}
.btn-danger{background:rgba(231,76,60,0.12);border:1px solid rgba(231,76,60,0.24);color:#f87171}
.btn-amber{background:rgba(246,173,85,0.12);border:1px solid rgba(246,173,85,0.24);color:var(--amber)}
.btn-purple{background:rgba(124,58,237,0.14);border:1px solid rgba(124,58,237,0.28);color:#a78bfa}
.btn-sm{padding:6px 12px;font-size:12px;min-height:32px}
.btn-xs{padding:5px 9px;font-size:11px;min-height:28px}
.btn-lg{padding:12px 24px;font-size:15px;min-height:46px}
.btn-block{width:100%}
.btn-icon{padding:8px;width:38px;height:38px}
.card{background:var(--surface);border-radius:var(--radius);border:1px solid var(--border);overflow:hidden}
.card-header{padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.card-title{font-size:13.5px;font-weight:800;color:var(--text)}
.card-subtitle{font-size:11px;color:var(--muted2);margin-top:2px}
.card-body{padding:18px}
.card-footer{padding:12px 18px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.stat-card{background:var(--surface);border-radius:var(--radius);border:1px solid var(--border);padding:18px;position:relative;overflow:hidden;transition:border-color .2s,box-shadow .2s}
.stat-card:hover{border-color:var(--border2);box-shadow:0 6px 24px rgba(0,0,0,0.28)}
.stat-card::after{content:'';position:absolute;top:-28px;inset-inline-end:-28px;width:90px;height:90px;border-radius:50%;opacity:.06}
.stat-card.cb::after{background:var(--blue)}.stat-card.cg::after{background:var(--green)}.stat-card.ca::after{background:var(--amber)}.stat-card.cp::after{background:var(--purple)}.stat-card.ct::after{background:var(--teal)}.stat-card.cr::after{background:var(--red)}
.stat-icon{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:19px;margin-bottom:12px}
.ib{background:rgba(26,111,186,0.15)}.ig{background:rgba(46,204,113,0.15)}.ia{background:rgba(246,173,85,0.15)}.ip{background:rgba(124,58,237,0.15)}.it{background:rgba(10,191,188,0.15)}.ir{background:rgba(231,76,60,0.15)}
.stat-val{font-size:26px;font-weight:900;color:var(--text);line-height:1}
.stat-lbl{font-size:11.5px;color:var(--muted2);margin-top:5px;font-weight:500}
.stat-chg{display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:700;margin-top:9px;padding:3px 8px;border-radius:20px}
.sup{background:rgba(46,204,113,0.11);color:#4ade80}.sdn{background:rgba(231,76,60,0.11);color:#f87171}.snu{background:rgba(100,116,139,0.14);color:var(--muted2)}
.badge{display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:700;line-height:1.4;white-space:nowrap}
.b-blue{background:rgba(26,111,186,0.17);color:#60a5fa;border:1px solid rgba(26,111,186,0.23)}
.b-green{background:rgba(46,204,113,0.14);color:#4ade80;border:1px solid rgba(46,204,113,0.23)}
.b-amber{background:rgba(246,173,85,0.14);color:var(--amber);border:1px solid rgba(246,173,85,0.23)}
.b-red{background:rgba(231,76,60,0.14);color:#f87171;border:1px solid rgba(231,76,60,0.23)}
.b-purple{background:rgba(124,58,237,0.14);color:#a78bfa;border:1px solid rgba(124,58,237,0.23)}
.b-teal{background:rgba(10,191,188,0.14);color:var(--teal);border:1px solid rgba(10,191,188,0.23)}
.b-gray{background:rgba(100,116,139,0.14);color:var(--muted2);border:1px solid rgba(100,116,139,0.18)}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.g23{display:grid;grid-template-columns:2fr 3fr;gap:14px}
.g32{display:grid;grid-template-columns:3fr 2fr;gap:14px}
.mb4{margin-bottom:16px}.mb6{margin-bottom:22px}
.form-group{margin-bottom:14px}
.form-label{display:block;font-size:11px;font-weight:700;color:var(--muted2);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
.req{color:var(--red);margin-inline-start:2px}
.form-control{width:100%;padding:10px 13px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--rsm);color:var(--text);font-size:13px;transition:border-color .18s,box-shadow .18s;appearance:none;-webkit-appearance:none}
.form-control:focus{outline:none;border-color:var(--purple);box-shadow:0 0 0 3px rgba(124,58,237,0.14)}
.form-control::placeholder{color:var(--muted)}
select.form-control option{background:var(--surface)}
textarea.form-control{resize:vertical;min-height:90px;line-height:1.6}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.form-hint{font-size:10.5px;color:var(--muted);margin-top:4px}
.form-divider{height:1px;background:var(--border);margin:16px 0}
.form-section{font-size:12.5px;font-weight:800;color:var(--muted2);margin-bottom:12px;display:flex;align-items:center;gap:7px}
.table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
.dtable{width:100%;border-collapse:collapse;font-size:12.5px;min-width:400px}
.dtable thead th{padding:10px 14px;text-align:inherit;font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.7px;background:var(--s2);border-bottom:1px solid var(--border);white-space:nowrap}
.dtable tbody td{padding:12px 14px;border-bottom:1px solid var(--border);color:var(--text);font-weight:500}
.dtable tbody tr:last-child td{border-bottom:none}
.dtable tbody tr:hover td{background:rgba(255,255,255,0.018)}
.prog{height:6px;background:var(--s3);border-radius:20px;overflow:hidden}
.prog-fill{height:100%;border-radius:20px;transition:width .4s ease}
.prog-lg{height:10px}
.alert{border-radius:var(--rsm);padding:11px 14px;font-size:12.5px;font-weight:600;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.alert-warning{background:rgba(246,173,85,0.1);border:1px solid rgba(246,173,85,0.22);color:var(--amber)}
.alert-info{background:rgba(26,111,186,0.1);border:1px solid rgba(26,111,186,0.22);color:#60a5fa}
.alert-success{background:rgba(46,204,113,0.1);border:1px solid rgba(46,204,113,0.22);color:#4ade80}
.alert-danger{background:rgba(231,76,60,0.1);border:1px solid rgba(231,76,60,0.22);color:#f87171}
.divider{height:1px;background:var(--border);margin:12px 0}
.chart-bars{display:flex;align-items:flex-end;gap:6px;height:120px;padding:0 4px}
.cbar{flex:1;border-radius:5px 5px 0 0;position:relative;cursor:pointer;transition:opacity .17s;min-width:0}
.cbar:hover{opacity:.8}
.ctip{position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:var(--s4);border:1px solid var(--border2);border-radius:var(--rxs);padding:4px 8px;font-size:10px;font-weight:700;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .18s}
.cbar:hover .ctip{opacity:1}
.chart-labels{display:flex;gap:6px;padding:5px 4px 0;font-size:10px;color:var(--muted);font-weight:600}
.chart-labels span{flex:1;text-align:center;min-width:0;overflow:hidden;white-space:nowrap}
.tl{position:relative;padding-inline-start:18px}
.tl::before{content:'';position:absolute;inset-inline-start:5px;top:8px;bottom:8px;width:2px;background:var(--border2);border-radius:2px}
.tl-item{position:relative;margin-bottom:16px;padding-inline-start:18px}
.tl-dot{position:absolute;inset-inline-start:-4px;top:4px;width:10px;height:10px;border-radius:50%;border:2px solid var(--surface)}
.tl-t{font-size:12.5px;font-weight:700;color:var(--text)}
.tl-s{font-size:11px;color:var(--muted2);margin-top:2px;line-height:1.5}
.modal-backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:1000;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);align-items:center;justify-content:center;padding:16px}
.modal-backdrop.open{display:flex}
.modal{background:var(--surface);border-radius:var(--radius);border:1px solid var(--border2);width:100%;max-width:500px;max-height:90vh;overflow-y:auto;box-shadow:var(--shadow-lg);animation:modalIn .22s ease}
.modal-lg{max-width:700px}
@keyframes modalIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}
.modal-header{padding:16px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:10px;position:sticky;top:0;background:var(--surface);z-index:1}
.modal-title{font-size:14.5px;font-weight:800;color:var(--text)}
.modal-close{width:32px;height:32px;border-radius:var(--rxs);background:var(--s2);border:1px solid var(--border);color:var(--muted2);font-size:16px;display:flex;align-items:center;justify-content:center}
.modal-close:hover{color:var(--text);background:var(--s3)}
.modal-body{padding:18px}
.modal-footer{padding:14px 18px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}
#toast{position:fixed;bottom:calc(var(--bottom-nav-h) + 12px + var(--safe-bottom));inset-inline-start:16px;z-index:9999;pointer-events:none}
#toast-inner{background:var(--s4);border:1px solid var(--border2);border-radius:var(--rsm);padding:12px 16px;font-size:12.5px;font-weight:700;color:var(--text);box-shadow:var(--shadow-lg);display:flex;align-items:center;gap:9px;min-width:240px;max-width:90vw}
.pulse{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--green);position:relative}
.pulse::after{content:'';position:absolute;inset:-3px;border-radius:50%;border:2px solid var(--green);opacity:0;animation:pr 1.8s ease infinite}
@keyframes pr{0%{transform:scale(.8);opacity:.7}100%{transform:scale(2.2);opacity:0}}
.frow{display:flex;align-items:center}
.fbetween{display:flex;align-items:center;justify-content:space-between}
.gap2{gap:8px}.gap3{gap:12px}.gap4{gap:16px}
.fw8{font-weight:800}.fs12{font-size:12px}.fs11{font-size:11px}
.c-muted{color:var(--muted2)}.c-green{color:#4ade80}.c-blue{color:#60a5fa}.c-amber{color:var(--amber)}.c-red{color:#f87171}.c-purple{color:#a78bfa}
.profile-avatar-lg{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--blue));display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:900;color:#fff;flex-shrink:0;border:3px solid rgba(124,58,237,0.35);box-shadow:0 0 0 6px rgba(124,58,237,0.08);position:relative}
.profile-avatar-lg .av-badge{position:absolute;bottom:2px;inset-inline-end:2px;width:18px;height:18px;border-radius:50%;background:var(--green);border:2px solid var(--surface);display:flex;align-items:center;justify-content:center;font-size:8px}
.profile-cover{background:linear-gradient(135deg,rgba(124,58,237,0.15),rgba(26,111,186,0.1));border-radius:var(--radius) var(--radius) 0 0;height:80px;position:relative;overflow:hidden}
.payslip{background:#fff;color:#1e293b;border-radius:11px;padding:22px;font-family:'Cairo',sans-serif}
.ps-hd{display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;margin-bottom:16px;border-bottom:3px solid #7c3aed;flex-wrap:wrap;gap:8px}
.ps-logo{font-size:15px;font-weight:900;color:#7c3aed}
.ps-badge{background:#7c3aed;color:#fff;padding:4px 12px;border-radius:5px;font-size:11px;font-weight:700}
.ps-emp{background:#f8fafc;border-radius:7px;padding:12px 14px;margin-bottom:14px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.ps-field .fl{font-size:9.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px}
.ps-field .fv{font-size:12px;font-weight:700;color:#1e293b}
.ps-rows{border:1px solid #e2e8f0;border-radius:7px;overflow:hidden;margin-bottom:12px}
.ps-row{display:flex;justify-content:space-between;padding:9px 12px;border-bottom:1px solid #f1f5f9;font-size:12px}
.ps-row:last-child{border-bottom:none}
.ps-row .pl{color:#475569;font-weight:500}.ps-row .pv{font-weight:700}
.ps-row.add .pv{color:#16a34a}.ps-row.ded .pv{color:#dc2626}
.ps-net{background:#7c3aed;border-radius:7px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;color:#fff;flex-wrap:wrap;gap:6px}
.ps-net .nl{font-size:13px;font-weight:700}.ps-net .nv{font-size:18px;font-weight:900}
.ps-ft{margin-top:12px;padding-top:10px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:9.5px;color:#94a3b8;flex-wrap:wrap;gap:5px}
.cal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.cal-day-name{font-size:9px;font-weight:700;color:var(--muted);text-align:center;padding:4px}
.cal-day{aspect-ratio:1;border-radius:var(--rxs);display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:600;color:var(--muted2);cursor:default;transition:all .15s}
.cal-day.today{background:rgba(124,58,237,0.2);color:#a78bfa;font-weight:800}
.cal-day.leave{background:rgba(246,173,85,0.18);color:var(--amber);border:1px solid rgba(246,173,85,0.3)}
.cal-day.approved{background:rgba(46,204,113,0.18);color:#4ade80;border:1px solid rgba(46,204,113,0.3)}
.cal-day.other-month{opacity:.3}
.notif-item{display:flex;align-items:flex-start;gap:11px;padding:13px 0;border-bottom:1px solid var(--border)}
.notif-item:last-child{border-bottom:none}
.notif-icon{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.notif-text{flex:1;min-width:0}
.notif-title{font-size:12.5px;font-weight:700;color:var(--text)}
.notif-sub{font-size:11px;color:var(--muted2);margin-top:2px}
.notif-time{font-size:10px;color:var(--muted);white-space:nowrap;flex-shrink:0}
.notif-dot{width:7px;height:7px;border-radius:50%;background:var(--purple);margin-top:5px;flex-shrink:0}
.leave-req-card{background:var(--s2);border:1px solid var(--border);border-radius:var(--rsm);padding:14px;margin-bottom:10px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.leave-req-icon{font-size:22px;flex-shrink:0}
.leave-req-info{flex:1;min-width:0}
.leave-req-title{font-size:12.5px;font-weight:700;color:var(--text)}
.leave-req-sub{font-size:11px;color:var(--muted2);margin-top:2px}
.page{display:none;flex-direction:column;min-height:100%}
.page.active{display:flex}
@media(max-width:900px){
  .shell{flex-direction:column}
  .sidebar{position:fixed;top:0;inset-inline-start:0;height:100vh;z-index:200;transform:translateX(100%);border-inline-end:1px solid var(--border2)}
  [dir="ltr"] .sidebar{transform:translateX(-100%)}
  .sidebar.open{transform:translateX(0)}
  .topbar-menu-btn{display:flex}
  .bottom-nav{display:flex}
  .main-area{padding-bottom:calc(var(--bottom-nav-h) + var(--safe-bottom))}
  #toast{bottom:calc(var(--bottom-nav-h) + 12px + var(--safe-bottom))}
  .g4{grid-template-columns:1fr 1fr}
  .g3{grid-template-columns:1fr 1fr}
  .g2,.g23,.g32{grid-template-columns:1fr}
  .form-row{grid-template-columns:1fr}
  .ps-emp{grid-template-columns:1fr 1fr}
  .content{padding:14px}
  .topbar{padding:0 14px;height:56px}
  .stat-val{font-size:22px}
}
@media(max-width:540px){
  .g4,.g3{grid-template-columns:1fr 1fr}
  .topbar-actions .btn-sm:not(.keep){display:none}
  .card-header{flex-direction:column;align-items:flex-start}
}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.page.active .content>*{animation:fadeUp .25s ease both}
.page.active .content>*:nth-child(2){animation-delay:.04s}
.page.active .content>*:nth-child(3){animation-delay:.08s}
.page.active .content>*:nth-child(4){animation-delay:.12s}
.stars{color:var(--amber);letter-spacing:1px;font-size:14px}
.qa-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding:14px}
.qa-btn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 10px;border-radius:var(--rsm);background:var(--s2);border:1px solid var(--border);color:var(--text);cursor:pointer;transition:all .17s;text-align:center}
.qa-btn:hover{background:var(--s3);border-color:var(--border2);transform:translateY(-1px)}
.qa-icon{font-size:24px}
.qa-label{font-size:11.5px;font-weight:700}
.sec-div{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);padding:10px 0 5px}
.task-item{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)}
.task-item:last-child{border-bottom:none}
.task-check{width:18px;height:18px;border-radius:4px;border:2px solid var(--border2);background:var(--s2);display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;transition:all .15s;font-size:11px}
.task-check.done{background:var(--purple);border-color:var(--purple);color:#fff}
.task-text{flex:1;font-size:12.5px;font-weight:600;color:var(--text)}
.task-text.done{text-decoration:line-through;color:var(--muted)}
.benefit-item{display:flex;align-items:center;gap:12px;padding:12px;background:var(--s2);border-radius:var(--rsm);border:1px solid var(--border);margin-bottom:8px}
.benefit-icon{font-size:20px;flex-shrink:0}
.benefit-info{flex:1;min-width:0}
.benefit-name{font-size:12.5px;font-weight:700;color:var(--text)}
.benefit-val{font-size:11px;color:var(--muted2);margin-top:2px}
.skill-row{display:flex;flex-direction:column;gap:5px;margin-bottom:12px}
.skill-info{display:flex;justify-content:space-between;font-size:12px}
.skill-name{color:var(--text);font-weight:600}
.skill-pct{font-weight:800}
`;
