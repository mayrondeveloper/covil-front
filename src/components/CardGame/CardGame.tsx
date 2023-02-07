import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Grid,
  Avatar,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import * as React from "react";
import { useEffect, useState } from "react";
import { deepOrange } from "@mui/material/colors";

const CardGame = ({ colocacao, jogo, index, image, editora }: any) => {
  const [publishers, setPublishers] = useState([]);

  function colorIcon() {
    if (index + 1 === 1) {
      return "#ffd700";
    } else if (index + 1 === 2) {
      return "#81807e";
    } else {
      return "#debb2c";
    }
  }

  useEffect(() => {
    const editorasArr = editora.map(
      (edit: { publisher: { name: string } }): any => edit.publisher.name
    );
    setPublishers(editorasArr);
  }, [editora]);

  return (
    <Card sx={{ width: "33%" }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="250px"
          image={image}
          sx={{ objectFit: "contain" }}
          alt="game-cover"
        />

        <CardContent sx={{ display: "flex" }}>
          <EmojiEventsIcon sx={{ color: colorIcon, fontSize: "35px" }} />
          <Box sx={{ margin: "-4px 0px 0px 9px" }}>
            <Typography
              sx={{
                display: "inline",
                fontSize: "20px",
                fontWeight: "600",
                position: "relative",
              }}
              color={"primary"}
            >
              {colocacao}° lugar
            </Typography>
            <Typography
              gutterBottom
              variant="body2"
              component="div"
              color={"primary"}
            >
              {jogo}
            </Typography>
            <Typography
              gutterBottom
              variant="caption"
              component="div"
              color={"dimgray"}
            >
              <b>Editora:</b> {publishers.join(", ")}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CardGame;
