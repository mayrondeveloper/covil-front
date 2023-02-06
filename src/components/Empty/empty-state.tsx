import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { ReactComponent as EmptyState2 } from "../../images/empty-state/dice.svg";
import { Link } from "react-router-dom";

const EmptyState = ({
  title,
  subtitle,
  button,
}: {
  title: string;
  subtitle: string;
  button: {
    title: string;
    url: string;
  };
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: 6,
      }}
    >
      <EmptyState2 width={200} />
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="h6"
          component="h2"
          color={"primary"}
          sx={{
            fontFamily: "Roboto",
            fontWeight: 600,
            marginTop: "12px",
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontFamily: "Roboto",
            fontWeight: 400,
            marginTop: "12px",
            fontSize: "12px",
          }}
        >
          {subtitle}
        </Typography>

        <Link to={"/game/create-game"} style={{ textDecoration: "none" }}>
          <Button
            color={"secondary"}
            variant={"contained"}
            sx={{ marginTop: "20px" }}
          >
            {button.title}
          </Button>
        </Link>
      </Box>
    </Box>
  );
};

export default EmptyState;
