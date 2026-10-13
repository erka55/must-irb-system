"use client";

import React from 'react';

// ШУТИС IRB-ийн баримт бичиг болон маягтууд
const DOCUMENTS = [
  {
    category: 'Албан Ёсны Журмууд',
    items: [
      {
        title: 'ШУТИС — Судалгааны ажлын ёс зүйн дүрэм',
        description: 'ШУТИС-ийн судалгаа, туршилтын үйл ажиллагаанд мөрдөх үндсэн журам.',
        fileUrl: '/docs/MUST_IRB_Durem.pdf',
        tag: 'Журам',
        size: 'PDF',
      },
      {
        title: 'Үйл ажиллагааны стандарт заавар (SOP)',
        description: 'Судалгааны хүсэлт хүлээн авах, үнэлэх, хянах стандарт процесс.',
        fileUrl: '/docs/MUST_IRB_SOP.pdf',
        tag: 'SOP',
        size: 'PDF',
      },
      {
        title: 'Судлаачийн товч гарын авлага',
        description: 'Судлаачид зориулсан үе шаттай зааварчилгаа болон санамж.',
        fileUrl: '/docs/Researcher_Guide.pdf',
        tag: 'Гарын авлага',
        size: 'PDF',
      },
    ],
  },
  {
    category: 'Маягт ба Бөглөх Загварууд',
    items: [
      {
        title: 'Маягт 1: IRB Судалгааны ёс зүйн зөвшөөрлийн хүсэлт',
        description: 'Судалгааны ахлагчийн мэдээлэл, зорилго, арга зүй тусгасан анкет.',
        fileUrl: '/docs/Mayagt_1_Request.docx',
        tag: 'Заавал',
        size: 'DOCX',
      },
      {
        title: 'Маягт 2: Мэдээлэлд суурилсан зөвшөөрлийн маягт (Informed Consent)',
        description: 'Судалгаанд оролцогчдод танилцуулах баталгаажуулалтын хуудас.',
        fileUrl: '/docs/Mayagt_2_Consent.docx',
        tag: 'Заавал',
        size: 'DOCX',
      },
      {
        title: 'Хавсралт А: Материал бүрдүүлэлтийн шалгах хуудас (Checklist)',
        description: 'Материал ирүүлэхийн өмнө бүрдлийг хянах хуудас.',
        fileUrl: '/docs/Checklist.docx',
        tag: 'Шалгах хуудас',
        size: 'DOCX',
      },
      {
        title: 'Хавсралт В: Ашиг сонирхлын зөрчлийн мэдэгдлийн маягт',
        description: 'Хорооны гишүүд болон судлаачид ашиг сонирхлын зөрчил мэдэгдэх маягт.',
        fileUrl: '/docs/Conflict_of_Interest_Form.docx',
        tag: 'Нөхцөлт',
        size: 'DOCX',
      },
    ],
  },
];

export default function DocumentsList() {
  return (
    <div className="max-w-4xl mx-auto my-8 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-blue-900">
          📄 Бичгийн Баримт ба Загвар Маягтууд
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Судалгааны ёс зүйн хүсэлт гаргахад шаардлагатай журам, заавар болон татаж авах маягтууд.
        </p>
      </div>

      <div className="space-y-8">
        {DOCUMENTS.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-blue-900 pl-3">
              {section.category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.items.map((doc, docIdx) => (
                <div
                  key={docIdx}
                  className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition bg-gray-50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {doc.tag}
                      </span>
                      <span className="text-xs font-mono text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">
                        {doc.size}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
                      {doc.description}
                    </p>
                  </div>
                  <a
                    href={doc.fileUrl}
                    download
                    className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-medium text-blue-900 bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition"
                  >
                    📥 Файл татах
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
