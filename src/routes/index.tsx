import React from "react";
import { Switch, Route } from "react-router-dom";

import HomeScreen from "../Pages/HomeScreen";
import AboutUs from "../Pages/AboutUs";
import Results from "../Pages/Results";
import ScrappersResults from "../Pages/Monitoring";

const Routes: React.FC = () => (
  <Switch>
    <Route path="/" exact component={HomeScreen} />
    <Route path="/sobreNos" component={AboutUs} />
    <Route path="/resultados/:searchTerm+" component={Results} />
  </Switch>
);

export default Routes;
