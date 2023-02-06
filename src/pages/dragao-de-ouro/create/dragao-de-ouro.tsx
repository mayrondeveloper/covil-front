import { Box, Paper, Typography } from "@mui/material";
import { fetch } from "../../../services/awards-service/awards-service";
import React, { useState, useCallback, useEffect } from "react";
import ResponsiveAppBar from "../../../components/AppBar/ResponsiveAppBar";
import EnchancedTableAwards from "../../../components/Table/enchanced-table/enchanced-table-awards";
import PersistentDrawerLeft from "../../../components/wrapperDrawer/PersistentDrawerLeft";
import { Link } from "react-router-dom";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddBoxIcon from "@mui/icons-material/AddBox";

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
              to={"/awards"}
              style={{ textDecoration: "none", color: "#212121" }}
            >
              Prêmios
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
              Prêmios
            </Typography>
            <Link
              to={"/awards/create-awards"}
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

          <Box sx={{ width: "100%" }}>
            <EnchancedTableAwards data={awards} setAwards={setAwards} />
          </Box>
        </Paper>
      </Box>
    </PersistentDrawerLeft>
  );
};
