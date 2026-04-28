import { useEffect } from "react";
import {
  Autocomplete,
  Box,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import { useSearchParams } from "react-router-dom";
import PageLayout from "../../../components/Layout/PageLayout";
import PageHeader from "../../../components/Layout/PageHeader";
import SectionCard from "../../../components/Layout/SectionCard";
import { Podium } from "../../../components/Podium/Podium";
import { topWithTies } from "../../../components/WinnerCard/WinnerCard";
import { useAllRankings, useAwards } from "../../../hooks/queries";
import { Id, RankingEntry } from "../../../services/types";

export const PodiumOverview = () => {
  const [sp, setSp] = useSearchParams();
  const awardId = sp.get("award") ?? "";

  const { data: awards = [], isLoading: loadingAwards } = useAwards();
  const { data: rankings = [], isLoading: loadingRankings } = useAllRankings(
    awardId || undefined
  );

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

  const award = (awards as any[]).find((a) => String(a.id) === awardId);

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Resultados"
        title="Pódio dos vencedores"
        subtitle="Visão cerimonial dos três primeiros colocados em cada categoria. Selecione uma edição do prêmio para ver o pódio."
        crumbs={[
          { label: "Início", to: "/" },
          { label: "Premiação", to: "/awards" },
          { label: "Pódio" },
        ]}
      />

      <Box sx={{ "@media print": { display: "none" } }}>
        <SectionCard>
          <Typography
            variant="overline"
            sx={{ display: "block", color: "text.secondary", letterSpacing: 1, mb: 1 }}
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
              O pódio de cada categoria aparecerá aqui assim que você selecionar um prêmio.
            </Typography>
          </Box>
        </SectionCard>
      )}

      {awardId && loadingRankings && (
        <SectionCard>
          <Stack gap={2}>
            {[0, 1].map((i) => (
              <Skeleton key={i} variant="rounded" height={320} />
            ))}
          </Stack>
        </SectionCard>
      )}

      {awardId && !loadingRankings && rankings.length === 0 && (
        <SectionCard>
          <Typography variant="body2" sx={{ textAlign: "center", py: 4 }}>
            Esta edição ainda não tem categorias cadastradas.
          </Typography>
        </SectionCard>
      )}

      {awardId &&
        rankings.map((r: any) => (
          <SectionCard key={r.category.id} title={r.category.name}>
            <Podium entries={topWithTies(r.ranking as RankingEntry[], 3)} />
          </SectionCard>
        ))}
    </PageLayout>
  );
};

export default PodiumOverview;
