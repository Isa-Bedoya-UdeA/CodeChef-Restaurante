import { redirect } from "next/navigation";

export default function MaestrosRedirectPage() {
  redirect("/dashboard/ingredients");
}
