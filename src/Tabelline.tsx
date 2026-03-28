import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  interpolate,
  Sequence,
} from "remotion";

const FPS = 30;

// Timing constants
// Total: 1800 frames = 60s
// Intro:   0 - 90   (3s)
// Tables:  90 - 1710 (54s = 9 tables × 6s each)
// Outro:   1710 - 1800 (3s)
const INTRO_DURATION = 90;
const TABLE_DURATION = 180;
const OUTRO_DURATION = 90;
const OUTRO_START = INTRO_DURATION + 9 * TABLE_DURATION; // 1710

// Each table: title spring in for ~20 frames, then 10 entries × 16 frames apart
const TITLE_ANIM_FRAMES = 20;
const ENTRY_INTERVAL = 16;

// One color scheme per table (2-10)
const TABLE_COLORS = [
  { bg: "#E53935", light: "#FFEBEE", accent: "#FF8A80", text: "#B71C1C" }, // 2 Red
  { bg: "#F4511E", light: "#FBE9E7", accent: "#FFAB91", text: "#BF360C" }, // 3 Deep Orange
  { bg: "#F9A825", light: "#FFFDE7", accent: "#FFD54F", text: "#F57F17" }, // 4 Amber
  { bg: "#2E7D32", light: "#E8F5E9", accent: "#69F0AE", text: "#1B5E20" }, // 5 Green
  { bg: "#00838F", light: "#E0F7FA", accent: "#80DEEA", text: "#006064" }, // 6 Cyan
  { bg: "#1565C0", light: "#E3F2FD", accent: "#82B1FF", text: "#0D47A1" }, // 7 Blue
  { bg: "#6A1B9A", light: "#F3E5F5", accent: "#CE93D8", text: "#4A148C" }, // 8 Purple
  { bg: "#AD1457", light: "#FCE4EC", accent: "#F48FB1", text: "#880E4F" }, // 9 Pink
  { bg: "#E65100", light: "#FFF3E0", accent: "#FFCC80", text: "#BF360C" }, // 10 Orange
];

// ── Confetti dot ──────────────────────────────────────────────────────────────
const ConfettiDot: React.FC<{
  x: number;
  startY: number;
  size: number;
  color: string;
  delay: number;
  frame: number;
}> = ({ x, startY, size, color, delay, frame }) => {
  const f = frame - delay;
  if (f < 0) return null;
  const progress = interpolate(f, [0, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = startY + progress * 350;
  const rotate = progress * 580;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size * 0.25,
        background: color,
        transform: `rotate(${rotate}deg)`,
        opacity: 1 - progress * 0.65,
        pointerEvents: "none",
      }}
    />
  );
};

