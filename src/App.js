import React, { useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import AppHeader from "./components/AppHeader";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import PrivateRoute from "./components/PrivateRoute";
import { useAuth0 } from "./contexts/auth0-context";

function App() {
  // state = {
  //   todos: [],
  //   showMenu: false,
  // };

  const { getToken } = useAuth0();

  useEffect(() => {
    getUserData();
  }, [getUserData]);

  async function getUserData() {
    const token = await getToken();

    const response = await fetch(`http://example.com/api`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    // we have data!
  }

  return (
    <Router>
      <div className="app">
        <AppHeader />

        {/* routes */}
        <Switch>
          <PrivateRoute path="/dashboard">
            <Dashboard />
          </PrivateRoute>
          <Route path="/" exact={true}>
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
// }

export default App;
