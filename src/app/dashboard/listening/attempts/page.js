import CompletedTestsList from "@/components/CompletedTestsList";

export const metadata = {
  title: "Listening Attempts - Mega IELTS",
};

export default function ListeningAttemptsPage() {
  return (
    <div className="max-w-7xl mx-auto w-full">
      <CompletedTestsList moduleType="listening" />
    </div>
  );
}
