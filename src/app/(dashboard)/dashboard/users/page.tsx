import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UsersView } from "@/components/features/users/users-view";

export default async function UsersPage() {
  const session = await auth();

  // Solo el rol ADMIN puede entrar a esta página
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard/transactions");
  }

  return <UsersView currentUserId={Number(session.user.id)} />;
}
