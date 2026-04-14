import { Avatar, Box, Card, Chip, Stack, Typography } from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import { RankingEntry } from "../../services/types";

const POSITION_STYLE: Record<number, { label: string; bg: string; color: string }> = {
  1: { label: "1º", bg: "linear-gradient(135deg, #B45309 0%, #F59E0B 100%)", color: "#fff" },
  2: { label: "2º", bg: "linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)", color: "#0F172A" },
  3: { label: "3º", bg: "linear-gradient(135deg, #7C2D12 0%, #C2410C 100%)", color: "#fff" },
};

/**
 * Expande um ranking para top-N incluindo todos os empatados na última
 * posição selecionada (não corta no meio de um empate).
 */
export const topWithTies = (entries: RankingEntry[], n = 3) => {
  if (entries.length === 0) return [];
  const taken: RankingEntry[] = [];
  for (const e of entries) {
    if (taken.length < n) {
      taken.push(e);
      continue;
    }
    const last = taken[taken.length - 1];
    if (e.tied && e.position === last.position) taken.push(e);
    else break;
  }
  return taken;
};

interface WinnerCardProps {
  entry: RankingEntry;
  prominent?: boolean;
}

export const WinnerCard = ({ entry, prominent }: WinnerCardProps) => {
  const style = POSITION_STYLE[entry.position] ?? POSITION_STYLE[3];
  const isWinner = entry.position === 1;
  return (
    <Card
      variant="outlined"
      sx={{
        p: prominent ? 3 : 2.5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        borderColor: isWinner ? "secondary.main" : undefined,
        borderWidth: isWinner ? 2 : 1,
        boxShadow: isWinner ? "0 10px 32px rgba(180, 83, 9, 0.14)" : undefined,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: prominent ? 44 : 36,
            height: prominent ? 44 : 36,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: style.bg,
            color: style.color,
            fontWeight: 700,
            fontSize: prominent ? 16 : 14,
            flexShrink: 0,
          }}
        >
          {style.label}
        </Box>
        <Stack direction="row" gap={0.75} sx={{ flex: 1, minWidth: 0, flexWrap: "wrap" }}>
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
        <Typography
          variant="caption"
          sx={{
            flexShrink: 0,
            fontWeight: 600,
            color: "text.secondary",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {entry.total_points} {entry.total_points === 1 ? "pt" : "pts"}
        </Typography>
      </Stack>

      <Stack direction="row" gap={1.5} alignItems="flex-start">
        {entry.game.image ? (
          <Avatar
            src={entry.game.image}
            alt={entry.game.name}
            variant="rounded"
            sx={{ width: prominent ? 72 : 56, height: prominent ? 72 : 56 }}
          />
        ) : (
          <Avatar
            variant="rounded"
            sx={{
              width: prominent ? 72 : 56,
              height: prominent ? 72 : 56,
              bgcolor: "background.default",
              color: "text.secondary",
            }}
          >
            {entry.game.name?.[0] ?? "?"}
          </Avatar>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 600,
              fontSize: prominent ? "1.2rem" : "1.05rem",
              lineHeight: 1.2,
            }}
          >
            {entry.game.name}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" gap={0.75} flexWrap="wrap">
        {entry.breakdown.firsts > 0 && (
          <Chip size="small" label={`${entry.breakdown.firsts}× 1º`} />
        )}
        {entry.breakdown.seconds > 0 && (
          <Chip size="small" label={`${entry.breakdown.seconds}× 2º`} variant="outlined" />
        )}
        {entry.breakdown.thirds > 0 && (
          <Chip size="small" label={`${entry.breakdown.thirds}× 3º`} variant="outlined" />
        )}
      </Stack>
    </Card>
  );
};

export default WinnerCard;
