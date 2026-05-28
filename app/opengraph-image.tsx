import { ImageResponse } from "next/og";

export const alt = "Контрактная служба РФ — военный контракт";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(145deg, #050505 0%, #141428 45%, #050505 100%)",
          color: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: 48,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 8,
            opacity: 0.55,
            marginBottom: 20,
          }}
        >
          CONTRACT RF
        </div>
        <div
          style={{
            fontSize: 58,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          Контрактная служба РФ
        </div>
        <div
          style={{
            fontSize: 30,
            marginTop: 24,
            opacity: 0.88,
            maxWidth: 820,
            lineHeight: 1.35,
          }}
        >
          Военный контракт — выплаты, должности, сопровождение 24/7
        </div>
      </div>
    ),
    { ...size }
  );
}
