import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { findAllByAwardAndCategory } from "../../../services/game-service/game-service";
import React, { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import Asynchronous from "../../../components/Form/Input/asynchronous/asynchronous";
import { fetch as fetchCategories } from "../../../services/awards-categories-service/awards-categories-service";
import { fetch as fetchAllAwards } from "../../../services/awards-service/awards-service";
import DataGridDefaultWiners from "./DataGridWiners";
import CardGame from "../../../components/CardGame/CardGame";
import { ReactComponent as EmptyState } from "../../../images/empty-state/empty.svg";
import PageLayout from "../../../components/Layout/PageLayout";
import PageHeader from "../../../components/Layout/PageHeader";
import SectionCard from "../../../components/Layout/SectionCard";

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
        // setResetField(!resetField);
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
        const latest = [...r.data].sort((a: any, b: any) => {
          const ya = Number(a.year) || 0;
          const yb = Number(b.year) || 0;
          if (yb !== ya) return yb - ya;
          return String(b.id).localeCompare(String(a.id));
        })[0];
        if (latest) {
          setAwardsSelecionadas(latest);
          setValue("id_award", latest as any);
        }
      })
      .catch((error: Error) => console.log(error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const [data, setData] = useState<any[]>([]);

  const { handleSubmit, control, formState, reset, setValue } = useForm({
    defaultValues,
  });
  const { errors } = formState;

  const resetAsyncForm = useCallback(async () => reset(defaultValues), [reset]);

  const [colocation, setColocation] = useState<any>([] || null);

  useEffect(() => {
    if (!data) return;

    const row = data.map((dt: any) => {
      const votes = dt.votes.map(
          (vote: any) => `${vote.place}° (${vote.participant.name})`
      ).join(" , ");

      const total = dt.votes.reduce((sum: number, vote: any) => sum + Number(vote.value_vote), 0);

      const quantVotosPorColocacao = {
        primeiro: dt.votes.filter((vote: any) => vote.place === "1").length,
        segundo: dt.votes.filter((vote: any) => vote.place === "2").length,
        terceiro: dt.votes.filter((vote: any) => vote.place === "3").length,
      };

      return {
        id: dt.id,
        game: dt.name,
        image: dt.image,
        quantVotos: quantVotosPorColocacao,
        votes,
        total,
        publisher: dt.publishers,
        quantidadeDeJogadores: dt.num_players,
        ano: dt.year_published,
      };
    });

    setColocation(
        row
            .sort((a, b) => {
              if (b.total !== a.total) return b.total - a.total; // Primeiro critério: total de pontos
              if (b.quantVotos.primeiro !== a.quantVotos.primeiro) return b.quantVotos.primeiro - a.quantVotos.primeiro; // Segundo critério: mais votos em 1º lugar
              return b.quantVotos.segundo - a.quantVotos.segundo; // Terceiro critério: mais votos em 2º lugar
            })
            .slice(0, 3)
    );
  }, [data]);


  return (
    <PageLayout>
      <PageHeader
        eyebrow="Resultados"
        title="Vencedores por colocação"
        subtitle="Selecione o prêmio e a categoria para visualizar o ranking final."
        crumbs={[
          { label: "Início", to: "/" },
          { label: "Premiação", to: "/awards" },
          { label: "Vencedores por colocação" },
        ]}
      />
      <SectionCard><Box>
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

            {data.length >= 1 && (
              <>
                <Divider sx={{ margin: "20px 0", opacity: "0.4" }} />

                <Box
                  sx={{
                    display: "flex",
                    gap: "15px",
                    marginTop: 6,
                    width: "100%",
                  }}
                >
                  {colocation &&
                    colocation.map((jogos: any, index: number) => {
                      return (
                        <CardGame
                          key={index}
                          colocacao={index + 1}
                          jogo={jogos.game}
                          image={jogos.image}
                          editora={jogos.publisher}
                          index={index}
                          quantidadeDeJogadores={jogos.quantidadeDeJogadores}
                          ano={jogos.ano}
                        />
                      );
                    })}
                </Box>

                <Divider
                  sx={{ marginTop: 6, marginBottom: 6, opacity: "0.4" }}
                />
              </>
            )}

            {data.length >= 1 ? (
              <Paper elevation={0} sx={{ marginTop: 6, width: "100%" }}>
                <Box sx={{ width: "100%" }}>
                  <DataGridDefaultWiners
                    data={data}
                    setAwards={setData}
                    refresh={resetField}
                  />
                </Box>
              </Paper>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: 6,
                  justifyContent: "center",
                  height: "calc(100% - 112px)",
                }}
              >
                <EmptyState width={200} />
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    component="h2"
                    color={"primary"}
                    sx={{
                      fontFamily: "Roboto",
                      fontWeight: 600,
                      marginTop: "12px",
                    }}
                  >
                    Nenhuma informação por aqui.
                  </Typography>
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{
                      fontFamily: "Roboto",
                      fontWeight: 400,
                      marginTop: "12px",
                      fontSize: "12px",
                    }}
                  >
                    Selecione um prêmio e a categoria e clique no botão 'buscar'
                    para ver a lista
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
      </SectionCard>
    </PageLayout>
  );
};
