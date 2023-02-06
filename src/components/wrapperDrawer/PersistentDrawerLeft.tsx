import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import { Link, NavLink } from "react-router-dom";

const menu = [
  {
    name: "Prêmio",
    route: "/awards/create-awards",
  },
  {
    name: "Categoria",
    route: "/awards/create-category",
  },
  {
    name: "Participante",
    route: "/awards/create-participants",
  },
  {
    name: "Votos",
    route: "/awards/create-votes",
  },
];

const menuListar = [
  // {
  //   name: "Prêmio e categoria",
  //   route: "/awards/view-award-and-category",
  // },
  {
    name: "Consulte os prêmios e os jogos vencedores.",
    route: "/awards/view-award-and-category-places",
  },
];

const menu1 = [
  {
    name: "Jogos",
    route: "/game",
  },
  {
    name: "Categoria",
    route: "/game/create-category",
  },
  {
    name: "Editora",
    route: "/game/create-publisher",
  },
  {
    name: "Mecanismos",
    route: "/game/create-mechanism",
  },
  {
    name: "Designer",
    route: "/game/create-designer",
  },
  {
    name: "Artistas",
    route: "/game/create-artist",
  },
];

const menu2 = [
  {
    name: "Jogos",
    route: "/game/view-game",
  },
  {
    name: "Categoria",
    route: "/game/view-category",
  },
  {
    name: "Editora",
    route: "/game/view-publisher",
  },
  {
    name: "Mecanismos",
    route: "/game/view-mechanism",
  },
  {
    name: "Designer",
    route: "/game/view-designer",
  },
  {
    name: "Artistas",
    route: "/game/view-artist",
  },
];

let activeStyle = {
  fontFamily: "Roboto",
  fontSize: "14px",
  backgroundColor: "#eaeaea",
  textDecoration: "none",
  color: "#FF6701",
  fontWeight: "600",
  width: "100%",
  padding: "12px 28px",
};

let UnActiveStyle = {
  fontFamily: "Roboto",
  fontSize: "14px",
  textDecoration: "none",
  width: "100%",
  color: "#212121",
  padding: "12px 28px",
  "&:hover": {
    backgroundColor: "#eaeaea",
  },
};
const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function PersistentDrawerLeft({ children }: any) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            sx={{
              position: "absolute",
              right: "50%",
              left: "50%",
              top: "60px",
              transform: "translate(-50px, -50px)",
            }}
          >
            <Link to={"/"} style={{ textDecoration: "none", color: "#212121" }}>
              <img src="/covil.png" alt="" width={90} />
            </Link>
          </Box>
          {/*<Typography variant="h6" noWrap component="div">*/}
          {/*  Dragão de ouro*/}
          {/*</Typography>*/}
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Typography
          variant="body2"
          component="h2"
          sx={{ fontWeight: "600", marginTop: "14px", padding: "8px 16px" }}
        >
          Geral
        </Typography>

        <List>
          {menu1.map((m, index) => (
            <ListItem key={m.name} disablePadding>
              <NavLink
                to={m.route}
                style={({ isActive }) =>
                  isActive ? activeStyle : UnActiveStyle
                }
              >
                {m.name}
              </NavLink>
            </ListItem>
          ))}
        </List>
        <Divider />

        {/*<Typography*/}
        {/*  variant="body2"*/}
        {/*  component="h2"*/}
        {/*  sx={{ fontWeight: "600", marginTop: "14px", padding: "8px 16px" }}*/}
        {/*>*/}
        {/*  Listar*/}
        {/*</Typography>*/}
        {/*<List>*/}
        {/*  {menu2.map((m, index) => (*/}
        {/*    <ListItem key={m.name} disablePadding>*/}
        {/*      <NavLink*/}
        {/*        to={m.route}*/}
        {/*        style={({ isActive }) =>*/}
        {/*          isActive ? activeStyle : UnActiveStyle*/}
        {/*        }*/}
        {/*      >*/}
        {/*        {m.name}*/}
        {/*      </NavLink>*/}
        {/*    </ListItem>*/}
        {/*  ))}*/}
        {/*</List>*/}
        <Divider />
        <Typography
          variant="body2"
          component="h2"
          sx={{ fontWeight: "600", marginTop: "14px", padding: "8px 16px" }}
        >
          Prêmio
        </Typography>

        <List>
          {menu.map((m) => (
            <ListItem key={m.name} disablePadding>
              <NavLink
                to={m.route}
                style={({ isActive }) =>
                  isActive ? activeStyle : UnActiveStyle
                }
              >
                {m.name}
              </NavLink>
            </ListItem>
          ))}
        </List>

        <Typography
          variant="body2"
          component="h2"
          sx={{ fontWeight: "600", marginTop: "14px", padding: "8px 16px" }}
        >
          Listar
        </Typography>

        <List>
          {menuListar.map((m) => (
            <ListItem key={m.name} disablePadding>
              <NavLink
                to={m.route}
                style={({ isActive }) =>
                  isActive ? activeStyle : UnActiveStyle
                }
              >
                {m.name}
              </NavLink>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
}
