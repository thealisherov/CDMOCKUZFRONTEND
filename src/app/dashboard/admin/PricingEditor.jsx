"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Save, Plus, Trash2, Edit3, CheckCircle, Package, Star, Crown, Sparkles } from "lucide-react";

export default function PricingEditor() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase.from('pricing_plans').select('*').order('created_at');
      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error("Error fetching plans:", err);
      // Fallback or empty
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      setPlans(plans.map(p => p.id === id ? { ...p, ...updates } : p));
      setEditingId(null);
      alert("Plan updated!");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFeatureChange = (planId, index, newValue, isNotIncluded = false) => {
    const plan = plans.find(p => p.id === planId);
    const features = isNotIncluded ? [...(plan.not_included || [])] : [...(plan.features || [])];
    features[index] = newValue;
    
    setPlans(plans.map(p => p.id === planId ? { 
        ...p, 
        [isNotIncluded ? 'not_included' : 'features']: features 
    } : p));
  };

  const addFeature = (planId, isNotIncluded = false) => {
    const plan = plans.find(p => p.id === planId);
    const features = isNotIncluded ? [...(plan.not_included || [])] : [...(plan.features || [])];
    features.push("New Feature");
    
    setPlans(plans.map(p => p.id === planId ? { 
        ...p, 
        [isNotIncluded ? 'not_included' : 'features']: features 
    } : p));
  };

  const removeFeature = (planId, index, isNotIncluded = false) => {
    const plan = plans.find(p => p.id === planId);
    const features = isNotIncluded ? [...(plan.not_included || [])] : [...(plan.features || [])];
    features.splice(index, 1);
    
    setPlans(plans.map(p => p.id === planId ? { 
        ...p, 
        [isNotIncluded ? 'not_included' : 'features']: features 
    } : p));
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Fetching configuration...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-xl font-black">Plan & Pricing Manager</h2>
           <p className="text-sm text-muted-foreground">Adjust what users see on the landing page</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold">
            <CheckCircle className="w-4 h-4" /> Changes reflect instantly
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {plans.map(plan => (
          <div 
            key={plan.id}
            className={`bg-white dark:bg-black/20 border-2 rounded-3xl overflow-hidden transition-all ${editingId === plan.id ? 'border-indigo-500 shadow-xl' : 'border-border hover:border-indigo-200'}`}
          >
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white dark:bg-gray-800 shadow-sm border border-border">
                   {plan.id === 'free' && <Package className="w-5 h-5 text-gray-500" />}
                   {plan.id === 'monthly' && <Star className="w-5 h-5 text-indigo-500" />}
                   {plan.id === 'quarterly' && <Crown className="w-5 h-5 text-red-500" />}
                   {plan.id === 'custom' && <Sparkles className="w-5 h-5 text-amber-500" />}
                </div>
                <div>
                   <h3 className="font-bold uppercase tracking-wider">{plan.id} Plan</h3>
                   <input 
                      disabled={editingId !== plan.id}
                      value={plan.name_en || ''}
                      onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? {...p, name_en: e.target.value} : p))}
                      className="text-xs bg-transparent border-none p-0 focus:ring-0 font-medium text-muted-foreground w-full"
                   />
                </div>
              </div>
              {editingId === plan.id ? (
                <button 
                    onClick={() => updatePlan(plan.id, plan)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                >
                    <Save className="w-3.5 h-3.5" /> Save
                </button>
              ) : (
                <button 
                    onClick={() => setEditingId(plan.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-xs font-bold transition-all"
                >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              )}
            </div>

            <div className="p-6 grid grid-cols-2 gap-6">
               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block">Price (UZS)</label>
                    <input 
                        type="number"
                        disabled={editingId !== plan.id}
                        value={plan.price_uzs || 0}
                        onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? {...p, price_uzs: e.target.value} : p))}
                        className="w-full bg-muted/50 border-none rounded-xl text-sm font-bold focus:ring-1 focus:ring-indigo-500 px-3 py-2 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block">Price (USD)</label>
                    <input 
                        type="number"
                        disabled={editingId !== plan.id}
                        value={plan.price_usd || 0}
                        onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? {...p, price_usd: e.target.value} : p))}
                        className="w-full bg-muted/50 border-none rounded-xl text-sm font-bold focus:ring-1 focus:ring-indigo-500 px-3 py-2 disabled:opacity-50"
                    />
                  </div>
               </div>

               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block">Features</label>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {(plan.features || []).map((f, i) => (
                            <div key={i} className="flex gap-1.5">
                                <input 
                                    disabled={editingId !== plan.id}
                                    value={f}
                                    onChange={(e) => handleFeatureChange(plan.id, i, e.target.value)}
                                    className="flex-1 bg-muted/30 border-none rounded-lg text-[11px] px-2 py-1 outline-none"
                                />
                                {editingId === plan.id && (
                                    <button onClick={() => removeFeature(plan.id, i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3"/></button>
                                )}
                            </div>
                        ))}
                        {editingId === plan.id && (
                            <button 
                                onClick={() => addFeature(plan.id)}
                                className="w-full py-1 border-2 border-dashed border-border rounded-lg text-[10px] font-bold text-muted-foreground hover:bg-muted/30 flex items-center justify-center gap-1"
                            >
                                <Plus className="w-3 h-3"/> Add
                            </button>
                        )}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>
      
      {plans.length === 0 && (
        <div className="p-20 text-center border-4 border-dashed rounded-3xl">
            <p className="text-muted-foreground font-medium mb-4">No plans found in database.</p>
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm">Initialize Default Plans</button>
        </div>
      )}
    </div>
  );
}
