import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import { Button, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { getDataGameByUrl } from "../../../services/game-service/game-service";
import { useNotification } from "../../../hooks/use-notification";
import PageLayout from "../../../components/Layout/PageLayout";
import PageHeader from "../../../components/Layout/PageHeader";
import SectionCard from "../../../components/Layout/SectionCard";
import ControlledTextField from "../../../components/Form/Field/ControlledTextField";
import FormActions from "../../../components/Form/Field/FormActions";

const URL_REGEX = /^https?:\/\/.+/i;

interface AddByLinkForm {
  url: string;
}

export const AddByLink = () => {
  const { success } = useNotification();
  const [saving, setSaving] = useState(false);
  const { handleSubmit, control, reset } = useForm<AddByLinkForm>({ defaultValues: { url: "" } });

  const sendUrl = useCallback(
    (data: AddByLinkForm) => {
      setSaving(true);
      getDataGameByUrl(`${data.url}?v=creditos`)
        .then(() => {
          success("Jogo cadastrado com sucesso!");
          reset({ url: "" });
        })
        .catch(() => {
          // Erro HTTP já é exibido pelo interceptor global do axios
          // (mensagem 409 inclui "Jogo já cadastrado" do backend).
        })
        .finally(() => setSaving(false));
    },
    [success, reset]
  );

  return (
    <PageLayout maxWidth={840}>
      <PageHeader
        eyebrow="Catálogo"
        title="Importar jogo via link"
        subtitle="Cole a URL pública do jogo. A ficha será baixada e cadastrada automaticamente."
        crumbs={[
          { label: "Início", to: "/" },
          { label: "Jogos", to: "/game" },
          { label: "Importar via link" },
        ]}
        actions={
          <Button
            component={RouterLink}
            to="/game/bulk-add-by-link"
            variant="outlined"
            size="small"
          >
            Importar em massa
          </Button>
        }
      />

      <SectionCard
        title="URL do jogo"
        description="Use o endereço completo (https://...). Suporta as fontes integradas pelo backend."
      >
        <form onSubmit={handleSubmit(sendUrl)} noValidate>
          <Stack spacing={3}>
            <ControlledTextField
              control={control}
              name="url"
              label="URL"
              required
              placeholder="https://exemplo.com/jogo/aqui"
              rules={{
                required: true,
                pattern: { value: URL_REGEX, message: "Use uma URL começando com http(s)://" },
              }}
            />
          </Stack>
          <FormActions submitLabel="Importar jogo" submitIcon={<LinkRoundedIcon />} saving={saving} />
        </form>
      </SectionCard>
    </PageLayout>
  );
};
