"use server";

import { revalidatePath } from "next/cache";

import { GENERIC_LINK_ERROR, type LinkActionResult, type LinkFormValues } from "@/lib/link-form-state";
import { getProfile, requireUserId } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { publicProfilePath } from "@/lib/username";
import { parseLinkInput, parseLinkOrder } from "@/lib/validation/link";

/**
 * Dashboard und öffentliche Seite zeigen dieselben Daten — nach jeder Mutation
 * müssen beide neu gebaut werden.
 */
async function revalidateLinkViews(userId: string): Promise<void> {
  revalidatePath("/dashboard");

  const profile = await getProfile(userId);
  if (profile?.username) {
    revalidatePath(publicProfilePath(profile.username));
  }
}

/**
 * Nächster freier Platz am Ende der Liste.
 *
 * Ohne Unique-Constraint auf (`user_id`, `sort_order`) können zwei gleichzeitige
 * Anlagen denselben Wert bekommen. Das ist hier hinnehmbar: die Liste sortiert
 * bei Gleichstand nach `created_at`, und `06-link-reordering.md` schreibt die
 * Reihenfolge ohnehin neu.
 */
async function nextSortOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<number> {
  const { data } = await supabase
    .from("links")
    .select("sort_order")
    .eq("user_id", userId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.sort_order ?? -1) + 1;
}

/** Legt einen Link am Ende der Liste an. `is_active` bleibt beim DB-Default `true`. */
export async function createLink(values: LinkFormValues): Promise<LinkActionResult> {
  const userId = await requireUserId();

  const parsed = parseLinkInput(values);
  if (!parsed.ok) {
    return { ok: false, message: "Bitte prüfe deine Eingaben.", fieldErrors: parsed.fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("links").insert({
    user_id: userId,
    title: parsed.data.title,
    url: parsed.data.url,
    sort_order: await nextSortOrder(supabase, userId),
  });

  if (error) {
    console.error("Link konnte nicht angelegt werden", { code: error.code, message: error.message });
    return { ok: false, message: GENERIC_LINK_ERROR };
  }

  await revalidateLinkViews(userId);
  return { ok: true };
}

/**
 * Ändert Titel und Adresse eines Links.
 *
 * `eq("user_id", userId)` ist die zweite Schranke neben der RLS-Policy: Ein
 * fremder Link führt so zu null betroffenen Zeilen statt zu einer Änderung.
 */
export async function updateLink(id: string, values: LinkFormValues): Promise<LinkActionResult> {
  const userId = await requireUserId();

  const parsed = parseLinkInput(values);
  if (!parsed.ok) {
    return { ok: false, message: "Bitte prüfe deine Eingaben.", fieldErrors: parsed.fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("links")
    .update({ title: parsed.data.title, url: parsed.data.url })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id");

  if (error) {
    console.error("Link konnte nicht geändert werden", { code: error.code, message: error.message });
    return { ok: false, message: GENERIC_LINK_ERROR };
  }

  if (data.length === 0) {
    return { ok: false, message: "Dieser Link existiert nicht mehr." };
  }

  await revalidateLinkViews(userId);
  return { ok: true };
}

/**
 * Schreibt die Reihenfolge der eigenen Links neu.
 *
 * Übertragen wird **nur die ID-Reihenfolge**; die `sort_order`-Werte leitet die
 * Datenbankfunktion `reorder_links` per `with ordinality` selbst ab. Ein
 * manipulierter Client kann damit keine eigenen Positionen setzen, und der
 * zusätzliche Filter `user_id = auth.uid()` in der Funktion lässt fremde Zeilen
 * unberührt.
 *
 * Der Aufrufer muss die **vollständige** eigene Liste schicken. Fehlt eine ID,
 * zählt die Ordinalität trotzdem über das ganze Array weiter — es entstehen
 * Lücken und Doppelbelegungen in der eigenen Nummerierung (in Spec 01
 * nachgewiesen, siehe `learning.md`).
 */
export async function reorderLinks(linkIds: string[]): Promise<LinkActionResult> {
  const userId = await requireUserId();

  const parsed = parseLinkOrder(linkIds);
  if (!parsed.ok) {
    console.error("Sortier-Anfrage abgewiesen", { count: linkIds?.length });
    return { ok: false, message: GENERIC_LINK_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("reorder_links", { link_ids: parsed.data });

  if (error) {
    console.error("Reihenfolge konnte nicht gespeichert werden", {
      code: error.code,
      message: error.message,
    });
    return { ok: false, message: GENERIC_LINK_ERROR };
  }

  await revalidateLinkViews(userId);
  return { ok: true };
}

/** Löscht einen Link. Die Bestätigung holt die Oberfläche ein, nicht diese Aktion. */
export async function deleteLink(id: string): Promise<LinkActionResult> {
  const userId = await requireUserId();

  const supabase = await createClient();
  const { error } = await supabase.from("links").delete().eq("id", id).eq("user_id", userId);

  if (error) {
    console.error("Link konnte nicht gelöscht werden", { code: error.code, message: error.message });
    return { ok: false, message: GENERIC_LINK_ERROR };
  }

  await revalidateLinkViews(userId);
  return { ok: true };
}
