import { requireAdminRole } from "@/lib/admin/auth";
import { listAudit } from "@/lib/admin/queries";
import { cardClass, fieldClass, formatDateTime } from "@/lib/admin/format";
import { EmptyState, FilterBar, FilterSubmit, Pagination } from "../../_components/AdminUi";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; userId?: string; action?: string; from?: string; to?: string; page?: string }>;
}) {
  await requireAdminRole();
  const params = await searchParams;
  const data = listAudit({
    q: params.q,
    userId: params.userId,
    action: params.action,
    from: params.from,
    to: params.to,
    page: Number(params.page || 1),
  });

  return (
    <main>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Audit logs</h1>
        <p className="mt-1 text-sm text-slate-600">
          Read-only AUDIT_LOGS. Entries are written by server actions and cannot be edited or deleted here.
        </p>
      </div>

      <FilterBar>
        <input type="hidden" name="page" value="1" />
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Search
          <input name="q" defaultValue={params.q ?? ""} placeholder="Action, table, description, record" className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          User
          <select name="userId" defaultValue={params.userId ?? "all"} className={fieldClass}>
            <option value="all">All users</option>
            {data.users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name} (@{user.username})
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Action
          <select name="action" defaultValue={params.action ?? "all"} className={fieldClass}>
            <option value="all">All actions</option>
            {data.actions.map((item) => (
              <option key={item.action} value={item.action}>
                {item.action}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          From
          <input name="from" type="date" defaultValue={params.from ?? ""} className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          To
          <input name="to" type="date" defaultValue={params.to ?? ""} className={fieldClass} />
        </label>
        <div className="flex items-end lg:col-span-5">
          <FilterSubmit />
        </div>
      </FilterBar>

      <section className={`${cardClass} mt-6 overflow-x-auto`}>
        {data.rows.length === 0 ? (
          <EmptyState title="No log entries" body="Administrative actions will appear here automatically." />
        ) : (
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Action</th>
                <th className="pb-3 font-medium">Table</th>
                <th className="pb-3 font-medium">Record</th>
                <th className="pb-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((log) => (
                <tr key={log.log_id} className="border-t border-border align-top">
                  <td className="py-3 text-slate-600">{formatDateTime(log.created_at)}</td>
                  <td className="py-3">{log.full_name || "System"}</td>
                  <td className="py-3 font-semibold">{log.action}</td>
                  <td className="py-3">{log.table_name}</td>
                  <td className="py-3">{log.record_id || "—"}</td>
                  <td className="py-3 text-slate-600">{log.description}</td>
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
            if (params.userId) search.set("userId", params.userId);
            if (params.action) search.set("action", params.action);
            if (params.from) search.set("from", params.from);
            if (params.to) search.set("to", params.to);
            search.set("page", String(next));
            return `/admin/audit?${search.toString()}`;
          }}
        />
      </section>
    </main>
  );
}
