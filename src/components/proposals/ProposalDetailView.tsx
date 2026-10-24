"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleGuard } from "@/components/protected/RoleGuard";
import { getProposalById, submitProposal } from "@/services/proposalService";
import { Proposal } from "@/types/proposal";
import { useAuth } from "@/context/AuthContext";
import ReviewerManagement from "./ReviewerManagement";
import { DocumentsList } from "./DocumentsList";

export function ProposalDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Илгээх төлөв

  const fetchProposal = async () => {
    try {
      const data = await getProposalById(id);
      setProposal(data);
    } catch (err: any) {
      console.error("Error fetching proposal detail:", err);
      setError("Төслийн мэдээллийг татахад алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProposal();
    }
  }, [id]);

  // Төсөл илгээх функц
  const handleSubmitProposal = async () => {
    if (!confirm("Төслийг албан ёсоор илгээх үү? Илгээсний дараа баримт бичигт өөрчлөлт оруулах боломжгүй болно.")) return;

    try {
      setIsSubmitting(true);
      await submitProposal(id);
      alert("Төсөл амжилттай илгээгдлээ!");

      // Төслийн мэдээллийг дахин татаж шинэчлэх (статус нь SUBMITTED болно)
      const updatedData = await getProposalById(id);
      setProposal(updatedData);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Төслийг илгээхэд алдаа гарлаа.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["RESEARCHER", "REVIEWER", "CHAIR", "SECRETARY", "ADMIN"]}>
      <DashboardLayout>
        <div className="p-6 max-w-5xl mx-auto">
          {loading && <p className="text-gray-500 text-center py-8">Ачаалж байна...</p>}
          {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded border border-red-200">{error}</div>}

          {!loading && !error && !proposal && <p className="text-gray-500 text-center py-8">Төсөл олдсонгүй.</p>}

          {!loading && !error && proposal && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="border-b pb-4">
                <button
                  onClick={() => router.back()}
                  className="mb-3 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                >
                  ← Буцах
                </button>

                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{proposal.title}</h1>
                    <p className="text-sm text-gray-500 mt-1">
                      Үүсгэсэн огноо: {proposal.created_at ? new Date(proposal.created_at).toLocaleDateString() : "-"}
                    </p>
                    {proposal.researcher_name && (
                      <p className="text-sm text-gray-600 mt-1">
                        Судлаач: <span className="font-semibold">{proposal.researcher_name}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 shrink-0">
                      {proposal.status_display || proposal.status}
                    </span>

                    {/* ЗӨВХӨН Судлаач өөрөө, мөн DRAFT эсвэл REVISION_REQUIRED үед л илгээх товч харагдана */}
                    {user?.id === proposal.researcher && (proposal.status === "DRAFT" || proposal.status === "REVISION_REQUIRED") && (
                      <button
                        onClick={handleSubmitProposal}
                        disabled={isSubmitting}
                        className="mt-2 bg-green-600 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                      >
                        {isSubmitting ? "Илгээж байна..." : "Төслийг илгээх (Submit)"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Товч агуулга / Хураангуй</h3>
                  <div className="p-4 bg-gray-50 rounded-md border border-gray-200 text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {proposal.summary || "Хураангуй мэдээлэл одоогоор бичигдээгүй байна."}
                  </div>
                </div>

                {/* ШҮҮМЖЛЭГЧИЙН УДИРДЛАГА */}
                <ReviewerManagement
                  proposalId={id}
                  currentReviewers={proposal.reviewers || []}
                  userRole={user?.role}
                  onUpdate={fetchProposal}
                />

                {/* БАРИМТ БИЧГИЙН МОДУЛЬ */}
                <DocumentsList proposalId={id} status={proposal.status} />
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
