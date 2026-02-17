import { ImageResponse } from "next/og";

export const alt = "Citrus Surf — Free, private data tools in your browser";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
        <div style={{ display: "flex", fontSize: 100 }}>🏄</div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            color: "#171717",
            marginTop: 24,
          }}
        >
          Citrus Surf
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#737373",
            marginTop: 16,
          }}
        >
          Free, private data tools in your browser
        </div>
      </div>
    ),
    { ...size },
  );
}
