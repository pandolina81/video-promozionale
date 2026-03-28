import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FractionData {
  numerator: number;
  denominator: number;
  bgGradient: [string, string];
  highlightColor: string;
  sliceColor: string;
  baseSliceColor: string;
  isCake: boolean;
  name: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const FRACTIONS: FractionData[] = [
  {
    numerator: 1, denominator: 2,
    bgGradient: ["#FF6B6B", "#EE0979"],
    highlightColor: "#FF0055",
    sliceColor: "#FF4466",
    baseSliceColor: "#FFB3C6",
    isCake: false,
    name: "una metà",
  },
  {
    numerator: 1, denominator: 3,
    bgGradient: ["#F7971E", "#FFD200"],
    highlightColor: "#E07B00",
    sliceColor: "#FF9F00",
    baseSliceColor: "#FFE08A",
    isCake: true,
    name: "un terzo",
  },
  {
    numerator: 1, denominator: 4,
    bgGradient: ["#11998E", "#38EF7D"],
    highlightColor: "#007A5E",
    sliceColor: "#00B07A",
    baseSliceColor: "#A8F0D0",
    isCake: false,
    name: "un quarto",
  },
  {
    numerator: 1, denominator: 5,
    bgGradient: ["#7F00FF", "#E100FF"],
    highlightColor: "#5500CC",
    sliceColor: "#8B00FF",
    baseSliceColor: "#D9B3FF",
    isCake: true,
    name: "un quinto",
  },
  {
    numerator: 2, denominator: 3,
    bgGradient: ["#F953C6", "#B91D73"],
    highlightColor: "#CC0077",
    sliceColor: "#FF3399",
    baseSliceColor: "#FFB3DD",
    isCake: false,
    name: "due terzi",
  },
  {
    numerator: 3, denominator: 4,
    bgGradient: ["#0082C8", "#667DB6"],
    highlightColor: "#004A9F",
    sliceColor: "#1565C0",
    baseSliceColor: "#90CAF9",
    isCake: true,
    name: "tre quarti",
  },
  {
    numerator: 2, denominator: 5,
    bgGradient: ["#00B4DB", "#0083B0"],
    highlightColor: "#005F82",
    sliceColor: "#0097B2",
    baseSliceColor: "#80DEEA",
    isCake: false,
    name: "due quinti",
  },
  {
    numerator: 3, denominator: 5,
    bgGradient: ["#FF8008", "#FFC837"],
    highlightColor: "#CC5500",
    sliceColor: "#FF6600",
    baseSliceColor: "#FFD180",
    isCake: true,
    name: "tre quinti",
  },
];

// ─── SVG helpers ─────────────────────────────────────────────────────────────

const polarToCart = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const pieSlicePath = (
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
): string => {
  const s = polarToCart(cx, cy, r, startDeg);
  const e = polarToCart(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
};

// ─── Watermark ───────────────────────────────────────────────────────────────

const Watermark: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 36,
      left: 0,
      right: 0,
      textAlign: "center",
      color: "white",
      fontSize: 30,
      fontFamily: "Arial, Helvetica, sans-serif",
      fontWeight: "bold",
      letterSpacing: 1.5,
      textShadow:
        "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 3px 8px rgba(0,0,0,0.7)",
      opacity: 0.9,
      pointerEvents: "none",
    }}
  >
    maestracris.com
  </div>
);

// ─── Confetti ────────────────────────────────────────────────────────────────

const CONFETTI_DATA = Array.from({ length: 24 }, (_, i) => ({
  x: (i * 127 + 5) % 95,
  delay: (i * 0.04) % 0.4,
  color: ["#FFD700", "#FF6B6B", "#6BCB77", "#74B9FF", "#FD79A8", "#FFE66D", "#A29BFE"][i % 7],
  size: 10 + (i * 7) % 14,
  shape: i % 3,
  rot: (i * 53) % 360,
}));

const Confetti: React.FC<{ progress: number }> = ({ progress }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      overflow: "hidden",
    }}
  >
    {CONFETTI_DATA.map((p, i) => {
      const localProg = Math.max(0, Math.min(1, (progress - p.delay) / (1 - p.delay)));
      const y = interpolate(localProg, [0, 1], [-5, 110]);
      const opacity =
        localProg > 0.85 ? interpolate(localProg, [0.85, 1], [1, 0]) : 1;
      const borderRadius =
        p.shape === 0 ? "50%" : p.shape === 1 ? "2px" : "0";
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius,
            transform: `rotate(${p.rot + localProg * 360}deg)`,
            opacity,
          }}
        />
      );
    })}
  </div>
);

// ─── Pizza / Cake SVG ─────────────────────────────────────────────────────────

