import React from "react"
import { Label } from "./label"

const ratings = ["0", "1", "2", "3", "4", "5"]

export default function SliderWithTooltip({ name, label, value, onChange, error }) {
  return (
    <div className="relative mb-6">
      <Label className="block mb-2">{label}</Label>
      <div className="relative w-full group">
        {/* Slider */}
        <input
          type="range"
          name={name}
          min="0"
          max="5"
          step="1"
          value={value}
          onChange={onChange}
          className="w-full appearance-none h-2 bg-gray-300 rounded-lg outline-none accent-blue-600 hover:accent-blue-500 transition"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(value / 5) * 100}%, #d1d5db ${(value / 5) * 100}%, #d1d5db 100%)`,
          }}
        />

        {/* Tooltip (always visible, animated on hover) */}
        <div
          className="absolute -top-8 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded shadow transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1"
          style={{
            left: `${(value / 5) * 100}%`,
          }}
        >
          {value}
        </div>
      </div>

      {/* Scale markers */}
      <div className="flex justify-between text-sm text-gray-400 mt-2 px-1">
        {ratings.map((rate) => (
          <span key={rate}>{rate}</span>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
