"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DeleteLinkDialogProps = {
  /** Der Link, um den es geht — `null` hält den Dialog geschlossen. */
  link: { id: string; title: string } | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

/**
 * Rückfrage vor dem Löschen. Bewusst ein `AlertDialog` und kein `Dialog`:
 * Er fängt den Fokus, lässt sich nicht per Klick daneben schließen und meldet
 * sich Screenreadern als Entscheidung, nicht als Nebeninformation.
 */
export function DeleteLinkDialog({ link, onOpenChange, onConfirm }: DeleteLinkDialogProps) {
  return (
    <AlertDialog open={link !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Link löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            „{link?.title}&ldquo; verschwindet aus deiner Liste und von deiner öffentlichen Seite.
            Rückgängig machen geht nicht.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-11 rounded-xl px-5 text-sm font-medium transition-all duration-200 ease-out">
            Abbrechen
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
            className="h-11 rounded-xl px-5 text-sm font-medium transition-all duration-200 ease-out"
          >
            Endgültig löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
