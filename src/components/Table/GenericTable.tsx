import * as React from "react";
import {
  Box,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

export interface TableColumn<T> {
  header: string;
  align?: "left" | "right" | "center";
  width?: number | string;
  hideOnMobile?: boolean;
  /** Campo do backend a usar quando a coluna for clicada para ordenar. */
  sortField?: string;
  render: (row: T) => React.ReactNode;
}

export interface TableSortState {
  orderBy?: string;
  order?: "asc" | "desc";
  onChange: (orderBy: string | undefined, order: "asc" | "desc" | undefined) => void;
}

export interface TableAction<T> {
  icon: "edit" | "delete" | React.ReactNode;
  color?: "primary" | "secondary" | "warning" | "error" | "info" | "success" | "default";
  onClick: (row: T) => void;
  tooltip?: string;
}

export interface TablePaginationState {
  page: number; // 1-based
  rowsPerPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  rowsPerPageOptions?: number[];
}

export interface GenericTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  rowKey: (row: T) => string | number;
  emptyMessage?: string;
  emptyHint?: string;
  dense?: boolean;
  pagination?: TablePaginationState;
  toolbar?: React.ReactNode;
  sort?: TableSortState;
  loading?: boolean;
}

const renderActionIcon = (icon: TableAction<never>["icon"]) => {
  if (icon === "edit") return <EditRoundedIcon fontSize="small" />;
  if (icon === "delete") return <DeleteForeverRoundedIcon fontSize="small" />;
  return icon;
};

export function GenericTable<T>({
  data,
  columns,
  actions = [],
  rowKey,
  emptyMessage = "Nenhum registro encontrado",
  emptyHint,
  dense = false,
  pagination,
  toolbar,
  sort,
  loading = false,
}: GenericTableProps<T>) {
  const handleSortClick = (field: string) => {
    if (!sort) return;
    if (sort.orderBy === field) {
      if (sort.order === "asc") sort.onChange(field, "desc");
      else if (sort.order === "desc") sort.onChange(undefined, undefined); // 3o clique limpa
      else sort.onChange(field, "asc");
    } else {
      sort.onChange(field, "asc");
    }
  };
  const colCount = columns.length + (actions.length ? 1 : 0);

  return (
    <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
      {toolbar && (
        <Box
          sx={{
            p: 2,
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            alignItems: "center",
          }}
        >
          {toolbar}
        </Box>
      )}
      <Table size={dense ? "small" : "medium"}>
        <TableHead>
          <TableRow>
            {columns.map((col) => {
              const sortable = Boolean(sort && col.sortField);
              const active = sortable && sort?.orderBy === col.sortField;
              return (
                <TableCell
                  key={col.header}
                  align={col.align ?? "left"}
                  sortDirection={active ? sort?.order : false}
                  sx={{
                    width: col.width,
                    ...(col.hideOnMobile && { display: { xs: "none", md: "table-cell" } }),
                  }}
                >
                  {sortable ? (
                    <TableSortLabel
                      active={active}
                      direction={active ? sort?.order : "asc"}
                      onClick={() => handleSortClick(col.sortField!)}
                      sx={{
                        "&.MuiTableSortLabel-root": {
                          color: "inherit",
                          textTransform: "inherit",
                          letterSpacing: "inherit",
                        },
                        "&.Mui-active": { color: "secondary.main" },
                        "& .MuiTableSortLabel-icon": { color: "inherit !important" },
                      }}
                    >
                      {col.header}
                    </TableSortLabel>
                  ) : (
                    col.header
                  )}
                </TableCell>
              );
            })}
            {actions.length > 0 && (
              <TableCell align="right" padding="none" sx={{ width: 1, pr: 1.5 }}>
                Ações
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && !data?.length ? (
            Array.from({ length: pagination?.rowsPerPage ?? 5 }).map((_, rowIdx) => (
              <TableRow key={`sk-${rowIdx}`}>
                {columns.map((col) => {
                  const width = `${60 + Math.floor(Math.random() * 36)}%`;
                  return (
                    <TableCell
                      key={col.header}
                      align={col.align ?? "left"}
                      sx={
                        col.hideOnMobile
                          ? { display: { xs: "none", md: "table-cell" } }
                          : undefined
                      }
                    >
                      <Skeleton variant="text" width={width} />
                    </TableCell>
                  );
                })}
                {actions.length > 0 && (
                  <TableCell
                    align="right"
                    padding="none"
                    sx={{ whiteSpace: "nowrap", width: 1, pr: 1.5 }}
                  >
                    <Stack direction="row" gap={0.5} justifyContent="flex-end">
                      {actions.map((_, i) => (
                        <Skeleton key={i} variant="circular" width={22} height={22} />
                      ))}
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : data?.length ? (
            data.map((row) => (
              <TableRow key={rowKey(row)} hover>
                {columns.map((col) => (
                  <TableCell
                    key={col.header}
                    align={col.align ?? "left"}
                    sx={
                      col.hideOnMobile
                        ? { display: { xs: "none", md: "table-cell" } }
                        : undefined
                    }
                  >
                    {col.render(row)}
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell
                    align="right"
                    padding="none"
                    sx={{ whiteSpace: "nowrap", width: 1, pr: 1.5 }}
                  >
                    {actions.map((action, idx) => (
                      <Tooltip
                        key={idx}
                        title={
                          action.tooltip ??
                          (action.icon === "delete" ? "Excluir" : "Editar")
                        }
                      >
                        <IconButton
                          size="small"
                          color={action.color === "default" ? undefined : action.color}
                          onClick={() => action.onClick(row)}
                        >
                          {renderActionIcon(action.icon)}
                        </IconButton>
                      </Tooltip>
                    ))}
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={colCount} sx={{ py: 8, border: 0 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                  {emptyHint && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {emptyHint}
                    </Typography>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {pagination && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page - 1}
          onPageChange={(_e, p) => pagination.onPageChange(p + 1)}
          rowsPerPage={pagination.rowsPerPage}
          onRowsPerPageChange={(e) =>
            pagination.onRowsPerPageChange(parseInt(e.target.value, 10))
          }
          rowsPerPageOptions={pagination.rowsPerPageOptions ?? [10, 25, 50, 100]}
          labelRowsPerPage="Por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      )}
    </TableContainer>
  );
}