const PieChart: React.FC<{
  fraction: FractionData;
  divideProgress: number;
  highlightProgress: number;
  scaleSpring: number;
}> = ({ fraction, divideProgress, highlightProgress, scaleSpring }) => {
  const { numerator, denominator, highlightColor, sliceColor, baseSliceColor, isCake } =
    fraction;
  const cx = 260;
  const cy = 260;
  const r = 220;
  const crustW = 18;

  const sliceAngle = 360 / denominator;

  return (
    <svg
      width={520}
      height={520}
      viewBox="0 0 520 520"
      style={{
        transform: `scale(${scaleSpring})`,
        transformOrigin: "center",
        filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.3))",
      }}
    >
      {/* ── base slices ── */}
      {Array.from({ length: denominator }, (_, i) => {
        const startA = i * sliceAngle;
        const endA = (i + 1) * sliceAngle;
        const isHighlighted = i < numerator;
        // Each slice reveals in sequence with divideProgress
        const sliceReveal = Math.max(
          0,
          Math.min(1, divideProgress * denominator - i)
        );
        const color = isHighlighted
          ? sliceColor
          : baseSliceColor;

        return (
          <g key={i} style={{ transform: `scale(${sliceReveal})`, transformOrigin: `${cx}px ${cy}px` }}>
            <path
              d={pieSlicePath(cx, cy, r, startA, endA)}
              fill={color}
              stroke="white"
              strokeWidth={4}
              strokeLinejoin="round"
            />
          </g>
        );
      })}

      {/* ── highlight glow on numerator slices ── */}
      {Array.from({ length: numerator }, (_, i) => {
        const startA = i * sliceAngle;
        const endA = (i + 1) * sliceAngle;
        return (
          <path
            key={`hl-${i}`}
            d={pieSlicePath(cx, cy, r, startA, endA)}
            fill={highlightColor}
            opacity={highlightProgress * 0.35}
            stroke="white"
            strokeWidth={5}
          />
        );
      })}

      {/* ── pizza crust / cake border ── */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={isCake ? "#8B4513" : "#C8860A"}
        strokeWidth={crustW}
      />

      {/* ── pizza toppings ── */}
      {!isCake &&
        Array.from({ length: denominator * 2 }, (_, i) => {
          const angle = (i * 360) / (denominator * 2) + sliceAngle / 4;
          const pos = polarToCart(cx, cy, r * 0.6, angle);
          return (
            <circle
              key={`top-${i}`}
              cx={pos.x}
              cy={pos.y}
              r={11}
              fill="#CC2200"
              opacity={0.75}
            />
          );
        })}

      {/* ── cake decorations ── */}
      {isCake &&
        Array.from({ length: denominator }, (_, i) => {
          const angle = (i + 0.5) * sliceAngle;
          const pos = polarToCart(cx, cy, r * 0.72, angle);
          return (
            <g key={`cream-${i}`}>
              <circle cx={pos.x} cy={pos.y} r={18} fill="white" opacity={0.9} />
              <circle cx={pos.x} cy={pos.y} r={8} fill="#FFC0CB" opacity={0.8} />
            </g>
          );
        })}

      {/* ── center circle ── */}
      <circle
        cx={cx}
        cy={cy}
        r={20}
        fill={isCake ? "#8B4513" : "#AA7700"}
        stroke="white"
        strokeWidth={3}
      />

      {/* ── dividing lines (drawn after slices appear) ── */}
      {Array.from({ length: denominator }, (_, i) => {
        const angle = i * sliceAngle;
        const edge = polarToCart(cx, cy, r - crustW / 2, angle);
        const lineProgress = Math.max(
          0,
          Math.min(1, divideProgress * denominator - i)
        );
        const ex = cx + (edge.x - cx) * lineProgress;
        const ey = cy + (edge.y - cy) * lineProgress;
        return (
          <line
            key={`line-${i}`}
            x1={cx}
            y1={cy}
            x2={ex}
            y2={ey}
            stroke="white"
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.9}
          />
        );
      })}
    </svg>
  );
};

// ─── Smiling star character ───────────────────────────────────────────────────

