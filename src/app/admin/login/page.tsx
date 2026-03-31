"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const i18n = {
  en: {
    dir: "ltr" as const,
    badge: "Admin Portal",
    title: "Secure Access",
    subtitle: "Sign in to your administration panel",
    emailLabel: "Email Address",
    emailPlaceholder: "admin@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••••••",
    submit: "Sign In",
    submitting: "Authenticating...",
    forgotPassword: "Forgot password?",
    version: "v2.4.1 · Secure",
    errorMsg: "Invalid credentials. Please try again.",
    switchLang: "عربي",
    lightLabel: "Light",
    darkLabel: "Dark",
  },
  ar: {
    dir: "rtl" as const,
    badge: "بوابة المدير",
    title: "وصول آمن",
    subtitle: "سجّل دخولك إلى لوحة الإدارة",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "admin@example.com",
    passwordLabel: "كلمة المرور",
    passwordPlaceholder: "••••••••••••",
    submit: "تسجيل الدخول",
    submitting: "جارٍ التحقق...",
    forgotPassword: "نسيت كلمة المرور؟",
    version: "v2.4.1 · آمن",
    errorMsg: "بيانات الاعتماد غير صحيحة. حاول مرة أخرى.",
    switchLang: "English",
    lightLabel: "فاتح",
    darkLabel: "داكن",
  },
};

const darkVars = {
  "--bg": "#080c10",
  "--card-bg": "rgba(12,18,25,0.90)",
  "--card-border": "rgba(0,230,180,0.18)",
  "--accent": "#00e6b4",
  "--accent-hover": "#00ffca",
  "--accent-glow": "rgba(0,230,180,0.25)",
  "--text-primary": "#f0f4f8",
  "--text-secondary": "rgba(160,180,200,0.5)",
  "--text-label": "rgba(160,180,200,0.6)",
  "--text-muted": "rgba(120,140,160,0.35)",
  "--input-bg": "rgba(255,255,255,0.03)",
  "--input-border": "rgba(255,255,255,0.09)",
  "--input-color": "#e8f0fe",
  "--input-focus-bg": "rgba(0,230,180,0.03)",
  "--input-focus-border": "rgba(0,230,180,0.4)",
  "--input-focus-ring": "rgba(0,230,180,0.07)",
  "--grid-line": "rgba(0,230,180,0.04)",
  "--separator": "rgba(255,255,255,0.06)",
  "--btn-text": "#080c10",
  "--error-bg": "rgba(255,60,80,0.08)",
  "--error-border": "rgba(255,60,80,0.2)",
  "--error-text": "#ff8090",
  "--toggle-bg": "rgba(0,230,180,0.08)",
  "--toggle-border": "rgba(0,230,180,0.2)",
  "--corner": "rgba(0,230,180,0.25)",
  "--card-inset": "rgba(255,255,255,0.04)",
  "--shadow": "rgba(0,0,0,0.5)",
};

const lightVars = {
  "--bg": "#eef1f5",
  "--card-bg": "rgba(255,255,255,0.96)",
  "--card-border": "rgba(0,140,110,0.2)",
  "--accent": "#009e76",
  "--accent-hover": "#00b88a",
  "--accent-glow": "rgba(0,158,118,0.2)",
  "--text-primary": "#0c1b28",
  "--text-secondary": "rgba(40,70,90,0.55)",
  "--text-label": "rgba(40,70,90,0.6)",
  "--text-muted": "rgba(80,100,120,0.4)",
  "--input-bg": "rgba(0,0,0,0.025)",
  "--input-border": "rgba(0,0,0,0.1)",
  "--input-color": "#0c1b28",
  "--input-focus-bg": "rgba(0,158,118,0.04)",
  "--input-focus-border": "rgba(0,158,118,0.4)",
  "--input-focus-ring": "rgba(0,158,118,0.08)",
  "--grid-line": "rgba(0,130,100,0.05)",
  "--separator": "rgba(0,0,0,0.07)",
  "--btn-text": "#ffffff",
  "--error-bg": "rgba(200,20,40,0.05)",
  "--error-border": "rgba(200,20,40,0.18)",
  "--error-text": "#b8001a",
  "--toggle-bg": "rgba(0,140,110,0.07)",
  "--toggle-border": "rgba(0,140,110,0.18)",
  "--corner": "rgba(0,140,110,0.22)",
  "--card-inset": "rgba(255,255,255,0.9)",
  "--shadow": "rgba(0,0,0,0.1)",
};

