import React, { useState } from "react";
import { tnDistricts } from "../constants/tnLocations";

export default function AreaSelector({ selectedDistrict, setSelectedDistrict, selectedTaluk, setSelectedTaluk }) {
  // மாவட்டத்தைத் தேர்ந்தெடுத்தவுடன் அதற்குரிய தாலுகாக்கள் மாற வேண்டும்
  const availableTaluks = selectedDistrict ? tnDistricts[selectedDistrict] || [] : [];

  return (
    <div className="grid grid-cols-2 gap-3 mb-3">
      {/* 1. மாவட்டம் (District) Dropdown */}
      <div>
        <label className="text-xs font-medium text-slate-500 block mb-1">மாவட்டம் (District)</label>
        <select
          value={selectedDistrict}
          onChange={(e) => {
            setSelectedDistrict(e.target.value);
            setSelectedTaluk(""); // மாவட்டம் மாறும்போது தாலுகாவை ரீசெட் செய்ய
          }}
          className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white outline-none"
        >
          <option value="">மாவட்டத்தைத் தேர்ந்தெடுக்கவும்</option>
          {Object.keys(tnDistricts).map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>

      {/* 2. தாலுகா (Taluk) Dropdown */}
      <div>
        <label className="text-xs font-medium text-slate-500 block mb-1">தாலுகா / பகுதி (Taluk)</label>
        <select
          value={selectedTaluk}
          onChange={(e) => setSelectedTaluk(e.target.value)}
          disabled={!selectedDistrict}
          className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white outline-none disabled:bg-slate-100"
        >
          <option value="">தாலுகாவைத் தேர்ந்தெடுக்கவும்</option>
          {availableTaluks.map((taluk) => (
            <option key={taluk} value={taluk}>
              {taluk}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
