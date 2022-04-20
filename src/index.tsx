import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import regeneratorRuntime from "regenerator-runtime";
regeneratorRuntime; //Just so import is not removed;
ReactDOM.render(<App />, document.getElementById("app"));
