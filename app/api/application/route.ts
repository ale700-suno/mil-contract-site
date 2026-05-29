export const runtime = "nodejs";

import { NextResponse } from "next/server";
import https from "https";
import {
  getClientIp,
  validateSmartCaptcha,
} from "@/lib/smart-captcha";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const captchaOk = await validateSmartCaptcha(
      body.captchaToken ?? "",
      getClientIp(req)
    );

    if (!captchaOk) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Не пройдена проверка «Я не робот». Попробуйте ещё раз.",
        },
        { status: 400 }
      );
    }

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

👤 ФИО: ${body.name || "-"}
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

    const result = await new Promise<unknown>((resolve, reject) => {
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
          let responseBody = "";

          res.on("data", (chunk) => {
            responseBody += chunk;
          });

          res.on("end", () => {
            try {
              resolve(JSON.parse(responseBody));
            } catch {
              resolve(responseBody);
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
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
