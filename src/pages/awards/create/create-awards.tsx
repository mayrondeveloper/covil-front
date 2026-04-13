import { useState, useCallback, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { create, fetchOne, update } from "../../../services/awards-service/awards-service";
import { fetch as fetchAllAwardsCategories } from "../../../services/awards-categories-service/awards-categories-service";
import { fetch as fetchAllGames } from "../../../services/game-service/game-service";
import { fetch as fetchAllParticipants } from "../../../services/participants-service/participants-service";
import Asynchronous from "../../../components/Form/Input/asynchronous/asynchronous";
import { useNotification } from "../../../hooks/use-notification";
import PageLayout from "../../../components/Layout/PageLayout";
import PageHeader from "../../../components/Layout/PageHeader";
import SectionCard from "../../../components/Layout/SectionCard";
import { ControlledTextField } from "../../../components/Form/Field/ControlledTextField";
import { FormRow, FormCol } from "../../../components/Form/Field/FormRow";
import FormActions from "../../../components/Form/Field/FormActions";
import ImageUpload from "../../../components/Form/Field/ImageUpload";

interface Ref {
  id: string;
  name: string;
}

const URL_REGEX = /^https?:\/\/.+/i;
const CURRENT_YEAR = new Date().getFullYear();

const initialDefaults = {
  name: "",
  created_by: "Admin",
  description: "",
  image: "",
  year: String(CURRENT_YEAR),
  id_game: [] as Ref[],
  id_award_categories: [] as Ref[],
  id_participant: [] as Ref[],
};

export const CreateAwards = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [resetField, setResetField] = useState(false);
  const [saving, setSaving] = useState(false);

  const [awardsCategories, setAwardsCategories] = useState<Ref[]>([]);
  const [participants, setParticipants] = useState<Ref[]>([]);
  const [games, setGames] = useState<Ref[]>([]);

  const [awardsCategoriesSel, setAwardsCategoriesSel] = useState<Ref[]>([]);
  const [participantsSel, setParticipantsSel] = useState<Ref[]>([]);
  const [gamesSel, setGamesSel] = useState<Ref[]>([]);

  const [defaultValues, setDefaultValues] = useState(initialDefaults);

  const { handleSubmit, control, reset, setValue } = useForm({ defaultValues });

  useEffect(() => {
    fetchAllGames().then((r: any) => setGames(r.data));
    fetchAllParticipants().then((r: any) => setParticipants(r.data));
    fetchAllAwardsCategories().then((r: any) => setAwardsCategories(r.data));
  }, []);

  const fetchExisting = useCallback(() => {
    if (!params.id) return;
    fetchOne(params.id!).then((r: any) => {
      const game = r.data.games.map((d: any) => d.game);
      const cats = r.data.awards_categories.map((d: any) => d.categories);
      const parts = r.data.participants.map((d: any) => d.participant);
      setDefaultValues((p) => ({ ...p, id_game: game, id_award_categories: cats, id_participant: parts }));
      setGamesSel(game);
      setAwardsCategoriesSel(cats);
      setParticipantsSel(parts);
      setValue("id_game", game);
      setValue("id_award_categories", cats);
      setValue("id_participant", parts);
      setValue("name", r.data.name);
      setValue("year", r.data.year);
      setValue("description", r.data.description ?? "");
      setValue("image", r.data.image ?? "");
    });
  }, [params.id, setValue]);

  useEffect(() => {
    fetchExisting();
  }, [fetchExisting]);

  const sendAward = (values: typeof defaultValues) => {
    setSaving(true);
    const { id_game: _g, id_award_categories: _c, id_participant: _p, ...rest } = values;
    const payload: any = {
      ...rest,
      id_game: gamesSel.map((g) => g.id),
      id_award_categories: awardsCategoriesSel.map((c) => c.id),
      id_voter: participantsSel.map((p) => p.id),
    };
    const op = params.id ? update(params.id, payload) : create(payload);
    op.then(() => {
      success(params.id ? "Prêmio atualizado!" : "Prêmio cadastrado!");
      if (params.id) {
        fetchExisting();
      } else {
        reset(initialDefaults);
        setGamesSel([]);
        setAwardsCategoriesSel([]);
        setParticipantsSel([]);
        setResetField((v) => !v);
      }
    })
      .catch(() => error("Não foi possível salvar o prêmio."))
      .finally(() => setSaving(false));
  };

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Premiação"
        title={params.id ? "Editar prêmio" : "Cadastrar prêmio"}
        subtitle="Defina o nome da edição e relacione categorias, jogos indicados e participantes votantes."
        crumbs={[
          { label: "Início", to: "/" },
          { label: "Prêmios", to: "/awards" },
          { label: params.id ? "Editar" : "Cadastrar" },
        ]}
      />

      <form onSubmit={handleSubmit(sendAward)} noValidate>
        <SectionCard title="Identificação" description="Nome da edição, ano e descrição.">
          <FormRow>
            <FormCol md={6}>
              <ControlledTextField
                control={control}
                name="name"
                label="Nome do prêmio"
                required
                rules={{ required: true, minLength: { value: 2, message: "Nome muito curto" } }}
                placeholder="Ex.: Dragão de Ouro"
              />
            </FormCol>
            <FormCol md={3}>
              <ControlledTextField
                control={control}
                name="year"
                label="Ano"
                required
                type="number"
                inputProps={{ min: 2000, max: CURRENT_YEAR + 1 }}
                rules={{ required: true, min: 2000, max: CURRENT_YEAR + 1 }}
              />
            </FormCol>
            <FormCol md={3}>
              <ControlledTextField
                control={control}
                name="created_by"
                label="Criado por"
                disabled
              />
            </FormCol>
            <FormCol md={12}>
              <ControlledTextField
                control={control}
                name="description"
                label="Descrição"
                multiline
                minRows={2}
                placeholder="Texto curto sobre a edição."
              />
            </FormCol>
            <FormCol md={12}>
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value as string}
                    onChange={field.onChange}
                    folder="awards"
                    label="Banner do prêmio"
                    helperText="Opcional. Banner ou capa da edição. Máx 5MB."
                    height={220}
                    deleteOnRemove
                  />
                )}
              />
            </FormCol>
          </FormRow>
        </SectionCard>

        <SectionCard
          title="Vínculos"
          description="Quais jogos concorrem, em quais categorias e quem irá votar."
        >
          <FormRow>
            <FormCol md={12}>
              <Asynchronous
                control={control}
                data={awardsCategories}
                setData={setAwardsCategoriesSel}
                resetField={resetField}
                name="id_award_categories"
                label="Categorias do prêmio"
                defaultValue={defaultValues.id_award_categories}
                helperText="Use Premiação → Categorias para criar novas."
              />
            </FormCol>
            <FormCol md={6}>
              <Asynchronous
                control={control}
                data={games}
                setData={setGamesSel}
                resetField={resetField}
                name="id_game"
                label="Jogos indicados"
                defaultValue={defaultValues.id_game}
              />
            </FormCol>
            <FormCol md={6}>
              <Asynchronous
                control={control}
                data={participants}
                setData={setParticipantsSel}
                resetField={resetField}
                name="id_participant"
                label="Participantes (votantes)"
                defaultValue={defaultValues.id_participant}
              />
            </FormCol>
          </FormRow>

          <FormActions
            submitLabel={params.id ? "Salvar alterações" : "Cadastrar prêmio"}
            saving={saving}
            onCancel={() => navigate("/awards")}
            cancelLabel="Voltar"
          />
        </SectionCard>
      </form>
    </PageLayout>
  );
};
