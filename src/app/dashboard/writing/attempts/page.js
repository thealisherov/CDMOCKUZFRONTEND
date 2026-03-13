import CompletedTestsList from "@/components/CompletedTestsList";

export const metadata = {
  title: "Writing Attempts - Mega IELTS",
};

export default function WritingAttemptsPage() {
  return (
    <div className="max-w-7xl mx-auto w-full">
      <CompletedTestsList moduleType="writing" />
    </div>
  );
}
