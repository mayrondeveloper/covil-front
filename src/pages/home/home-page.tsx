import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Paper,
  Typography,
} from "@mui/material";
import { fetch } from "../../services/game-service/game-service";
import { fetch as fetchAll } from "../../services/categories-service/categories-service";
import React, { useEffect, useState, useCallback } from "react";
import PersistentDrawerLeft from "../../components/wrapperDrawer/PersistentDrawerLeft";
import { Link } from "react-router-dom";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

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
    <PersistentDrawerLeft>
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
        <Link to={"/"} style={{ textDecoration: "none", color: "#212121" }}>
          Dragão de ouro
        </Link>
      </Box>
      <Typography
        variant="h6"
        component="h2"
        color={"#e85300"}
        sx={{ fontFamily: "Roboto", fontWeight: 600, margin: "80px 0 30px 0" }}
      >
        Cadastre
      </Typography>
      <Box
        sx={{
          padding: 0,
          margin: "30px 0",
          display: "flex",
          flexDirection: "row",
          alignContent: "flex-start",
          gap: 2,
        }}
      >
        <Paper
          sx={{
            height: "max-content",
            width: "100%",
            display: "flex",
            gap: 2,
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Card
            sx={{
              minHeight: 200,
              display: "flex",
              gap: 2,
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/*<CardMedia*/}
            {/*  sx={{ height: 140 }}*/}
            {/*  image={Image}*/}
            {/*  title="dragaodeouro"*/}
            {/*/>*/}
            <CardContent>
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                fontWeight={"600"}
              >
                Cadastrar Jogo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cadastre um jogo com categoria, mecânica e outros diversos
                atributos.
              </Typography>
            </CardContent>
            <CardActions sx={{ padding: 2 }}>
              <Link
                to={"/game/create-game"}
                style={{ textDecoration: "none", color: "#212121" }}
              >
                <Button size="medium" variant="contained" color={"secondary"}>
                  Cadastrar
                </Button>
              </Link>
            </CardActions>
          </Card>
        </Paper>
        <Paper
          sx={{
            height: "max-content",
            width: "100%",
            display: "flex",
            gap: 2,
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Card
            sx={{
              minHeight: 200,
              display: "flex",
              gap: 2,
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/*<CardMedia*/}
            {/*  sx={{ height: 140 }}*/}
            {/*  image={Image}*/}
            {/*  title="dragaodeouro"*/}
            {/*/>*/}
            <CardContent>
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                fontWeight={"600"}
              >
                Cadastrar prêmio
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cadastrar um prêmio com jogos, categorias e participantes.
              </Typography>
            </CardContent>
            <CardActions sx={{ padding: 2 }}>
              <Link
                to={"/awards/create-awards"}
                style={{ textDecoration: "none", color: "#212121" }}
              >
                <Button size="medium" variant="contained" color={"secondary"}>
                  Cadastrar
                </Button>
              </Link>
            </CardActions>
          </Card>
        </Paper>
        <Paper
          sx={{
            height: "max-content",
            width: "100%",
            display: "flex",
            gap: 2,
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Card
            sx={{
              minHeight: 200,
              display: "flex",
              gap: 2,
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/*<CardMedia*/}
            {/*  sx={{ height: 140 }}*/}
            {/*  image={Image}*/}
            {/*  title="dragaodeouro"*/}
            {/*/>*/}
            <CardContent>
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                fontWeight={"600"}
              >
                Cadastrar votos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cadastre votos para um prêmio específico.
              </Typography>
            </CardContent>
            <CardActions sx={{ padding: 2 }}>
              <Link
                to={"/awards/create-votes"}
                style={{ textDecoration: "none", color: "#212121" }}
              >
                <Button size="medium" variant="contained" color={"secondary"}>
                  Cadastrar
                </Button>
              </Link>
            </CardActions>
          </Card>
        </Paper>
      </Box>
      <Typography
        variant="h6"
        component="h2"
        color={"#e85300"}
        sx={{ fontFamily: "Roboto", fontWeight: 600, margin: "80px 0 30px 0" }}
      >
        Consulte
      </Typography>
      <Box
        sx={{
          padding: 0,
          margin: "30px 0",
          display: "flex",
          flexDirection: "row",
          alignContent: "flex-start",
          height: "calc(100vh - 112px)",
          gap: 2,
        }}
      >
        <Paper
          sx={{
            height: "max-content",
            width: "100%",
            display: "flex",
            gap: 2,
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Card
            sx={{
              minHeight: 200,
              display: "flex",
              gap: 2,
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <CardContent>
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                fontWeight={"600"}
              >
                Jogos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Veja a lista de jogos, edite e delete items.
              </Typography>
            </CardContent>
            <CardActions sx={{ padding: 2 }}>
              <Link
                to={"/game"}
                style={{ textDecoration: "none", color: "#212121" }}
              >
                <Button size="medium" variant="contained" color={"secondary"}>
                  Ver jogos
                </Button>
              </Link>
            </CardActions>
          </Card>
        </Paper>
        <Paper
          sx={{
            height: "max-content",
            width: "100%",
            display: "flex",
            gap: 2,
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Card
            sx={{
              minHeight: 200,
              display: "flex",
              gap: 2,
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <CardContent>
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                fontWeight={"600"}
              >
                Geradores de conteúdo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Veja a lista dos geradores de conteúdo, edite e exclua.
              </Typography>
            </CardContent>
            <CardActions sx={{ padding: 2 }}>
              <Link
                to={"/awards/create-participants"}
                style={{ textDecoration: "none", color: "#212121" }}
              >
                <Button size="medium" variant="contained" color={"secondary"}>
                  Ver lista
                </Button>
              </Link>
            </CardActions>
          </Card>
        </Paper>
        <Paper
          sx={{
            height: "max-content",
            width: "100%",
            display: "flex",
            gap: 2,
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Card
            sx={{
              minHeight: 200,
              display: "flex",
              gap: 2,
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <CardContent>
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                fontWeight={"600"}
              >
                Premiações
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Consulte os prêmios e os jogos vencedores.
              </Typography>
            </CardContent>
            <CardActions sx={{ padding: 2 }}>
              <Link
                to={"/awards/view-award-and-category-places"}
                style={{ textDecoration: "none", color: "#212121" }}
              >
                <Button size="medium" variant="contained" color={"secondary"}>
                  Consultar
                </Button>
              </Link>
            </CardActions>
          </Card>
        </Paper>
      </Box>
    </PersistentDrawerLeft>
  );
};
