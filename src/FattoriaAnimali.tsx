import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Animal {
  name: string;
  sound: string;
  emoji: string;
  nameColor: string;
  soundColor: string;
  bgAccent: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const ANIMALS: Animal[] = [
  { name: "Mucca",   sound: "Muuu!",        emoji: "🐄", nameColor: "#C62828", soundColor: "#FF1744", bgAccent: "rgba(255,200,50,0.18)" },
  { name: "Gallo",   sound: "Chicchirichì!", emoji: "🐓", nameColor: "#E65100", soundColor: "#FF6D00", bgAccent: "rgba(255,140,0,0.16)" },
  { name: "Maiale",  sound: "Oink!",         emoji: "🐷", nameColor: "#AD1457", soundColor: "#F50057", bgAccent: "rgba(255,100,180,0.15)" },
  { name: "Pecora",  sound: "Beee!",         emoji: "🐑", nameColor: "#1565C0", soundColor: "#2979FF", bgAccent: "rgba(100,180,255,0.15)" },
  { name: "Cavallo", sound: "Iiih!",         emoji: "🐴", nameColor: "#4E342E", soundColor: "#795548", bgAccent: "rgba(180,130,80,0.15)" },
  { name: "Cane",    sound: "Bau!",          emoji: "🐶", nameColor: "#BF360C", soundColor: "#FF6F00", bgAccent: "rgba(255,160,40,0.15)" },
  { name: "Gatto",   sound: "Miao!",         emoji: "🐱", nameColor: "#6A1B9A", soundColor: "#AA00FF", bgAccent: "rgba(180,80,255,0.15)" },
  { name: "Anatra",  sound: "Qua Qua!",      emoji: "🦆", nameColor: "#006064", soundColor: "#00BCD4", bgAccent: "rgba(0,220,210,0.15)" },
];

// Scene timing — 1800 frames total = 60 s at 30 fps
const INTRO_DUR   = 90;   // 3 s
const ANIMAL_DUR  = 200;  // 6.67 s × 8 = 1600 frames
const OUTRO_DUR   = 110;  // 3.67 s
// Total: 90 + 1600 + 110 = 1800 ✓

// ─── Deterministic confetti ────────────────────────────────────────────────────
const CONFETTI_COLORS = [
  "#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF6BFF",
  "#FF9B6B","#A0E7E5","#FFAEBC","#C8E6C9","#FFE0B2",
];
const CONFETTI = Array.from({ length: 40 }, (_, i) => ({
  x:            (i * 137 + 30) % 1040 + 20,
  startY:       -40 - (i % 8) * 30,
  color:        CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  w:            14 + (i % 4) * 7,
  h:            8  + (i % 3) * 5,
  rot0:         (i * 53) % 360,
  rotSpd:       10 + (i % 6) * 4,
  fallSpd:      9  + (i % 6) * 2.5,
  wobbleAmp:    18 + (i % 4) * 12,
  wobbleFreq:   0.07 + (i % 4) * 0.03,
  delay:        (i % 12) * 4,
}));

// Deterministic star-burst data (12 stars, evenly spaced)
const STAR_BURST = Array.from({ length: 12 }, (_, i) => ({
  angleDeg:  i * 30,
  dist:      180 + (i % 3) * 80,
  glyph:     (["⭐","🌟","✨","💫"] as const)[i % 4],
  sz:        38 + (i % 3) * 20,
  delay:     Math.floor(i / 4) * 5,
}));

// ─── Background (meadow + sky) ────────────────────────────────────────────────
const Background: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    {/* Sky gradient */}
    <div style={{
      position: "absolute",
      top: 0, left: 0, right: 0, height: "58%",
      background: "linear-gradient(180deg,#5BB8F5 0%,#87CEEB 55%,#B8E4FF 100%)",
    }} />

    {/* Sun */}
    <div style={{
      position: "absolute", top: 70, right: 100,
      width: 130, height: 130, borderRadius: "50%",
      background: "radial-gradient(circle,#FFE566 40%,#FFB300 100%)",
      boxShadow: "0 0 70px 25px rgba(255,220,50,0.55)",
    }} />

    {/* Cloud A */}
    <Cloud style={{ position: "absolute", top: 140, left: 60 }} scale={1} />
    {/* Cloud B */}
    <Cloud style={{ position: "absolute", top: 260, right: 180 }} scale={0.7} />
    {/* Cloud C */}
    <Cloud style={{ position: "absolute", top: 80, left: 380 }} scale={0.55} />

    {/* Ground */}
    <div style={{
      position: "absolute",
      bottom: 0, left: 0, right: 0, height: "46%",
      background: "linear-gradient(180deg,#7DC55E 0%,#5A9E3A 60%,#3D7A26 100%)",
    }} />

    {/* Sky-to-ground blend */}
    <div style={{
      position: "absolute",
      top: "54%", left: 0, right: 0, height: 80,
      background: "linear-gradient(180deg,transparent,#7DC55E)",
    }} />

    {/* Decorative flowers */}
    {[70,195,340,490,635,780,925,1000].map((x, i) => (
      <div key={i} style={{
        position: "absolute",
        bottom: 80 + (i % 3) * 28, left: x, fontSize: 38,
      }}>
        {(["🌸","🌼","🌺","🌻","🌷"] as const)[i % 5]}
      </div>
    ))}

    {/* Fence */}
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      height: 72, display: "flex", alignItems: "flex-end", gap: 4, padding: "0 4px",
    }}>
      {Array.from({ length: 15 }, (_, i) => (
        <div key={i} style={{
          flex: 1, height: 68,
          background: "linear-gradient(180deg,#D4A96A,#A0784A)",
          borderRadius: "4px 4px 0 0",
          border: "1.5px solid #8B6035",
        }} />
      ))}
    </div>
  </AbsoluteFill>
);

