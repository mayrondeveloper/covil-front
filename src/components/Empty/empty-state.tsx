import { Box, Button, Stack, Typography } from "@mui/material";
import { ReactComponent as DiceIllustration } from "../../images/empty-state/dice.svg";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  title: string;
  subtitle: string;
  button?: { title: string; url: string };
}

const EmptyState = ({ title, subtitle, button }: EmptyStateProps) => {
  return (
    <Stack spacing={3} alignItems="center" sx={{ py: 6 }}>
      <Box sx={{ opacity: 0.85 }}>
        <DiceIllustration width={160} />
      </Box>
      <Box sx={{ textAlign: "center", maxWidth: 440 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2">{subtitle}</Typography>
      </Box>
      {button && button.url && (
        <Button
          component={Link}
          to={button.url}
          variant="contained"
          color="secondary"
          size="large"
        >
          {button.title}
        </Button>
      )}
    </Stack>
  );
};

export default EmptyState;
