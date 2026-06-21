import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { brandName, industry, vibe, target } = await req.json();

    if (!brandName || !industry) {
      return NextResponse.json({ error: "ブランド名と業種は必須です" }, { status: 400 });
    }

    const prompt = `あなたはプロのブランドデザイナーです。以下のブランドのブランドキットを作成してください。

ブランド名: ${brandName}
業種: ${industry}
ブランドの雰囲気: ${vibe || "信頼感・プロフェッショナル"}
ターゲット: ${target || "一般ユーザー"}

以下のJSONフォーマットで返してください（Markdown不要、JSONのみ）:
{
  "archetype": "ブランドアーキタイプ名（英語）",
  "archetypeJa": "ブランドアーキタイプの日本語説明（1文）",
  "colors": [
    { "name": "カラー名（日本語）", "hex": "#XXXXXX", "role": "Primary/Secondary/Accent/Background/Text" }
  ],
  "fonts": [
    {
      "heading": "見出しフォント名（Google Fonts）",
      "body": "本文フォント名（Google Fonts）",
      "reason": "この組み合わせを選んだ理由（1文）"
    },
    {
      "heading": "見出しフォント名2",
      "body": "本文フォント名2",
      "reason": "理由"
    }
  ],
  "taglines": [
    "タグライン1（10〜20文字）",
    "タグライン2",
    "タグライン3"
  ],
  "voice": {
    "tone": "ブランドトーン（例: 親しみやすく・信頼感・革新的）",
    "doWords": ["使う言葉1", "使う言葉2", "使う言葉3"],
    "dontWords": ["避ける言葉1", "避ける言葉2", "避ける言葉3"]
  },
  "story": "ブランドストーリー（2〜3文。ブランドが存在する理由・誰のために・何を解決するか）"
}

colorsは必ず5色。hexは有効な6桁の16進数カラーコード。ブランド名・業種に合ったデザイン性の高い配色にすること。`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (message.content[0] as { text: string }).text.trim();
    const jsonStr = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const brandKit = JSON.parse(jsonStr);

    return NextResponse.json({ brandKit });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "生成に失敗しました。もう一度お試しください。" }, { status: 500 });
  }
}
