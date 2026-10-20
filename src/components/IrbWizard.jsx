"use client"; // <-- ЭНЭ МӨРИЙГ ХАМГИЙН ЭХЭНД НЭМЭЭРЭЙ

import React, { useState } from 'react';

// ШУТИС IRB-ийн Гарын авлагын 6 үндсэн асуулт
const QUESTIONS = [
  {
    id: 'q1',
    text: 'Хүмүүсээс мэдээлэл цуглуулж байна уу? (Асуулга, ярилцлага, ажиглалт)',
    description: 'Оролцогчдоос асуулга авах, ярилцлага хийх эсвэл зан төлөвийг ажиглах',
  },
  {
    id: 'q2',
    text: 'Хувийн мэдээлэл ашиглаж байна уу?',
    description: 'Нэр, регистрийн дугаар, царай, дуу хоолой, байршил гэх мэт хувийн мэдээлэл',
  },
  {
    id: 'q3',
    text: 'Биометрийн өгөгдөл ашиглаж байна уу?',
    description: 'Нүүр царай таних, хурууны хээ, нүдний цөцгий, ДНХ гэх мэт биологийн өгөгдөл',
  },
  {
    id: 'q4',
    text: 'AI загвар сургахад хувийн өгөгдөл ашиглаж байна уу?',
    description: 'Машинт сургалт болон хиймэл оюуны алгоритмд хүний өгөгдөл ашиглах',
  },
  {
    id: 'q5',
    text: 'Кибер аюулгүй байдлын туршилт хийж байна уу?',
    description: 'Нэвтрэлтийн туршилт (penetration test), эмзэг байдлын үнэлгээ',
  },
  {
    id: 'q6',
    text: 'Эмзэг бүлэгтэй ажиллаж байна уу?',
    description: 'Хүүхэд, насанд хүрээгүйчүүд, хөгжлийн бэрхшээлтэй иргэд, өвчтөнүүд',
  },
];

export default function IrbWizard() {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const handleOptionChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const calculateResult = () => {
    if (Object.keys(answers).length < QUESTIONS.length) {
      alert('Бүх асуултад хариулна уу.');
      return;
    }

    const { q1, q2, q3, q4, q5, q6 } = answers;
    const hasAnyYes = Object.values(answers).some((val) => val === 'YES');

    if (!hasAnyYes) {
      setResult({
        level: 'Чөлөөлөгдөх үнэлгээ (Exempted)',
        time: '7 хоног',
        color: 'bg-green-100 text-green-800 border-green-500',
        badge: '🟢 Бага эрсдэл',
        description: 'Нийтийн мэдээлэл болон хувийн мэдээлэл ороогүй тул хялбаршуулсан журмаар чөлөөлөгдөх боломжтой.',
        action: 'Та "Чөлөөлөгдөх хүсэлт"-ийн маягтыг бөглөн илгээнэ үү.',
      });
    } else if (q3 === 'YES' || q4 === 'YES' || q5 === 'YES' || q6 === 'YES') {
      setResult({
        level: 'Бүрэн хэлэлцүүлэг (Full Board Review)',
        time: '30 хоног',
        color: 'bg-red-100 text-red-800 border-red-500',
        badge: '🔴 Өндөр эрсдэл / AI / Кибер',
        description: 'Эмзэг бүлэг, Биометри, AI эсвэл Кибер аюулгүй байдлын туршилт агуулсан тул Хорооны хурлаар бүрэн хэлэлцэнэ.',
        action: 'Дэлгэрэнгүй эрсдэлийн үнэлгээ болон Өгөгдөл хамгаалах төлөвлөгөөг заавал хавсаргана уу.',
      });
    } else {
      setResult({
        level: 'Хялбаршуулсан үнэлгээ (Expedited Review)',
        time: '14 хоног',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-500',
        badge: '🟡 Дунд эрсдэл',
        description: 'Нэргүйжүүлэгдсэн хувийн мэдээлэл эсвэл асуулга/ярилцлагын судалгаа тул хялбаршуулсан үнэлгээнд хамаарна.',
        action: 'Мэдээлэлд суурилсан зөвшөөрлийн маягт (Form 2)-ийг бэлтгэж хавсаргана уу.',
      });
    }
  };

  const resetForm = () => {
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-200 my-8">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-blue-900">
          🔍 Миний судалгаа Ёс зүйн үнэлгээнд хамаарах уу?
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          ШУТИС-ийн Судалгааны ёс зүйн хорооны журмын дагуу судалгааныхаа эрсдэлийн түвшинг шалгалтыг хийнэ үү.
        </p>
      </div>

      <div className="space-y-6">
        {QUESTIONS.map((q, index) => (
          <div key={q.id} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <p className="font-semibold text-gray-800">
              {index + 1}. {q.text}
            </p>
            <p className="text-xs text-gray-500 mt-1 mb-3">{q.description}</p>
            <div className="flex gap-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={q.id}
                  value="YES"
                  checked={answers[q.id] === 'YES'}
                  onChange={() => handleOptionChange(q.id, 'YES')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Тийм</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={q.id}
                  value="NO"
                  checked={answers[q.id] === 'NO'}
                  onChange={() => handleOptionChange(q.id, 'NO')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Үгүй</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={calculateResult}
          className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
        >
          Үнэлгээний Түвшинг Тодорхойлох
        </button>
        <button
          onClick={resetForm}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200"
        >
          Арилгах
        </button>
      </div>

      {result && (
        <div className={`mt-8 p-6 rounded-xl border-l-8 shadow-sm ${result.color}`}>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-white bg-opacity-60">
              {result.badge}
            </span>
            <span className="text-sm font-semibold">
              Үнэлгээний хугацаа: {result.time}
            </span>
          </div>
          <h3 className="text-xl font-bold mt-3">{result.level}</h3>
          <p className="mt-2 text-sm leading-relaxed">{result.description}</p>
          <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg text-xs font-medium">
            💡 <strong>Дараагийн алхам:</strong> {result.action}
          </div>
        </div>
      )}
    </div>
  );
}
