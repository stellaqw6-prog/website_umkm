"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useSession } from "@/hooks/use-session";
import toast from "react-hot-toast";

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: "customer" | "seller" | "admin" | "superadmin";
  isActive: boolean;
  createdAt: string;
}

const roleLabel: Record<string, string> = { customer: "Customer", seller: "Seller", admin: "Admin", superadmin: "Developer" };
const roleVariant: Record<string, "secondary" | "default" | "warning" | "premium"> = {
  customer: "secondary", seller: "default", admin: "warning", superadmin: "premium",
};

export function AdminUsers() {
  const { user: currentUser } = useSession();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = () => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users ?? []))
      .catch(() => toast.error("Gagal memuat data user"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleRoleChange = async (userRow: UserRow, newRole: string) => {
    if (!confirm(`Ubah role "${userRow.name}" dari ${roleLabel[userRow.role]} jadi ${roleLabel[newRole]}?`)) return;
    setUpdatingId(userRow.id);
    try {
      const res = await fetch(`/api/admin/users/${userRow.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal mengubah role"); return; }
      toast.success("Role berhasil diubah");
      load();
    } catch { toast.error("Tidak bisa terhubung ke server"); } finally { setUpdatingId(null); }
  };

  const filtered = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 dark:text-stone-100"><UserCog className="text-blue-600" size={26} /> Kelola Role User</h1>
        <p className="text-gray-500 text-sm mt-1 dark:text-stone-400">Khusus Developer — naikkan/turunkan hak akses user (Customer, Seller, Admin, Developer)</p>
      </motion.div>

      <Card>
        <CardHeader className="pb-0">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-stone-500" />
            <Input placeholder="Cari nama atau email..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex justify-center py-16 text-gray-400 dark:text-stone-500"><Loader2 className="animate-spin" size={28} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-stone-800">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">User</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">Role Saat Ini</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">Ubah Jadi</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">Bergabung</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 dark:border-stone-800/60 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900 text-sm dark:text-stone-100">{u.name}</p>
                        <p className="text-xs text-gray-500 dark:text-stone-400">{u.email}</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={roleVariant[u.role]} className="text-[10px]">{roleLabel[u.role]}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {u.id === currentUser?.id ? (
                          <span className="text-xs text-gray-400 dark:text-stone-500">Akun kamu sendiri</span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value)}
                            disabled={updatingId === u.id}
                            className="h-9 rounded-lg border border-gray-200 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-stone-700"
                          >
                            <option value="customer">Customer</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Developer</option>
                          </select>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-stone-400">{new Date(u.createdAt).toLocaleDateString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
