// components/ui/LoginForm.tsx
"use client";

import React, { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";

// ---------- Types ----------
type Lang = "ar" | "en";
type ToastType = "success" | "error" | "warning" | "info";

interface LoginFormProps {
  /** Called after successful login with the entered credentials */
  onLoginSuccess?: (email: string, password: string, remember: boolean) => void;
  /** Optional redirect URL after success (if onLoginSuccess not provided) */
  redirectUrl?: string;
  /** Custom demo credentials (default: any non-empty or specific pair) */
  demoCredentials?: { email: string; password: string };
}

// ---------- Component ----------
export default function LoginForm({
  onLoginSuccess,
  redirectUrl,
  demoCredentials = { email: "ahmed@clinic.iq", password: "1234" },
}: LoginFormProps) {
  const router = useRouter();
  // Language
  const [lang, setLang] = useState<Lang>("ar");
  // Form state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
    show: false,
    message: "",
    type: "info",
  });

  // Refs
  const loginCardRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Apply language to DOM attributes and translations
  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  // Toast helper
  const showToast = (message: string, type: ToastType = "info") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, show: false }));
    }, 3200);
  };

  // Language switch
  const handleLangSwitch = (newLang: Lang) => {
    setLang(newLang);
  };

  // Password toggle
  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  // Form validation and submission
  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    // Reset messages
    setError(null);
    setSuccess(false);

    // Validation
    if (!identifier.trim()) {
      setError(lang === "ar" ? "البريد الإلكتروني أو رقم الموظف مطلوب" : "Email or Employee ID is required");
      shakeCard();
      return;
    }
    if (!password) {
      setError(lang === "ar" ? "كلمة المرور مطلوبة" : "Password is required");
      shakeCard();
      return;
    }

    setLoading(true);

    // Simulate async login (replace with real auth)
    setTimeout(() => {
      // Demo validation: accept any non-empty OR match demo credentials
      const isValid =
        identifier.toLowerCase().includes("finance") ||
        identifier.toLowerCase() === demoCredentials.email.toLowerCase() ||
        identifier.toLowerCase() === "emp-0042" ||
        identifier.length > 0;
      const isPassValid = password.length >= 4;

      if (isValid && isPassValid) {
        setSuccess(true);
        showToast(
          lang === "ar" ? "✅ مرحباً بك! جارٍ فتح لوحة التحكم..." : "✅ Welcome! Opening dashboard...",
          "success"
        );

        // Store login state (mock)
        localStorage.setItem("medco_auth", "true");
        localStorage.setItem("medco_user", identifier);

        // Callback or redirect
        if (onLoginSuccess) {
          onLoginSuccess(identifier, password, rememberMe);
        } else {
          // Default redirection logic
          if (identifier.toLowerCase().includes("finance")) {
            router.push("/finance");
          } else {
            router.push("/employee");
          }
        }
      } else {
        setError(
          lang === "ar"
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
            : "Incorrect email or password"
        );
        shakeCard();
      }
      setLoading(false);
    }, 1400);
  };

  // Shake animation on error
  const shakeCard = () => {
    if (loginCardRef.current) {
      loginCardRef.current.style.animation = "none";
      loginCardRef.current.offsetHeight; // reflow
      loginCardRef.current.style.animation = "shake 0.35s ease";
      setTimeout(() => {
        if (loginCardRef.current) loginCardRef.current.style.animation = "";
      }, 400);
    }
  };

  // Handle Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !loading) {
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [identifier, password, loading, lang]);

  // Forgot password handlers
  const openForgotModal = () => {
    setForgotModalOpen(true);
    setForgotSent(false);
    setForgotEmail("");
  };
  const closeForgotModal = () => setForgotModalOpen(false);
  const handleSendReset = () => {
    if (!forgotEmail.trim()) {
      showToast(
        lang === "ar" ? "⚠️ الرجاء إدخال البريد الإلكتروني" : "⚠️ Please enter your email",
        "warning"
      );
      return;
    }
    setForgotSent(true);
    showToast(
      lang === "ar" ? "📧 تم إرسال رابط الاستعادة" : "📧 Reset link sent",
      "success"
    );
    setTimeout(closeForgotModal, 2000);
  };

  // SSO handler
  const handleSSO = () => {
    showToast(
      lang === "ar" ? "🔗 جارٍ الاتصال بنظام الدخول الموحد..." : "🔗 Connecting to SSO...",
      "info"
    );
  };

  // Support contact
  const handleSupport = () => {
    showToast(
      lang === "ar" ? "📧 تم إرسال طلب الدعم إلى IT" : "📧 Support request sent to IT",
      "success"
    );
  };

  // Translations
  const t = {
    welcome: lang === "ar" ? "مرحباً بعودتك 👋" : "Welcome Back 👋",
    subtitle: lang === "ar" ? "سجّل الدخول للوصول إلى لوحة التحكم الخاصة بك" : "Sign in to access your employee dashboard",
    emailLabel: lang === "ar" ? "البريد الإلكتروني أو رقم الموظف" : "Email or Employee ID",
    emailPlaceholder: lang === "ar" ? "ahmed@clinic.iq أو EMP-0042" : "ahmed@clinic.iq or EMP-0042",
    passwordLabel: lang === "ar" ? "كلمة المرور" : "Password",
    passwordPlaceholder: lang === "ar" ? "أدخل كلمة المرور" : "Enter your password",
    rememberMe: lang === "ar" ? "تذكرني" : "Remember me",
    forgotPassword: lang === "ar" ? "نسيت كلمة المرور؟" : "Forgot password?",
    signIn: lang === "ar" ? "🔐 تسجيل الدخول" : "🔐 Sign In",
    or: lang === "ar" ? "أو" : "or",
    sso: lang === "ar" ? "الدخول عبر حساب الشركة (SSO)" : "Sign in with Company Account (SSO)",
    trouble: lang === "ar" ? "هل تواجه مشكلة في الدخول؟" : "Having trouble signing in?",
    contactSupport: lang === "ar" ? "تواصل مع الدعم التقني" : "Contact IT Support",
    footerText: lang === "ar"
      ? "© 2026 العيادة الرقمية — بغداد، العراق. جميع الحقوق محفوظة."
      : "© 2026 Digital Clinic — Baghdad, Iraq. All rights reserved.",
    ssl: lang === "ar" ? "اتصال آمن SSL" : "SSL Secured",
    encrypted: lang === "ar" ? "محمي بتشفير AES-256" : "AES-256 Encrypted",
    monitored: lang === "ar" ? "مراقبة على مدار الساعة" : "24/7 Monitored",
    clinicName: lang === "ar" ? "العيادة الرقمية" : "Digital Clinic",
    portalSub: lang === "ar" ? "بوابة الموظفين الداخلية" : "Internal Employee Portal",
    employeePortal: lang === "ar" ? "بوابة الموظفين" : "Employee Portal",
    forgotTitle: lang === "ar" ? "🔑 استعادة كلمة المرور" : "🔑 Reset Password",
    forgotDesc: lang === "ar"
      ? "أدخل بريدك الإلكتروني أو رقم موظفك وسنرسل لك رابط إعادة تعيين كلمة المرور."
      : "Enter your email or employee ID and we'll send you a password reset link.",
    sendReset: lang === "ar" ? "📧 إرسال رابط الاستعادة" : "📧 Send Reset Link",
    cancel: lang === "ar" ? "إلغاء" : "Cancel",
    resetSent: lang === "ar" ? "تم إرسال رابط الاستعادة إلى بريدك الإلكتروني" : "Reset link sent to your email",
    successMessage: lang === "ar" ? "تم تسجيل الدخول بنجاح! جارٍ التحويل..." : "Login successful! Redirecting...",
    required: lang === "ar" ? "هذا الحقل مطلوب" : "This field is required",
    passwordRequired: lang === "ar" ? "كلمة المرور مطلوبة" : "Password is required",
  };

  return (
    <div className="login-root">
      <style jsx global>{`
        /* ========== VARIABLES ========== */
        .login-root {
          --bg: #0b0f18;
          --surface: #111827;
          --s2: #1a2235;
          --s3: #222e42;
          --s4: #2a3850;
          --blue: #1a6fba;
          --blue2: #2e86de;
          --teal: #0abfbc;
          --green: #2ecc71;
          --amber: #f6ad55;
          --red: #e74c3c;
          --purple: #7c3aed;
          --pink: #ec4899;
          --text: #e2e8f0;
          --muted: #64748b;
          --muted2: #94a3b8;
          --border: rgba(255, 255, 255, 0.06);
          --border2: rgba(255, 255, 255, 0.11);
          --border3: rgba(255, 255, 255, 0.16);
          --radius: 14px;
          --rsm: 9px;
          --rxs: 6px;
          --shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
          --shadow-lg: 0 12px 48px rgba(0, 0, 0, 0.55);
          --safe-bottom: env(safe-area-inset-bottom, 0px);
          font-family: "Cairo", sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }

        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 16px;
          border-radius: var(--rsm);
          font-size: 13px;
          font-weight: 700;
          transition: all 0.17s;
          white-space: nowrap;
          line-height: 1;
          min-height: 38px;
          cursor: pointer;
        }
        .btn-primary {
          background: linear-gradient(135deg, var(--purple), var(--blue));
          color: #fff;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
          border: none;
        }
        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .btn-ghost {
          background: var(--s2);
          color: var(--muted2);
          border: 1px solid var(--border);
        }
        .btn-ghost:hover {
          background: var(--s3);
          color: var(--text);
        }
        .btn-block {
          width: 100%;
        }
        .btn-lg {
          padding: 13px 24px;
          font-size: 15px;
          min-height: 50px;
        }

        /* Form */
        .form-group {
          margin-bottom: 16px;
        }
        .form-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: var(--muted2);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .req {
          color: var(--red);
          margin-inline-start: 2px;
        }
        .input-wrap {
          position: relative;
        }
        .input-icon {
          position: absolute;
          inset-inline-start: 13px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          pointer-events: none;
          z-index: 1;
        }
        .form-control {
          width: 100%;
          padding: 11px 13px;
          background: var(--s2);
          border: 1px solid var(--border2);
          border-radius: var(--rsm);
          color: var(--text);
          font-size: 13.5px;
          transition: border-color 0.18s, box-shadow 0.18s;
          appearance: none;
        }
        .form-control.has-icon {
          padding-inline-start: 40px;
        }
        .form-control:focus {
          outline: none;
          border-color: var(--purple);
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.14);
        }
        .form-control::placeholder {
          color: var(--muted);
        }
        .pass-toggle {
          position: absolute;
          inset-inline-end: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--muted);
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          cursor: pointer;
        }

        /* Lang toggle */
        .lang-toggle {
          display: flex;
          gap: 4px;
          background: var(--s3);
          padding: 3px;
          border-radius: var(--rxs);
        }
        .lang-btn {
          flex: 1;
          padding: 6px 14px;
          border-radius: 4px;
          font-size: 11.5px;
          font-weight: 700;
          background: none;
          color: var(--muted2);
          transition: all 0.18s;
          border: none;
          cursor: pointer;
        }
        .lang-btn.active {
          background: var(--surface);
          color: var(--text);
        }

        /* Alerts */
        .alert {
          border-radius: var(--rsm);
          padding: 11px 14px;
          font-size: 12.5px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .alert-danger {
          background: rgba(231, 76, 60, 0.1);
          border: 1px solid rgba(231, 76, 60, 0.22);
          color: #f87171;
        }
        .alert-success {
          background: rgba(46, 204, 113, 0.1);
          border: 1px solid rgba(46, 204, 113, 0.22);
          color: #4ade80;
        }

        /* Animated background */
        .bg-orbs {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.07;
          animation: orbFloat 12s ease-in-out infinite alternate;
        }
        .orb1 { width: 400px; height: 400px; background: var(--purple); top: -100px; right: -100px; }
        .orb2 { width: 350px; height: 350px; background: var(--blue); bottom: -80px; left: -80px; }
        @keyframes orbFloat { from { transform: scale(1) translateY(0); } to { transform: scale(1.1) translateY(-30px); } }

        /* Login layout */
        .login-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 24px 16px;
          position: relative;
          z-index: 1;
        }
        .login-card {
          background: var(--surface);
          border-radius: var(--radius);
          border: 1px solid var(--border2);
          box-shadow: var(--shadow-lg);
          width: 100%;
          max-width: 420px;
          overflow: hidden;
        }
        .login-card::before {
          content: "";
          display: block;
          height: 3px;
          background: linear-gradient(90deg, var(--purple), var(--blue), var(--teal));
        }
        .login-header { padding: 28px; text-align: center; }
        .logo-wrap { display: flex; align-items: center; gap: 12px; justify-content: center; margin-bottom: 18px; }
        .logo-mark { width: 46px; height: 46px; background: linear-gradient(135deg, var(--purple), var(--blue)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
        .logo-text-main { font-size: 15px; font-weight: 800; }
        .logo-text-sub { font-size: 10.5px; color: var(--muted2); }
        .login-title { font-size: 22px; font-weight: 900; margin-bottom: 6px; }
        .login-sub { font-size: 12.5px; color: var(--muted2); }
        .login-body { padding: 0 28px 28px; }
        .or-divider { display: flex; align-items: center; gap: 10px; margin: 18px 0; color: var(--muted); font-size: 11.5px; }
        .or-divider::before, .or-divider::after { content: ""; flex: 1; height: 1px; background: var(--border2); }
        .top-bar { position: fixed; top: 0; left: 0; right: 0; height: 54px; background: rgba(11, 15, 24, 0.8); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; z-index: 100; border-bottom: 1px solid var(--border); }
        .tb-brand { display: flex; align-items: center; gap: 8px; }
        .tb-logo-mark { font-size: 16px; }
        .tb-title { font-size: 13px; font-weight: 800; }
        .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }

        /* Modal */
        .modal-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.73); z-index: 1000; display: none; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px);
        }
        .modal-backdrop.open { display: flex; }
        .modal { background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border2); width: 100%; max-width: 400px; overflow: hidden; }
        .modal-header { padding: 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; }
        .modal-body { padding: 20px; }
        .modal-footer { padding: 12px 16px; background: var(--s2); display: flex; justify-content: flex-end; gap: 8px; }

        /* Toast */
        #login-toast { position: fixed; bottom: 20px; right: 20px; z-index: 2000; display: none; }
        #login-toast.show { display: block; }
        #login-toast-inner { background: var(--s4); border: 1px solid var(--border2); padding: 12px 16px; border-radius: 10px; display: flex; align-items: center; gap: 8px; box-shadow: var(--shadow-lg); font-size: 13px; font-weight: 600; }
      `}</style>

      {/* Background orbs */}
      <div className="bg-orbs">
        <div className="orb orb1" />
        <div className="orb orb2" />
      </div>

      {/* Top bar */}
      <div className="top-bar">
        <div className="tb-brand">
          <div className="tb-logo-mark">🏥</div>
          <div>
            <div className="tb-title">{t.clinicName}</div>
          </div>
        </div>
        <div className="lang-toggle">
          <button
            className={`lang-btn ${lang === "ar" ? "active" : ""}`}
            onClick={() => handleLangSwitch("ar")}
          >
            عربي
          </button>
          <button
            className={`lang-btn ${lang === "en" ? "active" : ""}`}
            onClick={() => handleLangSwitch("en")}
          >
            EN
          </button>
        </div>
      </div>

      {/* Main login area */}
      <div className="login-page">
        <div className="login-card" ref={loginCardRef}>
          {/* Card Header */}
          <div className="login-header">
            <div className="logo-wrap">
              <div className="logo-mark">🏥</div>
              <div>
                <div className="logo-text-main">{t.clinicName}</div>
                <div className="logo-text-sub">{t.portalSub}</div>
              </div>
            </div>
            <div className="login-title">{t.welcome}</div>
            <div className="login-sub">{t.subtitle}</div>
          </div>

          {/* Card Body */}
          <div className="login-body">
            {error && (
              <div className="alert alert-danger" style={{ marginBottom: "16px" }}>
                <span>⚠️</span> <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="alert alert-success" style={{ marginBottom: "16px" }}>
                <span>✅</span> <span>{t.successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t.emailLabel} <span className="req">*</span></label>
                <div className="input-wrap">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    className="form-control has-icon"
                    placeholder={t.emailPlaceholder}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t.passwordLabel} <span className="req">*</span></label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    type={passwordVisible ? "text" : "password"}
                    className="form-control has-icon"
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="pass-toggle"
                    type="button"
                    onClick={togglePasswordVisibility}
                  >
                    {passwordVisible ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? <span className="spinner" /> : <span>{t.signIn}</span>}
              </button>
            </form>

            <div className="or-divider"><span>{t.or}</span></div>

            <button type="button" className="btn btn-ghost btn-block" onClick={handleSSO}>
              🏢 {t.sso}
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal (Simplified for demo) */}
      <div className={`modal-backdrop ${forgotModalOpen ? "open" : ""}`} onClick={closeForgotModal}>
         <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
               <div style={{fontWeight:800}}>{t.forgotTitle}</div>
               <button onClick={closeForgotModal} style={{background:'none', border:'none', color:'#fff', cursor:'pointer'}}>✕</button>
            </div>
            <div className="modal-body">
               <p style={{fontSize:13, color:'var(--muted2)', marginBottom:15}}>{t.forgotDesc}</p>
               <input type="text" className="form-control" placeholder="Email" />
            </div>
            <div className="modal-footer">
               <button className="btn btn-ghost" onClick={closeForgotModal}>Cancel</button>
               <button className="btn btn-primary" onClick={handleSendReset}>Send</button>
            </div>
         </div>
      </div>

      {/* Toast */}
      <div id="login-toast" className={toast.show ? "show" : ""}>
        <div id="login-toast-inner">
          {toast.message}
        </div>
      </div>
    </div>
  );
}
