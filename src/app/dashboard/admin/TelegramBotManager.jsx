"use client";

import { useEffect, useState, useRef } from "react";
import { getAccessToken } from "@/utils/supabase/token";
import { 
  Send, Users, MessageSquare, ShieldCheck, RefreshCw, 
  CheckCircle2, AlertCircle, Image as ImageIcon, Link as LinkIcon, 
  Search, Eye, Sparkles, UserCheck, Smartphone, Upload, X, FileImage
} from "lucide-react";
import { format } from "date-fns";

export default function TelegramBotManager() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Broadcast Form State
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [useUrlMode, setUseUrlMode] = useState(false);
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");

  // File input ref
  const fileInputRef = useRef(null);

  // Sending status
  const [sending, setSending] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchTgStats();
  }, []);

  const fetchTgStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Sessiya topilmadi. Tizimga qayta kiring.");

      const res = await fetch("/api/admin/telegram/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Statistikani yuklashda xatolik");

      setStats(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Iltimos, faqat rasm faylini yuklang (JPG, PNG, WEBP, GIF)");
        return;
      }
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreviewUrl(objectUrl);
    }
  };

  const handleRemoveFile = () => {
    setImageFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl("");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendBroadcast = async () => {
    setShowConfirmModal(false);
    setSending(true);
    setBroadcastResult(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Sessiya topilmadi.");

      let body;
      let headers = { Authorization: `Bearer ${token}` };

      if (imageFile && !useUrlMode) {
        const formData = new FormData();
        formData.append("message", message);
        formData.append("buttonText", buttonText);
        formData.append("buttonUrl", buttonUrl);
        formData.append("imageFile", imageFile);
        body = formData;
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({
          message,
          imageUrl: useUrlMode ? imageUrl : "",
          buttonText,
          buttonUrl
        });
      }

      const res = await fetch("/api/admin/telegram/broadcast", {
        method: "POST",
        headers,
        body
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xabar yuborishda xatolik yuz berdi");

      setBroadcastResult(data);
      fetchTgStats();
    } catch (err) {
      console.error(err);
      setBroadcastResult({
        success: false,
        error: err.message
      });
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = (stats?.users || []).filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.telegram_id && u.telegram_id.includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  const activePreviewImage = (!useUrlMode && imagePreviewUrl) ? imagePreviewUrl : imageUrl;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 p-6 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-bold flex items-center gap-2.5">
            <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Telegram Bot Management & Broadcast
          </h2>
          <p className="text-sm text-muted-foreground">
            Barcha Telegram foydalanuvchilariga ommaviy xabarlar tarqatish va bot statistikasi
          </p>
        </div>
        <button
          onClick={fetchTgStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border hover:bg-muted rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Yangilash
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Jami Bot Foydalanuvchilari</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight">
            {loading ? "..." : (stats?.totalTelegramUsers || 0).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
            Tizimda Telegram bilan ulangan akkountlar
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ommaviy Xabar Qabul Qiluvchilar</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-purple-600 dark:text-purple-400">
            {loading ? "..." : (stats?.uniqueBroadcastableUsers || 0).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Barcha telegram_id / internal email 'lar yig'indisi
          </p>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aktiv Bot Sessiyalari</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight">
            {loading ? "..." : (stats?.totalSessions || 0).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Telegram Auth sessiyalari soni
          </p>
        </div>
      </div>

      {/* Broadcast Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Controls (Left / 7 cols) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-lg">Broadcast Studio (Xabar Tayyorlash)</h3>
            </div>

            {/* Toggle URL / File Mode */}
            <button
              onClick={() => setUseUrlMode(!useUrlMode)}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              {useUrlMode ? "📁 Kompyuterdan rasm yuklash" : "🔗 URL havola orqali rasm"}
            </button>
          </div>

          {/* Message Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center justify-between">
              <span>Xabar Matni (HTML Format)</span>
              <span className="text-xs font-normal text-muted-foreground">HTML: &lt;b&gt;qalin&lt;/b&gt;, &lt;i&gt;qiyshiq&lt;/i&gt;, &lt;a href="..."&gt;link&lt;/a&gt;</span>
            </label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="📢 Assalomu alaykum Mega IELTS foydalanuvchilari! 

Yangi testlar va imkoniyatlar qo'shildi. Hoziroq kirib sinab ko'ring! 🚀"
              className="w-full p-4 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-mono"
            />
          </div>

          {/* Image Input Section */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                Rasm (Ixtiyoriy)
              </span>
              <span className="text-xs text-muted-foreground">
                {useUrlMode ? "URL kiritish" : "Fayl yuklash"}
              </span>
            </label>

            {!useUrlMode ? (
              /* Direct File Upload Drop Zone */
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {imageFile ? (
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 text-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-12 h-12 rounded-lg bg-cover bg-center border shrink-0" style={{ backgroundImage: `url(${imagePreviewUrl})` }} />
                      <div className="truncate">
                        <p className="font-semibold truncate text-foreground">{imageFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(imageFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-600 transition-colors shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-indigo-500/50 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-muted/40 space-y-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-600 mx-auto flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Kompyuteringizdan rasmni tanlang</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, WEBP yoki GIF fayllar (bosing)</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* URL Input Mode */
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/banner.jpg"
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            )}
          </div>

          {/* Inline Keyboard Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                <span>Tugma Matni</span>
              </label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="👉 Saytga kirish"
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                <span>Tugma Havolasi (URL)</span>
              </label>
              <input
                type="url"
                value={buttonUrl}
                onChange={(e) => setButtonUrl(e.target.value)}
                placeholder="https://megaielts.uz"
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Broadcast Result Notification */}
          {broadcastResult && (
            <div className={`p-4 rounded-xl text-sm border space-y-2 ${
              broadcastResult.error
                ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
            }`}>
              {broadcastResult.error ? (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <strong>Xatolik yuz berdi:</strong> {broadcastResult.error}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-base">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Ommaviy xabar yuborish yakunlandi!
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-background/50 border border-border">
                      <span className="block text-muted-foreground">Jami:</span>
                      <strong className="text-sm">{broadcastResult.totalRecipients}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <span className="block">Muvaffaqiyatli:</span>
                      <strong className="text-sm">{broadcastResult.successfulCount}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400">
                      <span className="block">Yetib bormadi:</span>
                      <strong className="text-sm">{broadcastResult.failedCount}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={!message.trim() || sending}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg hover:shadow-indigo-500/25 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Barcha foydalanuvchilarga yuborilmoqda...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                🚀 Barcha Telegram Foydalanuvchilariga Yuborish ({stats?.uniqueBroadcastableUsers || 0} ta)
              </>
            )}
          </button>
        </div>

        {/* Live Telegram Preview (Right / 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 font-semibold text-sm text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>Live Telegram Message Preview</span>
          </div>

          <div className="bg-[#0e1621] text-white p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3 font-sans max-w-sm mx-auto lg:max-w-none">
            {/* Bot Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow">
                MI
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight text-slate-100">Mega IELTS Bot</h4>
                <span className="text-xs text-blue-400">bot</span>
              </div>
            </div>

            {/* Preview Card Body */}
            <div className="bg-[#182533] p-3 rounded-xl space-y-3 text-sm leading-relaxed border border-slate-700/50">
              {activePreviewImage && (
                <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900 aspect-video flex items-center justify-center">
                  <img
                    src={activePreviewImage}
                    alt="Broadcast attachment"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div
                className="whitespace-pre-wrap break-words text-slate-200"
                dangerouslySetInnerHTML={{
                  __html: message ? message.replace(/\n/g, '<br/>') : "<span class='text-slate-500 italic'>Xabar matni bu yerda ko'rinadi...</span>"
                }}
              />

              {buttonText && (
                <div className="pt-2">
                  <a
                    href={buttonUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full py-2 px-4 bg-[#2b5278] hover:bg-[#346290] text-blue-200 text-center font-medium rounded-lg text-xs transition-colors"
                  >
                    {buttonText} ↗
                  </a>
                </div>
              )}
            </div>
            <span className="block text-[10px] text-slate-400 text-right">09:42 AM ✓✓</span>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-indigo-600">
              <div className="p-3 rounded-xl bg-indigo-500/10">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Xabarni tasdiqlash</h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Siz ushbu xabarni bazadagi barcha <strong className="text-foreground">{stats?.uniqueBroadcastableUsers || 0} ta Telegram foydalanuvchisiga</strong> yubormoqchimisiz?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 border border-border rounded-xl font-semibold text-sm hover:bg-muted transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSendBroadcast}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-md shadow-indigo-600/20"
              >
                Ha, yuborilsin!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Telegram Foydalanuvchilar Ro'yxati
            </h3>
            <p className="text-xs text-muted-foreground">
              Jami Telegram orqali ulangan foydalanuvchilar ({filteredUsers.length} ta)
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ism, ID yoki telefon..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Foydalanuvchi</th>
                <th className="py-3 px-4">Telegram ID</th>
                <th className="py-3 px-4">Telefon</th>
                <th className="py-3 px-4">Ro'yxatdan o'tgan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                    Foydalanuvchilar topilmadi
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => (
                  <tr key={u.id || idx} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {u.full_name || u.email || "—"}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-blue-600 dark:text-blue-400">
                      {u.telegram_id || "—"}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
                      {u.phone || "—"}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {u.created_at ? format(new Date(u.created_at), "yyyy-MM-dd HH:mm") : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
