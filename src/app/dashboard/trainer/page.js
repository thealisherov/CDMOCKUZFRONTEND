import { redirect } from "next/navigation";

export default function TrainerRedirectPage() {
  redirect("/dashboard/training");
}
