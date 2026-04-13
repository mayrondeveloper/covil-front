import { useState, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import {
  create,
  fetchOne,
  update,
} from "../../../services/game-service/game-service";
import Asynchronous from "../../../components/Form/Input/asynchronous/asynchronous";
import { player_age } from "./data/data";
import { fetch as fetchAllCategories } from "../../../services/categories-service/categories-service";
import { fetch as fetchAllDesigners } from "../../../services/designers-service/designers-service";
import { fetch as fetchAllPublishers } from "../../../services/publishers-service/publishers-service";
import { fetch as fetchAllMechanisms } from "../../../services/mechanisms-service/mechanisms-service";
import {
  addGames,
  fetch as fetchAllAwards,
} from "../../../services/awards-service/awards-service";
import { useNavigate, useParams } from "react-router-dom";
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
  description: "",
  num_players: "",
  player_age: "",
  playing_time: "",
  image: "",
  price: 0,
  weight: "",
  year_published: "",
  id_category: [] as Ref[],
  id_publisher: [] as Ref[],
  id_design: [] as Ref[],
  id_mechanisms: [] as Ref[],
};

export const CreateGame = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { success, error } = useNotification();

  const [categories, setCategories] = useState<Ref[]>([]);
  const [designers, setDesigners] = useState<Ref[]>([]);
  const [publishers, setPublishers] = useState<Ref[]>([]);
  const [mechanisms, setMechanisms] = useState<Ref[]>([]);

  const [categoriesSel, setCategoriesSel] = useState<Ref[]>([]);
  const [publishersSel, setPublishersSel] = useState<Ref[]>([]);
  const [designersSel, setDesignersSel] = useState<Ref[]>([]);
  const [mechanismsSel, setMechanismsSel] = useState<Ref[]>([]);

  const [awards, setAwards] = useState<Ref[]>([]);
  const [selectedAwards, setSelectedAwards] = useState<Ref[]>([]);

  const [resetField, setResetField] = useState(false);
  const [saving, setSaving] = useState(false);
  const [defaultValues, setDefaultValues] = useState(initialDefaults);

  const { handleSubmit, control, reset, setValue } = useForm({ defaultValues });

  useEffect(() => {
    fetchAllAwards().then((r: any) => setAwards(r.data));
    fetchAllCategories().then((r: any) => setCategories(r.data));
    fetchAllDesigners().then((r: any) => setDesigners(r.data));
    fetchAllPublishers().then((r: any) => setPublishers(r.data));
    fetchAllMechanisms().then((r: any) => setMechanisms(r.data));
  }, []);

  const fetchExisting = useCallback(() => {
    if (!params.id) return;
    fetchOne(params.id).then((r: any) => {
      const cats = r.data.categories.map((d: any) => d.category);
      const pubs = r.data.publishers.map((d: any) => d.publisher);
      const desg = r.data.designers.map((d: any) => d.design);
      const mech = r.data.mechanisms.map((d: any) => d.mechanism);
      setDefaultValues((p) => ({
        ...p,
        id_category: cats,
        id_publisher: pubs,
        id_design: desg,
        id_mechanisms: mech,
      }));
      setCategoriesSel(cats);
      setPublishersSel(pubs);
      setDesignersSel(desg);
      setMechanismsSel(mech);
      setValue("id_category", cats);
      setValue("id_publisher", pubs);
      setValue("id_design", desg);
      setValue("id_mechanisms", mech);
      setValue("name", r.data.name);
      setValue("image", r.data.image ?? "");
      setValue("weight", r.data.weight ?? "");
      setValue("price", r.data.price ?? 0);
      setValue("playing_time", r.data.playing_time ?? "");
      setValue("year_published", r.data.year_published ?? "");
      setValue("player_age", r.data.player_age ?? "");
      setValue("num_players", r.data.num_players ?? "");
      setValue("description", r.data.description ?? "");
    });
  }, [params.id, setValue]);

  useEffect(() => {
    fetchExisting();
  }, [fetchExisting]);

  const sendGame = async (values: typeof defaultValues) => {
    setSaving(true);
    const {
      id_category: _ic,
      id_publisher: _ip,
      id_design: _id,
      id_mechanisms: _im,
      ...rest
    } = values;
    const payload: any = {
      ...rest,
      id_category: categoriesSel.map((c) => c.id),
      id_design: designersSel.map((d) => d.id),
      id_publisher: publishersSel.map((p) => p.id),
      id_mechanisms: mechanismsSel.map((m) => m.id),
    };

    try {
      const r = params.id ? await update(params.id, payload) : await create(payload);
      const newGameId = (r.data as any)?.id ?? params.id;

      // Vincula a prêmios selecionados (somente em create)
      if (!params.id && newGameId && selectedAwards.length > 0) {
        const results = await Promise.allSettled(
          selectedAwards.map((a) => addGames(a.id, [newGameId]))
        );
        const failed = results.filter((res) => res.status === "rejected").length;
        if (failed === 0) {
          success(
            `Jogo cadastrado e vinculado a ${selectedAwards.length} ${
              selectedAwards.length === 1 ? "prêmio" : "prêmios"
            }.`
          );
        } else {
          success(
            `Jogo cadastrado, mas ${failed} de ${selectedAwards.length} vínculos com prêmios falharam.`
          );
        }
      } else {
        success(params.id ? "Jogo atualizado!" : "Jogo cadastrado!");
      }

      if (params.id) {
        fetchExisting();
      } else {
        navigate("/game");
      }
    } catch {
      error("Não foi possível salvar o jogo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Catálogo"
        title={params.id ? "Editar jogo" : "Cadastrar jogo"}
        subtitle="Categorias, editoras, designers e mecânicas vêm dos cadastros de referência. Crie-os antes se ainda não existirem."
        crumbs={[
          { label: "Início", to: "/" },
          { label: "Jogos", to: "/game" },
          { label: params.id ? "Editar" : "Cadastrar" },
        ]}
      />

      <form onSubmit={handleSubmit(sendGame)} noValidate>
        <SectionCard
          title="Identificação"
          description="Nome, descrição e imagem que aparecerão na ficha do jogo."
        >
          <FormRow>
            <FormCol md={6}>
              <ControlledTextField
                control={control}
                name="name"
                label="Nome"
                required
                rules={{ required: true, minLength: { value: 2, message: "Nome muito curto" } }}
                placeholder="Ex.: Wingspan"
              />
            </FormCol>
            <FormCol md={6}>
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value as string}
                    onChange={field.onChange}
                    folder="games"
                    label="Capa do jogo"
                    helperText="Capa quadrada de preferência. Máx 5MB."
                    deleteOnRemove
                  />
                )}
              />
            </FormCol>
            <FormCol md={12}>
              <ControlledTextField
                control={control}
                name="description"
                label="Descrição"
                multiline
                minRows={3}
                placeholder="Resumo curto sobre o jogo, mecânicas centrais e diferencial."
              />
            </FormCol>
          </FormRow>
        </SectionCard>

        <SectionCard title="Sessão" description="Quantos jogadores, faixa etária, duração e ano.">
          <FormRow>
            <FormCol md={3}>
              <ControlledTextField
                control={control}
                name="num_players"
                label="N° de jogadores"
                placeholder="Ex.: 1-5"
              />
            </FormCol>
            <FormCol md={3}>
              <Controller
                name="player_age"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel id="age-label">Idade mínima</InputLabel>
                    <Select labelId="age-label" label="Idade mínima" {...field}>
                      <MenuItem value=""><em>—</em></MenuItem>
                      {player_age.map((age, i) => (
                        <MenuItem key={i} value={age}>
                          {age}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </FormCol>
            <FormCol md={3}>
              <ControlledTextField
                control={control}
                name="playing_time"
                label="Tempo de jogo"
                placeholder="Ex.: 60-90 min"
              />
            </FormCol>
            <FormCol md={3}>
              <ControlledTextField
                control={control}
                name="year_published"
                label="Ano de publicação"
                type="number"
                placeholder="Ex.: 2019"
                inputProps={{ min: 1900, max: CURRENT_YEAR + 1 }}
                rules={{
                  min: { value: 1900, message: "Ano inválido" },
                  max: { value: CURRENT_YEAR + 1, message: "Ano no futuro distante" },
                }}
              />
            </FormCol>
          </FormRow>
          <Box sx={{ mt: 2 }}>
            <FormRow>
              <FormCol md={6}>
                <ControlledTextField
                  control={control}
                  name="price"
                  label="Preço (R$)"
                  type="number"
                  placeholder="Ex.: 299.90"
                  inputProps={{ min: 0, step: 0.01 }}
                  rules={{ min: { value: 0, message: "Não pode ser negativo" } }}
                />
              </FormCol>
              <FormCol md={6}>
                <ControlledTextField
                  control={control}
                  name="weight"
                  label="Peso (kg)"
                  placeholder="Ex.: 1.8"
                />
              </FormCol>
            </FormRow>
          </Box>
        </SectionCard>

        <SectionCard
          title="Referências"
          description="Vincule a entidades já cadastradas. Crie novas em Catálogo se faltar alguma."
        >
          <FormRow>
            <FormCol md={6}>
              <Asynchronous
                name="id_category"
                label="Categorias"
                control={control}
                data={categories}
                setData={setCategoriesSel}
                resetField={resetField}
                defaultValue={defaultValues.id_category}
              />
            </FormCol>
            <FormCol md={6}>
              <Asynchronous
                name="id_publisher"
                label="Editoras"
                control={control}
                data={publishers}
                setData={setPublishersSel}
                resetField={resetField}
                defaultValue={defaultValues.id_publisher}
              />
            </FormCol>
            <FormCol md={6}>
              <Asynchronous
                name="id_design"
                label="Designers"
                control={control}
                data={designers}
                setData={setDesignersSel}
                resetField={resetField}
                defaultValue={defaultValues.id_design}
              />
            </FormCol>
            <FormCol md={6}>
              <Asynchronous
                name="id_mechanisms"
                label="Mecânicas"
                control={control}
                data={mechanisms}
                setData={setMechanismsSel}
                resetField={resetField}
                defaultValue={defaultValues.id_mechanisms}
              />
            </FormCol>
          </FormRow>
        </SectionCard>

        {!params.id && (
          <SectionCard
            title="Indicar a um prêmio (opcional)"
            description="Já vincule este jogo a uma ou mais edições da premiação. Você também pode fazer isso depois pela tela do prêmio."
          >
            <Asynchronous
              multiple
              control={control as any}
              data={awards}
              setData={setSelectedAwards}
              name={"_awards" as any}
              label="Edições do prêmio"
              helperText="Após salvar, o jogo entra na lista de indicados destas edições."
            />
          </SectionCard>
        )}

        <FormActions
          submitLabel={
            !params.id && selectedAwards.length > 0
              ? `Cadastrar e indicar a ${selectedAwards.length} ${
                  selectedAwards.length === 1 ? "prêmio" : "prêmios"
                }`
              : params.id
              ? "Salvar alterações"
              : "Cadastrar jogo"
          }
          saving={saving}
          onCancel={() => navigate("/game")}
          cancelLabel="Voltar"
        />
      </form>
    </PageLayout>
  );
};
