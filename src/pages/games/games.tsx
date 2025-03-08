import EnhancedTable from "../../components/Table/enchanced-table/enchanced-table";
import {Box, Button, Paper, Typography} from "@mui/material";
import {fetch} from "../../services/game-service/game-service";
import {fetch as fetchAll} from "../../services/categories-service/categories-service";
import React, {useEffect, useState, useCallback} from "react";
import PersistentDrawerLeft from "../../components/wrapperDrawer/PersistentDrawerLeft";
import {Link} from "react-router-dom";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EmptyState from "../../components/Empty/empty-state";

export const Games = () => {
    const [games, setGames] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchGames();
    }, []);

    useEffect(() => {
        fetchCategories();
    }, []);

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
                <Paper elevation={0} sx={{padding: "30px 20px", width: "100%"}}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            fontSize: "12px",
                            marginBottom: 4,
                        }}
                    >
                        <Link to={"/"} style={{textDecoration: "none", color: "#212121"}}>
                            Home
                        </Link>
                        <ChevronRightIcon sx={{fontSize: "18px"}}/>
                        <Link
                            to={"/game"}
                            style={{textDecoration: "none", color: "#212121"}}
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
                            sx={{fontFamily: "Roboto", fontWeight: 600}}
                        >
                            Jogos
                        </Typography>

                        {games.length >= 1 && (
                            <Box style={{display: "flex"}}>
                                <Link
                                    to={"/game/create-game"}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        textDecoration: "none",
                                        color: "#212121"
                                    }}
                                >
                                    <Button style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}><AddBoxIcon color={"secondary"}
                                                   sx={{fontSize: "18px", padding: 0, margin: 0}}/> Adicionar
                                        manualmente</Button>
                                </Link>
                                <Link
                                    to={"/game/add-by-link"}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        textDecoration: "none",
                                        color: "#212121"
                                    }}
                                >
                                    <Button style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}><AddBoxIcon color={"secondary"}
                                                   sx={{fontSize: "18px", padding: 0, margin: 0}}/> Adicionar via
                                        link</Button>
                                </Link>
                            </Box>
                        )}
                    </Box>

                    {games.length >= 1 ? (
                        <Box sx={{marginTop: 4, width: "100%"}}>
                            <EnhancedTable data={games} setGames={setGames}/>
                        </Box>
                    ) : (
                        <EmptyState
                            title={"Nenhum jogo cadastrado"}
                            subtitle={"Clique no botão abaixo para cadastrar um novo jogo"}
                            button={{title: "Adicionar jogo", url: ""}}
                        />
                    )}
                </Paper>
            </Box>
        </PersistentDrawerLeft>
    );
};
