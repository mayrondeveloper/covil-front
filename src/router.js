import React, { Suspense, lazy } from "react";
import { createBrowserRouter, Link } from "react-router-dom";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { RequireAuth } from "./components/RequireAuth";

const lazyPage = (importer, named) =>
  lazy(() =>
    importer().then((mod) => ({ default: named ? mod[named] : mod.default }))
  );

const Games = lazyPage(() => import("./pages/games/games"), "Games");
const CreateGame = lazyPage(
  () => import("./pages/games/create/create-game"),
  "CreateGame"
);
const CreateCategories = lazyPage(
  () => import("./pages/categories/create/create-categories"),
  "CreateCategories"
);
const CreatePublishers = lazyPage(
  () => import("./pages/publishers/create/create-publishers"),
  "CreatePublishers"
);
const CreateArtists = lazyPage(
  () => import("./pages/artists/create/create-artists"),
  "CreateArtists"
);
const CreateMechanisms = lazyPage(
  () => import("./pages/mechanisms/create/create-mechanisms"),
  "CreateMechanisms"
);
const CreateDesigners = lazyPage(
  () => import("./pages/designers/create/create-designers"),
  "CreateDesigners"
);
const HomePage = lazyPage(() => import("./pages/home/home-page"), "HomePage");
const CreateAwards = lazyPage(
  () => import("./pages/awards/create/create-awards"),
  "CreateAwards"
);
const CreateAwardCategories = lazyPage(
  () => import("./pages/award-categories/create/create-award-categories"),
  "CreateAwardCategories"
);
const DragaoDeOuro = lazyPage(
  () => import("./pages/dragao-de-ouro/create/dragao-de-ouro"),
  "DragaoDeOuro"
);
const CreateAwardParticipants = lazyPage(
  () => import("./pages/award-participants/create/create-award-participants"),
  "CreateAwardParticipants"
);
const ViewAwardAndCategory = lazyPage(
  () => import("./pages/awards/view/view-award-and-categories"),
  "ViewAwardAndCategory"
);
const ViewAwardAndCategoryPlaces = lazyPage(
  () => import("./pages/awards/view/view-award-and-categories-places"),
  "ViewAwardAndCategoryPlaces"
);
const WinnersOverview = lazyPage(
  () => import("./pages/awards/view/winners-overview"),
  "WinnersOverview"
);
const PodiumOverview = lazyPage(
  () => import("./pages/awards/view/podium-overview"),
  "PodiumOverview"
);
const Announcement = lazyPage(
  () => import("./pages/awards/view/announcement"),
  "Announcement"
);
const AddByLink = lazyPage(
  () => import("./pages/games/add-by-link/add-by-link"),
  "AddByLink"
);
const BulkAddByLink = lazyPage(
  () => import("./pages/games/add-by-link/bulk-add-by-link"),
  "BulkAddByLink"
);
const NewVotes = lazyPage(
  () => import("./pages/votes/create/new-votes"),
  "NewVotes"
);
const BulkVotes = lazyPage(
  () => import("./pages/votes/create/bulk-votes"),
  "BulkVotes"
);
const AdminSettings = lazyPage(
  () => import("./pages/admin/admin-settings"),
  "AdminSettings"
);
const LoginPage = lazyPage(
  () => import("./pages/login/login-page"),
  "LoginPage"
);

const PageFallback = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "60vh",
    }}
  >
    <CircularProgress />
  </Box>
);

const NotFound = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "70vh",
      gap: 2,
    }}
  >
    <Typography variant="h3">404</Typography>
    <Typography variant="body1">Página não encontrada.</Typography>
    <Button component={Link} to="/" variant="contained">
      Voltar para o início
    </Button>
  </Box>
);

const withSuspense = (element) => (
  <Suspense fallback={<PageFallback />}>{element}</Suspense>
);

const guarded = (element) => (
  <RequireAuth>{withSuspense(element)}</RequireAuth>
);

export const router = createBrowserRouter([
  { path: "/login", element: withSuspense(<LoginPage />) },
  { path: "/", element: guarded(<HomePage />) },
  { path: "/game", element: guarded(<Games />) },
  { path: "/game/create-game", element: guarded(<CreateGame />) },
  { path: "/game/edit-game/:id", element: guarded(<CreateGame />) },
  { path: "/game/create-category", element: guarded(<CreateCategories />) },
  { path: "/game/create-publisher", element: guarded(<CreatePublishers />) },
  { path: "/game/create-artist", element: guarded(<CreateArtists />) },
  { path: "/game/create-mechanism", element: guarded(<CreateMechanisms />) },
  { path: "/game/create-designer", element: guarded(<CreateDesigners />) },
  { path: "/game/add-by-link", element: guarded(<AddByLink />) },
  { path: "/game/bulk-add-by-link", element: guarded(<BulkAddByLink />) },
  { path: "/awards", element: guarded(<DragaoDeOuro />) },
  { path: "/awards/create-awards", element: guarded(<CreateAwards />) },
  { path: "/awards/edit-awards/:id", element: guarded(<CreateAwards />) },
  { path: "/awards/create-category", element: guarded(<CreateAwardCategories />) },
  { path: "/awards/create-new-votes", element: guarded(<NewVotes />) },
  { path: "/awards/create-bulk-votes", element: guarded(<BulkVotes />) },
  { path: "/awards/create-participants", element: guarded(<CreateAwardParticipants />) },
  { path: "/awards/winners", element: guarded(<WinnersOverview />) },
  { path: "/awards/podium", element: guarded(<PodiumOverview />) },
  { path: "/awards/:id/announcement", element: guarded(<Announcement />) },
  { path: "/awards/view-award-and-category", element: guarded(<ViewAwardAndCategory />) },
  {
    path: "/awards/view-award-and-category-places",
    element: guarded(<ViewAwardAndCategoryPlaces />),
  },
  { path: "/admin/settings", element: guarded(<AdminSettings />) },
  { path: "*", element: <NotFound /> },
]);
