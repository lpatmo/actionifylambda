import React, { useContext } from "react";
// import { useAuth0 } from "../../utils/react-auth0-spa";
import { Link } from "react-router-dom";
import { Auth0Context } from "../../contexts/auth0-context";
import styles from "./AppHeader.css"; // eslint-disable-line

const AppHeader = (props) => {
  const { isAuthenticated, login, logout, user } = useContext(Auth0Context);

  return (
    <header className="app-header">
      <div className="app-title-wrapper">
        <div className="app-title-wrapper">
          <div className="app-left-nav">
            <div className="app-title-text">
              <h1 className="app-title">
                <Link to="/">Home</Link>
              </h1>
              {isAuthenticated && user && <Link to="/profile">Profile</Link>}
              <p className="app-intro">Using FaunaDB & Netlify functions</p>
            </div>
          </div>
        </div>
        <div className="deploy-button-wrapper">
          {/* {" "}
          test!!!
          {!isAuthenticated && (
            <button onClick={() => loginWithRedirect({})}>Log in</button>
          )}
          {isAuthenticated && <button onClick={() => logout()}>Log out</button>} */}
          {!isAuthenticated && <button onClick={login}>Login</button>}
          {isAuthenticated && user && (
            <>
              <button>{user.name}</button>
              <button onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </header>
    // <div className="site-header">
    //   {/* stuff on the left */}
    //   <div>
    //     <Link to="/">Home</Link>
    //     <Link to="/dashboard">Dashboard</Link>
    //   </div>

    //   {/* stuff on the right */}
    //   <div>
    // {!isAuthenticated && <button onClick={login}>Login</button>}
    // {isAuthenticated && user && (
    //   <>
    //     <button>{user.name}</button>
    //     <button onClick={logout}>Logout</button>
    //   </>
    // )}
    //   </div>
    // </div>
  );
};

export default AppHeader;
