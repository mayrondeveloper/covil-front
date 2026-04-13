import { useCallback, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import {
  upload,
  remove,
  uploadFromUrl,
  UploadFolder,
} from "../../../services/uploads-service/uploads-service";
import { useNotification } from "../../../hooks/use-notification";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: UploadFolder;
  label?: string;
  helperText?: string;
  height?: number;
  /** Tenta deletar do bucket ao remover (precisa que key seja derivável da URL). */
  deleteOnRemove?: boolean;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

const keyFromUrl = (url: string): string | null => {
  try {
    // assume URL pattern: https://<host>/<key>
    const u = new URL(url);
    return u.pathname.replace(/^\/+/, "");
  } catch {
    return null;
  }
};

export const ImageUpload = ({
  value,
  onChange,
  folder = "misc",
  label = "Imagem",
  helperText,
  height = 180,
  deleteOnRemove = false,
}: ImageUploadProps) => {
  const { error, success } = useNotification();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState(value ?? "");

  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return;
      setUploading(true);
      setProgress(0);
      try {
        const r = await upload(file, folder, setProgress);
        onChange(r.data.url);
        success("Imagem enviada.");
      } catch {
        // mensagem amigável já vem do interceptor
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [folder, onChange, success]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onClear = async () => {
    const previousUrl = value;
    onChange("");
    if (deleteOnRemove && previousUrl) {
      const key = keyFromUrl(previousUrl);
      if (key) {
        try {
          await remove(key);
        } catch {
          // ignora — usuário já tirou da entidade, arquivo órfão é problema menor
        }
      }
    }
  };

  const applyUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setUploading(true);
    try {
      const r = await uploadFromUrl(trimmed, folder);
      onChange(r.data.url);
      setUrlMode(false);
      success("Imagem importada e salva no bucket.");
    } catch {
      // mensagem amigável já vem do interceptor
    } finally {
      setUploading(false);
    }
  };

  // Modo: URL manual
  if (urlMode) {
    return (
      <Box>
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
          <ImageRoundedIcon fontSize="small" sx={{ color: "text.disabled" }} />
          <Typography variant="overline" color="text.disabled">
            {label} (URL)
          </Typography>
        </Stack>
        <Stack direction="row" gap={1}>
          <TextField
            fullWidth
            size="small"
            placeholder="https://…/imagem.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            autoFocus
            disabled={uploading}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={applyUrl}
            disabled={uploading || !urlInput.trim()}
            startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : null}
          >
            {uploading ? "Importando…" : "Usar"}
          </Button>
          <Button onClick={() => setUrlMode(false)} disabled={uploading}>
            Cancelar
          </Button>
        </Stack>
        <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 0.5 }}>
          {helperText ?? "A imagem será baixada e salva no nosso bucket (otimizada para webp)."}
        </Typography>
      </Box>
    );
  }

  // Modo: tem imagem
  if (value) {
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <ImageRoundedIcon fontSize="small" sx={{ color: "text.disabled" }} />
            <Typography variant="overline" color="text.disabled">
              {label}
            </Typography>
          </Stack>
          <Stack direction="row" gap={0.5}>
            <Button size="small" onClick={() => inputRef.current?.click()} disabled={uploading}>
              Trocar
            </Button>
            <Tooltip title="Remover">
              <IconButton size="small" color="error" onClick={onClear}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <Box
          sx={{
            position: "relative",
            border: (t) => `1px solid ${t.palette.divider}`,
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "background.default",
            display: "grid",
            placeItems: "center",
            height,
          }}
        >
          <Box
            component="img"
            src={value}
            alt={label}
            sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          />
          {uploading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: (t) => alpha(t.palette.background.paper, 0.7),
                display: "grid",
                placeItems: "center",
              }}
            >
              <CircularProgress size={32} color="secondary" />
            </Box>
          )}
        </Box>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </Box>
    );
  }

  // Modo: vazio (drop zone)
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <ImageRoundedIcon fontSize="small" sx={{ color: "text.disabled" }} />
          <Typography variant="overline" color="text.disabled">
            {label}
          </Typography>
        </Stack>
        <Button
          size="small"
          startIcon={<LinkRoundedIcon />}
          onClick={() => {
            setUrlInput("");
            setUrlMode(true);
          }}
        >
          Colar URL
        </Button>
      </Stack>

      <Box
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        sx={{
          height,
          border: (t) =>
            `2px dashed ${dragOver ? t.palette.secondary.main : t.palette.divider}`,
          borderRadius: 2,
          bgcolor: (t) =>
            dragOver ? alpha(t.palette.secondary.main, 0.06) : "background.default",
          display: "grid",
          placeItems: "center",
          cursor: uploading ? "wait" : "pointer",
          transition: "all 200ms ease",
          "&:hover": uploading ? {} : { borderColor: "secondary.main" },
        }}
      >
        {uploading ? (
          <Stack alignItems="center" gap={1.5} sx={{ width: "70%" }}>
            <CloudUploadRoundedIcon sx={{ fontSize: 36, color: "secondary.main" }} />
            <Typography variant="body2">Enviando… {progress}%</Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ width: "100%", height: 4, borderRadius: 2 }}
            />
          </Stack>
        ) : (
          <Stack alignItems="center" gap={1}>
            <CloudUploadRoundedIcon sx={{ fontSize: 36, color: "text.disabled" }} />
            <Typography variant="body2">
              Arraste uma imagem ou <strong>clique para escolher</strong>
            </Typography>
            <Stack direction="row" gap={0.5}>
              <Chip size="small" label="JPG" variant="outlined" />
              <Chip size="small" label="PNG" variant="outlined" />
              <Chip size="small" label="WEBP" variant="outlined" />
              <Chip size="small" label="GIF" variant="outlined" />
              <Chip size="small" label="máx 5 MB" variant="outlined" />
            </Stack>
          </Stack>
        )}
      </Box>

      {helperText && (
        <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 0.5 }}>
          {helperText}
        </Typography>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </Box>
  );
};

export default ImageUpload;
