import { Box, Breadcrumbs, Link as MuiLink, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ReactNode } from "react";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
}

export const PageHeader = ({
  title,
  subtitle,
  eyebrow,
  crumbs,
  actions,
}: PageHeaderProps) => (
  <Box sx={{ mb: { xs: 4, md: 6 } }}>
    {crumbs && crumbs.length > 0 && (
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 2, "& .MuiBreadcrumbs-separator": { color: "text.disabled" } }}
      >
        {crumbs.map((c, i) =>
          c.to && i < crumbs.length - 1 ? (
            <MuiLink
              key={c.label}
              component={RouterLink}
              to={c.to}
              underline="hover"
              color="text.secondary"
              sx={{ fontSize: 13 }}
            >
              {c.label}
            </MuiLink>
          ) : (
            <Typography key={c.label} sx={{ fontSize: 13 }} color="text.primary">
              {c.label}
            </Typography>
          )
        )}
      </Breadcrumbs>
    )}
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", md: "flex-end" }}
      gap={2}
    >
      <Box>
        {eyebrow && (
          <Typography variant="overline" color="secondary" sx={{ display: "block", mb: 1 }}>
            {eyebrow}
          </Typography>
        )}
        <Typography
          variant="h2"
          component="h1"
          sx={{
            mb: subtitle ? 1.5 : 0,
            fontSize: { xs: "1.75rem", sm: "2rem", md: "2.125rem" },
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            "& > *": { minHeight: 40 },
          }}
        >
          {actions}
        </Box>
      )}
    </Stack>
  </Box>
);

export default PageHeader;
