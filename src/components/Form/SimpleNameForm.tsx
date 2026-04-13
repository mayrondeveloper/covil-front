import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Avatar, Typography } from "@mui/material";
import { bgColorForName, textColorForName } from "../../utils/avatar-color";
import { AxiosResponse } from "axios";
import { Id, NamedEntity, PageParams, Paginated } from "../../services/types";
import { useNotification } from "../../hooks/use-notification";
import PageLayout from "../Layout/PageLayout";
import PageHeader from "../Layout/PageHeader";
import SectionCard from "../Layout/SectionCard";
import ControlledTextField from "./Field/ControlledTextField";
import FormActions from "./Field/FormActions";
import { GenericTable } from "../Table/GenericTable";
import SearchField from "./Field/SearchField";
import { useTableUrlState } from "../../hooks/use-table-url-state";
import { useUndoable } from "../../hooks/use-undoable";
import ConfirmDialog from "../ConfirmDialog";

export interface SimpleNameService {
  fetchPage: (params?: PageParams) => Promise<AxiosResponse<Paginated<NamedEntity>>>;
  create: (data: Partial<NamedEntity>) => Promise<AxiosResponse<NamedEntity>>;
  update?: (id: Id, data: Partial<NamedEntity>) => Promise<AxiosResponse<NamedEntity>>;
  remove?: (id: Id) => Promise<AxiosResponse<void>>;
}

interface SimpleNameFormProps {
  title: string;
  entityName: string;
  service: SimpleNameService;
  subtitle?: string;
  parentCrumb?: { label: string; to: string };
}

interface FormValues {
  name: string;
}

