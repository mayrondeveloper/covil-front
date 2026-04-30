import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Chip,
  Dialog,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { useSearchParams } from "react-router-dom";
import PageLayout from "../../../components/Layout/PageLayout";
import PageHeader from "../../../components/Layout/PageHeader";
import SectionCard from "../../../components/Layout/SectionCard";
import { Podium } from "../../../components/Podium/Podium";
import { POSITION_STYLE, topWithTies } from "../../../components/WinnerCard/WinnerCard";
import { useAllRankings, useAwards } from "../../../hooks/queries";
import { Id, RankingEntry } from "../../../services/types";

interface RankingItem {
  category: {
    id: Id;
    name: string;
    background_image?: string | null;
    background_image_first?: string | null;
    background_image_second?: string | null;
    background_image_third?: string | null;
  };
  ranking: RankingEntry[];
}

const POSITION_BG_FIELD = {
  1: "background_image_first",
  2: "background_image_second",
  3: "background_image_third",
} as const;

/**
 * Devolve o background a usar para um card de posição: a imagem específica
 * dessa posição se houver, com fallback para a imagem geral da categoria.
 */
const positionBg = (
  category: RankingItem["category"],
  position: 1 | 2 | 3,
): string =>
  String(
    category[POSITION_BG_FIELD[position]] ?? category.background_image ?? "",
  );

interface PodiumFullScreenProps {
  rankings: RankingItem[];
  index: number;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}

const PodiumFullScreen = ({
  rankings,
  index,
  onIndexChange,
  onClose,
}: PodiumFullScreenProps) => {
  const current = rankings[index];
  const total = rankings.length;
  const bg = current?.category.background_image;

  const goPrev = useCallback(() => {
    if (index > 0) onIndexChange(index - 1);
  }, [index, onIndexChange]);

  const goNext = useCallback(() => {
    if (index < total - 1) onIndexChange(index + 1);
  }, [index, total, onIndexChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen && !document.fullscreenElement) {
      el.requestFullscreen().catch(() => {
        /* navegador pode negar; modo Dialog ainda funciona */
      });
    }
    return () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {
          /* ignora */
        });
      }
    };
  }, []);

  if (!current) return null;

  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          position: "relative",
          color: "text.primary",
          ...(bg
            ? {
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : { bgcolor: "background.default" }),
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          // Coloca o título abaixo da linha do botão de fechar para
          // poder colar bem na direita sem competir com ele.
          top: { xs: 72, md: 80 },
          right: { xs: 16, md: 24 },
          py: 0,
          zIndex: 2,
          maxWidth: { xs: "calc(100vw - 32px)", md: "60%" },
          textAlign: "right",
        }}
      >
        <Box
          sx={{
            display: "inline-block",
            ...(bg && {
              bgcolor: "rgba(250,247,242,0.92)",
              borderRadius: 2,
              px: 2.5,
              py: 1.25,
              boxShadow: "0 6px 18px rgba(15, 23, 42, 0.2)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }),
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: "secondary.main",
              letterSpacing: "0.18em",
              fontWeight: 700,
              display: "block",
              lineHeight: 1.4,
            }}
          >
            Categoria {index + 1} de {total}
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: { xs: "1.5rem", md: "2.25rem" },
              lineHeight: 1.1,
            }}
          >
            {current.category.name}
          </Typography>
        </Box>
      </Box>
      <Tooltip title="Fechar (Esc)">
        <IconButton
          onClick={onClose}
          size="large"
          aria-label="Fechar tela cheia"
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 2,
            bgcolor: "rgba(255,255,255,0.85)",
            boxShadow: "0 6px 18px rgba(15, 23, 42, 0.2)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </Tooltip>

      <Box
        sx={{
          flex: 1,
          display: "grid",
          // Centro vertical, colado à direita. Padding esquerdo generoso
          // (deixa o sujeito da imagem livre); direito mínimo (só o
          // suficiente para a seta de "próxima" não invadir o pódio).
          placeItems: "center end",
          pl: { xs: 8, md: 14 },
          pr: { xs: 7, md: 9 },
          py: { xs: 12, md: 8 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 720 * 1.5 }}>
          <Podium
            entries={topWithTies(current.ranking, 3)}
            scale={1.5}
            onImageBackground={Boolean(bg)}
          />
        </Box>
      </Box>

      <Tooltip title="Categoria anterior (←)" placement="right">
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            transform: "translateY(-50%)",
            zIndex: 2,
          }}
        >
          <IconButton
            onClick={goPrev}
            disabled={index === 0}
            size="large"
            aria-label="Categoria anterior"
            sx={{
              ml: { xs: 1, md: 2 },
              width: { xs: 48, md: 64 },
              height: { xs: 48, md: 64 },
              bgcolor: "rgba(255,255,255,0.85)",
              boxShadow: "0 6px 18px rgba(15, 23, 42, 0.2)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              "& svg": { fontSize: { xs: 28, md: 40 } },
              "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
              "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.35)" },
            }}
          >
            <ChevronLeftRoundedIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Próxima categoria (→)" placement="left">
        <span
          style={{
            position: "absolute",
            top: "50%",
            right: 0,
            transform: "translateY(-50%)",
            zIndex: 2,
          }}
        >
          <IconButton
            onClick={goNext}
            disabled={index >= total - 1}
            size="large"
            aria-label="Próxima categoria"
            sx={{
              mr: { xs: 1, md: 2 },
              width: { xs: 48, md: 64 },
              height: { xs: 48, md: 64 },
              bgcolor: "rgba(255,255,255,0.85)",
              boxShadow: "0 6px 18px rgba(15, 23, 42, 0.2)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              "& svg": { fontSize: { xs: 28, md: 40 } },
              "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
              "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.35)" },
            }}
          >
            <ChevronRightRoundedIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Dialog>
  );
};

