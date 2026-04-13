import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CircularProgress,
  Fade,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import HowToVoteRoundedIcon from "@mui/icons-material/HowToVoteRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchPage as fetchAwardsPage } from "../../services/awards-service/awards-service";
import { findAllByAwardAndCategory } from "../../services/votes/votes-service";
import { fetchByAward } from "../../services/awards-categories-service/awards-categories-service";
import { useScoringScheme } from "../../hooks/queries";
import { palette } from "../../theme";

const EmptyState = ({
  icon,
  message,
  submessage,
}: {
  icon: React.ReactNode;
  message: string;
  submessage: string;
}) => (
  <Stack
    alignItems="center"
    justifyContent="center"
    sx={{ height: "100%", textAlign: "center", color: "text.disabled" }}
    gap={1}
  >
    <Box sx={{ color: "grey.400", "& svg": { fontSize: 48 } }}>{icon}</Box>
    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
      {message}
    </Typography>
    <Typography variant="caption" color="text.disabled">
      {submessage}
    </Typography>
  </Stack>
);

const ChartCard = ({
  title,
  subtitle,
  children,
  loading,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
}) => (
  <Card sx={{ p: 3, height: "100%" }}>
    <Typography variant="overline" color="text.disabled" sx={{ display: "block" }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {subtitle}
      </Typography>
    )}
    <Box sx={{ height: 240, mt: 1 }}>
      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
          <CircularProgress size={28} />
        </Stack>
      ) : (
        children
      )}
    </Box>
  </Card>
);

