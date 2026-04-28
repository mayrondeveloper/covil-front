import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  ButtonBase,
  Chip,
  IconButton,
  InputAdornment,
  LinearProgress,
  Menu,
  MenuItem,
  Popover,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from "@mui/material";
import { WinnerCard } from "../../../components/WinnerCard/WinnerCard";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import { useSearchParams } from "react-router-dom";
import {
  useAwards,
  useAwardCategoriesByAward,
  useScoringScheme,
  useRanking,
  useCategoryVotes,
  useCategoriesProgress,
} from "../../../hooks/queries";
import { RankingEntry } from "../../../services/types";
import PageLayout from "../../../components/Layout/PageLayout";
import PageHeader from "../../../components/Layout/PageHeader";
import SectionCard from "../../../components/Layout/SectionCard";
import { GenericTable } from "../../../components/Table/GenericTable";


const csvField = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const toCsvSummary = (ranking: RankingEntry[]) => {
  const header = [
    "Posição",
    "Jogo",
    "Pontos",
    "1º lugares",
    "2º lugares",
    "3º lugares",
    "Empate",
  ].join(",");
  const rows = ranking.map((e) =>
    [
      e.position,
      csvField(e.game.name),
      e.total_points,
      e.breakdown.firsts,
      e.breakdown.seconds,
      e.breakdown.thirds,
      e.tied ? "sim" : "não",
    ].join(",")
  );
  return [header, ...rows].join("\n");
};

const toCsvDetailed = (ranking: RankingEntry[]) => {
  const header = ["Posição", "Jogo", "Pontos", "Votante", "Colocação dada"].join(
    ","
  );
  const rows = ranking.flatMap((e) =>
    e.voters.length === 0
      ? [[e.position, csvField(e.game.name), e.total_points, "", ""].join(",")]
      : e.voters.map((v) =>
          [
            e.position,
            csvField(e.game.name),
            e.total_points,
            csvField(v.name),
            `${v.place}º`,
          ].join(",")
        )
  );
  return [header, ...rows].join("\n");
};

const downloadCsv = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  a.click();
  URL.revokeObjectURL(url);
};

