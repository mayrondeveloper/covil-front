import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Fade,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SportsEsportsRoundedIcon from "@mui/icons-material/SportsEsportsRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import HowToVoteRoundedIcon from "@mui/icons-material/HowToVoteRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import LeaderboardRoundedIcon from "@mui/icons-material/LeaderboardRounded";
import MilitaryTechRoundedIcon from "@mui/icons-material/MilitaryTechRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useQuery } from "@tanstack/react-query";
import { fetchPage as fetchGamesPage } from "../../services/game-service/game-service";
import { fetchPage as fetchAwardsPage } from "../../services/awards-service/awards-service";
import { fetchPage as fetchVotesPage } from "../../services/votes/votes-service";
import PageLayout from "../../components/Layout/PageLayout";
import PageHeader from "../../components/Layout/PageHeader";
import HomeCharts from "../../components/Home/HomeCharts";

interface QuickAction {
  title: string;
  description: string;
  to: string;
  icon: React.ReactNode;
  cta: string;
}

const PLACE_STYLE: Record<string, { bg: string; color: string }> = {
  "1": { bg: "linear-gradient(135deg, #B45309 0%, #F59E0B 100%)", color: "#fff" },
  "2": { bg: "linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)", color: "#0F172A" },
  "3": { bg: "linear-gradient(135deg, #7C2D12 0%, #C2410C 100%)", color: "#fff" },
};

const primaryActions: QuickAction[] = [
  {
    title: "Jogos",
    description: "Cadastre um jogo com categorias, mecânicas e demais atributos.",
    to: "/game",
    icon: <SportsEsportsRoundedIcon />,
    cta: "Gerenciar catálogo",
  },
  {
    title: "Prêmios",
    description: "Crie uma edição do prêmio com jogos, categorias e participantes.",
    to: "/awards",
    icon: <EmojiEventsRoundedIcon />,
    cta: "Ver prêmios",
  }
];

const secondaryActions: QuickAction[] = [
  {
    title: "Participantes",
    description: "Veja a lista dos indicados, edite e exclua quando necessário.",
    to: "/awards/create-participants",
    icon: <GroupsRoundedIcon />,
    cta: "Abrir lista",
  },
  {
    title: "Vencedores",
    description: "Veja os jogos vencedores em cada categoria de uma edição do prêmio.",
    to: "/awards/winners",
    icon: <LeaderboardRoundedIcon />,
    cta: "Ver vencedores",
  },
];

const StatCard = ({ label, value, hint }: { label: string; value: string | number; hint?: string }) => (
  <Card sx={{ p: 3, height: "100%" }}>
    <Typography variant="overline" color="text.disabled">
      {label}
    </Typography>
    <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.1, mt: 1 }}>
      {value}
    </Typography>
    {hint && (
      <Typography variant="body2" sx={{ mt: 1 }}>
        {hint}
      </Typography>
    )}
  </Card>
);

const ActionCard = ({ action }: { action: QuickAction }) => (
  <Card
    sx={{
      p: 3.5,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 2,
      "&:hover": {
        borderColor: "secondary.main",
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
      },
    }}
  >
    <Stack direction="row" alignItems="center" gap={1.5}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          bgcolor: (t) => `${t.palette.secondary.main}1a`,
          color: "secondary.main",
        }}
      >
        {action.icon}
      </Box>
      <Typography variant="h5" component="h3">
        {action.title}
      </Typography>
    </Stack>
    <CardContent sx={{ p: 0, flex: 1 }}>
      <Typography variant="body2">{action.description}</Typography>
    </CardContent>
    <Button
      component={Link}
      to={action.to}
      variant="text"
      endIcon={<ArrowForwardRoundedIcon />}
      sx={{ alignSelf: "flex-start", color: "secondary.main", px: 0, "&:hover": { bgcolor: "transparent", color: "secondary.dark" } }}
    >
      {action.cta}
    </Button>
  </Card>
);

const VoteRow = ({ vote }: { vote: any }) => {
  const style = PLACE_STYLE[String(vote.place)];
  return (
    <Stack direction="row" gap={1.5} alignItems="center" sx={{ py: 1.25 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          background: style?.bg,
          color: style?.color,
          fontWeight: 700,
          fontSize: 12,
          flexShrink: 0,
        }}
      >
        {vote.place}º
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontWeight: 600, lineHeight: 1.3 }} noWrap>
          {vote.game?.name ?? "—"}
        </Typography>
        <Stack direction="row" gap={0.75} alignItems="center" sx={{ mt: 0.25 }}>
          <Typography variant="caption" color="text.secondary" noWrap>
            {vote.category?.name ?? "—"}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            •
          </Typography>
          <PersonRoundedIcon sx={{ fontSize: 12, color: "text.disabled" }} />
          <Typography variant="caption" color="text.secondary" noWrap>
            {vote.participant?.name ?? "—"}
          </Typography>
        </Stack>
      </Box>
      <Chip
        size="small"
        variant="outlined"
        label={vote.award?.name ?? "—"}
        sx={{ maxWidth: 160 }}
      />
    </Stack>
  );
};

