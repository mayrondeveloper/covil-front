import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Link as MuiLink,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import { Link as RouterLink } from "react-router-dom";
import { getDataGameByUrl } from "../../../services/game-service/game-service";
import { useNotification } from "../../../hooks/use-notification";
import PageLayout from "../../../components/Layout/PageLayout";
import PageHeader from "../../../components/Layout/PageHeader";
import SectionCard from "../../../components/Layout/SectionCard";

const URL_REGEX = /^https?:\/\/.+/i;

type RowStatus = "pending" | "processing" | "success" | "duplicate" | "error";

interface ImportRow {
  url: string;
  status: RowStatus;
  gameName?: string;
  message?: string;
}

const parseUrls = (raw: string): string[] => {
  const seen = new Set<string>();
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      if (!line || !URL_REGEX.test(line) || seen.has(line)) return false;
      seen.add(line);
      return true;
    });
};

const STATUS_META: Record<
  RowStatus,
  { label: string; color: "default" | "info" | "success" | "warning" | "error"; icon: JSX.Element | null }
> = {
  pending: { label: "Aguardando", color: "default", icon: null },
  processing: { label: "Importando…", color: "info", icon: <CircularProgress size={14} /> },
  success: { label: "Importado", color: "success", icon: <CheckCircleRoundedIcon fontSize="small" /> },
  duplicate: { label: "Já existia", color: "warning", icon: <WarningAmberRoundedIcon fontSize="small" /> },
  error: { label: "Falhou", color: "error", icon: <ErrorRoundedIcon fontSize="small" /> },
};

export const BulkAddByLink = () => {
  const { success, error: errorNotif } = useNotification();
  const [text, setText] = useState("");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [running, setRunning] = useState(false);

  const parsedUrls = useMemo(() => parseUrls(text), [text]);

  const updateRow = (idx: number, patch: Partial<ImportRow>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const importOne = async (idx: number, url: string) => {
    updateRow(idx, { status: "processing" });
    try {
      const r: any = await getDataGameByUrl(`${url}?v=creditos`);
      const gameName: string | undefined = r?.data?.name;
      updateRow(idx, { status: "success", gameName });
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        const existingName: string | undefined = err?.response?.data?.existing?.name;
        updateRow(idx, { status: "duplicate", gameName: existingName });
      } else {
        const message: string =
          err?.response?.data?.message ||
          (status ? `HTTP ${status}` : "Falha de rede");
        updateRow(idx, { status: "error", message });
      }
    }
  };

  const startImport = async () => {
    if (parsedUrls.length === 0 || running) return;
    setRunning(true);
    setRows(parsedUrls.map((url) => ({ url, status: "pending" })));

    // Pool de N workers — cada um pega o próximo índice livre.
    // Concorrência baixa pra não martelar o site-fonte do scraping.
    const POOL_SIZE = 3;
    let cursor = 0;
    const worker = async () => {
      while (cursor < parsedUrls.length) {
        const idx = cursor;
        cursor += 1;
        // eslint-disable-next-line no-await-in-loop
        await importOne(idx, parsedUrls[idx]);
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(POOL_SIZE, parsedUrls.length) }, () =>
        worker()
      )
    );
    setRunning(false);

    setRows((finalRows) => {
      const created = finalRows.filter((r) => r.status === "success").length;
      const dup = finalRows.filter((r) => r.status === "duplicate").length;
      const err = finalRows.filter((r) => r.status === "error").length;
      if (err === 0 && dup === 0 && created > 0) {
        success(`${created} jogo(s) importado(s).`);
      } else if (err === 0 && dup > 0) {
        success(`${created} importado(s) · ${dup} já existia(m).`);
      } else if (err > 0 && created === 0 && dup === 0) {
        errorNotif(`Nenhum importado · ${err} falhou(aram).`);
      } else {
        errorNotif(
          `Importados ${created} · ${dup} já existia(m) · ${err} falhou(aram).`
        );
      }
      return finalRows;
    });
  };

  const progress = useMemo(() => {
    if (rows.length === 0) return 0;
    const done = rows.filter(
      (r) => r.status !== "pending" && r.status !== "processing"
    ).length;
    return Math.round((done / rows.length) * 100);
  }, [rows]);

  return (
    <PageLayout maxWidth={960}>
      <PageHeader
        eyebrow="Catálogo"
        title="Importar jogos em massa"
        subtitle="Cole várias URLs (uma por linha). Cada uma será baixada e cadastrada em sequência."
        crumbs={[
          { label: "Início", to: "/" },
          { label: "Jogos", to: "/game" },
          { label: "Importar em massa" },
        ]}
        actions={
          <Button
            component={RouterLink}
            to="/game/add-by-link"
            variant="text"
            size="small"
          >
            Importar um por vez
          </Button>
        }
      />

      <SectionCard
        title="URLs"
        description="Uma URL por linha (https://…). Linhas inválidas e duplicatas dentro do lote são ignoradas automaticamente."
      >
        <TextField
          multiline
          minRows={8}
          fullWidth
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={running}
          placeholder={
            "https://ludopedia.com.br/jogo/wingspan\n" +
            "https://ludopedia.com.br/jogo/azul\n" +
            "https://ludopedia.com.br/jogo/catan"
          }
          helperText={
            parsedUrls.length > 0
              ? `${parsedUrls.length} URL(s) válida(s) detectada(s).`
              : "Cole as URLs acima."
          }
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<LinkRoundedIcon />}
            onClick={startImport}
            disabled={parsedUrls.length === 0 || running}
          >
            {running
              ? "Importando…"
              : parsedUrls.length > 0
              ? `Importar ${parsedUrls.length} jogo(s)`
              : "Importar"}
          </Button>
        </Box>
      </SectionCard>

      {rows.length > 0 && (
        <SectionCard
          title="Progresso"
          description={
            running
              ? "Processando até 3 URLs em paralelo. Não feche a página até terminar."
              : "Resultado final por linha."
          }
        >
          <Stack spacing={2}>
            <LinearProgress variant="determinate" value={progress} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 60 }}>#</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Jogo</TableCell>
                  <TableCell sx={{ width: 200 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r, idx) => {
                  const meta = STATUS_META[r.status];
                  return (
                    <TableRow key={idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <MuiLink
                          href={r.url}
                          target="_blank"
                          rel="noopener"
                          variant="body2"
                          sx={{
                            display: "block",
                            maxWidth: 360,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.url}
                        </MuiLink>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: r.gameName ? 600 : 400,
                            color: r.status === "error" ? "error.main" : "text.primary",
                          }}
                        >
                          {r.gameName ?? (r.status === "error" ? r.message ?? "—" : "—")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={meta.color === "default" ? undefined : meta.color}
                          icon={meta.icon ?? undefined}
                          label={meta.label}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Stack>
        </SectionCard>
      )}
    </PageLayout>
  );
};

export default BulkAddByLink;
