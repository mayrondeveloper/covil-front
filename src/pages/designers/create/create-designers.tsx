import * as service from "../../../services/designers-service/designers-service";
import { SimpleNameForm } from "../../../components/Form/SimpleNameForm";

export const CreateDesigners = () => (
  <SimpleNameForm
    title="Cadastrar designer"
    entityName="Designer"
    service={service}
    parentCrumb={{ label: "Catálogo", to: "/game" }}
  />
);
