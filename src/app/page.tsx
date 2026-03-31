"use client";

import { useState, useEffect, useRef } from "react";

// ─── TYPES & CONFIG ──────────────────────────────────────────────────────────
type Lang = "ar" | "en";
type Page = "home" | "features" | "pricing" | "contact" | "faq";

const C = {
  bg: "#060d18",
  surface: "#0d1b2a",
  surface2: "#111f30",
  border: "rgba(255,255,255,0.07)",
  blue: "#1a6fba",
  blueBright: "#3b9eff",
  teal: "#0fb8a0",
  gold: "#C9A84C",
  goldLight: "#F5E6C0",
  green: "#22c55e",
  text: "#e2e8f0",
  muted: "#64748b",
  white: "#ffffff",
};

// ─── UNIFIED TRANSLATIONS ────────────────────────────────────────────────────
const T = {
  ar: {
    dir: "rtl" as const,
    brand: { name1: "ميدي", name2: "كونكت", full: "ميدكو" },
    nav: { home: "الرئيسية", features: "المميزات", pricing: "الباقات", contact: "الدعم", faq: "الأسئلة", login: "دخول الأطباء" },
    hero: {
      eyebrow: "⚕️ المنظومة الطبية الأشمل في العراق",
      title1: "مستقبل الرعاية",
      title2: "بين يديك",
      subtitle: "نظام متكامل لإدارة عيادتك محلياً، مع ربطك بأفضل الخبرات الطبية العالمية في أمريكا. حلول ذكية للأطباء ورعاية فائقة للمرضى.",
      cta1: "🚀 أدر عيادتك رقمياً",
      cta2: "استشارات أمريكية للمرضى",
    },
    doctors: {
      title: "أدوات متطورة للأطباء",
      items: [
        { icon: "👥", title: "إدارة المرضى", desc: "سجلات رقمية كاملة وتاريخ طبي موحد." },
        { icon: "📅", title: "مواعيد ذكية", desc: "تذكيرات تلقائية عبر واتساب لتقليل الغياب." },
        { icon: "💊", title: "وصفات رقمية", desc: "أرسل الوصفات للمرضى واطبعها بضغطة زر." },
      ]
    },
    patients: {
      title: "للمرضى: خبرة أمريكية في العراق",
      subtitle: "نفتح لك أبواب أفضل المستشفيات في العالم (كليفلاند كلينك، جونز هوبكنز) من قلب بغداد.",
      steps: [
        { icon: "💬", title: "استشارة أونلاين", desc: "فيديو كول مع طبيب أمريكي معتمد." },
        { icon: "✈️", title: "تنسيق السفر", desc: "تأشيرة طبية، طيران، وإقامة كاملة." },
        { icon: "🔄", title: "متابعة محلية", desc: "نكمل معك الرحلة بعد العودة للعراق." },
      ]
    },
    pricing: {
      title: "باقات تناسب الجميع",
      plans: [
        { name: "الأساسية", price: "25,000", period: "/شهر", feat: ["إدارة 50 مريض", "مواعيد واتساب"] },
        { name: "الذهبية", price: "120,000", period: "/شهر", feat: ["مرضى غير محدود", "تقارير مالية", "دعم 24/7"] },
      ],
      currency: "د.ع",
    },
    footer: {
      copy: "© 2026 ميدكو العراق. جميع الحقوق محفوظة.",
      by: "تصميم Dev Code"
    }
  },
  en: {
    dir: "ltr" as const,
    brand: { name1: "Medi", name2: "Connect", full: "Medco" },
    nav: { home: "Home", features: "Features", pricing: "Pricing", contact: "Support", faq: "FAQ", login: "Doctor Login" },
    hero: {
      eyebrow: "⚕️ Iraq's Comprehensive Medical Ecosystem",
      title1: "The Future of Care",
      title2: "In Your Hands",
      subtitle: "Manage your clinic locally with smart tools, and connect to world-class medical expertise in the US. Intelligent solutions for doctors, premium care for patients.",
      cta1: "🚀 Manage Your Clinic",
      cta2: "US Consults for Patients",
    },
    doctors: {
      title: "Advanced Tools for Doctors",
      items: [
        { icon: "👥", title: "Patient Records", desc: "Complete digital records and medical history." },
        { icon: "📅", title: "Smart Scheduling", desc: "Auto WhatsApp reminders to reduce no-shows." },
        { icon: "💊", title: "Digital Prescriptions", desc: "Send and print prescriptions instantly." },
      ]
    },
    patients: {
      title: "For Patients: US Expertise in Iraq",
      subtitle: "Access world-leading hospitals (Cleveland Clinic, Johns Hopkins) from Baghdad.",
      steps: [
        { icon: "💬", title: "Online Consult", desc: "Video call with US board-certified specialists." },
        { icon: "✈️", title: "Travel Support", desc: "Medical visa, flights, and accommodation." },
        { icon: "🔄", title: "Local Follow-up", desc: "Continuing care after you return to Iraq." },
      ]
    },
    pricing: {
      title: "Plans for Every Need",
      plans: [
        { name: "Basic", price: "25,000", period: "/mo", feat: ["50 Patients", "WhatsApp Scheduling"] },
        { name: "Gold", price: "120,000", period: "/mo", feat: ["Unlimited Patients", "Financial Reports", "24/7 Support"] },
      ],
      currency: "IQD",
    },
    footer: {
      copy: "© 2026 Medco Iraq. All rights reserved.",
      by: "Designed by Dev Code"
    }
  }
};

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
function DashboardMockup({ lang }: { lang: Lang }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.5)", maxWidth: 480, width: "100%", direction: "ltr" }}>
      <div style={{ background: "#1a1f2e", padding: "12px 16px", display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
      </div>
      <div style={{ background: "linear-gradient(135deg, #1a6fba, #0f4d8a)", padding: "24px 20px" }}>
        <div style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>Clinic Dashboard</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: 12, borderRadius: 10 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#34d399" }}>1,284</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>Total Patients</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: 12, borderRadius: 10 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#fbbf24" }}>48</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>Today's Appts</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function MedcoUnifiedPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [scrolled, setScrolled] = useState(false);
  const t = T[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fontStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Syne:wght@400;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Cairo','Syne',sans-serif; background: ${C.bg}; color: ${C.text};}
    @keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
    .gradient-text{
      background:linear-gradient(135deg,#60a5fa,#34d399,#a78bfa);
      -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    }
  `;

  const container: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "0 24px" };
  
  const btnPrimary: React.CSSProperties = {
    padding: "14px 28px", borderRadius: 50, fontSize: 15, fontWeight: 800,
    border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.blue}, #2563eb)`,
    color: "#fff", transition: "all .25s", boxShadow: "0 4px 20px rgba(26,111,186,0.4)"
  };

  const btnGold: React.CSSProperties = {
    padding: "14px 28px", borderRadius: 50, fontSize: 15, fontWeight: 800,
    border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.gold}, #8B6914)`,
    color: "#fff", transition: "all .25s", boxShadow: "0 4px 20px rgba(201,168,76,0.3)"
  };

  return (
    <div style={{ direction: t.dir, overflowX: "hidden" }}>
      <style>{fontStyle}</style>

      {/* NAVBAR */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 1000,
        background: scrolled ? "rgba(6,13,24,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        transition: "all .3s",
      }}>
        <div style={{ ...container, display: "flex", alignItems: "center", justifyContent: "space-between", height: 80 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${C.blue}, ${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏥</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.white }}>{t.brand.name1}<span style={{ color: C.blueBright }}>{t.brand.name2}</span></div>
              <div style={{ fontSize: 10, color: C.muted }}>{t.brand.full} Iraq</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} style={{ background: C.surface, color: "#fff", padding: "6px 12px", borderRadius: 20, border: `1px solid ${C.border}`, cursor: "pointer" }}>
              {lang === "ar" ? "EN" : "عربي"}
            </button>
            <button style={{ color: C.white, background: "none", border: "none", fontWeight: 700 }}>{t.nav.login}</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", padding: "100px 0", minHeight: "85vh", display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 30%, rgba(26,111,186,0.15), transparent 70%)" }} />
        <div style={{ ...container, position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 64, alignItems: "center" }}>
            <div>
              <div style={{ background: "rgba(26,111,186,0.1)", color: C.blueBright, padding: "8px 16px", borderRadius: 50, display: "inline-block", fontSize: 12, fontWeight: 700, marginBottom: 24 }}>{t.hero.eyebrow}</div>
              <h1 style={{ fontSize: 62, fontWeight: 900, color: C.white, lineHeight: 1.1, marginBottom: 24 }}>
                {t.hero.title1} <span className="gradient-text">{t.hero.title2}</span>
              </h1>
              <p style={{ fontSize: 18, color: C.muted, lineHeight: 1.8, marginBottom: 40, maxWidth: 540 }}>{t.hero.subtitle}</p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <button style={btnPrimary}>{t.hero.cta1}</button>
                <button style={btnGold}>{t.hero.cta2}</button>
              </div>
            </div>
            <div style={{ animation: "float 6s ease-in-out infinite" }}>
              <DashboardMockup lang={lang} />
            </div>
          </div>
        </div>
      </section>

      {/* DOCTORS SECTION */}
      <section style={{ padding: "100px 0", background: C.surface }}>
        <div style={container}>
          <h2 style={{ fontSize: 42, fontWeight: 900, color: C.white, textAlign: "center", marginBottom: 60 }}>{t.doctors.title}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {t.doctors.items.map((it, i) => (
              <div key={i} style={{ background: C.bg, padding: 32, borderRadius: 24, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 40, marginBottom: 20 }}>{it.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 12 }}>{it.title}</h3>
                <p style={{ color: C.muted, lineHeight: 1.6 }}>{it.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PATIENTS SECTION */}
      <section style={{ padding: "100px 0" }}>
        <div style={container}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: 42, fontWeight: 900, color: C.white }}>{t.patients.title}</h2>
            <p style={{ color: C.muted, marginTop: 16 }}>{t.patients.subtitle}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {t.patients.steps.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ width: 80, height: 80, background: C.surface, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 24px" }}>{s.icon}</div>
                <h3 style={{ color: C.gold, fontSize: 18, fontWeight: 800, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ color: C.muted, fontSize: 14 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "100px 0", background: C.surface2 }}>
        <div style={container}>
          <h2 style={{ fontSize: 42, fontWeight: 900, color: C.white, textAlign: "center", marginBottom: 60 }}>{t.pricing.title}</h2>
          <div style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
            {t.pricing.plans.map((p, i) => (
              <div key={i} style={{ background: C.surface, padding: 40, borderRadius: 32, border: `2px solid ${i === 1 ? C.blue : C.border}`, width: "100%", maxWidth: 350 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 8 }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                  <span style={{ fontSize: 14, color: C.muted }}>{t.pricing.currency}</span>
                  <span style={{ fontSize: 36, fontWeight: 900 }}>{p.price}</span>
                  <span style={{ fontSize: 14, color: C.muted }}>{p.period}</span>
                </div>
                <ul style={{ listStyle: "none", marginBottom: 32 }}>
                  {p.feat.map((f, j) => (
                    <li key={j} style={{ padding: "8px 0", display: "flex", gap: 10, color: C.text, fontSize: 13 }}>
                      <span style={{ color: C.green }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button style={{ ...btnPrimary, width: "100%", background: i === 1 ? btnPrimary.background : "transparent", border: i === 1 ? "none" : `1px solid ${C.border}` }}>Choose Plan</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "60px 0 30px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ ...container, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>🏥</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.white }}>{t.brand.full}</div>
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>{t.footer.copy} | {t.footer.by}</div>
        </div>
      </footer>
    </div>
  );
}
