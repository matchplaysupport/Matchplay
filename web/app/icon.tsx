import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg,#22A85B,#15803D)", borderRadius: 8,
          color: "#fff", fontSize: 22, fontWeight: 800, fontFamily: "sans-serif",
        }}
      >
        M
      </div>
    ),
    size,
  );
}
