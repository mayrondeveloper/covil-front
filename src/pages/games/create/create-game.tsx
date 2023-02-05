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
import { create, fetch } from "../../../services/game-service/game-service";
import { useState, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import ResponsiveAppBar from "../../../components/AppBar/ResponsiveAppBar";
import Asynchronous from "../../../components/Form/Input/asynchronous/asynchronous";
import DrawerCovil from "../../../components/Drawer/drawer";
import { numPlayers, player_age } from "./data/data";
import EnhancedTable from "../../../components/Table/enchanced-table/enchanced-table";
import { fetch as fetchAllCategories } from "../../../services/categories-service/categories-service";
import { fetch as fetchAllDesigners } from "../../../services/designers-service/designers-service";
import { fetch as fetchAllPublishers } from "../../../services/publishers-service/publishers-service";
import { fetch as fetchAllMechanisms } from "../../../services/mechanisms-service/mechanisms-service";
import PersistentDrawerLeft from "../../../components/wrapperDrawer/PersistentDrawerLeft";

interface Categories {
  id: string;
  name: string;
  image: [];
  video: [];
  link: [];
}

export const CreateGame = () => {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [designers, setDesigners] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [mechanisms, setMechanisms] = useState([]);
  const [resetField, setResetField] = useState(false);
  const [categoriesSelecionadas, setCategoriesSelecionadas] = useState([]);
  const [publishersSelecionadas, setPublishersSelecionadas] = useState([]);
  const [designersSelecionadas, setDesignersSelecionadas] = useState([]);
  const [mechanismsSelecionadas, setMechanismsSelecionadas] = useState([]);
  const [, setLoading] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = useCallback(() => {
    fetch()
      .then((r: any) => setGames(r.data))
      .catch((error: Error) => console.log(error));
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = useCallback(() => {
    fetchAllCategories()
      .then((r: any) => setCategories(r.data))
      .catch((error: Error) => console.log(error));
  }, []);

  useEffect(() => {
    fetchDesigners();
  }, []);

  const fetchDesigners = useCallback(() => {
    fetchAllDesigners()
      .then((r: any) => setDesigners(r.data))
      .catch((error: Error) => console.log(error));
  }, []);

  useEffect(() => {
    fetchPublishers();
  }, []);

  const fetchPublishers = useCallback(() => {
    fetchAllPublishers()
      .then((r: any) => setPublishers(r.data))
      .catch((error: Error) => console.log(error));
  }, []);

  useEffect(() => {
    fetchMechanisms();
  }, []);

  const fetchMechanisms = useCallback(() => {
    fetchAllMechanisms()
      .then((r: any) => setMechanisms(r.data))
      .catch((error: Error) => console.log(error));
  }, []);

  const sendGame = (data: any) => {
    setLoading(true);
    const categoriasArr = categoriesSelecionadas.map(
      (category: Categories) => category.id
    );
    const publishersArr = publishersSelecionadas.map(
      (publisher: Categories) => publisher.id
    );
    const designersArr = designersSelecionadas.map(
      (designers: Categories) => designers.id
    );
    const mechanismsArr = mechanismsSelecionadas.map(
      (mechanisms: Categories) => mechanisms.id
    );
    const newData = {
      ...data,
      id_category: categoriasArr,
      id_design: designersArr,
      id_publisher: publishersArr,
      id_mechanisms: mechanismsArr,
    };
    create(newData)
      .then(() => {
        fetchGames();
        resetAsyncForm();
        setResetField(!resetField);
      })
      .catch(() => setLoading(false));
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
    <PersistentDrawerLeft>
      <Box
        sx={{
          padding: 0,
          display: "flex",
          flexDirection: "row",
          height: "calc(100vh - 112px)",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: "0",
            padding: "30px 20px",
            width: "100%",
            height: "100vh",
          }}
        >
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
                        <InputLabel
                          id="demo-simple-select-label"
                          sx={{ lineHeight: "0.5em", overflow: "visible" }}
                        >
                          Num. Jogadores
                        </InputLabel>
                        <Select
                          size={"small"}
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
                        <InputLabel
                          id="demo-simple-select-label"
                          sx={{ lineHeight: "0.5em", overflow: "visible" }}
                        >
                          Idade mínima
                        </InputLabel>
                        <Select
                          size={"small"}
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

              <Stack
                sx={{ margin: "20px 0" }}
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 1, sm: 2, md: 4 }}
              >
                <Asynchronous
                  id={"id_category"}
                  name={"id_category"}
                  label={"Categorias"}
                  control={control}
                  data={categories}
                  setData={setCategoriesSelecionadas}
                  resetField={resetField}
                />
                <Asynchronous
                  id={"id_publisher"}
                  name={"id_publisher"}
                  label={"Editoras"}
                  data={publishers}
                  control={control}
                  setData={setPublishersSelecionadas}
                  resetField={resetField}
                />

                <Asynchronous
                  id={"id_design"}
                  name={"id_design"}
                  label={"Designer"}
                  control={control}
                  data={designers}
                  setData={setDesignersSelecionadas}
                  resetField={resetField}
                />
                <Asynchronous
                  id={"id_mechanisms"}
                  name={"id_mechanisms"}
                  label={"Mecânicas"}
                  control={control}
                  data={mechanisms}
                  setData={setMechanismsSelecionadas}
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
          <Paper elevation={0} sx={{ marginTop: 4, width: "100%" }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontFamily: "Roboto", fontWeight: 600 }}
            >
              Jogos
            </Typography>

            <Box sx={{ marginTop: 4, width: "100%" }}>
              <EnhancedTable data={games} setGames={setGames} />
            </Box>
          </Paper>
        </Paper>
      </Box>
    </PersistentDrawerLeft>
  );
};