export const HomePage = () => {
  const { data: gamesTotal } = useQuery(
    ["games-total"],
    () => fetchGamesPage({ page: 1, limit: 1 }).then((r) => r.data.total),
    { staleTime: 30_000 }
  );
  const { data: awardsTotal } = useQuery(
    ["awards-total"],
    () => fetchAwardsPage({ page: 1, limit: 1 }).then((r) => r.data.total),
    { staleTime: 30_000 }
  );
  const { data: recentVotes, isLoading: loadingVotes } = useQuery(
    ["recent-votes"],
    () =>
      fetchVotesPage({ page: 1, limit: 6, orderBy: "createdAt", order: "desc" }).then(
        (r) => r.data
      ),
    { staleTime: 30_000 }
  );

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Painel"
        title="Dragão de Ouro 2025"
        subtitle="Centralize a gestão do catálogo de jogos e da premiação. Tudo o que você precisa para manter o Covil em dia, em um só lugar."
      />

      <Fade in timeout={600}>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={4}>
            <StatCard label="Jogos cadastrados" value={gamesTotal ?? "—"} hint="Total no catálogo" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard label="Edições do prêmio" value={awardsTotal ?? "—"} hint="Edições do Dragão de Ouro" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard label="Votos registrados" value={recentVotes?.total ?? "—"} hint="Total acumulado" />
          </Grid>
        </Grid>
      </Fade>

      <Fade in timeout={800}>
        <Box>
          <HomeCharts />
        </Box>
      </Fade>

      <Fade in timeout={1000}>
        <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={7}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Atalhos
          </Typography>
          <Grid container spacing={3}>
            {primaryActions.map((a) => (
              <Grid item xs={12} sm={6} key={a.title}>
                <ActionCard action={a} />
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h4">Votos recentes</Typography>
            <Button
              component={Link}
              to="/awards/create-new-votes"
              size="small"
              variant="text"
              startIcon={<AddRoundedIcon />}
              sx={{ color: "secondary.main" }}
            >
              Novo voto
            </Button>
          </Stack>
          <Card sx={{ p: 3, height: "calc(100% - 52px)" }}>
            {loadingVotes ? (
              <Stack spacing={2}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Stack key={i} direction="row" gap={1.5} alignItems="center">
                    <Skeleton variant="circular" width={32} height={32} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="70%" />
                      <Skeleton variant="text" width="50%" />
                    </Box>
                  </Stack>
                ))}
              </Stack>
            ) : recentVotes?.data?.length ? (
              <Stack divider={<Divider flexItem />}>
                {recentVotes.data.slice(0, 5).map((v: any) => (
                  <VoteRow key={v.id} vote={v} />
                ))}
              </Stack>
            ) : (
              <Stack alignItems="center" sx={{ py: 4, textAlign: "center" }} gap={2}>
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: (t) => `${t.palette.secondary.main}1a`,
                    color: "secondary.main",
                  }}
                >
                  <MilitaryTechRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Nenhum voto registrado</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Os votos aparecerão aqui conforme forem cadastrados.
                  </Typography>
                </Box>
                <Button
                  component={Link}
                  to="/awards/create-new-votes"
                  variant="contained"
                  color="secondary"
                  size="small"
                  startIcon={<AddRoundedIcon />}
                >
                  Registrar voto
                </Button>
              </Stack>
            )}
            {recentVotes?.data?.length ? (
              <Button
                component={Link}
                to="/awards/create-new-votes"
                fullWidth
                variant="text"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{ mt: 2, color: "secondary.main" }}
              >
                Ver todos os votos
              </Button>
            ) : null}
          </Card>
        </Grid>
        </Grid>
      </Fade>

      <Fade in timeout={1200}>
        <Box>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Consultas
          </Typography>
          <Grid container spacing={3}>
            {secondaryActions.map((a) => (
              <Grid item xs={12} md={6} key={a.title}>
                <ActionCard action={a} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Fade>
    </PageLayout>
  );
};

export default HomePage;
