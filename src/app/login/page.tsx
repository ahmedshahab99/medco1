"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    setLoading(true); setError("");
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (signInError) { setError(signInError.message); setLoading(false); }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("يرجى إدخال البريد الإلكتروني"); return; }
    setLoading(true); setError("");
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (signInError) { setError(signInError.message); setLoading(false); }
    else { setLoading(false); setError("تم إرسال رابط الدخول إلى بريدك الإلكتروني"); }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      fontFamily: "'Cairo', sans-serif", direction: "rtl", padding: 20, position: "relative", overflow: "hidden"
    }}>
      {/* Animated background */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "60%", height: "60%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", borderRadius: "50%", animation: "float 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)", borderRadius: "50%", animation: "float 10s ease-in-out infinite" }} />
      </div>

      <div style={{
        position: "relative", width: "100%", maxWidth: 440, background: "rgba(30,41,59,0.8)", backdropFilter: "blur(20px)",
        borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)", padding: "48px 40px", boxShadow: "0 25px 80px rgba(0,0,0,0.5)"
      }}>
        {/* Logo & Badge */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 72, height: 72, margin: "0 auto 16px", borderRadius: 20,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(99,102,241,0.4)"
          }}>
            <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a6 6 0 0 1 6 6c0 3.5-2 6.5-4 8.5V20a2 2 0 0 1-4 0v-3.5C8 14.5 6 11.5 6 8a6 6 0 0 1 6-6Z" />
              <circle cx="12" cy="8" r="2" />
            </svg>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 50, padding: "4px 14px", fontSize: 11, fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.5px" }}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            بوابة آمنة
          </div>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, marginTop: 16, letterSpacing: "-0.5px" }}>تسجيل الدخول</h1>
          <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 6, lineHeight: 1.6 }}>أهلاً بك في نظام إدارة العيادات الذكي</p>
        </div>

        {/* Error */}
        {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#fca5a5", marginBottom: 16, textAlign: "center" }}>{error}</div>}

        {/* Google Sign In */}
        <button onClick={handleGoogle} disabled={loading} style={{
          width: "100%", padding: "14px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all .2s",
          marginBottom: 20
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
        >
          <svg width={20} height={20} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? "جاري..." : "الدخول بحساب Google"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          <span style={{ color: "#64748b", fontSize: 12, fontWeight: 600 }}>أو</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", color: "#cbd5e1", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" style={{
              width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 14, outline: "none", transition: "all .2s"
            }}
              onFocus={(e) => e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: 15, fontWeight: 800,
            cursor: "pointer", transition: "all .2s", boxShadow: "0 4px 20px rgba(99,102,241,0.3)"
          }}>
            {loading ? "جاري إرسال الرابط..." : "إرسال رابط الدخول"}
          </button>
        </form>

        {/* Signup link */}
        <p style={{ textAlign: "center", color: "#64748b", fontSize: 13, marginTop: 24 }}>
          ليس لديك حساب؟{" "}
          <a href="/signup" style={{ color: "#818cf8", fontWeight: 700, textDecoration: "none" }}>إنشاء حساب جديد</a>
        </p>

        {/* Trust badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {["🔒 مشفر", "✅ آمن", "☁️ سحابي"].map((badge, i) => (
            <span key={i} style={{ color: "#64748b", fontSize: 11, fontWeight: 600 }}>{badge}</span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
        *{font-family:'Cairo',sans-serif}
        input:focus{outline:none;border-color:rgba(99,102,241,0.4)!important}
        button{cursor:pointer}
      `}</style>
    </div>
  );
}
