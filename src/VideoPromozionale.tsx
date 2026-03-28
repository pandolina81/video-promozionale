import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  Sequence,
  Easing,
} from "remotion";

// ── Canva Brand Colors ──────────────────────────────────────────────────────
const C = {
  purple: "#7D2AE8",
  purpleLight: "#9B59F5",
  purpleDark: "#5B1FA8",
  white: "#FFFFFF",
  offWhite: "#F5F0FF",
  black: "#1A1A2E",
  gray: "#6B7280",
  grayLight: "#E8E0F5",
  accent: "#00C4CC",
  accentWarm: "#FF6B6B",
  accentYellow: "#FFD166",
};

const FPS = 30;

function fadeIn(frame: number, start: number, dur = 15): number {
  return interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function slideUp(frame: number, start: number, dur = 20): number {
  return spring({
    frame: Math.max(0, frame - start),
    fps: FPS,
    from: 60,
    to: 0,
    config: { damping: 14, stiffness: 120 },
  });
}

// ── Animated background grid ───────────────────────────────────────────────
const GridBg: React.FC<{ frame: number; opacity?: number }> = ({ frame, opacity = 0.06 }) => {
  const offset = (frame * 0.5) % 80;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        backgroundImage: `
          linear-gradient(${C.white} 1px, transparent 1px),
          linear-gradient(90deg, ${C.white} 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        backgroundPosition: `0 ${offset}px`,
      }}
    />
  );
};

// ── Floating shape decoration ──────────────────────────────────────────────
const FloatShape: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  shape: "circle" | "square" | "diamond";
  delay: number;
  frame: number;
  opacity?: number;
}> = ({ x, y, size, color, shape, delay, frame, opacity = 0.7 }) => {
  const yOff = Math.sin((frame + delay * 30) / 50) * 14;
  const rot = Math.sin((frame + delay * 20) / 70) * 12;
  const op = interpolate(frame, [delay, delay + 20], [0, opacity], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const borderRadius =
    shape === "circle" ? "50%" : shape === "diamond" ? "8px" : "16px";
  const transform =
    shape === "diamond"
      ? `rotate(${45 + rot}deg)`
      : `rotate(${rot}deg)`;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + yOff,
        width: size,
        height: size,
        borderRadius,
        background: color,
        opacity: op,
        transform,
        boxShadow: `0 8px 32px ${color}44`,
      }}
    />
  );
};

// ── Pill / chip badge ──────────────────────────────────────────────────────
const Pill: React.FC<{
  label: string;
  color?: string;
  textColor?: string;
  fontSize?: number;
}> = ({ label, color = C.purple, textColor = C.white, fontSize = 28 }) => (
  <div
    style={{
      background: color,
      borderRadius: 100,
      padding: "10px 28px",
      display: "inline-flex",
      alignItems: "center",
    }}
  >
    <span
      style={{
        fontFamily: "sans-serif",
        fontWeight: 700,
        fontSize,
        color: textColor,
        letterSpacing: 0.3,
      }}
    >
      {label}
    </span>
  </div>
);

// ── Scene 1: Intro (0-210 frames, 0-7s) ───────────────────────────────────
const SceneIntro: React.FC<{ frame: number }> = ({ frame }) => {
  const logoScale = spring({
    frame,
    fps: FPS,
    from: 0.3,
    to: 1,
    config: { damping: 11, stiffness: 130 },
  });

  const logoGlow = interpolate(frame, [30, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineOp = fadeIn(frame, 40, 20);
  const taglineY = slideUp(frame, 40, 20);
  const subtitleOp = fadeIn(frame, 70, 20);
  const subtitleY = slideUp(frame, 70, 20);
  const badgeOp = fadeIn(frame, 100, 20);

  const pulse = 1 + Math.sin(frame / 20) * 0.03;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(170deg, ${C.purpleDark} 0%, ${C.purple} 50%, ${C.purpleLight} 100%)`,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <GridBg frame={frame} opacity={0.08} />

      {/* Floating shapes */}
      <FloatShape x={-20} y={200}  size={120} color={C.accent}      shape="circle"  delay={5}  frame={frame} opacity={0.25} />
      <FloatShape x={940} y={400}  size={90}  color={C.accentWarm}  shape="diamond" delay={10} frame={frame} opacity={0.2}  />
      <FloatShape x={30}  y={800}  size={80}  color={C.accentYellow} shape="square" delay={15} frame={frame} opacity={0.2}  />
      <FloatShape x={920} y={1100} size={100} color={C.purpleLight} shape="circle"  delay={8}  frame={frame} opacity={0.15} />
      <FloatShape x={-10} y={1400} size={70}  color={C.accent}      shape="diamond" delay={20} frame={frame} opacity={0.2}  />
      <FloatShape x={950} y={1600} size={85}  color={C.accentWarm}  shape="circle"  delay={12} frame={frame} opacity={0.2}  />

      {/* Canva Logo "C" */}
      <div
        style={{
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: C.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${logoScale * pulse})`,
          boxShadow: `0 0 ${80 * logoGlow}px ${C.white}66, 0 0 ${160 * logoGlow}px ${C.purpleLight}44`,
          marginBottom: 52,
        }}
      >
        <span
          style={{
            fontFamily: "sans-serif",
            fontWeight: 900,
            fontSize: 130,
            color: C.purple,
            lineHeight: 1,
            letterSpacing: -4,
          }}
        >
          C
        </span>
      </div>

      {/* Main title */}
      <div
        style={{
          opacity: taglineOp,
          transform: `translateY(${taglineY}px)`,
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 900,
            fontSize: 110,
            color: C.white,
            letterSpacing: -3,
            lineHeight: 0.95,
            textShadow: "0 4px 32px rgba(0,0,0,0.3)",
          }}
        >
          Canva
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: subtitleOp,
          transform: `translateY(${subtitleY}px)`,
          textAlign: "center",
          padding: "0 80px",
          marginBottom: 48,
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 400,
            fontSize: 46,
            color: "rgba(255,255,255,0.88)",
            lineHeight: 1.35,
          }}
        >
          Crea grafiche straordinarie{"\n"}in pochi minuti
        </div>
      </div>

      {/* Badge */}
      <div style={{ opacity: badgeOp, display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", padding: "0 60px" }}>
        <Pill label="✦ Gratis" color="rgba(255,255,255,0.2)" fontSize={32} />
        <Pill label="✦ Online" color="rgba(255,255,255,0.2)" fontSize={32} />
        <Pill label="✦ Intuitivo" color="rgba(255,255,255,0.2)" fontSize={32} />
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: Templates (210-450 frames, 7-15s) ────────────────────────────
const TemplateCard: React.FC<{
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  frame: number;
  delay: number;
  index: number;
}> = ({ emoji, title, subtitle, color, frame, delay, index }) => {
  const scale = spring({
    frame: Math.max(0, frame - delay),
    fps: FPS,
    from: 0,
    to: 1,
    config: { damping: 12, stiffness: 140 },
  });
  const op = fadeIn(frame, delay, 15);

  return (
    <div
      style={{
        background: C.white,
        borderRadius: 28,
        padding: "28px 32px",
        display: "flex",
        alignItems: "center",
        gap: 28,
        boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
        transform: `scale(${scale})`,
        opacity: op,
        width: 880,
        borderLeft: `8px solid ${color}`,
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: 20,
          background: `${color}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 56,
          flexShrink: 0,
        }}
      >
        {emoji}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 800,
            fontSize: 40,
            color: C.black,
            lineHeight: 1.1,
            marginBottom: 8,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 400,
            fontSize: 30,
            color: C.gray,
            lineHeight: 1.2,
          }}
        >
          {subtitle}
        </div>
      </div>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.white,
          fontSize: 22,
          fontWeight: 900,
          flexShrink: 0,
        }}
      >
        →
      </div>
    </div>
  );
};

