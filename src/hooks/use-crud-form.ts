import { useCallback, useEffect, useState } from "react";
import {
  DefaultValues,
  FieldValues,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { AxiosResponse } from "axios";
import { useNotification } from "./use-notification";
import { Id } from "../services/types";

export interface CrudService<T extends FieldValues> {
  fetchOne?: (id: Id) => Promise<AxiosResponse<T>>;
  create: (data: Partial<T>) => Promise<AxiosResponse<T>>;
  update?: (id: Id, data: Partial<T>) => Promise<AxiosResponse<T>>;
}

export interface UseCrudFormOptions<T extends FieldValues> {
  service: CrudService<T>;
  defaultValues: DefaultValues<T>;
  id?: Id;
  entityName?: string;
  onSuccess?: (data: T) => void;
  mapToForm?: (entity: T) => DefaultValues<T>;
}

export interface UseCrudFormReturn<T extends FieldValues>
  extends UseFormReturn<T> {
  submit: (data: Partial<T>) => Promise<void>;
  loading: boolean;
  saving: boolean;
  isEdit: boolean;
}

export const useCrudForm = <T extends FieldValues>({
  service,
  defaultValues,
  id,
  entityName = "registro",
  onSuccess,
  mapToForm,
}: UseCrudFormOptions<T>): UseCrudFormReturn<T> => {
  const form = useForm<T>({ defaultValues });
  const { success, error: notifyError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEdit = id !== undefined && id !== null && id !== "";

  useEffect(() => {
    if (!isEdit || !service.fetchOne) return;
    setLoading(true);
    service
      .fetchOne(id as Id)
      .then((r) => {
        const values = mapToForm ? mapToForm(r.data) : (r.data as unknown as DefaultValues<T>);
        form.reset(values);
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = useCallback(
    async (data: Partial<T>) => {
      setSaving(true);
      try {
        const response =
          isEdit && service.update
            ? await service.update(id as Id, data)
            : await service.create(data);
        success(
          isEdit
            ? `${entityName} atualizado com sucesso!`
            : `${entityName} cadastrado com sucesso!`
        );
        if (!isEdit) form.reset(defaultValues);
        onSuccess?.(response.data);
      } catch (err) {
        notifyError(`Falha ao salvar ${entityName.toLowerCase()}.`);
      } finally {
        setSaving(false);
      }
    },
    [isEdit, id, entityName] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return { ...form, submit, loading, saving, isEdit };
};
