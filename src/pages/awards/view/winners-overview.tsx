import { useEffect, useMemo } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  LinearProgress,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from "@mui/material";
import { WinnerCard, topWithTies } from "../../../components/WinnerCard/WinnerCard";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import {
  useAllRankings,
  useAwards,
  useScoringScheme,
  useCategoriesProgress,
} from "../../../hooks/queries";
import { Link, useSearchParams } from "react-router-dom";
import PageLayout from "../../../components/Layout/PageLayout";
import PageHeader from "../../../components/Layout/PageHeader";
import SectionCard from "../../../components/Layout/SectionCard";
import { Id, RankingEntry } from "../../../services/types";


interface CategoryWinnersProps {
  categoryName: string;
  ranking: RankingEntry[];
  expectedVoters: number;
  progress?: { voters: number; votes: number };
  maxVotes: number;
}

const CategoryWinners = ({
  categoryName,
  ranking,
  expectedVoters,
  progress,
  maxVotes,
}: CategoryWinnersProps) => {
  const podium = topWithTies(ranking, 3);
  const voters = progress?.voters ?? 0;
  const votes = progress?.votes ?? 0;
  const complete = maxVotes > 0 && votes >= maxVotes;

  const descParts: string[] = [];
  if (expectedVoters > 0) {
    descParts.push(
      `${voters} de ${expectedVoters} ${expectedVoters === 1 ? "votante votou" : "votantes votaram"}`
    );
  }
  if (complete) descParts.push("votação completa");
  else if (maxVotes > 0) descParts.push(`${votes}/${maxVotes} votos`);

  return (
    <SectionCard
      title={categoryName}
      description={descParts.length > 0 ? descParts.join(" · ") : undefined}
    >
      {expectedVoters > 0 && (
        <Box sx={{ mb: 2, "@media print": { display: "none" } }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, maxVotes > 0 ? (votes / maxVotes) * 100 : 0)}
            sx={{
              height: 5,
              borderRadius: 3,
              bgcolor: (t) => alpha(t.palette.divider, 0.5),
              "& .MuiLinearProgress-bar": {
                bgcolor: complete ? "success.main" : "secondary.main",
              },
            }}
          />
        </Box>
      )}

      {podium.length === 0 ? (
        <Alert severity="info" variant="outlined">
          Nenhum voto registrado para esta categoria.
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
  );
};

export const WinnersOverview = () => {
  const [sp, setSp] = useSearchParams();
  const awardId = sp.get("award") ?? "";

  const { data: awards = [], isLoading: loadingAwards } = useAwards();
  const { data: rankings = [], isLoading: loadingRankings } = useAllRankings(
    awardId || undefined
  );
  const { data: scheme } = useScoringScheme(awardId || undefined);
  const { data: categoriesProgress = [] } = useCategoriesProgress(
    awardId || undefined
  );

  const award = (awards as any[]).find((a) => String(a.id) === awardId);
  const expectedVoters: number = (award as any)?.participants?.length ?? 0;
  const maxVotes = expectedVoters * (scheme?.places.length ?? 0);

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

  useEffect(() => {
    if (awardId || awards.length === 0) return;
    const latest = [...awards].sort((a: any, b: any) => {
      const ya = Number(a.year) || 0;
      const yb = Number(b.year) || 0;
      if (yb !== ya) return yb - ya;
      return String(b.id).localeCompare(String(a.id));
    })[0];
    if (latest?.id != null) {
      const next = new URLSearchParams(sp);
      next.set("award", String(latest.id));
      setSp(next, { replace: true });
    }
  }, [awards, awardId, sp, setSp]);

  const setAward = (value: { id: Id } | null) => {
    const next = new URLSearchParams(sp);
    if (value) next.set("award", String(value.id));
    else next.delete("award");
    setSp(next, { replace: true });
  };

  return (
    <PageLayout>
      <Box
        sx={{
          "@media print": {
            "& nav, & [role='navigation'], & header, & .MuiDrawer-root, & .MuiAppBar-root": {
              display: "none !important",
            },
          },
        }}
      />
      <PageHeader
        eyebrow="Resultados"
        title="Vencedores por categoria"
        subtitle="Selecione uma edição do prêmio para ver os vencedores em todas as categorias. Ranking e pontuação vêm do servidor."
        crumbs={[
          { label: "Início", to: "/" },
          { label: "Premiação", to: "/awards" },
          { label: "Vencedores" },
        ]}
      />

      <Box sx={{ "@media print": { display: "none" } }}>
      <SectionCard>
        <Typography
          variant="overline"
          sx={{
            display: "block",
            color: "text.secondary",
            letterSpacing: 1,
            mb: 1,
          }}
        >
          Prêmio
        </Typography>
        {awards.length > 8 ? (
          <Autocomplete
            sx={{ maxWidth: 480 }}
            size="small"
            options={awards as any[]}
            loading={loadingAwards}
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
            {loadingAwards && awards.length === 0
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

        {awardId && scheme && scheme.places.length > 0 && (
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 1.5, color: "text.secondary" }}
          >
            Pontuação:{" "}
            {scheme.places
              .map((p) => `${p.label} ${p.points} ${p.points === 1 ? "pt" : "pts"}`)
              .join(" · ")}
          </Typography>
        )}

        {awardId && (
          <Box sx={{ mt: 1 }}>
            <Typography
              component={Link}
              to={`/awards/${awardId}/announcement`}
              variant="caption"
              sx={{
                color: "secondary.main",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Abrir página de anúncio
              <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
            </Typography>
          </Box>
        )}
      </SectionCard>
      </Box>

      {!awardId && (
        <SectionCard>
          <Box sx={{ textAlign: "center", py: 6 }}>
            <EmojiEventsRoundedIcon
              sx={{ fontSize: 56, color: "secondary.main", opacity: 0.5 }}
            />
            <Typography variant="h5" sx={{ mt: 2 }}>
              Escolha uma edição
            </Typography>
            <Typography variant="body2">
              Os vencedores de cada categoria aparecerão aqui assim que você selecionar um prêmio.
            </Typography>
          </Box>
        </SectionCard>
      )}

      {awardId && loadingRankings && (
        <SectionCard>
          <Stack gap={2}>
            {[0, 1].map((i) => (
              <Skeleton key={i} variant="rounded" height={200} />
            ))}
          </Stack>
        </SectionCard>
      )}

      {awardId &&
        !loadingRankings &&
        rankings.length === 0 && (
          <SectionCard>
            <Typography variant="body2" sx={{ textAlign: "center", py: 4 }}>
              Esta edição ainda não tem categorias cadastradas.
            </Typography>
          </SectionCard>
        )}

      {awardId &&
        rankings.map((r: any) => (
          <CategoryWinners
            key={r.category.id}
            categoryName={r.category.name}
            ranking={r.ranking as RankingEntry[]}
            expectedVoters={expectedVoters}
            progress={progressByCategory.get(String(r.category.id))}
            maxVotes={maxVotes}
          />
        ))}
    </PageLayout>
  );
};

export default WinnersOverview;
