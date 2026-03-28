import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Easing,
} from "remotion";

// ── Brand colors from maestracris.com ──────────────────────────────────────
const COLORS = {
  yellow: "#FFD600",
  green: "#4CAF50",
  blue: "#1565C0",
  pink: "#E91E63",
  lightBlue: "#E3F2FD",
  darkBlue: "#0D1B5E",
  white: "#FFFFFF",
  orange: "#FF6F00",
  purple: "#7B1FA2",
  teal: "#00897B",
};

const FPS = 30;

// ── Utility: fade-in opacity ────────────────────────────────────────────────
function fadeIn(frame: number, start: number, duration: number = 15): number {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function fadeOut(frame: number, start: number, duration: number = 15): number {
  return interpolate(frame, [start, start + duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

// ── Floating decorative bulb / element ─────────────────────────────────────
const FloatingBulb: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  frame: number;
}> = ({ x, y, size, color, delay, frame }) => {
  const offset = Math.sin((frame + delay * 20) / 40) * 18;
  const rotate = Math.sin((frame + delay * 15) / 55) * 10;
  const opacity = interpolate(frame, [delay, delay + 20], [0, 0.85], {
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
        opacity,
        transform: `rotate(${rotate}deg)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.55,
        boxShadow: `0 8px 32px ${color}66`,
      }}
    >
      💡
    </div>
  );
};

// ── Confetti dot ───────────────────────────────────────────────────────────
const ConfettiDot: React.FC<{
  x: number;
  startY: number;
  size: number;
  color: string;
  delay: number;
  frame: number;
}> = ({ x, startY, size, color, delay, frame }) => {
  const progress = interpolate(frame - delay, [0, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = startY + progress * 1200;
  const rotate = progress * 720;
  if (frame < delay) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size * 0.2,
        background: color,
        transform: `rotate(${rotate}deg)`,
        opacity: 1 - progress * 0.5,
      }}
    />
  );
};

// ── Scene 1 – Intro (frames 0–150, 0-5s) ──────────────────────────────────
const SceneIntro: React.FC<{ frame: number }> = ({ frame }) => {
  const logoScale = spring({
    frame,
    fps: FPS,
    from: 0.4,
    to: 1,
    config: { damping: 12, stiffness: 120 },
  });
  const titleY = spring({
    frame: Math.max(0, frame - 15),
    fps: FPS,
    from: 80,
    to: 0,
    config: { damping: 14, stiffness: 100 },
  });
  const titleOpacity = fadeIn(frame, 15, 20);
  const subOpacity = fadeIn(frame, 40, 20);
  const tagOpacity = fadeIn(frame, 70, 20);

  const confettiColors = [
    COLORS.yellow, COLORS.pink, COLORS.green, COLORS.blue,
    COLORS.orange, COLORS.purple, COLORS.teal,
  ];
  const confetti = Array.from({ length: 20 }, (_, i) => ({
    x: (i * 73 + 50) % 980,
    startY: -30 - (i % 5) * 40,
    size: 10 + (i % 4) * 8,
    color: confettiColors[i % confettiColors.length],
    delay: (i % 6) * 5,
  }));

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.darkBlue} 0%, #1a237e 55%, #283593 100%)`,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {/* confetti burst */}
      {confetti.map((c, i) => (
        <ConfettiDot key={i} {...c} frame={frame} />
      ))}

      {/* floating bulbs background */}
      <FloatingBulb x={40}  y={200} size={70} color={COLORS.yellow} delay={10} frame={frame} />
      <FloatingBulb x={900} y={350} size={55} color={COLORS.pink}   delay={5}  frame={frame} />
      <FloatingBulb x={60}  y={700} size={60} color={COLORS.green}  delay={20} frame={frame} />
      <FloatingBulb x={880} y={900} size={65} color={COLORS.blue}   delay={15} frame={frame} />

      {/* Logo circle */}
      <div
        style={{
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: COLORS.yellow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 110,
          transform: `scale(${logoScale})`,
          boxShadow: `0 0 60px ${COLORS.yellow}88`,
          marginBottom: 48,
        }}
      >
        📚
      </div>

      {/* Site name */}
      <div
        style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: 92,
            fontWeight: 900,
            color: COLORS.white,
            letterSpacing: -2,
            textShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          Maestra
          <span style={{ color: COLORS.yellow }}> Cris</span>
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: subOpacity,
          marginTop: 24,
          fontSize: 44,
          color: COLORS.lightBlue,
          fontFamily: "sans-serif",
          textAlign: "center",
          padding: "0 60px",
          lineHeight: 1.3,
        }}
      >
        Risorse didattiche gratuite
      </div>

      {/* Stars row */}
      <div
        style={{
          opacity: tagOpacity,
          marginTop: 36,
          display: "flex",
          gap: 12,
        }}
      >
        {["⭐", "⭐", "⭐", "⭐", "⭐"].map((s, i) => (
          <span key={i} style={{ fontSize: 42 }}>{s}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2 – Content categories (frames 150–420, 5-14s) ──────────────────
const CategoryCard: React.FC<{
  emoji: string;
  label: string;
  color: string;
  frame: number;
  delay: number;
}> = ({ emoji, label, color, frame, delay }) => {
  const scale = spring({
    frame: Math.max(0, frame - delay),
    fps: FPS,
    from: 0,
    to: 1,
    config: { damping: 11, stiffness: 130 },
  });
  return (
    <div
      style={{
        width: 440,
        background: COLORS.white,
        borderRadius: 28,
        padding: "36px 28px",
        display: "flex",
        alignItems: "center",
        gap: 24,
        boxShadow: `0 12px 40px rgba(0,0,0,0.22)`,
        transform: `scale(${scale})`,
        borderLeft: `10px solid ${color}`,
      }}
    >
      <span style={{ fontSize: 64 }}>{emoji}</span>
      <span
        style={{
          fontFamily: "sans-serif",
          fontWeight: 700,
          fontSize: 36,
          color: COLORS.darkBlue,
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>
    </div>
  );
};

const SceneCategorie: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOp = fadeIn(frame, 0, 20);
  const titleY = spring({ frame, fps: FPS, from: -40, to: 0, config: { damping: 14 } });

  const categories = [
    { emoji: "🔢", label: "Matematica", color: COLORS.blue,   delay: 20 },
    { emoji: "📖", label: "Attività Didattiche", color: COLORS.green,  delay: 40 },
    { emoji: "🎮", label: "Giochi Didattici", color: COLORS.pink,   delay: 60 },
    { emoji: "💻", label: "Strumenti PC", color: COLORS.orange, delay: 80 },
    { emoji: "📊", label: "Excel & Office", color: COLORS.purple, delay: 100 },
    { emoji: "🌍", label: "Strumenti Utili", color: COLORS.teal,   delay: 120 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${COLORS.lightBlue} 0%, #BBDEFB 100%)`,
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 100,
        gap: 0,
      }}
    >
      {/* decorative circles */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: COLORS.yellow, opacity: 0.25 }} />
      <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, borderRadius: "50%", background: COLORS.pink, opacity: 0.2 }} />

      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontFamily: "sans-serif",
          fontWeight: 900,
          fontSize: 66,
          color: COLORS.darkBlue,
          textAlign: "center",
          marginBottom: 60,
          lineHeight: 1.15,
          padding: "0 60px",
        }}
      >
        Cosa trovi sul blog?
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 32, alignItems: "center" }}>
        {categories.map((c, i) => (
          <CategoryCard key={i} {...c} frame={frame} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3 – Showcase features (frames 420–660, 14-22s) ──────────────────
const FeatureItem: React.FC<{
  icon: string;
  text: string;
  frame: number;
  delay: number;
  color: string;
}> = ({ icon, text, frame, delay, color }) => {
  const x = spring({
    frame: Math.max(0, frame - delay),
    fps: FPS,
    from: -120,
    to: 0,
    config: { damping: 13, stiffness: 110 },
  });
  const op = fadeIn(frame, delay, 15);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 30,
        transform: `translateX(${x}px)`,
        opacity: op,
        background: "rgba(255,255,255,0.15)",
        borderRadius: 20,
        padding: "28px 36px",
        width: 900,
        backdropFilter: "blur(4px)",
        border: `2px solid ${color}55`,
      }}
    >
      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: 20,
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 50,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontFamily: "sans-serif",
          fontSize: 42,
          color: COLORS.white,
          fontWeight: 600,
          lineHeight: 1.25,
        }}
      >
        {text}
      </span>
    </div>
  );
};

