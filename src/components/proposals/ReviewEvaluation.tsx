"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

interface ReviewEvaluationProps {
  proposalId: string | number;
  existingReview?: {
    id: number;
    comments: string;
    decision: string;
  } | null;
  onUpdate: () => void;
}

export default function ReviewEvaluation({ proposalId, existingReview, onUpdate }: ReviewEvaluationProps) {
  const [comments, setComments] = useState(existingReview?.comments || "");
  const [decision, setDecision] = useState(existingReview?.decision || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ЗАСВАР: Хэрэв existingReview хоцорч орж ирвэл (API дуудлагаас шалтгаалж),
  // утгуудыг автоматаар форм руу бөглөх useEffect нэмлээ.
  useEffect(() => {
    if (existingReview) {
      setComments(existingReview.comments || "");
      setDecision(existingReview.decision || "");
    }
  }, [existingReview]);

  // 1. Шүүмжийг түгжих нөхцөлийг тодорхойлох
  const isLocked = existingReview?.decision === "ACCEPT" || existingReview?.decision === "REJECT";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    if (!comments.trim()) {
      setError("Дүгнэлтээ оруулна уу.");
      setSuccessMessage("");
      return;
    }
    if (!decision) {
      setError("Шийдвэрээ сонгоно уу.");
      setSuccessMessage("");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    const token = sessionStorage.getItem("access_token");
    if (!token) {
      setError("Хандах эрхгүй байна. Та дахин нэвтэрнэ үү.");
      setSubmitting(false);
      return;
    }

    try {
      if (existingReview?.id) {
        // ХУУЧИН ШҮҮМЖ БАЙВАЛ PATCH ХИЙЖ ЗАСНА (Давхардахгүй)
        await axios.patch(
          `http://localhost:8000/api/reviews/${existingReview.id}/`,
          { comments, decision },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setSuccessMessage("Шүүмж амжилттай засагдлаа!");
      } else {
        // ШИНЭЭР БИЧИЖ БАЙВАЛ POST ХИЙНЭ
        await axios.post(
          "http://localhost:8000/api/reviews/",
          { proposal: proposalId, decision, comments },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setSuccessMessage("Шүүмж амжилттай хадгалагдлаа!");
      }
      onUpdate();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error("Шүүмж илгээхэд алдаа гарлаа:", err);
      setError(err.response?.data?.detail || "Шүүмж хадгалахад алдаа гарлаа.");
      setSuccessMessage("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 border border-gray-200 bg-gray-50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
        <h3 className="text-lg font-semibold text-gray-800">
          {existingReview ? (isLocked ? "Шүүмжийн эцсийн дүгнэлт" : "Шүүмжийн дүгнэлт засах") : "Шүүмжлэгчийн дүгнэлт оруулах"}
        </h3>

        {/* 2. Түгжигдсэн үед жижиг анхааруулга (badge) харуулах */}
        {isLocked && <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Шийдвэр баталгаажсан</span>}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded text-sm font-medium border border-green-200">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Таны дүгнэлт, санал (Чөлөөт текст) <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[150px] ${isLocked ? "bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed" : "border-gray-300"}`}
            placeholder="Төслийн давуу, сул тал болон бусад саналаа энд бичнэ үү..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            required
            disabled={isLocked}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Эцсийн шийдвэр <span className="text-red-500">*</span>
          </label>
          <select
            className={`w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${isLocked ? "bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed" : "border-gray-300 bg-white"}`}
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            required
            disabled={isLocked}
          >
            {" "}
            {/* ЭНД АЛДАА БАЙСАН: /> байсныг > болгож засав */}
            <option value="" disabled>
              -- Шийдвэр сонгох --
            </option>
            <option value="ACCEPT">Зөвшөөрөх (Accept)</option>
            <option value="MINOR_REVISION">Бага хэмжээний засвар (Minor Revision)</option>
            <option value="MAJOR_REVISION">Их хэмжээний засвар (Major Revision)</option>
            <option value="REJECT">Татгалзах (Reject)</option>
          </select>
        </div>

        {/* 5. Түгжигдсэн үед илгээх товчийг нуух */}
        {!isLocked && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Түр хүлээнэ үү..." : existingReview ? "Өөрчлөлтийг хадгалах" : "Дүгнэлт илгээх"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
