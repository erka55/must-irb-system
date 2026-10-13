"use client";

import React, { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-blue-950 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Лого ба Сургуулийн нэр */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white text-blue-950 font-black rounded-lg flex items-center justify-center text-lg shadow">
            ШУТИС
          </div>
          <div>
            <h1 className="font-bold text-base md:text-lg leading-tight">
              Судалгааны Ёс Зүйн Хороо
            </h1>
            <p className="text-[11px] text-blue-200">
              Institutional Review Board (IRB)
            </p>
          </div>
        </div>

        {/* Цэс (Desktop Navigation) */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          <a href="#wizard" className="hover:text-blue-300 transition">
            Эрсдэл шалгах
          </a>
          <a href="#status" className="hover:text-blue-300 transition">
            Явц хянах
          </a>
          <a href="#documents" className="hover:text-blue-300 transition">
            Баримт бичиг
          </a>
          <a href="#about" className="hover:text-blue-300 transition">
            Хорооны тухай
          </a>
        </nav>

        {/* Нэвтрэх Товч */}
        <div className="hidden md:block">
          <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 px-4 rounded-lg transition shadow-sm">
            Системд нэвтрэх
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-300 hover:text-white focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-900 px-4 pt-2 pb-4 space-y-2 text-sm border-t border-blue-800">
          <a href="#wizard" className="block py-1 hover:text-blue-300">Эрсдэл шалгах</a>
          <a href="#status" className="block py-1 hover:text-blue-300">Явц хянах</a>
          <a href="#documents" className="block py-1 hover:text-blue-300">Баримт бичиг</a>
          <a href="#about" className="block py-1 hover:text-blue-300">Хорооны тухай</a>
          <button className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 rounded-lg">
            Системд нэвтрэх
          </button>
        </div>
      )}
    </header>
  );
}
