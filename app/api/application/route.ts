export const runtime = "nodejs";

import { NextResponse } from "next/server";
import https from "https";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TOKEN || !CHAT_ID) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing TELEGRAM env variables",
        },
        { status: 500 }
      );
    }

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
      parse_mode: "HTML",
    });

    const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

    const result = await new Promise<any>((resolve, reject) => {
      const request = https.request(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data),
          },
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

      request.on("error", (err) => reject(err));

      request.write(data);
      request.end();
    });

    return NextResponse.json({
      success: true,
      telegram: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}