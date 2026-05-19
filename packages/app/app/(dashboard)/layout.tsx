"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, useListOrganizations, useActiveOrganization, signOut, organization } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, ChevronDown, LogOut, Plus, Settings } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const { data: orgs } = useListOrganizations();
  const { data: activeOrg } = useActiveOrganization();
  const router = useRouter();

  const initials = session?.user.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
  }

  async function switchOrg(id: string) {
    await organization.setActive({ organizationId: id });
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="font-semibold text-zinc-900 dark:text-zinc-50">
              Monorepo
            </Link>

            {orgs && orgs.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {activeOrg?.name ?? "Sélectionner une orga"}
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  {orgs.map((org) => (
                    <DropdownMenuItem
                      key={org.id}
                      onClick={() => switchOrg(org.id)}
                      className="cursor-pointer"
                    >
                      {org.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/org/new" className="flex items-center gap-2 cursor-pointer">
                      <Plus className="h-4 w-4" />
                      Nouvelle organisation
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(!orgs || orgs.length === 0) && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/org/new">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Créer une organisation
                </Link>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm sm:block">{session?.user.name}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{session?.user.name}</p>
                  <p className="text-xs text-zinc-500">{session?.user.email}</p>
                </div>
                <DropdownMenuSeparator />
                {activeOrg && (
                  <DropdownMenuItem asChild>
                    <Link href={`/org/${activeOrg.slug}/members`} className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      Gérer l&apos;organisation
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
