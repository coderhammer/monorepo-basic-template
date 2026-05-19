"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession, useActiveOrganization, organization } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Send, Trash2, UserMinus } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  owner: "Propriétaire",
  admin: "Admin",
  member: "Membre",
};

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  member: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

type Member = {
  id: string;
  userId: string;
  role: string;
  user: { name: string; email: string };
};

type Invitation = {
  id: string;
  email: string;
  role: string | null;
  status: string;
};

export default function MembersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  use(params); // consume params (slug used via activeOrg)
  const { data: session } = useSession();
  const { data: activeOrg } = useActiveOrganization();

  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const fetchMembers = useCallback(async () => {
    const { data } = await organization.listMembers();
    if (data && "members" in data) {
      setMembers((data as { members: Member[] }).members);
    } else if (Array.isArray(data)) {
      setMembers(data as Member[]);
    }
  }, []);

  const fetchInvitations = useCallback(async () => {
    const { data } = await organization.listInvitations();
    if (Array.isArray(data)) {
      setInvitations(data as Invitation[]);
    }
  }, []);

  useEffect(() => {
    if (activeOrg) {
      fetchMembers();
      fetchInvitations();
    }
  }, [activeOrg, fetchMembers, fetchInvitations]);

  const activeMember = members.find((m) => m.userId === session?.user.id);
  const canManage = activeMember?.role === "owner" || activeMember?.role === "admin";

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!activeOrg) return;
    setInviteError(null);
    setInviteSuccess(false);
    setInviteLoading(true);
    const { error } = await organization.inviteMember({
      email: inviteEmail,
      role: inviteRole,
      organizationId: activeOrg.id,
    });
    setInviteLoading(false);
    if (error) {
      setInviteError(error.message ?? "Erreur lors de l'invitation");
    } else {
      setInviteSuccess(true);
      setInviteEmail("");
      fetchInvitations();
    }
  }

  async function handleRemoveMember(memberId: string) {
    await organization.removeMember({ memberIdOrEmail: memberId });
    fetchMembers();
  }

  async function handleCancelInvitation(invitationId: string) {
    await organization.cancelInvitation({ invitationId });
    fetchInvitations();
  }

  if (!activeOrg) {
    return (
      <div className="space-y-4">
        <p className="text-zinc-500">Sélectionnez une organisation pour voir ses membres.</p>
      </div>
    );
  }

  const pendingInvitations = invitations.filter((inv) => inv.status === "pending");

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {activeOrg.name}
        </h1>
        <p className="text-zinc-500">/{activeOrg.slug}</p>
      </div>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Inviter un membre</CardTitle>
            <CardDescription>
              Un lien d&apos;invitation sera envoyé par email (affiché en console en dev).
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleInvite}>
            <CardContent className="space-y-4">
              {inviteError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                  {inviteError}
                </p>
              )}
              {inviteSuccess && (
                <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
                  Invitation envoyée ! (lien affiché dans les logs de l&apos;API)
                </p>
              )}
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="invite-email">Adresse email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="collegue@exemple.fr"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="w-36 space-y-2">
                  <Label>Rôle</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(v) => setInviteRole(v as "member" | "admin")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Membre</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={inviteLoading}>
                    <Send className="mr-1.5 h-4 w-4" />
                    {inviteLoading ? "Envoi…" : "Inviter"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Membres ({members.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                {canManage && <TableHead className="w-16" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => {
                const isMe = m.userId === session?.user.id;
                const initials = m.user.name
                  ?.split(" ")
                  .map((w: string) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {m.user.name}
                            {isMe && (
                              <span className="ml-2 text-xs text-zinc-400">(vous)</span>
                            )}
                          </p>
                          <p className="text-xs text-zinc-500">{m.user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[m.role] ?? ""}`}
                      >
                        {ROLE_LABELS[m.role] ?? m.role}
                      </span>
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        {!isMe && m.role !== "owner" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-zinc-400 hover:text-red-600"
                            onClick={() => handleRemoveMember(m.id)}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {canManage && pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invitations en attente ({pendingInvitations.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvitations.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="text-sm">{inv.email}</TableCell>
                    <TableCell>
                      <span className="text-sm text-zinc-500">
                        {ROLE_LABELS[inv.role ?? "member"] ?? inv.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-zinc-400 hover:text-red-600"
                        onClick={() => handleCancelInvitation(inv.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
