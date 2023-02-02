import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  create,
  fetch,
} from "../../../services/participants-service/participants-service";
import { useState, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import ResponsiveAppBar from "../../../components/AppBar/ResponsiveAppBar";
import DrawerAwards from "../../../components/Drawer/awards";
import EnchancedTableAwardParticipants from "../../../components/Table/enchanced-table/enchanced-table-award-participants";
import PersistentDrawerLeft from "../../../components/wrapperDrawer/PersistentDrawerLeft";

const defaultValues = {
  name: "",
  description: "descrição",
  image: "imagem",
  instagram: "insta",
  site: "site",
  url: "url",
};

export const CreateAwardParticipants = () => {
  const [resetField, setResetField] = useState(false);
  const [, setLoading] = useState(false);

  const sendAward = (data: any) => {
    setLoading(true);
    create(data)
      .then((r) => {
        fetchAwards();
        resetAsyncForm();
        setResetField(!resetField);
      })
      .catch((error) => setLoading(false));
  };

  // FORM
  const [data, setData] = useState(null);

  const { handleSubmit, control, formState, reset } = useForm({
    defaultValues,
  });
  const { errors } = formState;

  const resetAsyncForm = useCallback(async () => reset(defaultValues), [reset]);

  useEffect(() => {
    if (data) return;
    fetchAwards();
  }, [data]);

  const fetchAwards = useCallback(() => {
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
            Cadastrar participante
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
                        label="Nome do participante"
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
                        label="Image"
                        variant="outlined"
                        {...field}
                      />
                    )}
                    name="image"
                    rules={{ required: true }}
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
                        label="Instagram"
                        variant="outlined"
                        {...field}
                      />
                    )}
                    name="instagram"
                    rules={{ required: true }}
                    control={control}
                  />
                  {errors.instagram?.type === "required" && (
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
                        label="Site"
                        variant="outlined"
                        {...field}
                      />
                    )}
                    name="site"
                    rules={{ required: true }}
                    control={control}
                  />
                  {errors.site?.type === "required" && (
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
                        label="URL"
                        variant="outlined"
                        {...field}
                      />
                    )}
                    name="url"
                    rules={{ required: true }}
                    control={control}
                  />
                  {errors.url?.type === "required" && (
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
                <EnchancedTableAwardParticipants
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
