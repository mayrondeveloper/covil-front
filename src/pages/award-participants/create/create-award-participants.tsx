import { useState, useCallback, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Avatar, Link as MuiLink, Stack, Typography } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import {
  create,
  fetchPage,
  remove,
} from "../../../services/participants-service/participants-service";
import {
  addVoters,
  fetch as fetchAllAwards,
} from "../../../services/awards-service/awards-service";
import PageLayout from "../../../components/Layout/PageLayout";
import PageHeader from "../../../components/Layout/PageHeader";
import SectionCard from "../../../components/Layout/SectionCard";
import { ControlledTextField } from "../../../components/Form/Field/ControlledTextField";
import { FormRow, FormCol } from "../../../components/Form/Field/FormRow";
import { FormActions } from "../../../components/Form/Field/FormActions";
import { useNotification } from "../../../hooks/use-notification";
import { GenericTable } from "../../../components/Table/GenericTable";
import SearchField from "../../../components/Form/Field/SearchField";
import Asynchronous from "../../../components/Form/Input/asynchronous/asynchronous";
import ImageUpload from "../../../components/Form/Field/ImageUpload";
import { useTableUrlState } from "../../../hooks/use-table-url-state";
import { useUndoable } from "../../../hooks/use-undoable";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { bgColorForName, textColorForName } from "../../../utils/avatar-color";

const URL_REGEX = /^https?:\/\/.+/i;

interface ParticipantForm {
  name: string;
  description: string;
  image: string;
  instagram: string;
  site: string;
  url: string;
  awards: any[];
  [k: string]: unknown;
}

const defaultValues: ParticipantForm = {
  name: "",
  description: "",
  image: "",
  instagram: "",
  site: "",
  url: "",
  awards: [],
};

