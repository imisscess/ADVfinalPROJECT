import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminRole } from "@/lib/admin/auth";
import { getUser } from "@/lib/admin/queries";
import { setUserActive } from "../../../actions";
import { cardClass, formatDateTime, primaryBtnClass, secondaryBtnClass } from "@/lib/admin/format";
import { ConfirmSubmit } from "../../../_components/ConfirmSubmit";
import { StatusPill } from "../../../_components/AdminUi";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminRole();
  const { id } = await params;
  const user = getUser(Number(id));
  if (!user) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl">
      <div className={cardClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{user.full_name}</h1>
            <p className="mt-1 text-sm text-slate-600">@{user.username}</p>
          </div>
          <StatusPill active={Boolean(user.is_active)} />
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-slate-500">Role</dt>
            <dd className="mt-1 font-semibold capitalize text-slate-900">{user.role}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="mt-1 font-semibold text-slate-900">{user.email || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Phone</dt>
            <dd className="mt-1 font-semibold text-slate-900">{user.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Password</dt>
            <dd className="mt-1 font-semibold text-slate-900">Hashed (never displayed)</dd>
          </div>
          <div>
            <dt className="text-slate-500">Created</dt>
            <dd className="mt-1 text-slate-900">{formatDateTime(user.created_at)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Updated</dt>
            <dd className="mt-1 text-slate-900">{formatDateTime(user.updated_at)}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/admin/users/${user.id}/edit`} className={primaryBtnClass}>
            Edit user
          </Link>
          <ConfirmSubmit
            action={setUserActive}
            message={user.is_active ? "Deactivate this account?" : "Activate this account?"}
            label={user.is_active ? "Deactivate" : "Activate"}
            className={secondaryBtnClass}
            fields={{ id: String(user.id), is_active: user.is_active ? "0" : "1" }}
          />
          <Link href="/admin/users" className={secondaryBtnClass}>
            Back
          </Link>
        </div>
      </div>
    </main>
  );
}
