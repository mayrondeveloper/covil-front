import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useEffect, useState } from "react";
import { styled } from "@mui/material";

function createData(
  id: string,
  game: string,
  category: string,
  place: string,
  participant: string,
  valor_do_voto: string
) {
  return { id, game, category, place, participant, valor_do_voto };
}

export default function EnchancedTableAwardsCategories({ data, setData }: any) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const newData = data?.map((dt: any): any => {
      const valorDoVoto = () => {
        if (dt.place === "1") {
          return "5";
        } else if (dt.place === "2") {
          return "3";
        } else if (dt.place === "3") {
          return "1";
        } else {
          return "0";
        }
      };
      return createData(
        dt.id,
        dt.game.name,
        dt.category.name,
        dt.place,
        dt.participant.name,
        valorDoVoto()
      );
    });
    setRows(newData);
  }, [data]);

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
    <>
      <TableContainer
        component={Paper}
        sx={{ margin: "40px 0", width: "100%" }}
      >
        <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Categoria</StyledTableCell>
              <StyledTableCell align="right">Jogo</StyledTableCell>
              <StyledTableCell align="right">Colocação</StyledTableCell>
              <StyledTableCell align="right">Participante</StyledTableCell>
              <StyledTableCell align="right">Valor do voto</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows?.map((row: any) => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.category}
                </TableCell>
                <TableCell align="right">{row.game}</TableCell>
                <TableCell align="right">{row.place}° lugar</TableCell>
                <TableCell align="right">{row.participant}</TableCell>
                <TableCell align="right">{row.valor_do_voto}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
