import * as React from "react";
import { useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SportsEsportsRoundedIcon from "@mui/icons-material/SportsEsportsRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import BuildCircleRoundedIcon from "@mui/icons-material/BuildCircleRounded";
import DesignServicesRoundedIcon from "@mui/icons-material/DesignServicesRounded";
import BrushRoundedIcon from "@mui/icons-material/BrushRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import HowToVoteRoundedIcon from "@mui/icons-material/HowToVoteRounded";
import LeaderboardRoundedIcon from "@mui/icons-material/LeaderboardRounded";
import WorkspacesRoundedIcon from "@mui/icons-material/WorkspacesRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const DRAWER_WIDTH = 264;
const APP_BAR_HEIGHT = 64;

interface NavItem {
  name: string;
  route: string;
  icon: React.ReactNode;
  matchPrefixes?: string[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Geral",
    items: [{ name: "Início", route: "/", icon: <HomeRoundedIcon fontSize="small" /> }],
  },
  {
    label: "Catálogo",
    items: [
      {
        name: "Jogos",
        route: "/game",
        icon: <SportsEsportsRoundedIcon fontSize="small" />,
        matchPrefixes: ["/game/create-game", "/game/edit-game", "/game/add-by-link"],
      },
      { name: "Categorias", route: "/game/create-category", icon: <CategoryRoundedIcon fontSize="small" /> },
      { name: "Editoras", route: "/game/create-publisher", icon: <StorefrontRoundedIcon fontSize="small" /> },
      { name: "Mecanismos", route: "/game/create-mechanism", icon: <BuildCircleRoundedIcon fontSize="small" /> },
      { name: "Designers", route: "/game/create-designer", icon: <DesignServicesRoundedIcon fontSize="small" /> },
      { name: "Artistas", route: "/game/create-artist", icon: <BrushRoundedIcon fontSize="small" /> },
    ],
  },
  {
    label: "Premiação",
    items: [
      {
        name: "Prêmios",
        route: "/awards",
        icon: <EmojiEventsRoundedIcon fontSize="small" />,
        matchPrefixes: ["/awards/create-awards", "/awards/edit-awards"],
      },
      { name: "Categorias", route: "/awards/create-category", icon: <WorkspacesRoundedIcon fontSize="small" /> },
      { name: "Participantes", route: "/awards/create-participants", icon: <GroupsRoundedIcon fontSize="small" /> },
      { name: "Votos", route: "/awards/create-new-votes", icon: <HowToVoteRoundedIcon fontSize="small" /> },
    ],
  },
  {
    label: "Resultados",
    items: [
      {
        name: "Vencedores",
        route: "/awards/winners",
        icon: <EmojiEventsRoundedIcon fontSize="small" />,
      },
      {
        name: "Por colocação",
        route: "/awards/view-award-and-category-places",
        icon: <LeaderboardRoundedIcon fontSize="small" />,
      },
    ],
  },
];

const SidebarContent = () => {
  const location = useLocation();
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          height: APP_BAR_HEIGHT,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 3,
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: (t) =>
              `linear-gradient(135deg, ${t.palette.secondary.main} 0%, #F59E0B 100%)`,
            color: "#fff",
          }}
        >
          <EmojiEventsRoundedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              lineHeight: 1,
            }}
          >
            Covil dos Jogos
          </Typography>
          <Typography variant="caption" sx={{ letterSpacing: "0.08em" }}>
            ADMIN
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", py: 2 }}>
        {navGroups.map((group) => (
          <Box key={group.label} sx={{ mb: 2 }}>
            <Typography
              variant="overline"
              sx={{
                px: 3,
                display: "block",
                color: "text.disabled",
                fontSize: "0.6875rem",
              }}
            >
              {group.label}
            </Typography>
            <List dense disablePadding sx={{ mt: 0.5 }}>
              {group.items.map((item) => {
                const path = location.pathname;
                const active =
                  path === item.route ||
                  (item.matchPrefixes ?? []).some(
                    (p) => path === p || path.startsWith(p + "/")
                  );
                return (
                  <ListItem key={item.route} disablePadding>
                    <ListItemButton
                      component={NavLink}
                      to={item.route}
                      selected={active}
                      sx={{
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        primaryTypographyProps={{
                          fontSize: 14,
                          fontWeight: active ? 600 : 500,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          p: 2.5,
          borderTop: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Typography variant="caption" sx={{ display: "block" }}>
          v0.1.0 · Dragão de Ouro
        </Typography>
      </Box>
    </Box>
  );
};

export default function PersistentDrawerLeft({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          height: APP_BAR_HEIGHT,
          justifyContent: "center",
        }}
      >
        <Toolbar sx={{ minHeight: `${APP_BAR_HEIGHT}px !important`, px: { xs: 2, md: 4 } }}>
          <IconButton
            aria-label="Abrir menu"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flex: 1 }} />
          <Tooltip title="Ir ao site público">
            <IconButton
              component={Link}
              to="/"
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                color: "secondary.main",
                "&:hover": { bgcolor: alpha(theme.palette.secondary.main, 0.2) },
              }}
            >
              <EmojiEventsRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={user?.email ? `Sair (${user.email})` : "Sair"}>
            <IconButton
              onClick={handleLogout}
              size="small"
              sx={{ ml: 1 }}
              aria-label="Sair"
            >
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
          }}
        >
          <SidebarContent />
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
          }}
        >
          <SidebarContent />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          pt: `${APP_BAR_HEIGHT}px`,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
