export const runtime = "nodejs";

import { NextResponse } from "next/server";
import https from "https";
import { HttpsProxyAgent } from "https-proxy-agent";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    const text = `
🚀 НОВАЯ ЗАЯВКА

👤 Имя: ${body.name || "-"}
📞 Телефон: ${body.phone || "-"}
📲 Telegram: ${body.telegram || "-"}
🌍 Регион: ${body.region || "-"}
💬 Комментарий: ${body.comment || "-"}
`;

    const data = JSON.stringify({
      chat_id: CHAT_ID,
      text,
    });

    const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

    // =========================
    // 🔥 ПРОКСИ (если нужен)
    // =========================
    const PROXY = process.env.HTTPS_PROXY;

    const agent =
      PROXY && PROXY.length > 0
        ? new HttpsProxyAgent(PROXY)
        : undefined;

    const result = await new Promise<any>((resolve, reject) => {
      const req = https.request(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data),
          },
          // @ts-ignore
          agent,
        },
        (res) => {
          let body = "";

          res.on("data", (chunk) => {
            body += chunk;
          });

          res.on("end", () => {
            try {
              resolve(JSON.parse(body));
            } catch {
              resolve(body);
            }
          });
        }
      );

      req.on("error", (err) => {
        reject(err);
      });

      req.write(data);
      req.end();
    });

    console.log("TELEGRAM RESULT:", result);

    return NextResponse.json({
      success: true,
      telegram: result,
    });
  } catch (error: any) {
    console.error("ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}