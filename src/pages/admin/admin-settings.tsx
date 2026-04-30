import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useQueryClient } from "@tanstack/react-query";
import { alpha, useTheme } from "@mui/material/styles";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import { Link as RouterLink } from "react-router-dom";
import PageLayout from "../../components/Layout/PageLayout";
import PageHeader from "../../components/Layout/PageHeader";
import SectionCard from "../../components/Layout/SectionCard";
import ImageUpload from "../../components/Form/Field/ImageUpload";
import { qk, useAwardCategories, useSettings } from "../../hooks/queries";
import * as settingsService from "../../services/settings-service/settings-service";
import * as awardCategoriesService from "../../services/awards-categories-service/awards-categories-service";
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
    <PageLayout maxWidth={1080}>
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

      <CategoryBackgroundsSection />
    </PageLayout>
  );
};

const CategoryBackgroundsSection = () => {
  const qc = useQueryClient();
  const { success } = useNotification();
  const { data: categories = [], isLoading } = useAwardCategories();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const list = (categories as any[]) ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => (c.name ?? "").toLowerCase().includes(q));
  }, [categories, search]);

  const handleChange = (
    categoryId: string,
    field:
      | "background_image"
      | "background_image_first"
      | "background_image_second"
      | "background_image_third",
    url: string,
  ) => {
    awardCategoriesService
      .update(categoryId, { [field]: url || null })
      .then(() => {
        success(url ? "Imagem de fundo atualizada." : "Imagem de fundo removida.");
        qc.invalidateQueries(qk.awardCategories);
        // Os rankings carregam o background_image junto, então invalidamos tudo
        // que começa com ["awards", ...]
        qc.invalidateQueries(["awards"]);
      })
      .catch(() => {
        /* erro tratado pelo interceptor global */
      });
  };

  return (
    <SectionCard
      title="Fundo do pódio por categoria"
      description="Cada categoria pode ter até 4 imagens: uma padrão (usada na aba Por categoria e como fallback) e três por posição (1º, 2º, 3º) usadas na aba Por jogo. Recomendado 1600×900 px (16:9), com 30% da esquerda livre — o pódio fica colado à direita."
    >
      {isLoading ? (
        <Stack gap={2}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={160} />
          ))}
        </Stack>
      ) : (categories as any[]).length === 0 ? (
        <Alert severity="info" variant="outlined">
          Nenhuma categoria cadastrada. Cadastre uma em{" "}
          <RouterLink to="/awards/create-category">Premiação → Categorias</RouterLink>{" "}
          antes de configurar fundos.
        </Alert>
      ) : (
        <>
          {(categories as any[]).length > 6 && (
            <TextField
              size="small"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar categoria pelo nome…"
              sx={{ mb: 2, maxWidth: 360 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          )}
          {filtered.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhuma categoria corresponde a “{search}”.
            </Typography>
          ) : (
            <Stack gap={{ xs: 3, md: 4 }}>
              {filtered.map((cat) => {
                const slots: Array<{
                  key:
                    | "background_image"
                    | "background_image_first"
                    | "background_image_second"
                    | "background_image_third";
                  label: string;
                  helper?: string;
                }> = [
                  {
                    key: "background_image",
                    label: "Padrão (categoria)",
                    helper: "Fallback quando uma posição não tem imagem própria.",
                  },
                  { key: "background_image_first", label: "1º Lugar" },
                  { key: "background_image_second", label: "2º Lugar" },
                  { key: "background_image_third", label: "3º Lugar" },
                ];
                const configuredCount = slots.filter((s) =>
                  Boolean(cat[s.key]),
                ).length;
                return (
                  <Box
                    key={cat.id}
                    sx={{
                      p: { xs: 2.5, md: 3 },
                      border: (t) => `1px solid ${t.palette.divider}`,
                      borderRadius: 2,
                      bgcolor: "background.default",
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "baseline" }}
                      sx={{ mb: 2.5 }}
                      gap={1}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Playfair Display', serif",
                          fontWeight: 600,
                          fontSize: "1.15rem",
                        }}
                      >
                        {cat.name}
                      </Typography>
                      {configuredCount > 0 ? (
                        <Typography
                          variant="caption"
                          color="success.main"
                          sx={{ fontWeight: 600 }}
                        >
                          {configuredCount} de 4 configurada
                          {configuredCount === 1 ? "" : "s"}
                        </Typography>
                      ) : (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                        >
                          Nenhuma imagem
                        </Typography>
                      )}
                    </Stack>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "1fr 1fr",
                        },
                        gap: { xs: 2, md: 2.5 },
                      }}
                    >
                      {slots.map((slot) => (
                        <ImageUpload
                          key={slot.key}
                          value={(cat[slot.key] ?? "") as string}
                          onChange={(url) =>
                            handleChange(cat.id, slot.key, url)
                          }
                          folder="award-categories"
                          label={slot.label}
                          helperText={slot.helper}
                          height={150}
                          deleteOnRemove
                        />
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </>
      )}
    </SectionCard>
  );
};

export default AdminSettings;
