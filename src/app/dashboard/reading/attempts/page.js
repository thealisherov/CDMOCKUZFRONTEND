import CompletedTestsList from "@/components/CompletedTestsList";

export const metadata = {
  title: "Reading Attempts - Mega IELTS",
};

export default function ReadingAttemptsPage() {
  return (
    <div className="max-w-7xl mx-auto w-full">
      <CompletedTestsList moduleType="reading" />
    </div>
  );
}
