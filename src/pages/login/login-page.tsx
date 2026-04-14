import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

interface LoginForm {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from || "/";

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ defaultValues: { email: "", password: "" } });

  useEffect(() => {
    if (status === "authenticated") {
      navigate(from, { replace: true });
    }
  }, [status, from, navigate]);

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        (e?.response?.status === 401
          ? "E-mail ou senha inválidos."
          : "Não foi possível entrar. Tente novamente.");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          width: "100%",
          maxWidth: 420,
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="overline"
              sx={{ color: "secondary.main", letterSpacing: 2 }}
            >
              Covil dos Jogos
            </Typography>
            <Typography variant="h4" sx={{ mt: 0.5 }}>
              Entrar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Acesse o painel administrativo.
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="E-mail"
              type="email"
              autoComplete="email"
              autoFocus
              fullWidth
              {...register("email", { required: "Informe o e-mail." })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Senha"
              type="password"
              autoComplete="current-password"
              fullWidth
              {...register("password", { required: "Informe a senha." })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              sx={{ mt: 1 }}
            >
              {submitting ? "Entrando..." : "Entrar"}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

export default LoginPage;