export const CreateAwardParticipants = () => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);

  const [awards, setAwards] = useState<any[]>([]);
  const [selectedAwards, setSelectedAwards] = useState<any[]>([]);

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

  const { success, error, info } = useNotification();
  const undoable = useUndoable();

  const { handleSubmit, control, reset } = useForm<ParticipantForm>({ defaultValues });

  const fetchParticipants = useCallback(() => {
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
    fetchParticipants();
  }, [fetchParticipants]);

  useEffect(() => {
    fetchAllAwards().then((r: any) => setAwards(r.data));
  }, []);

  const sendParticipant = async (values: ParticipantForm) => {
    setSaving(true);
    try {
      const created = await create({
        name: values.name,
        description: values.description,
        image: values.image,
        instagram: values.instagram,
        site: values.site,
        url: values.url,
      } as any);
      const newId = (created.data as any)?.id;

      const linkTargets = selectedAwards ?? [];
      if (newId && linkTargets.length > 0) {
        const results = await Promise.allSettled(
          linkTargets.map((a: any) => addVoters(a.id, [newId]))
        );
        const failed = results.filter((r) => r.status === "rejected").length;
        if (failed === 0) {
          success(
            `Participante cadastrado e vinculado a ${linkTargets.length} ${
              linkTargets.length === 1 ? "prêmio" : "prêmios"
            }.`
          );
        } else {
          info(
            `Participante cadastrado, mas ${failed} de ${linkTargets.length} vínculos falharam. Tente vincular manualmente na edição do prêmio.`
          );
        }
      } else {
        success("Participante cadastrado com sucesso!");
      }

      reset(defaultValues);
      setSelectedAwards([]);
      if (page !== 1) setPage(1);
      else fetchParticipants();
    } catch {
      error("Não foi possível cadastrar o participante.");
    } finally {
      setSaving(false);
    }
  };

  const onDeleteConfirmed = () => {
    if (!confirmDelete) return;
    const row = confirmDelete;
    setConfirmDelete(null);
    const previous = data;
    setData((prev) => prev.filter((p) => p.id !== row.id));
    undoable.run({
      message: `Participante "${row.name}" removido.`,
      onCommit: async () => {
        try {
          await remove(row.id);
          if (data.length === 1 && page > 1) setPage(page - 1);
          else fetchParticipants();
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
        title="Participantes"
        subtitle="Indicados das edições do prêmio. Você pode já vincular o participante a uma ou mais edições no momento do cadastro."
        crumbs={[{ label: "Início", to: "/" }, { label: "Premiação", to: "/awards" }, { label: "Participantes" }]}
      />

      <SectionCard
        title="Novo participante"
        description="Preencha pelo menos o nome. Vínculos com prêmios são opcionais."
      >
        <form onSubmit={handleSubmit(sendParticipant)} noValidate>
          <FormRow>
            <FormCol md={6}>
              <ControlledTextField
                control={control}
                name="name"
                label="Nome"
                required
                rules={{ required: true, minLength: { value: 2, message: "Nome muito curto" } }}
                placeholder="Ex.: Tábula Quadrada"
              />
            </FormCol>
            <FormCol md={6}>
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value as string}
                    onChange={field.onChange}
                    folder="participants"
                    label="Foto do participante"
                    helperText="Opcional. Máx 5MB."
                    deleteOnRemove
                  />
                )}
              />
            </FormCol>

            <FormCol md={12}>
              <ControlledTextField
                control={control}
                name="description"
                label="Descrição"
                multiline
                minRows={2}
                placeholder="Breve descrição do canal/criador (opcional)."
              />
            </FormCol>

            <FormCol md={4}>
              <ControlledTextField
                control={control}
                name="instagram"
                label="Instagram"
                placeholder="@usuario"
                helperText="Username sem URL."
              />
            </FormCol>
            <FormCol md={4}>
              <ControlledTextField
                control={control}
                name="site"
                label="Site"
                placeholder="https://site.com"
                rules={{
                  pattern: { value: URL_REGEX, message: "Use uma URL começando com http(s)://" },
                }}
              />
            </FormCol>
            <FormCol md={4}>
              <ControlledTextField
                control={control}
                name="url"
                label="URL do canal"
                placeholder="https://youtube.com/@…"
                rules={{
                  pattern: { value: URL_REGEX, message: "Use uma URL começando com http(s)://" },
                }}
              />
            </FormCol>

            <FormCol md={12}>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
                <EmojiEventsRoundedIcon fontSize="small" sx={{ color: "secondary.main" }} />
                <Typography variant="overline" color="text.disabled">
                  Vincular a prêmios (opcional)
                </Typography>
              </Stack>
              <Asynchronous
                multiple
                control={control}
                data={awards}
                setData={setSelectedAwards}
                name="awards"
                label="Edições do prêmio"
                helperText="Após salvar, o participante será adicionado à lista de votantes destas edições."
              />
            </FormCol>
          </FormRow>

          <FormActions
            submitLabel={
              selectedAwards.length > 0
                ? `Cadastrar e vincular a ${selectedAwards.length} ${
                    selectedAwards.length === 1 ? "prêmio" : "prêmios"
                  }`
                : "Cadastrar participante"
            }
            saving={saving}
          />
        </form>
      </SectionCard>

      <SectionCard
        title="Participantes cadastrados"
        description={loading ? "Carregando…" : `${total} no total.`}
      >
        <GenericTable<any>
          data={data}
          rowKey={(r) => r.id}
          dense
          columns={[
            {
              header: "Participante",
              width: "40%",
              sortField: "name",
              render: (r) => (
                <Stack direction="row" alignItems="center" gap={1.5}>
                  {r.image ? (
                    <Avatar src={r.image} sx={{ width: 36, height: 36 }} />
                  ) : (
                    <Avatar sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 700, bgcolor: bgColorForName(r.name ?? ""), color: textColorForName(r.name ?? "") }}>
                      {(r.name?.[0] ?? "?").toUpperCase()}
                    </Avatar>
                  )}
                  <Typography sx={{ fontWeight: 600 }}>{r.name}</Typography>
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
              header: "Links",
              align: "right",
              hideOnMobile: true,
              width: 140,
              render: (r) => (
                <Stack direction="row" gap={1} justifyContent="flex-end">
                  {r.instagram && (
                    <MuiLink href={`https://instagram.com/${r.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener" color="inherit">
                      <InstagramIcon fontSize="small" />
                    </MuiLink>
                  )}
                  {r.site && (
                    <MuiLink href={r.site} target="_blank" rel="noopener" color="inherit">
                      <LanguageRoundedIcon fontSize="small" />
                    </MuiLink>
                  )}
                  {r.url && (
                    <MuiLink href={r.url} target="_blank" rel="noopener" color="inherit">
                      <LinkRoundedIcon fontSize="small" />
                    </MuiLink>
                  )}
                </Stack>
              ),
            },
          ]}
          actions={[
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
              placeholder="Buscar participante…"
            />
          }
          sort={{ orderBy: sort.orderBy, order: sort.order, onChange: sort.set }}
          loading={loading}
          emptyMessage={loading ? "Carregando…" : "Nenhum participante cadastrado"}
        />
      </SectionCard>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Excluir participante?"
        message={
          <span>
            Você está prestes a excluir <strong>{confirmDelete?.name}</strong>. Pode afetar
            votos vinculados a esse participante.
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