const SceneFeatures: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOp = fadeIn(frame, 0, 20);

  const features = [
    { icon: "🆓", text: "Tutto completamente GRATIS", color: COLORS.yellow,  delay: 20 },
    { icon: "🖨️", text: "Stampabile in PDF", color: COLORS.green,  delay: 50 },
    { icon: "🧑‍🏫", text: "Per insegnanti e genitori", color: COLORS.pink,   delay: 80 },
    { icon: "🎯", text: "Schede pronte all'uso", color: COLORS.blue,   delay: 110 },
    { icon: "🔄", text: "Aggiornato ogni settimana", color: COLORS.orange, delay: 140 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(145deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)`,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 36,
        padding: "60px 40px",
      }}
    >
      {/* top decoration */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: `linear-gradient(90deg, ${COLORS.yellow}, ${COLORS.pink}, ${COLORS.blue}, ${COLORS.green})` }} />

      <div
        style={{
          opacity: titleOp,
          fontFamily: "sans-serif",
          fontWeight: 900,
          fontSize: 70,
          color: COLORS.white,
          textAlign: "center",
          marginBottom: 20,
          lineHeight: 1.15,
          textShadow: "0 3px 16px rgba(0,0,0,0.4)",
        }}
      >
        Perché scegliere<br />
        <span style={{ color: COLORS.yellow }}>MaestraCris?</span>
      </div>

      {features.map((f, i) => (
        <FeatureItem key={i} {...f} frame={frame} />
      ))}
    </AbsoluteFill>
  );
};

// ── Scene 4 – CTA / Outro (frames 660–900, 22-30s) ────────────────────────
const SceneOutro: React.FC<{ frame: number }> = ({ frame }) => {
  const bgScale = interpolate(frame, [0, 240], [1.06, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const logoScale = spring({
    frame: Math.max(0, frame - 20),
    fps: FPS,
    from: 0,
    to: 1,
    config: { damping: 10, stiffness: 120 },
  });

  const titleOp = fadeIn(frame, 30, 20);
  const titleY = spring({
    frame: Math.max(0, frame - 30),
    fps: FPS,
    from: 60,
    to: 0,
    config: { damping: 14 },
  });

  const urlOp = fadeIn(frame, 70, 25);
  const urlScale = spring({
    frame: Math.max(0, frame - 70),
    fps: FPS,
    from: 0.7,
    to: 1,
    config: { damping: 12, stiffness: 120 },
  });

  const ctaOp = fadeIn(frame, 110, 20);
  const ctaBounce = spring({
    frame: Math.max(0, frame - 110),
    fps: FPS,
    from: 0,
    to: 1,
    config: { damping: 8, stiffness: 160 },
  });

  const pulse = 1 + Math.sin(frame / 12) * 0.03;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.darkBlue} 0%, #1a237e 60%, #4527A0 100%)`,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        transform: `scale(${bgScale})`,
      }}
    >
      {/* rainbow top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 12,
          background: `linear-gradient(90deg, ${COLORS.yellow}, ${COLORS.orange}, ${COLORS.pink}, ${COLORS.purple}, ${COLORS.blue}, ${COLORS.teal}, ${COLORS.green})`,
        }}
      />

      {/* floating decorations */}
      <FloatingBulb x={30}  y={150} size={80} color={COLORS.yellow} delay={0}  frame={frame} />
      <FloatingBulb x={880} y={300} size={60} color={COLORS.pink}   delay={10} frame={frame} />
      <FloatingBulb x={50}  y={900} size={70} color={COLORS.green}  delay={5}  frame={frame} />
      <FloatingBulb x={870} y={1100} size={75} color={COLORS.blue}  delay={15} frame={frame} />

      {/* pencil icons scattered */}
      {[
        { x: 120, y: 500, rot: 25 },
        { x: 870, y: 700, rot: -30 },
        { x: 80,  y: 1300, rot: 15 },
        { x: 890, y: 1500, rot: -20 },
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            fontSize: 55,
            transform: `rotate(${p.rot}deg)`,
            opacity: 0.5,
          }}
        >
          ✏️
        </div>
      ))}

      {/* Logo */}
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: COLORS.yellow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 100,
          transform: `scale(${logoScale})`,
          boxShadow: `0 0 80px ${COLORS.yellow}66`,
          marginBottom: 36,
        }}
      >
        📚
      </div>

      {/* Title */}
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: 88,
            fontWeight: 900,
            color: COLORS.white,
            textShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          Maestra<span style={{ color: COLORS.yellow }}>Cris</span>
        </div>
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 40,
            color: COLORS.lightBlue,
            marginTop: 8,
          }}
        >
          Il blog per chi ama insegnare
        </div>
      </div>

      {/* URL box */}
      <div
        style={{
          opacity: urlOp,
          transform: `scale(${urlScale * pulse})`,
          background: COLORS.yellow,
          borderRadius: 24,
          padding: "28px 60px",
          marginTop: 40,
          boxShadow: `0 8px 40px ${COLORS.yellow}88`,
        }}
      >
        <span
          style={{
            fontFamily: "sans-serif",
            fontSize: 58,
            fontWeight: 900,
            color: COLORS.darkBlue,
            letterSpacing: 1,
          }}
        >
          maestracris.com
        </span>
      </div>

      {/* CTA button */}
      <div
        style={{
          opacity: ctaOp,
          transform: `scale(${ctaBounce})`,
          marginTop: 48,
          background: COLORS.pink,
          borderRadius: 60,
          padding: "32px 80px",
          boxShadow: `0 8px 32px ${COLORS.pink}88`,
        }}
      >
        <span
          style={{
            fontFamily: "sans-serif",
            fontWeight: 900,
            fontSize: 50,
            color: COLORS.white,
            letterSpacing: 0.5,
          }}
        >
          Visita ora! 🎉
        </span>
      </div>

      {/* rainbow bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 12,
          background: `linear-gradient(90deg, ${COLORS.green}, ${COLORS.teal}, ${COLORS.blue}, ${COLORS.purple}, ${COLORS.pink}, ${COLORS.orange}, ${COLORS.yellow})`,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Transition overlay ─────────────────────────────────────────────────────
const Transition: React.FC<{ frame: number; totalFrames: number; color: string }> = ({
  frame,
  totalFrames,
  color,
}) => {
  const half = totalFrames / 2;
  const scale = frame < half
    ? interpolate(frame, [0, half], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) })
    : interpolate(frame, [half, totalFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill
      style={{
        background: color,
        transform: `scale(${scale})`,
        borderRadius: `${(1 - scale) * 50}%`,
        pointerEvents: "none",
      }}
    />
  );
};

// ── Root composition ───────────────────────────────────────────────────────
export const VideoPromozionale: React.FC = () => {
  const frame = useCurrentFrame();

  // Scene timing (frames)
  // Intro:      0   – 165  (0-5.5s)
  // Transition: 150 – 180
  // Categorie:  165 – 435  (5.5-14.5s)
  // Transition: 420 – 450
  // Features:   435 – 675  (14.5-22.5s)
  // Transition: 660 – 690
  // Outro:      675 – 900  (22.5-30s)

  const transitionDur = 30;

  return (
    <AbsoluteFill style={{ background: COLORS.darkBlue }}>
      {/* ── Scene 1: Intro ── */}
      <Sequence from={0} durationInFrames={180}>
        <SceneIntro frame={frame} />
      </Sequence>

      {/* ── Transition 1→2 ── */}
      <Sequence from={150} durationInFrames={transitionDur}>
        <Transition
          frame={frame - 150}
          totalFrames={transitionDur}
          color={COLORS.lightBlue}
        />
      </Sequence>

      {/* ── Scene 2: Categorie ── */}
      <Sequence from={165} durationInFrames={285}>
        <SceneCategorie frame={frame - 165} />
      </Sequence>

      {/* ── Transition 2→3 ── */}
      <Sequence from={435} durationInFrames={transitionDur}>
        <Transition
          frame={frame - 435}
          totalFrames={transitionDur}
          color={COLORS.green}
        />
      </Sequence>

      {/* ── Scene 3: Features ── */}
      <Sequence from={450} durationInFrames={225}>
        <SceneFeatures frame={frame - 450} />
      </Sequence>

      {/* ── Transition 3→4 ── */}
      <Sequence from={660} durationInFrames={transitionDur}>
        <Transition
          frame={frame - 660}
          totalFrames={transitionDur}
          color={COLORS.darkBlue}
        />
      </Sequence>

      {/* ── Scene 4: Outro / CTA ── */}
      <Sequence from={675} durationInFrames={225}>
        <SceneOutro frame={frame - 675} />
      </Sequence>
    </AbsoluteFill>
  );
};
