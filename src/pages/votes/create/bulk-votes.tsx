import { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import { Link as RouterLink } from "react-router-dom";
import PageLayout from "../../../components/Layout/PageLayout";
import PageHeader from "../../../components/Layout/PageHeader";
import SectionCard from "../../../components/Layout/SectionCard";
import { useAwards, useScoringScheme } from "../../../hooks/queries";
import { bulkCreate } from "../../../services/votes/votes-service";
import { useNotification } from "../../../hooks/use-notification";

type AwardOption = {
  id: string;
  name: string;
  awards_categories?: Array<{ categories: { id: string; name: string } }>;
  games?: Array<{ game: { id: string; name: string } }>;
  participants?: Array<{ participant: { id: string; name: string } }>;
};

type CategoryOption = { id: string; name: string };
type VoterOption = { id: string; name: string };
type GameOption = { id: string; name: string };

const REASON_LABEL: Record<string, string> = {
  duplicate_place: "essa colocação já tem voto desse votante",
  duplicate_game: "esse jogo já recebeu voto desse votante na categoria",
  invalid_place: "colocação inválida no esquema",
  unknown: "erro desconhecido",
};

export const BulkVotes = () => {
  const { data: awards = [] } = useAwards();
  const { success, error: errorNotif } = useNotification();

  const [award, setAward] = useState<AwardOption | null>(null);
  const [category, setCategory] = useState<CategoryOption | null>(null);
  const [voter, setVoter] = useState<VoterOption | null>(null);
  const [selections, setSelections] = useState<Record<string, GameOption | null>>({});
  const [saving, setSaving] = useState(false);

  const { data: scheme } = useScoringScheme(award?.id);
  const places = scheme?.places ?? [];

  const categories: CategoryOption[] = useMemo(
    () =>
      (award?.awards_categories ?? [])
        .map((r) => r.categories)
        .filter(Boolean) as CategoryOption[],
    [award]
  );

  const voters: VoterOption[] = useMemo(
    () =>
      (award?.participants ?? [])
        .map((r) => r.participant)
        .filter(Boolean) as VoterOption[],
    [award]
  );

  const games: GameOption[] = useMemo(
    () =>
      (award?.games ?? [])
        .map((r) => r.game)
        .filter(Boolean) as GameOption[],
    [award]
  );

  // Reset selections when context changes
  useEffect(() => {
    setSelections({});
  }, [award?.id, category?.id, voter?.id]);

  const setSelection = (placeValue: string, game: GameOption | null) => {
    setSelections((prev) => ({ ...prev, [placeValue]: game }));
  };

  // Filtra opções: cada autocomplete não mostra jogos já escolhidos em outros lugares
  const optionsForPlace = (placeValue: string): GameOption[] => {
    const used = new Set(
      Object.entries(selections)
        .filter(([k, g]) => k !== placeValue && g != null)
        .map(([, g]) => g!.id)
    );
    return games.filter((g) => !used.has(g.id));
  };

  const filledSelections = places
    .map((p) => ({ place: p.value, game: selections[p.value] ?? null }))
    .filter((s) => s.game !== null) as Array<{ place: string; game: GameOption }>;

  const submit = () => {
    if (!award || !category || !voter || filledSelections.length === 0 || saving) return;
    setSaving(true);
    bulkCreate({
      id_award: award.id,
      id_category: category.id,
      id_vote: voter.id,
      votes: filledSelections.map((s) => ({ place: s.place, id_game: s.game.id })),
    })
      .then((r) => {
        const created = r.data.created.length;
        const conflicts = r.data.conflicts;
        if (conflicts.length === 0) {
          success(`${created} voto(s) cadastrado(s).`);
          setSelections({});
        } else if (created > 0) {
          const reasons = conflicts
            .map((c) => `${c.place}º: ${REASON_LABEL[c.reason] ?? c.reason}`)
            .join(" · ");
          errorNotif(
            `Cadastrados ${created} · ${conflicts.length} ignorado(s) — ${reasons}`
          );
        } else {
          const reasons = conflicts
            .map((c) => `${c.place}º: ${REASON_LABEL[c.reason] ?? c.reason}`)
            .join(" · ");
          errorNotif(`Nada cadastrado — ${reasons}`);
        }
      })
      .catch(() => {
        // erro já é mostrado pelo interceptor global
      })
      .finally(() => setSaving(false));
  };

  return (
    <PageLayout maxWidth={960}>
      <PageHeader
        eyebrow="Premiação"
        title="Cadastrar votos em massa"
        subtitle="Escolha o prêmio, a categoria e o votante e selecione os jogos para cada colocação."
        crumbs={[
          { label: "Início", to: "/" },
          { label: "Premiação", to: "/awards" },
          { label: "Votos em massa" },
        ]}
        actions={
          <Button
            component={RouterLink}
            to="/awards/create-new-votes"
            variant="text"
            size="small"
          >
            Voto a voto (passo-a-passo)
          </Button>
        }
      />

      <SectionCard
        title="Contexto"
        description="A cédula abaixo será gravada nesse contexto."
      >
        <Stack spacing={2}>
          <Autocomplete
            options={awards as AwardOption[]}
            value={award}
            onChange={(_, v) => {
              setAward(v as AwardOption | null);
              setCategory(null);
              setVoter(null);
            }}
            getOptionLabel={(o) => o.name}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderInput={(params) => (
              <TextField {...params} label="Prêmio" required />
            )}
          />
          <Autocomplete
            options={categories}
            value={category}
            onChange={(_, v) => setCategory(v as CategoryOption | null)}
            disabled={!award}
            getOptionLabel={(o) => o.name}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Categoria"
                required
                helperText={
                  !award
                    ? "Selecione um prêmio primeiro."
                    : `${categories.length} categoria(s) neste prêmio.`
                }
              />
            )}
          />
          <Autocomplete
            options={voters}
            value={voter}
            onChange={(_, v) => setVoter(v as VoterOption | null)}
            disabled={!award}
            getOptionLabel={(o) => o.name}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Votante"
                required
                helperText={
                  !award
                    ? "Selecione um prêmio primeiro."
                    : `${voters.length} votante(s) neste prêmio.`
                }
              />
            )}
          />
        </Stack>
      </SectionCard>

      <SectionCard
        title="Cédula"
        description={
          places.length > 0
            ? `Selecione um jogo para cada colocação. ${games.length} jogo(s) disponíveis nesta edição.`
            : "Selecione um prêmio para ver as colocações disponíveis."
        }
      >
        <Stack spacing={2}>
          {places.map((p) => {
            const selected = selections[p.value] ?? null;
            return (
              <Autocomplete
                key={p.value}
                options={optionsForPlace(p.value)}
                value={selected}
                onChange={(_, v) => setSelection(p.value, v as GameOption | null)}
                disabled={!award || !category || !voter}
                getOptionLabel={(o) => o.name}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={`${p.label} (${p.points} pts)`}
                    helperText={
                      !award
                        ? "Selecione um prêmio primeiro."
                        : !category || !voter
                        ? "Selecione categoria e votante."
                        : "Opcional. Jogos já selecionados em outros lugares ficam ocultos."
                    }
                  />
                )}
              />
            );
          })}
        </Stack>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">
            {filledSelections.length > 0
              ? `${filledSelections.length} voto(s) prontos para gravar.`
              : "Selecione ao menos um jogo para habilitar o salvar."}
          </Typography>
          <Button
            variant="contained"
            startIcon={<PlaylistAddRoundedIcon />}
            onClick={submit}
            disabled={
              !award ||
              !category ||
              !voter ||
              filledSelections.length === 0 ||
              saving
            }
          >
            {saving
              ? "Salvando…"
              : filledSelections.length > 0
              ? `Salvar ${filledSelections.length} voto(s)`
              : "Salvar votos"}
          </Button>
        </Box>
      </SectionCard>
    </PageLayout>
  );
};

export default BulkVotes;
