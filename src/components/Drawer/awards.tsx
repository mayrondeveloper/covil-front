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
    name: "Prêmio",
    route: "/awards",
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
export default function DrawerAwards() {
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
    </Drawer>
  );
}
