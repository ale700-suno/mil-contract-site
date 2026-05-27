import {
  type ApplicationPayload,
  applicationSourceLabels,
} from "@/lib/application";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatApplicationMessage(
  data: ApplicationPayload
): string {
  const lines = [
    "<b>Новая заявка</b>",
    `<b>Форма:</b> ${escapeHtml(applicationSourceLabels[data.source])}`,
    `<b>Имя:</b> ${escapeHtml(data.name)}`,
    `<b>Телефон:</b> ${escapeHtml(data.phone)}`,
  ];

  if (data.telegram) {
    lines.push(
      `<b>Telegram:</b> ${escapeHtml(data.telegram)}`
    );
  }

  lines.push(
    `<b>Регион:</b> ${escapeHtml(data.region)}`
  );

  if (data.comment) {
    lines.push(
      `<b>Комментарий:</b> ${escapeHtml(data.comment)}`
    );
  }

  return lines.join("\n");
}

export async function sendApplicationToTelegram(
  data: ApplicationPayload
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID должны быть заданы в .env.local"
    );
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatApplicationMessage(data),
        parse_mode: "HTML",
      }),
    }
  );

  const result = (await response.json()) as {
    ok?: boolean;
    description?: string;
  };

  if (!response.ok || !result.ok) {
    throw new Error(
      result.description ?? "Telegram API error"
    );
  }
}
