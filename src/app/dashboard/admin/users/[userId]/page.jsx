"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  CreditCard, 
  History, 
  CheckCircle2, 
  Clock,
  ExternalLink
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserProfile({ params }) {
  const { userId } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (!res.ok) throw new Error("Failed to load user data");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!data?.user) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-xl font-bold mb-4">User not found</h2>
      <button onClick={() => router.back()} className="flex items-center gap-2 text-indigo-600 font-bold">
        <ArrowLeft className="w-4 h-4" /> Go Back
      </button>
    </div>
  );

  const { user, payments } = data;
  const meta = user.user_metadata || {};
  const isPremium = meta.premium_until && new Date(meta.premium_until) > new Date();

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-black/40 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all text-sm font-bold border border-transparent hover:border-border"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${isPremium ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-gray-100 text-gray-500'}`}>
            {isPremium ? 'Premium Member' : 'Free Member'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-border shadow-sm text-center">
              <div className="w-24 h-24 rounded-3xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-6 text-3xl font-black shadow-xl shadow-indigo-200 dark:shadow-none">
                {meta.full_name?.substring(0, 1) || user.email?.substring(0, 1).toUpperCase()}
              </div>
              <h2 className="text-xl font-black mb-1">{meta.full_name || 'N/A'}</h2>
              <p className="text-sm text-muted-foreground mb-6">{user.email}</p>
              
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl">
                   <Shield className="w-4 h-4 text-indigo-500" />
                   <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black text-muted-foreground">Account Role</span>
                      <span className="text-sm font-bold capitalize">{meta.role || 'Student'}</span>
                   </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl">
                   <Calendar className="w-4 h-4 text-emerald-500" />
                   <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black text-muted-foreground">Joined At</span>
                      <span className="text-sm font-bold">{format(new Date(user.created_at), "MMM dd, yyyy")}</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Stats & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Premium Status Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-border shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                    <History className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-black">Subscription Status</h3>
               </div>

               {isPremium ? (
                 <div className="p-6 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">Active Plan</p>
                        <h4 className="text-xl font-black">Premium Pro</h4>
                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                           <Clock className="w-4 h-4" /> Expires on {format(new Date(meta.premium_until), "MMMM dd, yyyy")}
                        </p>
                    </div>
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 opacity-20" />
                 </div>
               ) : (
                 <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border border-border rounded-2xl">
                    <p className="text-sm font-bold text-muted-foreground">This user is currently on the free plan.</p>
                 </div>
               )}
            </div>

            {/* Payment History */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-border shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/30">
                        <CreditCard className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-black">Transaction History</h3>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                    {payments.length} Payments
                  </span>
               </div>

               <div className="space-y-4">
                  {payments.length > 0 ? (
                    payments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-4 border border-border/50 rounded-2xl hover:bg-muted/5 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                               {p.currency === 'UZS' ? <Wallet className="w-4 h-4 opacity-40" /> : <DollarSign className="w-4 h-4 opacity-40" />}
                            </div>
                            <div>
                               <p className="text-sm font-black">{p.amount.toLocaleString()} {p.currency}</p>
                               <p className="text-[10px] text-muted-foreground font-bold uppercase">{p.plan_months} Months Access</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-bold">{format(new Date(p.created_at), "MMM dd, yyyy")}</p>
                            <p className="text-[10px] text-muted-foreground">{format(new Date(p.created_at), "HH:mm")}</p>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 opacity-30">
                        <History className="w-12 h-12 mx-auto mb-3" />
                        <p className="text-sm font-bold">No payments found</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
