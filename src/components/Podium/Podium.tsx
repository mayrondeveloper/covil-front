import { Box, Chip, Stack, Typography, alpha, useTheme } from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import { RankingEntry } from "../../services/types";
import { POSITION_STYLE } from "../WinnerCard/WinnerCard";

interface PodiumProps {
  entries: RankingEntry[];
  /** Multiplica todas as dimensões. 1 = padrão; 1.6 = uso em fullscreen. */
  scale?: number;
  /** Em fundos com imagem, ativa text-shadow para preservar leitura. */
  onImageBackground?: boolean;
  /**
   * Quais posições renderizar e em que ordem visual. Default: pódio
   * completo `[2, 1, 3]` (esquerda → centro → direita). Use `[1]` para
   * um pódio individual só com o vencedor.
   */
  positions?: Array<1 | 2 | 3>;
}

interface StepConfig {
  position: 1 | 2 | 3;
  heightDesktop: number;
  heightMobile: number;
  imageDesktop: number;
  imageMobile: number;
  zIndex: number;
}

const STEPS: StepConfig[] = [
  { position: 2, heightDesktop: 100, heightMobile: 78, imageDesktop: 140, imageMobile: 108, zIndex: 1 },
  { position: 1, heightDesktop: 130, heightMobile: 100, imageDesktop: 168, imageMobile: 128, zIndex: 2 },
  { position: 3, heightDesktop: 75, heightMobile: 58, imageDesktop: 140, imageMobile: 108, zIndex: 1 },
];

const groupByPosition = (entries: RankingEntry[]) => {
  const map = new Map<number, RankingEntry[]>();
  entries.forEach((e) => {
    const list = map.get(e.position) ?? [];
    list.push(e);
    map.set(e.position, list);
  });
  return map;
};

interface GameImageProps {
  entry: RankingEntry;
  size: { xs: number; md: number };
}

const GameImage = ({ entry, size }: GameImageProps) => {
  const sx = {
    width: { xs: size.xs, md: size.md },
    height: { xs: size.xs, md: size.md },
    borderRadius: 2,
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.18)",
    border: "3px solid #fff",
    flexShrink: 0,
    overflow: "hidden",
    bgcolor: "background.default",
    "@media print": { boxShadow: "none", border: "1px solid #ccc" },
  } as const;

  if (entry.game.image) {
    return (
      <Box
        component="img"
        src={entry.game.image}
        alt={entry.game.name}
        sx={{ ...sx, objectFit: "cover" }}
      />
    );
  }
  return (
    <Box
      sx={{
        ...sx,
        display: "grid",
        placeItems: "center",
        color: "text.secondary",
        fontFamily: "'Playfair Display', serif",
        fontSize: { xs: size.xs * 0.4, md: size.md * 0.4 },
        fontWeight: 600,
      }}
    >
      {entry.game.name?.[0] ?? "?"}
    </Box>
  );
};

interface StepProps {
  config: StepConfig;
  entries: RankingEntry[];
  scale: number;
  onImageBackground: boolean;
}

