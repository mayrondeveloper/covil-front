import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {useEffect, useState, useCallback} from "react";
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import {styled} from "@mui/material";
import {fetch, remove} from "../../../services/awards-service/awards-service";

function createData(
    id: string,
    name: string,
    description: string,
    image: string,
    created_by: string,
    year: string,
    excluded: string
) {
    return { id, name, description, image, created_by, year, excluded };
}


export default function EnchancedTableAwards({data, setAwards}: any) {

    const [rows, setRows] = useState([]);

    useEffect(() => {
        const newData = data?.map((award: any): any => {
            return createData(award.id, award.name, award.description, award.image, award.created_by, award.year, 'X')
        })
        setRows(newData);
    }, [data])

    const fetchAwards = useCallback(() => {
        fetch()
            .then((r: any) => setAwards(r.data))
            .catch((error: Error) => console.log(error));
    },[])

    const removeAward = (id: string) => {
        remove(id).then(() => fetchAwards())
            .catch((error: Error) => console.log(error));
    }
    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.common.black,
            color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    return (
        <TableContainer component={Paper} sx={{margin: '40px 0', width: '100%'}}>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Prêmio</StyledTableCell>
                        <StyledTableCell align="right">Descrição</StyledTableCell>
                        <StyledTableCell align="right">Imagem</StyledTableCell>
                        <StyledTableCell align="right">Criado por</StyledTableCell>
                        <StyledTableCell align="right">Ano do Prêmio</StyledTableCell>
                        <StyledTableCell align="right">Excluir</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows?.map((row: any) => (
                        <TableRow
                            key={row.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {row.name}
                            </TableCell>
                            <TableCell align="right">{row.description}</TableCell>
                            <TableCell align="right">{row.image}</TableCell>
                            <TableCell align="right">{row.created_by}</TableCell>
                            <TableCell align="right">{row.year}</TableCell>
                            <TableCell sx={{cursor: 'pointer'}} align="right" onClick={() => removeAward(row.id)}>
                                <DeleteForeverRoundedIcon color={"warning"}/>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}