import * as service from "../../../services/artists-service/artists-service";
import { SimpleNameForm } from "../../../components/Form/SimpleNameForm";

export const CreateArtists = () => (
  <SimpleNameForm
    title="Cadastrar artista"
    entityName="Artista"
    service={service}
    parentCrumb={{ label: "Catálogo", to: "/game" }}
  />
);