export default function AdminLogin() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const t = i18n[lang];
  const isDark = theme === "dark";
  const vars = isDark ? darkVars : lightVars;
  const isAr = lang === "ar";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    if (email !== "admin@example.com" || password !== "password") {
      setError(t.errorMsg);
      setLoading(false);
      return;
    }
    localStorage.setItem("admin_auth", "true");
    router.push("/admin");
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&family=Cairo:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lr { min-height:100vh; background:var(--bg); display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; transition:background .45s; }

        .lr::before { content:''; position:absolute; inset:0; background-image:linear-gradient(var(--grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--grid-line) 1px,transparent 1px); background-size:48px 48px; animation:gp 20s linear infinite; }
        @keyframes gp { 0%{background-position:0 0}100%{background-position:48px 48px} }

        .orb { position:absolute; width:640px;height:640px; border-radius:50%; background:radial-gradient(circle,var(--accent-glow) 0%,transparent 70%); top:50%;left:50%;transform:translate(-50%,-50%); animation:orb 6s ease-in-out infinite; pointer-events:none; }
        @keyframes orb { 0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(1)} 50%{opacity:.9;transform:translate(-50%,-50%) scale(1.12)} }

        .ctrls { position:absolute; top:20px; display:flex; gap:8px; z-index:20; animation:fd .5s .1s both; }
        @keyframes fd { from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)} }

        .cbtn { display:flex;align-items:center;gap:5px; font-size:11px;font-weight:700; color:var(--accent); background:var(--toggle-bg); border:1px solid var(--toggle-border); border-radius:3px; padding:7px 11px; cursor:pointer; transition:all .2s; white-space:nowrap; }
        .cbtn:hover { background:var(--accent); color:var(--btn-text); box-shadow:0 0 14px var(--accent-glow); }

        .card { position:relative;z-index:10; width:100%;max-width:430px;margin:24px; background:var(--card-bg); border:1px solid var(--card-border); border-radius:4px; padding:48px 40px 40px; backdrop-filter:blur(24px); box-shadow:0 0 0 1px rgba(0,0,0,.03),0 32px 64px var(--shadow),inset 0 1px 0 var(--card-inset); opacity:0;transform:translateY(18px); animation:ci .6s cubic-bezier(.22,1,.36,1) .15s forwards; transition:background .4s,border-color .4s,box-shadow .4s; }
        @keyframes ci { to{opacity:1;transform:translateY(0)} }

        .card::before { content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--accent),transparent);border-radius:4px 4px 0 0; }

        .cnr-tr { position:absolute;top:14px;width:18px;height:18px;border-top:1px solid var(--corner); }
        .cnr-bl { position:absolute;bottom:14px;width:18px;height:18px;border-bottom:1px solid var(--corner); }

        .hdr { margin-bottom:34px;animation:fu .5s .35s both; }
        @keyframes fu { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }

        .badge { display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--accent);background:var(--toggle-bg);border:1px solid var(--toggle-border);padding:4px 10px;border-radius:2px;margin-bottom:14px; }
        .dot { width:5px;height:5px;border-radius:50%;background:var(--accent);animation:blink 2s ease infinite;flex-shrink:0; }
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:.25} }

        .ttl { font-size:27px;font-weight:800;color:var(--text-primary);line-height:1.15;transition:color .4s; }
        .sub { margin-top:6px;font-size:12.5px;color:var(--text-secondary);transition:color .4s; }

        .frm { display:flex;flex-direction:column;gap:18px;animation:fu .5s .5s both; }

        .fld { display:flex;flex-direction:column;gap:7px; }
        .lbl { font-size:10.5px;font-weight:700;color:var(--text-label);transition:color .4s; }

        .iwrap { position:relative; }
        .inp { width:100%;background:var(--input-bg);border:1px solid var(--input-border);border-radius:3px;padding:13px 16px;font-size:13px;color:var(--input-color);outline:none;transition:border-color .2s,box-shadow .2s,background .2s,color .4s; }
        .inp::placeholder { color:var(--text-muted); }
        .inp:focus { border-color:var(--input-focus-border);background:var(--input-focus-bg);box-shadow:0 0 0 3px var(--input-focus-ring); }

        .eye { position:absolute;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted);padding:4px;display:flex;align-items:center;transition:color .2s; }
        .eye:hover { color:var(--accent); }

        .err { display:flex;align-items:center;gap:8px;background:var(--error-bg);border:1px solid var(--error-border);border-radius:3px;padding:10px 14px;font-size:12.5px;color:var(--error-text);animation:shk .35s ease; }
        @keyframes shk { 0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}60%{transform:translateX(4px)}80%{transform:translateX(-3px)} }

        .sbtn { width:100%;padding:14px;font-size:13px;font-weight:700;letter-spacing:.1em;color:var(--btn-text);background:var(--accent);border:none;border-radius:3px;cursor:pointer;position:relative;overflow:hidden;transition:transform .15s,box-shadow .2s,background .2s;box-shadow:0 4px 18px var(--accent-glow);margin-top:4px; }
        .sbtn::before { content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.15) 0%,transparent 50%);pointer-events:none; }
        .sbtn:hover:not(:disabled) { background:var(--accent-hover);box-shadow:0 4px 28px var(--accent-glow);transform:translateY(-1px); }
        .sbtn:active:not(:disabled) { transform:translateY(0); }
        .sbtn:disabled { opacity:.7;cursor:not-allowed; }
        .bi { display:flex;align-items:center;justify-content:center;gap:9px; }
        .sp { width:14px;height:14px;border:2px solid rgba(0,0,0,.2);border-top-color:var(--btn-text);border-radius:50%;animation:spin .7s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }

        .ftr { margin-top:26px;padding-top:18px;border-top:1px solid var(--separator);display:flex;justify-content:space-between;align-items:center;animation:fu .5s .65s both; }
        .fv { font-size:10px;color:var(--text-muted);letter-spacing:.04em;transition:color .4s; }
        .fl { font-size:11px;color:var(--accent);background:none;border:none;cursor:pointer;padding:0;opacity:.65;transition:opacity .2s; }
        .fl:hover { opacity:1; }
      `}</style>

      <div
        className="lr"
        style={{
          ...vars as React.CSSProperties,
          fontFamily: isAr ? "'Cairo', sans-serif" : "'DM Mono', monospace",
        }}
      >
        <div className="orb" />

        {/* Controls */}
        <div className="ctrls" style={{ [isAr ? "left" : "right"]: "20px" }}>
          <button
            className="cbtn"
            style={{ fontFamily: isAr ? "'Cairo', sans-serif" : "'DM Mono', monospace" }}
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
            {isDark ? t.lightLabel : t.darkLabel}
          </button>

          <button
            className="cbtn"
            style={{ fontFamily: isAr ? "'Cairo', sans-serif" : "'DM Mono', monospace" }}
            onClick={() => setLang(isAr ? "en" : "ar")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            {t.switchLang}
          </button>
        </div>

        {mounted && (
          <div className="card" dir={t.dir}>
            {/* Corner decorations */}
            <div className="cnr-tr" style={{ [isAr ? "left" : "right"]: "14px", [isAr ? "borderLeft" : "borderRight"]: "1px solid var(--corner)" }} />
            <div className="cnr-bl" style={{ [isAr ? "right" : "left"]: "14px", [isAr ? "borderRight" : "borderLeft"]: "1px solid var(--corner)" }} />

            <div className="hdr">
              <div className="badge" style={{ fontFamily: isAr ? "'Cairo', sans-serif" : "'DM Mono', monospace", letterSpacing: isAr ? "0" : "0.15em" }}>
                <span className="dot" />
                {t.badge}
              </div>
              <h1 className="ttl" style={{ fontFamily: isAr ? "'Cairo', sans-serif" : "'Syne', sans-serif" }}>{t.title}</h1>
              <p className="sub" style={{ fontFamily: isAr ? "'Cairo', sans-serif" : "'DM Mono', monospace", fontSize: isAr ? "13px" : "12px" }}>{t.subtitle}</p>
            </div>

            <form className="frm" onSubmit={handleSubmit}>
              {error && (
                <div className="err" style={{ fontFamily: isAr ? "'Cairo', sans-serif" : "'DM Mono', monospace" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              <div className="fld">
                <label className="lbl" htmlFor="email" style={{ fontFamily: isAr ? "'Cairo', sans-serif" : "'DM Mono', monospace", textTransform: isAr ? "none" : "uppercase", letterSpacing: isAr ? "0" : "0.12em" }}>
                  {t.emailLabel}
                </label>
                <div className="iwrap">
                  <input id="email" className="inp" type="email" placeholder={t.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                    style={{ fontFamily: "'DM Mono', monospace", textAlign: isAr ? "right" : "left", paddingRight: isAr ? "16px" : "16px" }}
                  />
                </div>
              </div>

              <div className="fld">
                <label className="lbl" htmlFor="password" style={{ fontFamily: isAr ? "'Cairo', sans-serif" : "'DM Mono', monospace", textTransform: isAr ? "none" : "uppercase", letterSpacing: isAr ? "0" : "0.12em" }}>
                  {t.passwordLabel}
                </label>
                <div className="iwrap">
                  <input id="password" className="inp" type={showPassword ? "text" : "password"} placeholder={t.passwordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
                    style={{ fontFamily: "'DM Mono', monospace", [isAr ? "paddingLeft" : "paddingRight"]: "46px", textAlign: isAr ? "right" : "left" }}
                  />
                  <button type="button" className="eye" onClick={() => setShowPassword(!showPassword)} style={{ [isAr ? "left" : "right"]: "13px" }}>
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="sbtn" disabled={loading}
                style={{ fontFamily: isAr ? "'Cairo', sans-serif" : "'Syne', sans-serif", letterSpacing: isAr ? "0" : "0.1em", textTransform: isAr ? "none" : "uppercase" }}
              >
                <span className="bi">
                  {loading ? (
                    <><span className="sp" />{t.submitting}</>
                  ) : (
                    <>
                      {t.submit}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isAr ? "scaleX(-1)" : "none" }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="ftr" style={{ flexDirection: isAr ? "row-reverse" : "row" }}>
              <span className="fv" style={{ fontFamily: isAr ? "'Cairo', sans-serif" : "'DM Mono', monospace" }}>{t.version}</span>
              <button className="fl" type="button" style={{ fontFamily: isAr ? "'Cairo', sans-serif" : "'DM Mono', monospace" }}>{t.forgotPassword}</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
