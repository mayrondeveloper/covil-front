import { useState } from "react";

export interface UseTableSortReturn {
  orderBy?: string;
  order?: "asc" | "desc";
  set: (orderBy: string | undefined, order: "asc" | "desc" | undefined) => void;
}

/**
 * Estado de ordenação para uso com `GenericTable.sort`.
 * `defaultOrderBy` e `defaultOrder` definem a ordem inicial.
 * `onChange` reseta a página, geralmente.
 */
export const useTableSort = (
  defaultOrderBy?: string,
  defaultOrder?: "asc" | "desc",
  onChange?: () => void
): UseTableSortReturn => {
  const [orderBy, setOrderBy] = useState<string | undefined>(defaultOrderBy);
  const [order, setOrder] = useState<"asc" | "desc" | undefined>(defaultOrder);

  return {
    orderBy,
    order,
    set: (newOrderBy, newOrder) => {
      setOrderBy(newOrderBy);
      setOrder(newOrder);
      onChange?.();
    },
  };
};
