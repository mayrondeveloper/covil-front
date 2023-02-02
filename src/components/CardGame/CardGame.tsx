import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const CardGame = ({ colocacao, jogo, index }: any) => {
  function colorIcon() {
    if (index + 1 === 1) {
      return "#ffd700";
    } else if (index + 1 === 2) {
      return "#81807e";
    } else {
      return "#d4c88c";
    }
  }

  return (
    <Card sx={{ width: "100%" }}>
      <CardActionArea>
        {/*<CardMedia*/}
        {/*  component="img"*/}
        {/*  height="140"*/}
        {/*  image="/static/images/cards/contemplative-reptile.jpg"*/}
        {/*  alt="green iguana"*/}
        {/*/>*/}

        <CardContent>
          <EmojiEventsIcon sx={{ color: colorIcon, marginBottom: "-3px" }} />
          <Typography
            sx={{
              display: "inline",
              fontSize: "20px",
              fontWeight: "600",
              position: "relative",
              margin: "-12px 0 0 8px",
            }}
            color={"primary"}
          >
            {colocacao}° lugar
          </Typography>
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            color={"primary"}
          >
            {jogo}
          </Typography>
          {/*<Typography variant="body2" color="text.secondary">*/}
          {/*  Lizards are a widespread group of squamate reptiles, with over 6,000*/}
          {/*  species, ranging across all continents except Antarctica*/}
          {/*</Typography>*/}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CardGame;
