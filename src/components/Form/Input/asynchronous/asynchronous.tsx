import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import { useState, useEffect, Fragment } from "react";
import { Controller } from "react-hook-form";
import { AutocompleteChangeReason } from "@mui/material";

interface Categories {
  id: string;
  name: string;
  multiple: boolean;
  image: [];
  video: [];
  link: [];
}

export default function Asynchronous({
  resetField,
  setData,
  control,
  id,
  label,
  name,
  data,
  multiple = true,
}: any) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState([]);
  const [options, setOptions] = useState<Categories[]>([]);
  const loading = open && options.length === 0;

  useEffect(() => {
    setValue([]);
  }, [resetField]);

  useEffect(() => {
    if (!data) return;
    let active = true;

    if (!loading) {
      return undefined;
    }

    if (active) {
      setOptions(data);
    }

    return () => {
      active = false;
    };
  }, [loading]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }: any) => {
        return (
          <Autocomplete
            multiple={multiple}
            id={id}
            sx={{ width: "100%" }}
            open={open}
            onOpen={() => {
              setOpen(true);
            }}
            onClose={() => {
              setOpen(false);
            }}
            isOptionEqualToValue={(option: any, value) =>
              option?.id === value.id
            }
            getOptionLabel={(option) => option.name || ""}
            options={options}
            loading={loading}
            onChange={(a: any, d: any, reason: AutocompleteChangeReason) => {
              setValue(d);
              setData(d);
            }}
            value={value}
            renderInput={(params) => (
              <TextField
                {...params}
                size={"small"}
                label={label}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <Fragment>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
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
