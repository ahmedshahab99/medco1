"use client";

import { useState } from "react";

type Lang = "ar" | "en";

const T = {
  ar: {
    dir: "rtl" as const,
    topbar: { email: "info@digitalclinic.iq", phone: "+964 770 281 4484", location: "العراق، بغداد" },
    brand: "العيادة الرقمية",
    badge: "🚀 إنشاء حساب مجاني",
    title: "ابدأ رحلتك",
    titleGradient: "مع العيادة الرقمية",
    subtitle: "انضم إلى مئات العيادات في العراق وأدر ممارستك بكفاءة وذكاء.",
    fields: {
      fullName: "الاسم الكامل",
      fullNamePh: "اسمك الثلاثي",
      email: "البريد الإلكتروني",
      emailPh: "example@email.com",
      phone: "رقم الهاتف",
      phonePh: "07xxxxxxxxx",
      password: "كلمة المرور",
      passwordPh: "8 أحرف على الأقل",
      confirmPassword: "تأكيد كلمة المرور",
      confirmPasswordPh: "أعد إدخال كلمة المرور",
    },
    terms: "أوافق على",
    termsLink: "الشروط والأحكام",
    and: "و",
    privacyLink: "سياسة الخصوصية",
    submit: "إنشاء الحساب مجاناً",
    hasAccount: "لديك حساب بالفعل؟",
    login: "تسجيل الدخول",
    trust: [
      { icon: "💳", text: "لا حاجة لبطاقة ائتمان" },
      { icon: "🔒", text: "بيانات آمنة ومشفرة" },
      { icon: "⚡", text: "جاهز للبدء الفوري" },
      { icon: "📞", text: "دعم 24/7" },
    ],
    perks: [
      { icon: "👥", title: "إدارة المرضى", desc: "سجلات كاملة وتاريخ طبي" },
      { icon: "📅", title: "مواعيد ذكية", desc: "تذكيرات تلقائية عبر واتساب" },
      { icon: "💰", title: "إدارة مالية", desc: "تقارير وفواتير متكاملة" },
    ],
    errors: {
      fullNameRequired: "يرجى إدخال الاسم الكامل",
      emailRequired: "يرجى إدخال البريد الإلكتروني",
      emailInvalid: "البريد الإلكتروني غير صحيح",
      phoneRequired: "يرجى إدخال رقم الهاتف",
      phoneInvalid: "رقم الهاتف يجب أن يبدأ بـ 07",
      passwordRequired: "يرجى إدخال كلمة المرور",
      passwordWeak: "يجب أن تكون 8 أحرف على الأقل",
      confirmRequired: "يرجى تأكيد كلمة المرور",
      confirmMismatch: "كلمة المرور غير متطابقة",
      termsRequired: "يجب الموافقة على الشروط والأحكام",
    },
    success: "✅ تم إنشاء حسابك بنجاح! سيتواصل معك فريقنا قريباً.",
    strengthLabels: ["ضعيفة جداً", "ضعيفة", "متوسطة", "قوية", "قوية جداً"],
  },
  en: {
    dir: "ltr" as const,
    topbar: { email: "info@digitalclinic.iq", phone: "+964 770 281 4484", location: "Baghdad, Iraq" },
    brand: "Digital Clinic",
    badge: "🚀 Create Free Account",
    title: "Start Your Journey",
    titleGradient: "with Digital Clinic",
    subtitle: "Join hundreds of clinics across Iraq and manage your practice with efficiency and intelligence.",
    fields: {
      fullName: "Full Name",
      fullNamePh: "Your full name",
      email: "Email Address",
      emailPh: "example@email.com",
      phone: "Phone Number",
      phonePh: "07xxxxxxxxx",
      password: "Password",
      passwordPh: "At least 8 characters",
      confirmPassword: "Confirm Password",
      confirmPasswordPh: "Re-enter your password",
    },
    terms: "I agree to the",
    termsLink: "Terms & Conditions",
    and: "and",
    privacyLink: "Privacy Policy",
    submit: "Create Free Account",
    hasAccount: "Already have an account?",
    login: "Sign In",
    trust: [
      { icon: "💳", text: "No credit card required" },
      { icon: "🔒", text: "Secure & encrypted data" },
      { icon: "⚡", text: "Start instantly" },
      { icon: "📞", text: "24/7 support" },
    ],
    perks: [
      { icon: "👥", title: "Patient Management", desc: "Complete records & history" },
      { icon: "📅", title: "Smart Scheduling", desc: "Auto WhatsApp reminders" },
      { icon: "💰", title: "Financial Tools", desc: "Reports & invoices" },
    ],
    errors: {
      fullNameRequired: "Please enter your full name",
      emailRequired: "Please enter your email address",
      emailInvalid: "Please enter a valid email address",
      phoneRequired: "Please enter your phone number",
      phoneInvalid: "Phone number must start with 07",
      passwordRequired: "Please enter a password",
      passwordWeak: "Password must be at least 8 characters",
      confirmRequired: "Please confirm your password",
      confirmMismatch: "Passwords do not match",
      termsRequired: "You must agree to the terms and conditions",
    },
    success: "✅ Your account has been created successfully! Our team will contact you soon.",
    strengthLabels: ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"],
  },
};

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export default function DigitalClinicSignup() {
  const [lang, setLang] = useState<Lang>("ar");
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = T[lang];
  const isRtl = lang === "ar";
  const strength = getPasswordStrength(form.password);
  const strengthColors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];
  const strengthColor = form.password ? strengthColors[Math.min(strength - 1, 4)] : "transparent";

  const fontStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Syne:wght@400;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Cairo','Syne',sans-serif;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(26,111,186,0.4)}50%{box-shadow:0 0 60px rgba(26,111,186,0.8)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fade-up{animation:fadeUp .6s ease forwards;}
    .float-anim{animation:float 4s ease-in-out infinite;}
    .gradient-text{
      background:linear-gradient(135deg,#60a5fa,#34d399,#a78bfa);
      background-size:200% 200%;
      animation:gradShift 4s ease infinite;
      -webkit-background-clip:text;
      -webkit-text-fill-color:transparent;
      background-clip:text;
    }
    input{outline:none;}
    button{cursor:pointer;font-family:'Cairo','Syne',sans-serif;}
    ::-webkit-scrollbar{width:6px;}
    ::-webkit-scrollbar-track{background:#0d1b2a;}
    ::-webkit-scrollbar-thumb{background:#1a6fba;border-radius:3px;}
    .btn-shine{position:relative;overflow:hidden;}
    .btn-shine::after{content:'';position:absolute;top:-50%;left:-60%;width:40%;height:200%;background:rgba(255,255,255,0.15);transform:skewX(-20deg);transition:left .4s;}
    .btn-shine:hover::after{left:120%;}
    .input-wrap:focus-within{border-color:#1a6fba !important;box-shadow:0 0 0 3px rgba(26,111,186,0.15) !important;}
    @media(max-width:900px){
      .signup-grid{grid-template-columns:1fr!important;}
      .signup-visual{display:none!important;}
    }
  `;

  const C = {
    bg: "#060d18",
    surface: "#0d1b2a",
    surface2: "#111f30",
    border: "rgba(255,255,255,0.07)",
    blue: "#1a6fba",
    blueBright: "#3b9eff",
    teal: "#0fb8a0",
    gold: "#f6ad55",
    green: "#22c55e",
    text: "#e2e8f0",
    muted: "#64748b",
    white: "#ffffff",
    red: "#ef4444",
  };

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = t.errors.fullNameRequired;
    if (!form.email.trim()) e.email = t.errors.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t.errors.emailInvalid;
    if (!form.phone.trim()) e.phone = t.errors.phoneRequired;
    else if (!/^07/.test(form.phone)) e.phone = t.errors.phoneInvalid;
    if (!form.password.trim()) e.password = t.errors.passwordRequired;
    else if (form.password.length < 8) e.password = t.errors.passwordWeak;
    if (!form.confirmPassword.trim()) e.confirmPassword = t.errors.confirmRequired;
    else if (form.password !== form.confirmPassword) e.confirmPassword = t.errors.confirmMismatch;
    if (!agreed) e.terms = t.errors.termsRequired;
    return e;
  };

  const handleSubmit = async () => {
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setSubmitted(true);
  };

  const container: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "0 24px" };

  const inputWrap = (hasError: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center",
    background: C.surface2,
    border: `1px solid ${hasError ? C.red : C.border}`,
    borderRadius: 14, overflow: "hidden", transition: "all .2s",
  });

  const inputStyle: React.CSSProperties = {
    flex: 1, padding: "13px 14px 13px 0",
    background: "transparent", border: "none",
    color: C.text, fontSize: 14,
    fontFamily: "'Cairo','Syne',sans-serif",
    direction: t.dir,
  };

  const iconStyle: React.CSSProperties = {
    padding: "0 14px", fontSize: 16, color: C.muted, flexShrink: 0,
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 7,
  };

  const errorStyle: React.CSSProperties = {
    fontSize: 12, color: C.red, marginTop: 5, display: "flex", alignItems: "center", gap: 4,
  };

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Cairo','Syne',sans-serif", direction: t.dir, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{fontStyle}</style>

      {/* ── TOPBAR ── */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "8px 0", fontSize: 12 }}>
        <div style={{ ...container, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center", color: C.muted }}>
            <span>📧 {t.topbar.email}</span>
            <span>📞 {t.topbar.phone}</span>
            <span>📍 {t.topbar.location}</span>
          </div>
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            style={{ background: "rgba(26,111,186,0.15)", border: `1px solid ${C.blue}`, color: C.blue, borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, fontFamily: "'Cairo','Syne',sans-serif" }}
          >
            {lang === "ar" ? "English" : "عربي"}
          </button>
        </div>
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(6,13,24,0.95)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ ...container, display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${C.blue},${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, animation: "glow 3s ease-in-out infinite" }}>🏥</div>
            <span style={{ fontSize: 18, fontWeight: 900, color: C.white }}>{t.brand}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 13, color: C.muted }}>{t.hasAccount}</span>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: 50, fontSize: 13, fontWeight: 800, border: `2px solid rgba(255,255,255,0.2)`, background: "rgba(255,255,255,0.05)", color: C.white, fontFamily: "'Cairo','Syne',sans-serif" }}>
              {t.login}
            </button>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div style={{ padding: "60px 0 80px" }}>
        <div style={{ ...container }}>
          <div className="signup-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 72, alignItems: "start" }}>

            {/* ── LEFT VISUAL PANEL ── */}
            <div className="signup-visual" style={{ position: "sticky", top: 100 }}>
              <div style={{ position: "absolute", top: 0, left: isRtl ? "auto" : -60, right: isRtl ? -60 : "auto", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, rgba(26,111,186,0.12) 0%, transparent 70%)`, pointerEvents: "none" }} />

              <div className="fade-up">
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(26,111,186,0.15)", border: `1px solid rgba(26,111,186,0.35)`, borderRadius: 50, padding: "6px 18px", fontSize: 13, fontWeight: 700, color: C.blue, marginBottom: 28 }}>
                  {t.badge}
                </div>

                <h1 style={{ fontSize: 46, fontWeight: 900, color: C.white, lineHeight: 1.15, marginBottom: 20 }}>
                  {t.title}
                  <br />
                  <span className="gradient-text">{t.titleGradient}</span>
                </h1>

                <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, marginBottom: 40 }}>{t.subtitle}</p>

                {/* Feature perks */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 44 }}>
                  {t.perks.map((perk, i) => (
                    <div key={i} className="fade-up" style={{ animationDelay: `${0.15 + i * 0.1}s`, display: "flex", alignItems: "center", gap: 14, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 20px" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg,${C.blue}22,${C.teal}22)`, border: `1px solid rgba(26,111,186,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                        {perk.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: C.white }}>{perk.title}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{perk.desc}</div>
                      </div>
                      <div style={{ marginInlineStart: "auto", color: C.green, fontSize: 18 }}>✓</div>
                    </div>
                  ))}
                </div>

                {/* Trust badges */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {t.trust.map((item, i) => (
                    <div key={i} className="fade-up" style={{ animationDelay: `${0.3 + i * 0.08}s`, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{item.icon}</span>
                      <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT FORM PANEL ── */}
            <div className="fade-up" style={{ animationDelay: "0.1s" }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 28, padding: "44px 40px", boxShadow: "0 40px 100px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)" }}>

                {/* Form Header */}
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg,${C.blue},${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px", boxShadow: `0 8px 24px rgba(26,111,186,0.4)` }}>🏥</div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: C.white, marginBottom: 6 }}>
                    {lang === "ar" ? "إنشاء حساب جديد" : "Create Your Account"}
                  </h2>
                  <p style={{ fontSize: 13, color: C.muted }}>{lang === "ar" ? "مجاناً بدون أي التزامات" : "Free, no commitment required"}</p>
                </div>

                {submitted ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: C.white, marginBottom: 12 }}>
                      {lang === "ar" ? "أهلاً بك في العيادة الرقمية!" : "Welcome to Digital Clinic!"}
                    </h3>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.green, lineHeight: 1.7 }}>{t.success}</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                    {/* Full Name */}
                    <div>
                      <label style={labelStyle}>{t.fields.fullName} <span style={{ color: C.blue }}>*</span></label>
                      <div className="input-wrap" style={inputWrap(!!errors.fullName)}>
                        <span style={iconStyle}>👤</span>
                        <input
                          type="text" value={form.fullName}
                          onChange={e => update("fullName", e.target.value)}
                          placeholder={t.fields.fullNamePh}
                          style={inputStyle}
                        />
                      </div>
                      {errors.fullName && <div style={errorStyle}>⚠️ {errors.fullName}</div>}
                    </div>

                    {/* Email */}
                    <div>
                      <label style={labelStyle}>{t.fields.email} <span style={{ color: C.blue }}>*</span></label>
                      <div className="input-wrap" style={inputWrap(!!errors.email)}>
                        <span style={iconStyle}>📧</span>
                        <input
                          type="email" value={form.email}
                          onChange={e => update("email", e.target.value)}
                          placeholder={t.fields.emailPh}
                          style={inputStyle}
                        />
                      </div>
                      {errors.email && <div style={errorStyle}>⚠️ {errors.email}</div>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label style={labelStyle}>{t.fields.phone} <span style={{ color: C.blue }}>*</span></label>
                      <div className="input-wrap" style={inputWrap(!!errors.phone)}>
                        <span style={iconStyle}>📞</span>
                        <input
                          type="tel" value={form.phone}
                          onChange={e => update("phone", e.target.value)}
                          placeholder={t.fields.phonePh}
                          style={inputStyle}
                        />
                      </div>
                      {errors.phone && <div style={errorStyle}>⚠️ {errors.phone}</div>}
                    </div>

                    {/* Password */}
                    <div>
                      <label style={labelStyle}>{t.fields.password} <span style={{ color: C.blue }}>*</span></label>
                      <div className="input-wrap" style={inputWrap(!!errors.password)}>
                        <span style={iconStyle}>🔑</span>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={e => update("password", e.target.value)}
                          placeholder={t.fields.passwordPh}
                          style={inputStyle}
                        />
                        <button onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", padding: "0 14px", color: C.muted, fontSize: 16 }}>
                          {showPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {/* Strength bar */}
                      {form.password && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= strength ? strengthColor : C.border, transition: "all .3s" }} />
                            ))}
                          </div>
                          <div style={{ fontSize: 11, color: strengthColor, fontWeight: 700 }}>
                            {t.strengthLabels[Math.min(strength - 1, 4)]}
                          </div>
                        </div>
                      )}
                      {errors.password && <div style={errorStyle}>⚠️ {errors.password}</div>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label style={labelStyle}>{t.fields.confirmPassword} <span style={{ color: C.blue }}>*</span></label>
                      <div className="input-wrap" style={inputWrap(!!errors.confirmPassword)}>
                        <span style={iconStyle}>🔒</span>
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={form.confirmPassword}
                          onChange={e => update("confirmPassword", e.target.value)}
                          placeholder={t.fields.confirmPasswordPh}
                          style={inputStyle}
                        />
                        <button onClick={() => setShowConfirm(!showConfirm)} style={{ background: "none", border: "none", padding: "0 14px", color: C.muted, fontSize: 16 }}>
                          {showConfirm ? "🙈" : "👁️"}
                        </button>
                        {form.confirmPassword && form.password === form.confirmPassword && (
                          <span style={{ padding: "0 12px 0 0", color: C.green, fontSize: 18 }}>✓</span>
                        )}
                      </div>
                      {errors.confirmPassword && <div style={errorStyle}>⚠️ {errors.confirmPassword}</div>}
                    </div>

                    {/* Terms checkbox */}
                    <div>
                      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                        <div
                          onClick={() => { setAgreed(!agreed); if (errors.terms) setErrors(prev => ({ ...prev, terms: "" })); }}
                          style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${agreed ? C.blue : errors.terms ? C.red : C.border}`, background: agreed ? C.blue : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, transition: "all .2s", cursor: "pointer" }}
                        >
                          {agreed && <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>}
                        </div>
                        <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
                          {t.terms}{" "}
                          <span style={{ color: C.blue, fontWeight: 700, cursor: "pointer" }}>{t.termsLink}</span>
                          {" "}{t.and}{" "}
                          <span style={{ color: C.blue, fontWeight: 700, cursor: "pointer" }}>{t.privacyLink}</span>
                        </span>
                      </label>
                      {errors.terms && <div style={{ ...errorStyle, marginTop: 6 }}>⚠️ {errors.terms}</div>}
                    </div>

                    {/* Submit */}
                    <button
                      className="btn-shine"
                      onClick={handleSubmit}
                      disabled={loading}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                        padding: "16px 28px", borderRadius: 50, fontSize: 15, fontWeight: 800,
                        border: "none", background: loading ? C.muted : `linear-gradient(135deg, ${C.blue}, #2563eb)`,
                        color: "#fff", transition: "all .25s", width: "100%",
                        boxShadow: loading ? "none" : "0 8px 28px rgba(26,111,186,0.4)",
                        fontFamily: "'Cairo','Syne',sans-serif",
                        marginTop: 4,
                      }}
                    >
                      {loading ? (
                        <>
                          <span style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                          {lang === "ar" ? "جاري إنشاء الحساب..." : "Creating account..."}
                        </>
                      ) : (
                        <>🚀 {t.submit}</>
                      )}
                    </button>

                    {/* Login link */}
                    <div style={{ textAlign: "center", fontSize: 14, color: C.muted, paddingTop: 4 }}>
                      {t.hasAccount}{" "}
                      <button style={{ background: "none", border: "none", color: C.blue, fontWeight: 800, fontSize: 14, fontFamily: "'Cairo','Syne',sans-serif" }}>
                        {t.login}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: "20px 0" }}>
        <div style={{ ...container, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 12, color: C.muted }}>
            {lang === "ar" ? "© 2026 العيادة الرقمية. جميع الحقوق محفوظة." : "© 2026 Digital Clinic. All rights reserved."}
          </span>
          <span style={{ fontSize: 12, color: C.muted }}>
            {lang === "ar" ? "تصميم Dev Code" : "Designed by Dev Code"}
          </span>
        </div>
      </footer>
    </div>
  );
}
