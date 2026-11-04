"use client";

import React from 'react';

export default function Hero() {
  return (
    <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white py-12 px-6 rounded-2xl shadow-xl max-w-6xl mx-auto my-6">
      <div className="max-w-3xl">
        <span className="bg-blue-800 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full">
          ШУТИС-ийн Судалгааны Ёс Зүйн Хороо
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold mt-4 leading-tight">
          Хариуцлагатай, шударга ба ёс зүйтэй судалгааны орчин
        </h1>
        <p className="text-blue-100 text-sm md:text-base mt-3 leading-relaxed">
          Судалгаанд оролцогчдын эрх, аюулгүй байдлыг хамгаалж, олон улсын стандартад нийцсэн ёс зүйн хяналтыг хэрэгжүүлнэ.
        </p>

        {/* Хугацааны товч санамжууд */}
        <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-blue-800/60">
          <div className="bg-blue-900/40 p-3 rounded-lg border border-blue-700/40">
            <p className="text-[11px] text-blue-300">🟢 Чөлөөлөгдөх</p>
            <p className="text-sm font-bold mt-0.5">7 хоног</p>
          </div>
          <div className="bg-blue-900/40 p-3 rounded-lg border border-blue-700/40">
            <p className="text-[11px] text-blue-300">🟡 Хялбаршуулсан</p>
            <p className="text-sm font-bold mt-0.5">14 хоног</p>
          </div>
          <div className="bg-blue-900/40 p-3 rounded-lg border border-blue-700/40">
            <p className="text-[11px] text-blue-300">🔴 Бүрэн хэлэлцүүлэг</p>
            <p className="text-sm font-bold mt-0.5">30 хоног</p>
          </div>
        </div>
      </div>
    </div>
  );
}
