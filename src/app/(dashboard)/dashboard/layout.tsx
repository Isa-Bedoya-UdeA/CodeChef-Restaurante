import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col lg:flex-row">
      {/* Sidebar (fijo en desktop >= lg, cabecera móvil con drawer en pantallas < lg) */}
      <Sidebar user={session.user} />

      {/* Contenedor principal: ml-0 en móvil y lg:ml-64 en desktop para acomodar el sidebar */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col bg-stone-950">
        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
