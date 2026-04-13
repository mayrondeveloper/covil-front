import { createTheme, alpha } from "@mui/material/styles";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";

export const palette = {
  ink: "#111827",
  inkSoft: "#1F2937",
  text: "#0F172A",
  textMuted: "#475569",
  textSubtle: "#64748B",
  background: "#FAF7F2",
  surface: "#FFFFFF",
  surfaceAlt: "#F5F1EA",
  border: "#E5E0D6",
  borderStrong: "#D6CFC1",
  gold: "#B45309",
  goldSoft: "#D97706",
  goldMuted: "#FCD9A6",
  emerald: "#047857",
  ruby: "#B91C1C",
  amber: "#D97706",
};

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const shadows = {
  xs: "0 1px 2px rgba(15, 23, 42, 0.04)",
  sm: "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
  md: "0 4px 12px rgba(15, 23, 42, 0.06), 0 2px 4px rgba(15, 23, 42, 0.04)",
  lg: "0 12px 32px rgba(15, 23, 42, 0.08), 0 4px 8px rgba(15, 23, 42, 0.04)",
};

export const fonts = {
  display: `"Playfair Display", "Iowan Old Style", Georgia, serif`,
  body: `"Inter", "Helvetica Neue", Arial, sans-serif`,
  mono: `"JetBrains Mono", "SF Mono", Menlo, monospace`,
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: palette.ink, contrastText: "#FFFFFF" },
    secondary: { main: palette.gold, contrastText: "#FFFFFF" },
    success: { main: palette.emerald },
    error: { main: palette.ruby },
    warning: { main: palette.amber },
    background: { default: palette.background, paper: palette.surface },
    text: {
      primary: palette.text,
      secondary: palette.textMuted,
      disabled: palette.textSubtle,
    },
    divider: palette.border,
  },
  shape: { borderRadius: radius.md },
  typography: {
    fontFamily: fonts.body,
    h1: { fontFamily: fonts.display, fontWeight: 700, fontSize: "2.75rem", lineHeight: 1.15, letterSpacing: "-0.02em" },
    h2: { fontFamily: fonts.display, fontWeight: 700, fontSize: "2.125rem", lineHeight: 1.2, letterSpacing: "-0.015em" },
    h3: { fontFamily: fonts.display, fontWeight: 600, fontSize: "1.625rem", lineHeight: 1.25, letterSpacing: "-0.01em" },
    h4: { fontFamily: fonts.body, fontWeight: 700, fontSize: "1.375rem", lineHeight: 1.3 },
    h5: { fontFamily: fonts.body, fontWeight: 600, fontSize: "1.125rem", lineHeight: 1.35 },
    h6: { fontFamily: fonts.body, fontWeight: 600, fontSize: "1rem", lineHeight: 1.4 },
    subtitle1: { fontWeight: 500, fontSize: "1rem", lineHeight: 1.5 },
    subtitle2: { fontWeight: 500, fontSize: "0.875rem", lineHeight: 1.5, color: palette.textMuted },
    body1: { fontSize: "0.9375rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", lineHeight: 1.6, color: palette.textMuted },
    button: { fontWeight: 600, textTransform: "none", letterSpacing: "0.005em" },
    caption: { fontSize: "0.75rem", lineHeight: 1.4, color: palette.textSubtle, letterSpacing: "0.02em" },
    overline: { fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: palette.textMuted },
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background,
          color: palette.text,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        "*:focus-visible": {
          outline: `2px solid ${palette.gold}`,
          outlineOffset: 2,
          borderRadius: 4,
        },
        "@media (prefers-reduced-motion: reduce)": {
          "*, *::before, *::after": {
            animationDuration: "0.001ms !important",
            animationIterationCount: "1 !important",
            transitionDuration: "0.001ms !important",
            scrollBehavior: "auto !important",
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: false },
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          padding: "8px 16px",
          fontWeight: 600,
          transition: "all 200ms ease",
          cursor: "pointer",
          "&:focus-visible": {
            outline: `2px solid ${palette.gold}`,
            outlineOffset: 2,
          },
        },
        sizeMedium: { padding: "10px 20px", fontSize: "0.9375rem" },
        sizeLarge: { padding: "12px 28px", fontSize: "1rem" },
        containedPrimary: {
          backgroundColor: palette.ink,
          "&:hover": { backgroundColor: palette.inkSoft },
        },
        containedSecondary: {
          backgroundColor: palette.gold,
          "&:hover": { backgroundColor: palette.goldSoft },
        },
        outlined: {
          borderColor: palette.border,
          color: palette.text,
          "&:hover": {
            borderColor: palette.borderStrong,
            backgroundColor: alpha(palette.ink, 0.04),
          },
        },
        text: {
          color: palette.text,
          "&:hover": { backgroundColor: alpha(palette.ink, 0.04) },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${palette.border}`,
          borderRadius: radius.md,
        },
        elevation0: { boxShadow: "none" },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid ${palette.border}`,
          borderRadius: radius.md,
          backgroundImage: "none",
          transition: "border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease",
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "inherit" },
      styleOverrides: {
        root: {
          backgroundColor: palette.surface,
          borderBottom: `1px solid ${palette.border}`,
          backdropFilter: "saturate(180%) blur(8px)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${palette.border}`,
          backgroundColor: palette.surface,
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined", size: "small" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          backgroundColor: palette.surface,
          "& fieldset": { borderColor: palette.border },
          "&:hover fieldset": { borderColor: palette.borderStrong },
          "&.Mui-focused fieldset": { borderColor: palette.gold, borderWidth: 1 },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: palette.textMuted, "&.Mui-focused": { color: palette.gold } },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: palette.border,
          fontSize: "0.875rem",
          padding: "14px 16px",
        },
        head: {
          fontWeight: 600,
          color: palette.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontSize: "0.6875rem",
          backgroundColor: palette.surfaceAlt,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background-color 150ms ease",
          "&:hover": { backgroundColor: alpha(palette.gold, 0.04) },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: radius.xs, fontWeight: 500 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: palette.ink,
          fontSize: "0.75rem",
          padding: "6px 10px",
          borderRadius: radius.xs,
        },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: palette.border } },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          margin: "2px 8px",
          padding: "8px 12px",
          "&.Mui-selected": {
            backgroundColor: alpha(palette.gold, 0.1),
            color: palette.gold,
            "& .MuiListItemIcon-root": { color: palette.gold },
            "&:hover": { backgroundColor: alpha(palette.gold, 0.14) },
          },
          "&:hover": { backgroundColor: alpha(palette.ink, 0.04) },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: { root: { minWidth: 36, color: palette.textMuted } },
    },
  },
});

export default theme;
