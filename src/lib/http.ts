import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export const ok = (data: unknown, init?: ResponseInit) => NextResponse.json({ data }, init);
export const fail = (status: number, code: string, message: string, details?: unknown) =>
  NextResponse.json({ error: { code, message, details } }, { status });
export const zodFail = (e: ZodError) => fail(422, "VALIDATION_ERROR", "Data tidak valid", e.flatten().fieldErrors);
