import { Box, Button, CircularProgress, Stack } from "@mui/material";
import { ReactNode } from "react";

interface FormActionsProps {
  submitLabel?: ReactNode;
  savingLabel?: ReactNode;
  saving?: boolean;
  onCancel?: () => void;
  cancelLabel?: string;
  helper?: ReactNode;
  align?: "left" | "right" | "between";
  submitIcon?: ReactNode;
}

export const FormActions = ({
  submitLabel = "Salvar",
  savingLabel = "Salvando…",
  saving = false,
  onCancel,
  cancelLabel = "Cancelar",
  helper,
  align = "left",
  submitIcon,
}: FormActionsProps) => {
  const justify =
    align === "right" ? "flex-end" : align === "between" ? "space-between" : "flex-start";

  return (
    <Box
      sx={{
        mt: 4,
        pt: 3,
        borderTop: (t) => `1px solid ${t.palette.divider}`,
        display: "flex",
        justifyContent: justify,
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Stack direction="row" gap={1.5} alignItems="center">
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          size="large"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : submitIcon}
        >
          {saving ? savingLabel : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outlined" size="large" onClick={onCancel} disabled={saving}>
            {cancelLabel}
          </Button>
        )}
      </Stack>
      {helper}
    </Box>
  );
};

export default FormActions;
