import React from "react";
import { useAuth0 } from "../../utils/react-auth0-spa";
import logo from "../../assets/logo.svg";
import styles from "./AppHeader.css"; // eslint-disable-line

const AppHeader = (props) => {
  const test = useAuth0();
  console.log(test);
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  return (
    <header className="app-header">
      <div className="app-title-wrapper">
        <div className="app-title-wrapper">
          <div className="app-left-nav">
            <img src={logo} className="app-logo" alt="logo" />
            <div className="app-title-text">
              <h1 className="app-title">Netlify + Fauna DB</h1>
              <p className="app-intro">Using FaunaDB & Netlify functions</p>
            </div>
          </div>
        </div>
        <div className="deploy-button-wrapper">
          {" "}
          test
          {!isAuthenticated && (
            <button onClick={() => loginWithRedirect({})}>Log in</button>
          )}
          {isAuthenticated && <button onClick={() => logout()}>Log out</button>}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
