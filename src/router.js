import React from "react";
import {createBrowserRouter} from "react-router-dom";
import {Games} from "./pages/games/games";
import {CreateGame} from "./pages/games/create/create-game";
import {CreateCategories} from "./pages/categories/create/create-categories";
import {CreatePublishers} from "./pages/publishers/create/create-publishers";
import {CreateArtists} from "./pages/artists/create/create-artists";
import {CreateMechanisms} from "./pages/mechanisms/create/create-mechanisms";
import {CreateDesigners} from "./pages/designers/create/create-designers";
import {HomePage} from "./pages/home/home-page";
import {CreateAwards} from "./pages/awards/create/create-awards";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
    },{
        path: "/game",
        element: <Games />,
    },{
        path: "/game/create-game",
        element: <CreateGame />,
    },{
        path: "/game/create-category",
        element: <CreateCategories />,
    },{
        path: "/game/create-publisher",
        element: <CreatePublishers />,
    },{
        path: "/game/create-artist",
        element: <CreateArtists />,
    },{
        path: "/game/create-mechanism",
        element: <CreateMechanisms />,
    },{
        path: "/game/create-designer",
        element: <CreateDesigners />,
    },{
        path: "/awards",
        element: <CreateAwards/>,
    }
]);