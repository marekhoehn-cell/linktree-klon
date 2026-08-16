/**
 * Bis zu zwei Initialen: aus zwei Wörtern je der erste Buchstabe, sonst die
 * ersten beiden Zeichen. Grundlage ist der Anzeigename, ersatzweise der Username.
 *
 * Steht bewusst hier und nicht in `components/profile/avatar.tsx`: Jene Datei
 * ist eine Client-Komponente, ihre Exporte sind auf dem Server nur Referenzen
 * und nicht aufrufbar. Die Erzeugung des Open-Graph-Bildes braucht die Funktion
 * aber serverseitig.
 */
export function getInitials(displayName: string | null, username: string): string {
  const source = displayName?.trim() || username;
  const words = source.split(/\s+/).filter(Boolean);

  const initials =
    words.length >= 2
      ? `${[...words[0]][0]}${[...words[1]][0]}`
      : [...source].slice(0, 2).join("");

  return initials.toUpperCase();
}