export const HomeCharts = () => {
  const [selectedAwardId, setSelectedAwardId] = useState<string | number | undefined>(
    undefined
  );

  // lista de edições
  const { data: awards = [], isLoading: loadingAwards } = useQuery(
    ["home-awards-list"],
    () =>
      fetchAwardsPage({ page: 1, limit: 50 }).then((r) => {
        const sorted = [...r.data.data].sort((a: any, b: any) => {
          const ya = Number(a.year) || 0;
          const yb = Number(b.year) || 0;
          return yb - ya;
        });
        return sorted;
      }),
    { staleTime: 60_000 }
  );

  // default: edição mais recente
  useEffect(() => {
    if (!selectedAwardId && awards.length > 0) {
      setSelectedAwardId((awards as any[])[0].id);
    }
  }, [awards, selectedAwardId]);

  const selectedAward = useMemo(
    () => (awards as any[]).find((a) => a.id === selectedAwardId) ?? null,
    [awards, selectedAwardId]
  );

  const awardId = selectedAward?.id;
  const { data: scheme } = useScoringScheme(awardId);
  const totalPlaces = scheme?.places.length ?? 3;

  // categorias da edição
  const { data: categories = [], isLoading: loadingCats } = useQuery(
    ["home-cats", awardId],
    () => fetchByAward(awardId!).then((r) => r.data),
    { enabled: !!awardId, staleTime: 60_000 }
  );

  // votos por categoria (uma chamada por categoria)
  const { data: votesByCat = [], isLoading: loadingVotes } = useQuery(
    ["home-votes-by-cat", awardId, categories.map((c: any) => c.id).join(",")],
    async () => {
      const results = await Promise.all(
        (categories as any[]).map((c) =>
          findAllByAwardAndCategory(awardId!, c.id).then((r) => ({
            categoryId: c.id,
            categoryName: c.name,
            votes: r.data ?? [],
          }))
        )
      );
      return results;
    },
    { enabled: !!awardId && categories.length > 0, staleTime: 60_000 }
  );

  // dados pra gráfico de progresso por categoria
  const progressData = useMemo(() => {
    const participantsCount = (selectedAward as any)?.participants?.length ?? 5;
    const expectedPerCat = participantsCount * totalPlaces || totalPlaces * 5;
    return votesByCat.map((c: any) => ({
      name:
        c.categoryName?.length > 18
          ? c.categoryName.slice(0, 18) + "…"
          : c.categoryName,
      registrados: c.votes.length,
      faltam: Math.max(0, expectedPerCat - c.votes.length),
    }));
  }, [votesByCat, selectedAward, totalPlaces]);

  // top jogos por pontos
  const topGames = useMemo(() => {
    const map = new Map<string, { name: string; points: number; image?: string }>();
    votesByCat.forEach((c: any) => {
      c.votes.forEach((v: any) => {
        const id = v.id_game ?? v.game?.id;
        if (!id) return;
        const cur = map.get(id) ?? { name: v.game?.name ?? "?", points: 0, image: v.game?.image };
        cur.points += Number(v.value_vote ?? 0);
        map.set(id, cur);
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);
  }, [votesByCat]);

  // top votantes
  const topVoters = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    votesByCat.forEach((c: any) => {
      c.votes.forEach((v: any) => {
        const id = v.id_vote ?? v.participant?.id;
        if (!id) return;
        const cur = map.get(id) ?? { name: v.participant?.name ?? "?", count: 0 };
        cur.count += 1;
        map.set(id, cur);
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [votesByCat]);

  const loading = loadingAwards || loadingCats || loadingVotes;

  const totalVotes = votesByCat.reduce(
    (s: number, c: any) => s + c.votes.length,
    0
  );

  if (!loadingAwards && (awards as any[]).length === 0) return null;

  return (
    <Fade in timeout={600}>
      <Box sx={{ mb: 6 }}>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          {[
            <Box
              key="title"
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "baseline" },
                gap: { xs: 0.5, sm: 2 },
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontSize: { xs: "1.25rem", md: "1.375rem" } }}
              >
                {`Painel — ${selectedAward?.name ?? "…"}`}
              </Typography>
              {selectedAward?.year ? (
                <Typography variant="body2" color="text.secondary">
                  {`Edição ${selectedAward.year}`}
                </Typography>
              ) : null}
            </Box>,
            <FormControl
              key="select"
              size="small"
              sx={{ minWidth: 220, width: { xs: "100%", sm: "auto" } }}
            >
              <Select
                value={selectedAwardId ?? ""}
                onChange={(e) => setSelectedAwardId(e.target.value as any)}
                displayEmpty
              >
                {(awards as any[]).map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                    {a.year ? ` · ${a.year}` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>,
          ]}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          <ChartCard
            title="Progresso por categoria"
            subtitle="Quantos votos já entraram em cada categoria"
            loading={loading}
          >
            {progressData.length === 0 ? (
              <EmptyState
                icon={<BarChartRoundedIcon />}
                message="Ainda não há votos"
                submessage="Votos registrados aparecerão aqui."
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.border} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${palette.border}`,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="registrados" stackId="v" fill={palette.gold} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="faltam" stackId="v" fill={palette.border} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Top 5 jogos" subtitle="Mais pontuados na edição atual" loading={loading}>
            {topGames.length === 0 ? (
              <EmptyState
                icon={<EmojiEventsRoundedIcon />}
                message="Ainda não há votos"
                submessage="Os jogos mais pontuados aparecerão aqui."
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topGames.map((g) => ({ name: g.name, pontos: g.points }))}
                  margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.border} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${palette.border}`,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="pontos" radius={[0, 4, 4, 0]}>
                    {topGames.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? palette.gold : palette.goldSoft} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="Votantes mais ativos"
            subtitle="Quantidade de votos registrados"
            loading={loading}
          >
            {topVoters.length === 0 ? (
              <EmptyState
                icon={<HowToVoteRoundedIcon />}
                message="Ainda não há votos"
                submessage="Os votantes mais ativos aparecerão aqui."
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topVoters.map((v) => ({ name: v.name, votos: v.count }))}
                  margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.border} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${palette.border}`,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="votos" fill={palette.emerald} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="Resumo"
            subtitle="Totais agregados desta edição"
            loading={loading}
          >
            {totalVotes === 0 && categories.length === 0 ? (
              <EmptyState
                icon={<InsightsRoundedIcon />}
                message="Ainda não há votos"
                submessage="Votos registrados aparecerão aqui."
              />
            ) : (
              <Stack spacing={3} sx={{ pt: 2 }}>
                <SummaryRow
                  label="Categorias"
                  value={categories.length}
                />
                <SummaryRow
                  label="Votantes"
                  value={(selectedAward as any)?.participants?.length ?? "—"}
                />
                <SummaryRow
                  label="Total de votos registrados"
                  value={totalVotes}
                />
                <SummaryRow
                  label="Categorias completas"
                  value={
                    progressData.filter((p) => p.faltam === 0).length +
                    " de " +
                    progressData.length
                  }
                />
              </Stack>
            )}
          </ChartCard>
        </Box>
      </Box>
    </Fade>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="baseline">
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography
      sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.5rem" }}
    >
      {value}
    </Typography>
  </Stack>
);

export default HomeCharts;
