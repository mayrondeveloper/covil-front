import React, { Suspense, lazy } from "react";
import { createBrowserRouter, Link } from "react-router-dom";
import { Box, CircularProgress, Typography, Button } from "@mui/material";

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
const Announcement = lazyPage(
  () => import("./pages/awards/view/announcement"),
  "Announcement"
);
const AddByLink = lazyPage(
  () => import("./pages/games/add-by-link/add-by-link"),
  "AddByLink"
);
const NewVotes = lazyPage(
  () => import("./pages/votes/create/new-votes"),
  "NewVotes"
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

export const router = createBrowserRouter([
  { path: "/", element: withSuspense(<HomePage />) },
  { path: "/game", element: withSuspense(<Games />) },
  { path: "/game/create-game", element: withSuspense(<CreateGame />) },
  { path: "/game/edit-game/:id", element: withSuspense(<CreateGame />) },
  { path: "/game/create-category", element: withSuspense(<CreateCategories />) },
  { path: "/game/create-publisher", element: withSuspense(<CreatePublishers />) },
  { path: "/game/create-artist", element: withSuspense(<CreateArtists />) },
  { path: "/game/create-mechanism", element: withSuspense(<CreateMechanisms />) },
  { path: "/game/create-designer", element: withSuspense(<CreateDesigners />) },
  { path: "/game/add-by-link", element: withSuspense(<AddByLink />) },
  { path: "/awards", element: withSuspense(<DragaoDeOuro />) },
  { path: "/awards/create-awards", element: withSuspense(<CreateAwards />) },
  { path: "/awards/edit-awards/:id", element: withSuspense(<CreateAwards />) },
  { path: "/awards/create-category", element: withSuspense(<CreateAwardCategories />) },
  { path: "/awards/create-new-votes", element: withSuspense(<NewVotes />) },
  { path: "/awards/create-participants", element: withSuspense(<CreateAwardParticipants />) },
  { path: "/awards/winners", element: withSuspense(<WinnersOverview />) },
  { path: "/awards/:id/announcement", element: withSuspense(<Announcement />) },
  { path: "/awards/view-award-and-category", element: withSuspense(<ViewAwardAndCategory />) },
  {
    path: "/awards/view-award-and-category-places",
    element: withSuspense(<ViewAwardAndCategoryPlaces />),
  },
  { path: "*", element: <NotFound /> },
]);