interface GameSlide {
  category: { id: Id; name: string; background_image?: string | null };
  position: 1 | 2 | 3;
  winners: RankingEntry[];
}

interface GameWinnerSlideshowProps {
  slides: GameSlide[];
  index: number;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}

const GameWinnerSlideshow = ({
  slides,
  index,
  onIndexChange,
  onClose,
}: GameWinnerSlideshowProps) => {
  const current = slides[index];
  const total = slides.length;
  const bg = current ? positionBg(current.category, current.position) : "";

  const goPrev = useCallback(() => {
    if (index > 0) onIndexChange(index - 1);
  }, [index, onIndexChange]);

  const goNext = useCallback(() => {
    if (index < total - 1) onIndexChange(index + 1);
  }, [index, total, onIndexChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen && !document.fullscreenElement) {
      el.requestFullscreen().catch(() => {
        /* navegador pode negar */
      });
    }
    return () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {
          /* ignora */
        });
      }
    };
  }, []);

  if (!current) return null;

  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          position: "relative",
          color: "text.primary",
          ...(bg
            ? {
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : { bgcolor: "background.default" }),
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: { xs: 72, md: 80 },
          right: { xs: 16, md: 24 },
          zIndex: 2,
          maxWidth: { xs: "calc(100vw - 32px)", md: "60%" },
          textAlign: "right",
        }}
      >
        <Box
          sx={{
            display: "inline-block",
            bgcolor: "rgba(250,247,242,0.92)",
            borderRadius: 2,
            px: 2.5,
            py: 1.25,
            boxShadow: "0 6px 18px rgba(15, 23, 42, 0.2)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: "secondary.main",
              letterSpacing: "0.18em",
              fontWeight: 700,
              display: "block",
              lineHeight: 1.4,
            }}
          >
            {current.position}º LUGAR · {index + 1} de {total}
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: { xs: "1.5rem", md: "2.25rem" },
              lineHeight: 1.1,
            }}
          >
            {current.category.name}
          </Typography>
        </Box>
      </Box>
      <Tooltip title="Fechar (Esc)">
        <IconButton
          onClick={onClose}
          size="large"
          aria-label="Fechar tela cheia"
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 2,
            bgcolor: "rgba(255,255,255,0.85)",
            boxShadow: "0 6px 18px rgba(15, 23, 42, 0.2)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </Tooltip>

      <Box
        sx={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          // 30% da esquerda fica livre (apenas em md+ — em mobile não cabe).
          pl: { xs: 8, md: "30vw" },
          pr: { xs: 7, md: 9 },
          py: { xs: 16, md: 16 },
        }}
      >
        <Stack
          alignItems="center"
          gap={{ xs: 2.5, md: 4 }}
          sx={{ textAlign: "center", width: "100%" }}
        >
          <Stack
            direction="row"
            gap={{ xs: 1.5, md: 2 }}
            justifyContent="center"
            alignItems="flex-end"
            flexWrap="wrap"
          >
            {current.winners.map((w) =>
              w.game.image ? (
                <Box
                  key={String(w.game.id)}
                  component="img"
                  src={w.game.image as string}
                  alt={w.game.name}
                  sx={{
                    width: { xs: 160, md: 240 },
                    height: { xs: 160, md: 240 },
                    borderRadius: 2,
                    border: "4px solid #fff",
                    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.32)",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Box
                  key={String(w.game.id)}
                  sx={{
                    width: { xs: 160, md: 240 },
                    height: { xs: 160, md: 240 },
                    borderRadius: 2,
                    border: "4px solid #fff",
                    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.32)",
                    bgcolor: "background.default",
                    color: "text.secondary",
                    display: "grid",
                    placeItems: "center",
                    fontFamily: "'Playfair Display', serif",
                    fontSize: { xs: "3rem", md: "5rem" },
                    fontWeight: 700,
                  }}
                >
                  {w.game.name?.[0] ?? "?"}
                </Box>
              ),
            )}
          </Stack>
          <Box
            sx={{
              display: "inline-block",
              bgcolor: "rgba(250,247,242,0.92)",
              borderRadius: 3,
              px: { xs: 3, md: 6 },
              py: { xs: 2, md: 3 },
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.22)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              maxWidth: "100%",
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: { xs: "2rem", md: "3.5rem" },
                lineHeight: 1.1,
              }}
            >
              {current.winners.map((w) => w.game.name).join(" · ")}
            </Typography>
            {current.winners[0] && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 1,
                  color: "text.secondary",
                  fontVariantNumeric: "tabular-nums",
                  fontSize: { xs: "0.85rem", md: "1rem" },
                }}
              >
                {current.winners[0].total_points}{" "}
                {current.winners[0].total_points === 1 ? "ponto" : "pontos"}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      <Tooltip title="Anterior (←)" placement="right">
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            transform: "translateY(-50%)",
            zIndex: 2,
          }}
        >
          <IconButton
            onClick={goPrev}
            disabled={index === 0}
            size="large"
            aria-label="Anterior"
            sx={{
              ml: { xs: 1, md: 2 },
              width: { xs: 48, md: 64 },
              height: { xs: 48, md: 64 },
              "& svg": { fontSize: { xs: 28, md: 40 } },
              bgcolor: "rgba(255,255,255,0.85)",
              boxShadow: "0 6px 18px rgba(15, 23, 42, 0.2)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
              "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.35)" },
            }}
          >
            <ChevronLeftRoundedIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Próximo (→)" placement="left">
        <span
          style={{
            position: "absolute",
            top: "50%",
            right: 0,
            transform: "translateY(-50%)",
            zIndex: 2,
          }}
        >
          <IconButton
            onClick={goNext}
            disabled={index >= total - 1}
            size="large"
            aria-label="Próximo"
            sx={{
              mr: { xs: 1, md: 2 },
              width: { xs: 48, md: 64 },
              height: { xs: 48, md: 64 },
              "& svg": { fontSize: { xs: 28, md: 40 } },
              bgcolor: "rgba(255,255,255,0.85)",
              boxShadow: "0 6px 18px rgba(15, 23, 42, 0.2)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
              "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.35)" },
            }}
          >
            <ChevronRightRoundedIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Dialog>
  );
};