const SmileyStar: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  scale: number;
  delay: number;
}> = ({ x, y, size, color, scale, delay }) => {
  const effectiveScale = Math.max(0, scale - delay);
  return (
    <g
      transform={`translate(${x}, ${y}) scale(${effectiveScale})`}
      style={{ transformOrigin: `${x}px ${y}px` }}
    >
      {/* Star body */}
      <polygon
        points="0,-28 7,-10 26,-10 12,2 17,22 0,11 -17,22 -12,2 -26,-10 -7,-10"
        fill={color}
        stroke="white"
        strokeWidth={3}
        strokeLinejoin="round"
        transform={`scale(${size / 30})`}
      />
      {/* Eyes */}
      <circle cx={-7} cy={-4} r={4} fill="white" transform={`scale(${size / 30})`} />
      <circle cx={7} cy={-4} r={4} fill="white" transform={`scale(${size / 30})`} />
      <circle cx={-6} cy={-3} r={2} fill="#222" transform={`scale(${size / 30})`} />
      <circle cx={8} cy={-3} r={2} fill="#222" transform={`scale(${size / 30})`} />
      {/* Smile */}
      <path
        d="M -7 6 Q 0 13 7 6"
        stroke="white"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        transform={`scale(${size / 30})`}
      />
    </g>
  );
};

// ─── Fraction Scene ───────────────────────────────────────────────────────────

const SCENE_DUR = 195;

const FractionScene: React.FC<{ fraction: FractionData }> = ({ fraction }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { numerator, denominator, bgGradient, highlightColor, name } = fraction;

  // Phase 1: pizza appears (0-40)
  const pieScale = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 160 },
  });

  // Phase 2: slices reveal (20-90)
  const divideProgress = interpolate(frame, [20, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 3: highlight pulse (90-130)
  const highlightProgress = interpolate(frame, [90, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 4: fraction card slides up (120-160)
  const cardSpring = spring({
    frame: Math.max(0, frame - 120),
    fps,
    config: { damping: 12, stiffness: 140 },
  });
  const cardY = interpolate(cardSpring, [0, 1], [200, 0]);

  // Phase 5: stars burst (150+)
  const starsSpring = spring({
    frame: Math.max(0, frame - 150),
    fps,
    config: { damping: 8, stiffness: 200 },
  });

  // Phase 6: confetti (165+)
  const confettiProgress = interpolate(frame, [165, SCENE_DUR], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const STAR_POSITIONS = [
    { x: 100, y: 220, size: 36, delay: 0 },
    { x: 980, y: 180, size: 30, delay: 0.08 },
    { x: 80, y: 700, size: 28, delay: 0.12 },
    { x: 1000, y: 650, size: 32, delay: 0.06 },
    { x: 540, y: 100, size: 34, delay: 0.04 },
    { x: 200, y: 500, size: 22, delay: 0.16 },
    { x: 880, y: 480, size: 24, delay: 0.14 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${bgGradient[0]} 0%, ${bgGradient[1]} 100%)`,
        overflow: "hidden",
      }}
    >
      {/* BG pattern dots */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.08 }}>
        {Array.from({ length: 18 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(i * 37 + 8) % 90}%`,
              top: `${(i * 53 + 6) % 88}%`,
              fontSize: 40 + (i % 3) * 20,
            }}
          >
            {i % 3 === 0 ? "⭐" : i % 3 === 1 ? "🍕" : "🎂"}
          </div>
        ))}
      </div>

      {/* Confetti layer */}
      {frame >= 165 && <Confetti progress={confettiProgress} />}

      {/* Stars */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
        viewBox="0 0 1080 1920"
      >
        {STAR_POSITIONS.map((sp, i) => (
          <SmileyStar
            key={i}
            x={sp.x}
            y={sp.y}
            size={sp.size}
            color="#FFD700"
            scale={starsSpring}
            delay={sp.delay}
          />
        ))}
      </svg>

      {/* Pizza / Cake centered */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -58%)",
        }}
      >
        <PieChart
          fraction={fraction}
          divideProgress={divideProgress}
          highlightProgress={highlightProgress}
          scaleSpring={pieScale}
        />
      </div>

      {/* Fraction card */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          transform: `translateY(${cardY}px)`,
          opacity: cardSpring,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: 36,
            padding: "24px 60px 28px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: 260,
          }}
        >
          {/* Numerator */}
          <div
            style={{
              fontSize: 120,
              fontWeight: "900",
              color: highlightColor,
              fontFamily: "Arial Black, Arial, sans-serif",
              lineHeight: 1,
            }}
          >
            {numerator}
          </div>
          {/* Line */}
          <div
            style={{
              width: "100%",
              height: 7,
              backgroundColor: highlightColor,
              borderRadius: 4,
              margin: "4px 0",
            }}
          />
          {/* Denominator */}
          <div
            style={{
              fontSize: 120,
              fontWeight: "900",
              color: highlightColor,
              fontFamily: "Arial Black, Arial, sans-serif",
              lineHeight: 1,
              opacity: 0.65,
            }}
          >
            {denominator}
          </div>
          {/* Name */}
          <div
            style={{
              marginTop: 10,
              fontSize: 38,
              fontWeight: "bold",
              color: highlightColor,
              fontFamily: "Arial, sans-serif",
              textAlign: "center",
              opacity: 0.85,
            }}
          >
            {name}
          </div>
        </div>
      </div>

      <Watermark />
    </AbsoluteFill>
  );
};

