import React from "react";

interface ReviewProgress {
  total: number;
  completed: number;
  is_ready: boolean;
}

interface ProposalStatusBadgeProps {
  status: string;
  statusDisplay: string;
  reviewProgress?: ReviewProgress;
}

export default function ProposalStatusBadge({ status, statusDisplay, reviewProgress }: ProposalStatusBadgeProps) {
  // Төлөвөөс хамаарч өнгө ялгах функц
  const getBadgeStyle = (currentStatus: string) => {
    switch (currentStatus) {
      case "DRAFT":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "SUBMITTED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "UNDER_REVIEW":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "APPROVED":
        return "bg-green-100 text-green-700 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getBadgeStyle(status)}`}>{statusDisplay || status}</span>

      {/* Зөвхөн Шүүмжид байгаа үед прогресс харуулна */}
      {status === "UNDER_REVIEW" && reviewProgress && reviewProgress.total > 0 && (
        <span className="text-xs text-gray-500 font-medium px-1">
          Шүүмжийн явц: {reviewProgress.completed}/{reviewProgress.total}
        </span>
      )}
    </div>
  );
}