const Cloud: React.FC<{ style: React.CSSProperties; scale: number }> = ({ style, scale }) => (
  <div style={{ ...style, transform: `scale(${scale})`, transformOrigin: "top left" }}>
    <div style={{ position: "relative", width: 220, height: 90 }}>
      <div style={{ position: "absolute", bottom: 0, left: 20, width: 180, height: 55, background: "rgba(255,255,255,0.92)", borderRadius: 28 }} />
      <div style={{ position: "absolute", bottom: 28, left: 55, width: 90,  height: 68, background: "rgba(255,255,255,0.92)", borderRadius: 34 }} />
      <div style={{ position: "absolute", bottom: 22, left: 115, width: 72, height: 58, background: "rgba(255,255,255,0.92)", borderRadius: 30 }} />
    </div>
  </div>
);

// ─── Watermark ─────────────────────────────────────────────────────────────────
const Watermark: React.FC = () => (
  <div style={{
    position: "absolute",
    bottom: 88, left: 0, right: 0,
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    fontSize: 33,
    fontWeight: "bold",
    letterSpacing: 1.5,
    color: "#ffffff",
    textShadow: "2px 2px 8px rgba(0,0,0,0.95), -1px -1px 6px rgba(0,0,0,0.85), 0 0 12px rgba(0,0,0,0.6)",
    zIndex: 200,
    pointerEvents: "none",
  }}>
    maestracris.com
  </div>
);

