import { Fragment, useEffect } from "react";
import {
  Autocomplete,
  AutocompleteProps,
  CircularProgress,
  TextField,
  createFilterOptions,
} from "@mui/material";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { normalize } from "../../../../utils/text";

const accentInsensitiveFilter = createFilterOptions<any>({
  stringify: (option) => normalize(option?.name ?? ""),
});

interface OptionLike {
  id: string | number;
  name: string;
}

interface AsynchronousProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  id?: string;
  label: string;
  data: OptionLike[] | null | undefined;
  setData?: (value: any) => void;
  defaultValue?: any;
  resetField?: any;
  multiple?: boolean;
  required?: boolean;
  helperText?: string;
  size?: "small" | "medium";
  loading?: boolean;
  getOptionDisabled?: (option: OptionLike) => boolean;
}

export default function Asynchronous<T extends FieldValues>({
  control,
  name,
  id,
  label,
  data,
  setData,
  defaultValue,
  multiple = true,
  required = false,
  helperText,
  size = "small",
  loading = false,
  getOptionDisabled,
}: AsynchronousProps<T>) {
  const options = data ?? [];

  useEffect(() => {
    if (!setData) return;
    const isEmpty =
      defaultValue == null ||
      (Array.isArray(defaultValue) && defaultValue.length === 0);
    if (!isEmpty) setData(defaultValue);
  }, [defaultValue, setData]);

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
        const errMessage = fieldState.error?.type === "required" ? "Campo obrigatório" : undefined;

        return (
          <Autocomplete
            multiple={multiple}
            id={id ?? (name as string)}
            sx={{ width: "100%" }}
            options={options}
            loading={loading}
            value={field.value ?? (multiple ? [] : null)}
            isOptionEqualToValue={(o: any, v: any) => (o?.id ?? o) === (v?.id ?? v)}
            getOptionLabel={(option: any) => option?.name ?? ""}
            getOptionDisabled={getOptionDisabled}
            filterOptions={(opts, state) =>
              accentInsensitiveFilter(opts, { ...state, inputValue: normalize(state.inputValue) })
            }
            onChange={(_e, next) => {
              field.onChange(next);
              setData?.(next);
            }}
            noOptionsText="Sem resultados"
            loadingText="Carregando…"
            ListboxProps={{
              style: { maxHeight: 320, overflowY: "auto" },
            }}
            slotProps={{
              popper: {
                modifiers: [
                  { name: "flip", enabled: true },
                  { name: "preventOverflow", enabled: true, options: { padding: 8 } },
                ],
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                size={size}
                label={label}
                required={required}
                error={Boolean(fieldState.error)}
                helperText={errMessage ?? helperText ?? " "}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <Fragment>
                      {loading ? <CircularProgress color="inherit" size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </Fragment>
                  ),
                }}
              />
            )}
          />
        );
      }}
    />
  );
}
