import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { create, fetch } from "../../../services/votes/votes-service";
import { useState, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import ResponsiveAppBar from "../../../components/AppBar/ResponsiveAppBar";
import EnchancedTableVotes from "../../../components/Table/enchanced-table/enchanced-table-votes";
import Asynchronous from "../../../components/Form/Input/asynchronous/asynchronous";
import { fetch as fetchCategories } from "../../../services/awards-categories-service/awards-categories-service";
import { fetch as fetchAllGames } from "../../../services/game-service/game-service";
import { fetch as fetchAllParticipants } from "../../../services/participants-service/participants-service";
import { fetch as fetchAllAwards } from "../../../services/awards-service/awards-service";
import PersistentDrawerLeft from "../../../components/wrapperDrawer/PersistentDrawerLeft";

const defaultValues = {
  place: "1",
  participant: [],
  category: [],
  game: [],
  id_award: [],
};

export const Votes = () => {
  const [resetField, setResetField] = useState(false);
  const [, setLoading] = useState(false);
  const [awards, setAwards] = useState([]);
  const [awardsSelecionadas, setAwardsSelecionadas] = useState<any>([]);
  const [categories, setCategories] = useState([]);
  const [categoriesSelecionadas, setCategoriesSelecionadas] = useState<any>([]);
  const [jogos, setJogos] = useState([]);
  const [jogosSelecionados, setJogosSelecionados] = useState<any>([]);
  const [participantes, setParticipantes] = useState([]);
  const [participantesSelecionados, setParticipantesSelecionados] =
    useState<any>([]);

  const sendAward = (data: any) => {
    setLoading(true);
    const newData = {
      place: data.place,
      id_vote: participantesSelecionados.id,
      id_category: categoriesSelecionadas.id,
      id_game: jogosSelecionados.id,
      id_award: awardsSelecionadas.id,
    };
    create(newData)
      .then(() => {
        fetchVotes();
        resetAsyncForm();
        setResetField(!resetField);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (awards.length) return;
    fetchAwards();
  }, []);

  const fetchAwards = useCallback(() => {
    fetchAllAwards()
      .then((r: any) => {
        setAwards(r.data);
      })
      .catch((error: Error) => console.log(error));
  }, []);

  useEffect(() => {
    if (categories.length) return;
    fetchCategory();
  }, []);

  const fetchCategory = useCallback(() => {
    fetchCategories()
      .then((r: any) => {
        setCategories(r.data);
      })
      .catch((error: Error) => console.log(error));
  }, []);

  useEffect(() => {
    if (jogos.length) return;
    fetchGames();
  }, []);

  const fetchGames = useCallback(() => {
    fetchAllGames()
      .then((r: any) => {
        setJogos(r.data);
      })
      .catch((error: Error) => console.log(error));
  }, []);

  useEffect(() => {
    if (participantes.length) return;
    fetchParticipants();
  }, []);

  const fetchParticipants = useCallback(() => {
    fetchAllParticipants()
      .then((r: any) => {
        setParticipantes(r.data);
      })
      .catch((error: Error) => console.log(error));
  }, []);

  // FORM
  const [data, setData] = useState(null);

  const { handleSubmit, control, formState, reset } = useForm({
    defaultValues,
  });
  const { errors } = formState;

  const resetAsyncForm = useCallback(async () => reset(defaultValues), [reset]);

  useEffect(() => {
    if (data) return;
    fetchVotes();
  }, [data]);

  const fetchVotes = useCallback(() => {
    fetch()
      .then((r: any) => setData(r.data))
      .catch((error: Error) => console.log(error));
  }, []);

  return (
    <PersistentDrawerLeft>
      <Box
        sx={{
          padding: 0,
          display: "flex",
          flexDirection: "row",
          height: "calc(100vh - 112px)",
        }}
      >
        <Paper elevation={0} sx={{ padding: "30px 20px", width: "100%" }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontFamily: "Roboto", fontWeight: 600 }}
          >
            Cadastrar voto
          </Typography>

          <Box sx={{ marginTop: 4 }}>
            <form
              onSubmit={handleSubmit((data) => {
                sendAward(data);
              })}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 1, sm: 2, md: 4 }}
              >
                <Box sx={{ width: "100%" }}>
                  <Controller
                    render={({ field }: any) => (
                      <TextField
                        size={"small"}
                        sx={{ width: "100%" }}
                        label="Colocação"
                        variant="outlined"
                        {...field}
                      />
                    )}
                    name="place"
                    rules={{ required: true }}
                    control={control}
                  />
                  {errors.place?.type === "required" && (
                    <Typography
                      role="alert"
                      color={"error"}
                      sx={{ fontSize: "12px" }}
                    >
                      Campo obrigatório
                    </Typography>
                  )}
                </Box>
                <Asynchronous
                  multiple={false}
                  control={control}
                  data={awards}
                  setData={setAwardsSelecionadas}
                  resetField={resetField}
                  name={"id_award"}
                  id={"id_award"}
                  label={"Prêmio"}
                />
                <Asynchronous
                  multiple={false}
                  control={control}
                  data={categories}
                  setData={setCategoriesSelecionadas}
                  resetField={resetField}
                  name={"category"}
                  id={"category"}
                  label={"Categoria"}
                />
              </Stack>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 1, sm: 2, md: 4 }}
                sx={{ marginTop: 4 }}
              >
                <Asynchronous
                  multiple={false}
                  control={control}
                  data={jogos}
                  setData={setJogosSelecionados}
                  resetField={resetField}
                  name={"game"}
                  id={"game"}
                  label={"Jogo"}
                />
                <Asynchronous
                  multiple={false}
                  control={control}
                  data={participantes}
                  setData={setParticipantesSelecionados}
                  resetField={resetField}
                  name={"participant"}
                  id={"participant"}
                  label={"Participantes"}
                />
                <Box sx={{ width: "100%" }}>
                  <Button type="submit" variant="contained" color={"secondary"}>
                    Enviar
                  </Button>
                </Box>
              </Stack>
            </form>
            <Paper elevation={0} sx={{ marginTop: 6, width: "100%" }}>
              <Typography
                variant="h5"
                component="h1"
                sx={{ fontFamily: "Roboto", fontWeight: 600 }}
              >
                Votos
              </Typography>

              <Box sx={{ width: "100%" }}>
                <EnchancedTableVotes
                  data={data}
                  setData={setData}
                  refresh={resetField}
                />
              </Box>
            </Paper>
          </Box>
        </Paper>
      </Box>
    </PersistentDrawerLeft>
  );
};
