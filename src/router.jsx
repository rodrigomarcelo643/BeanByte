import React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Sidebar } from "./components/Sidebar";
import AdminLogin from "./components/AdminLogin";
import LandingPage from "./LandingPage/LandingPage";
import Test from "./Test";
import { elements } from "chart.js";
import ForgotPassword from "./components/ForgotPassword";
import DefaultPage from "./components/DefaultPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultPage />,
    children: [],
  },
  {
    path: "/Bean&Co.Login",
    element: <AdminLogin />,
  },
  {
    path: "/Bean&Co.Admin",
    element: <Sidebar />,
  },
  {
    path: "/Bean&Co.",
    element: <LandingPage />,
  },
  {
    path: "/ForgotPassword",
    element: <ForgotPassword />,
  },
  {
    path: "/Test",
    element: <Test />,
  },
]);

export default router;
