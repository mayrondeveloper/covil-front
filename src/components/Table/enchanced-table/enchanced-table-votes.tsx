import * as React from "react";
import { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MilitaryTechRoundedIcon from "@mui/icons-material/MilitaryTechRounded";
import { remove, update } from "../../../services/votes/votes-service";
import { findAllByAwardAndCategory as fetchGamesByAwardCategory } from "../../../services/game-service/game-service";
import { GenericTable, TablePaginationState, TableSortState } from "../GenericTable";
import { useNotification } from "../../../hooks/use-notification";
import { useUndoable } from "../../../hooks/use-undoable";
import { useScoringScheme } from "../../../hooks/queries";
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
  setData,
  onChanged,
  pagination,
  toolbar,
  sort,
}: Props) {
  const { success, error } = useNotification();
  const undoable = useUndoable();
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [editingRow, setEditingRow] = useState<any>(null);
  const [editPlace, setEditPlace] = useState<string>("");
  const [editGame, setEditGame] = useState<{ id: string; name: string } | null>(null);
  const [editGames, setEditGames] = useState<Array<{ id: string; name: string }>>([]);
  const [editGamesLoading, setEditGamesLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const editAwardId = editingRow?.id_award ?? editingRow?.award?.id;
  const editCategoryId = editingRow?.id_category ?? editingRow?.category?.id;
  const { data: editScheme } = useScoringScheme(editAwardId);

  useEffect(() => {
    if (!editingRow) {
      setEditPlace("");
      setEditGame(null);
      setEditGames([]);
      return;
    }
    setEditPlace(String(editingRow.place ?? ""));
    setEditGame(
      editingRow.game
        ? { id: editingRow.id_game ?? editingRow.game.id, name: editingRow.game.name }
        : null
    );
    if (editAwardId && editCategoryId) {
      setEditGamesLoading(true);
      fetchGamesByAwardCategory(editAwardId, editCategoryId)
        .then((r: any) => {
          const list: any[] = (r?.data ?? r ?? []) as any[];
          setEditGames(
            list
              .map((g: any) => ({ id: g.id ?? g.game?.id, name: g.name ?? g.game?.name }))
              .filter((g: any) => g.id && g.name)
          );
        })
        .catch(() => setEditGames([]))
        .finally(() => setEditGamesLoading(false));
    }
  }, [editingRow, editAwardId, editCategoryId]);

  const closeEdit = () => setEditingRow(null);

  const submitEdit = () => {
    if (!editingRow || !editPlace || !editGame || editSaving) return;
    setEditSaving(true);
    update(editingRow.id, { place: editPlace, id_game: editGame.id })
      .then(() => {
        success("Voto atualizado.");
        closeEdit();
        onChanged?.();
      })
      .catch(() => {
        // erro já é exibido pelo interceptor global
      })
      .finally(() => setEditSaving(false));
  };

  const onDeleteConfirmed = () => {
    if (!confirmDelete) return;
    const row = confirmDelete;
    setConfirmDelete(null);
    // Remoção otimista: tira da UI já. Se o usuário desfizer, restaura.
    const previous = data ?? [];
    setData?.(previous.filter((v) => v.id !== row.id));
    undoable.run({
      message: `Voto de ${row.participant?.name ?? "votante"} em ${row.game?.name ?? "jogo"} removido.`,
      onCommit: async () => {
        try {
          await remove(row.id);
          onChanged?.();
        } catch {
          // Restaura UI e avisa.
          setData?.(previous);
          error("Não foi possível remover o voto.");
        }
      },
      onUndo: () => setData?.(previous),
    });
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
          icon: "edit",
          color: "primary",
          onClick: (r) => setEditingRow(r),
          tooltip: "Editar voto",
        },
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

      <Dialog open={Boolean(editingRow)} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle>Editar voto</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Contexto</Typography>
              <Typography variant="body2">
                <strong>{editingRow?.participant?.name ?? "—"}</strong> em{" "}
                <strong>{editingRow?.category?.name ?? "—"}</strong> ({editingRow?.award?.name ?? "—"})
              </Typography>
            </Box>
            <TextField
              select
              label="Colocação"
              value={editPlace}
              onChange={(e) => setEditPlace(e.target.value)}
              fullWidth
              helperText={
                editScheme?.places?.length
                  ? "Trocar a colocação pode falhar se o votante já tiver outro voto nesse lugar."
                  : "Carregando esquema…"
              }
            >
              {(editScheme?.places ?? []).map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label} ({p.points} pts)
                </MenuItem>
              ))}
            </TextField>
            <Autocomplete
              options={editGames}
              value={editGame}
              onChange={(_, v) => setEditGame(v)}
              getOptionLabel={(o) => o.name}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              loading={editGamesLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Jogo"
                  helperText="Trocar o jogo pode falhar se o votante já tiver votado nele nesta categoria."
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit} disabled={editSaving}>Cancelar</Button>
          <Button
            onClick={submitEdit}
            variant="contained"
            disabled={!editPlace || !editGame || editSaving}
          >
            {editSaving ? "Salvando…" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

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
