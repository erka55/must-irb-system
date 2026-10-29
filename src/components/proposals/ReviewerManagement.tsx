"use client";

import React, { useState, useEffect } from "react";

interface Reviewer {
  id: number | string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface ReviewerManagementProps {
  proposalId: string;
  currentReviewers: Reviewer[];
  userRole?: string;
  onUpdate: () => void;
}

export default function ReviewerManagement({ proposalId, currentReviewers, userRole, onUpdate }: ReviewerManagementProps) {
  const [availableReviewers, setAvailableReviewers] = useState<Reviewer[]>([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);

  // Зөвхөн Дарга болон Нарийн бичигт томилох/хасах эрх нээнэ
  const userRoleUpper = userRole?.toUpperCase();
  const canManage = userRoleUpper === "CHAIR" || userRoleUpper === "SECRETARY" || userRoleUpper === "SECRETARY_CHAIR";

  useEffect(() => {
    if (canManage) {
      fetchAvailableReviewers();
    }
  }, [canManage]);

  const fetchAvailableReviewers = async () => {
    try {
      const token = sessionStorage.getItem("access_token");
      // Хаягийг /api/users/?role=REVIEWER болгож өөрчлөв
      const res = await fetch("http://127.0.0.1:8000/api/users/?role=REVIEWER,CHAIR,SECRETARY", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        // Хэрэв backend pagination (хуудаслалт) ашигладаг бол data.results дотор, үгүй бол data дотор ирнэ.
        // Энэ хоёр тохиолдлыг хоёуланг нь тооцож шалгая:
        const reviewersList = data.results ? data.results : data;
        setAvailableReviewers(reviewersList);
      }
    } catch (err) {
      console.error("Error fetching reviewers:", err);
    }
  };

  const handleAssign = async () => {
    if (!selectedReviewerId) {
      alert("Шүүмжлэгч сонгоно уу!");
      return;
    }
    setActionLoading(true);
    try {
      const token = sessionStorage.getItem("access_token");
      const res = await fetch(`http://127.0.0.1:8000/api/proposals/${proposalId}/assign-reviewer/`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewer_id: selectedReviewerId }),
      });

      if (res.ok) {
        alert("Шүүмжлэгч амжилттай томилогдлоо.");
        setSelectedReviewerId("");
        onUpdate();
      } else {
        const errData = await res.json();
        alert(errData.error || errData.detail || "Томилоход алдаа гарлаа.");
      }
    } catch (err) {
      console.error("Assign reviewer error:", err);
      alert("Сүлжээний алдаа гарлаа.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (reviewerId: number | string) => {
    if (!confirm("Энэ шүүмжлэгчийг төслөөс хасахдаа итгэлтэй байна уу?")) return;
    setActionLoading(true);
    try {
      const token = sessionStorage.getItem("access_token");
      const res = await fetch(`http://127.0.0.1:8000/api/proposals/${proposalId}/remove-reviewer/`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewer_id: reviewerId }),
      });

      if (res.ok) {
        alert("Шүүмжлэгч амжилттай хасагдлаа.");
        onUpdate();
      } else {
        const errData = await res.json();
        alert(errData.error || errData.detail || "Хасахад алдаа гарлаа.");
      }
    } catch (err) {
      console.error("Remove reviewer error:", err);
      alert("Сүлжээний алдаа гарлаа.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="border-t pt-4 mt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Хуваарилагдсан шүүмжлэгчид</h3>

      {currentReviewers && currentReviewers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentReviewers.map((reviewer) => (
            <div key={reviewer.id} className="p-3 bg-gray-50 rounded border border-gray-200 text-sm flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">
                  {reviewer.first_name ? `${reviewer.first_name} ${reviewer.last_name}` : reviewer.username} (@{reviewer.username})
                </p>
                <p className="text-gray-500 text-xs">{reviewer.email}</p>
              </div>
              {canManage && (
                <button
                  onClick={() => handleRemove(reviewer.id)}
                  disabled={actionLoading}
                  className="px-2.5 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-red-200 transition-colors disabled:opacity-50"
                >
                  Хасах
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded border">Одоогоор шүүмжлэгч томилогдоогүй байна.</p>
      )}

      {canManage && (
        <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Шүүмжлэгч томилох</h4>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedReviewerId}
              onChange={(e) => setSelectedReviewerId(e.target.value)}
              className="flex-1 p-2 text-sm border rounded border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Шүүмжлэгч сонгох --</option>
              {availableReviewers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.first_name ? `${r.first_name} ${r.last_name}` : r.username} - {r.email}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssign}
              disabled={actionLoading || !selectedReviewerId}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded transition-colors disabled:opacity-50 shrink-0"
            >
              {actionLoading ? "Уншиж байна..." : "Томилох"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