// ─── Confetti burst (uses local frame) ───────────────────────────────────────
const ConfettiBurst: React.FC<{ startAt?: number }> = ({ startAt = 0 }) => {
  const frame = useCurrentFrame();
  const f = frame - startAt;
  if (f < 0) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {CONFETTI.map((c, i) => {
        const lf = Math.max(0, f - c.delay);
        if (lf <= 0) return null;
        const progress = Math.min(1, lf / 90);
        const y  = c.startY + c.fallSpd * lf;
        const x  = c.x + Math.sin(lf * c.wobbleFreq + i) * c.wobbleAmp;
        const rot = c.rot0 + lf * c.rotSpd;
        const opacity = interpolate(progress, [0, 0.08, 0.75, 1], [0, 1, 1, 0], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        if (y > 1960) return null;
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y,
            width: c.w, height: c.h,
            background: c.color, borderRadius: 3,
            opacity, transform: `rotate(${rot}deg)`,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

// ─── Stars burst (uses local frame) ──────────────────────────────────────────
const StarsBurst: React.FC<{ cx?: number; cy?: number; startAt?: number }> = ({
  cx = 540, cy = 780, startAt = 0,
}) => {
  const frame = useCurrentFrame();
  const lf = frame - startAt;
  if (lf < 0) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {STAR_BURST.map((s, i) => {
        const sf = Math.max(0, lf - s.delay);
        const progress = Math.min(1, sf / 45);
        const rad = (s.angleDeg * Math.PI) / 180;
        const dist = interpolate(progress, [0, 0.5, 1], [0, s.dist, s.dist * 1.1]);
        const opacity = interpolate(progress, [0, 0.1, 0.65, 1], [0, 1, 1, 0], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        const x = cx + Math.cos(rad) * dist;
        const y = cy + Math.sin(rad) * dist;
        return (
          <div key={i} style={{
            position: "absolute",
            left: x - s.sz / 2, top: y - s.sz / 2,
            fontSize: s.sz, lineHeight: `${s.sz}px`,
            opacity, transform: `rotate(${sf * 6}deg)`,
            textAlign: "center",
          }}>
            {s.glyph}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ─── Animal scene ─────────────────────────────────────────────────────────────
const AnimalScene: React.FC<{ animal: Animal }> = ({ animal }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animal entrance: spring from scale 0 → 1 with big bounce
  const animalScale = spring({ frame, fps, from: 0, to: 1, config: { damping: 9, stiffness: 200, mass: 0.7 } });

  // Name slide-in
  const nameScale = spring({ frame: Math.max(0, frame - 38), fps, from: 0, to: 1, config: { damping: 11, stiffness: 180, mass: 0.6 } });

  // Sound bounce-in (very springy)
  const soundScale = spring({ frame: Math.max(0, frame - 68), fps, from: 0, to: 1, config: { damping: 5, stiffness: 360, mass: 0.4 } });

  // Continuous bobbing
  const bob    = Math.sin(frame * 0.11) * 22;
  const squishX = 1 + Math.sin(frame * 0.11) * 0.045;
  const squishY = 1 - Math.sin(frame * 0.11) * 0.045;

  // Jiggle when sound appears
  const jiggle = frame >= 68 && frame <= 100 ? Math.sin((frame - 68) * 0.7) * 14 : 0;

  // Pulse on sound text
  const soundPulse = 1 + Math.sin(frame * 0.22) * 0.035;

  // Fade out at end
  const fadeOut = interpolate(frame, [172, 200], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Per-animal soft bg tint */}
      <div style={{ position: "absolute", inset: 0, background: animal.bgAccent }} />

      {/* Animal emoji */}
      <div style={{
        position: "absolute",
        top: 310, left: 0, right: 0,
        textAlign: "center",
        fontSize: 295,
        lineHeight: 1,
        transform: `
          translateY(${(1 - animalScale) * 450 + bob}px)
          translateX(${jiggle}px)
          scale(${animalScale * squishX}, ${animalScale * squishY})
        `,
        filter: "drop-shadow(0 22px 28px rgba(0,0,0,0.28))",
      }}>
        {animal.emoji}
      </div>

      {/* Animal name */}
      <div style={{
        position: "absolute",
        top: 1060, left: 20, right: 20,
        textAlign: "center",
        fontFamily: "'Arial Rounded MT Bold','Arial Black',Arial,sans-serif",
        fontSize: 118,
        fontWeight: 900,
        color: animal.nameColor,
        textShadow: "4px 4px 0 rgba(0,0,0,0.18), 0 0 30px rgba(255,255,255,0.4)",
        letterSpacing: 3,
        transform: `scale(${nameScale}) translateY(${(1 - nameScale) * 60}px)`,
        opacity: nameScale,
      }}>
        {animal.name}
      </div>

      {/* Sound speech bubble */}
      <div style={{
        position: "absolute",
        top: 1215, left: 40, right: 40,
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-block",
          background: "rgba(255,255,255,0.92)",
          borderRadius: 40,
          padding: "18px 44px",
          boxShadow: `0 8px 32px rgba(0,0,0,0.18), 0 0 0 5px ${animal.soundColor}55`,
          transform: `scale(${soundScale * soundPulse})`,
          opacity: soundScale,
        }}>
          <span style={{
            fontFamily: "'Arial Rounded MT Bold','Arial Black',Arial,sans-serif",
            fontSize: 90,
            fontWeight: 900,
            color: animal.soundColor,
            textShadow: "2px 2px 0 rgba(0,0,0,0.12)",
            letterSpacing: 1,
          }}>
            {animal.sound}
          </span>
        </div>
        {/* Bubble tail */}
        <div style={{
          display: "inline-block",
          position: "absolute",
          top: -22, left: "50%",
          transform: "translateX(-50%)",
          width: 0, height: 0,
          borderLeft: "20px solid transparent",
          borderRight: "20px solid transparent",
          borderBottom: "28px solid rgba(255,255,255,0.92)",
          opacity: soundScale,
        }} />
      </div>

      {/* Stars and confetti on sound reveal */}
      <StarsBurst cx={540} cy={1260} startAt={68} />
      <ConfettiBurst startAt={68} />
    </AbsoluteFill>
  );
};

// ─── Intro scene ──────────────────────────────────────────────────────────────
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame, fps, from: 0, to: 1, config: { damping: 10, stiffness: 140, mass: 0.9 } });
  const cowScale   = spring({ frame: Math.max(0, frame - 22), fps, from: 0, to: 1, config: { damping: 8, stiffness: 190 } });
  const subOp      = interpolate(frame, [45, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subY       = interpolate(frame, [45, 65], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut    = interpolate(frame, [72, 90], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bob        = Math.sin(frame * 0.1) * 18;

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Title */}
      <div style={{
        position: "absolute",
        top: 260, left: 30, right: 30,
        textAlign: "center",
        fontFamily: "'Arial Rounded MT Bold','Arial Black',Arial,sans-serif",
        fontSize: 112,
        fontWeight: 900,
        color: "#E65100",
        lineHeight: 1.2,
        textShadow: "4px 4px 0 rgba(0,0,0,0.18), 0 0 40px rgba(255,180,0,0.4)",
        transform: `scale(${titleScale})`,
        opacity: titleScale,
        letterSpacing: 1,
      }}>
        Gli Animali<br />della Fattoria!
      </div>

      {/* Cow emoji */}
      <div style={{
        position: "absolute",
        top: 640, left: 0, right: 0,
        textAlign: "center",
        fontSize: 310,
        transform: `scale(${cowScale}) translateY(${bob}px)`,
        opacity: cowScale,
        filter: "drop-shadow(0 24px 32px rgba(0,0,0,0.28))",
      }}>
        🐄
      </div>

      {/* Subtitle */}
      <div style={{
        position: "absolute",
        top: 1130, left: 0, right: 0,
        textAlign: "center",
        fontFamily: "'Arial Rounded MT Bold','Arial Black',Arial,sans-serif",
        fontSize: 62,
        fontWeight: 700,
        color: "#1B5E20",
        textShadow: "2px 2px 0 rgba(255,255,255,0.8)",
        opacity: subOp,
        transform: `translateY(${subY}px)`,
      }}>
        Impariamo i versi! 🎵
      </div>
    </AbsoluteFill>
  );
};

// ─── Outro scene ──────────────────────────────────────────────────────────────
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const braviScale = spring({ frame, fps, from: 0, to: 1, config: { damping: 7, stiffness: 180, mass: 0.8 } });
  const animalOp   = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const animalY    = interpolate(frame, [30, 55], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textOp     = interpolate(frame, [55, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bob        = Math.sin(frame * 0.09) * 15;
  const pulse      = 1 + Math.sin(frame * 0.18) * 0.04;

  return (
    <AbsoluteFill>
      {/* BRAVI! */}
      <div style={{
        position: "absolute",
        top: 240, left: 20, right: 20,
        textAlign: "center",
        fontFamily: "'Arial Rounded MT Bold','Arial Black',Arial,sans-serif",
        fontSize: 168,
        fontWeight: 900,
        color: "#E91E63",
        textShadow: "5px 5px 0 rgba(0,0,0,0.2), 0 0 60px rgba(255,80,120,0.45)",
        transform: `scale(${braviScale * pulse})`,
        opacity: braviScale,
        letterSpacing: 2,
      }}>
        Bravi! 🎉
      </div>

      {/* Animal parade */}
      <div style={{
        position: "absolute",
        top: 620, left: 0, right: 0,
        textAlign: "center",
        fontSize: 108,
        lineHeight: 1.4,
        transform: `translateY(${animalY + bob}px)`,
        opacity: animalOp,
      }}>
        🐄🐓🐷🐑<br />🐴🐶🐱🦆
      </div>

      {/* Congratulations */}
      <div style={{
        position: "absolute",
        top: 1130, left: 40, right: 40,
        textAlign: "center",
        fontFamily: "'Arial Rounded MT Bold','Arial Black',Arial,sans-serif",
        fontSize: 66,
        fontWeight: 700,
        color: "#1565C0",
        lineHeight: 1.35,
        textShadow: "2px 2px 0 rgba(255,255,255,0.85)",
        opacity: textOp,
      }}>
        Ora conosci tutti<br />gli animali! 🌟
      </div>

      <ConfettiBurst startAt={2} />
      <ConfettiBurst startAt={28} />
      <StarsBurst cx={540} cy={900} startAt={5} />
    </AbsoluteFill>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const FattoriaAnimali: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Persistent background */}
      <Background />

      {/* Intro */}
      <Sequence from={0} durationInFrames={INTRO_DUR}>
        <IntroScene />
      </Sequence>

      {/* One scene per animal */}
      {ANIMALS.map((animal, i) => (
        <Sequence
          key={animal.name}
          from={INTRO_DUR + i * ANIMAL_DUR}
          durationInFrames={ANIMAL_DUR}
        >
          <AnimalScene animal={animal} />
        </Sequence>
      ))}

      {/* Outro */}
      <Sequence from={INTRO_DUR + ANIMALS.length * ANIMAL_DUR} durationInFrames={OUTRO_DUR}>
        <OutroScene />
      </Sequence>

      {/* Watermark — always visible */}
      <Watermark />
    </AbsoluteFill>
  );
};
