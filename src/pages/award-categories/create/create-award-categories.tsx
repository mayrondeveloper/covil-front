import { useState, useCallback, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Autocomplete,
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import {
  bulkCreate,
  create,
  fetchPage,
  remove,
  update,
} from "../../../services/awards-categories-service/awards-categories-service";
import PageLayout from "../../../components/Layout/PageLayout";
import { GenericTable } from "../../../components/Table/GenericTable";
import SearchField from "../../../components/Form/Field/SearchField";
import { useTableUrlState } from "../../../hooks/use-table-url-state";
import { useUndoable } from "../../../hooks/use-undoable";
import ConfirmDialog from "../../../components/ConfirmDialog";
import PageHeader from "../../../components/Layout/PageHeader";
import SectionCard from "../../../components/Layout/SectionCard";
import { ControlledTextField } from "../../../components/Form/Field/ControlledTextField";
import { FormRow, FormCol } from "../../../components/Form/Field/FormRow";
import { FormActions } from "../../../components/Form/Field/FormActions";
import { useNotification } from "../../../hooks/use-notification";
import Asynchronous from "../../../components/Form/Input/asynchronous/asynchronous";
import ImageUpload from "../../../components/Form/Field/ImageUpload";
import { useAwards } from "../../../hooks/queries";

const parseBulkLines = (raw: string): { name: string; description: string }[] =>
  raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf("|");
      if (idx === -1) return { name: line, description: "" };
      return {
        name: line.slice(0, idx).trim(),
        description: line.slice(idx + 1).trim(),
      };
    })
    .filter((item) => item.name.length > 0);

type AwardOption = { id: string; name: string } | null;

interface CategoryForm {
  name: string;
  description: string;
  background_image: string;
  award: AwardOption;
  [k: string]: unknown;
}

const defaultValues: CategoryForm = {
  name: "",
  description: "",
  background_image: "",
  award: null,
};

