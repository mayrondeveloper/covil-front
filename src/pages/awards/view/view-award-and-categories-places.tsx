import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { findAllByAwardAndCategory } from "../../../services/game-service/game-service";
import React, { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import ResponsiveAppBar from "../../../components/AppBar/ResponsiveAppBar";
import Asynchronous from "../../../components/Form/Input/asynchronous/asynchronous";
import { fetch as fetchCategories } from "../../../services/awards-categories-service/awards-categories-service";
import { fetch as fetchAllAwards } from "../../../services/awards-service/awards-service";
import EnchancedTableAwardsCategoriesPlace from "../../../components/Table/enchanced-table/enchanced-table-awards-categories-place";
import PersistentDrawerLeft from "../../../components/wrapperDrawer/PersistentDrawerLeft";
import DataGridDefaultWiners from "./DataGridWiners";
import CardGame from "../../../components/CardGame/CardGame";
import { Link } from "react-router-dom";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const defaultValues = {
  place: "1",
  participant: [],
  category: [],
  game: [],
  id_award: [],
};

export const ViewAwardAndCategoryPlaces = () => {
  const [resetField, setResetField] = useState(false);
  const [, setLoading] = useState(false);
  const [awards, setAwards] = useState([]);
  const [awardsSelecionadas, setAwardsSelecionadas] = useState<any>([]);
  const [categories, setCategories] = useState([]);
  const [categoriesSelecionadas, setCategoriesSelecionadas] = useState<any>([]);

  const sendAward = (data: any) => {
    setLoading(true);
    findAllByAwardAndCategory(awardsSelecionadas.id, categoriesSelecionadas.id)
      .then((r) => {
        setData(r.data);
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

  // FORM
  const [data, setData] = useState([] || null);

  const { handleSubmit, control, formState, reset } = useForm({
    defaultValues,
  });
  const { errors } = formState;

  const resetAsyncForm = useCallback(async () => reset(defaultValues), [reset]);

  const [colocation, setColocation] = useState<any>([] || null);

  useEffect(() => {
    const row = data?.map((dt: any) => {
      const votes = dt.votes.map(
        (vote: any) => `${vote.place}° (${vote.participant.name})`
      );
      const totalVotos = dt.votes.map((vote: any) => Number(vote.value_vote));
      let sum = totalVotos.reduce(function (soma: number, i: number) {
        return soma + i;
      });
      return {
        id: dt.id,
        game: dt.name,
        votes: votes.join(" , "),
        total: sum,
      };
    });
    setColocation(row.sort((a, b) => b.total - a.total).slice(0, 3));
  }, [data]);

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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: "12px",
              marginBottom: 4,
            }}
          >
            <Link to={"/"} style={{ textDecoration: "none", color: "#212121" }}>
              Home
            </Link>
            <ChevronRightIcon sx={{ fontSize: "18px" }} />
            <Link
              to={"/game"}
              style={{ textDecoration: "none", color: "#212121" }}
            >
              Listar jogo vencedor por prêmio e categoria
            </Link>
          </Box>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontFamily: "Roboto", fontWeight: 600 }}
          >
            Listar prêmio
          </Typography>

          <Box sx={{ marginTop: 4 }}>
            <form
              onSubmit={handleSubmit((data) => {
                sendAward(data);
              })}
            >
              <Stack
                // sx={{ maxWidth: 600 }}
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 1, sm: 2, md: 4 }}
              >
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
                <Box sx={{ marginTop: 2, height: "50px" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color={"secondary"}
                    sx={{ height: "40px" }}
                  >
                    Buscar
                  </Button>
                </Box>
              </Stack>
            </form>
            <Divider sx={{ margin: "20px 0", opacity: "0.4" }} />

            <Box
              sx={{ display: "flex", gap: "15px", marginTop: 6, width: "100%" }}
            >
              {colocation &&
                colocation.map((jogos: any, index: number) => {
                  return (
                    <CardGame
                      colocacao={index + 1}
                      jogo={jogos.game}
                      index={index}
                    />
                  );
                })}
            </Box>

            <Divider sx={{ marginTop: 6, marginBottom: 6, opacity: "0.4" }} />

            {data ? (
              <Paper elevation={0} sx={{ marginTop: 6, width: "100%" }}>
                <Box sx={{ width: "100%" }}>
                  {/*<EnchancedTableAwardsCategoriesPlace*/}
                  {/*  data={data}*/}
                  {/*  setData={setData}*/}
                  {/*  refresh={resetField}*/}
                  {/*/>*/}

                  <DataGridDefaultWiners
                    data={data}
                    setAwards={setData}
                    refresh={resetField}
                  />
                </Box>
              </Paper>
            ) : (
              <></>
            )}
          </Box>
        </Paper>
      </Box>
    </PersistentDrawerLeft>
  );
};
