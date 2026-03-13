import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export const BACKGROUNDS: { id: string; label: string; style: string }[] = [
  { id: "default", label: "Deep Slate", style: "oklch(0.13 0.008 260)" },
  { id: "charcoal", label: "Warm Charcoal", style: "oklch(0.14 0.005 50)" },
  { id: "navy", label: "Deep Navy", style: "oklch(0.18 0.04 250)" },
  { id: "forest", label: "Forest", style: "oklch(0.15 0.03 160)" },
  {
    id: "sunset",
    label: "Sunset",
    style: "linear-gradient(135deg, oklch(0.20 0.06 30), oklch(0.15 0.04 300))",
  },
  {
    id: "midnight",
    label: "Midnight",
    style:
      "linear-gradient(135deg, oklch(0.13 0.02 270), oklch(0.10 0.03 300))",
  },
  {
    id: "rose",
    label: "Soft Rose",
    style: "linear-gradient(135deg, oklch(0.18 0.03 10), oklch(0.15 0.02 290))",
  },
  {
    id: "aurora",
    label: "Aurora",
    style:
      "linear-gradient(135deg, oklch(0.14 0.04 200), oklch(0.12 0.05 160))",
  },
];

interface Props {
  current: string;
  onSelect: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

export function BackgroundPicker({ current, onSelect, open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-full mb-3 right-0 z-40 rounded-xl border border-border bg-card p-4 shadow-2xl"
          style={{ minWidth: 260 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">
              Background
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
              data-ocid="timer.background.close_button"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {BACKGROUNDS.map((bg, i) => (
              <button
                type="button"
                key={bg.id}
                data-ocid={`timer.background.item.${i + 1}`}
                onClick={() => {
                  onSelect(bg.id);
                  onClose();
                }}
                className="group relative flex flex-col items-center gap-1.5"
                title={bg.label}
              >
                <div
                  className="h-10 w-10 rounded-lg border-2 transition-all duration-200"
                  style={{
                    background: bg.style,
                    borderColor:
                      current === bg.id
                        ? "oklch(0.76 0.155 55)"
                        : "oklch(0.28 0.015 260)",
                    boxShadow:
                      current === bg.id
                        ? "0 0 12px oklch(0.76 0.155 55 / 0.5)"
                        : "none",
                  }}
                />
                <span className="text-[9px] text-muted-foreground text-center leading-tight w-10 truncate">
                  {bg.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
