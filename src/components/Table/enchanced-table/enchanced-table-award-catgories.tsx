import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useEffect, useState, useCallback } from "react";
import {
  remove,
  fetch,
} from "../../../services/awards-categories-service/awards-categories-service";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { styled } from "@mui/material";

function createData(
  id: string,
  name: string,
  description: string,
  excluded: string
) {
  return { id, name, description, excluded };
}

export default function EnchancedTableAwardCategories({ data, setData }: any) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const newData = data?.map((dt: any): any => {
      return createData(dt.id, dt.name, dt.description, "X");
    });
    setRows(newData);
  }, [data]);

  const fetchCategories = useCallback(() => {
    fetch()
      .then((r: any) => setData(r.data))
      .catch((error: Error) => console.log(error));
  }, []);

  const excluirJogo = (id: string) => {
    remove(id)
      .then(() => fetchCategories())
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
            <StyledTableCell>Nome</StyledTableCell>
            <StyledTableCell align="right">Descrição</StyledTableCell>
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
              <TableCell align={"right"}>{row.description}</TableCell>
              <TableCell
                sx={{ cursor: "pointer" }}
                align="right"
                onClick={() => excluirJogo(row.id)}
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