export const PodiumOverview = () => {
  const [sp, setSp] = useSearchParams();
  const awardId = sp.get("award") ?? "";
  const focusedCategoryId = sp.get("category") ?? "";
  const [fsIndex, setFsIndex] = useState<number | null>(null);
  const [gameFsIdx, setGameFsIdx] = useState<number | null>(null);

  const { data: awards = [], isLoading: loadingAwards } = useAwards();
  const { data: rankings = [], isLoading: loadingRankings } = useAllRankings(
    awardId || undefined
  );

  const rankingItems = useMemo<RankingItem[]>(
    () => (rankings as RankingItem[]) ?? [],
    [rankings]
  );

  // Slideshow plano de (categoria, posição) — usado pelo fullscreen da
  // aba "Por jogo". Ordem: categoria após categoria, dentro de cada uma
  // 1º → 2º → 3º (apenas posições com vencedor).
  const gameSlides = useMemo<GameSlide[]>(() => {
    const result: GameSlide[] = [];
    rankingItems.forEach((r) => {
      const top3 = topWithTies(r.ranking, 3);
      ([1, 2, 3] as const).forEach((p) => {
        const winners = top3.filter((e) => e.position === p);
        if (winners.length > 0) {
          result.push({ category: r.category, position: p, winners });
        }
      });
    });
    return result;
  }, [rankingItems]);

  useEffect(() => {
    setFsIndex(null);
    setGameFsIdx(null);
  }, [awardId]);

  useEffect(() => {
    if (!focusedCategoryId || rankingItems.length === 0) return;
    const target = document.getElementById(`podium-cat-${focusedCategoryId}`);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusedCategoryId, rankingItems]);

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

  const view: "category" | "game" =
    sp.get("view") === "game" ? "game" : "category";
  const setView = (next: "category" | "game") => {
    const params = new URLSearchParams(sp);
    if (next === "game") params.set("view", "game");
    else params.delete("view");
    setSp(params, { replace: true });
  };

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
          {awardId && (
            <Box sx={{ mt: 2.5 }}>
              <Typography
                variant="overline"
                sx={{ display: "block", color: "text.secondary", letterSpacing: 1, mb: 1 }}
              >
                Visualização
              </Typography>
              <ToggleButtonGroup
                value={view}
                exclusive
                size="small"
                onChange={(_e, v) => v && setView(v)}
                sx={{
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
                <ToggleButton value="category">Por categoria</ToggleButton>
                <ToggleButton value="game">Por jogo</ToggleButton>
              </ToggleButtonGroup>
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
        view === "game" &&
        rankingItems.map((r, idx) => {
          const top3 = topWithTies(r.ranking, 3);
          const positionsWithWinners = ([1, 2, 3] as const).filter((p) =>
            top3.some((e) => e.position === p),
          );
          if (positionsWithWinners.length === 0) return null;
          return (
            <Accordion
              key={r.category.id}
              defaultExpanded={idx === 0}
              disableGutters
              elevation={0}
              sx={{
                mb: 1.5,
                border: (t) => `1px solid ${t.palette.divider}`,
                borderRadius: "12px !important",
                bgcolor: "background.paper",
                "&:before": { display: "none" },
                "&.Mui-expanded": {
                  borderColor: (t) => alpha(t.palette.secondary.main, 0.4),
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreRoundedIcon />}
                sx={{
                  px: { xs: 2, md: 3 },
                  py: 1,
                  "& .MuiAccordionSummary-content": {
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: "secondary.main",
                      letterSpacing: "0.18em",
                      fontWeight: 700,
                      display: "block",
                      lineHeight: 1.4,
                    }}
                  >
                    Categoria
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 700,
                      fontSize: { xs: "1.15rem", md: "1.4rem" },
                      lineHeight: 1.15,
                    }}
                  >
                    {r.category.name}
                  </Typography>
                </Box>
                <Tooltip title="Tela cheia">
                  <IconButton
                    size="small"
                    aria-label="Abrir categoria em tela cheia"
                    onClick={(e) => {
                      e.stopPropagation();
                      const idx = gameSlides.findIndex(
                        (s) => s.category.id === r.category.id,
                      );
                      if (idx >= 0) setGameFsIdx(idx);
                    }}
                    sx={{ flexShrink: 0 }}
                  >
                    <FullscreenRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Stack direction="row" gap={0.5} sx={{ flexShrink: 0 }}>
                  {positionsWithWinners.map((p) => {
                    const style = POSITION_STYLE[p];
                    return (
                      <Chip
                        key={p}
                        size="small"
                        label={style.label}
                        sx={{
                          background: style.bg,
                          color: style.color,
                          fontWeight: 700,
                          minWidth: 36,
                        }}
                      />
                    );
                  })}
                </Stack>
              </AccordionSummary>
              <AccordionDetails
                sx={{ px: { xs: 1.5, md: 2.5 }, pb: 2, pt: 0 }}
              >
              {positionsWithWinners.map((position) => {
                const winners = top3.filter((e) => e.position === position);
                const cardBg = positionBg(r.category, position);
                return (
                  <SectionCard key={`${r.category.id}-${position}`}>
                    <Box
                      sx={{
                        position: "relative",
                        borderRadius: 2,
                        overflow: "hidden",
                        py: { xs: 3, md: 5 },
                        // 30% da esquerda livre no desktop (mostra o sujeito
                        // da imagem de fundo), simétrico no mobile.
                        pl: { xs: 2, md: "30%" },
                        pr: { xs: 2, md: 4 },
                        display: "grid",
                        placeItems: "center",
                        ...(cardBg && {
                          backgroundImage: `url(${cardBg})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          "@media print": {
                            WebkitPrintColorAdjust: "exact",
                            printColorAdjust: "exact",
                          },
                        }),
                      }}
                    >
                      <Stack
                        alignItems="center"
                        gap={{ xs: 2, md: 2.5 }}
                        sx={{ textAlign: "center", width: "100%" }}
                      >
                        <Stack
                          direction="row"
                          gap={1.5}
                          flexWrap="wrap"
                          justifyContent="center"
                          alignItems="flex-end"
                        >
                          {winners.map((w) =>
                            w.game.image ? (
                              <Box
                                key={String(w.game.id)}
                                component="img"
                                src={w.game.image as string}
                                alt={w.game.name}
                                sx={{
                                  width: { xs: 130, md: 168 },
                                  height: { xs: 130, md: 168 },
                                  borderRadius: 2,
                                  border: "3px solid #fff",
                                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.22)",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <Box
                                key={String(w.game.id)}
                                sx={{
                                  width: { xs: 130, md: 168 },
                                  height: { xs: 130, md: 168 },
                                  borderRadius: 2,
                                  border: "3px solid #fff",
                                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.22)",
                                  bgcolor: "background.default",
                                  color: "text.secondary",
                                  display: "grid",
                                  placeItems: "center",
                                  fontFamily: "'Playfair Display', serif",
                                  fontSize: { xs: "2.25rem", md: "3rem" },
                                  fontWeight: 700,
                                }}
                              >
                                {w.game.name?.[0] ?? "?"}
                              </Box>
                            ),
                          )}
                        </Stack>
                        <Box
                          sx={{
                            display: "inline-block",
                            bgcolor: "rgba(250,247,242,0.92)",
                            borderRadius: 2,
                            px: { xs: 2.5, md: 4 },
                            py: { xs: 1.5, md: 2 },
                            boxShadow: "0 6px 18px rgba(15, 23, 42, 0.2)",
                            backdropFilter: "blur(8px)",
                            WebkitBackdropFilter: "blur(8px)",
                            maxWidth: "100%",
                          }}
                        >
                          <Typography
                            variant="overline"
                            sx={{
                              color: "secondary.main",
                              letterSpacing: "0.18em",
                              fontWeight: 700,
                              display: "block",
                              lineHeight: 1.4,
                            }}
                          >
                            {position}º LUGAR
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "'Playfair Display', serif",
                              fontWeight: 700,
                              fontSize: { xs: "1.4rem", md: "2rem" },
                              lineHeight: 1.1,
                            }}
                          >
                            {winners.map((w) => w.game.name).join(" · ")}
                          </Typography>
                          {winners[0] && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                mt: 0.5,
                                color: "text.secondary",
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {winners[0].total_points}{" "}
                              {winners[0].total_points === 1 ? "ponto" : "pontos"}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </Box>
                  </SectionCard>
                );
              })}
              </AccordionDetails>
            </Accordion>
          );
        })}

      {awardId &&
        view === "category" &&
        rankingItems.map((r, idx) => {
          const bg = r.category.background_image;
          const isFocused =
            focusedCategoryId &&
            String(r.category.id) === String(focusedCategoryId);
          return (
            <Box
              key={r.category.id}
              id={`podium-cat-${r.category.id}`}
              sx={{
                scrollMarginTop: 80,
                ...(isFocused && {
                  outline: (t) => `2px solid ${t.palette.secondary.main}`,
                  outlineOffset: 4,
                  borderRadius: 2,
                }),
              }}
            >
            <SectionCard
              title={r.category.name}
              actions={
                <Tooltip title="Tela cheia">
                  <IconButton
                    onClick={() => setFsIndex(idx)}
                    aria-label="Abrir em tela cheia"
                    size="small"
                  >
                    <FullscreenRoundedIcon />
                  </IconButton>
                </Tooltip>
              }
            >
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 2,
                  overflow: "hidden",
                  py: { xs: 3, md: 4 },
                  ...(bg
                    ? {
                        // Mesma lógica do fullscreen: pódio colado na direita,
                        // espaço à esquerda livre para o sujeito da imagem.
                        display: "grid",
                        placeItems: "center end",
                        pl: { xs: 2, md: 6 },
                        pr: { xs: 1, md: 2 },
                        backgroundImage: `url(${bg})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        "@media print": {
                          WebkitPrintColorAdjust: "exact",
                          printColorAdjust: "exact",
                        },
                      }
                    : { px: { xs: 1, md: 2 } }),
                }}
              >
                <Box sx={{ width: "100%", maxWidth: 720 }}>
                  <Podium
                    entries={topWithTies(r.ranking, 3)}
                    onImageBackground={Boolean(bg)}
                  />
                </Box>
              </Box>
            </SectionCard>
            </Box>
          );
        })}

      {fsIndex != null && rankingItems[fsIndex] && (
        <PodiumFullScreen
          rankings={rankingItems}
          index={fsIndex}
          onIndexChange={setFsIndex}
          onClose={() => setFsIndex(null)}
        />
      )}

      {gameFsIdx != null && gameSlides[gameFsIdx] && (
        <GameWinnerSlideshow
          slides={gameSlides}
          index={gameFsIdx}
          onIndexChange={setGameFsIdx}
          onClose={() => setGameFsIdx(null)}
        />
      )}
    </PageLayout>
  );
};

export default PodiumOverview;