export const ViewAwardAndCategoryPlaces = () => {
  const [sp, setSp] = useSearchParams();
  const awardId = sp.get("award") ?? "";
  const categoryId = sp.get("category") ?? "";

  const { data: awards = [], isLoading: awardsLoading } = useAwards();
  const { data: awardCategories = [], isLoading: categoriesLoading } =
    useAwardCategoriesByAward(awardId || undefined);

  const award = awards.find((a: any) => a.id === awardId);
  const category = awardCategories.find((c: any) => c.id === categoryId);

  const { data: scheme } = useScoringScheme(awardId || undefined);
  const {
    data: rankingData,
    isFetching: rankingFetching,
  } = useRanking(awardId || undefined, categoryId || undefined);
  const { data: categoryVotes = [] } = useCategoryVotes(
    awardId || undefined,
    categoryId || undefined
  );
  const { data: categoriesProgress = [] } = useCategoriesProgress(
    awardId || undefined
  );
  const progressByCategory = useMemo(() => {
    const m = new Map<string, { voters: number; votes: number }>();
    (categoriesProgress as any[]).forEach((p) => {
      m.set(String(p.id_category), {
        voters: p.distinct_voters ?? 0,
        votes: p.total_votes ?? 0,
      });
    });
    return m;
  }, [categoriesProgress]);

  const backendRanking: RankingEntry[] = rankingData?.ranking ?? [];

  // Filtro por votante (chips abaixo do card de categorias).
  const [selectedVoterIds, setSelectedVoterIds] = useState<Set<string>>(
    new Set()
  );
  // Reset do filtro quando troca prêmio/categoria.
  useEffect(() => {
    setSelectedVoterIds(new Set());
  }, [awardId, categoryId]);

  const votersInCategory = useMemo(() => {
    const seen = new Map<string, { id: string; name: string }>();
    (categoryVotes as any[]).forEach((v: any) => {
      const id = String(v.id_vote ?? v.participant?.id ?? "");
      const name = v.participant?.name ?? "?";
      if (id && !seen.has(id)) seen.set(id, { id, name });
    });
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [categoryVotes]);

  const toggleVoter = (id: string) => {
    setSelectedVoterIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pointsMap = useMemo(() => {
    const m = new Map<string, number>();
    (scheme?.places ?? []).forEach((p: any) => m.set(String(p.value), p.points));
    return m;
  }, [scheme]);

  // Ranking recalculado localmente quando há filtro.
  const filteredRanking = useMemo<RankingEntry[]>(() => {
    if (selectedVoterIds.size === 0) return backendRanking;
    type Bucket = {
      game: { id: string; name: string; image?: string };
      total_points: number;
      firsts: number;
      seconds: number;
      thirds: number;
      voters: Array<{ id: string; name: string; place: string }>;
    };
    const byGame = new Map<string, Bucket>();
    (categoryVotes as any[])
      .filter((v: any) =>
        selectedVoterIds.has(String(v.id_vote ?? v.participant?.id ?? ""))
      )
      .forEach((v: any) => {
        const gameId = String(v.id_game ?? v.game?.id ?? "");
        if (!gameId) return;
        let b = byGame.get(gameId);
        if (!b) {
          b = {
            game: {
              id: gameId,
              name: v.game?.name ?? "?",
              image: v.game?.image,
            },
            total_points: 0,
            firsts: 0,
            seconds: 0,
            thirds: 0,
            voters: [],
          };
          byGame.set(gameId, b);
        }
        b.total_points += pointsMap.get(String(v.place)) ?? 0;
        if (String(v.place) === "1") b.firsts += 1;
        else if (String(v.place) === "2") b.seconds += 1;
        else if (String(v.place) === "3") b.thirds += 1;
        b.voters.push({
          id: String(v.id_vote ?? v.participant?.id ?? ""),
          name: v.participant?.name ?? "?",
          place: String(v.place),
        });
      });

    const sorted = Array.from(byGame.values()).sort((a, b) => {
      if (b.total_points !== a.total_points)
        return b.total_points - a.total_points;
      if (b.firsts !== a.firsts) return b.firsts - a.firsts;
      if (b.seconds !== a.seconds) return b.seconds - a.seconds;
      if (b.thirds !== a.thirds) return b.thirds - a.thirds;
      return a.game.name.localeCompare(b.game.name);
    });

    const sameRank = (a: Bucket, b: Bucket) =>
      a.total_points === b.total_points &&
      a.firsts === b.firsts &&
      a.seconds === b.seconds &&
      a.thirds === b.thirds;

    const result: RankingEntry[] = [];
    sorted.forEach((b, i) => {
      const prev = sorted[i - 1];
      const next = sorted[i + 1];
      const position =
        prev && sameRank(prev, b) ? result[i - 1].position : i + 1;
      const tied =
        (!!prev && sameRank(prev, b)) || (!!next && sameRank(next, b));
      result.push({
        position,
        tied,
        game: b.game,
        total_points: b.total_points,
        breakdown: { firsts: b.firsts, seconds: b.seconds, thirds: b.thirds },
        voters: b.voters,
      });
    });
    return result;
  }, [selectedVoterIds, categoryVotes, backendRanking, pointsMap]);

  const filterActive = selectedVoterIds.size > 0;
  const ranking = filteredRanking;
  const podium = ranking.slice(0, 3);

  const distinctVoters = useMemo(
    () =>
      new Set(
        (categoryVotes as any[])
          .map((v: any) => v.id_vote ?? v.participant?.id)
          .filter(Boolean)
      ).size,
    [categoryVotes]
  );
  const expectedVoters: number = (award as any)?.participants?.length ?? 0;
  const totalPlaces = scheme?.places.length ?? 3;

  // Auto-seleciona prêmio mais recente se nenhum estiver na URL.
  useEffect(() => {
    if (awardId || awards.length === 0) return;
    const latest = [...awards].sort((a: any, b: any) => {
      const ya = Number(a.year) || 0;
      const yb = Number(b.year) || 0;
      if (yb !== ya) return yb - ya;
      return String(b.id).localeCompare(String(a.id));
    })[0];
    if (latest) {
      const next = new URLSearchParams(sp);
      next.set("award", String(latest.id));
      setSp(next, { replace: true });
    }
  }, [awards, awardId, sp, setSp]);

  // Se categoria da URL não pertence ao prêmio selecionado, limpa.
  useEffect(() => {
    if (
      !categoryId ||
      !awardId ||
      awardCategories.length === 0 ||
      categoriesLoading
    )
      return;
    const belongs = awardCategories.some((c: any) => c.id === categoryId);
    if (!belongs) {
      const next = new URLSearchParams(sp);
      next.delete("category");
      setSp(next, { replace: true });
    }
  }, [awardId, awardCategories, categoriesLoading, categoryId, sp, setSp]);

  const setAward = (value: { id: string | number } | null) => {
    const next = new URLSearchParams(sp);
    if (value) next.set("award", String(value.id));
    else next.delete("award");
    next.delete("category");
    setSp(next, { replace: true });
  };

  const setCategory = (value: { id: string | number } | null) => {
    const next = new URLSearchParams(sp);
    if (value) next.set("category", String(value.id));
    else next.delete("category");
    setSp(next, { replace: true });
  };

  const [exportAnchor, setExportAnchor] = useState<HTMLElement | null>(null);
  const csvBase = `ranking-${award?.name ?? "award"}-${
    category?.name ?? "category"
  }`;
  const exportSummary = () => {
    downloadCsv(toCsvSummary(ranking), `${csvBase}.csv`);
    setExportAnchor(null);
  };
  const exportDetailed = () => {
    downloadCsv(toCsvDetailed(ranking), `${csvBase}-com-votantes.csv`);
    setExportAnchor(null);
  };

  // Navegação prev/next entre categorias do prêmio.
  const categoryIndex = awardCategories.findIndex(
    (c: any) => c.id === categoryId
  );
  const prevCategory =
    categoryIndex > 0 ? (awardCategories[categoryIndex - 1] as any) : null;
  const nextCategory =
    categoryIndex >= 0 && categoryIndex < awardCategories.length - 1
      ? (awardCategories[categoryIndex + 1] as any)
      : null;

  // Busca dentro dos chips de categoria.
  const [categorySearch, setCategorySearch] = useState("");
  const visibleCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return awardCategories as any[];
    return (awardCategories as any[]).filter((c) =>
      c.name?.toLowerCase().includes(q)
    );
  }, [awardCategories, categorySearch]);

  // Ordenação da tabela de ranking (integra com GenericTable).
  const [tableSort, setTableSort] = useState<{
    orderBy: string | undefined;
    order: "asc" | "desc" | undefined;
  }>({ orderBy: "position", order: "asc" });
  const sortedRanking = useMemo(() => {
    if (!tableSort.orderBy || !tableSort.order) return ranking;
    const arr = [...ranking];
    const dir = tableSort.order === "asc" ? 1 : -1;
    const key = tableSort.orderBy;
    arr.sort((a, b) => {
      const get = (e: RankingEntry) => {
        if (key === "position") return e.position;
        if (key === "total_points") return e.total_points;
        return (e.breakdown as any)[key] ?? 0;
      };
      return (get(a) - get(b)) * dir;
    });
    return arr;
  }, [ranking, tableSort]);

  // Popover de votantes por linha da tabela.
  const [votersAnchor, setVotersAnchor] = useState<{
    el: HTMLElement;
    entry: RankingEntry;
  } | null>(null);

  const hasSelection = Boolean(awardId && categoryId);
  const loading = rankingFetching;

  // "Completa" baseado em total_votes vs expectedVoters × totalPlaces.
  const expectedTotalVotes = expectedVoters * totalPlaces;
  const categoryTotalVotes = useMemo(
    () => (categoryVotes as any[]).length,
    [categoryVotes]
  );
  const categoryComplete =
    expectedTotalVotes > 0 && categoryTotalVotes >= expectedTotalVotes;

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Resultados"
        title="Ranking da categoria"
        subtitle="Selecione prêmio e categoria para ver o pódio e o ranking completo."
        crumbs={[
          { label: "Início", to: "/" },
          { label: "Premiação", to: "/awards" },
          { label: "Ranking da categoria" },
        ]}
      />

      <Box sx={{ "@media print": { display: "none" } }}>
      <SectionCard>
        <Stack gap={2.5}>
          {/* Prêmio — toggle quando há poucos, autocomplete quando passa de 8 */}
          <Box>
            <Typography
              variant="overline"
              sx={{ display: "block", color: "text.secondary", letterSpacing: 1, mb: 1 }}
            >
              Prêmio
            </Typography>
            {awards.length > 8 ? (
              <Autocomplete
                sx={{ mt: 0.5, maxWidth: 480 }}
                size="small"
                options={awards as any[]}
                loading={awardsLoading}
                value={award ?? null}
                onChange={(_e, v) => setAward(v as any)}
                getOptionLabel={(o: any) => o?.name ?? ""}
                isOptionEqualToValue={(a: any, b: any) => a?.id === b?.id}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Buscar prêmio…" required />
                )}
              />
            ) : (
              <ToggleButtonGroup
                value={awardId || null}
                exclusive
                onChange={(_e, v) => {
                  if (!v) return;
                  const a = (awards as any[]).find((x) => String(x.id) === v);
                  setAward(a ?? null);
                }}
                sx={{
                  mt: 0.5,
                  flexWrap: "wrap",
                  gap: 1,
                  "& .MuiToggleButtonGroup-grouped": {
                    border: (t) => `1px solid ${t.palette.divider} !important`,
                    borderRadius: "999px !important",
                    mx: "0 !important",
                    px: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  },
                }}
              >
                {awardsLoading && awards.length === 0
                  ? [0, 1, 2].map((i) => (
                      <Skeleton
                        key={i}
                        variant="rounded"
                        width={120}
                        height={36}
                        sx={{ borderRadius: 999 }}
                      />
                    ))
                  : (awards as any[])
                      .slice()
                      .sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0))
                      .map((a) => (
                        <ToggleButton key={a.id} value={String(a.id)}>
                          {a.name}
                          {a.year && (
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{ ml: 0.75, color: "text.secondary" }}
                            >
                              {a.year}
                            </Typography>
                          )}
                        </ToggleButton>
                      ))}
              </ToggleButtonGroup>
            )}
          </Box>

          {/* Categoria — chips em grade com progresso embutido */}
          <Box>
            <Stack
              direction="row"
              alignItems="baseline"
              justifyContent="space-between"
              gap={1}
              flexWrap="wrap"
            >
              <Typography
                variant="overline"
                sx={{ color: "text.secondary", letterSpacing: 1 }}
              >
                Categoria
              </Typography>
              {hasSelection && ranking.length > 0 && (
                <>
                  <Button
                    variant="text"
                    size="small"
                    onClick={(e) => setExportAnchor(e.currentTarget)}
                    startIcon={<DownloadRoundedIcon />}
                  >
                    Exportar CSV
                  </Button>
                  <Menu
                    anchorEl={exportAnchor}
                    open={Boolean(exportAnchor)}
                    onClose={() => setExportAnchor(null)}
                  >
                    <MenuItem onClick={exportSummary}>Resumo (ranking)</MenuItem>
                    <MenuItem onClick={exportDetailed}>
                      Detalhado (com votantes)
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Stack>

            {!awardId ? (
              <Alert severity="info" variant="outlined" sx={{ mt: 1 }}>
                Escolha um prêmio para ver as categorias.
              </Alert>
            ) : (
              <>
                {awardCategories.length > 6 && (
                  <TextField
                    size="small"
                    placeholder="Filtrar categorias…"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    sx={{ mt: 1, maxWidth: 360 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: categorySearch ? (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setCategorySearch("")}
                            aria-label="Limpar busca"
                          >
                            <CloseRoundedIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : undefined,
                    }}
                  />
                )}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 1.25,
                    mt: 1,
                  }}
                >
                {categoriesLoading && awardCategories.length === 0
                  ? [0, 1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} variant="rounded" height={72} />
                    ))
                  : (awardCategories as any[]).length === 0
                  ? (
                      <Alert severity="info" variant="outlined" sx={{ gridColumn: "1 / -1" }}>
                        Nenhuma categoria vinculada a este prêmio.
                      </Alert>
                    )
                  : visibleCategories.length === 0
                  ? (
                      <Alert severity="info" variant="outlined" sx={{ gridColumn: "1 / -1" }}>
                        Nenhuma categoria corresponde a "{categorySearch}".
                      </Alert>
                    )
                  : visibleCategories.map((c: any) => {
                      const selected = c.id === category?.id;
                      const prog = progressByCategory.get(String(c.id));
                      const voters = prog?.voters ?? 0;
                      const votes = prog?.votes ?? 0;
                      const catMaxVotes = expectedVoters * totalPlaces;
                      const ratio =
                        catMaxVotes > 0
                          ? Math.min(100, (votes / catMaxVotes) * 100)
                          : 0;
                      const complete =
                        catMaxVotes > 0 && votes >= catMaxVotes;
                      return (
                        <ButtonBase
                          key={c.id}
                          onClick={() => setCategory(c)}
                          focusRipple
                          aria-pressed={selected}
                          sx={{
                            justifyContent: "flex-start",
                            textAlign: "left",
                            p: 1.5,
                            borderRadius: 2,
                            border: (t) =>
                              `1px solid ${
                                selected
                                  ? t.palette.secondary.main
                                  : t.palette.divider
                              }`,
                            bgcolor: (t) =>
                              selected
                                ? alpha(t.palette.secondary.main, 0.08)
                                : t.palette.background.paper,
                            transition: "all 200ms ease",
                            "&:hover": {
                              borderColor: (t) => t.palette.secondary.main,
                              bgcolor: (t) =>
                                alpha(t.palette.secondary.main, 0.04),
                            },
                          }}
                        >
                          <Stack sx={{ width: "100%", minWidth: 0 }} gap={0.75}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              gap={1}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  fontSize: 14,
                                  flex: 1,
                                  minWidth: 0,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {c.name}
                              </Typography>
                              {complete ? (
                                <Chip
                                  size="small"
                                  color="success"
                                  icon={<CheckCircleRoundedIcon />}
                                  label="completa"
                                  sx={{ height: 22, fontSize: 11 }}
                                />
                              ) : catMaxVotes > 0 ? (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ flexShrink: 0 }}
                                >
                                  {votes}/{catMaxVotes}
                                </Typography>
                              ) : null}
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={ratio}
                              sx={{
                                height: 5,
                                borderRadius: 3,
                                bgcolor: (t) => alpha(t.palette.divider, 0.5),
                                "& .MuiLinearProgress-bar": {
                                  bgcolor: complete
                                    ? "success.main"
                                    : "secondary.main",
                                },
                              }}
                            />
                          </Stack>
                        </ButtonBase>
                      );
                    })}
                </Box>
              </>
            )}
          </Box>
        </Stack>
      </SectionCard>

      {hasSelection && votersInCategory.length > 0 && (
        <SectionCard
          title="Filtrar por votante"
          description={
            filterActive
              ? `Mostrando apenas votos de ${selectedVoterIds.size} de ${votersInCategory.length} votante(s).`
              : "Clique nos votantes para recalcular o pódio e o ranking apenas com esses votos."
          }
        >
          <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
            {votersInCategory.map((v) => {
              const selected = selectedVoterIds.has(v.id);
              return (
                <Chip
                  key={v.id}
                  label={v.name}
                  clickable
                  onClick={() => toggleVoter(v.id)}
                  color={selected ? "secondary" : "default"}
                  variant={selected ? "filled" : "outlined"}
                  sx={{ fontWeight: selected ? 600 : 400 }}
                />
              );
            })}
            {filterActive && (
              <Button
                size="small"
                variant="text"
                onClick={() => setSelectedVoterIds(new Set())}
                sx={{ textTransform: "none", ml: 0.5 }}
              >
                Limpar filtro
              </Button>
            )}
          </Stack>
        </SectionCard>
      )}
      </Box>

      {!hasSelection && (
        <SectionCard>
          <Alert severity="info" variant="outlined">
            Escolha um prêmio e uma categoria acima para ver o ranking.
          </Alert>
        </SectionCard>
      )}

      {hasSelection && (
        <>
          {/* Progresso + scoring scheme + nav prev/next */}
          <SectionCard
            title={category?.name}
            description={
              expectedTotalVotes > 0
                ? `${categoryTotalVotes} de ${expectedTotalVotes} votos registrados (${distinctVoters} de ${expectedVoters} votantes)`
                : undefined
            }
          >
            <Stack direction="column" gap={2}>
              {expectedTotalVotes > 0 && (
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(
                      100,
                      (categoryTotalVotes / Math.max(1, expectedTotalVotes)) * 100
                    )}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      "& .MuiLinearProgress-bar": {
                        bgcolor: categoryComplete ? "success.main" : "secondary.main",
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {categoryComplete
                      ? "Votação completa."
                      : `Faltam ${expectedTotalVotes - categoryTotalVotes} votos.`}
                  </Typography>
                </Box>
              )}
              {scheme && scheme.places.length > 0 && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Pontuação:{" "}
                  {scheme.places
                    .map(
                      (p) =>
                        `${p.label} ${p.points} ${p.points === 1 ? "pt" : "pts"}`
                    )
                    .join(" · ")}
                </Typography>
              )}
              {/* Nav prev/next entre categorias */}
              {(prevCategory || nextCategory) && (
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    pt: 1,
                    borderTop: (t) => `1px solid ${t.palette.divider}`,
                    "@media print": { display: "none" },
                  }}
                >
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<ChevronLeftRoundedIcon />}
                    disabled={!prevCategory}
                    onClick={() => prevCategory && setCategory(prevCategory)}
                    sx={{ textTransform: "none", minWidth: 0 }}
                  >
                    {prevCategory?.name ?? "Anterior"}
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    {categoryIndex + 1} de {awardCategories.length}
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    endIcon={<ChevronRightRoundedIcon />}
                    disabled={!nextCategory}
                    onClick={() => nextCategory && setCategory(nextCategory)}
                    sx={{ textTransform: "none", minWidth: 0 }}
                  >
                    {nextCategory?.name ?? "Próxima"}
                  </Button>
                </Stack>
              )}
            </Stack>
          </SectionCard>

          {/* Pódio */}
          <SectionCard title="Pódio">
            {loading && ranking.length === 0 ? (
              <Stack direction={{ xs: "column", md: "row" }} gap={2}>
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} variant="rounded" height={340} sx={{ flex: 1 }} />
                ))}
              </Stack>
            ) : podium.length === 0 ? (
              <Alert severity="info" variant="outlined">
                Ainda não há votos nesta categoria.
              </Alert>
            ) : (
              <Stack
                direction={{ xs: "column", md: "row" }}
                gap={2}
                alignItems="stretch"
              >
                {podium.map((entry) => (
                  <Box
                    key={entry.game.id}
                    sx={{
                      flex: "1 1 0",
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <WinnerCard entry={entry} />
                  </Box>
                ))}
              </Stack>
            )}
          </SectionCard>

          {/* Ranking completo */}
          {ranking.length > 0 && (
            <SectionCard
              title="Ranking completo"
              description={`${ranking.length} ${
                ranking.length === 1 ? "jogo" : "jogos"
              } com votos nesta categoria`}
            >
              <GenericTable<RankingEntry>
                data={sortedRanking}
                rowKey={(r) => r.game.id}
                dense
                loading={loading && ranking.length === 0}
                sort={{
                  orderBy: tableSort.orderBy,
                  order: tableSort.order,
                  onChange: (orderBy, order) =>
                    setTableSort({ orderBy, order }),
                }}
                columns={[
                  {
                    header: "Pos.",
                    width: 60,
                    sortField: "position",
                    render: (r) => (
                      <Stack direction="row" alignItems="center" gap={0.5}>
                        <Typography sx={{ fontWeight: 700 }}>
                          {r.position}º
                        </Typography>
                        {r.tied && (
                          <Chip
                            size="small"
                            label="empate"
                            sx={{ height: 18, fontSize: 10 }}
                          />
                        )}
                      </Stack>
                    ),
                  },
                  {
                    header: "Jogo",
                    render: (r) => (
                      <Typography sx={{ fontWeight: 600 }}>
                        {r.game.name}
                      </Typography>
                    ),
                  },
                  {
                    header: "Pontos",
                    width: 90,
                    sortField: "total_points",
                    render: (r) => <strong>{r.total_points}</strong>,
                  },
                  {
                    header: "1º",
                    width: 60,
                    hideOnMobile: true,
                    sortField: "firsts",
                    render: (r) => r.breakdown.firsts,
                  },
                  {
                    header: "2º",
                    width: 60,
                    hideOnMobile: true,
                    sortField: "seconds",
                    render: (r) => r.breakdown.seconds,
                  },
                  {
                    header: "3º",
                    width: 60,
                    hideOnMobile: true,
                    sortField: "thirds",
                    render: (r) => r.breakdown.thirds,
                  },
                  {
                    header: "Votantes",
                    hideOnMobile: true,
                    render: (r) => (
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<PeopleAltRoundedIcon fontSize="small" />}
                        onClick={(e) =>
                          setVotersAnchor({ el: e.currentTarget, entry: r })
                        }
                        sx={{ textTransform: "none" }}
                        disabled={r.voters.length === 0}
                      >
                        {r.voters.length}{" "}
                        {r.voters.length === 1 ? "votante" : "votantes"}
                      </Button>
                    ),
                  },
                ]}
                emptyMessage="Sem votos."
              />

              <Popover
                open={Boolean(votersAnchor)}
                anchorEl={votersAnchor?.el ?? null}
                onClose={() => setVotersAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                PaperProps={{ sx: { p: 2, maxWidth: 320 } }}
              >
                {votersAnchor && (
                  <Stack gap={1}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {votersAnchor.entry.game.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Quem votou e em que posição
                    </Typography>
                    <Stack gap={0.5}>
                      {votersAnchor.entry.voters.map((v) => (
                        <Stack
                          key={`${v.id}-${v.place}`}
                          direction="row"
                          justifyContent="space-between"
                          gap={2}
                        >
                          <Typography variant="body2">{v.name}</Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "secondary.main" }}
                          >
                            {v.place}º
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                )}
              </Popover>
            </SectionCard>
          )}
        </>
      )}
    </PageLayout>
  );
};
