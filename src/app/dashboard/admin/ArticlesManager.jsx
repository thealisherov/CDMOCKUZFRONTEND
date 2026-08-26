"use client";

import { useState, useEffect } from "react";
import {
  BookOpen, Search, Plus, Edit2, Trash2, Crown, CheckCircle2,
  Lock, ExternalLink, Image as ImageIcon, Sparkles, X, Save,
  RefreshCw, AlertCircle, Eye, Type, Bold
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Society",
  "Technology",
  "Environment",
  "Education",
  "Health",
  "Economy",
  "Travel & Culture",
  "General"
];

const PRESET_IMAGES = [
  { name: "City & Society", url: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80" },
  { name: "Tech & AI", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80" },
  { name: "Nature & Environment", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80" },
  { name: "Education & Study", url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80" },
  { name: "Health & Lifestyle", url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80" },
  { name: "Business & Economy", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80" }
];

export default function ArticlesManager() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Edit / Create Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "Society",
    level: "C1 (IELTS 7.5+)",
    read_time: "5 min read",
    is_free: false,
    image_url: "",
    excerpt: "",
    content: "",
    vocabulary: [],
    exercises: [],
    order_index: 100
  });
  const [newVocabWord, setNewVocabWord] = useState("");
  const [newVocabDef, setNewVocabDef] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/articles");
      const data = await res.json();
      if (res.ok) {
        setArticles(data.articles || []);
      } else {
        toast.error(data.error || "Failed to load articles");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setFormData({
      title: "",
      slug: "",
      category: "Society",
      level: "C1 (IELTS 7.5+)",
      read_time: "5 min read",
      is_free: false,
      image_url: PRESET_IMAGES[0].url,
      excerpt: "",
      content: "### Introduction\n\n### Pros (Advantages)\n1. **First Advantage**: Explanation here...\n\n### Cons (Disadvantages)\n1. **First Disadvantage**: Explanation here...\n\n### Conclusion\nSummary here...",
      vocabulary: [],
      exercises: [],
      order_index: articles.length + 1
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (art) => {
    setEditingArticle(art);
    setFormData({
      id: art.id,
      title: art.title || "",
      slug: art.slug || "",
      category: art.category || "Society",
      level: art.level || "C1 (IELTS 7.5+)",
      read_time: art.read_time || "5 min read",
      is_free: !!art.is_free,
      image_url: art.image_url || "",
      excerpt: art.excerpt || "",
      content: art.content || "",
      vocabulary: Array.isArray(art.vocabulary) ? art.vocabulary : [],
      exercises: Array.isArray(art.exercises) ? art.exercises : [],
      order_index: art.order_index ?? 100
    });
    setModalOpen(true);
  };

  const handleTitleChange = (val) => {
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData(prev => ({
      ...prev,
      title: val,
      slug: editingArticle ? prev.slug : autoSlug
    }));
  };

  const handleAddVocab = () => {
    if (!newVocabWord.trim()) return;
    setFormData(prev => ({
      ...prev,
      vocabulary: [
        ...prev.vocabulary,
        {
          word: newVocabWord.trim(),
          definition: newVocabDef.trim() || "Key IELTS academic term",
          type: newVocabWord.includes(" ") ? "Collocation" : "Academic Vocab"
        }
      ]
    }));
    setNewVocabWord("");
    setNewVocabDef("");
  };

  const handleRemoveVocab = (idx) => {
    setFormData(prev => ({
      ...prev,
      vocabulary: prev.vocabulary.filter((_, i) => i !== idx)
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }

    setSaving(true);
    try {
      const isEdit = !!editingArticle;
      const url = "/api/admin/articles";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(isEdit ? "Article updated!" : "Article created!");
        setModalOpen(false);
        fetchArticles();
      } else {
        toast.error(data.error || "Save failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFree = async (art) => {
    try {
      const res = await fetch("/api/admin/articles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: art.id,
          is_free: !art.is_free
        })
      });
      if (res.ok) {
        toast.success(`Set as ${!art.is_free ? "FREE" : "PREMIUM"}`);
        fetchArticles();
      }
    } catch (_) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (art) => {
    if (!confirm(`Are you sure you want to delete "${art.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/articles?id=${art.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("Article deleted");
        fetchArticles();
      } else {
        const data = await res.json();
        toast.error(data.error || "Delete failed");
      }
    } catch (_) {
      toast.error("Network error");
    }
  };

  const insertBoldHelper = () => {
    const textarea = document.getElementById("content-textarea");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = formData.content.substring(start, end) || "key phrase";
    const replacement = `**${selected}**`;
    const newContent = formData.content.substring(0, start) + replacement + formData.content.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  const filtered = articles.filter(a => {
    const matchesSearch = !search.trim() || 
      a.title?.toLowerCase().includes(search.toLowerCase()) || 
      a.slug?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "All" || a.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const freeCount = articles.filter(a => a.is_free).length;
  const premiumCount = articles.filter(a => !a.is_free).length;

  return (
    <div className="w-full max-w-full min-w-0 space-y-6">
      
      {/* ── Stats & Action Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Total Articles</p>
            <p className="text-2xl font-black text-foreground">{articles.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Free Articles</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{freeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Premium Articles</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{premiumCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            <Crown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── Search, Filter & New Button ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles by title or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-card border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-card border border-border text-xs font-semibold focus:outline-none"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Article
        </button>
      </div>

      {/* ── Articles Table / List ── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span>Loading articles...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            No articles match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Cover</th>
                  <th className="px-4 py-3">Title & Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Vocab</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((art, idx) => (
                  <tr key={art.id || art.slug} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-muted-foreground">
                      {art.order_index ?? (idx + 1)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-12 h-8 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-border">
                        {art.image_url ? (
                          <img src={art.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs sm:max-w-sm">
                      <p className="font-bold text-foreground line-clamp-1">{art.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span className="font-semibold px-1.5 py-0.5 rounded bg-muted">{art.category}</span>
                        <span>{art.read_time}</span>
                        <span className="font-mono opacity-70">/{art.slug}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleFree(art)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 transition-transform hover:scale-105",
                          art.is_free
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                        )}
                        title="Click to toggle Free/PRO"
                      >
                        {art.is_free ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            FREE
                          </>
                        ) : (
                          <>
                            <Crown className="w-3 h-3" />
                            PRO
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-semibold text-muted-foreground">
                      {art.vocabulary?.length || 0} terms
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/dashboard/articles/${art.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Preview article"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleOpenEdit(art)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 transition-colors"
                          title="Edit article"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(art)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 transition-colors"
                          title="Delete article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {editingArticle ? "Edit Article" : "Create New Article"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Title */}
              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-foreground">Article Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Pros and Cons of Space Exploration"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1">
                <label className="font-bold text-foreground">URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border font-mono text-[11px]"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="font-bold text-foreground">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Level */}
              <div className="space-y-1">
                <label className="font-bold text-foreground">Target Level</label>
                <input
                  type="text"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border"
                />
              </div>

              {/* Access Status & Order */}
              <div className="flex items-center gap-4 pt-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.is_free}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_free: e.target.checked }))}
                    className="w-4 h-4 rounded text-primary focus:ring-0"
                  />
                  <span className="font-bold text-foreground">Free Access (For all users)</span>
                </label>
              </div>

              {/* Image URL with Preset Selector */}
              <div className="sm:col-span-2 space-y-2">
                <label className="font-bold text-foreground flex items-center justify-between">
                  <span>Cover Image URL (Direct link)</span>
                  <span className="text-[10px] text-muted-foreground">JPG/PNG/WebP</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs"
                  />
                  {formData.image_url && (
                    <div className="w-10 h-9 rounded-xl overflow-hidden border border-border shrink-0">
                      <img src={formData.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                
                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-muted-foreground self-center">Presets:</span>
                  {PRESET_IMAGES.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: p.url }))}
                      className="px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 text-[10px] font-medium text-foreground"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Excerpt */}
              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-foreground">Short Excerpt (Preview text)</label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Summary for article card..."
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border"
                />
              </div>

              {/* Content Editor with Bold helper */}
              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-foreground">Markdown Content *</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={insertBoldHelper}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 font-extrabold text-xs flex items-center gap-1"
                      title="Select text and click to make it **bold**"
                    >
                      <Bold className="w-3.5 h-3.5" />
                      Make Bold
                    </button>
                  </div>
                </div>
                <textarea
                  id="content-textarea"
                  rows={10}
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-3.5 rounded-2xl bg-muted/50 border border-border font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Vocabulary Manager */}
              <div className="sm:col-span-2 space-y-3 pt-2 border-t border-border">
                <label className="font-bold text-foreground">Vocabulary & Collocations</label>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Word / Collocation (e.g. urban sprawl)"
                    value={newVocabWord}
                    onChange={(e) => setNewVocabWord(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Definition / Meaning"
                    value={newVocabDef}
                    onChange={(e) => setNewVocabDef(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddVocab}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
                  >
                    Add
                  </button>
                </div>

                {formData.vocabulary.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-muted/30 border border-border">
                    {formData.vocabulary.map((v, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border text-xs font-semibold"
                      >
                        <span>{typeof v === "string" ? v : v.word}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVocab(i)}
                          className="text-muted-foreground hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
