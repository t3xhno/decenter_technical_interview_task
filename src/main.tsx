import "./main.scss";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { GlobalContextProvider } from "./context/GlobalContext.tsx";

import router from "./router.ts";

const { ethereum } = window;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {!ethereum ? (
      <h1>Please install MetaMask to use this application.</h1>
    ) : (
      <GlobalContextProvider>
        <RouterProvider router={router} />
      </GlobalContextProvider>
    )}
  </React.StrictMode>
);
