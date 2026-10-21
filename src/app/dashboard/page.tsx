"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleGuard } from "@/components/protected/RoleGuard";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={["PI", "REVIEWER", "ADMIN", "SECRETARY"]}>
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-800">Тавтай морил, {user?.first_name || user?.username || "Хэрэглэгч"}!</h1>
            <p className="text-gray-600 mt-1">
              Эрх: <span className="font-semibold text-blue-600">{user?.role || "PI"}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => router.push("/proposals")}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md cursor-pointer transition-shadow border-l-4 border-blue-500"
            >
              <h3 className="text-lg font-semibold text-gray-700">Миний төслүүд</h3>
              <p className="text-sm text-gray-500 mt-2">Бүртгэгдсэн судалгааны төслүүд болон төлөв харах</p>
            </div>

            <div
              onClick={() => router.push("/proposals/new")}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md cursor-pointer transition-shadow border-l-4 border-green-500"
            >
              <h3 className="text-lg font-semibold text-gray-700">+ Шинэ төсөл</h3>
              <p className="text-sm text-gray-500 mt-2">Ёс зүйн хороонд шинэ судалгааны төсөл мэдүүлэх</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold text-gray-700">Мэдэгдэл</h3>
              <p className="text-sm text-gray-500 mt-2">Сүүлийн үеийн шинэчлэлт ба шийдвэрүүд</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
