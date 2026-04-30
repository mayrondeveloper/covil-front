export interface BaseEntity {
  id: string | number;
  name?: string;
}

export type Id = string | number;

export interface Game extends BaseEntity {
  name: string;
  image?: unknown;
  video?: unknown;
  link?: unknown;
  categories?: BaseEntity[];
  publishers?: BaseEntity[];
  designers?: BaseEntity[];
  mechanisms?: BaseEntity[];
  [key: string]: unknown;
}

export interface Award extends BaseEntity {
  name: string;
  [key: string]: unknown;
}

export interface AwardCategory extends BaseEntity {
  name: string;
  award?: Id;
  [key: string]: unknown;
}

export interface Participant extends BaseEntity {
  name: string;
  [key: string]: unknown;
}

export interface Vote extends BaseEntity {
  [key: string]: unknown;
}

export type NamedEntity = BaseEntity & { name: string };

export interface ScoringPlace {
  value: string;
  label: string;
  points: number;
}

export interface ScoringScheme {
  places: ScoringPlace[];
  tiebreakers: string[]; // ex: ["firsts", "seconds", "thirds"]
  rules: {
    unique_place_per_voter_per_category: boolean;
    unique_game_per_voter_per_category: boolean;
    [k: string]: boolean | undefined;
  };
}

export interface RankingEntry {
  position: number;
  /** True quando o jogo empata (pontos + todos os tiebreakers) com vizinho acima ou abaixo. */
  tied?: boolean;
  game: BaseEntity & { name: string; image?: string };
  total_points: number;
  breakdown: { firsts: number; seconds: number; thirds: number; [k: string]: number };
  voters: { id: Id; name: string; place: string }[];
}

export interface RankingResponse {
  category?: BaseEntity & {
    name: string;
    background_image?: string | null;
    background_image_first?: string | null;
    background_image_second?: string | null;
    background_image_third?: string | null;
  };
  ranking: RankingEntry[];
}

export interface PageParams {
  page?: number;
  limit?: number;
  q?: string;
  orderBy?: string;
  order?: "asc" | "desc";
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
