export async function validateSmartCaptcha(
  token: string,
  ip: string
): Promise<boolean> {
  const secret = process.env.SMARTCAPTCHA_SERVER_KEY;

  if (!secret) {
    console.error("SMARTCAPTCHA_SERVER_KEY is not set");
    return false;
  }

  if (!token) {
    return false;
  }

  const params = new URLSearchParams({
    secret,
    token,
    ip,
  });

  try {
    const response = await fetch(
      `https://smartcaptcha.yandexcloud.net/validate?${params}`,
      { signal: AbortSignal.timeout(2000) }
    );

    const body = await response.text();

    if (!response.ok) {
      console.error(
        `SmartCaptcha validate error: code=${response.status}; message=${body}`
      );
      return true;
    }

    const data = JSON.parse(body) as { status?: string };
    return data.status === "ok";
  } catch (error) {
    console.error("SmartCaptcha validate request failed", error);
    return true;
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "127.0.0.1";
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "127.0.0.1"
  );
}
