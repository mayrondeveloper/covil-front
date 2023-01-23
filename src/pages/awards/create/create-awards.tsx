import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { create, fetch } from "../../../services/awards-service/awards-service";
import { fetch as fetchAllAwardsCategories } from "../../../services/awards-categories-service/awards-categories-service";
import { fetch as fetchAllGames } from "../../../services/game-service/game-service";
import { fetch as fetchAllParticipants } from "../../../services/participants-service/participants-service";
import { useState, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import ResponsiveAppBar from "../../../components/AppBar/ResponsiveAppBar";
import DrawerAwards from "../../../components/Drawer/awards";
import EnchancedTableAwards from "../../../components/Table/enchanced-table/enchanced-table-awards";
import Asynchronous from "../../../components/Form/Input/asynchronous/asynchronous";

const defaultValues = {
  name: "Dragão de ouro",
  created_by: "Admin",
  description: "Melhor prêmio de divinópolis",
  image: "",
  year: "2023",
  id_game: [],
  id_award_categories: [],
  id_participant: [],
};

export const CreateAwards = () => {
  const [resetField, setResetField] = useState(false);
  const [, setLoading] = useState(false);
  const [awardsCategories, setAwardsCategories] = useState([]);
  const [awardsCategoriesSelecionads, setAwardsCategoriesSelecionads] =
    useState([]);
  const [carregar, setCarregar] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [participantsSelecionados, setParticipantsSelecionados] = useState([]);
  const [games, setGames] = useState([]);
  const [gamesSelecionados, setGamesSelecionados] = useState([]);

  useEffect(() => {
    if (games.length) return;
    fetchGames();
  }, []);

  const fetchGames = useCallback(() => {
    fetchAllGames()
      .then((r: any) => setGames(r.data))
      .catch((error: Error) => console.log(error));
  }, []);

  useEffect(() => {
    if (participants.length) return;
    fetchParticipants();
  }, []);

  const fetchParticipants = useCallback(() => {
    fetchAllParticipants()
      .then((r: any) => setParticipants(r.data))
      .catch((error: Error) => console.log(error));
  }, []);

  useEffect(() => {
    if (awardsCategories.length) return;
    fetchAwardsCategories();
  }, []);

  const fetchAwardsCategories = useCallback(() => {
    fetchAllAwardsCategories()
      .then((r: any) => setAwardsCategories(r.data))
      .catch((error: Error) => console.log(error));
  }, []);

  const sendAward = (data: any) => {
    setLoading(true);
    const awardsCategoriesArr = awardsCategoriesSelecionads.map(
      (data: { id: string }) => data.id
    );
    const participantsArr = participantsSelecionados.map(
      (data: { id: string }) => data.id
    );
    const gamesArr = gamesSelecionados.map((data: { id: string }) => data.id);
    const newData = {
      ...data,
      id_game: gamesArr,
      id_award_categories: awardsCategoriesArr,
      id_voter: participantsArr,
    };
    create(newData)
      .then((r) => {
        fetchAwards();
        resetAsyncForm();
        setResetField(!resetField);
      })
      .catch((error) => setLoading(false));
  };

  // FORM

  const { handleSubmit, control, formState, reset } = useForm({
    defaultValues,
  });
  const { errors } = formState;

  const resetAsyncForm = useCallback(async () => reset(defaultValues), [reset]);
  const [awards, setAwards] = useState(null);

  useEffect(() => {
    if (awards) return;
    fetchAwards();
  }, [awards]);

  const fetchAwards = useCallback(() => {
    fetch()
      .then((r: any) => setAwards(r.data))
      .catch((error: Error) => console.log(error));
  }, []);

  return (
    <>
      <ResponsiveAppBar />
      <Box
        sx={{
          padding: 0,
          display: "flex",
          flexDirection: "row",
          height: "calc(100vh - 69px)",
        }}
      >
        <DrawerAwards />
        <Paper elevation={0} sx={{ padding: "30px 20px", width: "100%" }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontFamily: "Roboto", fontWeight: 600 }}
          >
            Cadastrar prêmio
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
                        label="Nome do prêmio"
                        variant="outlined"
                        {...field}
                      />
                    )}
                    name="name"
                    rules={{ required: true }}
                    control={control}
                  />
                  {errors.name?.type === "required" && (
                    <Typography
                      role="alert"
                      color={"error"}
                      sx={{ fontSize: "12px" }}
                    >
                      Campo obrigatório
                    </Typography>
                  )}
                </Box>
                <Box sx={{ width: "100%" }}>
                  <Controller
                    render={({ field }: any) => (
                      <TextField
                        size={"small"}
                        sx={{ width: "100%" }}
                        label="Criado por"
                        variant="outlined"
                        disabled
                        {...field}
                      />
                    )}
                    name="created_by"
                    rules={{ required: true }}
                    control={control}
                  />
                  {errors.created_by?.type === "required" && (
                    <Typography
                      role="alert"
                      color={"error"}
                      sx={{ fontSize: "12px" }}
                    >
                      Campo obrigatório
                    </Typography>
                  )}
                </Box>
                <Box sx={{ width: "100%" }}>
                  <Controller
                    render={({ field }: any) => (
                      <TextField
                        size={"small"}
                        sx={{ width: "100%" }}
                        label="Descrição"
                        variant="outlined"
                        {...field}
                      />
                    )}
                    name="description"
                    rules={{ required: true }}
                    control={control}
                  />
                  {errors.description?.type === "required" && (
                    <Typography
                      role="alert"
                      color={"error"}
                      sx={{ fontSize: "12px" }}
                    >
                      Campo obrigatório
                    </Typography>
                  )}
                </Box>
                <Box sx={{ width: "100%" }}>
                  <Controller
                    render={({ field }: any) => (
                      <TextField
                        size={"small"}
                        sx={{ width: "100%" }}
                        label="Imagem"
                        variant="outlined"
                        disabled
                        {...field}
                      />
                    )}
                    name="image"
                    rules={{ required: false }}
                    control={control}
                  />
                  {errors.image?.type === "required" && (
                    <Typography
                      role="alert"
                      color={"error"}
                      sx={{ fontSize: "12px" }}
                    >
                      Campo obrigatório
                    </Typography>
                  )}
                </Box>
              </Stack>
              <Stack
                sx={{ marginTop: 4 }}
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 1, sm: 2, md: 4 }}
              >
                <Box sx={{ width: "100%" }}>
                  <Controller
                    render={({ field }: any) => (
                      <TextField
                        size={"small"}
                        sx={{ width: "100%" }}
                        label="Ano"
                        variant="outlined"
                        {...field}
                      />
                    )}
                    name="year"
                    rules={{ required: true }}
                    control={control}
                  />
                  {errors.year?.type === "required" && (
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
                  // multiple={false}
                  control={control}
                  data={games}
                  setData={setGamesSelecionados}
                  resetField={resetField}
                  name={"id_game"}
                  id={"id_game"}
                  label={"Jogos"}
                />
                <Asynchronous
                  // multiple={false}
                  control={control}
                  data={awardsCategories}
                  setData={setAwardsCategoriesSelecionads}
                  resetField={resetField}
                  name={"id_award_categories"}
                  id={"id_award_categories"}
                  label={"Categoria"}
                />
                <Asynchronous
                  // multiple={false}
                  control={control}
                  data={participants}
                  setData={setParticipantsSelecionados}
                  resetField={resetField}
                  name={"id_voter"}
                  id={"id_voter"}
                  label={"Participantes"}
                />
              </Stack>

              <Box sx={{ marginTop: 2 }}>
                <Button type="submit" variant="contained" color={"secondary"}>
                  Enviar
                </Button>
              </Box>
            </form>
            <Paper elevation={0} sx={{ marginTop: 6, width: "100%" }}>
              <Typography
                variant="h5"
                component="h1"
                sx={{ fontFamily: "Roboto", fontWeight: 600 }}
              >
                Prêmios
              </Typography>

              <Box sx={{ width: "100%" }}>
                <EnchancedTableAwards
                  data={awards}
                  setAwards={setAwards}
                  refresh={resetField}
                />
              </Box>
            </Paper>
          </Box>
        </Paper>
      </Box>
    </>
  );
};
