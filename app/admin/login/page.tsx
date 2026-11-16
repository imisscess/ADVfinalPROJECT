import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { panelHome } from "@/lib/admin/types";
import { ActionForm } from "../_components/FormError";
import { loginAdmin } from "../actions";
import { cardClass, fieldClass, primaryBtnClass } from "@/lib/admin/format";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect(panelHome(session.role));

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 items-center px-4 py-10 md:px-6">
      <div className={`${cardClass} w-full`}>
        <p className="text-sm font-semibold text-brand">301 EAST Drugstore</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Admin sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Administrators open the admin console. Pharmacists and staff are sent to the pharmacy desk.
        </p>
        <ActionForm action={loginAdmin} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Username or email
            <input name="username" autoComplete="username" className={fieldClass} required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Password
            <input name="password" type="password" autoComplete="current-password" className={fieldClass} required />
          </label>
          <button type="submit" className={primaryBtnClass}>
            Sign in
          </button>
        </ActionForm>
        <p className="mt-5 text-xs text-slate-500">
          First-run accounts: <span className="font-semibold">admin</span> / PharmaAdmin!2026 and{" "}
          <span className="font-semibold">staff</span> / StaffDemo!2026. Change these after signing in.
        </p>
      </div>
    </main>
  );
}