// ── Star particle ─────────────────────────────────────────────────────────────
const StarBurst: React.FC<{
  x: number;
  y: number;
  delay: number;
  frame: number;
  color: string;
  size?: number;
}> = ({ x, y, delay, frame, color, size = 28 }) => {
  const f = frame - delay;
  if (f < 0) return null;
  const progress = interpolate(f, [0, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dy = interpolate(progress, [0, 1], [0, -100]);
  const opacity = interpolate(progress, [0, 0.2, 0.7, 1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(progress, [0, 0.15, 1], [0, 1.4, 0.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + dy,
        opacity,
        transform: `scale(${scale})`,
        fontSize: size,
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      ⭐
    </div>
  );
};

// ── Geometric smiley character ────────────────────────────────────────────────
const GeomCharacter: React.FC<{
  shape: "circle" | "square";
  color: string;
  size: number;
  x: number;
  y: number;
  frame: number;
  delayFrames?: number;
}> = ({ shape, color, size, x, y, frame, delayFrames = 0 }) => {
  const bounce = Math.sin((frame + delayFrames * 7) / 22) * 12;
  const rotate = shape === "square" ? Math.sin((frame + delayFrames * 10) / 35) * 8 : 0;
  const sc = spring({
    frame: Math.max(0, frame - delayFrames),
    fps: FPS,
    from: 0,
    to: 1,
    config: { damping: 10, stiffness: 160 },
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + bounce,
        width: size,
        height: size,
        borderRadius: shape === "circle" ? "50%" : "22%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.52,
        boxShadow: `0 8px 24px ${color}66`,
        transform: `scale(${sc}) rotate(${rotate}deg)`,
        zIndex: 5,
      }}
    >
      😊
    </div>
  );
};

// ── Floating number bubble (background decoration) ────────────────────────────
const NumberBubble: React.FC<{
  n: number;
  x: number;
  y: number;
  size: number;
  color: string;
  frame: number;
  delay: number;
}> = ({ n, x, y, size, color, frame, delay }) => {
  const f = frame - delay;
  const offset = Math.sin((frame + delay * 13) / 38) * 14;
  const op = interpolate(f, [0, 20], [0, 0.22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + offset,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.5,
        fontWeight: 900,
        fontFamily: "sans-serif",
        color: "#fff",
        opacity: op,
        pointerEvents: "none",
      }}
    >
      {n}
    </div>
  );
};

// ── Single multiplication row ─────────────────────────────────────────────────
const MultiplicationRow: React.FC<{
  multiplicand: number;
  multiplier: number;
  localFrame: number; // frame relative to when this row starts animating
  bgColor: string;
  accentColor: string;
}> = ({ multiplicand, multiplier, localFrame, bgColor, accentColor }) => {
  const result = multiplicand * multiplier;

  const rowScale = spring({
    frame: Math.max(0, localFrame),
    fps: FPS,
    from: 0.2,
    to: 1,
    config: { damping: 11, stiffness: 220 },
  });
  const rowOpacity = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const resultScale = spring({
    frame: Math.max(0, localFrame - 4),
    fps: FPS,
    from: 0,
    to: 1,
    config: { damping: 7, stiffness: 280 },
  });

  if (localFrame < -2) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${rowScale})`,
        opacity: rowOpacity,
        gap: 14,
      }}
    >
      {/* Multiplicand */}
      <span
        style={{
          fontFamily: "sans-serif",
          fontWeight: 900,
          fontSize: 54,
          color: "#2D2D2D",
          minWidth: 72,
          textAlign: "right",
          lineHeight: 1,
        }}
      >
        {multiplicand}
      </span>

      {/* × */}
      <span
        style={{
          fontFamily: "sans-serif",
          fontWeight: 700,
          fontSize: 46,
          color: "#888",
          lineHeight: 1,
        }}
      >
        ×
      </span>

      {/* Multiplier */}
      <span
        style={{
          fontFamily: "sans-serif",
          fontWeight: 900,
          fontSize: 54,
          color: bgColor,
          minWidth: 62,
          textAlign: "center",
          lineHeight: 1,
        }}
      >
        {multiplier}
      </span>

      {/* = */}
      <span
        style={{
          fontFamily: "sans-serif",
          fontWeight: 700,
          fontSize: 46,
          color: "#888",
          lineHeight: 1,
        }}
      >
        =
      </span>

      {/* Result */}
      <span
        style={{
          fontFamily: "sans-serif",
          fontWeight: 900,
          fontSize: 66,
          color: accentColor === "#FFD54F" ? bgColor : accentColor, // avoid too light
          minWidth: 96,
          textAlign: "left",
          lineHeight: 1,
          transform: `scale(${resultScale})`,
          display: "inline-block",
          textShadow: `0 3px 10px ${bgColor}55`,
        }}
      >
        {result}
      </span>
    </div>
  );
};

// ── Tabellina scene ───────────────────────────────────────────────────────────
const Tabellina: React.FC<{
  tableNumber: number;
  frame: number;
  scheme: (typeof TABLE_COLORS)[0];
}> = ({ tableNumber, frame, scheme }) => {
  const titleScale = spring({
    frame,
    fps: FPS,
    from: 0.3,
    to: 1,
    config: { damping: 10, stiffness: 140 },
  });
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const confettiColors = [scheme.bg, scheme.accent, "#FFD600", "#FF4081", "#80DEEA", "#CE93D8"];
  const allDoneFrame = TITLE_ANIM_FRAMES + 10 * ENTRY_INTERVAL + 5;

  // Stars: each appears when its result pops in
  const starsData = Array.from({ length: 10 }, (_, i) => {
    const entryFrame = TITLE_ANIM_FRAMES + i * ENTRY_INTERVAL;
    return [
      { x: 60 + Math.round(i * 37) % 120,  y: 680 + i * 72 - 30, delay: entryFrame + 3 },
      { x: 900 - Math.round(i * 41) % 120, y: 680 + i * 72 - 30, delay: entryFrame + 5 },
      { x: 500 + (i % 2 === 0 ? -60 : 60), y: 680 + i * 72 - 40, delay: entryFrame + 7 },
    ];
  }).flat();

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(170deg, ${scheme.light} 0%, #FFFFFF 60%, ${scheme.light} 100%)`,
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Top colored header band */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 220,
          background: `linear-gradient(135deg, ${scheme.bg} 0%, ${scheme.text} 100%)`,
          borderBottomLeftRadius: 70,
          borderBottomRightRadius: 70,
        }}
      />

      {/* Background number bubbles */}
      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n, i) => (
        <NumberBubble
          key={n}
          n={n * tableNumber}
          x={(i * 117 + 20) % 960}
          y={300 + (i % 4) * 370}
          size={90 + (i % 3) * 25}
          color={scheme.bg}
          frame={frame}
          delay={i * 5}
        />
      ))}

      {/* Geometric characters */}
      <GeomCharacter shape="circle" color={scheme.accent === "#FFD54F" ? scheme.bg : scheme.accent} size={82} x={22} y={30} frame={frame} delayFrames={5} />
      <GeomCharacter shape="square" color={scheme.bg} size={74} x={970} y={36} frame={frame} delayFrames={10} />
      <GeomCharacter shape="circle" color={scheme.bg} size={68} x={28} y={1750} frame={frame} delayFrames={15} />
      <GeomCharacter shape="square" color={scheme.accent === "#FFD54F" ? scheme.bg : scheme.accent} size={76} x={960} y={1740} frame={frame} delayFrames={8} />

      {/* Title */}
      <div
        style={{
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
          zIndex: 10,
          textAlign: "center",
          paddingTop: 28,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 700,
            fontSize: 60,
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1,
            letterSpacing: 1,
          }}
        >
          Tabella del
        </div>
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 900,
            fontSize: 160,
            color: "#FFFFFF",
            lineHeight: 0.95,
            textShadow: `0 6px 30px rgba(0,0,0,0.3)`,
          }}
        >
          {tableNumber}
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 700,
          height: 5,
          borderRadius: 3,
          background: `linear-gradient(90deg, transparent, ${scheme.bg}, transparent)`,
          marginBottom: 16,
          opacity: titleOpacity,
          zIndex: 10,
        }}
      />

      {/* Multiplication rows */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          zIndex: 10,
          width: "100%",
        }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <MultiplicationRow
            key={i}
            multiplicand={tableNumber}
            multiplier={i + 1}
            localFrame={frame - (TITLE_ANIM_FRAMES + i * ENTRY_INTERVAL)}
            bgColor={scheme.bg}
            accentColor={scheme.accent === "#FFD54F" ? scheme.bg : scheme.accent}
          />
        ))}
      </div>

      {/* Star bursts on each result */}
      {starsData.map((s, idx) => (
        <StarBurst key={idx} x={s.x} y={s.y} delay={s.delay} frame={frame} color={scheme.bg} size={22} />
      ))}

      {/* Confetti when all entries are shown */}
      {Array.from({ length: 18 }, (_, i) => (
        <ConfettiDot
          key={i}
          x={(i * 67 + 15) % 1010}
          startY={-20 - (i % 6) * 20}
          size={10 + (i % 5) * 5}
          color={confettiColors[i % confettiColors.length]}
          delay={allDoneFrame + (i % 6) * 3}
          frame={frame}
        />
      ))}
    </AbsoluteFill>
  );
};

