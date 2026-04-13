import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { useRanking, useAwards, useAwardCategoriesByAward } from "../../../hooks/queries";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import PageLayout from "../../../components/Layout/PageLayout";
import PageHeader from "../../../components/Layout/PageHeader";
import SectionCard from "../../../components/Layout/SectionCard";
import { Id, RankingEntry } from "../../../services/types";

const POSITION_STYLE: Record<number, { label: string; bg: string; color: string }> = {
  1: { label: "1º", bg: "linear-gradient(135deg, #B45309 0%, #F59E0B 100%)", color: "#fff" },
  2: { label: "2º", bg: "linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)", color: "#0F172A" },
  3: { label: "3º", bg: "linear-gradient(135deg, #7C2D12 0%, #C2410C 100%)", color: "#fff" },
};

const CategoryWinners = ({
  awardId,
  categoryId,
  categoryName,
}: {
  awardId: Id;
  categoryId: Id;
  categoryName: string;
}) => {
  const { data, isLoading } = useRanking(awardId, categoryId);
  const top = (data?.ranking ?? []).slice(0, 3);

  return (
    <SectionCard
      title={categoryName}
      description={
        isLoading
          ? "Carregando…"
          : top.length === 0
          ? "Nenhum voto registrado para esta categoria."
          : `${top.length} ${top.length === 1 ? "indicado pontuado" : "indicados pontuados"}.`
      }
    >
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : top.length === 0 ? null : (
        <Grid container spacing={2}>
          {top.map((entry: RankingEntry) => {
            const style = POSITION_STYLE[entry.position] ?? POSITION_STYLE[3];
            const isWinner = entry.position === 1;
            return (
              <Grid item xs={12} md={4} key={entry.game.id}>
                <Card
                  sx={{
                    p: 2.5,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    borderColor: isWinner ? "secondary.main" : undefined,
                    boxShadow: isWinner ? "0 8px 24px rgba(180, 83, 9, 0.12)" : undefined,
                  }}
                >
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        background: style.bg,
                        color: style.color,
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {style.label}
                    </Box>
                    {isWinner && (
                      <Chip
                        size="small"
                        icon={<EmojiEventsRoundedIcon sx={{ fontSize: 14 }} />}
                        label="Vencedor"
                        color="secondary"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                    {entry.tied && (
                      <Chip
                        size="small"
                        label="EMPATADO"
                        color="warning"
                        variant="outlined"
                        sx={{ fontWeight: 700, letterSpacing: "0.05em" }}
                      />
                    )}
                  </Stack>
                  <Stack direction="row" gap={1.5} alignItems="flex-start">
                    {entry.game.image ? (
                      <Avatar
                        src={entry.game.image}
                        alt={entry.game.name}
                        variant="rounded"
                        sx={{ width: 56, height: 56 }}
                      />
                    ) : (
                      <Avatar variant="rounded" sx={{ width: 56, height: 56, bgcolor: "background.default", color: "text.secondary" }}>
                        {entry.game.name?.[0] ?? "?"}
                      </Avatar>
                    )}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontFamily: "'Playfair Display', serif",
                          fontWeight: 600,
                          fontSize: "1.05rem",
                          lineHeight: 1.2,
                        }}
                      >
                        {entry.game.name}
                      </Typography>
                      <Typography variant="caption">
                        {entry.total_points}{" "}
                        {entry.total_points === 1 ? "ponto" : "pontos"}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" gap={0.75} flexWrap="wrap">
                    {entry.breakdown.firsts > 0 && (
                      <Chip size="small" label={`${entry.breakdown.firsts}× 1º`} />
                    )}
                    {entry.breakdown.seconds > 0 && (
                      <Chip
                        size="small"
                        label={`${entry.breakdown.seconds}× 2º`}
                        variant="outlined"
                      />
                    )}
                    {entry.breakdown.thirds > 0 && (
                      <Chip
                        size="small"
                        label={`${entry.breakdown.thirds}× 3º`}
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </SectionCard>
  );
};

export const WinnersOverview = () => {
  const { data: awards = [], isLoading: loadingAwards } = useAwards();
  const [awardId, setAwardId] = useState<Id | "">("");

  useEffect(() => {
    if (awardId || !awards.length) return;
    const latest = [...awards].sort((a: any, b: any) => {
      const ya = Number(a.year) || 0;
      const yb = Number(b.year) || 0;
      if (yb !== ya) return yb - ya;
      return String(b.id).localeCompare(String(a.id));
    })[0];
    if (latest?.id != null) setAwardId(latest.id);
  }, [awards, awardId]);

  const { data: categories = [], isLoading: loadingCategories } = useAwardCategoriesByAward(
    awardId || undefined
  );

  return (
    <PageLayout>
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

      <SectionCard title="Edição do prêmio">
        <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems={{ sm: "center" }}>
          <FormControl sx={{ minWidth: 320 }} size="small">
            <InputLabel id="award-select">Prêmio</InputLabel>
            <Select
              labelId="award-select"
              label="Prêmio"
              value={awardId}
              onChange={(e) => setAwardId(e.target.value as Id)}
              disabled={loadingAwards}
            >
              {awards.map((a: any) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {awardId && (
            <Button
              component={Link}
              to={`/awards/${awardId}/announcement`}
              variant="contained"
              color="secondary"
              startIcon={<EmojiEventsRoundedIcon />}
              endIcon={<OpenInNewRoundedIcon />}
            >
              Página de anúncio
            </Button>
          )}
        </Stack>
      </SectionCard>

      {!awardId && (
        <SectionCard>
          <Box sx={{ textAlign: "center", py: 6 }}>
            <EmojiEventsRoundedIcon sx={{ fontSize: 56, color: "secondary.main", opacity: 0.5 }} />
            <Typography variant="h5" sx={{ mt: 2 }}>
              Escolha uma edição
            </Typography>
            <Typography variant="body2">
              Os vencedores de cada categoria aparecerão aqui assim que você selecionar um prêmio.
            </Typography>
          </Box>
        </SectionCard>
      )}

      {awardId && loadingCategories && (
        <SectionCard>
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        </SectionCard>
      )}

      {awardId && !loadingCategories && categories.length === 0 && (
        <SectionCard>
          <Typography variant="body2" sx={{ textAlign: "center", py: 4 }}>
            Esta edição ainda não tem categorias cadastradas.
          </Typography>
        </SectionCard>
      )}

      {awardId &&
        categories.map((c: any) => (
          <CategoryWinners
            key={c.id}
            awardId={awardId}
            categoryId={c.id}
            categoryName={c.name}
          />
        ))}
    </PageLayout>
  );
};

export default WinnersOverview;
