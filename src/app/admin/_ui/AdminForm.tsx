"use client";
import { createContext, startTransition, useActionState, useContext, useEffect, useRef } from "react";
import type { ActionState } from "./types";

const Ctx = createContext<{ state: ActionState; pending: boolean }>({ state: null, pending: false });
export const useFieldError = (name: string) => useContext(Ctx).state?.fieldErrors?.[name]?.[0];
export const useFormPending = () => useContext(Ctx).pending;

/**
 * Pembungkus form server action.
 * Memakai onSubmit + startTransition (bukan prop `action`) agar React 19 TIDAK mereset isian
 * saat validasi gagal — operator tidak kehilangan teks yang sudah diketik.
 */
export default function AdminForm({ action, children, className = "space-y-5", resetOnSuccess = false }: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (resetOnSuccess && state?.ok) ref.current?.reset(); }, [state, resetOnSuccess]);
  return (
    <Ctx.Provider value={{ state, pending }}>
      {/* method="post": bila JavaScript gagal dimuat, browser tidak menaruh isian (mis. password) di URL */}
      <form ref={ref} method="post" className={className} noValidate aria-busy={pending}
        onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => formAction(fd)); }}>
        {state?.message && (
          <p role={state.ok ? "status" : "alert"}
            className={`rounded-btn border px-3 py-2 text-sm lg:col-span-full sm:col-span-full ${state.ok ? "border-mint/40 bg-mint/10 text-mint-ink" : "border-red-200 bg-red-50 text-red-800"}`}>
            {state.message}
          </p>
        )}
        {children}
      </form>
    </Ctx.Provider>
  );
}
