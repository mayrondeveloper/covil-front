import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useEffect, useState, useCallback } from "react";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { styled } from "@mui/material";
import { fetch, remove } from "../../../services/votes/votes-service";

function createData(
  id: string,
  award: string,
  place: string,
  participant: string,
  category: string,
  game: string,
  excluded: string
) {
  return { id, award, place, participant, category, game, excluded };
}

export default function EnchancedTableVotes({ data, setData }: any) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const newData = data?.map((dt: any): any => {
      return createData(
        dt.id,
        dt.award.name,
        dt.place,
        dt.participant.name,
        dt.category.name,
        dt.game.name,
        "X"
      );
    });
    setRows(newData);
  }, [data]);

  const fetchAwards = useCallback(() => {
    fetch()
      .then((r: any) => setData(r.data))
      .catch((error: Error) => console.log(error));
  }, []);

  const removeAward = (id: string) => {
    remove(id)
      .then(() => fetchAwards())
      .catch((error: Error) => console.log(error));
  };
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
    <TableContainer component={Paper} sx={{ margin: "40px 0", width: "100%" }}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Prêmio</StyledTableCell>
            <StyledTableCell align="right">Posição</StyledTableCell>
            <StyledTableCell align="right">Participante</StyledTableCell>
            <StyledTableCell align="right">Categoria</StyledTableCell>
            <StyledTableCell align="right">Jogo</StyledTableCell>
            <StyledTableCell align="right">Excluir</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows?.map((row: any) => (
            <TableRow
              key={row.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.award}
              </TableCell>
              <TableCell align="right">{row.place}°</TableCell>
              <TableCell align="right">{row.participant}</TableCell>
              <TableCell align="right">{row.category}</TableCell>
              <TableCell align="right">{row.game}</TableCell>
              <TableCell
                sx={{ cursor: "pointer" }}
                align="right"
                onClick={() => removeAward(row.id)}
              >
                <DeleteForeverRoundedIcon color={"warning"} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
