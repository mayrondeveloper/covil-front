import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { fetch, create } from "../../../services/game-service/game-service";
import { fetch as fetchAll } from "../../../services/categories-service/categories-service";
import { useEffect, useState, useCallback, Fragment } from "react";
import { useForm, Controller } from "react-hook-form";
import ResponsiveAppBar from "../../../components/AppBar/ResponsiveAppBar";
import Asynchronous from "../../../components/Form/Input/asynchronous/asynchronous";
import { numPlayers, player_age } from "./data/data";

interface Categories {
  id: string;
  name: string;
  image: [];
  video: [];
  link: [];
}

export const CreateGame = () => {
  const [games, setGames] = useState(null);
  const [categories, setCategories] = useState(null);
  const [resetField, setResetField] = useState(false);
  const [categoriesSelecionadas, setCategoriesSelecionadas] = useState([]);
  const [, setLoading] = useState(false);

  useEffect(() => {
    if (games) return;
    fetchGames();
  }, [games]);

  useEffect(() => {
    if (categories) return;
    fetchCategories();
  }, [categories]);

  const fetchGames = useCallback(() => {
    fetch()
      .then((r: any) => setGames(r.data))
      .catch((error: Error) => console.log(error));
  }, []);

  const fetchCategories = useCallback(() => {
    fetchAll()
      .then((r: any) => setCategories(r.data))
      .catch((error: Error) => console.log(error));
  }, []);

  const sendGame = (data: any) => {
    setLoading(true);
    const categoriasArr = categoriesSelecionadas.map(
      (category: Categories) => category.id
    );
    const newData = {
      ...data,
      id_category: categoriasArr,
    };
    create(newData)
      .then((r) => {
        fetchGames();
        resetAsyncForm();
        setResetField(!resetField);
      })
      .catch((error) => setLoading(false));
  };

  // FORM
  const { handleSubmit, control, formState, reset } = useForm({
    defaultValues: {
      name: "",
      description: "",
      num_players: "",
      player_age: "",
      playing_time: "",
      price: 0,
      weight: "",
      year_published: "",
      id_category: [],
    },
  });

  const { errors } = formState;

  const resetAsyncForm = useCallback(async () => {
    reset({
      name: "",
      description: "",
      num_players: "",
      player_age: "",
      playing_time: "",
      price: 0,
      weight: "",
      year_published: "",
      id_category: [],
    });
  }, [reset]);

  return (
    <>
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
            Cadastrar jogo
          </Typography>

          <Box sx={{ marginTop: 4 }}>
            <form
              onSubmit={handleSubmit((data) => {
                sendGame(data);
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
                        label="Nome"
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
                  {" "}
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
                    control={control}
                  />
                </Box>
                <Box sx={{ width: "100%" }}>
                  {" "}
                  <Controller
                    render={({ field }: any) => (
                      <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">
                          Num. Jogadores
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          variant="outlined"
                          label="Num. Jogadores"
                          {...field}
                        >
                          {numPlayers.map((players, index) => {
                            return (
                              <MenuItem key={index} value={players}>
                                {players}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    )}
                    name="num_players"
                    control={control}
                  />
                </Box>
              </Stack>
              <Stack
                sx={{ margin: "20px 0" }}
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 1, sm: 2, md: 4 }}
              >
                <Box sx={{ width: "100%" }}>
                  <Controller
                    render={({ field }: any) => (
                      <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">
                          Idade mínima
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          variant="outlined"
                          label="Idade mínima"
                          {...field}
                        >
                          {player_age.map((age, index) => {
                            return (
                              <MenuItem key={index} value={age}>
                                {age}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    )}
                    name="player_age"
                    control={control}
                  />
                </Box>
                <Box sx={{ width: "100%" }}>
                  {" "}
                  <Controller
                    render={({ field }: any) => (
                      <TextField
                        size={"small"}
                        sx={{ width: "100%" }}
                        label="Tempo de jogo"
                        variant="outlined"
                        {...field}
                      />
                    )}
                    name="playing_time"
                    control={control}
                  />
                </Box>
                <Box sx={{ width: "100%" }}>
                  {" "}
                  <Controller
                    render={({ field }: any) => (
                      <TextField
                        size={"small"}
                        sx={{ width: "100%" }}
                        label="Preço BRL"
                        variant="outlined"
                        {...field}
                      />
                    )}
                    name="price"
                    control={control}
                  />
                </Box>
                <Box sx={{ width: "100%" }}>
                  <Controller
                    render={({ field }: any) => (
                      <TextField
                        size={"small"}
                        sx={{ width: "100%" }}
                        label="Peso"
                        variant="outlined"
                        {...field}
                      />
                    )}
                    name="weight"
                    control={control}
                  />
                </Box>
                <Box sx={{ width: "100%" }}>
                  {" "}
                  <Controller
                    render={({ field }: any) => (
                      <TextField
                        size={"small"}
                        sx={{ width: "100%" }}
                        label="Ano de publicação"
                        variant="outlined"
                        {...field}
                      />
                    )}
                    name="year_published"
                    control={control}
                  />
                </Box>
              </Stack>

              <Stack>
                <Asynchronous
                  control={control}
                  setCategoriesSelecionadas={setCategoriesSelecionadas}
                  resetField={resetField}
                />
              </Stack>

              <Box sx={{ marginTop: 2 }}>
                <Button type="submit" variant="contained" color={"secondary"}>
                  Enviar
                </Button>
              </Box>
            </form>
          </Box>
        </Paper>
      </Box>
    </>
  );
};
