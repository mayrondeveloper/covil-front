import {
    Box,
    Button,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { create, fetch } from "../../../services/awards-categories-service/awards-categories-service";
import {useState, useCallback, useEffect} from "react";
import { useForm, Controller } from "react-hook-form";
import ResponsiveAppBar from "../../../components/AppBar/ResponsiveAppBar";
import DrawerAwards from "../../../components/Drawer/awards";
import EnchancedTableAwards from "../../../components/Table/enchanced-table/enchanced-table-awards";

const defaultValues = {
    name: "",
    description: "",
}

export const CreateAwardCategories = () => {
    const [resetField, setResetField] = useState(false);
    const [, setLoading] = useState(false);

    const sendAward = (data: any) => {
        setLoading(true);
        create(data)
            .then((r) => {
                fetchAwards();
                resetAsyncForm();
                setResetField(!resetField);
            })
            .catch((error) => setLoading(false));
    };

    // FORM
    const [awards, setAwards] = useState(null);

    const { handleSubmit, control, formState, reset } = useForm({defaultValues});
    const { errors } = formState;

    const resetAsyncForm = useCallback(async () => reset(defaultValues), [reset]);

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
        <>
            <ResponsiveAppBar />
            <Box sx={{ padding: 0, display: "flex", flexDirection: "row", height: 'calc(100vh - 69px)' }}>
                <DrawerAwards />
                <Paper elevation={0} sx={{ padding: "30px 20px", width: "100%" }}>
                    <Typography
                        variant="h5"
                        component="h1"
                        
                        sx={{ fontFamily: "Roboto", fontWeight: 600 }}
                    >
                        Cadastrar categoria do prêmio
                    </Typography>

                    <Box sx={{ marginTop: 4 }}>
                        <form
                            onSubmit={handleSubmit((data) => {
                                sendAward(data);
                            })}
                        >
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={{ xs: 1, sm: 2, md: 4 }}
                            >
                                <Box sx={{ width: "100%" }}>
                                    <Controller
                                        render={({ field }: any) => (
                                            <TextField size={"small"} 
                                                sx={{ width: "100%" }}
                                                label="Nome da categoria"
                                                variant="outlined"
                                                {...field}
                                            />
                                        )}
                                        name="name"
                                        rules={{ required: true }}
                                        control={control}
                                    />
                                    {errors.name?.type === "required" && (
                                        <Typography
                                            role="alert"
                                            color={'error'}
                                            sx={{ fontSize: "12px" }}
                                        >
                                            Campo obrigatório
                                        </Typography>
                                    )}
                                </Box>
                                <Box sx={{ width: "100%" }}>
                                    <Controller
                                        render={({ field }: any) => (
                                            <TextField size={"small"}
                                                       sx={{ width: "100%" }}
                                                       label="Descrição"
                                                       variant="outlined"
                                                       {...field}
                                            />
                                        )}
                                        name="description"
                                        rules={{ required: true }}
                                        control={control}
                                    />
                                    {errors.description?.type === "required" && (
                                        <Typography
                                            role="alert"
                                            color={'error'}
                                            sx={{ fontSize: "12px" }}
                                        >
                                            Campo obrigatório
                                        </Typography>
                                    )}
                                </Box>
                            </Stack>
                            <Box sx={{ marginTop: 2 }}>
                                <Button type="submit" variant="contained" color={'secondary'}>
                                    Enviar
                                </Button>
                            </Box>
                        </form>
                        <Paper elevation={0} sx={{ marginTop: 6,  width: "100%" }}>
                            <Typography
                                variant="h5"
                                component="h1"

                                sx={{ fontFamily: "Roboto", fontWeight: 600 }}
                            >
                                Prêmios
                            </Typography>

                            <Box sx={{width: "100%" }}>
                                <EnchancedTableAwards data={awards} setAwards={setAwards} refresh={resetField}/>
                            </Box>
                        </Paper>
                    </Box>
                </Paper>
            </Box>
        </>
    );
};
