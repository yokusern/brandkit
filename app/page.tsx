"use client";
import { useState, useEffect } from "react";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

const INDUSTRIES = [
  "カフェ・飲食", "ファッション", "テック・SaaS", "美容・コスメ",
  "フィットネス", "教育・コーチング", "不動産", "クリエイター",
  "EC・小売", "医療", "旅行", "金融",
];

const VIBES = [
  "信頼・プロ", "親しみやすい", "高級・ラグジュアリー",
  "革新・テック", "ナチュラル", "ポップ", "ミニマル",
];

const FREE_LIMIT = 5;

interface BrandKit {
  archetype: string;
  archetypeJa: string;
  colors: { name: string; hex: string; role: string }[];
  fonts: { heading: string; body: string; reason: string }[];
  taglines: string[];
  voice: { tone: string; doWords: string[]; dontWords: string[] };
  story: string;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-[10px] font-mono tracking-widest uppercase transition-colors"
      style={{ color: copied ? "#16a34a" : "#a8a29e" }}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function isDark(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

function LoginModal({ onClose, onLogin }: { onClose: () => void; onLogin: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(28,25,23,0.7)" }}
      onClick={onClose}>
      <div className="bg-white border border-stone-200 p-10 max-w-sm w-full shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <p className="text-[9px] font-mono tracking-[0.4em] text-stone-400 uppercase mb-6">Account Required</p>
        <h2 className="text-2xl font-black text-stone-900 mb-3">無料で5回使えます</h2>
        <p className="text-sm text-stone-500 mb-8 leading-relaxed">
          Googleアカウントでログインするだけ。クレカ不要。
        </p>
        <button onClick={onLogin}
          className="w-full py-4 bg-stone-900 text-stone-50 font-black text-sm tracking-widest uppercase flex items-center justify-center gap-3 hover:bg-stone-700 transition-colors">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Googleでログイン
        </button>
      </div>
    </div>
  );
}

function UpgradeModal({ onClose, onUpgrade }: { onClose: () => void; onUpgrade: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(28,25,23,0.75)" }}
      onClick={onClose}>
      <div className="bg-white border-2 border-stone-900 p-10 max-w-sm w-full shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <p className="text-[9px] font-mono tracking-[0.4em] text-stone-400 uppercase mb-6">Limit Reached</p>
        <h2 className="text-2xl font-black text-stone-900 mb-3">無料枠（5回）を使い切りました</h2>
        <p className="text-sm text-stone-500 mb-6 leading-relaxed">
          Proプランで無制限に生成。月額¥980。いつでもキャンセル可。
        </p>
        <div className="border border-stone-100 p-5 mb-6 space-y-3 bg-stone-50">
          {["ブランドキット生成 無制限", "カラーパレット履歴保存", "全業種・全バイブ対応", "生成履歴の管理"].map(f => (
            <p key={f} className="text-xs text-stone-700 flex items-center gap-2">
              <span className="text-stone-900 font-bold">✓</span> {f}
            </p>
          ))}
        </div>
        <button onClick={onUpgrade}
          className="w-full py-4 bg-stone-900 text-stone-50 font-black text-sm tracking-widest uppercase hover:bg-stone-700 transition-colors mb-3">
          ¥980/月で始める →
        </button>
        <button onClick={onClose}
          className="w-full py-2 text-xs font-mono tracking-widest text-stone-400 hover:text-stone-700 transition-colors uppercase">
          あとで
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [vibe, setVibe] = useState("");
  const [target, setTarget] = useState("");
  const [result, setResult] = useState<BrandKit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeFont, setActiveFont] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [usedCount, setUsedCount] = useState(0);
  const [plan, setPlan] = useState("free");
  const [showLogin, setShowLogin] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setShowLogin(false);
    } catch (e) { console.error(e); }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    setUpgradeLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) { console.error(e); }
    finally { setUpgradeLoading(false); }
  };

  const generate = async () => {
    if (!user) { setShowLogin(true); return; }
    if (!brandName.trim() || !industry) { setError("ブランド名と業種を入力してください"); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ brandName, industry, vibe, target }),
      });
      const data = await res.json();
      if (data.needsAuth) { setShowLogin(true); return; }
      if (data.needsUpgrade) { setShowUpgrade(true); return; }
      if (data.error) { setError(data.error); return; }
      setResult(data.brandKit);
      if (data.used !== undefined) setUsedCount(data.used);
      if (data.plan) setPlan(data.plan);
    } catch { setError("エラーが発生しました"); }
    finally { setLoading(false); }
  };

  const remaining = Math.max(0, FREE_LIMIT - usedCount);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F4F0", color: "#1C1917" }}>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} onUpgrade={handleUpgrade} />}

      {/* Header */}
      <header className="border-b border-stone-200 px-8 py-4 flex items-center justify-between bg-white">
        <span className="text-sm font-black tracking-[0.18em] uppercase">BrandKit AI</span>
        <div className="flex items-center gap-5">
          {!authLoading && (
            user ? (
              <div className="flex items-center gap-4">
                {plan !== "pro" && (
                  <span className="text-[10px] font-mono" style={{ color: usedCount >= FREE_LIMIT ? "#b91c1c" : "#a8a29e" }}>
                    残り {remaining}/{FREE_LIMIT}
                  </span>
                )}
                {plan === "pro" && (
                  <span className="text-[10px] font-mono font-black text-stone-900 tracking-widest">PRO</span>
                )}
                <button onClick={() => signOut(auth)}
                  className="text-[10px] font-mono text-stone-400 hover:text-stone-700 tracking-widest uppercase transition-colors">
                  logout
                </button>
              </div>
            ) : (
              <button onClick={() => setShowLogin(true)}
                className="text-[10px] font-mono text-stone-500 hover:text-stone-900 border border-stone-300 hover:border-stone-700 px-3 py-1.5 tracking-widest uppercase transition-colors">
                login
              </button>
            )
          )}
          <a href="https://x.com/Yoko_ai_dev" target="_blank" rel="noopener noreferrer"
            className="text-[11px] text-stone-400 hover:text-stone-800 transition-colors">
            @Yoko_ai_dev
          </a>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-8 py-16">
        {/* Hero */}
        <div className="mb-16">
          <p className="text-[9px] font-mono tracking-[0.45em] text-stone-400 uppercase mb-8">
            Brand Identity Generator
          </p>
          <h1 className="text-5xl sm:text-6xl font-black leading-[1.0] tracking-tight mb-6">
            ブランドの<br />核をつくる
          </h1>
          <p className="text-stone-500 text-sm leading-loose">
            カラーパレット・フォント・タグライン・ストーリーを即生成。
            {!user && <span className="text-stone-700"> 無料5回。</span>}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-12 mb-14">
          <div>
            <label className="block text-[9px] font-mono tracking-[0.35em] text-stone-400 uppercase mb-5">
              Brand Name <span className="text-stone-800">*</span>
            </label>
            <input type="text" value={brandName}
              onChange={e => setBrandName(e.target.value)}
              placeholder="Lumiere / サクラ工房 / TechSeed"
              className="w-full bg-transparent border-b-2 border-stone-200 pb-3 text-2xl font-black text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-800 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[9px] font-mono tracking-[0.35em] text-stone-400 uppercase mb-5">
              Industry <span className="text-stone-800">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map(ind => (
                <button key={ind} onClick={() => setIndustry(ind)}
                  className="px-3 py-2 text-xs font-bold border transition-all"
                  style={{
                    borderColor: industry === ind ? "#1C1917" : "#D6D3D1",
                    backgroundColor: industry === ind ? "#1C1917" : "transparent",
                    color: industry === ind ? "#FAFAF9" : "#78716C",
                  }}>
                  {ind}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-mono tracking-[0.35em] text-stone-400 uppercase mb-5">
              Vibe <span className="text-stone-300">（任意）</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {VIBES.map(v => (
                <button key={v} onClick={() => setVibe(vibe === v ? "" : v)}
                  className="px-3 py-2 text-xs font-bold border transition-all"
                  style={{
                    borderColor: vibe === v ? "#1C1917" : "#D6D3D1",
                    backgroundColor: vibe === v ? "#1C1917" : "transparent",
                    color: vibe === v ? "#FAFAF9" : "#78716C",
                  }}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-mono tracking-[0.35em] text-stone-400 uppercase mb-5">
              Target <span className="text-stone-300">（任意）</span>
            </label>
            <input type="text" value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder="30代の働く女性 / 副業を始めたい大学生"
              className="w-full bg-transparent border-b-2 border-stone-200 pb-3 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-800 transition-colors"
            />
          </div>

          {error && <p className="text-red-700 text-sm font-mono">{error}</p>}

          {/* Usage bar for logged-in free users */}
          {user && plan !== "pro" && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-stone-400">
                <span>FREE USAGE</span>
                <span style={{ color: usedCount >= FREE_LIMIT ? "#b91c1c" : "#78716c" }}>
                  {usedCount}/{FREE_LIMIT}
                </span>
              </div>
              <div className="h-0.5 w-full bg-stone-200">
                <div className="h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (usedCount / FREE_LIMIT) * 100)}%`,
                    backgroundColor: usedCount >= FREE_LIMIT ? "#b91c1c" : "#1C1917",
                  }} />
              </div>
              {usedCount >= FREE_LIMIT && (
                <button onClick={() => setShowUpgrade(true)}
                  className="text-[10px] font-mono tracking-widest uppercase text-stone-900 underline underline-offset-4 hover:no-underline transition-all">
                  Proプランで無制限に使う →
                </button>
              )}
            </div>
          )}

          <button
            onClick={usedCount >= FREE_LIMIT && plan !== "pro" ? () => setShowUpgrade(true) : generate}
            disabled={loading || upgradeLoading}
            className="w-full py-4 font-black text-sm tracking-[0.3em] uppercase disabled:opacity-30 transition-colors"
            style={{
              backgroundColor: usedCount >= FREE_LIMIT && plan !== "pro" ? "#D6D3D1" : "#1C1917",
              color: usedCount >= FREE_LIMIT && plan !== "pro" ? "#78716C" : "#FAFAF9",
            }}>
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="inline-block w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                GENERATING...
              </span>
            ) : !user ? "LOGIN して無料で使う →"
              : usedCount >= FREE_LIMIT && plan !== "pro" ? "無料枠終了 — Proプランへ"
              : "CREATE BRAND KIT →"}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="border-t-2 border-stone-900 pt-14 space-y-14">

            {/* Archetype */}
            <div>
              <p className="text-[9px] font-mono tracking-[0.45em] text-stone-400 uppercase mb-5">Brand Archetype</p>
              <h2 className="text-5xl font-black leading-none tracking-tight mb-3">{result.archetype}</h2>
              <p className="text-stone-500 text-sm">{result.archetypeJa}</p>
            </div>

            {/* Color palette */}
            <div>
              <p className="text-[9px] font-mono tracking-[0.45em] text-stone-400 uppercase mb-5">Color Palette</p>
              <div className="flex mb-6" style={{ height: "80px" }}>
                {result.colors.map(c => (
                  <div key={c.hex} className="flex-1 relative group cursor-default" style={{ backgroundColor: c.hex }}>
                    <div className="absolute inset-0 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[8px] font-mono" style={{ color: isDark(c.hex) ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)" }}>
                        {c.hex.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {result.colors.map(c => (
                  <div key={c.hex} className="flex items-center gap-5">
                    <div className="w-9 h-9 flex-shrink-0" style={{ backgroundColor: c.hex }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-stone-900 truncate">{c.name}</p>
                      <p className="text-xs text-stone-400 truncate">{c.role}</p>
                    </div>
                    <CopyBtn text={c.hex.toUpperCase()} />
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div>
              <p className="text-[9px] font-mono tracking-[0.45em] text-stone-400 uppercase mb-5">Typography</p>
              <div className="flex gap-2 mb-6">
                {result.fonts.map((_, i) => (
                  <button key={i} onClick={() => setActiveFont(i)}
                    className="px-4 py-2 text-xs font-bold border transition-all"
                    style={{
                      borderColor: activeFont === i ? "#1C1917" : "#D6D3D1",
                      backgroundColor: activeFont === i ? "#1C1917" : "transparent",
                      color: activeFont === i ? "#FAFAF9" : "#78716C",
                    }}>
                    Pattern {i + 1}
                  </button>
                ))}
              </div>
              {result.fonts[activeFont] && (
                <div className="border border-stone-200 p-6 space-y-5 bg-white">
                  <div>
                    <p className="text-[9px] font-mono tracking-widest text-stone-400 uppercase mb-2">Heading</p>
                    <p className="text-2xl font-black text-stone-900">{result.fonts[activeFont].heading}</p>
                  </div>
                  <div className="h-px bg-stone-100" />
                  <div>
                    <p className="text-[9px] font-mono tracking-widest text-stone-400 uppercase mb-2">Body</p>
                    <p className="text-sm text-stone-700">{result.fonts[activeFont].body}</p>
                  </div>
                  <div className="h-px bg-stone-100" />
                  <p className="text-xs text-stone-400 leading-relaxed">{result.fonts[activeFont].reason}</p>
                </div>
              )}
            </div>

            {/* Taglines */}
            <div>
              <p className="text-[9px] font-mono tracking-[0.45em] text-stone-400 uppercase mb-5">Taglines</p>
              <div>
                {result.taglines.map((t, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-stone-200 py-4">
                    <p className="text-lg font-black text-stone-900 leading-tight pr-4">{t}</p>
                    <CopyBtn text={t} />
                  </div>
                ))}
              </div>
            </div>

            {/* Brand voice */}
            <div>
              <p className="text-[9px] font-mono tracking-[0.45em] text-stone-400 uppercase mb-5">Brand Voice</p>
              <p className="text-sm font-bold text-stone-800 mb-7 leading-relaxed">{result.voice.tone}</p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[9px] font-mono tracking-widest text-stone-400 uppercase mb-4">Use</p>
                  {result.voice.doWords.map(w => (
                    <p key={w} className="text-sm text-stone-700 py-2 border-b border-stone-100">{w}</p>
                  ))}
                </div>
                <div>
                  <p className="text-[9px] font-mono tracking-widest text-stone-400 uppercase mb-4">Avoid</p>
                  {result.voice.dontWords.map(w => (
                    <p key={w} className="text-sm text-stone-400 py-2 border-b border-stone-100 line-through">{w}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Brand story */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <p className="text-[9px] font-mono tracking-[0.45em] text-stone-400 uppercase">Brand Story</p>
                <CopyBtn text={result.story} />
              </div>
              <p className="text-sm text-stone-700 leading-loose">{result.story}</p>
            </div>

            {/* CTA */}
            <div className="border-t-2 border-stone-900 pt-10">
              <p className="text-[9px] font-mono tracking-widest text-stone-400 uppercase mb-4">Made by YO-KO × AI</p>
              <p className="text-2xl font-black text-stone-900 mb-2 leading-tight">フリーランス提案を<br />本格的に自動化する</p>
              <p className="text-xs text-stone-500 mb-6 leading-relaxed">
                ブランドキットができたら、次は提案文。<br />ProposalHubで受注率を上げる。¥980/月。
              </p>
              <a href="https://proposalhub-smoky.vercel.app" target="_blank" rel="noopener noreferrer"
                className="inline-block px-8 py-3 bg-stone-900 text-stone-50 text-xs font-black tracking-[0.3em] uppercase hover:bg-stone-700 transition-colors">
                ProposalHub を試す →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white px-8 py-5 mt-16">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <span className="text-[10px] font-mono text-stone-400 tracking-widest uppercase">© 2026 BrandKit AI</span>
          <div className="flex gap-6">
            {[["X", "https://x.com/Yoko_ai_dev"], ["note", "https://note.com/yoko_ai_logic"], ["Portfolio", "https://yokoportofolio.vercel.app"]].map(([l, h]) => (
              <a key={l} href={h} target="_blank" rel="noopener noreferrer"
                className="text-[10px] font-mono tracking-widest text-stone-400 hover:text-stone-800 uppercase transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
