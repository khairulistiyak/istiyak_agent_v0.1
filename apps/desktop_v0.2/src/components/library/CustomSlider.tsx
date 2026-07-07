import React from "react";

interface CustomSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
}

export const CustomSlider: React.FC<CustomSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-sm text-left">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{label}</span>
        <span className="text-[10px] font-mono text-gray-300">{value}</span>
      </div>
      <input 
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-white bg-white/10 h-1 rounded-lg cursor-pointer outline-none border-none"
      />
    </div>
  );
};
