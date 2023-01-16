import EnhancedTable from "../../components/Table/enchanced-table/enchanced-table";
import {
  Box,
  Paper,
  Typography,
} from "@mui/material";
import { fetch } from "../../services/game-service/game-service";
import { fetch as fetchAll } from "../../services/categories-service/categories-service";
import { useEffect, useState, useCallback } from "react";
import ResponsiveAppBar from "../../components/AppBar/ResponsiveAppBar";
import DrawerCovil from "../../components/Drawer/drawer";


export const HomePage = () => {
  const [games, setGames] = useState(null);
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    if (games) return;
    fetchGames();
  }, [games]);

  useEffect(() => {
    if (categories) return;
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
    <>
      <ResponsiveAppBar />
      <Box
        sx={{
          padding: 0,
          display: "flex",
          flexDirection: "row",
          height: "calc(100vh - 69px)",
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
    </>
  );
};
