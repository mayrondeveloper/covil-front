import EnhancedTable from "../../components/Table/enchanced-table/enchanced-table";
import { Box, Paper, Typography } from "@mui/material";
import { fetch } from "../../services/game-service/game-service";
import { fetch as fetchAll } from "../../services/categories-service/categories-service";
import React, { useEffect, useState, useCallback } from "react";
import PersistentDrawerLeft from "../../components/wrapperDrawer/PersistentDrawerLeft";

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
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontFamily: "Roboto", fontWeight: 600 }}
          >
            Jogos
          </Typography>

          <Box sx={{ marginTop: 4, width: "100%" }}>
            <EnhancedTable data={games} setGames={setGames} />
          </Box>
        </Paper>
      </Box>
    </PersistentDrawerLeft>
  );
};
