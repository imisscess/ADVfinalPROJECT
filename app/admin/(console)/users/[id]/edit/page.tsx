import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminRole } from "@/lib/admin/auth";
import { getUser } from "@/lib/admin/queries";
import { updateUser } from "../../../../actions";
import { ActionForm } from "../../../../_components/FormError";
import { cardClass, fieldClass, primaryBtnClass, secondaryBtnClass } from "@/lib/admin/format";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminRole();
  const { id } = await params;
  const user = getUser(Number(id));
  if (!user) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl">
      <div className={cardClass}>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Edit user</h1>
        <p className="mt-2 text-sm text-slate-600">Leave the password blank to keep the current hash.</p>
        <ActionForm action={updateUser} className="mt-6 grid gap-4">
          <input type="hidden" name="id" value={user.id} />
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Full name
            <input name="full_name" defaultValue={user.full_name} className={fieldClass} required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Username
            <input name="username" defaultValue={user.username} className={fieldClass} required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Role
            <select name="role" defaultValue={user.role} className={fieldClass}>
              <option value="staff">Staff</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Email
            <input name="email" type="email" defaultValue={user.email ?? ""} className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Phone
            <input name="phone" defaultValue={user.phone ?? ""} className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            New password
            <input name="password" type="password" minLength={8} className={fieldClass} />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className={primaryBtnClass}>
              Save changes
            </button>
            <Link href={`/admin/users/${user.id}`} className={secondaryBtnClass}>
              Cancel
            </Link>
          </div>
        </ActionForm>
      </div>
    </main>
  );
}
