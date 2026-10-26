"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleGuard } from "@/components/protected/RoleGuard";
import { getProposalById, submitProposal, deleteProposal, updateProposal } from "@/services/proposalService";
import { Proposal } from "@/types/proposal";
import { useAuth } from "@/context/AuthContext";
import ReviewerManagement from "./ReviewerManagement";
import { DocumentsList } from "./DocumentsList";

export default function ProposalDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Засварлах горимын төлөвүүд
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");

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
    if (id) fetchProposal();
  }, [id]);

  // Засах горимыг асаах
  const handleEditClick = () => {
    if (proposal) {
      setEditTitle(proposal.title);
      setEditSummary(proposal.summary);
      setIsEditing(true);
    }
  };

  // Өөрчлөлтийг хадгалах
  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editSummary.trim()) {
      alert("Гарчиг болон хураангуй хоосон байж болохгүй.");
      return;
    }

    try {
      setIsUpdating(true);
      await updateProposal(id, { title: editTitle, summary: editSummary });
      alert("Төслийн мэдээлэл амжилттай шинэчлэгдлээ.");
      setIsEditing(false);
      fetchProposal(); // Өгөгдлийг дахин татаж харуулах
    } catch (err: any) {
      console.error("Update error:", err);
      alert("Төслийг шинэчлэх үед алдаа гарлаа.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitProposal = async () => {
    if (!confirm("Төслийг албан ёсоор илгээх үү? Илгээсний дараа баримт бичигт өөрчлөлт оруулах боломжгүй болно.")) return;

    try {
      setIsSubmitting(true);
      await submitProposal(id);
      alert("Төсөл амжилттай илгээгдлээ!");
      fetchProposal();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Төслийг илгээхэд алдаа гарлаа.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProposal = async () => {
    if (!confirm("Энэхүү ноорог төслийг бүрмөсөн устгахдаа итгэлтэй байна уу?")) return;
    
    try {
      setIsDeleting(true);
      await deleteProposal(id); 
      alert("Төсөл амжилттай устгагдлаа.");
      router.push("/proposals"); 
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Төслийг устгахад алдаа гарлаа.");
    } finally {
      setIsDeleting(false);
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
                  <div className="flex-1 mr-4">
                    {/* ГАРЧИГ ЗАСАХ ХЭСЭГ */}
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-2xl font-bold border border-blue-400 rounded px-2 py-1 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <h1 className="text-2xl font-bold text-gray-900">{proposal.title}</h1>
                    )}

                    <p className="text-sm text-gray-500 mt-1">
                      Үүсгэсэн огноо: {proposal.created_at ? new Date(proposal.created_at).toLocaleDateString() : "-"}
                    </p>
                    {proposal.researcher_name && (
                      <p className="text-sm text-gray-600 mt-1">
                        Судлаач: <span className="font-semibold">{proposal.researcher_name}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                      {proposal.status_display || proposal.status}
                    </span>

                    <div className="flex gap-2 mt-2">
                      {user?.id === proposal.researcher && (proposal.status === "DRAFT" || proposal.status === "REVISION_REQUIRED") && !isEditing && (
                        <button
                          onClick={handleSubmitProposal}
                          disabled={isSubmitting || isDeleting}
                          className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                        >
                          {isSubmitting ? "Илгээж байна..." : "Төслийг илгээх (Submit)"}
                        </button>
                      )}

                      {user?.id === proposal.researcher && proposal.status === "DRAFT" && (
                        <>
                          {isEditing ? (
                            <>
                              <button
                                onClick={handleSaveEdit}
                                disabled={isUpdating}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                              >
                                {isUpdating ? "Хадгалж байна..." : "Хадгалах"}
                              </button>
                              <button
                                onClick={() => setIsEditing(false)}
                                disabled={isUpdating}
                                className="bg-gray-500 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-gray-600 disabled:opacity-50 transition-colors shadow-sm"
                              >
                                Цуцлах
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={handleEditClick}
                                disabled={isSubmitting || isDeleting}
                                className="bg-yellow-500 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-yellow-600 disabled:opacity-50 transition-colors shadow-sm"
                              >
                                Засах
                              </button>
                              <button
                                onClick={handleDeleteProposal}
                                disabled={isSubmitting || isDeleting}
                                className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
                              >
                                {isDeleting ? "Устгаж байна..." : "Устгах"}
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Товч агуулга / Хураангуй</h3>
                  
                  {/* ХУРААНГУЙ ЗАСАХ ХЭСЭГ */}
                  {isEditing ? (
                    <textarea
                      rows={5}
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      className="w-full p-3 border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-md border border-gray-200 text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {proposal.summary || "Хураангуй мэдээлэл одоогоор бичигдээгүй байна."}
                    </div>
                  )}
                </div>

                {/* ШҮҮМЖЛЭГЧИЙН УДИРДЛАГА (Төсөл ноорог биш үед л харагдана) */}
                {proposal.status !== "DRAFT" && (
                  <ReviewerManagement
                    proposalId={id}
                    currentReviewers={proposal.reviewers || []}
                    userRole={user?.role}
                    onUpdate={fetchProposal}
                  />
                )}

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