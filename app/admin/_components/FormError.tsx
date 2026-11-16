"use client";

import { useActionState } from "react";
import type { ActionState } from "../actions";
import { AlertBanner } from "./AdminUi";

export function ActionForm({
  action,
  children,
  className,
}: {
  action: (state: ActionState | null, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className={className}>
      {state?.error ? <AlertBanner>{state.error}</AlertBanner> : null}
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
    </form>
  );
}
