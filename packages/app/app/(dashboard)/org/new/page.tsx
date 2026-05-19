"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { organization } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function NewOrgPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error } = await organization.create({ name, slug });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Erreur lors de la création");
    } else if (data) {
      await organization.setActive({ organizationId: data.id });
      router.push(`/org/${data.slug}/members`);
    }
  }

  return (
    <div className="max-w-md">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Nouvelle organisation</CardTitle>
          <CardDescription>
            Créez une organisation et invitez vos collaborateurs.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l&apos;organisation</Label>
              <Input
                id="name"
                placeholder="Acme Inc."
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Identifiant (slug)</Label>
              <div className="flex items-center gap-0">
                <span className="inline-flex h-9 items-center rounded-l-md border border-r-0 border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
                  /org/
                </span>
                <Input
                  id="slug"
                  className="rounded-l-none"
                  placeholder="acme-inc"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugEdited(true);
                  }}
                  required
                  pattern="[a-z0-9-]+"
                  title="Lettres minuscules, chiffres et tirets uniquement"
                />
              </div>
              <p className="text-xs text-zinc-500">
                Utilisé dans les URLs. Lettres minuscules, chiffres et tirets.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Création…" : "Créer l'organisation"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
