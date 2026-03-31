"use client";

import { useState } from "react";
import Link from "next/link";

type Lang = "ar" | "en";

const T = {
  ar: {
    dir: "rtl" as const,
    topbar: { email: "info@digitalclinic.iq", phone: "+964 770 281 4484", location: "العراق، بغداد" },
    brand: "العيادة الرقمية",
    badge: "🔐 تسجيل الدخول الآمن",
    title: "مرحباً بعودتك",
    subtitle: "سجّل دخولك للوصول إلى لوحة تحكم عيادتك",
    identifier: "البريد الإلكتروني أو رقم الهاتف",
    identifierPh: "example@email.com أو 07xxxxxxxxx",
    password: "كلمة المرور",
    passwordPh: "أدخل كلمة المرور",
    forgot: "نسيت كلمة المرور؟",
    submit: "تسجيل الدخول",
    noAccount: "ليس لديك حساب؟",
    signup: "إنشاء حساب جديد",
    orContinue: "أو",
    trust: ["🔒 اتصال آمن ومشفر", "✅ بيانات محمية", "🌐 وصول من أي مكان"],
    errors: {
      identifierRequired: "يرجى إدخال البريد الإلكتروني أو رقم الهاتف",
      passwordRequired: "يرجى إدخال كلمة المرور",
      invalidCredentials: "البيانات المدخلة غير صحيحة، يرجى المحاولة مجدداً",
    },
    success: "✅ تم تسجيل الدخول بنجاح! جاري التحويل...",
  },
  en: {
    dir: "ltr" as const,
    topbar: { email: "info@digitalclinic.iq", phone: "+964 770 281 4484", location: "Baghdad, Iraq" },
    brand: "Digital Clinic",
    badge: "🔐 Secure Login",
    title: "Welcome Back",
    subtitle: "Sign in to access your clinic dashboard",
    identifier: "Email or Phone Number",
    identifierPh: "example@email.com or 07xxxxxxxxx",
    password: "Password",
    passwordPh: "Enter your password",
    forgot: "Forgot password?",
    submit: "Sign In",
    noAccount: "Don't have an account?",
    signup: "Create a new account",
    orContinue: "or",
    trust: ["🔒 Secure & Encrypted", "✅ Data Protected", "🌐 Access Anywhere"],
    errors: {
      softIdentifierRequired: "Please enter your email or phone number",
      passwordRequired: "Please enter your password",
      invalidCredentials: "Invalid credentials, please try again",
    },
    success: "✅ Login successful! Redirecting...",
  },
};

