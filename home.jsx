import React, { useState, useCallback, useMemo } from "react";
import { RotateCcw, Activity, Zap, Waves, CircleDot } from "lucide-react";
import WaveformSimulator from "@/components/WaveformSimulator";
import ControlSlider from "@/components/ControlSlider";

const DEFAULTS = {
  amplitude: 60,
  frequency: 2,
  influenceStrength: 70,
  entityRadius: 40,
  collapseThreshold: 55,
};

export default function Home() {
  const [params, setParams] = useState(DEFAULTS);
  const [tension, setTension] = useState(0);
  const [collapseCount, setCollapseCount] = useState(0);
  const [lastCollapse, setLastCollapse] = useState(null);

  const set = useCallback((key) => (v) => setParams((p) => ({ ...p, [key]: v })), []);
  const reset = useCallback(() => {
    setParams(DEFAULTS);
    setCollapseCount(0);
    setLastCollapse(null);
  }, []);

  const onTension = useCallback((t) => setTension(t), []);
  const onCollapse = useCallback((info) => {
    setCollapseCount((c) => c + 1);
    setLastCollapse({ ...info, time: Date.now() });
  }, []);

  const tensionPct = Math.round(tension * 100);
  const thresholdPct = params.collapseThreshold;
  const ratio = useMemo(() => tensionPct / thresholdPct, [tensionPct, thresholdPct]);
  const nearCollapse = ratio > 0.8;

  return (
    <div className="min-h-screen bg-[#05070f] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Waves className="w-5 h-5 text-sky-400" />
            Waveform & Observed Entity Simulator
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">SEFI/DEFI Geometry Engine — field curvature, tension routing & collapse</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Collapses</span>
            <span className="font-mono font-semibold text-amber-300">{collapseCount}</span>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 grid lg:grid-cols-[1fr_320px] gap-0">
        {/* Canvas area */}
        <div className="p-4 lg:p-6 flex flex-col gap-4 min-h-0">
          <div className="flex-1 min-h-[360px] lg:min-h-0 rounded-2xl overflow-hidden border border-white/10 bg-[#05070f] relative">
            <WaveformSimulator params={params} onTension={onTension} onCollapse={onCollapse} />
            {/* Hint */}
            <div className="absolute bottom-3 left-4 text-[11px] text-slate-500 pointer-events-none">
              Drag the glowing entity to distort the field
            </div>
          </div>

          {/* Tension meter */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                Geometric Tension
              </span>
              <span className={`text-xs font-mono tabular-nums ${nearCollapse ? "text-red-400" : "text-slate-300"}`}>
                {tensionPct}% / threshold {thresholdPct}%
              </span>
            </div>
            <div className="relative h-2.5 rounded-full bg-slate-800/80 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-100"
                style={{
                  width: `${Math.min(100, tensionPct)}%`,
                  background: `linear-gradient(90deg, hsl(200 85% 55%), hsl(${lerp(200, 0, Math.min(1, ratio))} 90% 55%))`,
                }}
              />
              {/* threshold marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white/70"
                style={{ left: `${thresholdPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
              <span>{lastCollapse ? `Last collapse at ${Math.round(lastCollapse.tension * 100)}% tension` : "No collapse yet"}</span>
              <span className={nearCollapse ? "text-red-400 animate-pulse" : ""}>{nearCollapse ? "near collapse" : "stable"}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <aside className="border-t lg:border-t-0 lg:border-l border-white/5 bg-white/[0.02] p-5 space-y-5 overflow-y-auto">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5" /> Waveform (SEFI)
            </h2>
            <div className="space-y-4">
              <ControlSlider label="Amplitude" value={params.amplitude} min={5} max={120} onChange={set("amplitude")} accent="#38bdf8" />
              <ControlSlider label="Frequency" value={params.frequency} min={0.5} max={6} step={0.1} onChange={set("frequency")} accent="#38bdf8" />
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <CircleDot className="w-3.5 h-3.5" /> Observed Entity (DEFI)
            </h2>
            <div className="space-y-4">
              <ControlSlider label="Influence Strength" value={params.influenceStrength} min={0} max={150} onChange={set("influenceStrength")} accent="#f59e0b" />
              <ControlSlider label="Entity Radius" value={params.entityRadius} min={10} max={120} onChange={set("entityRadius")} accent="#f59e0b" />
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Collapse
            </h2>
            <div className="space-y-4">
              <ControlSlider label="Collapse Threshold" value={params.collapseThreshold} min={10} max={95} onChange={set("collapseThreshold")} accent="#ef4444" />
            </div>
          </div>

          {/* Explanation */}
          <div className="pt-3 border-t border-white/5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">SEFI / DEFI</h3>
            <p className="text-[11px] leading-relaxed text-slate-400">
              <span className="text-sky-300">SEFI</span> — the global field geometry, shown as the continuous waveform.
              <span className="text-amber-300"> DEFI</span> — how a localized entity distorts that geometry, pulling the field toward it.
              As curvature rises, geometric tension builds; when it exceeds the threshold, the field <span className="text-red-300">collapses</span> into a new stable configuration.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function lerp(a, b, t) { return a + (b - a) * t; }