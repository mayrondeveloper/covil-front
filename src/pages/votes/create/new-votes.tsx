import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Pagination,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import WorkspacesRoundedIcon from "@mui/icons-material/WorkspacesRounded";
import SportsEsportsRoundedIcon from "@mui/icons-material/SportsEsportsRounded";
import MilitaryTechRoundedIcon from "@mui/icons-material/MilitaryTechRounded";
import {
  create,
  fetchPage as fetchVotesPage,
} from "../../../services/votes/votes-service";
import { fetch as fetchAllAwards } from "../../../services/awards-service/awards-service";
import EnchancedTableVotes from "../../../components/Table/enchanced-table/enchanced-table-votes";
import PageLayout from "../../../components/Layout/PageLayout";
import PageHeader from "../../../components/Layout/PageHeader";
import SectionCard from "../../../components/Layout/SectionCard";
import { useNotification } from "../../../hooks/use-notification";
import SearchFieldComp from "../../../components/Form/Field/SearchField";
import {
  useScoringScheme,
  useVoterSlots,
  useCategoryVotes,
  useVoterProgress,
  useCategoryProgress,
} from "../../../hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import { useTableUrlState } from "../../../hooks/use-table-url-state";
import { matchesSearch } from "../../../utils/text";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const STEP_LABELS: { label: string; icon: JSX.Element }[] = [
  { label: "Prêmio", icon: <EmojiEventsRoundedIcon fontSize="small" /> },
  { label: "Votante", icon: <PersonRoundedIcon fontSize="small" /> },
  { label: "Categoria", icon: <WorkspacesRoundedIcon fontSize="small" /> },
  { label: "Jogo", icon: <SportsEsportsRoundedIcon fontSize="small" /> },
  { label: "Colocação", icon: <MilitaryTechRoundedIcon fontSize="small" /> },
  { label: "Confirmar", icon: <CheckRoundedIcon fontSize="small" /> },
];

const PLACE_STYLE: Record<string, { gradient: string; color: string }> = {
  "1": { gradient: "linear-gradient(135deg, #B45309 0%, #F59E0B 100%)", color: "#fff" },
  "2": { gradient: "linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)", color: "#0F172A" },
  "3": { gradient: "linear-gradient(135deg, #7C2D12 0%, #C2410C 100%)", color: "#fff" },
};
const styleFor = (v: string) =>
  PLACE_STYLE[v] ?? { gradient: "#E5E0D6", color: "#0F172A" };

interface OptionItem {
  id: string | number;
  name: string;
  image?: string;
  subtitle?: string;
}

const OptionCard = ({
  item,
  selected,
  onClick,
  icon,
  disabled,
  disabledReason,
  disabledChip = "indisponível",
}: {
  item: OptionItem;
  selected: boolean;
  onClick: () => void;
  icon?: JSX.Element;
  disabled?: boolean;
  disabledReason?: string;
  disabledChip?: string;
}) => (
  <Card
    onClick={disabled ? undefined : onClick}
    title={disabled ? disabledReason : undefined}
    sx={{
      p: 2,
      cursor: disabled ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      gap: 2,
      transition: "all 200ms ease",
      borderColor: selected ? "secondary.main" : "divider",
      borderWidth: selected ? 2 : 1,
      opacity: disabled ? 0.5 : 1,
      bgcolor: selected ? (t) => alpha(t.palette.secondary.main, 0.06) : "background.paper",
      "&:hover": disabled
        ? {}
        : {
            borderColor: "secondary.main",
            transform: "translateY(-1px)",
            boxShadow: "0 6px 16px rgba(15, 23, 42, 0.06)",
          },
    }}
  >
    {item.image ? (
      <Avatar src={item.image} variant="rounded" sx={{ width: 48, height: 48 }} />
    ) : (
      <Avatar
        variant="rounded"
        sx={{
          width: 48,
          height: 48,
          bgcolor: (t) => alpha(t.palette.secondary.main, 0.12),
          color: "secondary.main",
        }}
      >
        {icon ?? item.name?.[0]?.toUpperCase() ?? "?"}
      </Avatar>
    )}
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontWeight: 600, lineHeight: 1.3 }} noWrap>
        {item.name}
      </Typography>
      {item.subtitle && (
        <Typography variant="caption" color="text.secondary" noWrap>
          {item.subtitle}
        </Typography>
      )}
    </Box>
    {disabled && (
      <Chip size="small" label={disabledChip} sx={{ fontSize: 10, height: 20 }} />
    )}
    {selected && !disabled && (
      <Box sx={{ color: "secondary.main", display: "grid", placeItems: "center" }}>
        <CheckRoundedIcon />
      </Box>
    )}
  </Card>
);

