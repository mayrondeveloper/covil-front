import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import {
  useAward,
  useAwardCategoriesByAward,
  useRanking,
} from "../../../hooks/queries";
import { useNotification } from "../../../hooks/use-notification";
import { Id, RankingEntry } from "../../../services/types";

const POSITION_STYLE: Record<number, { label: string; bg: string; color: string }> = {
  1: { label: "1º", bg: "linear-gradient(135deg, #B45309 0%, #F59E0B 100%)", color: "#fff" },
  2: { label: "2º", bg: "linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)", color: "#0F172A" },
  3: { label: "3º", bg: "linear-gradient(135deg, #7C2D12 0%, #C2410C 100%)", color: "#fff" },
};

const printStyles = `
  @media print {
    body { background: #fff !important; }
    .no-print { display: none !important; }
    .page-break { break-before: page; }
    .award-card { box-shadow: none !important; border-color: #e5e0d6 !important; }
  }
`;

const CategoryBlock = ({
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
    <Card
      className="award-card"
      sx={{
        p: 4,
        mb: 3,
        breakInside: "avoid",
      }}
    >
      <Typography variant="overline" color="secondary" sx={{ letterSpacing: "0.16em" }}>
        Categoria
      </Typography>
      <Typography
        variant="h3"
        sx={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          mb: 3,
          mt: 0.5,
        }}
      >
        {categoryName}
      </Typography>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : top.length === 0 ? (
        <Typography variant="body2" color="text.disabled" sx={{ py: 2 }}>
          Sem votos registrados nesta categoria.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {top.map((entry: RankingEntry) => {
            const style = POSITION_STYLE[entry.position] ?? POSITION_STYLE[3];
            const isWinner = entry.position === 1;
            return (
              <Stack
                key={entry.game.id}
                direction="row"
                gap={3}
                alignItems="center"
                sx={{
                  p: isWinner ? 2.5 : 1.5,
                  borderRadius: 2,
                  bgcolor: isWinner ? (t) => `${t.palette.secondary.main}0d` : "transparent",
                  border: isWinner ? (t) => `1px solid ${t.palette.secondary.main}` : undefined,
                }}
              >
                <Box
                  sx={{
                    width: isWinner ? 64 : 48,
                    height: isWinner ? 64 : 48,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background: style.bg,
                    color: style.color,
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    fontSize: isWinner ? 22 : 16,
                    flexShrink: 0,
                  }}
                >
                  {style.label}
                </Box>
                {entry.game.image ? (
                  <Avatar
                    src={entry.game.image}
                    variant="rounded"
                    sx={{ width: isWinner ? 80 : 56, height: isWinner ? 80 : 56 }}
                  />
                ) : (
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: isWinner ? 80 : 56,
                      height: isWinner ? 80 : 56,
                      bgcolor: "background.default",
                      color: "text.secondary",
                    }}
                  >
                    {entry.game.name?.[0]}
                  </Avatar>
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 700,
                      fontSize: isWinner ? "1.5rem" : "1.1rem",
                      lineHeight: 1.2,
                    }}
                  >
                    {entry.game.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {entry.total_points} {entry.total_points === 1 ? "ponto" : "pontos"}
                    {entry.breakdown.firsts > 0 && ` · ${entry.breakdown.firsts}× 1º`}
                    {entry.breakdown.seconds > 0 && ` · ${entry.breakdown.seconds}× 2º`}
                    {entry.breakdown.thirds > 0 && ` · ${entry.breakdown.thirds}× 3º`}
                  </Typography>
                </Box>
                <Stack direction="column" gap={0.5} alignItems="flex-end">
                  {isWinner && (
                    <Chip
                      icon={<EmojiEventsRoundedIcon />}
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
              </Stack>
            );
          })}
        </Stack>
      )}
    </Card>
  );
};

export const Announcement = () => {
  const { id } = useParams<{ id: string }>();
  const { success } = useNotification();
  const { data: award } = useAward(id);
  const { data: categories = [], isLoading: loadingCats } = useAwardCategoriesByAward(id);

  useEffect(() => {
    const tag = document.createElement("style");
    tag.innerHTML = printStyles;
    document.head.appendChild(tag);
    return () => {
      document.head.removeChild(tag);
    };
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      success("Link copiado.");
    } catch {
      // ignora
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Toolbar (não imprime) */}
      <Box
        className="no-print"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "background.paper",
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          py: 1.5,
          px: { xs: 2, md: 3 },
        }}
      >
        <Stack direction="row" gap={1.5} justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <Button
            component={Link}
            to="/awards/winners"
            startIcon={<ArrowBackRoundedIcon />}
            size="small"
          >
            Voltar
          </Button>
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Button
              startIcon={<ContentCopyRoundedIcon />}
              onClick={copyLink}
              variant="outlined"
              size="small"
              sx={{ "& .label-long": { display: { xs: "none", sm: "inline" } } }}
            >
              <span className="label-long">Copiar link</span>
              <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                Link
              </Box>
            </Button>
            <Button
              startIcon={<PrintRoundedIcon />}
              onClick={() => window.print()}
              variant="contained"
              color="secondary"
              size="small"
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                Imprimir / Salvar PDF
              </Box>
              <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                Imprimir
              </Box>
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Documento */}
      <Box sx={{ maxWidth: 880, mx: "auto", px: { xs: 3, md: 6 }, py: { xs: 4, md: 8 } }}>
        <div
          style={{
            marginBottom: 48,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          {[
            <Box
              key="icon"
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #B45309 0%, #F59E0B 100%)",
                color: "#fff",
              }}
            >
              <EmojiEventsRoundedIcon sx={{ fontSize: 36 }} />
            </Box>,
            <Typography
              key="eyebrow"
              variant="overline"
              color="secondary"
              sx={{ letterSpacing: "0.18em" }}
            >
              Vencedores
            </Typography>,
            <Typography
              key="title"
              variant="h1"
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                lineHeight: 1.1,
              }}
            >
              {award?.name ?? "—"}
            </Typography>,
            award?.year ? (
              <Typography key="year" variant="h5" color="text.secondary">
                {`Edição ${award.year}`}
              </Typography>
            ) : null,
          ]}
        </div>

        {loadingCats ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : categories.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            Esta edição ainda não tem categorias cadastradas.
          </Typography>
        ) : (
          categories.map((c: any) => (
            <CategoryBlock key={c.id} awardId={id!} categoryId={c.id} categoryName={c.name} />
          ))
        )}

        <Box sx={{ textAlign: "center", mt: 6, color: "text.disabled" }}>
          <Typography variant="caption">
            Gerado em {new Date().toLocaleDateString("pt-BR")} · Covil dos Jogos
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Announcement;
