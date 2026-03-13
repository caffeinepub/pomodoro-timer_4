import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Clock, Monitor, Palette, Pause, Play, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnalogDisplay } from "./components/AnalogDisplay";
import { BACKGROUNDS, BackgroundPicker } from "./components/BackgroundPicker";
import { DigitalDisplay } from "./components/DigitalDisplay";
import { FlashOverlay } from "./components/FlashOverlay";
import { useGetPreferences, useUpdatePreferences } from "./hooks/useQueries";

const PRESETS = [
  { id: "25/5", label: "25 / 5", work: 25, rest: 5 },
  { id: "55/10", label: "55 / 10", work: 55, rest: 10 },
  { id: "45/5", label: "45 / 5", work: 45, rest: 5 },
  { id: "custom", label: "Custom", work: 25, rest: 5 },
];

type Phase = "work" | "rest";
type DisplayMode = "digital" | "analog";

export default function App() {
  const { data: savedPrefs } = useGetPreferences();
  const { mutate: savePreferences } = useUpdatePreferences();

  const [selectedPreset, setSelectedPreset] = useState("25/5");
  const [customWork, setCustomWork] = useState(25);
  const [customRest, setCustomRest] = useState(5);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("digital");
  const [background, setBackground] = useState("default");
  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (savedPrefs && !prefsLoaded) {
      setPrefsLoaded(true);
      const preset = savedPrefs.selectedPreset || "25/5";
      const wm = Number(savedPrefs.customWorkMinutes) || 25;
      const rm = Number(savedPrefs.customRestMinutes) || 5;
      const dm = (savedPrefs.displayMode as DisplayMode) || "digital";
      const bg = savedPrefs.background || "default";

      setSelectedPreset(preset);
      setCustomWork(wm);
      setCustomRest(rm);
      setDisplayMode(dm);
      setBackground(bg);

      const presetData = PRESETS.find((p) => p.id === preset);
      const workMins = preset === "custom" ? wm : (presetData?.work ?? 25);
      setSecondsLeft(workMins * 60);
      setTotalSeconds(workMins * 60);
    }
  }, [savedPrefs, prefsLoaded]);

  const getWorkRest = useCallback(() => {
    if (selectedPreset === "custom") {
      return { work: customWork, rest: customRest };
    }
    const preset = PRESETS.find((p) => p.id === selectedPreset);
    return { work: preset?.work ?? 25, rest: preset?.rest ?? 5 };
  }, [selectedPreset, customWork, customRest]);

  const persistPrefs = useCallback(
    (updates: {
      preset?: string;
      cw?: number;
      cr?: number;
      dm?: DisplayMode;
      bg?: string;
    }) => {
      const effectivePreset = updates.preset ?? selectedPreset;
      const effectiveCW = updates.cw ?? customWork;
      const effectiveCR = updates.cr ?? customRest;
      const effectiveDM = updates.dm ?? displayMode;
      const effectiveBG = updates.bg ?? background;
      savePreferences({
        selectedPreset: effectivePreset,
        customWorkMinutes: BigInt(effectiveCW),
        customRestMinutes: BigInt(effectiveCR),
        displayMode: effectiveDM,
        background: effectiveBG,
      });
    },
    [
      selectedPreset,
      customWork,
      customRest,
      displayMode,
      background,
      savePreferences,
    ],
  );

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setShowFlash(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const handleFlashComplete = useCallback(() => {
    setShowFlash(false);
    const { work, rest } = getWorkRest();
    if (phase === "work") {
      setPhase("rest");
      setSecondsLeft(rest * 60);
      setTotalSeconds(rest * 60);
    } else {
      setPhase("work");
      setSecondsLeft(work * 60);
      setTotalSeconds(work * 60);
    }
  }, [phase, getWorkRest]);

  const handleSelectPreset = (id: string) => {
    setRunning(false);
    setSelectedPreset(id);
    setPhase("work");
    const preset = PRESETS.find((p) => p.id === id);
    const work = id === "custom" ? customWork : (preset?.work ?? 25);
    setSecondsLeft(work * 60);
    setTotalSeconds(work * 60);
    persistPrefs({ preset: id });
  };

  const handleCustomChange = (type: "work" | "rest", val: string) => {
    const n = Math.max(1, Math.min(999, Number.parseInt(val) || 1));
    if (type === "work") {
      setCustomWork(n);
      if (selectedPreset === "custom" && phase === "work") {
        setSecondsLeft(n * 60);
        setTotalSeconds(n * 60);
      }
      persistPrefs({ cw: n });
    } else {
      setCustomRest(n);
      if (selectedPreset === "custom" && phase === "rest") {
        setSecondsLeft(n * 60);
        setTotalSeconds(n * 60);
      }
      persistPrefs({ cr: n });
    }
  };

  const handleReset = () => {
    setRunning(false);
    setPhase("work");
    const { work } = getWorkRest();
    setSecondsLeft(work * 60);
    setTotalSeconds(work * 60);
  };

  const handleDisplayModeToggle = (checked: boolean) => {
    const mode: DisplayMode = checked ? "analog" : "digital";
    setDisplayMode(mode);
    persistPrefs({ dm: mode });
  };

  const handleBgSelect = (id: string) => {
    setBackground(id);
    persistPrefs({ bg: id });
  };

  const bgData = BACKGROUNDS.find((b) => b.id === background);
  const bgStyle = bgData?.style ?? BACKGROUNDS[0].style;
  const isGradient = bgStyle.includes("gradient");

  const progress =
    totalSeconds > 0 ? (1 - secondsLeft / totalSeconds) * 100 : 0;

  return (
    <div
      className="min-h-screen flex flex-col bg-transition relative overflow-hidden"
      style={
        isGradient ? { background: bgStyle } : { backgroundColor: bgStyle }
      }
    >
      <FlashOverlay
        active={showFlash}
        phase={phase}
        onComplete={handleFlashComplete}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "oklch(0.76 0.155 55 / 0.2)",
              border: "1px solid oklch(0.76 0.155 55 / 0.4)",
            }}
          >
            <Clock
              className="w-4 h-4"
              style={{ color: "oklch(0.76 0.155 55)" }}
            />
          </div>
          <span className="font-display font-semibold text-foreground tracking-tight">
            Pomodoro
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
          <Switch
            id="display-mode"
            checked={displayMode === "analog"}
            onCheckedChange={handleDisplayModeToggle}
            data-ocid="timer.display_mode.toggle"
          />
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <Label
            htmlFor="display-mode"
            className="text-xs text-muted-foreground sr-only"
          >
            Display Mode
          </Label>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
        {/* Preset tabs */}
        <div className="flex gap-2 flex-wrap justify-center">
          {PRESETS.map((p, i) => (
            <button
              type="button"
              key={p.id}
              data-ocid={`timer.tab.${i + 1}`}
              onClick={() => handleSelectPreset(p.id)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                background:
                  selectedPreset === p.id
                    ? "oklch(0.76 0.155 55)"
                    : "oklch(0.22 0.012 260)",
                color:
                  selectedPreset === p.id
                    ? "oklch(0.13 0.008 260)"
                    : "oklch(0.65 0.02 260)",
                border:
                  selectedPreset === p.id
                    ? "1px solid oklch(0.76 0.155 55)"
                    : "1px solid oklch(0.28 0.015 260)",
                boxShadow:
                  selectedPreset === p.id
                    ? "0 0 16px oklch(0.76 0.155 55 / 0.35)"
                    : "none",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom inputs */}
        <AnimatePresence>
          {selectedPreset === "custom" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="flex gap-4 overflow-hidden"
            >
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  Work (min)
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={999}
                  value={customWork}
                  onChange={(e) => handleCustomChange("work", e.target.value)}
                  className="w-24 text-center font-mono"
                  data-ocid="timer.custom.input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  Rest (min)
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={999}
                  value={customRest}
                  onChange={(e) => handleCustomChange("rest", e.target.value)}
                  className="w-24 text-center font-mono"
                  data-ocid="timer.custom_rest.input"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase indicator */}
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse-soft"
            style={{
              background:
                phase === "work"
                  ? "oklch(0.76 0.155 55)"
                  : "oklch(0.68 0.14 190)",
            }}
          />
          <span
            className="text-sm font-medium tracking-widest uppercase"
            style={{
              color:
                phase === "work"
                  ? "oklch(0.76 0.155 55)"
                  : "oklch(0.68 0.14 190)",
              letterSpacing: "0.2em",
            }}
          >
            {phase === "work" ? "Focus" : "Rest"}
          </span>
        </motion.div>

        {/* Timer display */}
        <div className="relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            {displayMode === "digital" ? (
              <motion.div
                key="digital"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DigitalDisplay seconds={secondsLeft} phase={phase} />
              </motion.div>
            ) : (
              <motion.div
                key="analog"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AnalogDisplay
                  seconds={secondsLeft}
                  totalSeconds={totalSeconds}
                  phase={phase}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div
          className="w-full max-w-xs h-1 rounded-full overflow-hidden"
          style={{ background: "oklch(0.22 0.012 260)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background:
                phase === "work"
                  ? "oklch(0.76 0.155 55)"
                  : "oklch(0.68 0.14 190)",
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            data-ocid="timer.reset_button"
            className="h-11 w-11 rounded-full border-border"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <button
            type="button"
            data-ocid={running ? "timer.pause_button" : "timer.start_button"}
            onClick={() => setRunning((r) => !r)}
            className="h-16 w-16 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background:
                phase === "work"
                  ? "oklch(0.76 0.155 55)"
                  : "oklch(0.68 0.14 190)",
              boxShadow:
                phase === "work"
                  ? "0 0 32px oklch(0.76 0.155 55 / 0.45), 0 4px 20px rgba(0,0,0,0.3)"
                  : "0 0 32px oklch(0.68 0.14 190 / 0.45), 0 4px 20px rgba(0,0,0,0.3)",
              color: "oklch(0.13 0.008 260)",
            }}
          >
            {running ? (
              <Pause className="h-6 w-6" fill="currentColor" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" fill="currentColor" />
            )}
          </button>

          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowBgPicker((v) => !v)}
              data-ocid="timer.background.button"
              className="h-11 w-11 rounded-full border-border"
              title="Change Background"
            >
              <Palette className="h-4 w-4" />
            </Button>
            <BackgroundPicker
              current={background}
              onSelect={handleBgSelect}
              open={showBgPicker}
              onClose={() => setShowBgPicker(false)}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {selectedPreset === "custom"
            ? `${customWork}m work · ${customRest}m rest`
            : `${PRESETS.find((p) => p.id === selectedPreset)?.work}m work · ${PRESETS.find((p) => p.id === selectedPreset)?.rest}m rest`}
        </p>
      </main>

      <footer className="relative z-10 text-center py-4 px-4">
        <p className="text-xs text-muted-foreground opacity-50">
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
