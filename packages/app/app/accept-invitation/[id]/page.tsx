"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { organization, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle, XCircle } from "lucide-react";

export default function AcceptInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [status, setStatus] = useState<"idle" | "accepting" | "rejecting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleAccept() {
    setStatus("accepting");
    const { error } = await organization.acceptInvitation({ invitationId: id });
    if (error) {
      setErrorMsg(error.message ?? "Erreur lors de l'acceptation");
      setStatus("error");
    } else {
      setStatus("done");
      setTimeout(() => router.push("/dashboard"), 1500);
    }
  }

  async function handleReject() {
    setStatus("rejecting");
    const { error } = await organization.rejectInvitation({ invitationId: id });
    if (error) {
      setErrorMsg(error.message ?? "Erreur");
      setStatus("error");
    } else {
      router.push("/dashboard");
    }
  }

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Chargement…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Invitation reçue</CardTitle>
            <CardDescription>
              Connectez-vous ou créez un compte pour accepter cette invitation.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" onClick={() => router.push(`/sign-in?callbackUrl=/accept-invitation/${id}`)}>
              Se connecter
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push(`/sign-up?callbackUrl=/accept-invitation/${id}`)}>
              Créer un compte
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-sm">
        {status === "done" ? (
          <>
            <CardHeader>
              <div className="flex justify-center mb-2">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-center">Invitation acceptée !</CardTitle>
              <CardDescription className="text-center">
                Redirection vers le tableau de bord…
              </CardDescription>
            </CardHeader>
          </>
        ) : status === "error" ? (
          <>
            <CardHeader>
              <div className="flex justify-center mb-2">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <CardTitle className="text-center">Erreur</CardTitle>
              <CardDescription className="text-center">{errorMsg}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full" variant="outline" onClick={() => router.push("/dashboard")}>
                Retour au tableau de bord
              </Button>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Building2 className="h-10 w-10 text-zinc-400" />
              </div>
              <CardTitle className="text-center">Invitation</CardTitle>
              <CardDescription className="text-center">
                Vous avez été invité à rejoindre une organisation. Acceptez ou refusez l&apos;invitation.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={handleAccept}
                disabled={status === "accepting" || status === "rejecting"}
              >
                {status === "accepting" ? "Acceptation…" : "Accepter l'invitation"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleReject}
                disabled={status === "accepting" || status === "rejecting"}
              >
                {status === "rejecting" ? "Refus…" : "Refuser"}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
