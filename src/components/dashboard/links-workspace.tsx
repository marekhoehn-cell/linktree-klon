"use client";

import { Plus } from "lucide-react";
import { startTransition, useOptimistic, useRef, useState } from "react";
import { toast } from "sonner";

import { createLink, deleteLink, reorderLinks, updateLink } from "@/app/dashboard/links/actions";
import { DeleteLinkDialog } from "@/components/dashboard/delete-link-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LinkFormDialog } from "@/components/dashboard/link-form-dialog";
import { LinkList } from "@/components/dashboard/link-list";
import { PreviewPanel } from "@/components/dashboard/preview-panel";
import { ProfileView } from "@/components/profile/profile-view";
import { Button } from "@/components/ui/button";
import { GENERIC_LINK_ERROR, type LinkActionResult, type LinkFormValues } from "@/lib/link-form-state";
import type { ProfileWithUsername } from "@/lib/supabase/auth";
import type { Link } from "@/lib/supabase/links";
import { withHttpsPrefix } from "@/lib/validation/link";

type OptimisticState = {
  links: Link[];
  /** IDs mit noch offener Server-Antwort — die Karten sind so lange gedämpft. */
  pendingIds: Set<string>;
};

type OptimisticAction =
  | { type: "create"; link: Link }
  | { type: "update"; id: string; values: LinkFormValues }
  | { type: "delete"; id: string }
  | { type: "reorder"; ids: string[] };

function reduceLinks(state: OptimisticState, action: OptimisticAction): OptimisticState {
  switch (action.type) {
    case "create":
      return {
        links: [...state.links, action.link],
        pendingIds: new Set(state.pendingIds).add(action.link.id),
      };
    case "update":
      return {
        links: state.links.map((link) =>
          link.id === action.id
            ? { ...link, title: action.values.title.trim(), url: withHttpsPrefix(action.values.url.trim()) }
            : link,
        ),
        pendingIds: new Set(state.pendingIds).add(action.id),
      };
    case "delete":
      return {
        links: state.links.filter((link) => link.id !== action.id),
        pendingIds: state.pendingIds,
      };
    case "reorder": {
      // Die Aktion trägt nur IDs. Sie wird bei jedem Neuberechnen der
      // optimistischen Kette erneut angewandt — deshalb darf sie keine Link-Objekte
      // aus einem älteren Stand mitschleppen, sondern sortiert immer den Stand um,
      // den sie gerade bekommt.
      const remaining = new Map(state.links.map((link) => [link.id, link]));
      const ordered: Link[] = [];

      for (const id of action.ids) {
        const link = remaining.get(id);
        if (link) {
          ordered.push(link);
          remaining.delete(id);
        }
      }

      // Was die Reihenfolge nicht kennt (etwa ein gerade angelegter Link), bleibt hinten.
      return { links: [...ordered, ...remaining.values()], pendingIds: state.pendingIds };
    }
  }
}

/**
 * Führt eine Server Action aus und macht **jeden** Fehlerweg sichtbar.
 *
 * Wichtig: Ist der Server nicht erreichbar, liefert der Aufruf kein
 * `{ ok: false }` — er wirft. Ohne dieses `catch` verschwände der optimistische
 * Eintrag wortlos wieder, und der Nutzer wüsste nicht, warum.
 */
async function runAction(action: () => Promise<LinkActionResult>): Promise<void> {
  try {
    const result = await action();
    if (!result.ok) {
      toast.error(result.message);
    }
  } catch (error) {
    console.error("Link-Aktion fehlgeschlagen", error);
    toast.error(GENERIC_LINK_ERROR);
  }
}

type LinksWorkspaceProps = {
  links: Link[];
  /** Liefert `id` für optimistische Zeilen und den Kopfbereich der Vorschau. */
  profile: ProfileWithUsername;
};

/**
 * Klammer um Liste **und** Vorschau: Beide zeigen denselben optimistischen
 * Stand, deshalb muss der State über beiden liegen. Die Vorschau wandert damit
 * bewusst in den Client-Bundle — anders wäre keine sofortige Aktualisierung
 * ohne Seiten-Neuaufbau möglich.
 *
 * `useOptimistic` verwirft seinen Zwischenstand automatisch, sobald die
 * Transition endet. Ein Fehler braucht deshalb keinen Rücksetz-Code: die Liste
 * fällt von selbst auf die Server-Daten zurück, der Toast erklärt warum.
 */
