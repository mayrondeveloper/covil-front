import * as service from "../../../services/mechanisms-service/mechanisms-service";
import { SimpleNameForm } from "../../../components/Form/SimpleNameForm";

export const CreateMechanisms = () => (
  <SimpleNameForm
    title="Cadastrar mecanismo"
    entityName="Mecanismo"
    service={service}
    parentCrumb={{ label: "Catálogo", to: "/game" }}
  />
);
