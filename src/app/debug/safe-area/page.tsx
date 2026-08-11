import { notFound } from "next/navigation";
import { IS_PRODUCTION } from "@/lib/site";
import { SafeAreaProbe } from "./probe";

/**
 * TEMPORARY diagnostic surface for the Dynamic Island work (2026-08-11).
 *
 * Emulated WebKit reports every safe-area inset as 0, so the only place the
 * island behaviour can be measured is a physical iPhone — and the phone has
 * no console. This page puts the numbers on its screen instead. Delete it
 * once the island investigation closes; the production gate below means it
 * can never ship meanwhile.
 */
export const metadata = { title: "Safe-area probe", robots: { index: false } };

export default function SafeAreaDebugPage() {
  if (IS_PRODUCTION) notFound();
  return <SafeAreaProbe />;
}
