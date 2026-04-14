import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as games from "../services/game-service/game-service";
import * as awards from "../services/awards-service/awards-service";
import * as categories from "../services/categories-service/categories-service";
import * as publishers from "../services/publishers-service/publishers-service";
import * as artists from "../services/artists-service/artists-service";
import * as designers from "../services/designers-service/designers-service";
import * as mechanisms from "../services/mechanisms-service/mechanisms-service";
import * as awardCategories from "../services/awards-categories-service/awards-categories-service";
import * as participants from "../services/participants-service/participants-service";
import * as votes from "../services/votes/votes-service";
import { Id } from "../services/types";

export const qk = {
  games: ["games"] as const,
  game: (id: Id) => ["games", id] as const,
  awards: ["awards"] as const,
  award: (id: Id) => ["awards", id] as const,
  scoringScheme: (id: Id) => ["awards", id, "scoring-scheme"] as const,
  ranking: (awardId: Id, categoryId: Id) =>
    ["awards", awardId, "categories", categoryId, "ranking"] as const,
  categories: ["categories"] as const,
  publishers: ["publishers"] as const,
  artists: ["artists"] as const,
  designers: ["designers"] as const,
  mechanisms: ["mechanisms"] as const,
  awardCategories: ["award-categories"] as const,
  awardCategoriesByAward: (award: Id) => ["award-categories", { award }] as const,
  participants: ["participants"] as const,
  votes: ["votes"] as const,
};

export const useGames = () =>
  useQuery(qk.games, () => games.fetch().then((r) => r.data));
export const useGame = (id?: Id) =>
  useQuery(qk.game(id!), () => games.fetchOne(id!).then((r) => r.data), {
    enabled: id !== undefined && id !== null && id !== "",
  });
export const useDeleteGame = () => {
  const qc = useQueryClient();
  return useMutation((id: Id) => games.deleteGame(id), {
    onSuccess: () => qc.invalidateQueries(qk.games),
  });
};

export const useAwards = () =>
  useQuery(qk.awards, () => awards.fetch().then((r) => r.data));
export const useAward = (id?: Id) =>
  useQuery(qk.award(id!), () => awards.fetchOne(id!).then((r) => r.data), {
    enabled: id !== undefined && id !== null && id !== "",
  });
export const useScoringScheme = (id?: Id) =>
  useQuery(
    qk.scoringScheme(id!),
    () => awards.fetchScoringScheme(id!).then((r) => r.data),
    {
      enabled: id !== undefined && id !== null && id !== "",
      staleTime: 5 * 60_000,
    }
  );
/**
 * Devolve os votos que um votante já tem em (prêmio, categoria),
 * para a UI desabilitar `place` ou `game` já usados antes do submit.
 */
/**
 * Agregado do backend: quantos votos cada votante já tem no prêmio inteiro.
 * Usa groupBy no DB (bem mais barato que trazer todos os votos).
 */
export const useVoterProgress = (awardId?: Id) => {
  const enabled =
    awardId !== undefined && awardId !== null && awardId !== "";
  return useQuery(
    ["voter-progress", awardId],
    () => awards.fetchVoterProgress(awardId!).then((r) => r.data),
    { enabled, staleTime: 15_000, refetchOnWindowFocus: true }
  );
};

/**
 * Agregado por categoria de um prêmio: nº de votantes distintos e total de votos.
 * Usado pra pintar o progresso em cada chip de categoria.
 */
export const useCategoriesProgress = (awardId?: Id) => {
  const enabled =
    awardId !== undefined && awardId !== null && awardId !== "";
  return useQuery(
    ["categories-progress", awardId],
    () => awards.fetchCategoriesProgress(awardId!).then((r) => r.data),
    { enabled, staleTime: 15_000, refetchOnWindowFocus: true }
  );
};

/**
 * Agregado do backend: quantos votos o votante já tem em cada categoria do prêmio.
 */
export const useCategoryProgress = (awardId?: Id, voterId?: Id) => {
  const enabled =
    awardId !== undefined && awardId !== null && awardId !== "" &&
    voterId !== undefined && voterId !== null && voterId !== "";
  return useQuery(
    ["category-progress", awardId, voterId],
    () => awards.fetchCategoryProgress(awardId!, voterId!).then((r) => r.data),
    { enabled, staleTime: 15_000 }
  );
};

