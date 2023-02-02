import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { create } from "../../../services/mechanisms-service/mechanisms-service";
import { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import ResponsiveAppBar from "../../../components/AppBar/ResponsiveAppBar";
import DrawerCovil from "../../../components/Drawer/drawer";
import PersistentDrawerLeft from "../../../components/wrapperDrawer/PersistentDrawerLeft";

export const CreateMechanisms = () => {
  const [resetField, setResetField] = useState(false);
  const [, setLoading] = useState(false);

  const sendCategory = (data: any) => {
    setLoading(true);
    create(data)
      .then((r) => {
        resetAsyncForm();
        setResetField(!resetField);
      })
      .catch((error) => setLoading(false));
  };

  // FORM
  const { handleSubmit, control, formState, reset } = useForm({
    defaultValues: {
      name: "",
    },
  });

  const { errors } = formState;

  const resetAsyncForm = useCallback(async () => {
    reset({
      name: "",
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
        <Paper elevation={0} sx={{ padding: "30px 20px", width: "100%" }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontFamily: "Roboto", fontWeight: 600 }}
          >
            Cadastrar mecânica
          </Typography>

          <Box sx={{ marginTop: 4 }}>
            <form
              onSubmit={handleSubmit((data) => {
                sendCategory(data);
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
    </PersistentDrawerLeft>
  );
};
