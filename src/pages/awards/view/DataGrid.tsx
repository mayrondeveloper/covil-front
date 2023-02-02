import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

const columns: GridColDef[] = [
  {
    field: "id",
    headerName: "id",
  },
  {
    field: "award",
    headerName: "Prêmio",
    width: 150,
    editable: true,
  },
  {
    field: "description",
    headerName: "Descrição",
    resizable: true,
    editable: true,
  },
  {
    field: "created_by",
    headerName: "Criado por",
    type: "string",
    width: 110,
    editable: true,
  },
  {
    field: "year",
    headerName: "Ano do prêmio",
    width: 160,
  },
  {
    field: "categories",
    headerName: "Categorias",
    sortable: true,
    resizable: true,
  },
];

export default function DataGridDefault({ data, setAwards }: any) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    if (!data) return;
    createData();
  }, [data]);

  const createData = () => {
    const row = data?.map((award: any) => {
      const awards_categories = award?.awards_categories?.map(
        (categories: any) => categories?.categories?.name
      );
      return {
        id: award.id,
        award: award.name,
        created_by: award.created_by,
        description: award.description,
        year: award.year,
        categories: awards_categories,
      };
    });
    setRows(row);
  };

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection={false}
        disableSelectionOnClick
        experimentalFeatures={{ newEditingApi: true }}
      />
    </Box>
  );
}
