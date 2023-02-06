import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useEffect, useState, useCallback } from "react";
import { deleteGame, fetch } from "../../../services/game-service/game-service";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { styled } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
function createData(
  id: string,
  name: string,
  description: string,
  price: number,
  categories: number,
  publishers: any[],
  edit: string,
  excluded: string
) {
  return {
    id,
    name,
    description,
    price,
    categories,
    publishers,
    edit,
    excluded,
  };
}

export default function EnchancedTable({ data, setGames }: any) {
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const newData = data?.map((game: any): any => {
      const gamePublishers = game.publishers.map(
        (publisher: any) => publisher.publisher.name
      );
      const gameCategories = game.categories.map(
        (category: any) => category.category.name
      );
      return createData(
        game.id,
        game.name,
        game.description,
        game.price,
        gameCategories.join(", "),
        gamePublishers.join(", "),
        "Editar",
        "X"
      );
    });
    setRows(newData);
  }, [data]);

  const fetchGames = useCallback(() => {
    fetch()
      .then((r: any) => setGames(r.data))
      .catch((error: Error) => console.log(error));
  }, []);

  const editarJogo = (id: string) => {
    navigate(`/game/edit-game/${id}`);
  };

  const excluirJogo = (id: string) => {
    deleteGame(id)
      .then(() => fetchGames())
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
            <StyledTableCell>Jogo</StyledTableCell>
            <StyledTableCell align="right">Descrição</StyledTableCell>
            <StyledTableCell align="right">Preço</StyledTableCell>
            <StyledTableCell align="right">Categoria</StyledTableCell>
            <StyledTableCell align="right">Editora</StyledTableCell>
            <StyledTableCell align="right">Editar</StyledTableCell>
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
                {row.name}
              </TableCell>
              <TableCell align="right">{row.description}</TableCell>
              <TableCell align="right">{row.price}</TableCell>
              <TableCell align="right">{row.categories}</TableCell>
              <TableCell align="right">{row.publishers}</TableCell>
              <TableCell align="right">
                <EditIcon
                  sx={{ cursor: "pointer" }}
                  color={"primary"}
                  onClick={() => editarJogo(row.id)}
                />
              </TableCell>
              <TableCell align="right">
                <DeleteForeverRoundedIcon
                  sx={{ cursor: "pointer" }}
                  color={"warning"}
                  onClick={() => excluirJogo(row.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
