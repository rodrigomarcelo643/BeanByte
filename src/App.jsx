import React from "react";
import { Outlet, RouterProvider } from "react-router-dom";
import router from "./router";

function App() {
  return <RouterProvider router={router} />;
  <Outlet />;
}
export default App;
