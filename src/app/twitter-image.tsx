import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "JS Clarity Lab visual async debugging card";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#101217",
          color: "white",
          fontFamily: "Arial, sans-serif",
          padding: 56
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 10, background: "#a5f3fc" }} />
          <div style={{ fontSize: 30, fontWeight: 800 }}>JS Clarity Lab</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#a5f3fc", fontSize: 28, fontWeight: 800, textTransform: "uppercase" }}>
            Visual JavaScript clarity
          </div>
          <div style={{ marginTop: 18, fontSize: 74, lineHeight: 1.02, fontWeight: 900 }}>
            Predict output. Watch queues. Fix real bugs.
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,.7)", fontSize: 28 }}>
          Safe paste-code analysis plus guided Node.js runtime scenarios.
        </div>
      </div>
    ),
    size
  );
}
