import * as service from "../../../services/categories-service/categories-service";
import { SimpleNameForm } from "../../../components/Form/SimpleNameForm";

export const CreateCategories = () => (
  <SimpleNameForm
    title="Cadastrar categoria"
    entityName="Categoria"
    service={service}
    parentCrumb={{ label: "Catálogo", to: "/game" }}
  />
);
