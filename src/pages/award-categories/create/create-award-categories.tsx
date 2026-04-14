import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Typography } from "@mui/material";
import {
  create,
  fetchPage,
  remove,
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
import { useAwards } from "../../../hooks/queries";

type AwardOption = { id: string; name: string } | null;

interface CategoryForm {
  name: string;
  description: string;
  award: AwardOption;
  [k: string]: unknown;
}

const defaultValues: CategoryForm = { name: "", description: "", award: null };

export const CreateAwardCategories = () => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const sendCategory = (values: CategoryForm) => {
    setSaving(true);
    const payload = {
      name: values.name,
      description: values.description,
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

  const onDeleteConfirmed = () => {
    if (!confirmDelete) return;
    const row = confirmDelete;
    setConfirmDelete(null);
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

      <SectionCard title="Nova categoria">
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
          </FormRow>
          <FormActions submitLabel="Cadastrar categoria" saving={saving} />
        </form>
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
