import { useEffect, useState } from "react";

interface Props {
  active: boolean;
  phase: "work" | "rest";
  onComplete: () => void;
}

export function FlashOverlay({ active, phase, onComplete }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!visible) return null;

  const color =
    phase === "work"
      ? "oklch(0.76 0.155 55 / 0.25)"
      : "oklch(0.68 0.14 190 / 0.25)";

  return (
    <div
      className="flash-overlay fixed inset-0 z-50"
      style={{ backgroundColor: color }}
    />
  );
}
