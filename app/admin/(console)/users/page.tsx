import Link from "next/link";
import { requireAdminRole } from "@/lib/admin/auth";
import { listUsers } from "@/lib/admin/queries";
import { cardClass, fieldClass, formatDateTime, primaryBtnClass } from "@/lib/admin/format";
import { AlertBanner, EmptyState, FilterBar, FilterSubmit, Pagination, StatusPill } from "../../_components/AdminUi";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; status?: string; page?: string; error?: string }>;
}) {
  await requireAdminRole();
  const params = await searchParams;
  const page = Number(params.page || 1);
  const data = listUsers({ q: params.q, role: params.role, status: params.status, page });

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">User management</h1>
          <p className="mt-1 text-sm text-slate-600">Accounts in the USERS table. Passwords are hashed and never displayed.</p>
        </div>
        <Link href="/admin/users/new" className={primaryBtnClass}>
          Add user
        </Link>
      </div>

      {params.error === "self" ? (
        <div className="mt-4">
          <AlertBanner>You cannot deactivate your own account.</AlertBanner>
        </div>
      ) : null}
      {params.error === "lastadmin" ? (
        <div className="mt-4">
          <AlertBanner>At least one active administrator is required.</AlertBanner>
        </div>
      ) : null}

      <FilterBar>
        <input type="hidden" name="page" value="1" />
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Search
          <input name="q" defaultValue={params.q ?? ""} placeholder="Name, username, email" className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Role
          <select name="role" defaultValue={params.role ?? "all"} className={fieldClass}>
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="pharmacist">Pharmacist</option>
            <option value="staff">Staff</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Status
          <select name="status" defaultValue={params.status ?? "all"} className={fieldClass}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <div className="flex items-end">
          <FilterSubmit />
        </div>
      </FilterBar>

      <section className={`${cardClass} mt-6 overflow-x-auto`}>
        {data.rows.length === 0 ? (
          <EmptyState title="No users found" body="Try a different search or create a new account." />
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Username</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((user) => (
                <tr key={user.id} className="border-t border-border">
                  <td className="py-3">
                    <Link href={`/admin/users/${user.id}`} className="font-semibold text-brand">
                      {user.full_name}
                    </Link>
                    <div className="text-xs text-slate-500">{user.email || "No email"}</div>
                  </td>
                  <td className="py-3">{user.username}</td>
                  <td className="py-3 capitalize">{user.role}</td>
                  <td className="py-3">
                    <StatusPill active={Boolean(user.is_active)} />
                  </td>
                  <td className="py-3 text-slate-600">{formatDateTime(user.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          href={(next) => {
            const search = new URLSearchParams();
            if (params.q) search.set("q", params.q);
            if (params.role) search.set("role", params.role);
            if (params.status) search.set("status", params.status);
            search.set("page", String(next));
            return `/admin/users?${search.toString()}`;
          }}
        />
      </section>
    </main>
  );
}
