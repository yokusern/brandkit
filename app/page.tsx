"use client";
import { useState } from "react";

const INDUSTRIES = [
  "カフェ・飲食", "ファッション", "テクノロジー・SaaS", "美容・コスメ",
  "フィットネス・健康", "教育・コーチング", "不動産", "クリエイター・個人事業",
  "EC・小売", "医療・ヘルスケア", "旅行・ホテル", "金融・投資",
];

const VIBES = [
  "信頼感・プロフェッショナル", "親しみやすい・カジュアル", "高級感・ラグジュアリー",
  "革新的・テック", "ナチュラル・エコ", "ポップ・元気", "ミニマル・洗練",
];

interface BrandKit {
  archetype: string;
  archetypeJa: string;
  colors: { name: string; hex: string; role: string }[];
  fonts: { heading: string; body: string; reason: string }[];
  taglines: string[];
  voice: { tone: string; doWords: string[]; dontWords: string[] };
  story: string;
}

function CopyBtn({ text, label = "コピー" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
        copied ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
      }`}
    >
      {copied ? "✓" : label}
    </button>
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

  const generate = async () => {
    if (!brandName.trim() || !industry) { setError("ブランド名と業種を入力してください"); return; }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName, industry, vibe, target }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setResult(data.brandKit);
    } catch {
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎨</span>
          <span className="font-black text-slate-900 text-lg tracking-tight">BrandKit AI</span>
          <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded-full">Beta</span>
        </div>
        <a
          href="https://x.com/Yoko_ai_dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
        >
          by @Yoko_ai_dev
        </a>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 leading-tight">
            ブランドキットを<br />
            <span className="bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              10秒で
            </span>
            生成
          </h1>
          <p className="text-slate-500 text-sm sm:text-base">
            カラーパレット・フォント・タグライン・ブランドストーリーを<br className="hidden sm:block" />
            AIが即生成。デザイナー不要。無料。
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 space-y-5">
          {/* Brand name */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">
              ブランド名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="例: Lumiere / サクラ工房 / TechSeed"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-colors text-sm"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">
              業種 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setIndustry(ind)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    industry === ind
                      ? "bg-violet-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          {/* Vibe */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">
              ブランドの雰囲気 <span className="text-slate-400 font-normal">（任意）</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {VIBES.map((v) => (
                <button
                  key={v}
                  onClick={() => setVibe(vibe === v ? "" : v)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    vibe === v
                      ? "bg-pink-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Target */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">
              ターゲット <span className="text-slate-400 font-normal">（任意）</span>
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="例: 30代の働く女性 / 副業を始めたい大学生"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-colors text-sm"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ブランドキット生成中...
              </span>
            ) : (
              "🎨 ブランドキットを生成する（無料）"
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Brand archetype */}
            <div className="bg-gradient-to-r from-violet-600 to-pink-600 rounded-2xl p-6 text-white">
              <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Brand Archetype</p>
              <h2 className="text-2xl font-black mb-1">{result.archetype}</h2>
              <p className="text-sm opacity-90">{result.archetypeJa}</p>
            </div>

            {/* Colors */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">カラーパレット</h3>
              <div className="flex gap-2 mb-4">
                {result.colors.map((c) => (
                  <div
                    key={c.hex}
                    className="flex-1 h-16 rounded-xl cursor-pointer"
                    style={{ backgroundColor: c.hex }}
                    title={`${c.name} (${c.hex})`}
                  />
                ))}
              </div>
              <div className="space-y-2">
                {result.colors.map((c) => (
                  <div key={c.hex} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg shadow-sm" style={{ backgroundColor: c.hex }} />
                      <div>
                        <span className="text-sm font-medium text-slate-900">{c.name}</span>
                        <span className="text-xs text-slate-400 ml-2">{c.role}</span>
                      </div>
                    </div>
                    <CopyBtn text={c.hex} label={c.hex} />
                  </div>
                ))}
              </div>
            </div>

            {/* Fonts */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">フォントペアリング</h3>
              <div className="flex gap-2 mb-4">
                {result.fonts.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveFont(i)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                      activeFont === i
                        ? "bg-violet-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    パターン {i + 1}
                  </button>
                ))}
              </div>
              {result.fonts[activeFont] && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">見出し</p>
                    <p className="text-lg font-bold text-slate-900">{result.fonts[activeFont].heading}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">本文</p>
                    <p className="text-sm text-slate-700">{result.fonts[activeFont].body}</p>
                  </div>
                  <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                    {result.fonts[activeFont].reason}
                  </p>
                </div>
              )}
            </div>

            {/* Taglines */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">タグライン候補</h3>
              <div className="space-y-3">
                {result.taglines.map((t, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                    <p className="text-slate-900 font-medium text-sm">{t}</p>
                    <CopyBtn text={t} />
                  </div>
                ))}
              </div>
            </div>

            {/* Voice */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">ブランドボイス</h3>
              <p className="text-sm font-medium text-violet-600 mb-3">{result.voice.tone}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-green-600 font-semibold mb-2">✓ 使う言葉</p>
                  {result.voice.doWords.map((w) => (
                    <div key={w} className="text-xs bg-green-50 text-green-800 rounded-lg px-3 py-1.5 mb-1">{w}</div>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-red-500 font-semibold mb-2">✗ 避ける言葉</p>
                  {result.voice.dontWords.map((w) => (
                    <div key={w} className="text-xs bg-red-50 text-red-700 rounded-lg px-3 py-1.5 mb-1">{w}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Story */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-slate-900">ブランドストーリー</h3>
                <CopyBtn text={result.story} />
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{result.story}</p>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-200 rounded-2xl p-6 text-center">
              <p className="font-bold text-slate-900 mb-1">ロゴや本格デザインも必要？</p>
              <p className="text-slate-500 text-sm mb-4">
                YO-KOがブランドアイデンティティの制作をサポートします
              </p>
              <a
                href="https://x.com/Yoko_ai_dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-full transition-colors"
              >
                X でDMする →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-6 mt-12">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>© 2026 BrandKit AI by YO-KO</span>
          <div className="flex gap-4">
            <a href="https://x.com/Yoko_ai_dev" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700 transition-colors">X</a>
            <a href="https://note.com/yoko_ai_logic" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700 transition-colors">note</a>
            <a href="https://yokoportofolio.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700 transition-colors">Portfolio</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
