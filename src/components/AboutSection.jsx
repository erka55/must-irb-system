"use client";

import React from 'react';

export default function AboutSection() {
  return (
    <div className="max-w-4xl mx-auto my-8 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      {/* Товч танилцуулга */}
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-blue-900">
          🏛️ Хорооны Тухай ба Үйл Ажиллагаа
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          ШУТИС-ийн Судалгааны ёс зүйн хорооны бүтцийн болон үйл ажиллагааны үндсэн зарчим.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
          <h3 className="font-bold text-blue-900 text-sm mb-2">🎯 Зорилго ба Үүрэг</h3>
          <p className="text-xs text-gray-700 leading-relaxed">
            Судалгаанд оролцогчдын эрх, аюулгүй байдлыг хамгаалж, олон улсын стандартад нийцсэн ёс зүйн үнэлгээг хараат бусаар хэрэгжүүлэхэд оршино.
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-bold text-gray-900 text-sm mb-2">⚖️ Хараат Бус Байдал ба Зөрчил</h3>
          <p className="text-xs text-gray-700 leading-relaxed">
            Хорооны гишүүд тухайн судалгаатай холбоотой ашиг сонирхлын зөрчилтэй бол 2 ажлын өдрийн дотор мэдэгдэж, хэлэлцүүлгээс гарна.
          </p>
        </div>
      </div>

      {/* Явцын Санамж ба Гомдол Мэдээлэх */}
      <div className="border-t pt-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">
          ⚠️ Судлаачийн Анхаарах Яаралтай Санамж
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-xs font-bold text-amber-900">🚨 Яаралтай мэдэгдэл</span>
            <p className="text-xs text-amber-800 mt-1">
              Судалгааны явцад аюул, зөрчил гарвал <strong>48 цагийн дотор</strong> хороонд мэдээлнэ.
            </p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-xs font-bold text-blue-900">📅 Явцын тайлан</span>
            <p className="text-xs text-blue-800 mt-1">
              Урт хугацааны судалгаанд <strong>6 сар тутамд</strong>, өндөр эрсдэлтэй бол <strong>3 сар тутамд</strong> тайгнана.
            </p>
          </div>

          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <span className="text-xs font-bold text-purple-900">⚖️ Давж заалдах</span>
            <p className="text-xs text-purple-800 mt-1">
              Шийдвэртэй санал нийлэхгүй бол гарснаас хойш <strong>14 хоногийн дотор</strong> хүсэлт гаргана.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
