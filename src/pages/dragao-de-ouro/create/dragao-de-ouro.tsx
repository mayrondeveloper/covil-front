import { Box, Paper, Typography } from "@mui/material";
import { fetch } from "../../../services/awards-service/awards-service";
import { useState, useCallback, useEffect } from "react";
import ResponsiveAppBar from "../../../components/AppBar/ResponsiveAppBar";
import DrawerAwards from "../../../components/Drawer/awards";
import EnchancedTableAwards from "../../../components/Table/enchanced-table/enchanced-table-awards";
import PersistentDrawerLeft from "../../../components/wrapperDrawer/PersistentDrawerLeft";

export const DragaoDeOuro = () => {
  // FORM
  const [awards, setAwards] = useState(null);

  useEffect(() => {
    if (awards) return;
    fetchAwards();
  }, [awards]);

  const fetchAwards = useCallback(() => {
    fetch()
      .then((r: any) => setAwards(r.data))
      .catch((error: Error) => console.log(error));
  }, []);

  return (
    <PersistentDrawerLeft>
      <Box
        sx={{
          padding: 0,
          display: "flex",
          flexDirection: "row",
          height: "calc(100vh - 112px)",
        }}
      >
        <Paper elevation={0} sx={{ padding: "30px 20px", width: "100%" }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontFamily: "Roboto", fontWeight: 600 }}
          >
            Prêmios
          </Typography>

          <Box sx={{ width: "100%" }}>
            <EnchancedTableAwards data={awards} setAwards={setAwards} />
          </Box>
        </Paper>
      </Box>
    </PersistentDrawerLeft>
  );
};