export default function LoginPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = T[lang];
  const isRtl = lang === "ar";

  const fontStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Syne:wght@400;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Cairo','Syne',sans-serif;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(26,111,186,0.4)}50%{box-shadow:0 0 60px rgba(26,111,186,0.8)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
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
    .input-field:focus{border-color:#1a6fba !important;box-shadow:0 0 0 3px rgba(26,111,186,0.15) !important;}
    .input-field:focus-within{border-color:#1a6fba !important;box-shadow:0 0 0 3px rgba(26,111,186,0.15) !important;}
    @media(max-width:768px){
      .login-grid{grid-template-columns:1fr!important;}
      .login-visual{display:none!important;}
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!identifier.trim()) newErrors.identifier = lang === "ar" ? T.ar.errors.identifierRequired : T.en.errors.softIdentifierRequired;
    if (!password.trim()) newErrors.password = lang === "ar" ? T.ar.errors.passwordRequired : T.en.errors.passwordRequired;
    return newErrors;
  };

  const handleSubmit = async () => {
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    setSubmitted(true);
  };

  const container: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "0 24px" };

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
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(6,13,24,0.95)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "0" }}>
        <div style={{ ...container, display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${C.blue},${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, animation: "glow 3s ease-in-out infinite" }}>🏥</div>
            <span style={{ fontSize: 18, fontWeight: 900, color: C.white }}>{t.brand}</span>
          </Link>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/" style={{ fontSize: 13, fontWeight: 700, color: C.muted, textDecoration: "none", fontFamily: "'Cairo','Syne',sans-serif" }}>
              {lang === "ar" ? "الرئيسية" : "Home"}
            </Link>
            <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: 50, fontSize: 13, fontWeight: 800, border: "none", background: `linear-gradient(135deg, ${C.blue}, #2563eb)`, color: "#fff", fontFamily: "'Cairo','Syne',sans-serif", boxShadow: "0 4px 16px rgba(26,111,186,0.4)", textDecoration: "none" }}>
              {lang === "ar" ? "إنشاء حساب" : "Sign Up"}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div style={{ minHeight: "calc(100vh - 120px)", display: "flex", alignItems: "center", padding: "60px 0" }}>
        <div style={{ ...container, width: "100%" }}>
          <div className="login-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

            {/* ── LEFT VISUAL PANEL ── */}
            <div className="login-visual" style={{ position: "relative" }}>
              {/* Background glow */}
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, rgba(26,111,186,0.15) 0%, transparent 70%)`, pointerEvents: "none" }} />

              <div className="fade-up" style={{ animationDelay: "0s" }}>
                {/* Badge */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(26,111,186,0.15)", border: `1px solid rgba(26,111,186,0.35)`, borderRadius: 50, padding: "6px 18px", fontSize: 13, fontWeight: 700, color: C.blue, marginBottom: 28 }}>
                  {t.badge}
                </div>

                <h1 style={{ fontSize: 48, fontWeight: 900, color: C.white, lineHeight: 1.15, marginBottom: 20 }}>
                  {t.title}
                  <br />
                  <span className="gradient-text">{lang === "ar" ? "بعيادتك الرقمية" : "to Your Digital Clinic"}</span>
                </h1>

                <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.8, marginBottom: 40, maxWidth: 420 }}>
                  {t.subtitle}
                </p>

                {/* Trust badges */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {t.trust.map((item, i) => (
                    <div key={i} className="fade-up" style={{ animationDelay: `${0.2 + i * 0.1}s`, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(26,111,186,0.12)", border: `1px solid rgba(26,111,186,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                        {item.split(" ")[0]}
                      </div>
                      <span style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{item.substring(item.indexOf(" ") + 1)}</span>
                    </div>
                  ))}
                </div>

                {/* Floating stats card */}
                <div className="float-anim" style={{ marginTop: 48, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "20px 24px", display: "inline-flex", gap: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
                  {[
                    { val: "150+", lbl: lang === "ar" ? "عيادة" : "Clinics" },
                    { val: "2,500+", lbl: lang === "ar" ? "مريض" : "Patients" },
                    { val: "99.9%", lbl: lang === "ar" ? "تشغيل" : "Uptime" },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: C.blue }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.lbl}</div>
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
                  <h2 style={{ fontSize: 24, fontWeight: 900, color: C.white, marginBottom: 6 }}>
                    {lang === "ar" ? "تسجيل الدخول" : "Sign In"}
                  </h2>
                  <p style={{ fontSize: 13, color: C.muted }}>{t.subtitle}</p>
                </div>

                {submitted ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.green, lineHeight: 1.6 }}>{t.success}</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* Identifier Field */}
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>
                        {t.identifier} <span style={{ color: C.blue }}>*</span>
                      </label>
                      <div className="input-field" style={{ display: "flex", alignItems: "center", background: C.surface2, border: `1px solid ${errors.identifier ? C.red : C.border}`, borderRadius: 14, overflow: "hidden", transition: "all .2s" }}>
                        <span style={{ padding: "0 14px", fontSize: 16, color: C.muted, flexShrink: 0 }}>📧</span>
                        <input
                          type="text"
                          value={identifier}
                          onChange={e => { setIdentifier(e.target.value); if (errors.identifier) setErrors(prev => ({ ...prev, identifier: "" })); }}
                          placeholder={t.identifierPh}
                          style={{ flex: 1, padding: "14px 14px 14px 0", background: "transparent", border: "none", color: C.text, fontSize: 14, fontFamily: "'Cairo','Syne',sans-serif", direction: t.dir }}
                        />
                      </div>
                      {errors.identifier && <div style={{ fontSize: 12, color: C.red, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>⚠️ {errors.identifier}</div>}
                    </div>

                    {/* Password Field */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                          {t.password} <span style={{ color: C.blue }}>*</span>
                        </label>
                        <button style={{ background: "none", border: "none", color: C.blue, fontSize: 12, fontWeight: 700, fontFamily: "'Cairo','Syne',sans-serif" }}>
                          {t.forgot}
                        </button>
                      </div>
                      <div className="input-field" style={{ display: "flex", alignItems: "center", background: C.surface2, border: `1px solid ${errors.password ? C.red : C.border}`, borderRadius: 14, overflow: "hidden", transition: "all .2s" }}>
                        <span style={{ padding: "0 14px", fontSize: 16, color: C.muted, flexShrink: 0 }}>🔑</span>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: "" })); }}
                          placeholder={t.passwordPh}
                          style={{ flex: 1, padding: "14px 0", background: "transparent", border: "none", color: C.text, fontSize: 14, fontFamily: "'Cairo','Syne',sans-serif" }}
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ background: "none", border: "none", padding: "0 14px", color: C.muted, fontSize: 16, flexShrink: 0 }}
                        >
                          {showPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {errors.password && <div style={{ fontSize: 12, color: C.red, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>⚠️ {errors.password}</div>}
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
                          {lang === "ar" ? "جاري الدخول..." : "Signing in..."}
                        </>
                      ) : (
                        <>{lang === "ar" ? "🚀" : "🚀"} {t.submit}</>
                      )}
                    </button>

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1, height: 1, background: C.border }} />
                      <span style={{ fontSize: 12, color: C.muted }}>{t.orContinue}</span>
                      <div style={{ flex: 1, height: 1, background: C.border }} />
                    </div>

                    {/* Sign up link */}
                    <div style={{ textAlign: "center", fontSize: 14, color: C.muted }}>
                      {t.noAccount}{" "}
                      <Link href="/signup" style={{ background: "none", border: "none", color: C.blue, fontWeight: 800, fontSize: 14, fontFamily: "'Cairo','Syne',sans-serif", textDecoration: "none" }}>
                        {t.signup}
                      </Link>
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