// ─── Intro Scene ──────────────────────────────────────────────────────────────

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });
  const subAppear = interpolate(frame, [35, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subY = interpolate(subAppear, [0, 1], [40, 0]);
  const pizzaScale = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 8, stiffness: 180 },
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(145deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        overflow: "hidden",
      }}
    >
      {/* BG stars */}
      {Array.from({ length: 16 }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${(i * 41 + 5) % 90}%`,
            top: `${(i * 29 + 5) % 88}%`,
            fontSize: 24 + (i % 4) * 14,
            opacity: 0.2 + (i % 3) * 0.08,
          }}
        >
          ⭐
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        {/* Title */}
        <div
          style={{
            transform: `scale(${titleScale})`,
            transformOrigin: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 118,
              fontWeight: "900",
              color: "white",
              fontFamily: "Arial Black, Arial, sans-serif",
              textShadow: "4px 4px 16px rgba(0,0,0,0.4)",
              lineHeight: 1.1,
            }}
          >
            Impariamo
          </div>
          <div
            style={{
              fontSize: 118,
              fontWeight: "900",
              color: "#FFD700",
              fontFamily: "Arial Black, Arial, sans-serif",
              textShadow: "4px 4px 16px rgba(0,0,0,0.5)",
              lineHeight: 1.1,
            }}
          >
            le Frazioni!
          </div>
        </div>

        {/* Pizza emoji */}
        <div
          style={{
            fontSize: 160,
            transform: `scale(${pizzaScale})`,
            transformOrigin: "center",
            lineHeight: 1,
          }}
        >
          🍕
        </div>

        {/* Subtitle */}
        <div
          style={{
            opacity: subAppear,
            transform: `translateY(${subY}px)`,
            textAlign: "center",
            fontSize: 56,
            color: "rgba(255,255,255,0.95)",
            fontFamily: "Arial, sans-serif",
            fontWeight: "700",
            textShadow: "2px 2px 8px rgba(0,0,0,0.35)",
          }}
        >
          Con pizze e torte! 🎂
        </div>
      </div>

      <Watermark />
    </AbsoluteFill>
  );
};

// ─── Outro Scene ──────────────────────────────────────────────────────────────

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainScale = spring({ frame, fps, config: { damping: 10, stiffness: 120 } });
  const subScale = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 10, stiffness: 140 },
  });
  const confettiProg = interpolate(frame, [0, 150], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(145deg, #f093fb 0%, #f5576c 50%, #FDCB6E 100%)",
        overflow: "hidden",
      }}
    >
      <Confetti progress={confettiProg} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
        }}
      >
        <div
          style={{
            transform: `scale(${mainScale})`,
            transformOrigin: "center",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 180, lineHeight: 1 }}>🎉</div>
          <div
            style={{
              fontSize: 148,
              fontWeight: "900",
              color: "white",
              fontFamily: "Arial Black, Arial, sans-serif",
              textShadow: "5px 5px 18px rgba(0,0,0,0.45)",
              lineHeight: 1.05,
            }}
          >
            Bravi!
          </div>
          <div style={{ fontSize: 180, lineHeight: 1 }}>🎉</div>
        </div>

        <div
          style={{
            transform: `scale(${subScale})`,
            opacity: subScale,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 52,
              color: "rgba(255,255,255,0.97)",
              fontFamily: "Arial, sans-serif",
              fontWeight: "700",
              textShadow: "2px 2px 8px rgba(0,0,0,0.35)",
              marginBottom: 20,
            }}
          >
            Avete imparato le frazioni! 🌟
          </div>
          <div style={{ fontSize: 90 }}>⭐⭐⭐</div>
        </div>
      </div>

      <Watermark />
    </AbsoluteFill>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────

const INTRO_DUR = 90;   // 3 s
const OUTRO_DUR = 150;  // 5 s
// 8 fractions × 195 frames = 1560 frames (52 s)
// Total: 90 + 1560 + 150 = 1800 frames = 60 s ✓

export const FractionsVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={INTRO_DUR}>
        <IntroScene />
      </Sequence>

      {FRACTIONS.map((fraction, i) => (
        <Sequence
          key={fraction.name}
          from={INTRO_DUR + i * SCENE_DUR}
          durationInFrames={SCENE_DUR}
        >
          <FractionScene fraction={fraction} />
        </Sequence>
      ))}

      <Sequence
        from={INTRO_DUR + FRACTIONS.length * SCENE_DUR}
        durationInFrames={OUTRO_DUR}
      >
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