const Step = ({ config, entries, scale, onImageBackground }: StepProps) => {
  const theme = useTheme();
  const style = POSITION_STYLE[config.position];
  const hasEntries = entries.length > 0;
  const isTied = entries.some((e) => e.tied);
  const ariaLabel = hasEntries
    ? `${config.position}º lugar: ${entries
        .map((e) => `${e.game.name}, ${e.total_points} ${e.total_points === 1 ? "ponto" : "pontos"}`)
        .join("; ")}`
    : `${config.position}º lugar: sem voto`;

  const heightDesktop = Math.round(config.heightDesktop * scale);
  const heightMobile = Math.round(config.heightMobile * scale);
  const imageDesktop = Math.round(config.imageDesktop * scale);
  const imageMobile = Math.round(config.imageMobile * scale);

  const pillSx = onImageBackground
    ? {
        bgcolor: "rgba(250,247,242,0.92)",
        borderRadius: 2,
        px: 1.5,
        py: 0.75,
        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.2)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }
    : undefined;

  return (
    <Box
      component="article"
      aria-label={ariaLabel}
      sx={{
        flex: "1 1 0",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: config.zIndex,
      }}
    >
      <Stack
        direction="row"
        gap={{ xs: 0.75, md: 1 }}
        justifyContent="center"
        alignItems="flex-end"
        flexWrap="wrap"
        sx={{ mb: 1, minHeight: { xs: imageMobile, md: imageDesktop } }}
      >
        {hasEntries ? (
          entries.map((entry) => {
            const tieScale = entries.length > 1 ? 0.65 : 1;
            return (
              <GameImage
                key={entry.game.id}
                entry={entry}
                size={{
                  xs: Math.round(imageMobile * tieScale),
                  md: Math.round(imageDesktop * tieScale),
                }}
              />
            );
          })
        ) : (
          <Box
            aria-hidden
            sx={{
              width: { xs: imageMobile, md: imageDesktop },
              height: { xs: imageMobile, md: imageDesktop },
              borderRadius: 2,
              border: `2px dashed ${alpha(theme.palette.text.disabled, 0.5)}`,
              bgcolor: alpha(theme.palette.text.disabled, 0.06),
            }}
          />
        )}
      </Stack>

      <Box
        sx={{
          width: "100%",
          height: { xs: heightMobile, md: heightDesktop },
          background: hasEntries
            ? style.bg
            : `linear-gradient(135deg, ${alpha(theme.palette.text.disabled, 0.35)} 0%, ${alpha(
                theme.palette.text.disabled,
                0.55
              )} 100%)`,
          color: hasEntries ? style.color : theme.palette.background.paper,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          display: "grid",
          placeItems: "center",
          boxShadow: hasEntries ? "0 12px 28px rgba(180, 83, 9, 0.18)" : "none",
          position: "relative",
          "@media print": { boxShadow: "none" },
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: {
              xs: `${1.75 * scale}rem`,
              md: `${2.5 * scale}rem`,
            },
            lineHeight: 1,
            opacity: hasEntries ? 0.95 : 0.7,
          }}
        >
          {config.position}
        </Typography>
      </Box>

      <Box sx={{ width: "100%", textAlign: "center", px: 1, pt: 1.5 }}>
        {hasEntries ? (
          <Stack gap={0.5} alignItems="center">
            {entries.map((entry) => {
              const isFirst = config.position === 1;
              return (
                <Box
                  key={entry.game.id}
                  sx={{
                    width: pillSx ? "auto" : "100%",
                    maxWidth: "100%",
                    display: pillSx ? "inline-block" : "block",
                    ...pillSx,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: isFirst ? 700 : 600,
                      fontSize: isFirst
                        ? {
                            xs: `${1.2 * scale}rem`,
                            md: `${1.4 * scale}rem`,
                          }
                        : {
                            xs: `${1.05 * scale}rem`,
                            md: `${1.2 * scale}rem`,
                          },
                      lineHeight: 1.2,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {entry.game.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontVariantNumeric: "tabular-nums",
                      fontSize: isFirst
                        ? `${0.85 * scale}rem`
                        : `${0.75 * scale}rem`,
                    }}
                  >
                    {entry.total_points} {entry.total_points === 1 ? "pt" : "pts"}
                  </Typography>
                </Box>
              );
            })}
            {config.position === 1 && (
              <Chip
                size="small"
                icon={<EmojiEventsRoundedIcon sx={{ fontSize: 14 }} />}
                label="Vencedor"
                color="secondary"
                sx={{ fontWeight: 600, mt: 0.25 }}
              />
            )}
            {isTied && (
              <Chip
                size="small"
                label="EMPATADO"
                color="warning"
                variant="outlined"
                sx={{ fontWeight: 700, letterSpacing: "0.05em", mt: 0.25 }}
              />
            )}
          </Stack>
        ) : (
          <Typography variant="caption" sx={{ color: "text.disabled", fontStyle: "italic" }}>
            Sem voto
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export const Podium = ({
  entries,
  scale = 1,
  onImageBackground = false,
  positions,
}: PodiumProps) => {
  const grouped = groupByPosition(entries);
  // Se `positions` foi informado, mantemos a ordem que o caller passou
  // (assim `[1]` dá apenas o degrau central, `[1, 2]` mostra 1 → 2, etc).
  const visibleSteps = positions
    ? positions
        .map((p) => STEPS.find((s) => s.position === p))
        .filter((s): s is StepConfig => Boolean(s))
    : STEPS;
  // Pódio completo precisa de 720; um pódio individual cabe em ~280px.
  const baseMax = visibleSteps.length === 1 ? 280 : 720;
  return (
    <Stack
      direction="row"
      gap={{ xs: 1, md: 2 * scale }}
      alignItems="flex-end"
      justifyContent="center"
      sx={{
        width: "100%",
        maxWidth: baseMax * scale,
        mx: "auto",
        pt: { xs: 5 * scale, md: 6 * scale },
      }}
    >
      {visibleSteps.map((step) => (
        <Step
          key={step.position}
          config={step}
          entries={grouped.get(step.position) ?? []}
          scale={scale}
          onImageBackground={onImageBackground}
        />
      ))}
    </Stack>
  );
};

export default Podium;