export const CreateAwardCategories = () => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const { success, error } = useNotification();
  const undoable = useUndoable();
  const url = useTableUrlState({
    defaultRowsPerPage: 10,
    defaultOrderBy: "name",
    defaultOrder: "asc",
  });
  const { page, rowsPerPage, q } = url;
  const setPage = url.setPage;
  const setRowsPerPage = url.setRowsPerPage;
  const setQ = url.setQ;
  const sort = { orderBy: url.orderBy, order: url.order, set: url.setSort };

  const { handleSubmit, control, reset, resetField } = useForm<CategoryForm>({ defaultValues });
  const { data: awards = [] } = useAwards();

  const [bulkText, setBulkText] = useState("");
  const [bulkAward, setBulkAward] = useState<AwardOption>(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const parsedBulk = useMemo(() => parseBulkLines(bulkText), [bulkText]);

  const fetchAll = useCallback(() => {
    setLoading(true);
    fetchPage({
      page,
      limit: rowsPerPage,
      q: q || undefined,
      orderBy: sort.orderBy,
      order: sort.order,
    })
      .then((r) => {
        setData(r.data.data);
        setTotal(r.data.total);
      })
      .finally(() => setLoading(false));
  }, [page, rowsPerPage, q, sort.orderBy, sort.order]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const cancelEdit = () => {
    setEditingId(null);
    reset(defaultValues);
  };

  const onEdit = (row: any) => {
    setEditingId(row.id);
    reset({
      name: row.name ?? "",
      description: row.description ?? "",
      background_image: row.background_image ?? "",
      award: null,
    });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const sendCategory = (values: CategoryForm) => {
    setSaving(true);

    if (editingId) {
      update(editingId, {
        name: values.name,
        description: values.description,
        background_image: values.background_image || null,
      })
        .then(() => {
          success("Categoria atualizada.");
          cancelEdit();
          fetchAll();
        })
        .catch(() => error("Não foi possível atualizar a categoria."))
        .finally(() => setSaving(false));
      return;
    }

    const payload = {
      name: values.name,
      description: values.description,
      background_image: values.background_image || null,
      award_id: values.award?.id,
    };
    create(payload)
      .then(() => {
        success(
          values.award
            ? `Categoria cadastrada e vinculada a "${values.award.name}".`
            : "Categoria cadastrada com sucesso!"
        );
        reset(defaultValues);
        if (page !== 1) setPage(1);
        else fetchAll();
      })
      .catch(() => error("Não foi possível cadastrar a categoria."))
      .finally(() => setSaving(false));
  };

  const submitBulk = () => {
    if (parsedBulk.length === 0 || bulkSaving) return;
    setBulkSaving(true);
    bulkCreate({
      categories: parsedBulk,
      award_id: bulkAward?.id,
    })
      .then((r) => {
        const created = r.data.created.length;
        const skipped = r.data.skipped.length;
        if (created > 0 && skipped === 0) {
          success(
            bulkAward
              ? `${created} categoria(s) cadastrada(s) e vinculada(s) a "${bulkAward.name}".`
              : `${created} categoria(s) cadastrada(s).`
          );
        } else if (created > 0 && skipped > 0) {
          success(
            `Criadas ${created} · ${skipped} já existia(m) e foram ignorada(s).`
          );
        } else if (skipped > 0) {
          error(
            `Nada cadastrado: ${skipped} categoria(s) já existia(m) no sistema com esse(s) nome(s).`
          );
        } else {
          error("Nada para cadastrar. Verifique o conteúdo digitado.");
        }
        setBulkText("");
        setBulkAward(null);
        if (page !== 1) setPage(1);
        else fetchAll();
      })
      .catch(() => {
        // erro já é exibido pelo interceptor global do axios
      })
      .finally(() => setBulkSaving(false));
  };

  const onDeleteConfirmed = () => {
    if (!confirmDelete) return;
    const row = confirmDelete;
    setConfirmDelete(null);
    if (editingId === row.id) cancelEdit();
    const previous = data;
    setData((prev) => prev.filter((c) => c.id !== row.id));
    undoable.run({
      message: `Categoria "${row.name}" removida.`,
      onCommit: async () => {
        try {
          await remove(row.id);
          if (data.length === 1 && page > 1) setPage(page - 1);
          else fetchAll();
        } catch {
          setData(previous);
          error("Não foi possível remover.");
        }
      },
      onUndo: () => setData(previous),
    });
  };

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Premiação"
        title="Categorias do prêmio"
        subtitle="Cadastre as categorias usadas pelas edições do Dragão de Ouro."
        crumbs={[{ label: "Início", to: "/" }, { label: "Premiação", to: "/awards" }, { label: "Categorias" }]}
      />

      <SectionCard
        title={editingId ? "Editar categoria" : "Nova categoria"}
        description={
          editingId
            ? "Altere os dados da categoria e clique em salvar."
            : undefined
        }
      >
        <form onSubmit={handleSubmit(sendCategory)} noValidate>
          <FormRow>
            <FormCol md={4}>
              <ControlledTextField
                control={control}
                name="name"
                label="Nome"
                required
                rules={{ required: true, minLength: { value: 2, message: "Nome muito curto" } }}
                placeholder="Ex.: Melhor jogo do ano"
              />
            </FormCol>
            <FormCol md={8}>
              <ControlledTextField
                control={control}
                name="description"
                label="Descrição"
                rules={{ required: true }}
                placeholder="Texto curto explicando a categoria"
              />
            </FormCol>
            <FormCol md={12}>
              <Controller
                name="background_image"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={(field.value as string) ?? ""}
                    onChange={field.onChange}
                    folder="award-categories"
                    label="Imagem de fundo do pódio"
                    helperText="Opcional. Imagem exibida atrás do pódio na página de vencedores. Máx 5MB."
                    height={180}
                    deleteOnRemove
                  />
                )}
              />
            </FormCol>
            {!editingId && (
              <FormCol md={6}>
                <Asynchronous
                  control={control}
                  data={awards}
                  resetField={resetField}
                  multiple={false}
                  name="award"
                  label="Vincular ao prêmio (opcional)"
                  helperText="Se selecionado, a categoria já fica associada à edição escolhida."
                  defaultValue={null}
                />
              </FormCol>
            )}
          </FormRow>
          <FormActions
            submitLabel={editingId ? "Salvar alterações" : "Cadastrar categoria"}
            saving={saving}
            onCancel={editingId ? cancelEdit : undefined}
            cancelLabel="Cancelar edição"
          />
        </form>
      </SectionCard>

      <SectionCard
        title="Cadastro em massa"
        description="Cole várias categorias de uma vez — uma por linha. Use o formato “Nome | Descrição” se quiser incluir descrição (a descrição é opcional)."
      >
        <FormRow>
          <FormCol md={12}>
            <TextField
              multiline
              minRows={6}
              fullWidth
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={
                "Melhor jogo do ano | O grande vencedor da edição\n" +
                "Melhor arte | Direção visual e ilustrações\n" +
                "Melhor designer\n" +
                "Melhor jogo nacional"
              }
              helperText={
                parsedBulk.length > 0
                  ? `${parsedBulk.length} categoria(s) detectada(s).`
                  : "Cole ou digite as categorias acima."
              }
            />
          </FormCol>
          <FormCol md={6}>
            <Autocomplete
              options={awards as AwardOption[]}
              value={bulkAward}
              onChange={(_, v) => setBulkAward(v)}
              getOptionLabel={(o) => (o ? o.name : "")}
              isOptionEqualToValue={(o, v) =>
                Boolean(o && v && o.id === v.id)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Vincular ao prêmio (opcional)"
                  helperText="Se selecionado, todas as categorias do lote serão vinculadas a esse prêmio."
                />
              )}
            />
          </FormCol>
        </FormRow>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            variant="contained"
            onClick={submitBulk}
            disabled={parsedBulk.length === 0 || bulkSaving}
            startIcon={<PlaylistAddRoundedIcon />}
          >
            {bulkSaving
              ? "Cadastrando…"
              : parsedBulk.length > 0
              ? `Cadastrar ${parsedBulk.length} categoria(s)`
              : "Cadastrar em massa"}
          </Button>
        </Box>
      </SectionCard>

      <SectionCard
        title="Categorias cadastradas"
        description={loading ? "Carregando…" : `${total} no total.`}
      >
        <GenericTable<any>
          data={data}
          rowKey={(r) => r.id}
          dense
          columns={[
            {
              header: "Nome",
              width: "40%",
              sortField: "name",
              render: (r) => <Typography sx={{ fontWeight: 600 }}>{r.name}</Typography>,
            },
            {
              header: "Descrição",
              hideOnMobile: true,
              render: (r) => (
                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 480 }}>
                  {r.description || "—"}
                </Typography>
              ),
            },
          ]}
          actions={[
            {
              icon: "edit",
              color: "primary",
              onClick: (r) => onEdit(r),
              tooltip: "Editar",
            },
            {
              icon: "delete",
              color: "warning",
              onClick: (r) => setConfirmDelete(r),
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
              placeholder="Buscar categoria…"
            />
          }
          sort={{ orderBy: sort.orderBy, order: sort.order, onChange: sort.set }}
          loading={loading}
          emptyMessage={loading ? "Carregando…" : "Nenhuma categoria cadastrada"}
        />
      </SectionCard>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Excluir categoria?"
        message={
          <span>
            Você está prestes a excluir <strong>{confirmDelete?.name}</strong>. Pode afetar
            votos vinculados a essa categoria.
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
