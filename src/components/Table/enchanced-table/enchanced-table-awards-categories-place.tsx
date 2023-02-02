import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useEffect, useState } from "react";
import { styled, Typography } from "@mui/material";

function createData(
  id: string,
  game: string,
  place: string,
  valor_do_voto: number
) {
  return { id, game, place, valor_do_voto };
}

export default function EnchancedTableAwardsCategoriesPlace({
  data,
  setData,
}: any) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const newData = data?.map((dt: any): any => {
      const votes = dt.votes.map(
        (vote: any) => `${vote.place}° (${vote.participant.name})`
      );
      const totalVotos = dt.votes.map((vote: any) => Number(vote.value_vote));
      var sum = totalVotos.reduce(function (soma: number, i: number) {
        return soma + i;
      });

      return createData(dt.id, dt.name, votes.join(", "), sum);
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
      {rows.length >= 1 ? (
        <>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontFamily: "Roboto", fontWeight: 600 }}
          >
            Jogos vencedores por votos
          </Typography>
          <TableContainer
            component={Paper}
            sx={{ margin: "40px 0", width: "100%" }}
          >
            <Table
              sx={{ minWidth: 650 }}
              size="small"
              aria-label="simple table"
            >
              <TableHead>
                <TableRow>
                  <StyledTableCell>Jogo</StyledTableCell>
                  <StyledTableCell align="right">
                    Votos (posições)
                  </StyledTableCell>
                  <StyledTableCell align="right">Total</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows?.map((row: any) => (
                  <TableRow
                    key={row.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.game}
                    </TableCell>
                    <TableCell align="right">{row.place}</TableCell>
                    <TableCell align="right">
                      {row.valor_do_voto} pontos
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <>Nenhum dado encontrado</>
      )}
    </>
  );
}
