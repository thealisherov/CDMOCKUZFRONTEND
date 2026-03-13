"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { createClient } from "@/utils/supabase/client";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error("Update failed");
      const updatedUser = await res.json();
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white dark:bg-black/20 rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Premium Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {users.map(u => {
              const meta = u.user_metadata || {};
              const isPremium = meta.premium_until && new Date(meta.premium_until) > new Date();
              const isExpired = meta.premium_until && new Date(meta.premium_until) <= new Date();

              return (
                <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{meta.full_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={meta.role || 'student'}
                      onChange={(e) => updateUser(u.id, { role: e.target.value })}
                      className="bg-muted/50 border-none rounded text-xs px-2 py-1 font-semibold focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[11px] font-bold ${isPremium ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : isExpired ? 'bg-red-100 text-red-700 dark:bg-red-900/30' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {isPremium ? "Premium Active" : isExpired ? "Expired" : "Free Plan"}
                      </span>
                      {meta.premium_until && (
                        <span className="text-[10px] text-muted-foreground mt-1">
                          Until: {format(new Date(meta.premium_until), "dd.MM.yyyy")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => updateUser(u.id, { plan_months: 1 })}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg text-xs font-semibold transition-colors"
                    >
                      +1 Month
                    </button>
                    <button
                      onClick={() => updateUser(u.id, { plan_months: -1 })}
                      className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg text-xs font-semibold transition-colors"
                      title="Remove Premium"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
