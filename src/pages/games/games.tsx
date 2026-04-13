import { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ConfirmDialog from "../../components/ConfirmDialog";
import { Link, useNavigate } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { fetchPage, deleteGame } from "../../services/game-service/game-service";
import EmptyState from "../../components/Empty/empty-state";
import PageLayout from "../../components/Layout/PageLayout";
import PageHeader from "../../components/Layout/PageHeader";
import SectionCard from "../../components/Layout/SectionCard";
import { GenericTable } from "../../components/Table/GenericTable";
import { Game } from "../../services/types";
import { useNotification } from "../../hooks/use-notification";
import SearchField from "../../components/Form/Field/SearchField";
import { useTableUrlState } from "../../hooks/use-table-url-state";
import { useUndoable } from "../../hooks/use-undoable";

const refList = (list: any, key: "category" | "publisher" | "design" | "mechanism"): string[] =>
  Array.isArray(list)
    ? list.map((item: any) => item?.[key]?.name ?? item?.name ?? "").filter(Boolean)
    : [];

const ChipList = ({ items, max = 2 }: { items: string[]; max?: number }) => {
  if (items.length === 0) return <Typography variant="body2" color="text.disabled">—</Typography>;
  const visible = items.slice(0, max);
  const extra = items.length - visible.length;
  return (
    <Stack direction="row" gap={0.5} flexWrap="wrap" alignItems="center">
      {visible.map((label, i) => (
        <Chip key={i} size="small" label={label} variant="outlined" sx={{ height: 22, fontSize: 11 }} />
      ))}
      {extra > 0 && (
        <Tooltip title={items.slice(max).join(", ")}>
          <Chip
            size="small"
            label={`+${extra}`}
            sx={{ height: 22, fontSize: 11, bgcolor: "background.default" }}
          />
        </Tooltip>
      )}
    </Stack>
  );
};

export const Games = () => {
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const undoable = useUndoable();
  const [games, setGames] = useState<Game[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<Game | null>(null);
  const url = useTableUrlState({ defaultRowsPerPage: 10 });
  const { page, rowsPerPage, q } = url;
  const setPage = url.setPage;
  const setRowsPerPage = url.setRowsPerPage;
  const setQ = url.setQ;
  const sort = { orderBy: url.orderBy, order: url.order, set: url.setSort };

  const fetchGames = useCallback(() => {
    setLoading(true);
    fetchPage({
      page,
      limit: rowsPerPage,
      q: q || undefined,
      orderBy: sort.orderBy,
      order: sort.order,
    })
      .then((r) => {
        setGames(r.data.data);
        setTotal(r.data.total);
      })
      .finally(() => setLoading(false));
  }, [page, rowsPerPage, q, sort.orderBy, sort.order]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const onDeleteConfirmed = () => {
    if (!confirmDelete) return;
    const row = confirmDelete;
    setConfirmDelete(null);
    const previous = games;
    setGames((prev) => prev.filter((g) => g.id !== row.id));
    undoable.run({
      message: `Jogo "${row.name}" removido.`,
      onCommit: async () => {
        try {
          await deleteGame(row.id);
          if (games.length === 1 && page > 1) setPage(page - 1);
          else fetchGames();
        } catch {
          setGames(previous);
          error("Não foi possível remover o jogo.");
        }
      },
      onUndo: () => setGames(previous),
    });
  };

  const editarJogo = (row: Game) => navigate(`/game/edit-game/${row.id}`);

  const isFiltering = q.trim().length > 0;
  const showEmpty = !loading && total === 0;

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Catálogo"
        title="Jogos"
        subtitle="Lista de todos os jogos cadastrados. Adicione manualmente ou importe a partir de uma URL externa."
        crumbs={[{ label: "Início", to: "/" }, { label: "Jogos" }]}
        actions={
          <Stack direction="row" gap={1.5} flexWrap="wrap">
            <Button
              component={Link}
              to="/game/add-by-link"
              variant="outlined"
              startIcon={<LinkRoundedIcon />}
            >
              Adicionar via link
            </Button>
            <Button
              component={Link}
              to="/game/create-game"
              variant="contained"
              color="secondary"
              startIcon={<AddRoundedIcon />}
            >
              Novo jogo
            </Button>
          </Stack>
        }
      />

      {showEmpty && !isFiltering ? (
        <SectionCard>
          <Box sx={{ py: 4 }}>
            <EmptyState
              title="Nenhum jogo cadastrado"
              subtitle="Comece adicionando um jogo manualmente ou importando-o por URL."
              button={{ title: "Adicionar jogo", url: "/game/create-game" }}
            />
          </Box>
        </SectionCard>
      ) : (
        <SectionCard
          description={
            loading
              ? "Carregando…"
              : isFiltering
              ? `${total} ${total === 1 ? "jogo encontrado" : "jogos encontrados"} para "${q}".`
              : `${total} ${total === 1 ? "jogo" : "jogos"} no catálogo.`
          }
        >
          <GenericTable<Game>
            data={games}
            rowKey={(g) => g.id}
            columns={[
              {
                header: "Jogo",
                sortField: "name",
                render: (g: any) => (
                  <Stack
                    direction="row"
                    gap={1.5}
                    alignItems="center"
                    onClick={() => editarJogo(g)}
                    sx={{
                      cursor: "pointer",
                      "&:hover .game-name": { color: "secondary.main" },
                    }}
                  >
                    {g.image ? (
                      <Avatar variant="rounded" src={g.image} sx={{ width: 44, height: 44 }} />
                    ) : (
                      <Avatar
                        variant="rounded"
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: (t) => `${t.palette.secondary.main}1a`,
                          color: "secondary.main",
                          fontWeight: 700,
                        }}
                      >
                        {g.name?.[0]?.toUpperCase() ?? "?"}
                      </Avatar>
                    )}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        className="game-name"
                        sx={{ fontWeight: 600, lineHeight: 1.2, transition: "color 150ms" }}
                        noWrap
                      >
                        {g.name}
                      </Typography>
                      <Stack direction="row" gap={1} alignItems="center" sx={{ mt: 0.25 }}>
                        {g.year_published && (
                          <Stack direction="row" gap={0.4} alignItems="center">
                            <CalendarTodayRoundedIcon
                              sx={{ fontSize: 11, color: "text.disabled" }}
                            />
                            <Typography variant="caption" color="text.disabled">
                              {g.year_published}
                            </Typography>
                          </Stack>
                        )}
                        {g.num_players && (
                          <Stack direction="row" gap={0.4} alignItems="center">
                            <GroupsRoundedIcon
                              sx={{ fontSize: 12, color: "text.disabled" }}
                            />
                            <Typography variant="caption" color="text.disabled">
                              {g.num_players}
                            </Typography>
                          </Stack>
                        )}
                        {g.playing_time && (
                          <Typography variant="caption" color="text.disabled">
                            · {g.playing_time}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                ),
              },
              {
                header: "Categorias",
                hideOnMobile: true,
                render: (g: any) => <ChipList items={refList(g.categories, "category")} />,
              },
              {
                header: "Editora",
                hideOnMobile: true,
                width: 180,
                render: (g: any) => (
                  <ChipList items={refList(g.publishers, "publisher")} max={1} />
                ),
              },
            ]}
            actions={[
              {
                icon: <OpenInNewRoundedIcon fontSize="small" />,
                color: "default",
                onClick: editarJogo,
                tooltip: "Abrir / editar",
              },
              {
                icon: "delete",
                color: "warning",
                onClick: (g) => setConfirmDelete(g),
                tooltip: "Excluir",
              },
            ]}
            pagination={{
              page,
              rowsPerPage,
              total,
              onPageChange: setPage,
              onRowsPerPageChange: (rows) => {
                setRowsPerPage(rows);
                setPage(1);
              },
            }}
            toolbar={
              <SearchField
                value={q}
                onChange={(v) => {
                  setQ(v);
                  setPage(1);
                }}
                placeholder="Buscar jogo por nome…"
              />
            }
            sort={{ orderBy: sort.orderBy, order: sort.order, onChange: sort.set }}
            loading={loading}
            emptyMessage={
              loading
                ? "Carregando…"
                : isFiltering
                ? `Nada encontrado para "${q}"`
                : "Nenhum jogo cadastrado"
            }
            emptyHint={
              loading
                ? undefined
                : isFiltering
                ? "Tente outro termo ou limpe a busca."
                : undefined
            }
          />
        </SectionCard>
      )}

      <ConfirmDialog
        open={confirmDelete != null}
        title="Excluir jogo?"
        message={
          <span>
            Você está prestes a excluir <strong>{confirmDelete?.name}</strong>. Pode afetar
            prêmios ou votos vinculados.
          </span>
        }
        confirmLabel="Excluir"
        destructive
        onConfirm={onDeleteConfirmed}
        onClose={() => setConfirmDelete(null)}
      />
    </PageLayout>
  );
};

export default Games;
