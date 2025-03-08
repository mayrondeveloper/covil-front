import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import PersistentDrawerLeft from "../../../components/wrapperDrawer/PersistentDrawerLeft";
import { Link } from "react-router-dom";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { toast, ToastContainer, TypeOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {getDataGameByUrl} from "../../../services/game-service/game-service";
export const AddByLink = () => {
  const notify = (message: string, type: TypeOptions) =>
    toast(message, { type: type });

  const [defaultValues, setDefaultValues] = useState({
    url: "",
  });

  // FORM
  const { handleSubmit, control, formState, reset, setValue } = useForm({
    defaultValues,
  });

  const { errors } = formState;

  const resetAsyncForm = useCallback(async () => {
    reset(defaultValues);
  }, [reset]);

    const sendUrl = useCallback((data: {url: string}) => {
        getDataGameByUrl(`${data.url}?v=creditos`)
            .then((r: any) => {
                resetAsyncForm().then(r => r);
                notify("Jogo cadastrado com sucesso!", "success")
            })
            .catch((error: Error) => notify("error", "error"));
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
        <Paper
          elevation={0}
          sx={{
            borderRadius: "0",
            padding: "30px 20px",
            width: "100%",
            height: "100vh",
          }}
        >
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
              Jogos
            </Link>
            <ChevronRightIcon sx={{ fontSize: "18px" }} />
            <Link
              to={"/game"}
              style={{ textDecoration: "none", color: "#212121" }}
            >
              Cadastrar jogo via link
            </Link>
          </Box>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontFamily: "Roboto", fontWeight: 600 }}
          >
            Cadastrar jogo via link
          </Typography>

          <Box sx={{ marginTop: 4 }}>
            <form
              onSubmit={handleSubmit((data) => {
                  sendUrl(data);
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
          </Box>
        </Paper>
      </Box>
      <ToastContainer theme="dark" />
    </PersistentDrawerLeft>
  );
};
