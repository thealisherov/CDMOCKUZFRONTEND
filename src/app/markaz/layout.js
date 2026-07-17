export const metadata = {
  title: "O'quv Markazlar uchun | Mega IELTS",
  description: "O'quv markazlari uchun test bo'limi.",
  robots: { index: false, follow: false },
};

export default function MarkazLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {children}
    </div>
  );
}
