"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Search, UserPlus, Shield, X, Check, DollarSign, Wallet, ExternalLink, AlertTriangle } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

export default function UsersList() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // For Premium Modal
  const [premiumForm, setPremiumForm] = useState({ months: 1, currency: 'UZS', amount: '' });
  const { user: currentUser } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();

    // ── Real-time polling every 15 seconds ──
    const interval = setInterval(() => {
      fetchUsers();
    }, 15000);

    // ── Supabase Realtime: listen to payments table for instant refresh ──
    const channel = supabase
      .channel('admin-users-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => {
          console.log('[Admin] Payment change detected, refreshing users...');
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFilteredUsers(
      users.filter(u => 
        u.email?.toLowerCase().includes(term) || 
        u.user_metadata?.full_name?.toLowerCase().includes(term)
      )
    );
  }, [search, users]);

  const fetchUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePremiumUpdate = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          plan_months: Number(premiumForm.months),
          payment: {
            amount: Number(premiumForm.amount),
            currency: premiumForm.currency,
          }
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Update failed");
      }
      const updatedUser = await res.json();
      setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
      setSelectedUser(null);
      setPremiumForm({ months: 1, currency: 'UZS', amount: '' });
      toast.success("Premium status assigned successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const [userToRevoke, setUserToRevoke] = useState(null);

  const revokePremium = async () => {
    if (!userToRevoke) return;
    const userId = userToRevoke.id;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ plan_months: -1 })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Revoke failed");
      }
      const updatedUser = await res.json();
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      toast.success("Premium access revoked");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUserToRevoke(null);
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-muted-foreground">Loading user database...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-black/20 p-4 rounded-2xl border border-border">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Live
            </span>
            <span>·</span>
            <span>{filteredUsers.length} of <strong>{users.length}</strong> users</span>
        </div>
      </div>

      <div className="bg-white dark:bg-black/20 rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-muted/30 text-muted-foreground text-[11px] uppercase tracking-wider font-bold sticky top-0 z-10" style={{ background: 'var(--muted, #f5f5f5)' }}>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4 text-center">Plan</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredUsers.map(u => {
                const meta = u.user_metadata || {};
                const isPremium = meta.premium_until && new Date(meta.premium_until) > new Date();
                const isExpired = meta.premium_until && new Date(meta.premium_until) <= new Date();

                return (
                  <tr key={u.id} className="hover:bg-muted/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                          {meta.full_name?.substring(0, 2) || u.email?.substring(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold flex items-center gap-1.5">
                              {meta.full_name || 'N/A'}
                              {meta.role === 'admin' && <Shield className="w-3 h-3 text-indigo-500" />}
                          </span>
                          <span className="text-xs text-muted-foreground opacity-70">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${isPremium ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : isExpired ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {isPremium ? "Premium" : isExpired ? "Expired" : "Free"}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                      {meta.premium_until ? (
                        <span className="text-xs font-medium">{format(new Date(meta.premium_until), "MMM dd, yyyy")}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => router.push(`/dashboard/admin/users/${u.id}`)}
                                className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="View Full Profile"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setSelectedUser(u)}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                            >
                                Give Premium
                            </button>
                            {isPremium && (
                                <button 
                                    onClick={() => setUserToRevoke(u)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Revoke Access"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Premium Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/20">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                    <DollarSign className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="font-black text-lg">Assign Premium</h3>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                 </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePremiumUpdate} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Duration</label>
                <div className="grid grid-cols-3 gap-2">
                   {[1, 3, 12].map(m => (
                     <button 
                        key={m}
                        type="button"
                        onClick={() => setPremiumForm({...premiumForm, months: m})}
                        className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${premiumForm.months === m ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30' : 'border-border hover:border-indigo-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                     >
                        {m === 12 ? '1 Year' : `${m} Month${m > 1 ? 's' : ''}`}
                     </button>
                   ))}
                </div>
                <div className="mt-3 flex items-center gap-3 p-3 bg-muted/30 rounded-2xl border border-dashed border-border group-focus-within:border-indigo-400 transition-colors">
                    <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Custom Months:</span>
                    <input 
                        type="number" 
                        min="1"
                        max="120"
                        value={premiumForm.months}
                        onChange={(e) => setPremiumForm({...premiumForm, months: e.target.value})}
                        className="w-full bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg text-sm font-black text-indigo-600 outline-none ring-1 ring-border focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="0"
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Payment Received</label>
                <div className="flex items-stretch gap-2">
                    <select 
                        value={premiumForm.currency}
                        onChange={(e) => setPremiumForm({...premiumForm, currency: e.target.value})}
                        className="bg-muted px-3 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="UZS">UZS</option>
                        <option value="USD">USD</option>
                    </select>
                    <div className="relative flex-1">
                        <input 
                            type="number"
                            required
                            placeholder="Amount..."
                            value={premiumForm.amount}
                            onChange={(e) => setPremiumForm({...premiumForm, amount: e.target.value})}
                            className="w-full pl-4 pr-10 py-3 bg-muted/50 rounded-xl text-sm font-bold border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40">
                            {premiumForm.currency === 'UZS' ? <Wallet className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                        </div>
                    </div>
                </div>
              </div>

              <button 
                 type="submit"
                 className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4"
              >
                 <Check className="w-5 h-5" /> Activate Premium Now
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Revoke Confirm Dialog */}
      {userToRevoke && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 p-6 text-center space-y-4">
             <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center mx-auto mb-2">
                 <AlertTriangle className="w-6 h-6" />
             </div>
             <h3 className="font-bold text-lg">Revoke Premium?</h3>
             <p className="text-sm text-muted-foreground">
               Are you sure you want to revoke premium access for <br/> <strong>{userToRevoke.email}</strong>?
             </p>
             <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setUserToRevoke(null)}
                  className="flex-1 py-3 bg-muted text-muted-foreground font-bold rounded-xl hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={revokePremium}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none"
                >
                  Revoke
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
