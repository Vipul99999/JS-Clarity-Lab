import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "JS Clarity Lab visual JavaScript async debugger";
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
          background: "#101217",
          color: "white",
          fontFamily: "Arial, sans-serif",
          padding: 56
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: "#a5f3fc" }} />
            <div style={{ fontSize: 30, fontWeight: 800 }}>JS Clarity Lab</div>
          </div>
          <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ color: "#a5f3fc", fontSize: 28, fontWeight: 800, textTransform: "uppercase" }}>
                Predict. Visualize. Fix.
              </div>
              <div style={{ marginTop: 18, fontSize: 72, lineHeight: 1.02, fontWeight: 900, letterSpacing: 0 }}>
                Stop guessing why JavaScript printed that.
              </div>
              <div style={{ marginTop: 22, color: "rgba(255,255,255,.72)", fontSize: 30, lineHeight: 1.3 }}>
                Visual async demos, safe paste-code analysis, and Node.js runtime scenarios.
              </div>
            </div>
            <div style={{ width: 390, display: "flex", flexDirection: "column", gap: 14 }}>
              {["console.log('A')", "Promise.then('C')", "setTimeout('B')"].map((item, index) => (
                <div
                  key={item}
                  style={{
                    border: "1px solid rgba(255,255,255,.15)",
                    background: index === 1 ? "#5b21b6" : index === 2 ? "#f97316" : "#0f766e",
                    borderRadius: 14,
                    padding: "18px 20px",
                    fontSize: 28,
                    fontWeight: 800,
                    boxShadow: "0 18px 50px rgba(0,0,0,.2)"
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div style={{ color: "rgba(255,255,255,.62)", fontSize: 24 }}>
            A clarity tool for confusing JavaScript and Node.js behavior.
          </div>
        </div>
      </div>
    ),
    size
  );
}
