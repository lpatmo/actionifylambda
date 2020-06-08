import React, { useContext } from "react";
import { Auth0Context } from "../contexts/auth0-context";

export default function Profile() {
  const { user } = useContext(Auth0Context);

  return (
    <div className="page profile">
      <div>
        <h2>Welcome {user.name}</h2>
      </div>
    </div>
  );
}
