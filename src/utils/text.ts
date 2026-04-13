/**
 * Normaliza texto para busca: remove acentos, lowercase, trim.
 * "Ação" → "acao", "Já votou" → "ja votou"
 */
export const normalize = (s: string | null | undefined): string =>
  (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacríticos
    .toLowerCase()
    .trim();

/** Retorna true se haystack contém needle (ambos normalizados). */
export const matchesSearch = (haystack: string | null | undefined, needle: string): boolean => {
  const n = normalize(needle);
  if (!n) return true;
  return normalize(haystack).includes(n);
};