const SceneTemplates: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOp = fadeIn(frame, 0, 20);
  const titleY = slideUp(frame, 0, 20);

  const templates = [
    { emoji: "📱", title: "Post Social", subtitle: "Instagram, Facebook, TikTok", color: C.accentWarm, delay: 20 },
    { emoji: "🎨", title: "Presentazioni", subtitle: "Slide professionali in un clic", color: C.purple, delay: 50 },
    { emoji: "📄", title: "Flyer & Locandine", subtitle: "Stampa pronta in minuti", color: C.accent, delay: 80 },
    { emoji: "🎬", title: "Video & Reel", subtitle: "Contenuti animati coinvolgenti", color: C.accentYellow, delay: 110 },
    { emoji: "🛍️", title: "Branding & Logo", subtitle: "Identità visiva unica", color: "#FF6EC7", delay: 140 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: C.offWhite,
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 90,
        gap: 0,
      }}
    >
      {/* top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 10,
          background: `linear-gradient(90deg, ${C.purple}, ${C.accent}, ${C.accentWarm})`,
        }}
      />

      {/* decorative circles */}
      <div style={{ position: "absolute", top: -100, right: -80, width: 320, height: 320, borderRadius: "50%", background: C.purple, opacity: 0.07 }} />
      <div style={{ position: "absolute", bottom: -80, left: -60, width: 280, height: 280, borderRadius: "50%", background: C.accent, opacity: 0.07 }} />

      {/* Section title */}
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
          marginBottom: 56,
          padding: "0 60px",
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 900,
            fontSize: 72,
            color: C.black,
            lineHeight: 1.1,
          }}
        >
          Migliaia di{" "}
          <span style={{ color: C.purple }}>Template</span>
        </div>
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 38,
            color: C.gray,
            marginTop: 16,
            fontWeight: 400,
          }}
        >
          Scegli, personalizza, pubblica
        </div>
      </div>

      {/* Template cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 28, alignItems: "center" }}>
        {templates.map((t, i) => (
          <TemplateCard key={i} {...t} frame={frame} index={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: Features (450-690 frames, 15-23s) ────────────────────────────
const FeatureBlock: React.FC<{
  icon: string;
  title: string;
  desc: string;
  color: string;
  frame: number;
  delay: number;
  fromLeft?: boolean;
}> = ({ icon, title, desc, color, frame, delay, fromLeft = true }) => {
  const x = spring({
    frame: Math.max(0, frame - delay),
    fps: FPS,
    from: fromLeft ? -140 : 140,
    to: 0,
    config: { damping: 14, stiffness: 110 },
  });
  const op = fadeIn(frame, delay, 20);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 32,
        transform: `translateX(${x}px)`,
        opacity: op,
        background: "rgba(255,255,255,0.1)",
        borderRadius: 28,
        padding: "36px 40px",
        width: 900,
        backdropFilter: "blur(8px)",
        border: `1.5px solid rgba(255,255,255,0.15)`,
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: 24,
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 52,
          flexShrink: 0,
          boxShadow: `0 8px 28px ${color}55`,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 800,
            fontSize: 46,
            color: C.white,
            lineHeight: 1.1,
            marginBottom: 10,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 400,
            fontSize: 33,
            color: "rgba(255,255,255,0.75)",
            lineHeight: 1.35,
          }}
        >
          {desc}
        </div>
      </div>
    </div>
  );
};

const SceneFeatures: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOp = fadeIn(frame, 0, 20);
  const titleY = slideUp(frame, 0, 20);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${C.purpleDark} 0%, #3B1A7A 50%, ${C.purple} 100%)`,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 36,
        padding: "60px 40px",
      }}
    >
      <GridBg frame={frame} opacity={0.06} />

      <FloatShape x={-30} y={100}  size={110} color={C.accent}      shape="circle"  delay={0}  frame={frame} opacity={0.18} />
      <FloatShape x={950} y={600}  size={90}  color={C.accentWarm}  shape="diamond" delay={5}  frame={frame} opacity={0.15} />
      <FloatShape x={-20} y={1300} size={80}  color={C.accentYellow} shape="circle" delay={10} frame={frame} opacity={0.15} />

      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 900,
            fontSize: 72,
            color: C.white,
            lineHeight: 1.1,
            textShadow: "0 3px 20px rgba(0,0,0,0.3)",
          }}
        >
          Come funziona
        </div>
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 38,
            color: "rgba(255,255,255,0.65)",
            marginTop: 12,
          }}
        >
          Semplice. Veloce. Potente.
        </div>
      </div>

      <FeatureBlock
        icon="🖱️"
        title="Drag & Drop"
        desc="Trascina elementi, testi e immagini — nessuna esperienza richiesta"
        color={C.accent}
        frame={frame}
        delay={30}
        fromLeft={true}
      />
      <FeatureBlock
        icon="🎨"
        title="Personalizzazione totale"
        desc="Colori, font, layout: ogni dettaglio è tuo"
        color={C.accentYellow}
        frame={frame}
        delay={70}
        fromLeft={false}
      />
      <FeatureBlock
        icon="📤"
        title="Esportazione facile"
        desc="PNG, PDF, MP4 o condividi direttamente online"
        color={C.accentWarm}
        frame={frame}
        delay={110}
        fromLeft={true}
      />
      <FeatureBlock
        icon="☁️"
        title="Salvataggio automatico"
        desc="Il tuo lavoro è sempre al sicuro nel cloud"
        color="#9B59F5"
        frame={frame}
        delay={150}
        fromLeft={false}
      />
    </AbsoluteFill>
  );
};

// ── Scene 4: CTA Outro (690-900 frames, 23-30s) ───────────────────────────
const SceneOutro: React.FC<{ frame: number }> = ({ frame }) => {
  const logoScale = spring({
    frame: Math.max(0, frame - 10),
    fps: FPS,
    from: 0,
    to: 1,
    config: { damping: 11, stiffness: 130 },
  });

  const titleOp = fadeIn(frame, 30, 20);
  const titleY = slideUp(frame, 30, 20);

  const urlOp = fadeIn(frame, 70, 20);
  const urlScale = spring({
    frame: Math.max(0, frame - 70),
    fps: FPS,
    from: 0.75,
    to: 1,
    config: { damping: 10, stiffness: 140 },
  });

  const ctaOp = fadeIn(frame, 110, 20);
  const ctaScale = spring({
    frame: Math.max(0, frame - 110),
    fps: FPS,
    from: 0,
    to: 1,
    config: { damping: 8, stiffness: 160 },
  });

  const noteOp = fadeIn(frame, 150, 20);

  const pulse = 1 + Math.sin(frame / 14) * 0.025;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(170deg, ${C.purpleDark} 0%, ${C.purple} 55%, ${C.purpleLight} 100%)`,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <GridBg frame={frame} opacity={0.07} />

      {/* Top gradient bar */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 10,
          background: `linear-gradient(90deg, ${C.accent}, ${C.purple}, ${C.accentWarm})`,
        }}
      />

      {/* Floating shapes */}
      <FloatShape x={-30} y={150}  size={130} color={C.accent}       shape="circle"  delay={0}  frame={frame} opacity={0.22} />
      <FloatShape x={940} y={350}  size={100} color={C.accentWarm}   shape="diamond" delay={8}  frame={frame} opacity={0.18} />
      <FloatShape x={20}  y={900}  size={90}  color={C.accentYellow} shape="square"  delay={4}  frame={frame} opacity={0.18} />
      <FloatShape x={930} y={1100} size={110} color={C.purpleLight}  shape="circle"  delay={12} frame={frame} opacity={0.15} />
      <FloatShape x={-20} y={1500} size={85}  color={C.accent}       shape="diamond" delay={16} frame={frame} opacity={0.18} />
      <FloatShape x={940} y={1650} size={95}  color={C.accentWarm}   shape="circle"  delay={6}  frame={frame} opacity={0.15} />

      {/* Canva "C" logo */}
      <div
        style={{
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: C.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${logoScale})`,
          boxShadow: `0 0 80px rgba(255,255,255,0.3), 0 0 160px ${C.purpleLight}44`,
          marginBottom: 44,
        }}
      >
        <span
          style={{
            fontFamily: "sans-serif",
            fontWeight: 900,
            fontSize: 120,
            color: C.purple,
            lineHeight: 1,
            letterSpacing: -4,
          }}
        >
          C
        </span>
      </div>

      {/* Title */}
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
          marginBottom: 16,
          padding: "0 60px",
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 900,
            fontSize: 90,
            color: C.white,
            letterSpacing: -2,
            lineHeight: 0.95,
            textShadow: "0 4px 28px rgba(0,0,0,0.25)",
          }}
        >
          Crea. Condividi.
        </div>
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 900,
            fontSize: 90,
            color: C.white,
            letterSpacing: -2,
            lineHeight: 0.95,
            marginTop: 8,
          }}
        >
          <span style={{ color: C.accentYellow }}>Stupisci.</span>
        </div>
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 38,
            color: "rgba(255,255,255,0.75)",
            marginTop: 28,
            fontWeight: 400,
            lineHeight: 1.3,
          }}
        >
          Il design alla portata di tutti
        </div>
      </div>

      {/* URL badge */}
      <div
        style={{
          opacity: urlOp,
          transform: `scale(${urlScale * pulse})`,
          background: C.white,
          borderRadius: 28,
          padding: "28px 64px",
          marginTop: 48,
          boxShadow: `0 12px 48px rgba(0,0,0,0.25)`,
        }}
      >
        <span
          style={{
            fontFamily: "sans-serif",
            fontWeight: 900,
            fontSize: 62,
            color: C.purple,
            letterSpacing: -1,
          }}
        >
          canva.com
        </span>
      </div>

      {/* CTA button */}
      <div
        style={{
          opacity: ctaOp,
          transform: `scale(${ctaScale})`,
          marginTop: 44,
          background: `linear-gradient(135deg, ${C.accent}, ${C.accentWarm})`,
          borderRadius: 100,
          padding: "34px 88px",
          boxShadow: `0 12px 40px rgba(0,196,204,0.45)`,
        }}
      >
        <span
          style={{
            fontFamily: "sans-serif",
            fontWeight: 900,
            fontSize: 52,
            color: C.white,
            letterSpacing: 0.5,
          }}
        >
          Inizia Gratis →
        </span>
      </div>

      {/* Fine print */}
      <div
        style={{
          opacity: noteOp,
          position: "absolute",
          bottom: 60,
          fontFamily: "sans-serif",
          fontSize: 28,
          color: "rgba(255,255,255,0.5)",
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        Nessuna carta di credito richiesta
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: 10,
          background: `linear-gradient(90deg, ${C.accentWarm}, ${C.purple}, ${C.accent})`,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Wipe transition ────────────────────────────────────────────────────────
const WipeTransition: React.FC<{ frame: number; totalFrames: number; color: string }> = ({
  frame,
  totalFrames,
  color,
}) => {
  const half = totalFrames / 2;
  const progress =
    frame < half
      ? interpolate(frame, [0, half], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.cubic),
        })
      : interpolate(frame, [half, totalFrames], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });

  return (
    <AbsoluteFill
      style={{
        background: color,
        transform: `scaleY(${progress})`,
        transformOrigin: "center",
        pointerEvents: "none",
      }}
    />
  );
};

// ── Root composition ───────────────────────────────────────────────────────
// Total: 900 frames = 30s at 30fps
// Scene 1 Intro:      0   – 225  (0–7.5s)
// Transition 1→2:   210   – 240
// Scene 2 Templates: 225  – 465  (7.5–15.5s)
// Transition 2→3:   450   – 480
// Scene 3 Features:  465  – 705  (15.5–23.5s)
// Transition 3→4:   690   – 720
// Scene 4 Outro:     705  – 900  (23.5–30s)

export const VideoPromozionale: React.FC = () => {
  const frame = useCurrentFrame();
  const TR = 30; // transition duration in frames

  return (
    <AbsoluteFill style={{ background: C.purpleDark }}>
      {/* Scene 1: Intro */}
      <Sequence from={0} durationInFrames={240}>
        <SceneIntro frame={frame} />
      </Sequence>

      {/* Transition 1→2 */}
      <Sequence from={210} durationInFrames={TR}>
        <WipeTransition frame={frame - 210} totalFrames={TR} color={C.offWhite} />
      </Sequence>

      {/* Scene 2: Templates */}
      <Sequence from={225} durationInFrames={255}>
        <SceneTemplates frame={frame - 225} />
      </Sequence>

      {/* Transition 2→3 */}
      <Sequence from={450} durationInFrames={TR}>
        <WipeTransition frame={frame - 450} totalFrames={TR} color={C.purpleDark} />
      </Sequence>

      {/* Scene 3: Features */}
      <Sequence from={465} durationInFrames={255}>
        <SceneFeatures frame={frame - 465} />
      </Sequence>

      {/* Transition 3→4 */}
      <Sequence from={690} durationInFrames={TR}>
        <WipeTransition frame={frame - 690} totalFrames={TR} color={C.purple} />
      </Sequence>

      {/* Scene 4: Outro CTA */}
      <Sequence from={705} durationInFrames={195}>
        <SceneOutro frame={frame - 705} />
      </Sequence>
    </AbsoluteFill>
  );
};
