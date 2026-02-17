import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export function createToolOGImage(title: string, icon: React.ReactNode) {
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
          background: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 16,
            background: "#f5f5f5",
            marginBottom: 32,
          }}
        >
          {icon}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 700,
            color: "#171717",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 32,
            fontSize: 24,
            color: "#737373",
          }}
        >
          <span style={{ fontSize: 28 }}>🏄</span>
          <span>Citrus Surf</span>
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
