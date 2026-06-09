import { render } from "preact";
import "./index.css";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";

render(
  <RouterProvider router={router} />,
  document.getElementById("app") as HTMLElement
);
