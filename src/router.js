import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { Games } from "./pages/games/games";
import { CreateGame } from "./pages/games/create/create-game";
import { CreateCategories } from "./pages/categories/create/create-categories";
import { CreatePublishers } from "./pages/publishers/create/create-publishers";
import { CreateArtists } from "./pages/artists/create/create-artists";
import { CreateMechanisms } from "./pages/mechanisms/create/create-mechanisms";
import { CreateDesigners } from "./pages/designers/create/create-designers";
import { HomePage } from "./pages/home/home-page";
import { CreateAwards } from "./pages/awards/create/create-awards";
import { CreateAwardCategories } from "./pages/award-categories/create/create-award-categories";
import {Votes} from "./pages/votes/create/votes";
import {DragaoDeOuro} from "./pages/dragao-de-ouro/create/dragao-de-ouro";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/game",
    element: <Games />,
  },
  {
    path: "/game/create-game",
    element: <CreateGame />,
  },
  {
    path: "/game/create-category",
    element: <CreateCategories />,
  },
  {
    path: "/game/create-publisher",
    element: <CreatePublishers />,
  },
  {
    path: "/game/create-artist",
    element: <CreateArtists />,
  },
  {
    path: "/game/create-mechanism",
    element: <CreateMechanisms />,
  },
  {
    path: "/game/create-designer",
    element: <CreateDesigners />,
  },
  {
    path: "/awards",
    element: <DragaoDeOuro />,
  },
  {
    path: "/awards/create-awards",
    element: <CreateAwards />,
  },
  {
    path: "/awards/create-category",
    element: <CreateAwardCategories />,
  },
  {
    path: "/awards/create-votes",
    element: <Votes />,
  },
]);