// ── Intro scene ───────────────────────────────────────────────────────────────
export const TabellineIntro: React.FC<{ frame: number }> = ({ frame }) => {
  const titleScale = spring({
    frame,
    fps: FPS,
    from: 0.2,
    to: 1,
    config: { damping: 9, stiffness: 130 },
  });
  const subtitleOp = interpolate(frame, [18, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const starsOp = interpolate(frame, [38, 62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const starScale = (i: number) =>
    spring({
      frame: Math.max(0, frame - 42 - i * 6),
      fps: FPS,
      from: 0,
      to: 1,
      config: { damping: 7, stiffness: 220 },
    });

  const confettiColors = TABLE_COLORS.map((c) => c.bg);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(150deg, #0D1B5E 0%, #1a237e 50%, #283593 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Confetti burst */}
      {Array.from({ length: 24 }, (_, i) => (
        <ConfettiDot
          key={i}
          x={(i * 57 + 15) % 1010}
          startY={-30 - (i % 6) * 28}
          size={10 + (i % 4) * 7}
          color={confettiColors[i % confettiColors.length]}
          delay={(i % 8) * 4}
          frame={frame}
        />
      ))}

      {/* Background number circles */}
      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n, i) => (
        <div
          key={n}
          style={{
            position: "absolute",
            left: (i * 120 + 10) % 950,
            top: 180 + (i % 4) * 390,
            width: 105,
            height: 105,
            borderRadius: "50%",
            background: TABLE_COLORS[i].bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 52,
            fontWeight: 900,
            fontFamily: "sans-serif",
            color: "#fff",
            opacity: 0.28,
          }}
        >
          {n}
        </div>
      ))}

      {/* Geometric characters */}
      <GeomCharacter shape="circle" color="#FFD600" size={92} x={22} y={280} frame={frame} delayFrames={4} />
      <GeomCharacter shape="square" color="#E53935" size={82} x={940} y={360} frame={frame} delayFrames={8} />
      <GeomCharacter shape="circle" color="#00C853" size={78} x={30} y={1400} frame={frame} delayFrames={12} />
      <GeomCharacter shape="square" color="#00BCD4" size={86} x={932} y={1320} frame={frame} delayFrames={6} />

      {/* Title */}
      <div
        style={{
          transform: `scale(${titleScale})`,
          textAlign: "center",
          padding: "0 60px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 900,
            fontSize: 104,
            color: "#FFFFFF",
            lineHeight: 1.1,
            textShadow: "0 6px 32px rgba(0,0,0,0.55)",
          }}
        >
          Impariamo
        </div>
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 900,
            fontSize: 104,
            color: "#FFFFFF",
            lineHeight: 1.1,
            textShadow: "0 6px 32px rgba(0,0,0,0.55)",
          }}
        >
          le
        </div>
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 900,
            fontSize: 138,
            color: "#FFD600",
            lineHeight: 1.0,
            textShadow: "0 6px 32px rgba(255,214,0,0.55)",
          }}
        >
          Tabelline!
        </div>
      </div>

      {/* Star emoji */}
      <div
        style={{
          opacity: starsOp,
          fontSize: 110,
          marginTop: 28,
          transform: `scale(${starScale(0)})`,
          display: "inline-block",
        }}
      >
        🌟
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: subtitleOp,
          marginTop: 28,
          fontSize: 56,
          color: "#BBDEFB",
          fontFamily: "sans-serif",
          textAlign: "center",
          padding: "0 60px",
          lineHeight: 1.3,
          fontWeight: 600,
        }}
      >
        dal 2 al 10
      </div>

      {/* Stars row */}
      <div
        style={{
          marginTop: 36,
          display: "flex",
          gap: 18,
          opacity: starsOp,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              fontSize: 52,
              transform: `scale(${starScale(i + 1)})`,
              display: "inline-block",
            }}
          >
            ⭐
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Outro scene ───────────────────────────────────────────────────────────────
export const TabellineOutro: React.FC<{ frame: number }> = ({ frame }) => {
  const titleScale = spring({
    frame,
    fps: FPS,
    from: 0.1,
    to: 1,
    config: { damping: 7, stiffness: 140 },
  });
  const emojiScale = spring({
    frame: Math.max(0, frame - 18),
    fps: FPS,
    from: 0,
    to: 1,
    config: { damping: 6, stiffness: 210 },
  });
  const textOp = interpolate(frame, [28, 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const confettiColors = TABLE_COLORS.map((c) => c.bg);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(150deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Lots of confetti */}
      {Array.from({ length: 32 }, (_, i) => (
        <ConfettiDot
          key={i}
          x={(i * 43 + 8) % 1010}
          startY={-30 - (i % 8) * 22}
          size={10 + (i % 5) * 6}
          color={confettiColors[i % confettiColors.length]}
          delay={(i % 10) * 3}
          frame={frame}
        />
      ))}

      {/* Star bursts */}
      {Array.from({ length: 14 }, (_, i) => (
        <StarBurst
          key={i}
          x={40 + (i * 80) % 960}
          y={100 + (i % 5) * 340}
          delay={i * 4}
          frame={frame}
          color="#FFD600"
          size={30}
        />
      ))}

      {/* Geometric characters celebrating */}
      <GeomCharacter shape="circle" color="#FFD600" size={100} x={14} y={200} frame={frame} delayFrames={3} />
      <GeomCharacter shape="square" color="#E53935" size={92} x={928} y={230} frame={frame} delayFrames={7} />
      <GeomCharacter shape="circle" color="#F4511E" size={88} x={20} y={1300} frame={frame} delayFrames={10} />
      <GeomCharacter shape="square" color="#00BCD4" size={96} x={916} y={1220} frame={frame} delayFrames={5} />

      {/* "Bravi!" */}
      <div
        style={{
          transform: `scale(${titleScale})`,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 900,
            fontSize: 180,
            color: "#FFFFFF",
            textShadow: "0 8px 40px rgba(0,0,0,0.4)",
            lineHeight: 1,
          }}
        >
          Bravi!
        </div>
      </div>

      {/* Party emoji */}
      <div
        style={{
          transform: `scale(${emojiScale})`,
          fontSize: 160,
          marginTop: 16,
          zIndex: 10,
        }}
      >
        🎉
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: textOp,
          marginTop: 40,
          textAlign: "center",
          padding: "0 60px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 700,
            fontSize: 60,
            color: "#FFFFFF",
            lineHeight: 1.3,
          }}
        >
          Avete imparato
        </div>
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 700,
            fontSize: 60,
            color: "#FFD600",
            lineHeight: 1.3,
          }}
        >
          tutte le tabelline!
        </div>
      </div>

      {/* Stars bouncing in */}
      <div style={{ marginTop: 44, display: "flex", gap: 20, zIndex: 10 }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const sc = spring({
            frame: Math.max(0, frame - 38 - i * 8),
            fps: FPS,
            from: 0,
            to: 1,
            config: { damping: 7, stiffness: 220 },
          });
          return (
            <span
              key={i}
              style={{
                fontSize: 68,
                transform: `scale(${sc})`,
                display: "inline-block",
              }}
            >
              ⭐
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Root Tabelline component ──────────────────────────────────────────────────
export const Tabelline: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: "#1a237e" }}>
      {/* Intro: 0–90 */}
      <Sequence from={0} durationInFrames={INTRO_DURATION + 8}>
        <TabellineIntro frame={frame} />
      </Sequence>

      {/* Tables 2–10: 90 frames each (6s) */}
      {Array.from({ length: 9 }, (_, i) => {
        const tableNumber = i + 2;
        const start = INTRO_DURATION + i * TABLE_DURATION;
        return (
          <Sequence key={tableNumber} from={start} durationInFrames={TABLE_DURATION + 8}>
            <Tabellina
              tableNumber={tableNumber}
              frame={frame - start}
              scheme={TABLE_COLORS[i]}
            />
          </Sequence>
        );
      })}

      {/* Outro: 1710–1800 */}
      <Sequence from={OUTRO_START} durationInFrames={OUTRO_DURATION}>
        <TabellineOutro frame={frame - OUTRO_START} />
      </Sequence>
    </AbsoluteFill>
  );
};
