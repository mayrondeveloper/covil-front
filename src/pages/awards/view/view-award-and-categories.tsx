import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import MilitaryTechRoundedIcon from "@mui/icons-material/MilitaryTechRounded";
import { findAllByAwardAndCategory } from "../../../services/votes/votes-service";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import Asynchronous from "../../../components/Form/Input/asynchronous/asynchronous";
import { fetch as fetchCategories } from "../../../services/awards-categories-service/awards-categories-service";
import { fetch as fetchAllAwards } from "../../../services/awards-service/awards-service";
import PageLayout from "../../../components/Layout/PageLayout";
import PageHeader from "../../../components/Layout/PageHeader";
import SectionCard from "../../../components/Layout/SectionCard";
import { GenericTable } from "../../../components/Table/GenericTable";
import { useTableSort } from "../../../hooks/use-table-sort";

const PLACE_COLOR: Record<string, { bg: string; color: string }> = {
  "1": { bg: "linear-gradient(135deg, #B45309 0%, #F59E0B 100%)", color: "#fff" },
  "2": { bg: "linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)", color: "#0F172A" },
  "3": { bg: "linear-gradient(135deg, #7C2D12 0%, #C2410C 100%)", color: "#fff" },
};

const defaultValues = {
  place: "1",
  participant: [],
  category: [],
  game: [],
  id_award: [],
};

export const ViewAwardAndCategory = () => {
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
  const [data, setData] = useState<any[] | null>(null);
  const sort = useTableSort();

  const { handleSubmit, control, formState, reset } = useForm({
    defaultValues,
  });
  const { errors } = formState;

  const resetAsyncForm = useCallback(async () => reset(defaultValues), [reset]);

  const sortedData = useMemo(() => {
    if (!data) return data;
    if (!sort.orderBy) return data;
    const dir = sort.order === "desc" ? -1 : 1;
    const getter = (row: any) => {
      switch (sort.orderBy) {
        case "place":
          return Number(row.place ?? 0);
        case "value_vote":
          return Number(row.value_vote ?? 0);
        case "game":
          return row.game?.name ?? "";
        case "participant":
          return row.participant?.name ?? "";
        default:
          return "";
      }
    };
    return [...data].sort((a, b) => {
      const va = getter(a);
      const vb = getter(b);
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb), "pt-BR") * dir;
    });
  }, [data, sort.orderBy, sort.order]);

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Resultados"
        title="Vencedores por categoria"
        subtitle="Selecione um prêmio e uma categoria para listar os votos."
        crumbs={[
          { label: "Início", to: "/" },
          { label: "Premiação", to: "/awards" },
          { label: "Vencedores por categoria" },
        ]}
      />
      <SectionCard title="Filtros">
        <Box component="form" onSubmit={handleSubmit(sendAward)}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-end">
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
            <Button type="submit" variant="contained" color="secondary" size="large">
              Consultar
            </Button>
          </Stack>
        </Box>
      </SectionCard>
      {data && (
        <SectionCard
          title="Votos"
          description={`${data.length} ${data.length === 1 ? "voto" : "votos"} para este prêmio + categoria.`}
        >
          <GenericTable<any>
            data={sortedData ?? []}
            rowKey={(r) => r.id}
            dense
            sort={{ orderBy: sort.orderBy, order: sort.order, onChange: sort.set }}
            columns={[
              {
                header: "Colocação",
                width: 140,
                sortField: "place",
                render: (r) => {
                  const style = PLACE_COLOR[String(r.place)];
                  return (
                    <Chip
                      size="small"
                      icon={<MilitaryTechRoundedIcon sx={{ fontSize: 14 }} />}
                      label={`${r.place}º lugar`}
                      sx={{
                        fontWeight: 600,
                        background: style?.bg,
                        color: style?.color,
                        "& .MuiChip-icon": { color: style?.color },
                      }}
                    />
                  );
                },
              },
              {
                header: "Jogo",
                sortField: "game",
                render: (r) => <Typography sx={{ fontWeight: 600 }}>{r.game?.name}</Typography>,
              },
              {
                header: "Categoria",
                hideOnMobile: true,
                render: (r) => (
                  <Typography variant="body2" color="text.secondary">
                    {r.category?.name}
                  </Typography>
                ),
              },
              {
                header: "Votante",
                hideOnMobile: true,
                sortField: "participant",
                render: (r) => (
                  <Typography variant="body2" color="text.secondary">
                    {r.participant?.name}
                  </Typography>
                ),
              },
              {
                header: "Pontos",
                align: "right",
                width: 100,
                sortField: "value_vote",
                render: (r) => (
                  <Typography sx={{ fontWeight: 600 }}>
                    {r.value_vote ?? 0}
                  </Typography>
                ),
              },
            ]}
          />
        </SectionCard>
      )}
    </PageLayout>
  );
};
