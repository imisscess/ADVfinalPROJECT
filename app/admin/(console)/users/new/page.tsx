import Link from "next/link";
import { requireAdminRole } from "@/lib/admin/auth";
import { createUser } from "../../../actions";
import { ActionForm } from "../../../_components/FormError";
import { cardClass, fieldClass, primaryBtnClass, secondaryBtnClass } from "@/lib/admin/format";

export default async function NewUserPage() {
  await requireAdminRole();

  return (
    <main className="mx-auto w-full max-w-2xl">
      <div className={cardClass}>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Add user</h1>
        <p className="mt-2 text-sm text-slate-600">The password is hashed with scrypt before it is stored.</p>
        <ActionForm action={createUser} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Full name
            <input name="full_name" className={fieldClass} required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Username
            <input name="username" className={fieldClass} required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Role
            <select name="role" defaultValue="staff" className={fieldClass}>
              <option value="staff">Staff</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Email
            <input name="email" type="email" className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Phone
            <input name="phone" className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Password
            <input name="password" type="password" minLength={8} className={fieldClass} required />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className={primaryBtnClass}>
              Save user
            </button>
            <Link href="/admin/users" className={secondaryBtnClass}>
              Cancel
            </Link>
          </div>
        </ActionForm>
      </div>
    </main>
  );
}
