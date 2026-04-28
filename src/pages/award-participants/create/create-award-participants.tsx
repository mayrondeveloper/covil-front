import { useState, useCallback, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import {
  bulkCreate,
  create,
  fetchPage,
  remove,
  update,
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

type AwardOption = { id: string; name: string };

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentAwardIds, setCurrentAwardIds] = useState<string[]>([]);
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

  const [bulkText, setBulkText] = useState("");
  const [bulkAwards, setBulkAwards] = useState<AwardOption[]>([]);
  const [bulkSaving, setBulkSaving] = useState(false);
  const parsedBulk = useMemo(() => parseBulkLines(bulkText), [bulkText]);

  const linkedAwards = useMemo(() => {
    if (!editingId || currentAwardIds.length === 0) return [];
    const set = new Set(currentAwardIds);
    return (awards as any[]).filter((a: any) => set.has(a.id));
  }, [awards, currentAwardIds, editingId]);

  const addableAwards = useMemo(() => {
    if (!editingId) return awards;
    const set = new Set(currentAwardIds);
    return (awards as any[]).filter((a: any) => !set.has(a.id));
  }, [awards, currentAwardIds, editingId]);

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

  const cancelEdit = () => {
    setEditingId(null);
    reset(defaultValues);
    setSelectedAwards([]);
    setCurrentAwardIds([]);
  };

  const onEdit = (row: any) => {
    setEditingId(row.id);
    reset({
      name: row.name ?? "",
      description: row.description ?? "",
      image: row.image ?? "",
      instagram: row.instagram ?? "",
      site: row.site ?? "",
      url: row.url ?? "",
      awards: [],
    });
    setSelectedAwards([]);
    setCurrentAwardIds(
      Array.isArray(row?.awards)
        ? row.awards
            .map((a: any) => a?.id_award)
            .filter((id: any): id is string => typeof id === "string")
        : []
    );
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const sendParticipant = async (values: ParticipantForm) => {
    setSaving(true);
    try {
      const payload = {
        name: values.name,
        description: values.description,
        image: values.image,
        instagram: values.instagram,
        site: values.site,
        url: values.url,
      };

      if (editingId) {
        await update(editingId, payload as any);

        const linkTargets = selectedAwards ?? [];
        if (linkTargets.length > 0) {
          const results = await Promise.allSettled(
            linkTargets.map((a: any) => addVoters(a.id, [editingId]))
          );
          const failed = results.filter((r) => r.status === "rejected").length;
          if (failed === 0) {
            success(
              `Participante atualizado e vinculado a ${linkTargets.length} ${
                linkTargets.length === 1 ? "prêmio" : "prêmios"
              }.`
            );
          } else {
            info(
              `Participante atualizado, mas ${failed} de ${linkTargets.length} vínculos falharam. Tente vincular manualmente na edição do prêmio.`
            );
          }
        } else {
          success("Participante atualizado.");
        }

        cancelEdit();
        fetchParticipants();
        return;
      }

      const created = await create(payload as any);
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
      error(
        editingId
          ? "Não foi possível atualizar o participante."
          : "Não foi possível cadastrar o participante."
      );
    } finally {
      setSaving(false);
    }
  };

  const submitBulk = () => {
    if (parsedBulk.length === 0 || bulkSaving) return;
    setBulkSaving(true);
    bulkCreate({
      participants: parsedBulk,
      award_ids: bulkAwards.map((a) => a.id),
    })
      .then((r) => {
        const created = r.data.created.length;
        const skipped = r.data.skipped.length;
        const linkSuffix =
          bulkAwards.length > 0
            ? ` e vinculado(s) a ${bulkAwards.length} ${
                bulkAwards.length === 1 ? "prêmio" : "prêmios"
              }`
            : "";
        if (created > 0 && skipped === 0) {
          success(`${created} participante(s) cadastrado(s)${linkSuffix}.`);
        } else if (created > 0 && skipped > 0) {
          success(
            `Criados ${created} · ${skipped} já existia(m)${linkSuffix}.`
          );
        } else if (skipped > 0) {
          error(
            `Nada cadastrado: ${skipped} participante(s) já existia(m) no sistema com esse(s) nome(s).`
          );
        } else {
          error("Nada para cadastrar. Verifique o conteúdo digitado.");
        }
        setBulkText("");
        setBulkAwards([]);
        if (page !== 1) setPage(1);
        else fetchParticipants();
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
        title={editingId ? "Editar participante" : "Novo participante"}
        description={
          editingId
            ? "Altere os dados do participante e clique em salvar."
            : "Preencha pelo menos o nome. Vínculos com prêmios são opcionais."
        }
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
                  {editingId ? "Vínculos a prêmios" : "Vincular a prêmios (opcional)"}
                </Typography>
              </Stack>
              {editingId && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75 }}>
                    {linkedAwards.length > 0
                      ? `Já vinculado a ${linkedAwards.length} ${
                          linkedAwards.length === 1 ? "prêmio" : "prêmios"
                        }:`
                      : "Ainda não está vinculado a nenhum prêmio."}
                  </Typography>
                  {linkedAwards.length > 0 && (
                    <Stack direction="row" gap={0.75} flexWrap="wrap">
                      {linkedAwards.map((a: any) => (
                        <Chip
                          key={a.id}
                          icon={<EmojiEventsRoundedIcon />}
                          label={a.year ? `${a.name} (${a.year})` : a.name}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  )}
                </Box>
              )}
              <Asynchronous
                multiple
                control={control}
                data={addableAwards}
                setData={setSelectedAwards}
                name="awards"
                label={editingId ? "Adicionar a outros prêmios" : "Edições do prêmio"}
                helperText={
                  editingId
                    ? addableAwards.length > 0
                      ? "Selecione novos prêmios para adicionar. Vínculos existentes não são removidos por aqui."
                      : "Já está vinculado a todos os prêmios disponíveis."
                    : "Após salvar, o participante será adicionado à lista de votantes destas edições."
                }
              />
            </FormCol>
          </FormRow>

          <FormActions
            submitLabel={
              editingId
                ? selectedAwards.length > 0
                  ? `Salvar e vincular a ${selectedAwards.length} ${
                      selectedAwards.length === 1 ? "prêmio" : "prêmios"
                    }`
                  : "Salvar alterações"
                : selectedAwards.length > 0
                ? `Cadastrar e vincular a ${selectedAwards.length} ${
                    selectedAwards.length === 1 ? "prêmio" : "prêmios"
                  }`
                : "Cadastrar participante"
            }
            saving={saving}
            onCancel={editingId ? cancelEdit : undefined}
            cancelLabel="Cancelar edição"
          />
        </form>
      </SectionCard>

      <SectionCard
        title="Cadastro em massa"
        description="Cole vários participantes de uma vez — um por linha. Use o formato “Nome | Descrição” se quiser incluir descrição (a descrição é opcional)."
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
                "Tábula Quadrada | Canal sobre estratégia\n" +
                "Ludopedia\n" +
                "Boardgame Brasil | Comunidade brasileira de boardgames"
              }
              helperText={
                parsedBulk.length > 0
                  ? `${parsedBulk.length} participante(s) detectado(s).`
                  : "Cole ou digite os participantes acima."
              }
            />
          </FormCol>
          <FormCol md={12}>
            <Autocomplete
              multiple
              options={awards as AwardOption[]}
              value={bulkAwards}
              onChange={(_, v) => setBulkAwards(v as AwardOption[])}
              getOptionLabel={(o) => o.name}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Vincular a prêmios (opcional)"
                  helperText="Todos os participantes do lote (novos e pré-existentes) serão adicionados como votantes desses prêmios."
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
              ? `Cadastrar ${parsedBulk.length} participante(s)`
              : "Cadastrar em massa"}
          </Button>
        </Box>
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
            { icon: "edit", color: "primary", onClick: (r) => onEdit(r), tooltip: "Editar" },
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
