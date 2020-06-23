import React, { useState, useEffect, useContext } from "react";
import { Auth0Context } from "../contexts/auth0-context";
import api from "../utils/api";
import isLocalHost from "../utils/isLocalHost";
import "../App.css";

export default function Profile() {
  const { user } = useContext(Auth0Context);
  const [actions, setActions] = useState([]);
  console.log(user.sub);

  useEffect(() => {
    api
      .readProfile(user.sub)
      .then((todos) => {
        console.log(todos);
        if (todos.message === "unauthorized") {
          if (isLocalHost()) {
            alert(
              "FaunaDB key is not unauthorized. Make sure you set it in terminal session where you ran `npm start`. Visit http://bit.ly/set-fauna-key for more info"
            );
          } else {
            alert(
              "FaunaDB key is not unauthorized. Verify the key `FAUNADB_SERVER_SECRET` set in Netlify enviroment variables is correct"
            );
          }
          return false;
        }

        console.log("all user profile todos", todos);
        setActions(todos);
      })
      .catch((e) => console.log(e));
  }, []);

  return (
    <div className="page profile">
      <div>
        <h2>
          Welcome {user.name} ({user.sub})
        </h2>
        {actions.map((action) => {
          return (
            <div className="todo-list-title">
              <p>{action.data.description}</p>
              <p>{action.data.url}</p>
              <p>{action.data.location}</p>
              <hr />
            </div>
          );
        })}
      </div>
    </div>
  );
}
