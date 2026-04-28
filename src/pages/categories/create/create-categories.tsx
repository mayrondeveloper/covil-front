import { useMemo, useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import * as service from "../../../services/categories-service/categories-service";
import { SimpleNameForm } from "../../../components/Form/SimpleNameForm";
import SectionCard from "../../../components/Layout/SectionCard";
import { useNotification } from "../../../hooks/use-notification";

const parseBulkNames = (raw: string): string[] => {
  const seen = new Set<string>();
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((name) => {
      if (!name || seen.has(name)) return false;
      seen.add(name);
      return true;
    });
};

const BulkCreateSection = ({ onSuccess }: { onSuccess: () => void }) => {
  const { success, error } = useNotification();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const parsed = useMemo(() => parseBulkNames(text), [text]);

  const submit = () => {
    if (parsed.length === 0 || saving) return;
    setSaving(true);
    service
      .bulkCreate({ names: parsed })
      .then((r) => {
        const created = r.data.created.length;
        const skipped = r.data.skipped.length;
        if (created > 0 && skipped === 0) {
          success(`${created} categoria(s) cadastrada(s).`);
        } else if (created > 0 && skipped > 0) {
          success(
            `Criadas ${created} · ${skipped} já existia(m) e foram ignorada(s).`
          );
        } else if (skipped > 0) {
          error(
            `Nada cadastrado: ${skipped} categoria(s) já existia(m) no sistema com esse(s) nome(s).`
          );
        } else {
          error("Nada para cadastrar. Verifique o conteúdo digitado.");
        }
        setText("");
        onSuccess();
      })
      .catch(() => {
        // erro já é exibido pelo interceptor global do axios
      })
      .finally(() => setSaving(false));
  };

  return (
    <SectionCard
      title="Cadastro em massa"
      description="Cole várias categorias de uma vez — uma por linha."
    >
      <TextField
        multiline
        minRows={6}
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"Estratégia\nFamília\nParty game\nDeck building"}
        helperText={
          parsed.length > 0
            ? `${parsed.length} categoria(s) detectada(s).`
            : "Cole ou digite as categorias acima."
        }
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="contained"
          onClick={submit}
          disabled={parsed.length === 0 || saving}
          startIcon={<PlaylistAddRoundedIcon />}
        >
          {saving
            ? "Cadastrando…"
            : parsed.length > 0
            ? `Cadastrar ${parsed.length} categoria(s)`
            : "Cadastrar em massa"}
        </Button>
      </Box>
    </SectionCard>
  );
};

export const CreateCategories = () => (
  <SimpleNameForm
    title="Cadastrar categoria"
    entityName="Categoria"
    service={service}
    parentCrumb={{ label: "Catálogo", to: "/game" }}
    bulkSlot={({ refresh }) => <BulkCreateSection onSuccess={refresh} />}
  />
);
