import { Box, Paper, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

interface SectionCardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  padding?: number;
}

export const SectionCard = ({
  title,
  description,
  actions,
  children,
  padding = 4,
}: SectionCardProps) => (
  <Paper sx={{ p: { xs: 2.5, md: padding }, mb: 3 }}>
    {(title || actions) && (
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "flex-start" }}
        sx={{ mb: description || children ? 3 : 0 }}
        gap={2}
      >
        <Box>
          {title && (
            <Typography variant="h5" component="h2">
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="body2" sx={{ mt: 0.5, maxWidth: 640 }}>
              {description}
            </Typography>
          )}
        </Box>
        {actions && <Box>{actions}</Box>}
      </Stack>
    )}
    {children}
  </Paper>
);

export default SectionCard;
