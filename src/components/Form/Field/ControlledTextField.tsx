import { TextField, TextFieldProps } from "@mui/material";
import { Control, Controller, FieldValues, Path, RegisterOptions } from "react-hook-form";

type Rules = Omit<RegisterOptions, "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled">;

interface ControlledTextFieldProps<T extends FieldValues>
  extends Omit<TextFieldProps, "name" | "defaultValue" | "value" | "onChange" | "onBlur" | "ref" | "error" | "helperText"> {
  name: Path<T>;
  control: Control<T>;
  rules?: Rules;
  helperText?: React.ReactNode;
}

const messageFor = (type?: string, rule?: any) => {
  switch (type) {
    case "required":
      return "Campo obrigatório";
    case "minLength":
      return `Mínimo ${rule?.value ?? ""} caracteres`;
    case "maxLength":
      return `Máximo ${rule?.value ?? ""} caracteres`;
    case "min":
      return `Valor mínimo ${rule?.value ?? ""}`;
    case "max":
      return `Valor máximo ${rule?.value ?? ""}`;
    case "pattern":
      return "Formato inválido";
    default:
      return "Campo inválido";
  }
};

export function ControlledTextField<T extends FieldValues>({
  name,
  control,
  rules,
  helperText,
  ...textFieldProps
}: ControlledTextFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules as any}
      render={({ field, fieldState }) => {
        const errType = fieldState.error?.type as string | undefined;
        const errMessage =
          fieldState.error?.message ||
          (errType ? messageFor(errType, (rules as any)?.[errType]) : undefined);
        return (
          <TextField
            fullWidth
            {...textFieldProps}
            {...field}
            value={field.value ?? ""}
            error={Boolean(fieldState.error)}
            helperText={errMessage ?? helperText ?? " "}
          />
        );
      }}
    />
  );
}

export default ControlledTextField;
