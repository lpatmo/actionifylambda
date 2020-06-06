import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
// import { Auth0Provider } from "./utils/react-auth0-spa";
// import history from "./utils/history";
import { Auth0Provider } from "./contexts/auth0-context";

ReactDOM.render(
  <React.StrictMode>
    <Auth0Provider>
      <App />
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// A function that routes the user to the right place
// after login
// const onRedirectCallback = (appState) => {
//   history.push(
//     appState && appState.targetUrl
//       ? appState.targetUrl
//       : window.location.pathname
//   );
// };
// ReactDOM.render(
//   <Auth0Provider
//     domain="actionify.auth0.com"
//     clientId="xuAv87ZpcWfabbPkcaPrHzrfl1lse4hJ"
//     redirect_uri={window.location.origin}
//     onRedirectCallback={onRedirectCallback}
//   >
//     <App />
//   </Auth0Provider>,
//   document.getElementById("root")
// );
