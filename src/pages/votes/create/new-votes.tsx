import {
    Box,
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Paper,
    Typography,
} from "@mui/material";
import {create, fetch} from "../../../services/votes/votes-service";
import React, {useState, useCallback, useEffect} from "react";
import {useForm } from "react-hook-form";
import EnchancedTableVotes from "../../../components/Table/enchanced-table/enchanced-table-votes";
import {
    fetch as fetchCategories,
    fetchByAward
} from "../../../services/awards-categories-service/awards-categories-service";
import {fetch as fetchAllGames} from "../../../services/game-service/game-service";
import {fetch as fetchAllParticipants} from "../../../services/participants-service/participants-service";
import {fetch as fetchAllAwards} from "../../../services/awards-service/awards-service";
import PersistentDrawerLeft from "../../../components/wrapperDrawer/PersistentDrawerLeft";
import {Link} from "react-router-dom";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export const NewVotes = () => {
    const [resetField, setResetField] = useState(false);

    const [dataForSend, setDataForSend] = useState({
        place: '',
        id_vote: '',
        id_category: '',
        id_game: '',
        id_award: '',
    });
    const [dadosGerais, setDadosGerais] = useState<any>({});
    const [, setLoading] = useState(false);
    const [step, setStep] = useState(0);
    const [awards, setAwards] = useState([]);
    const [categories, setCategories] = useState([]);
    const [jogos, setJogos] = useState([]);
    const [participantes, setParticipantes] = useState([]);
        useState<any>([]);

    useEffect(() => {
        console.log(dadosGerais);
    }, [dadosGerais]);

    const sendAward = (data: any) => {
        setLoading(true);
        create(data)
            .then(() => {
                fetchVotes();
                setResetField(!resetField);
                handleClose();
                setStep(0);
                setDataForSend({
                    place: '',
                    id_vote: '',
                    id_category: '',
                    id_game: '',
                    id_award: '',
                });
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchAwards();
    }, []);

    const fetchAwards = useCallback(() => {
        fetchAllAwards()
            .then((r: any) => {
                setAwards(r.data);
            })
            .catch((error: Error) => console.log(error));
    }, []);

    // FORM
    const [data, setData] = useState(null);

    useEffect(() => {
        if (data) return;
        fetchVotes();
    }, [data]);

    const fetchVotes = useCallback(() => {
        fetch()
            .then((r: any) => setData(r.data))
            .catch((error: Error) => console.log(error));
    }, []);

    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setDataForSend({
            place: '',
            id_vote: '',
            id_category: '',
            id_game: '',
            id_award: '',
        });
        setStep(0);
    };

    const subtitulo = useCallback(() => {
        switch (step){
            case 0:
                return 'Escolha o prêmio'
                break;
            case 1:
                return 'Escolha o participante'
                break;
            case 2:
                return 'Escolha a categoria'
                break;
            case 3:
                return 'Escolha o jogo'
                break;
            case 4:
                return 'Escolha a colocação'
                break;
            default:
                return  ''
        }
    }, [step]);

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
                            to={"/awards/create-new-votes"}
                            style={{textDecoration: "none", color: "#212121"}}
                        >
                            Votos
                        </Link>
                    </Box>

                    <Box sx={{marginTop: 4}}>
                        <Paper elevation={0} sx={{marginTop: 6, width: "100%"}}>
                            <Box style={{display: 'flex', justifyContent: 'space-between'}}>
                                <Typography
                                    variant="h5"
                                    component="h1"
                                    sx={{fontFamily: "Roboto", fontWeight: 600}}
                                >
                                    Votos
                                </Typography>
                                <Button variant={'text'} color={'success'} onClick={handleClickOpen}> Cadastrar
                                    voto </Button>
                                <Dialog
                                    open={open}
                                    onClose={handleClose}
                                    maxWidth={'xl'}
                                    fullScreen={true}
                                >
                                    <DialogTitle>Cadastro de voto</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            {subtitulo()}
                                        </DialogContentText>
                                        <Box
                                            noValidate
                                            component="form"
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                m: 'auto',
                                                width: 'fit-content',
                                                marginTop: 8
                                            }}
                                        >
                                            <Box>
                                                {step === 0 &&
                                                    <Box>
                                                        {awards.map((award: any) => {
                                                            return (
                                                                <>
                                                                    <Paper elevation={3} sx={{
                                                                        m: 2,
                                                                        backgroundColor: dataForSend.id_vote === award.id ? '#e65100' : '',
                                                                    }}>
                                                                        <Button variant={'text'}
                                                                                sx={{width: '100%'}}
                                                                                onClick={(event: React.MouseEvent<HTMLButtonElement>): void => {
                                                                                    if (event.currentTarget.textContent === award.name) {
                                                                                        setCategories(award.awards_categories);
                                                                                        setJogos(award.games);
                                                                                        setParticipantes(award.participants);
                                                                                        setDadosGerais((prevState: any) => ({
                                                                                            ...prevState, 
                                                                                            award: award, // Atualiza apenas o id_vote
                                                                                        }));
                                                                                        setDataForSend(prevState => ({
                                                                                            ...prevState, 
                                                                                            id_award: award.id, // Atualiza apenas o id_vote
                                                                                        }));
                                                                                        setStep(1);
                                                                                    }
                                                                                }}>
                                                                            {award.name}
                                                                        </Button>
                                                                    </Paper>
                                                                </>
                                                            )
                                                        })}
                                                    </Box>
                                                }
                                              {step === 1 &&
                                                <Box>
                                                    {participantes.map((item: any) => {
                                                        return (
                                                            <>
                                                                <Paper elevation={3} sx={{
                                                                    m: 2,
                                                                    backgroundColor: dataForSend.id_vote === item.participant.id ? '#e65100' : '',
                                                                }}>
                                                                    <Button variant={'text'}
                                                                            sx={{width: '100%'}}
                                                                            onClick={(event: React.MouseEvent<HTMLButtonElement>): void => {
                                                                                if (event.currentTarget.textContent === item.participant.name) {
                                                                                    setDadosGerais((prevState: any) => ({
                                                                                        ...prevState, 
                                                                                        participant: item.participant, // Atualiza apenas o id_vote
                                                                                    }));
                                                                                    setDataForSend(prevState => ({
                                                                                        ...prevState, 
                                                                                        id_vote: item.participant.id, // Atualiza apenas o id_vote
                                                                                    }));
                                                                                    setStep(2);
                                                                                }
                                                                            }}>
                                                                        {item.participant.name}
                                                                    </Button>
                                                                </Paper>
                                                            </>
                                                        )
                                                    })}
                                                </Box>
                                              }
                                                {step === 2 &&
                                                    <Box>
                                                        {categories.map((category: any) => {
                                                            return (
                                                                <>
                                                                    <Paper elevation={3} sx={{
                                                                        m: 2,
                                                                        backgroundColor: dataForSend.id_vote === category.categories.id ? '#e65100' : '',
                                                                    }}>
                                                                        <Button variant={'text'}
                                                                                sx={{width: '100%'}}
                                                                                onClick={(event: React.MouseEvent<HTMLButtonElement>): void => {
                                                                                    if (event.currentTarget.textContent === category.categories.name) {
                                                                                        setDadosGerais((prevState: any) => ({
                                                                                            ...prevState, 
                                                                                            category: category.categories, // Atualiza apenas o id_vote
                                                                                        }));
                                                                                        setDataForSend(prevState => ({
                                                                                            ...prevState, 
                                                                                            id_category: category.categories.id, // Atualiza apenas o id_vote
                                                                                        }));
                                                                                        setStep(3);
                                                                                    }
                                                                                }}>
                                                                            {category.categories.name}
                                                                        </Button>
                                                                    </Paper>
                                                                </>
                                                            )
                                                        })}
                                                    </Box>
                                                }
                                                {step === 3 &&
                                                    <Box>
                                                        {jogos.map((item: any) => {
                                                            return (
                                                                <>
                                                                    <Paper elevation={3} sx={{
                                                                        m: 2,
                                                                        backgroundColor: dataForSend.id_vote === item.game.id ? '#e65100' : '',
                                                                    }}>
                                                                        <Button variant={'text'}
                                                                                sx={{width: '100%'}}
                                                                                onClick={(event: React.MouseEvent<HTMLButtonElement>): void => {
                                                                                    if (event.currentTarget.textContent === item.game.name) {
                                                                                        setDadosGerais((prevState: any) => ({
                                                                                            ...prevState, 
                                                                                            game: item.game, // Atualiza apenas o id_vote
                                                                                        }));
                                                                                        setDataForSend(prevState => ({
                                                                                            ...prevState, 
                                                                                            id_game: item.game.id, // Atualiza apenas o id_game
                                                                                        }));
                                                                                        setStep(4);
                                                                                    }
                                                                                }}>
                                                                            {item.game.name}
                                                                        </Button>
                                                                    </Paper>
                                                                </>
                                                            )
                                                        })}
                                                    </Box>
                                                }
                                                {step === 4 &&
                                                    <Box>
                                                        <Paper elevation={0}>
                                                            <Button variant={'text'}
                                                              sx={{width: '100%'}}
                                                              onClick={(event: React.MouseEvent<HTMLButtonElement>): void => {
                                                                  setDadosGerais((prevState: any) => ({
                                                                      ...prevState, 
                                                                      place: '1',
                                                                  }));    
                                                                  setDataForSend(prevState => ({
                                                                          ...prevState,
                                                                          place: '1',
                                                                      }));
                                                                      setStep(5);
                                                              }}>
                                                            1°lugar
                                                            </Button>
                                                            <Button variant={'text'}
                                                                    sx={{width: '100%'}}
                                                                    onClick={(event: React.MouseEvent<HTMLButtonElement>): void => {
                                                                        setDadosGerais((prevState: any) => ({
                                                                            ...prevState,
                                                                            place: '2',
                                                                        }));
                                                                        setDataForSend(prevState => ({
                                                                            ...prevState,
                                                                            place: '2',
                                                                        }));
                                                                        setStep(5);
                                                                    }}>
                                                                2°lugar
                                                            </Button>
                                                            <Button variant={'text'}
                                                                    sx={{width: '100%'}}
                                                                    onClick={(event: React.MouseEvent<HTMLButtonElement>): void => {
                                                                        setDadosGerais((prevState: any) => ({
                                                                            ...prevState,
                                                                            place: '3',
                                                                        }));
                                                                        setDataForSend(prevState => ({
                                                                            ...prevState,
                                                                            place: '3',
                                                                        }));
                                                                        setStep(5);
                                                                    }}>
                                                                3°lugar
                                                            </Button>
                                                        </Paper>
                                                    </Box>
                                                }
                                                {step === 5 &&
                                                    <Box>
                                                        <Box style={{display: "flex", flexDirection: 'column'}}>
                                                            <Typography variant={'h6'} color={'primary'} sx={{marginBottom: 3}}>
                                                                Confira seus dados para registro:
                                                            </Typography>
                                                            <Box>
                                                                <Typography><b>Prêmio:</b><span>{dadosGerais.award.name}</span></Typography>
                                                                <Typography><b>Participante:</b><span>{dadosGerais.participant.name}</span></Typography>
                                                                <Typography><b>Categoria:</b><span>{dadosGerais.category.name}</span></Typography>
                                                                <Typography><b>Jogo:</b><span>{dadosGerais.game.name}</span></Typography>
                                                                <Typography><b>Colocação:</b><span>{dadosGerais.place}° lugar</span></Typography>
                                                            </Box>
                                                            <Button  sx={{m:3}} variant={'contained'} color={'secondary'} onClick={() => {

                                                                sendAward(dataForSend);

                                                            }}>
                                                                Confirmar!
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                }
                                            </Box>
                                        </Box>
                                    </DialogContent>
                                </Dialog>

                            </Box>

                            <Box sx={{width: "100%"}}>
                                <EnchancedTableVotes
                                    data={data}
                                    setData={setData}
                                    refresh={resetField}
                                />
                            </Box>
                        </Paper>
                    </Box>
                </Paper>
            </Box>
        </PersistentDrawerLeft>
    );
};
