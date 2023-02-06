import EnhancedTable from "../../components/Table/enchanced-table/enchanced-table";
import { Box, Button, Paper, Typography } from "@mui/material";
import { fetch } from "../../services/game-service/game-service";
import { fetch as fetchAll } from "../../services/categories-service/categories-service";
import React, { useEffect, useState, useCallback } from "react";
import PersistentDrawerLeft from "../../components/wrapperDrawer/PersistentDrawerLeft";
import { Link } from "react-router-dom";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export const Games = () => {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (games.length) return;
    fetchGames();
  }, [games]);

  useEffect(() => {
    if (categories.length) return;
    fetchCategories();
  }, [categories]);

  const fetchGames = useCallback(() => {
    fetch()
      .then((r: any) => setGames(r.data))
      .catch((error: Error) => console.log(error));
  }, []);

  const fetchCategories = useCallback(() => {
    fetchAll()
      .then((r: any) => setCategories(r.data))
      .catch((error: Error) => console.log(error));
  }, []);

  return (
    <PersistentDrawerLeft>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Paper elevation={0} sx={{ padding: "30px 20px", width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: "12px",
              marginBottom: 4,
            }}
          >
            <Link to={"/"} style={{ textDecoration: "none", color: "#212121" }}>
              Home
            </Link>
            <ChevronRightIcon sx={{ fontSize: "18px" }} />
            <Link
              to={"/game"}
              style={{ textDecoration: "none", color: "#212121" }}
            >
              Jogos
            </Link>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontFamily: "Roboto", fontWeight: 600 }}
            >
              Jogos
            </Typography>
            <Link
              to={"/game/create-game"}
              style={{ textDecoration: "none", color: "#212121" }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AddBoxIcon color={"secondary"} sx={{ fontSize: "26px" }} />
                {/*<Typography*/}
                {/*  variant="body1"*/}
                {/*  component="div"*/}
                {/*  sx={{*/}
                {/*    textTransform: "none",*/}
                {/*    fontFamily: "Roboto",*/}
                {/*    fontWeight: 400,*/}
                {/*    textDecoration: "none",*/}
                {/*    marginLeft: "8px",*/}
                {/*  }}*/}
                {/*>*/}
                {/*  Adicionar*/}
                {/*</Typography>*/}
              </Box>
            </Link>
          </Box>

          <Box sx={{ marginTop: 4, width: "100%" }}>
            <EnhancedTable data={games} setGames={setGames} />
          </Box>
        </Paper>
      </Box>
    </PersistentDrawerLeft>
  );
};
