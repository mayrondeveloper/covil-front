import { InputAdornment, TextField, IconButton } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useEffect, useState } from "react";

interface SearchFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  debounceMs?: number;
  width?: number | string;
}

export const SearchField = ({
  value,
  onChange,
  placeholder = "Buscar…",
  debounceMs = 350,
  width = 320,
}: SearchFieldProps) => {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    if (local === value) return;
    const t = setTimeout(() => onChange(local), debounceMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <TextField
      size="small"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      placeholder={placeholder}
      sx={{ width }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchRoundedIcon fontSize="small" sx={{ color: "text.disabled" }} />
          </InputAdornment>
        ),
        endAdornment: local ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => setLocal("")} aria-label="Limpar busca">
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : undefined,
      }}
    />
  );
};

export default SearchField;
