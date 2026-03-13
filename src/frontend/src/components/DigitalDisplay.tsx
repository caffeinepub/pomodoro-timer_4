import { motion } from "motion/react";

interface Props {
  seconds: number;
  phase: "work" | "rest";
}

export function DigitalDisplay({ seconds, phase }: Props) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <motion.div
      className={`font-digital select-none ${phase === "work" ? "timer-glow-work" : "timer-glow-rest"}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <span
        className="text-[clamp(5rem,18vw,11rem)] font-bold leading-none tracking-widest"
        style={{
          color:
            phase === "work" ? "oklch(0.96 0.04 75)" : "oklch(0.88 0.08 200)",
          textShadow:
            phase === "work"
              ? "0 0 60px oklch(0.76 0.155 55 / 0.6), 0 0 20px oklch(0.76 0.155 55 / 0.4)"
              : "0 0 60px oklch(0.68 0.14 190 / 0.6), 0 0 20px oklch(0.68 0.14 190 / 0.4)",
        }}
      >
        {display}
      </span>
    </motion.div>
  );
}
