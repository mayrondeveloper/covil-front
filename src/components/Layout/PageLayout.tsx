import { Box } from "@mui/material";
import { ReactNode } from "react";
import PersistentDrawerLeft from "../wrapperDrawer/PersistentDrawerLeft";

interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: number | string;
}

export const PageLayout = ({ children, maxWidth = 1280 }: PageLayoutProps) => (
  <PersistentDrawerLeft>
    <Box
      sx={{
        maxWidth,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 5 },
        py: { xs: 3, sm: 4, md: 6 },
        width: "100%",
      }}
    >
      {children}
    </Box>
  </PersistentDrawerLeft>
);

export default PageLayout;