/**
 * Total de votos registrados em (prêmio, categoria). Usado pra mostrar
 * progresso agregado da categoria.
 */
export const useCategoryVotes = (awardId?: Id, categoryId?: Id) => {
  const enabled =
    awardId !== undefined && awardId !== null && awardId !== "" &&
    categoryId !== undefined && categoryId !== null && categoryId !== "";
  return useQuery(
    ["category-votes", awardId, categoryId],
    () =>
      votes
        .findAllByAwardAndCategory(awardId!, categoryId!)
        .then((r) => r.data ?? []),
    { enabled, staleTime: 15_000 }
  );
};

/**
 * Devolve todos os votos que o votante já tem em (prêmio), para a UI
 * saber em quais categorias ele ainda tem colocações disponíveis.
 */
export const useVoterVotesInAward = (awardId?: Id, voterId?: Id) => {
  const enabled =
    awardId !== undefined && awardId !== null && awardId !== "" &&
    voterId !== undefined && voterId !== null && voterId !== "";
  return useQuery(
    ["voter-votes-in-award", awardId, voterId],
    () => votes.fetchByAwardAndVoter(awardId!, voterId!).then((r) => r.data),
    { enabled, staleTime: 15_000 }
  );
};

export const useVoterSlots = (awardId?: Id, categoryId?: Id, voterId?: Id) => {
  const enabled =
    awardId !== undefined && awardId !== null && awardId !== "" &&
    categoryId !== undefined && categoryId !== null && categoryId !== "" &&
    voterId !== undefined && voterId !== null && voterId !== "";
  return useQuery(
    ["voter-slots", awardId, categoryId, voterId],
    () =>
      votes.findAllByAwardAndCategory(awardId!, categoryId!).then((r) => {
        const all = (r.data ?? []) as any[];
        return all.filter(
          (v) => (v.id_vote ?? v.participant?.id) === voterId
        );
      }),
    { enabled, staleTime: 15_000 }
  );
};

export const useRanking = (awardId?: Id, categoryId?: Id) =>
  useQuery(
    qk.ranking(awardId!, categoryId!),
    () => awards.fetchRanking(awardId!, categoryId!).then((r) => r.data),
    {
      enabled:
        awardId !== undefined &&
        awardId !== null &&
        awardId !== "" &&
        categoryId !== undefined &&
        categoryId !== null &&
        categoryId !== "",
      staleTime: 30_000,
      refetchOnWindowFocus: true,
    }
  );

/**
 * Ranking de todas as categorias do prêmio em uma única chamada. Evita
 * disparar N requests quando a tela precisa de uma visão geral.
 */
export const useAllRankings = (awardId?: Id) => {
  const enabled =
    awardId !== undefined && awardId !== null && awardId !== "";
  return useQuery(
    ["awards", awardId, "rankings"],
    () => awards.fetchAllRankings(awardId!).then((r) => r.data.rankings),
    { enabled, staleTime: 30_000, refetchOnWindowFocus: true }
  );
};

export const useCategories = () =>
  useQuery(qk.categories, () => categories.fetch().then((r) => r.data));
export const usePublishers = () =>
  useQuery(qk.publishers, () => publishers.fetch().then((r) => r.data));
export const useArtists = () =>
  useQuery(qk.artists, () => artists.fetch().then((r) => r.data));
export const useDesigners = () =>
  useQuery(qk.designers, () => designers.fetch().then((r) => r.data));
export const useMechanisms = () =>
  useQuery(qk.mechanisms, () => mechanisms.fetch().then((r) => r.data));

export const useAwardCategories = () =>
  useQuery(qk.awardCategories, () =>
    awardCategories.fetch().then((r) => r.data)
  );
export const useAwardCategoriesByAward = (award?: Id) =>
  useQuery(
    qk.awardCategoriesByAward(award!),
    () => awardCategories.fetchByAward(award!).then((r) => r.data),
    { enabled: award !== undefined && award !== null && award !== "" }
  );

export const useParticipants = () =>
  useQuery(qk.participants, () => participants.fetch().then((r) => r.data));
export const useVotes = () =>
  useQuery(qk.votes, () => votes.fetch().then((r) => r.data));
