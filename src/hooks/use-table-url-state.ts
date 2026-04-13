import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export interface TableUrlStateOptions {
  /** Prefixo opcional pra evitar colisão quando há múltiplas tabelas no mesmo rota. */
  prefix?: string;
  defaultRowsPerPage?: number;
  defaultOrderBy?: string;
  defaultOrder?: "asc" | "desc";
}

export interface TableUrlState {
  page: number;
  rowsPerPage: number;
  q: string;
  orderBy: string | undefined;
  order: "asc" | "desc" | undefined;
  setPage: (p: number) => void;
  setRowsPerPage: (n: number) => void;
  setQ: (q: string) => void;
  setSort: (orderBy: string | undefined, order: "asc" | "desc" | undefined) => void;
}

/**
 * Sincroniza estado de tabela paginada (page, rowsPerPage, q, orderBy, order)
 * com query params da URL. Permite voltar pra tela mantendo posição/filtro/ordem.
 *
 * Uso:
 *   const t = useTableUrlState({ defaultRowsPerPage: 10, defaultOrderBy: "name", defaultOrder: "asc" });
 *   t.page, t.q, t.orderBy ...
 */
export const useTableUrlState = (opts: TableUrlStateOptions = {}): TableUrlState => {
  const { prefix = "", defaultRowsPerPage = 10, defaultOrderBy, defaultOrder } = opts;
  const k = (name: string) => (prefix ? `${prefix}_${name}` : name);

  const [params, setParams] = useSearchParams();

  const page = Math.max(1, Number(params.get(k("page"))) || 1);
  const rowsPerPage = Number(params.get(k("limit"))) || defaultRowsPerPage;
  const q = params.get(k("q")) ?? "";
  const orderBy = params.get(k("orderBy")) ?? defaultOrderBy;
  const orderRaw = params.get(k("order"));
  const order: "asc" | "desc" | undefined =
    orderRaw === "asc" || orderRaw === "desc" ? orderRaw : defaultOrder;

  const update = useCallback(
    (patch: Record<string, string | number | undefined | null>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(patch).forEach(([key, value]) => {
            const fullKey = k(key);
            if (value === undefined || value === null || value === "") {
              next.delete(fullKey);
            } else {
              next.set(fullKey, String(value));
            }
          });
          return next;
        },
        { replace: true }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setParams, prefix]
  );

  return {
    page,
    rowsPerPage,
    q,
    orderBy,
    order,
    setPage: (p) => update({ page: p === 1 ? undefined : p }),
    setRowsPerPage: (n) => update({ limit: n === defaultRowsPerPage ? undefined : n, page: undefined }),
    setQ: (newQ) => update({ q: newQ.trim() || undefined, page: undefined }),
    setSort: (newOrderBy, newOrder) =>
      update({
        orderBy: newOrderBy === defaultOrderBy ? undefined : newOrderBy,
        order: newOrder === defaultOrder ? undefined : newOrder,
        page: undefined,
      }),
  };
};
