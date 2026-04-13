import { Grid } from "@mui/material";
import { ReactNode } from "react";

interface FormRowProps {
  children: ReactNode;
  spacing?: number;
}

export const FormRow = ({ children, spacing = 3 }: FormRowProps) => (
  <Grid container spacing={spacing}>
    {children}
  </Grid>
);

interface FormColProps {
  children: ReactNode;
  span?: number;
  md?: number;
}

export const FormCol = ({ children, span = 12, md }: FormColProps) => (
  <Grid item xs={12} sm={span} md={md ?? span}>
    {children}
  </Grid>
);

export default FormRow;
