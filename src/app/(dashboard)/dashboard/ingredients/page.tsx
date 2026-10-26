import { auth } from "@/lib/auth";
import { MaestrosView } from "@/components/features/ingredients/maestros-view";

export default async function IngredientsPage() {
  const session = await auth();

  return <MaestrosView userRole={session?.user?.role} />;
}