export const SimpleNameForm = ({
  title,
  entityName,
  service,
  subtitle,
  parentCrumb,
}: SimpleNameFormProps) => {
  const { success, error } = useNotification();
  const undoable = useUndoable();
  const [items, setItems] = useState<NamedEntity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<Id | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<NamedEntity | null>(null);
  const url = useTableUrlState({
    defaultRowsPerPage: 10,
    defaultOrderBy: "name",
    defaultOrder: "asc",
    prefix: entityName.toLowerCase(),
  });
  const { page, rowsPerPage, q } = url;
  const setPage = url.setPage;
  const setRowsPerPage = url.setRowsPerPage;
  const setQ = url.setQ;
  const sort = { orderBy: url.orderBy, order: url.order, set: url.setSort };

  const { handleSubmit, control, reset } = useForm<FormValues>({
    defaultValues: { name: "" },
  });

  const fetchAll = useCallback(() => {
    setLoading(true);
    service
      .fetchPage({
        page,
        limit: rowsPerPage,
        q: q || undefined,
        orderBy: sort.orderBy,
        order: sort.order,
      })
      .then((r) => {
        setItems(r.data.data);
        setTotal(r.data.total);
      })
      .finally(() => setLoading(false));
  }, [service, page, rowsPerPage, q, sort.orderBy, sort.order]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const cancelEdit = () => {
    setEditingId(null);
    reset({ name: "" });
  };

  const onSubmit = (values: FormValues) => {
    setSaving(true);
    const op =
      editingId != null && service.update
        ? service.update(editingId, values)
        : service.create(values);
    op.then(() => {
      success(
        editingId != null
          ? `${entityName} atualizado(a)!`
          : `${entityName} cadastrado(a)!`
      );
      reset({ name: "" });
      setEditingId(null);
      // em create, volta para a primeira página pra mostrar o novo item
      if (editingId == null && page !== 1) setPage(1);
      else fetchAll();
    })
      .catch(() => error(`Não foi possível salvar o(a) ${entityName.toLowerCase()}.`))
      .finally(() => setSaving(false));
  };

  const onEdit = (row: NamedEntity) => {
    if (!service.update) return;
    setEditingId(row.id);
    reset({ name: row.name ?? "" });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onDeleteConfirmed = () => {
    if (!confirmDelete || !service.remove) return;
    const row = confirmDelete;
    setConfirmDelete(null);
    if (editingId === row.id) cancelEdit();
    const previous = items;
    setItems((prev) => prev.filter((i) => i.id !== row.id));
    undoable.run({
      message: `${entityName} "${row.name}" removido(a).`,
      onCommit: async () => {
        try {
          await service.remove!(row.id);
          if (items.length === 1 && page > 1) setPage(page - 1);
          else fetchAll();
        } catch {
          setItems(previous);
          error(`Não foi possível remover o(a) ${entityName.toLowerCase()}.`);
        }
      },
      onUndo: () => setItems(previous),
    });
  };

  const isEditing = editingId != null;

  return (
    <PageLayout maxWidth={960}>
      <PageHeader
        eyebrow={parentCrumb?.label ?? "Cadastro"}
        title={title}
        subtitle={
          subtitle ??
          `Adicione, edite e remova ${entityName.toLowerCase()}s. Os nomes ficam disponíveis nos formulários de jogo.`
        }
        crumbs={
          parentCrumb
            ? [{ label: "Início", to: "/" }, { label: parentCrumb.label, to: parentCrumb.to }, { label: title }]
            : [{ label: "Início", to: "/" }, { label: title }]
        }
      />

      <SectionCard
        title={isEditing ? `Editar ${entityName.toLowerCase()}` : `Novo(a) ${entityName.toLowerCase()}`}
        description={isEditing ? "Altere o nome e clique em salvar." : "Apenas o nome é necessário."}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <ControlledTextField
            control={control}
            name="name"
            label="Nome"
            required
            rules={{ required: true, minLength: { value: 2, message: "Nome muito curto" } }}
            placeholder={`Ex.: nome do ${entityName.toLowerCase()}`}
          />
          <FormActions
            submitLabel={isEditing ? "Salvar alterações" : "Cadastrar"}
            saving={saving}
            onCancel={isEditing ? cancelEdit : undefined}
            cancelLabel="Cancelar edição"
          />
        </form>
      </SectionCard>

      <SectionCard
        title={`${entityName}s cadastrados(as)`}
        description={
          loading ? "Carregando…" : `${total} ${total === 1 ? "registro" : "registros"} no total.`
        }
      >
        <GenericTable<NamedEntity>
          data={items}
          rowKey={(r) => r.id}
          dense
          loading={loading}
          columns={[
            {
              header: "",
              width: 48,
              render: (r) => (
                <Avatar
                  sx={{
                    width: 30,
                    height: 30,
                    fontSize: 13,
                    fontWeight: 700,
                    bgcolor: bgColorForName(r.name ?? ""),
                    color: textColorForName(r.name ?? ""),
                  }}
                >
                  {(r.name?.[0] ?? "?").toUpperCase()}
                </Avatar>
              ),
            },
            {
              header: "Nome",
              sortField: "name",
              render: (r) => <Typography sx={{ fontWeight: 500 }}>{r.name}</Typography>,
            },
          ]}
          actions={[
            ...(service.update
              ? [{ icon: "edit" as const, color: "primary" as const, onClick: onEdit, tooltip: "Editar" }]
              : []),
            ...(service.remove
              ? [
                  {
                    icon: "delete" as const,
                    color: "warning" as const,
                    onClick: (row: NamedEntity) => setConfirmDelete(row),
                    tooltip: "Excluir",
                  },
                ]
              : []),
          ]}
          emptyMessage={loading ? "Carregando…" : `Nenhum(a) ${entityName.toLowerCase()} cadastrado(a) ainda`}
          emptyHint={loading ? undefined : "Use o formulário acima para adicionar o primeiro."}
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
              placeholder={`Buscar ${entityName.toLowerCase()}…`}
            />
          }
          sort={{ orderBy: sort.orderBy, order: sort.order, onChange: sort.set }}
        />
      </SectionCard>

      <ConfirmDialog
        open={confirmDelete != null}
        title={`Excluir ${entityName.toLowerCase()}?`}
        message={
          <span>
            Você está prestes a excluir <strong>{confirmDelete?.name}</strong>. Pode afetar
            jogos vinculados a esse cadastro.
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
