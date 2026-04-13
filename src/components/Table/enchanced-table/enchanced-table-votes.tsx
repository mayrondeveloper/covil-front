import * as React from "react";
import { useState } from "react";
import { Chip, Typography } from "@mui/material";
import MilitaryTechRoundedIcon from "@mui/icons-material/MilitaryTechRounded";
import { remove } from "../../../services/votes/votes-service";
import { GenericTable, TablePaginationState, TableSortState } from "../GenericTable";
import { useNotification } from "../../../hooks/use-notification";
import { useUndoable } from "../../../hooks/use-undoable";
import ConfirmDialog from "../../ConfirmDialog";

interface Props {
  data: any[] | null;
  setData?: (d: any[] | null) => void;
  refresh?: any;
  onChanged?: () => void;
  pagination?: TablePaginationState;
  toolbar?: React.ReactNode;
  sort?: TableSortState;
}

const PLACE_COLOR: Record<string, { bg: string; color: string }> = {
  "1": { bg: "linear-gradient(135deg, #B45309 0%, #F59E0B 100%)", color: "#fff" },
  "2": { bg: "linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)", color: "#0F172A" },
  "3": { bg: "linear-gradient(135deg, #7C2D12 0%, #C2410C 100%)", color: "#fff" },
};

export default function EnchancedTableVotes({
  data,
  onChanged,
  pagination,
  toolbar,
  sort,
}: Props) {
  const { error } = useNotification();
  const undoable = useUndoable();
  const [confirmDelete, setConfirmDelete] = useState<any>(null);

  const onDeleteConfirmed = () => {
    if (!confirmDelete) return;
    const row = confirmDelete;
    setConfirmDelete(null);
    undoable.run({
      message: `Voto de ${row.participant?.name ?? "votante"} em ${row.game?.name ?? "jogo"} removido.`,
      onCommit: async () => {
        try {
          await remove(row.id);
          onChanged?.();
        } catch {
          error("Não foi possível remover o voto.");
          onChanged?.();
        }
      },
      onUndo: () => onChanged?.(),
    });
    // Ainda chamamos onChanged depois de algum tempo pra refletir UI; aqui já é refeito no commit.
  };

  return (
    <>
    <GenericTable<any>
      data={data ?? []}
      rowKey={(r) => r.id}
      dense
      columns={[
        {
          header: "Colocação",
          width: 120,
          sortField: "place",
          render: (r) => {
            const p = String(r.place ?? "");
            const style = PLACE_COLOR[p];
            return (
              <Chip
                size="small"
                icon={<MilitaryTechRoundedIcon sx={{ fontSize: 14 }} />}
                label={`${p}º lugar`}
                sx={{
                  fontWeight: 600,
                  background: style?.bg,
                  color: style?.color,
                  "& .MuiChip-icon": { color: style?.color },
                }}
              />
            );
          },
        },
        {
          header: "Prêmio",
          width: "30%",
          render: (r) => (
            <Typography sx={{ fontWeight: 500 }}>{r.award?.name ?? "—"}</Typography>
          ),
        },
        {
          header: "Categoria",
          hideOnMobile: true,
          render: (r) => (
            <Typography variant="body2" color="text.secondary">
              {r.category?.name ?? "—"}
            </Typography>
          ),
        },
        {
          header: "Jogo",
          width: "35%",
          render: (r) => (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {r.game?.name ?? "—"}
            </Typography>
          ),
        },
        {
          header: "Votante",
          hideOnMobile: true,
          render: (r) => (
            <Typography variant="body2" color="text.secondary">
              {r.participant?.name ?? "—"}
            </Typography>
          ),
        },
      ]}
      actions={[
        {
          icon: "delete",
          color: "warning",
          onClick: (r) => setConfirmDelete(r),
          tooltip: "Excluir voto",
        },
      ]}
      emptyMessage="Nenhum voto registrado ainda"
      emptyHint="Use o botão acima para cadastrar o primeiro."
      pagination={pagination}
      toolbar={toolbar}
      sort={sort}
    />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Excluir voto?"
        message={
          <span>
            Excluir o voto de <strong>{confirmDelete?.participant?.name}</strong> em{" "}
            <strong>{confirmDelete?.game?.name}</strong>?
          </span>
        }
        confirmLabel="Excluir"
        destructive
        onConfirm={onDeleteConfirmed}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
