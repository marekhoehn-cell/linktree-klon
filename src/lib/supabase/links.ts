import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export type Link = Database["public"]["Tables"]["links"]["Row"];

/**
 * Links eines Nutzers in Anzeigereihenfolge.
 *
 * `created_at` als zweites Kriterium: `sort_order` ist nicht eindeutig, zwei
 * gleiche Werte sollen trotzdem stabil in derselben Reihenfolge stehen.
 * Die RLS-Policy begrenzt zusätzlich auf die eigenen Zeilen — das `eq` hier
 * ist die zweite, nicht die einzige Schranke.
 */
export async function getLinks(userId: string): Promise<Link[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Links konnten nicht geladen werden", {
      code: error.code,
      message: error.message,
    });
    return [];
  }

  return data;
}
