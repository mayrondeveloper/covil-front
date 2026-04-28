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
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
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
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import WorkspacesRoundedIcon from "@mui/icons-material/WorkspacesRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { useSettings } from "../../hooks/queries";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const DRAWER_WIDTH = 264;
const DRAWER_WIDTH_COLLAPSED = 72;
const APP_BAR_HEIGHT = 64;
const COLLAPSE_STORAGE_KEY = "covil.drawer.collapsed";

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
        name: "Pódio",
        route: "/awards/podium",
        icon: <WorkspacePremiumRoundedIcon fontSize="small" />,
      },
      {
        name: "Por colocação",
        route: "/awards/view-award-and-category-places",
        icon: <LeaderboardRoundedIcon fontSize="small" />,
      },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        name: "Configurações",
        route: "/admin/settings",
        icon: <SettingsRoundedIcon fontSize="small" />,
      },
    ],
  },
];

interface SidebarContentProps {
  collapsed?: boolean;
  onItemClick?: () => void;
}

const SidebarContent = ({ collapsed = false, onItemClick }: SidebarContentProps) => {
  const location = useLocation();
  const { data: settings } = useSettings();
  const customIcon = settings?.drawer_icon_url || "";
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          height: APP_BAR_HEIGHT,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: collapsed ? 0 : 3,
          justifyContent: collapsed ? "center" : "flex-start",
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
              customIcon
                ? "transparent"
                : `linear-gradient(135deg, ${t.palette.secondary.main} 0%, #F59E0B 100%)`,
            color: "#fff",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {customIcon ? (
            <Box
              component="img"
              src={customIcon}
              alt=""
              sx={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <EmojiEventsRoundedIcon fontSize="small" />
          )}
        </Box>
        {!collapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: "1.1rem",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              Boardgames
            </Typography>
            <Typography variant="caption" sx={{ letterSpacing: "0.08em" }}>
              ADMIN
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", py: 2 }}>
        {navGroups.map((group, groupIdx) => (
          <Box key={group.label} sx={{ mb: 2 }}>
            {collapsed ? (
              groupIdx > 0 && (
                <Box
                  aria-hidden
                  sx={{
                    mx: 1.5,
                    mb: 0.5,
                    height: "1px",
                    bgcolor: "divider",
                  }}
                />
              )
            ) : (
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
            )}
            <List dense disablePadding sx={{ mt: 0.5 }}>
              {group.items.map((item) => {
                const path = location.pathname;
                const active =
                  path === item.route ||
                  (item.matchPrefixes ?? []).some(
                    (p) => path === p || path.startsWith(p + "/")
                  );
                const button = (
                  <ListItemButton
                    component={NavLink}
                    to={item.route}
                    selected={active}
                    onClick={onItemClick}
                    sx={{
                      textDecoration: "none",
                      color: "inherit",
                      mx: collapsed ? 1 : 0,
                      borderRadius: collapsed ? 1.5 : 0,
                      justifyContent: collapsed ? "center" : "flex-start",
                      px: collapsed ? 1 : undefined,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : undefined,
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.name}
                        primaryTypographyProps={{
                          fontSize: 14,
                          fontWeight: active ? 600 : 500,
                        }}
                      />
                    )}
                  </ListItemButton>
                );
                return (
                  <ListItem key={item.route} disablePadding>
                    {collapsed ? (
                      <Tooltip title={item.name} placement="right" arrow>
                        <Box sx={{ width: "100%" }}>{button}</Box>
                      </Tooltip>
                    ) : (
                      button
                    )}
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {!collapsed && (
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
      )}
    </Box>
  );
};

export default function PersistentDrawerLeft({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const toggleDrawer = () => {
    if (isDesktop) {
      setCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
        } catch {
          /* ignore quota / privacy-mode errors */
        }
        return next;
      });
    } else {
      setMobileOpen((prev) => !prev);
    }
  };

  const desktopWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;
  const widthTransition = theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  });
  const marginTransition = theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  });

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${desktopWidth}px)` },
          ml: { md: `${desktopWidth}px` },
          height: APP_BAR_HEIGHT,
          justifyContent: "center",
          transition: marginTransition,
        }}
      >
        <Toolbar sx={{ minHeight: `${APP_BAR_HEIGHT}px !important`, px: { xs: 2, md: 4 } }}>
          <Tooltip
            title={isDesktop ? (collapsed ? "Expandir menu" : "Recolher menu") : "Abrir menu"}
          >
            <IconButton
              aria-label={
                isDesktop ? (collapsed ? "Expandir menu" : "Recolher menu") : "Abrir menu"
              }
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              {isDesktop ? (
                collapsed ? (
                  <ChevronRightRoundedIcon />
                ) : (
                  <ChevronLeftRoundedIcon />
                )
              ) : (
                <MenuIcon />
              )}
            </IconButton>
          </Tooltip>
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
        sx={{
          width: { md: desktopWidth },
          flexShrink: { md: 0 },
          transition: widthTransition,
        }}
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
          <SidebarContent onItemClick={() => setMobileOpen(false)} />
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: desktopWidth,
              boxSizing: "border-box",
              overflowX: "hidden",
              transition: widthTransition,
            },
          }}
        >
          <SidebarContent collapsed={collapsed} />
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
