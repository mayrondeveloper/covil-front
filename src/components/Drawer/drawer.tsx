import React from "react";
import {
  Divider,
  Drawer,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { NavLink } from "react-router-dom";

const menu = [
  {
    name: "Jogos",
    route: "/game/create-game",
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
  color: "#000000",
  padding: "12px 28px",
  '&:hover': {
    backgroundColor: "#eaeaea",
  }
};

const drawerWidth = 240;
export default function DrawerCovil() {
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
        "& .MuiPaper-elevation": {
          position: "relative",
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Typography
        variant="body2"
        component="h2"
        sx={{ fontWeight: "600", marginTop: "14px", padding: "8px 16px" }}
      >
        Cadastrar
      </Typography>

      <List>
        {menu.map((m, index) => (
          <ListItem key={m.name} disablePadding>
            <NavLink
              to={m.route}
              style={({ isActive }) => (isActive ? activeStyle : UnActiveStyle)}
            >
              {m.name}
            </NavLink>
          </ListItem>
        ))}
      </List>
      <Divider />

      <Typography
          variant="body2"
          component="h2"
          sx={{ fontWeight: "600", marginTop: "14px", padding: "8px 16px" }}
      >
        Listar
      </Typography>
      <List>
        {menu2.map((m, index) => (
            <ListItem key={m.name} disablePadding>
              <NavLink
                  to={m.route}
                  style={({ isActive }) => (isActive ? activeStyle : UnActiveStyle)}
              >
                {m.name}
              </NavLink>
            </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
