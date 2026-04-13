import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import {
  cloneAward,
  fetchPage,
  remove,
} from "../../../services/awards-service/awards-service";
import PageLayout from "../../../components/Layout/PageLayout";
import PageHeader from "../../../components/Layout/PageHeader";
import SectionCard from "../../../components/Layout/SectionCard";
import { GenericTable } from "../../../components/Table/GenericTable";
import SearchField from "../../../components/Form/Field/SearchField";
import { useNotification } from "../../../hooks/use-notification";
import { useTableUrlState } from "../../../hooks/use-table-url-state";
import { useUndoable } from "../../../hooks/use-undoable";
import ConfirmDialog from "../../../components/ConfirmDialog";

export const DragaoDeOuro = () => {
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const undoable = useUndoable();
  const [awards, setAwards] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const url = useTableUrlState({ defaultRowsPerPage: 10 });
  const { page, rowsPerPage, q } = url;
  const setPage = url.setPage;
  const setRowsPerPage = url.setRowsPerPage;
  const setQ = url.setQ;
  const sort = {
    orderBy: url.orderBy,
    order: url.order,
    set: url.setSort,
  };
  const [confirmDelete, setConfirmDelete] = useState<any>(null);

  const [cloning, setCloning] = useState<any>(null);
  const [cloneName, setCloneName] = useState("");
  const [cloneYear, setCloneYear] = useState("");
  const [copyCategories, setCopyCategories] = useState(true);
  const [copyVoters, setCopyVoters] = useState(true);
  const [copyGames, setCopyGames] = useState(true);
  const [savingClone, setSavingClone] = useState(false);

  const fetchAwards = useCallback(() => {
    setLoading(true);
    fetchPage({
      page,
      limit: rowsPerPage,
      q: q || undefined,
      orderBy: sort.orderBy,
      order: sort.order,
    })
      .then((r) => {
        setAwards(r.data.data);
        setTotal(r.data.total);
      })
      .finally(() => setLoading(false));
  }, [page, rowsPerPage, q, sort.orderBy, sort.order]);

  useEffect(() => {
    fetchAwards();
  }, [fetchAwards]);

  const onDeleteConfirmed = () => {
    if (!confirmDelete) return;
    const row = confirmDelete;
    setConfirmDelete(null);
    // remoção otimista
    const previous = awards;
    setAwards((prev) => prev.filter((a) => a.id !== row.id));
    undoable.run({
      message: `Prêmio "${row.name}" removido.`,
      onCommit: async () => {
        try {
          await remove(row.id);
          if (awards.length === 1 && page > 1) setPage(page - 1);
          else fetchAwards();
        } catch {
          setAwards(previous); // reverte se backend falhar
          error("Não foi possível remover.");
        }
      },
      onUndo: () => setAwards(previous),
    });
  };

  const openClone = (row: any) => {
    const baseYear = Number(row.year) || new Date().getFullYear();
    setCloning(row);
    setCloneName(row.name);
    setCloneYear(String(baseYear + 1));
    setCopyCategories(true);
    setCopyVoters(true);
    setCopyGames(true);
  };

  const submitClone = () => {
    if (!cloning) return;
    setSavingClone(true);
    cloneAward(cloning.id, {
      name: cloneName.trim(),
      year: cloneYear.trim(),
      copy_categories: copyCategories,
      copy_voters: copyVoters,
      copy_games: copyGames,
    })
      .then((r: any) => {
        success("Edição clonada com sucesso!");
        setCloning(null);
        const newId = r?.data?.id;
        if (newId) navigate(`/awards/edit-awards/${newId}`);
        else fetchAwards();
      })
      .catch(() => undefined) // mensagem do interceptor
      .finally(() => setSavingClone(false));
  };

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Premiação"
        title="Prêmios"
        subtitle="Edições do Dragão de Ouro registradas na plataforma."
        crumbs={[{ label: "Início", to: "/" }, { label: "Prêmios" }]}
        actions={
          <Button
            component={Link}
            to="/awards/create-awards"
            variant="contained"
            color="secondary"
            startIcon={<AddRoundedIcon />}
          >
            Nova edição
          </Button>
        }
      />
      <SectionCard
        title="Edições"
        description={loading ? "Carregando…" : `${total} ${total === 1 ? "edição" : "edições"} no total.`}
      >
        <GenericTable<any>
          data={awards}
          rowKey={(r) => r.id}
          dense
          columns={[
            {
              header: "Prêmio",
              width: "40%",
              sortField: "name",
              render: (r) => (
                <Stack direction="row" alignItems="center" gap={1}>
                  <Typography sx={{ fontWeight: 600 }}>{r.name}</Typography>
                  {r.year && <Chip size="small" label={r.year} variant="outlined" />}
                </Stack>
              ),
            },
            {
              header: "Descrição",
              hideOnMobile: true,
              render: (r) => (
                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 320 }}>
                  {r.description || "—"}
                </Typography>
              ),
            },
            {
              header: "Criado por",
              hideOnMobile: true,
              width: 140,
              render: (r) => (
                <Typography variant="body2" color="text.secondary">
                  {r.created_by || "—"}
                </Typography>
              ),
            },
            {
              header: "Categorias",
              align: "right",
              width: 110,
              render: (r) => {
                const count = Array.isArray(r.awards_categories)
                  ? r.awards_categories.length
                  : 0;
                return count > 0 ? (
                  <Chip size="small" label={`${count}`} color="secondary" variant="outlined" />
                ) : (
                  <Typography variant="body2" color="text.disabled">—</Typography>
                );
              },
            },
          ]}
          actions={[
            {
              icon: <ContentCopyRoundedIcon fontSize="small" />,
              color: "secondary",
              onClick: openClone,
              tooltip: "Clonar para nova edição",
            },
            {
              icon: "edit",
              color: "primary",
              onClick: (r) => navigate(`/awards/edit-awards/${r.id}`),
              tooltip: "Editar",
            },
            { icon: "delete", color: "warning", onClick: (r) => setConfirmDelete(r), tooltip: "Excluir" },
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
              placeholder="Buscar por nome ou ano…"
            />
          }
          sort={{ orderBy: sort.orderBy, order: sort.order, onChange: sort.set }}
          loading={loading}
          emptyMessage={loading ? "Carregando…" : "Nenhum prêmio cadastrado"}
          emptyHint={loading ? undefined : "Clique em 'Nova edição' para começar."}
        />
      </SectionCard>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Excluir prêmio?"
        message={
          <span>
            Você está prestes a excluir <strong>{confirmDelete?.name}</strong>. Esta ação
            não pode ser desfeita e pode afetar votos vinculados.
          </span>
        }
        confirmLabel="Excluir"
        destructive
        onConfirm={onDeleteConfirmed}
        onClose={() => setConfirmDelete(null)}
      />

      <Dialog open={Boolean(cloning)} onClose={() => setCloning(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Clonar edição</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Cria uma nova edição reusando a estrutura de <strong>{cloning?.name}</strong>. Os votos
              <strong> não </strong> são copiados.
            </Typography>
            <TextField
              label="Nome da nova edição"
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Ano"
              type="number"
              value={cloneYear}
              onChange={(e) => setCloneYear(e.target.value)}
              fullWidth
              size="small"
            />
            <Stack>
              <Typography variant="overline" color="text.disabled">
                Copiar
              </Typography>
              <FormControlLabel
                control={
                  <Switch checked={copyCategories} onChange={(e) => setCopyCategories(e.target.checked)} />
                }
                label="Categorias"
              />
              <FormControlLabel
                control={
                  <Switch checked={copyVoters} onChange={(e) => setCopyVoters(e.target.checked)} />
                }
                label="Participantes (votantes)"
              />
              <FormControlLabel
                control={
                  <Switch checked={copyGames} onChange={(e) => setCopyGames(e.target.checked)} />
                }
                label="Jogos indicados"
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCloning(null)} disabled={savingClone}>
            Cancelar
          </Button>
          <Button
            onClick={submitClone}
            variant="contained"
            color="secondary"
            disabled={savingClone || !cloneName.trim() || !cloneYear.trim()}
            startIcon={<ContentCopyRoundedIcon />}
          >
            {savingClone ? "Clonando…" : "Clonar edição"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};
