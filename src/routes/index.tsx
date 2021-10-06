import React from "react";
import { Switch, Route } from "react-router-dom";

import HomeScreen from "../Pages/HomeScreen";
import AboutUs from "../Pages/AboutUs";
import Results from "../Pages/Results";

const Routes: React.FC = () => (
  <Switch>
    <Route path="/" exact component={HomeScreen} />
    <Route path="/sobreNos" component={AboutUs} />
    <Route path="/resultados" component={Results} />
  </Switch>
);

export default Routes;