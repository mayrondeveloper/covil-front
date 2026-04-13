import * as service from "../../../services/publishers-service/publishers-service";
import { SimpleNameForm } from "../../../components/Form/SimpleNameForm";

export const CreatePublishers = () => (
  <SimpleNameForm
    title="Cadastrar editora"
    entityName="Editora"
    service={service}
    parentCrumb={{ label: "Catálogo", to: "/game" }}
  />
);