export function LinksWorkspace({ links, profile }: LinksWorkspaceProps) {
  const userId = profile.id;

  const [optimistic, applyOptimistic] = useOptimistic<OptimisticState, OptimisticAction>(
    { links, pendingIds: new Set() },
    reduceLinks,
  );

  const [formTarget, setFormTarget] = useState<Link | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Link | null>(null);

  /** Zuletzt während des Ziehens gemeldete Reihenfolge; `null` heißt: kein Ziehvorgang offen. */
  const dragOrderRef = useRef<string[] | null>(null);
  /** Öffnet gehaltene Transitionen wieder — siehe `handleReorder`. */
  const dragHoldsRef = useRef<Array<() => void>>([]);

  function releaseDragHolds() {
    for (const release of dragHoldsRef.current) release();
    dragHoldsRef.current = [];
  }

  /**
   * Läuft während des Ziehens, sobald Motion eine neue Reihenfolge meldet — und
   * **speichert bewusst nicht** (Pflicht-Maßnahme 3): Sonst entstünden pro
   * Ziehvorgang dutzende Server-Aufrufe.
   *
   * Der Kniff mit dem offenen Versprechen: `useOptimistic` verwirft seinen Stand,
   * sobald die auslösende Transition endet. Endete sie hier sofort, spränge die
   * Karte mitten im Ziehen auf die Server-Reihenfolge zurück. Die Transition
   * bleibt deshalb offen, bis `handleDragEnd` sie freigibt.
   */
  function handleReorder(linkIds: string[]) {
    dragOrderRef.current = linkIds;

    startTransition(async () => {
      applyOptimistic({ type: "reorder", ids: linkIds });
      await new Promise<void>((resolve) => {
        dragHoldsRef.current.push(resolve);
      });
    });
  }

  /** Der einzige Speicherpunkt eines Ziehvorgangs. */
  function handleDragEnd() {
    const linkIds = dragOrderRef.current;
    dragOrderRef.current = null;

    // Am Griff gezogen, ohne die Reihenfolge zu ändern: nichts zu speichern.
    if (!linkIds) {
      releaseDragHolds();
      return;
    }

    startTransition(async () => {
      applyOptimistic({ type: "reorder", ids: linkIds });
      // Erst jetzt freigeben: Die endgültige Reihenfolge liegt bereits auf dem
      // Stapel, deshalb wird beim Aufräumen kein Zwischenstand sichtbar.
      releaseDragHolds();
      await runAction(() => reorderLinks(linkIds));
    });
  }

  /** Tastatur- und Touch-Weg: vertauscht die Karte mit ihrem Nachbarn. */
  function handleMove(index: number, offset: -1 | 1) {
    const linkIds = optimistic.links.map((link) => link.id);
    const target = index + offset;
    if (target < 0 || target >= linkIds.length) return;

    [linkIds[index], linkIds[target]] = [linkIds[target], linkIds[index]];

    startTransition(async () => {
      applyOptimistic({ type: "reorder", ids: linkIds });
      await runAction(() => reorderLinks(linkIds));
    });
  }

  function openCreateForm() {
    setFormTarget(null);
    setIsFormOpen(true);
  }

  function openEditForm(link: Link) {
    setFormTarget(link);
    setIsFormOpen(true);
  }

  function handleSubmit(values: LinkFormValues) {
    const target = formTarget;

    startTransition(async () => {
      if (target) {
        applyOptimistic({ type: "update", id: target.id, values });
        await runAction(() => updateLink(target.id, values));
        return;
      }

      // Platzhalter-Zeile für die Zeit bis zur Server-Antwort. Die echte ID
      // liefert die Datenbank; diese hier existiert nur im Browser.
      const now = new Date().toISOString();
      applyOptimistic({
        type: "create",
        link: {
          id: crypto.randomUUID(),
          user_id: userId,
          title: values.title.trim(),
          url: withHttpsPrefix(values.url.trim()),
          sort_order: Number.MAX_SAFE_INTEGER,
          is_active: true,
          created_at: now,
          updated_at: now,
        },
      });

      await runAction(() => createLink(values));
    });
  }

  function handleDelete(link: Link) {
    setDeleteTarget(null);

    startTransition(async () => {
      applyOptimistic({ type: "delete", id: link.id });
      await runAction(() => deleteLink(link.id));
    });
  }

  const hasLinks = optimistic.links.length > 0;

  return (
    <>
      <section className="min-w-0">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Deine Links</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Sortiere und bearbeite, was auf deiner Seite steht.
            </p>
          </div>
          {hasLinks ? (
            <Button
              type="button"
              onClick={openCreateForm}
              className="h-11 min-w-11 gap-2 rounded-2xl px-5 text-sm font-medium shadow-lg transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-xl"
            >
              <Plus className="size-4" aria-hidden="true" />
              Link hinzufügen
            </Button>
          ) : null}
        </div>

        {hasLinks ? (
          <LinkList
            links={optimistic.links}
            pendingIds={optimistic.pendingIds}
            onReorder={handleReorder}
            onDragEnd={handleDragEnd}
            onMove={handleMove}
            onEdit={openEditForm}
            onDelete={setDeleteTarget}
          />
        ) : (
          <EmptyState onAdd={openCreateForm} />
        )}
      </section>

      <PreviewPanel>
        <ProfileView
          username={profile.username}
          displayName={profile.display_name}
          bio={profile.bio}
          avatarUrl={profile.avatar_url}
          accentColor={profile.accent_color}
          // Wie die öffentliche Seite: Nur aktive Links stehen in der Vorschau.
          // Ohne den Filter zeigte sie mehr, als Besucher zu sehen bekommen.
          links={optimistic.links.filter((link) => link.is_active)}
          variant="preview"
        />
      </PreviewPanel>

      <LinkFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialValues={formTarget ? { title: formTarget.title, url: formTarget.url } : null}
        onSubmit={handleSubmit}
      />

      <DeleteLinkDialog
        link={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget);
        }}
      />
    </>
  );
}
