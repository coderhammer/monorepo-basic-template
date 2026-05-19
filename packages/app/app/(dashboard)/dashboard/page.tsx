"use client";

import Link from "next/link";
import { useSession, useListOrganizations } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Plus, Users } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: orgs } = useListOrganizations();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Bonjour, {session?.user.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-zinc-500">Gérez vos organisations et vos équipes.</p>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Mes organisations
          </h2>
          <Button asChild size="sm">
            <Link href="/org/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Nouvelle organisation
            </Link>
          </Button>
        </div>

        {!orgs || orgs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="mb-4 h-10 w-10 text-zinc-300" />
              <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                Aucune organisation
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Créez votre première organisation pour inviter des membres.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/org/new">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Créer une organisation
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orgs.map((org) => (
              <Card key={org.id} className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4 text-zinc-400" />
                    {org.name}
                  </CardTitle>
                  <CardDescription className="text-xs">/{org.slug}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/org/${org.slug}/members`}>
                      <Users className="mr-1.5 h-4 w-4" />
                      Membres
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
