"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleGuard } from "@/components/protected/RoleGuard";
import { getProposalById } from "@/services/proposalService";
import { Proposal } from "@/types/proposal";
import { useAuth } from "@/context/AuthContext";
import ReviewerManagement from "./ReviewerManagement";

export function ProposalDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 shrink-0">
                    {proposal.status_display || proposal.status}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Товч агуулга / Хураангуй</h3>
                  <div className="p-4 bg-gray-50 rounded-md border border-gray-200 text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {proposal.summary || "Хураангуй мэдээлэл одоогоор бичигдээгүй байна."}
                  </div>
                </div>

                {/* ТУСГААРЛАСАН ШҮҮМЖЛЭГЧИЙН КОМПОНЕНТ */}
                <ReviewerManagement
                  proposalId={id}
                  currentReviewers={proposal.reviewers || []}
                  userRole={user?.role}
                  onUpdate={fetchProposal}
                />

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 mt-6">Хавсаргасан баримт бичгүүд (Протокол / Маягт)</h3>
                  {proposal.documents && proposal.documents.length > 0 ? (
                    <ul className="divide-y divide-gray-200 border rounded-md bg-white">
                      {proposal.documents.map((doc, index) => {
                        const fileName = doc.document_type_display || `Баримт бичиг ${index + 1}`;
                        return (
                          <li key={doc.id || index} className="p-3 flex justify-between items-center text-sm hover:bg-gray-50">
                            <div>
                              <span className="text-gray-800 font-medium">{fileName}</span>
                              {doc.uploaded_at && (
                                <span className="block text-xs text-gray-400 mt-0.5">
                                  Хуулсан: {new Date(doc.uploaded_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {doc.file ? (
                              <a
                                href={doc.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-blue-50 text-blue-600 font-medium text-xs rounded hover:bg-blue-100 transition-colors"
                              >
                                Татах / Харах
                              </a>
                            ) : (
                              <span className="text-gray-400 italic text-xs">Файл байхгүй</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded border">Хавсаргасан баримт бичиг байхгүй байна.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
