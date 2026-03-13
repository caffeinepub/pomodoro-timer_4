import { motion } from "motion/react";

interface Props {
  seconds: number;
  totalSeconds: number;
  phase: "work" | "rest";
}

export function AnalogDisplay({ seconds, totalSeconds, phase }: Props) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 16;

  // Map remaining seconds to a real clock minute-hand position (0–60 min cycle)
  const minuteFraction = (seconds % 3600) / 3600;
  const angleDeg = minuteFraction * 360 - 90;
  const angleRad = (angleDeg * Math.PI) / 180;

  const handLength = r * 0.78;
  const hx = cx + handLength * Math.cos(angleRad);
  const hy = cy + handLength * Math.sin(angleRad);

  // Arc shows elapsed progress based on total session time
  const fraction = totalSeconds > 0 ? seconds / totalSeconds : 0;
  const elapsedFraction = 1 - fraction;
  const arcAngleStart = -Math.PI / 2;
  const arcAngleEnd = arcAngleStart + elapsedFraction * 2 * Math.PI;
  const largeArc = elapsedFraction > 0.5 ? 1 : 0;
  const arcX1 = cx + r * Math.cos(arcAngleStart);
  const arcY1 = cy + r * Math.sin(arcAngleStart);
  const arcX2 = cx + r * Math.cos(arcAngleEnd);
  const arcY2 = cy + r * Math.sin(arcAngleEnd);
  const arcPath =
    elapsedFraction <= 0
      ? ""
      : elapsedFraction >= 1
        ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`
        : `M ${arcX1} ${arcY1} A ${r} ${r} 0 ${largeArc} 1 ${arcX2} ${arcY2}`;

  const workColor = "oklch(0.76 0.155 55)";
  const restColor = "oklch(0.68 0.14 190)";
  const activeColor = phase === "work" ? workColor : restColor;
  const glowColor =
    phase === "work"
      ? "oklch(0.76 0.155 55 / 0.5)"
      : "oklch(0.68 0.14 190 / 0.5)";

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = ((i / 60) * 360 - 90) * (Math.PI / 180);
    const isMajor = i % 5 === 0;
    const inner = isMajor ? r - 14 : r - 8;
    return {
      key: `tick-${i}`,
      x1: cx + inner * Math.cos(a),
      y1: cy + inner * Math.sin(a),
      x2: cx + r * Math.cos(a),
      y2: cy + r * Math.sin(a),
      isMajor,
    };
  });

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeLabel = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <motion.div
      data-ocid="timer.canvas_target"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-center"
    >
      <svg
        role="img"
        aria-label={`Analog timer: ${timeLabel} remaining`}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        style={{ filter: `drop-shadow(0 0 28px ${glowColor})` }}
      >
        <title>Analog timer: {timeLabel} remaining</title>
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.22 0.015 260)" />
            <stop offset="100%" stopColor="oklch(0.16 0.01 260)" />
          </radialGradient>
        </defs>

        <circle cx={cx} cy={cy} r={r + 4} fill="url(#bgGrad)" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="oklch(0.30 0.015 260)"
          strokeWidth="1.5"
        />

        {ticks.map((t) => (
          <line
            key={t.key}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={
              t.isMajor ? "oklch(0.45 0.02 260)" : "oklch(0.30 0.015 260)"
            }
            strokeWidth={t.isMajor ? 2 : 1}
            strokeLinecap="round"
          />
        ))}

        {arcPath && (
          <path
            d={arcPath}
            fill="none"
            stroke={activeColor}
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.85"
          />
        )}

        <circle cx={cx} cy={cy} r={5} fill={activeColor} />

        <line
          x1={cx}
          y1={cy}
          x2={hx}
          y2={hy}
          stroke={activeColor}
          strokeWidth="3"
          strokeLinecap="round"
          style={{ transition: "x2 0.5s ease, y2 0.5s ease" }}
        />

        <line
          x1={cx}
          y1={cy}
          x2={cx - (hx - cx) * 0.18}
          y2={cy - (hy - cy) * 0.18}
          stroke={activeColor}
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.5"
        />

        <circle cx={cx} cy={cy} r={3} fill="oklch(0.92 0.018 80)" />
      </svg>
    </motion.div>
  );
}
