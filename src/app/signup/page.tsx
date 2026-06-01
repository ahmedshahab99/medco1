"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    if (!name.trim()) { setError("يرجى إدخال الاسم الكامل"); return; }
    setLoading(true); setError("");
    // Store name in sessionStorage so setup page can use it
    sessionStorage.setItem("doctorName", name.trim());
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      fontFamily: "'Cairo', sans-serif", direction: "rtl", padding: 20, position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "55%", height: "55%", background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)", borderRadius: "50%", animation: "float 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", borderRadius: "50%", animation: "float 10s ease-in-out infinite" }} />
      </div>

      <div style={{
        position: "relative", width: "100%", maxWidth: 440, background: "rgba(30,41,59,0.8)", backdropFilter: "blur(20px)",
        borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)", padding: "48px 40px", boxShadow: "0 25px 80px rgba(0,0,0,0.5)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 72, height: 72, margin: "0 auto 16px", borderRadius: 20,
            background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(16,185,129,0.4)"
          }}>
            <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a6 6 0 0 1 6 6c0 3.5-2 6.5-4 8.5V20a2 2 0 0 1-4 0v-3.5C8 14.5 6 11.5 6 8a6 6 0 0 1 6-6Z" />
              <circle cx="12" cy="8" r="2" />
              <path d="M9 22h6" />
            </svg>
          </div>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, letterSpacing: "-0.5px" }}>إنشاء حساب جديد</h1>
          <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 6, lineHeight: 1.6 }}>أدخل اسمك ثم سجل بحساب Google</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", color: "#cbd5e1", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>الاسم الكامل للطبيب</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: د. أحمد الزهراني"
            style={{
              width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 14, outline: "none", textAlign: "right"
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = "rgba(16,185,129,0.4)"}
            onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
          />
        </div>

        {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#fca5a5", marginBottom: 16, textAlign: "center" }}>{error}</div>}

        <button onClick={handleGoogle} disabled={loading || !name.trim()} style={{
          width: "100%", padding: "14px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all .2s",
          marginBottom: 20, opacity: (!name.trim() || loading) ? 0.6 : 1
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
          {loading ? "جاري..." : "التسجيل بحساب Google"}
        </button>

        <p style={{ textAlign: "center", color: "#64748b", fontSize: 13 }}>
          لديك حساب بالفعل؟{" "}
          <a href="/login" style={{ color: "#818cf8", fontWeight: 700, textDecoration: "none" }}>تسجيل الدخول</a>
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {["💳 مجاني", "🔒 مشفر", "☁️ سحابي"].map((badge, i) => (
            <span key={i} style={{ color: "#64748b", fontSize: 11, fontWeight: 600 }}>{badge}</span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
        *{font-family:'Cairo',sans-serif}
      `}</style>
    </div>
  );
}
