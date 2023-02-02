import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

const columns: GridColDef[] = [
  {
    field: "id",
    headerName: "id",
    width: 300,
    hide: true,
  },
  {
    field: "game",
    headerName: "Jogo",
    flex: 1,
    minWidth: 300,
  },
  {
    field: "votes",
    headerName: "Votos",
    flex: 1,
    minWidth: 300,
  },
  {
    field: "total",
    headerName: "Total de pontos",
    flex: 1,
    maxWidth: 200,
  },
];

export default function DataGridDefaultWiners({ data, setAwards }: any) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    if (!data) return;
    createData();
  }, [data]);

  const createData = () => {
    const row = data?.map((dt: any) => {
      const votes = dt.votes.map(
        (vote: any) => `${vote.place}° (${vote.participant.name})`
      );
      const totalVotos = dt.votes.map((vote: any) => Number(vote.value_vote));
      let sum = totalVotos.reduce(function (soma: number, i: number) {
        return soma + i;
      });
      return {
        id: dt.id,
        game: dt.name,
        votes: votes.join(" , "),
        total: sum,
      };
    });
    setRows(row);
  };

  return (
    <Box sx={{ height: "600px", width: "100%" }}>
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[5]}
        checkboxSelection={false}
        disableSelectionOnClick
        disableExtendRowFullWidth={true}
        experimentalFeatures={{ newEditingApi: true }}
      />
    </Box>
  );
}
