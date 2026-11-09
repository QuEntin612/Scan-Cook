"use client";

import { fr } from "@/lib/profile";

type Props = {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
};

// Grand curseur facile à manipuler au doigt. La piste est remplie en vert jusqu'à la poignée.
export default function Slider({ id, label, unit, min, max, step, value, onChange }: Props) {
  const decimals = step < 1 ? 1 : 0;
  const pct = ((value - min) / (max - min)) * 100;
  const shown = decimals && Number.isInteger(value) ? fr(value) : fr(value, decimals);
  return (
    <div className="slider">
      <div className="slider-head">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="slider-value" aria-live="polite">
          {shown} <span className="slider-unit">{unit}</span>
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${shown} ${unit}`}
        style={{ "--pct": `${pct}%` } as React.CSSProperties}
      />
      <div className="slider-bounds" aria-hidden="true">
        <span>{fr(min)} {unit}</span>
        <span>{fr(max)} {unit}</span>
      </div>
    </div>
  );
}