export const NewVotes = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { success } = useNotification();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(0);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const [awards, setAwards] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [jogos, setJogos] = useState<any[]>([]);
  const [participantes, setParticipantes] = useState<any[]>([]);

  const [dadosGerais, setDadosGerais] = useState<any>({});
  const [dataForSend, setDataForSend] = useState({
    place: "",
    id_vote: "",
    id_category: "",
    id_game: "",
    id_award: "",
  });

  const { data: scheme } = useScoringScheme(dadosGerais.award?.id);
  const places = scheme?.places ?? [];

  const { data: voterSlots = [] } = useVoterSlots(
    dadosGerais.award?.id,
    dadosGerais.category?.id,
    dadosGerais.participant?.id
  );
  const usedPlaces = new Set(voterSlots.map((v: any) => String(v.place)));
  const usedGameIds = new Set(
    voterSlots.map((v: any) => v.id_game ?? v.game?.id)
  );

  // Agregações vindas do backend (groupBy) — evita trafegar todos os votos e
  // garante contagem completa mesmo quando o prêmio tem milhares de votos.
  const { data: voterProgress = [] } = useVoterProgress(dadosGerais.award?.id);
  const { data: categoryProgress = [] } = useCategoryProgress(
    dadosGerais.award?.id,
    dadosGerais.participant?.id
  );
  const { data: categoryVotes = [] } = useCategoryVotes(
    dadosGerais.award?.id,
    dadosGerais.category?.id
  );

  const totalPlaces = places.length || 3;
  const categoriesInAward = categories.length;
  const maxVotesPerVoter = categoriesInAward * totalPlaces;
  const voterTotalCount = new Map<string, number>(
    (voterProgress as any[]).map((r) => [r.id_vote as string, r.count as number])
  );
  const categoryUsedCount = new Map<string, number>(
    (categoryProgress as any[]).map((r) => [r.id_category as string, r.count as number])
  );

  const [data, setData] = useState<any[] | null>(null);
  const [total, setTotal] = useState(0);
  const [resetField, setResetField] = useState(false);
  const votesUrl = useTableUrlState({
    prefix: "votes",
    defaultRowsPerPage: 10,
    defaultOrderBy: "createdAt",
    defaultOrder: "desc",
  });
  const votesPage = votesUrl.page;
  const votesRowsPerPage = votesUrl.rowsPerPage;
  const votesQ = votesUrl.q;
  const setVotesPage = votesUrl.setPage;
  const setVotesRowsPerPage = votesUrl.setRowsPerPage;
  const setVotesQ = votesUrl.setQ;
  const votesSort = {
    orderBy: votesUrl.orderBy,
    order: votesUrl.order,
    set: votesUrl.setSort,
  };

  useEffect(() => {
    fetchAllAwards().then((r: any) => setAwards(r.data));
  }, []);

  const fetchVotes = useCallback(() => {
    fetchVotesPage({
      page: votesPage,
      limit: votesRowsPerPage,
      q: votesQ || undefined,
      orderBy: votesSort.orderBy,
      order: votesSort.order,
    }).then((r: any) => {
      setData(r.data.data);
      setTotal(r.data.total);
    });
  }, [votesPage, votesRowsPerPage, votesQ, votesSort.orderBy, votesSort.order]);

  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  useEffect(() => {
    setSearch("");
    setPage(1);
  }, [step]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const resetAll = () => {
    setStep(0);
    setDadosGerais({});
    setDataForSend({ place: "", id_vote: "", id_category: "", id_game: "", id_award: "" });
    setLastSaved(null);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    resetAll();
  };

  const back = () => {
    if (step === 0) {
      handleClose();
      return;
    }
    const target = (step - 1) as Step;
    setStep(target);
    // limpa o passo de destino e tudo que vem depois (caso usuário tenha selecionado e voltado)
    const order = ["award", "participant", "category", "game", "place"];
    setDadosGerais((g: any) => {
      const copy = { ...g };
      for (let i = target; i < order.length; i++) {
        delete copy[order[i]];
      }
      return copy;
    });
    // espelha o reset no payload
    setDataForSend((p) => {
      const next = { ...p };
      const fieldByStep: Record<number, keyof typeof p> = {
        0: "id_award",
        1: "id_vote",
        2: "id_category",
        3: "id_game",
        4: "place",
      };
      for (let i = target; i <= 4; i++) {
        const f = fieldByStep[i];
        if (f) next[f] = "" as any;
      }
      return next;
    });
  };

  const [lastSaved, setLastSaved] = useState<{ game?: string; placeLabel?: string } | null>(null);

  const sendVote = () => {
    setSaving(true);
    const savedGame = dadosGerais.game?.name;
    const savedPlaceLabel =
      places.find((p) => p.value === dadosGerais.place)?.label ??
      (dadosGerais.place ? `${dadosGerais.place}º lugar` : undefined);
    create(dataForSend as any)
      .then(() => {
        success("Voto registrado!");
        fetchVotes();
        setResetField((v) => !v);
        setLastSaved({ game: savedGame, placeLabel: savedPlaceLabel });
        // Invalida caches de votos do fluxo para que os próximos passos
        // (outro voto, mesmo votante / mesmo prêmio) enxerguem o voto recém-criado
        // e apliquem os disables corretamente.
        queryClient.invalidateQueries(["voter-progress"]);
        queryClient.invalidateQueries(["category-progress"]);
        queryClient.invalidateQueries(["categories-progress"]);
        queryClient.invalidateQueries(["voter-slots"]);
        queryClient.invalidateQueries(["category-votes"]);
        setStep(6);
      })
      .catch(() => undefined) // mensagem (incl. 409 DUPLICATE_VOTE) já vem do interceptor
      .finally(() => setSaving(false));
  };

  const resetForNextVote = (keepLevel: "voter" | "award") => {
    setDadosGerais((g: any) => {
      const copy = { ...g };
      delete copy.category;
      delete copy.game;
      delete copy.place;
      if (keepLevel === "award") {
        delete copy.participant;
      }
      return copy;
    });
    setDataForSend((p) => ({
      ...p,
      place: "",
      id_game: "",
      id_category: "",
      ...(keepLevel === "award" ? { id_vote: "" } : {}),
    }));
    setLastSaved(null);
    // keepLevel "voter" → pula para Categoria (step 2); "award" → volta para Votante (step 1)
    setStep(keepLevel === "voter" ? 2 : 1);
  };

  // Dados do passo atual. Ordem: 0=Prêmio, 1=Votante, 2=Categoria, 3=Jogo
  const currentList: OptionItem[] = useMemo(() => {
    if (step === 0)
      return awards.map((a: any) => ({ id: a.id, name: a.name, subtitle: a.year ? `Edição ${a.year}` : undefined }));
    if (step === 1)
      return participantes.map((p: any) => ({
        id: p.participant.id,
        name: p.participant.name,
        image: p.participant.image,
      }));
    if (step === 2)
      return categories.map((c: any) => ({ id: c.categories.id, name: c.categories.name }));
    if (step === 3)
      return jogos.map((j: any) => ({ id: j.game.id, name: j.game.name, image: j.game.image }));
    return [];
  }, [step, awards, participantes, categories, jogos]);

  const filteredList = useMemo(() => {
    if (!search.trim()) return currentList;
    return currentList.filter((o) => matchesSearch(o.name, search));
  }, [currentList, search]);

  const pageCount = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const paginatedList = useMemo(
    () => filteredList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredList, page]
  );

  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [pageCount, page]);

  const selectedId = useMemo(() => {
    if (step === 0) return dadosGerais.award?.id;
    if (step === 1) return dadosGerais.participant?.id;
    if (step === 2) return dadosGerais.category?.id;
    if (step === 3) return dadosGerais.game?.id;
    return null;
  }, [step, dadosGerais]);

  const pickOption = (opt: OptionItem) => {
    if (step === 0) {
      const award: any = awards.find((a: any) => a.id === opt.id);
      setCategories(award?.awards_categories ?? []);
      setJogos(award?.games ?? []);
      setParticipantes(award?.participants ?? []);
      setDadosGerais({ award });
      setDataForSend((p) => ({ ...p, id_award: award.id }));
      setStep(1);
    } else if (step === 1) {
      const part: any = participantes.find((p: any) => p.participant.id === opt.id)?.participant;
      setDadosGerais((g: any) => ({ ...g, participant: part }));
      setDataForSend((p) => ({ ...p, id_vote: part.id }));
      setStep(2);
    } else if (step === 2) {
      const cat: any = categories.find((c: any) => c.categories.id === opt.id)?.categories;
      setDadosGerais((g: any) => ({ ...g, category: cat }));
      setDataForSend((p) => ({ ...p, id_category: cat.id }));
      setStep(3);
    } else if (step === 3) {
      const g: any = jogos.find((j: any) => j.game.id === opt.id)?.game;
      setDadosGerais((gen: any) => ({ ...gen, game: g }));
      setDataForSend((p) => ({ ...p, id_game: g.id }));
      setStep(4);
    }
  };

  const pickPlace = (value: string) => {
    setDadosGerais((g: any) => ({ ...g, place: value }));
    setDataForSend((p) => ({ ...p, place: value }));
    setStep(5);
  };

  const progress =
    step === 6 ? 100 : ((step + 1) / STEP_LABELS.length) * 100;

  const currentStepLabel =
    step === 6 ? { label: "Voto registrado", icon: <CheckRoundedIcon fontSize="small" /> } : STEP_LABELS[step];

  const StepChip = ({ i }: { i: number }) => {
    const active = i === step;
    const done = i < step;
    return (
      <Stack direction="row" gap={0.75} alignItems="center">
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            fontSize: 12,
            bgcolor: done ? "secondary.main" : "background.default",
            color: done ? "#fff" : active ? "secondary.main" : "text.disabled",
            border: (t) =>
              `2px solid ${done ? t.palette.secondary.main : active ? t.palette.secondary.main : t.palette.divider}`,
          }}
        >
          {done ? <CheckRoundedIcon sx={{ fontSize: 16 }} /> : i + 1}
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: active || done ? 600 : 400,
            color: done ? "text.primary" : active ? "secondary.main" : "text.disabled",
            display: { xs: "none", sm: "block" },
          }}
        >
          {STEP_LABELS[i].label}
        </Typography>
      </Stack>
    );
  };

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Premiação"
        title="Votos"
        subtitle="Fluxo guiado em 5 passos para registrar um voto. A lista abaixo mostra os votos já cadastrados, com os mais recentes no topo."
        crumbs={[
          { label: "Início", to: "/" },
          { label: "Premiação", to: "/awards" },
          { label: "Votos" },
        ]}
        actions={
          <Stack direction="row" gap={1} alignItems="center">
            <Button
              component={RouterLink}
              to="/awards/create-bulk-votes"
              variant="outlined"
              size="large"
            >
              Cadastro em massa
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<AddRoundedIcon />}
              onClick={handleOpen}
            >
              Cadastrar voto
            </Button>
          </Stack>
        }
      />

      <SectionCard
        title="Votos registrados"
        description={`${total} ${total === 1 ? "voto" : "votos"} no total.`}
      >
        <EnchancedTableVotes
          data={data}
          onChanged={fetchVotes}
          pagination={{
            page: votesPage,
            rowsPerPage: votesRowsPerPage,
            total,
            onPageChange: setVotesPage,
            onRowsPerPageChange: (rows: number) => {
              setVotesRowsPerPage(rows);
              setVotesPage(1);
            },
          }}
          toolbar={
            <SearchFieldComp
              value={votesQ}
              onChange={(v) => {
                setVotesQ(v);
                setVotesPage(1);
              }}
              placeholder="Buscar voto (jogo, participante, prêmio)…"
              width={380}
            />
          }
          sort={{
            orderBy: votesSort.orderBy,
            order: votesSort.order,
            onChange: votesSort.set,
          }}
        />
      </SectionCard>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { overflow: "hidden" } }}
      >
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 3,
            "& .MuiLinearProgress-bar": { bgcolor: "secondary.main" },
            bgcolor: "background.default",
          }}
        />
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
            <Box>
              <Typography variant="overline" color="secondary" sx={{ display: "block", lineHeight: 1 }}>
                {step === 6 ? "Sucesso" : `Passo ${step + 1} de ${STEP_LABELS.length}`}
              </Typography>
              <Typography variant="h5" component="div">
                {currentStepLabel.label}
              </Typography>
            </Box>
            <IconButton onClick={handleClose} aria-label="Fechar">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          {/* Breadcrumb das escolhas já feitas (movido para o header) */}
          {step > 0 && step !== 6 && (
            <Stack direction="row" gap={0.5} flexWrap="wrap" sx={{ mt: 1.5 }}>
              {dadosGerais.award && (
                <Chip
                  size="small"
                  color="secondary"
                  icon={<EmojiEventsRoundedIcon sx={{ fontSize: 12 }} />}
                  label={dadosGerais.award.name}
                  sx={{ fontSize: 11, height: 22 }}
                />
              )}
              {dadosGerais.category && (
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<WorkspacesRoundedIcon sx={{ fontSize: 12 }} />}
                  label={dadosGerais.category.name}
                  sx={{ fontSize: 11, height: 22 }}
                />
              )}
              {dadosGerais.participant && (
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<PersonRoundedIcon sx={{ fontSize: 12 }} />}
                  label={dadosGerais.participant.name}
                  sx={{ fontSize: 11, height: 22 }}
                />
              )}
              {dadosGerais.game && (
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<SportsEsportsRoundedIcon sx={{ fontSize: 12 }} />}
                  label={dadosGerais.game.name}
                  sx={{ fontSize: 11, height: 22 }}
                />
              )}
              {dadosGerais.place && (
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<MilitaryTechRoundedIcon sx={{ fontSize: 12 }} />}
                  label={places.find((p) => p.value === dadosGerais.place)?.label ?? `${dadosGerais.place}º lugar`}
                  sx={{ fontSize: 11, height: 22 }}
                />
              )}
            </Stack>
          )}

          {step !== 6 && (
            <Box sx={{ display: { xs: "none", sm: "block" }, mt: 2 }}>
              <Stack direction="row" gap={{ sm: 1.5, md: 2.5 }} flexWrap="wrap">
                {STEP_LABELS.map((_, i) => (
                  <StepChip key={i} i={i} />
                ))}
              </Stack>
            </Box>
          )}
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 3 }}>
          {/* Progresso da categoria — mostrado no step 3 (jogo), quando a categoria já foi escolhida */}
          {step === 3 && (
            <Alert severity="info" icon={false} sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Typography variant="body2">
                  <strong>{categoryVotes.length}</strong> de{" "}
                  <strong>{participantes.length * totalPlaces}</strong> votos esperados nesta categoria
                  ({participantes.length} {participantes.length === 1 ? "votante" : "votantes"} × {totalPlaces} {totalPlaces === 1 ? "colocação" : "colocações"}).
                </Typography>
                <Chip
                  size="small"
                  color={
                    categoryVotes.length >= participantes.length * totalPlaces
                      ? "success"
                      : "default"
                  }
                  label={
                    categoryVotes.length >= participantes.length * totalPlaces
                      ? "categoria completa"
                      : `${Math.max(0, participantes.length * totalPlaces - categoryVotes.length)} faltando`
                  }
                />
              </Stack>
            </Alert>
          )}

          {/* Conteúdo por step */}
          {step <= 3 && (
            <>
              <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Box sx={{ flex: 1, width: "100%" }}>
                  <SearchFieldComp
                    value={search}
                    onChange={setSearch}
                    placeholder={`Buscar ${STEP_LABELS[step].label.toLowerCase()}…`}
                    debounceMs={150}
                    width="100%"
                  />
                </Box>
                <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, whiteSpace: "nowrap" }}>
                  {filteredList.length} {filteredList.length === 1 ? "item" : "itens"}
                  {search && currentList.length !== filteredList.length
                    ? ` de ${currentList.length}`
                    : ""}
                </Typography>
              </Stack>
              {filteredList.length === 0 ? (
                <Alert severity="warning">
                  {currentList.length === 0
                    ? `Nenhum(a) ${STEP_LABELS[step].label.toLowerCase()} disponível para esta edição.`
                    : `Nada encontrado para "${search}".`}
                </Alert>
              ) : (
                <>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 1.5,
                      maxHeight: { md: "45vh" },
                      overflowY: "auto",
                      pr: 1,
                      pt: 1,
                    }}
                  >
                    {paginatedList.map((item) => {
                      let disabled = false;
                      let disabledReason: string | undefined;
                      let disabledChip = "indisponível";
                      if (step === 1) {
                        // Votante: desabilita se já votou em todas as categorias × colocações do prêmio.
                        const used = voterTotalCount.get(String(item.id)) ?? 0;
                        if (maxVotesPerVoter > 0 && used >= maxVotesPerVoter) {
                          disabled = true;
                          disabledReason = `Este votante já registrou todos os ${maxVotesPerVoter} votos do prêmio (${categoriesInAward} categorias × ${totalPlaces} colocações).`;
                          disabledChip = "votos completos";
                        }
                      } else if (step === 2) {
                        // Categoria: desabilita se o votante já usou todas as colocações nesta categoria.
                        const used = categoryUsedCount.get(String(item.id)) ?? 0;
                        if (used >= totalPlaces) {
                          disabled = true;
                          disabledReason = `Este votante já registrou todos os ${totalPlaces} votos nesta categoria.`;
                          disabledChip = "categoria completa";
                        }
                      } else if (step === 3) {
                        // Jogo: desabilita se já votado nesta categoria por este votante.
                        if (usedGameIds.has(item.id)) {
                          disabled = true;
                          disabledReason = "Este votante já votou neste jogo nesta categoria.";
                          disabledChip = "já votado";
                        }
                      }
                      return (
                        <OptionCard
                          key={item.id}
                          item={item}
                          selected={item.id === selectedId}
                          onClick={() => pickOption(item)}
                          icon={STEP_LABELS[step].icon}
                          disabled={disabled}
                          disabledReason={disabledReason}
                          disabledChip={disabledChip}
                        />
                      );
                    })}
                  </Box>
                  {pageCount > 1 && (
                    <Stack alignItems="center" sx={{ mt: 2 }}>
                      <Pagination
                        count={pageCount}
                        page={page}
                        onChange={(_e, v) => setPage(v)}
                        color="secondary"
                        shape="rounded"
                        size="small"
                        showFirstButton
                        showLastButton
                      />
                    </Stack>
                  )}
                </>
              )}
            </>
          )}

          {step === 4 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Qual a colocação deste jogo no voto deste participante?
              </Typography>
              <Stack direction={{ xs: "column", md: "row" }} gap={2} flexWrap="wrap">
                {places.map((p) => {
                  const st = styleFor(p.value);
                  const used = usedPlaces.has(p.value);
                  return (
                    <Card
                      key={p.value}
                      onClick={used ? undefined : () => pickPlace(p.value)}
                      title={used ? "Este votante já usou esta colocação nesta categoria" : undefined}
                      sx={{
                        flex: 1,
                        minWidth: 140,
                        p: 3,
                        cursor: used ? "not-allowed" : "pointer",
                        textAlign: "center",
                        opacity: used ? 0.5 : 1,
                        transition: "all 200ms ease",
                        "&:hover": used
                          ? {}
                          : { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)" },
                      }}
                    >
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          mx: "auto",
                          mb: 1.5,
                          background: st.gradient,
                          color: st.color,
                        }}
                      >
                        <MilitaryTechRoundedIcon sx={{ fontSize: 32 }} />
                      </Box>
                      <Typography sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.5rem" }}>
                        {p.value}º
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {p.label.replace(`${p.value}º `, "")}
                      </Typography>
                      <Chip
                        size="small"
                        label={used ? "já usado" : `${p.points} pts`}
                        color={used ? "default" : undefined}
                        sx={{ mt: 1 }}
                      />
                    </Card>
                  );
                })}
              </Stack>
            </Box>
          )}

          {step === 5 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Revise os dados antes de confirmar. Você pode voltar para ajustar qualquer etapa.
              </Alert>
              <Card sx={{ p: 3 }}>
                <Stack spacing={2.5} divider={<Divider flexItem />}>
                  <SummaryRow
                    icon={<EmojiEventsRoundedIcon />}
                    label="Prêmio"
                    value={dadosGerais.award?.name}
                  />
                  <SummaryRow
                    icon={<WorkspacesRoundedIcon />}
                    label="Categoria"
                    value={dadosGerais.category?.name}
                  />
                  <SummaryRow
                    icon={<SportsEsportsRoundedIcon />}
                    label="Jogo"
                    value={dadosGerais.game?.name}
                    image={dadosGerais.game?.image}
                  />
                  <SummaryRow
                    icon={<PersonRoundedIcon />}
                    label="Quem está votando"
                    value={dadosGerais.participant?.name}
                    image={dadosGerais.participant?.image}
                  />
                  <Stack direction="row" gap={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        background:
                          styleFor(dadosGerais.place).gradient,
                        color: styleFor(dadosGerais.place).color,
                        flexShrink: 0,
                      }}
                    >
                      <MilitaryTechRoundedIcon />
                    </Box>
                    <Box>
                      <Typography variant="overline" color="text.disabled" sx={{ display: "block", lineHeight: 1 }}>
                        Colocação
                      </Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {places.find((p) => p.value === dadosGerais.place)?.label ?? `${dadosGerais.place}º lugar`}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Card>
            </Box>
          )}
          {step === 6 && (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                Voto registrado
                {lastSaved?.game ? `: ${lastSaved.game}` : ""}
                {lastSaved?.placeLabel ? ` em ${lastSaved.placeLabel}` : ""}.
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Deseja registrar outro voto agora?
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  color="secondary"
                  startIcon={<WorkspacesRoundedIcon />}
                  onClick={() => resetForNextVote("voter")}
                  sx={{ py: 2 }}
                >
                  Outro voto, mesmo votante
                </Button>
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  color="secondary"
                  startIcon={<PersonRoundedIcon />}
                  onClick={() => resetForNextVote("award")}
                  sx={{ py: 2 }}
                >
                  Outro voto, mesmo prêmio
                </Button>
                <Button
                  fullWidth
                  size="large"
                  variant="outlined"
                  startIcon={<CloseRoundedIcon />}
                  onClick={handleClose}
                  sx={{ py: 2 }}
                >
                  Concluir
                </Button>
              </Stack>
            </Box>
          )}
        </DialogContent>

        <Divider />

        {step !== 6 && (
          <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
            <Button onClick={back} startIcon={<ArrowBackRoundedIcon />} disabled={saving}>
              {step === 0 ? "Cancelar" : "Voltar"}
            </Button>
            {step === 5 ? (
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<CheckRoundedIcon />}
                onClick={sendVote}
                disabled={saving}
              >
                {saving ? "Registrando…" : "Confirmar e registrar"}
              </Button>
            ) : (
              <Typography variant="caption" color="text.disabled">
                {step <= 3 ? "Toque em um item para continuar." : "Escolha uma colocação."}
              </Typography>
            )}
          </DialogActions>
        )}
      </Dialog>
    </PageLayout>
  );
};

const SummaryRow = ({
  icon,
  label,
  value,
  image,
}: {
  icon: JSX.Element;
  label: string;
  value?: string;
  image?: string;
}) => (
  <Stack direction="row" gap={2} alignItems="center">
    {image ? (
      <Avatar src={image} variant="rounded" sx={{ width: 48, height: 48 }} />
    ) : (
      <Avatar
        variant="rounded"
        sx={{
          width: 48,
          height: 48,
          bgcolor: (t) => alpha(t.palette.secondary.main, 0.12),
          color: "secondary.main",
        }}
      >
        {icon}
      </Avatar>
    )}
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="overline" color="text.disabled" sx={{ display: "block", lineHeight: 1 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600 }} noWrap>
        {value ?? "—"}
      </Typography>
    </Box>
  </Stack>
);

export default NewVotes;
