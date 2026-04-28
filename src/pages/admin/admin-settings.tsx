import { useEffect, useState } from "react";
import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { useQueryClient } from "@tanstack/react-query";
import { alpha, useTheme } from "@mui/material/styles";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import PageLayout from "../../components/Layout/PageLayout";
import PageHeader from "../../components/Layout/PageHeader";
import SectionCard from "../../components/Layout/SectionCard";
import ImageUpload from "../../components/Form/Field/ImageUpload";
import { qk, useSettings } from "../../hooks/queries";
import * as settingsService from "../../services/settings-service/settings-service";
import { useNotification } from "../../hooks/use-notification";

export const AdminSettings = () => {
  const theme = useTheme();
  const { success } = useNotification();
  const qc = useQueryClient();
  const { data: settings } = useSettings();

  const initialIcon = settings?.drawer_icon_url ?? "";
  const [iconUrl, setIconUrl] = useState<string>(initialIcon);
  const [saving, setSaving] = useState(false);

  // Sincroniza quando o setting carrega/muda no servidor.
  useEffect(() => {
    setIconUrl(initialIcon);
  }, [initialIcon]);

  const dirty = iconUrl !== initialIcon;

  const saveIcon = () => {
    setSaving(true);
    settingsService
      .upsert("drawer_icon_url", iconUrl)
      .then(() => {
        success("Ícone do menu atualizado.");
        qc.invalidateQueries(qk.settings);
      })
      .catch(() => {
        // erro já é mostrado pelo interceptor global
      })
      .finally(() => setSaving(false));
  };

  return (
    <PageLayout maxWidth={840}>
      <PageHeader
        eyebrow="Admin"
        title="Configurações"
        subtitle="Personalizações que afetam a aparência e o comportamento do painel."
        crumbs={[
          { label: "Início", to: "/" },
          { label: "Admin" },
          { label: "Configurações" },
        ]}
      />

      <SectionCard
        title="Ícone do menu lateral"
        description="Imagem que aparece no topo do drawer (cabeçalho com o título “Boardgames”). Recomendado: 96×96 px, fundo transparente."
      >
        <Stack direction={{ xs: "column", md: "row" }} gap={3} alignItems="flex-start">
          <Box
            sx={{
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Pré-visualização
            </Typography>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: iconUrl
                  ? alpha(theme.palette.secondary.main, 0.08)
                  : `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, #F59E0B 100%)`,
                color: "#fff",
                overflow: "hidden",
                border: (t) => `1px solid ${t.palette.divider}`,
              }}
            >
              {iconUrl ? (
                <Avatar
                  src={iconUrl}
                  alt="Ícone"
                  variant="square"
                  sx={{ width: "100%", height: "100%", "& img": { objectFit: "contain" } }}
                />
              ) : (
                <EmojiEventsRoundedIcon fontSize="small" />
              )}
            </Box>
            <Typography variant="caption" color="text.disabled">
              {iconUrl ? "Personalizado" : "Padrão"}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <ImageUpload
              value={iconUrl}
              onChange={(url) => setIconUrl(url)}
              folder="misc"
              label="Imagem do ícone"
              helperText="Aceita JPG, PNG, WEBP ou GIF. Máx 5 MB."
              deleteOnRemove
            />
          </Box>
        </Stack>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            onClick={saveIcon}
            disabled={!dirty || saving}
          >
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </Box>
      </SectionCard>
    </PageLayout>
  );
};

export default AdminSettings;
