import React, { useState, useEffect, useRef, useContext } from "react";
import ContentEditable from "../components/ContentEditable";
import SettingsMenu from "../components/SettingsMenu";
import analytics from "../utils/analytics";
import api from "../utils/api";
import sortByDate from "../utils/sortByDate";
import isLocalHost from "../utils/isLocalHost";
import "../App.css";
import { Auth0Context } from "../contexts/auth0-context";

function Home() {
  const [input, setInput] = useState({});
  const [todos, setTodos] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const inputEl = useRef(null);
  const { user } = useContext(Auth0Context);

  console.log(user);

  useEffect(() => {
    /* Track a page view */
    analytics.page();

    // Fetch all todos
    api.readAll().then((todos) => {
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

      console.log("all todos", todos);
      setTodos(todos);
    });
  }, []);

  function isLoggedIn() {
    if (!user) {
      alert("Please log in");
      return false;
    }
    return true;
  }

  function removeOptimisticTodo(todos) {
    // return all 'real' todos
    return todos.filter((todo) => {
      return todo.ref;
    });
  }

  function getTodoId(todo) {
    if (!todo.ref) {
      return null;
    }
    return todo.ref["@ref"].id;
  }

  const handleInputChange = (e) => {
    console.log(e);
    setInput({
      ...input,
      [e.currentTarget.name]: e.currentTarget.value,
    });
  };

  const saveTodo = (e) => {
    e.preventDefault();
    if (!isLoggedIn()) return false;

    Object.keys(input).forEach((key) => {
      if (!input[key]) {
        alert(`Please add a ${key}`);
        inputEl.current.focus();
        return false;
      }
    }); //Validation for if field is empty

    // reset input to empty
    setInput({});

    const todoInfo = { ...input, completed: false, author: user.sub };
    // Optimistically add todo to UI
    const newTodoArray = [
      {
        data: todoInfo,
        ts: new Date().getTime() * 1000,
      },
    ];

    const optimisticTodoState = newTodoArray.concat(todos);

    setTodos(optimisticTodoState);

    // Make API request to create new todo
    api
      .create(todoInfo)
      .then((response) => {
        console.log(response);
        /* Track a custom event */
        analytics.track("todoCreated", {
          category: "todos",
          label: input.description,
        });
        // remove temporaryValue from state and persist API response
        const persistedState = removeOptimisticTodo(todos).concat(response);
        setTodos(persistedState);
      })
      .catch((e) => {
        console.log("An API error occurred", e);
        const revertedState = removeOptimisticTodo(todos);
        setTodos(revertedState);
      });
  };
  const deleteTodo = (e) => {
    // const { todos } = this.state;
    const todoId = e.target.dataset.id;
    if (!isLoggedIn()) return false;

    // Optimistically remove todo from UI
    const filteredTodos = todos.reduce(
      (acc, current) => {
        const currentId = getTodoId(current);
        if (currentId === todoId) {
          // save item being removed for rollback
          acc.rollbackTodo = current;
          return acc;
        }
        // filter deleted todo out of the todos list
        acc.optimisticState = acc.optimisticState.concat(current);
        return acc;
      },
      {
        rollbackTodo: {},
        optimisticState: [],
      }
    );

    setTodos(filteredTodos.optimisticState);

    // Make API request to delete todo
    api
      .delete(todoId)
      .then(() => {
        console.log(`deleted todo id ${todoId}`);
        analytics.track("todoDeleted", {
          category: "todos",
        });
      })
      .catch((e) => {
        console.log(`There was an error removing ${todoId}`, e);
        // Add item removed back to list
        setTodos(
          filteredTodos.optimisticState.concat(filteredTodos.rollbackTodo)
        );
      });
  };

  const handleTodoCheckbox = (event) => {
    if (!isLoggedIn()) return false;

    const { target } = event;
    const todoCompleted = target.checked;
    const todoId = target.dataset.id;

    const updatedTodos = todos.map((todo, i) => {
      const { data } = todo;
      const id = getTodoId(todo);
      if (id === todoId && data.completed !== todoCompleted) {
        data.completed = todoCompleted;
      }
      return todo;
    });
    setTodos(updatedTodos);
    api
      .update(todoId, {
        completed: todoCompleted,
      })
      .then(() => {
        console.log(`update todo ${todoId}`, todoCompleted);
        const eventName = todoCompleted ? "todoCompleted" : "todoUnfinished";
        analytics.track(eventName, {
          category: "todos",
        });
      })
      .catch((e) => {
        console.log("An API error occurred", e);
      });
  };
  const updateTodoTitle = (event, currentValue) => {
    let isDifferent = false;
    const todoId = event.target.dataset.key;
    const field = event.target.dataset.field;
    // console.log(event.currentTarget.name);
    console.log("UPDATE TODO TITLE");
    console.log(event);
    console.log(currentValue);
    console.log(todoId);
    console.log(field);

    const updatedTodos = todos.map((todo, i) => {
      const id = getTodoId(todo) + "-" + field;
      console.log(todo);
      console.log(id);
      console.log(todoId);
      console.log(event);
      console.log(event.target);
      if (id === todoId && todo.data[field] !== currentValue) {
        todo.data[field] = currentValue;
        isDifferent = true;
      }
      return todo;
    });
    if (isDifferent) {
      console.log("UPDATE");
      console.log(field);
      setTodos(updatedTodos);
      console.log(todoId);
      api
        .update(todoId.split("-")[0], {
          [field]: currentValue,
        })
        .then(() => {
          console.log(`update todo ${todoId}`, currentValue);
          analytics.track("todoUpdated", {
            category: "todos",
            label: currentValue,
          });
        })
        .catch((e) => {
          console.log("An API error occurred", e);
        });
    }
  };

  const clearCompleted = () => {
    // const { todos } = this.state;

    // Optimistically remove todos from UI
    const data = todos.reduce(
      (acc, current) => {
        if (current.data.completed) {
          // save item being removed for rollback
          acc.completedTodoIds = acc.completedTodoIds.concat(
            getTodoId(current)
          );
          return acc;
        }
        // filter deleted todo out of the todos list
        acc.optimisticState = acc.optimisticState.concat(current);
        return acc;
      },
      {
        completedTodoIds: [],
        optimisticState: [],
      }
    );

    // only set state if completed todos exist
    if (!data.completedTodoIds.length) {
      alert("Please check off some todos to batch remove them");
      closeModal();
      return false;
    }

    setTodos(data.optimisticState);
    api
      .batchDelete(data.completedTodoIds)
      .then(() => {
        console.log(`Batch removal complete`, data.completedTodoIds);
        analytics.track("todosBatchDeleted", {
          category: "todos",
        });
      })
      .catch((e) => {
        console.log("An API error occurred", e);
      });
  };
  const closeModal = (e) => {
    // this.setState({
    //   showMenu: false,
    // });
    setShowMenu(false);
    analytics.track("modalClosed", {
      category: "modal",
    });
  };
  const openModal = () => {
    setShowMenu(true);
    analytics.track("modalOpened", {
      category: "modal",
    });
  };
  const renderTodos = () => {
    if (!todos || !todos.length) {
      // Loading State here
      return null;
    }

    const timeStampKey = "ts";
    const orderBy = "desc"; // or `asc`
    const sortOrder = sortByDate(timeStampKey, orderBy);
    const todosByDate = todos.sort(sortOrder);

    return todosByDate.map((todo, i) => {
      const { data, ref } = todo;
      const date = new Date(todo.ts / 1000).toDateString();
      console.log(date);
      const id = getTodoId(todo);
      // only show delete button after create API response returns
      let deleteButton;
      if (ref && user && data.author === user.sub) {
        deleteButton = (
          <button data-id={id} onClick={deleteTodo}>
            delete
          </button>
        );
      }
      const boxIcon = data.completed ? "#todo__box__done" : "#todo__box";
      return (
        <div key={i} className="todo-item">
          <label className="todo">
            {user && data.author === user.sub ? (
              <>
                <input
                  data-id={id}
                  className="todo__state"
                  type="checkbox"
                  onChange={handleTodoCheckbox}
                  checked={data.completed}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 200 25"
                  className="todo__icon"
                >
                  <use xlinkHref={`${boxIcon}`} className="todo__box"></use>
                  <use xlinkHref="#todo__check" className="todo__check"></use>
                </svg>

                <div className="todo-list-title">
                  {["description", "url", "location"].map((field) => {
                    return (
                      // {user && data.author === user.sub ? (
                      <>
                        <ContentEditable
                          key={`${id}-${field}`}
                          field={field}
                          tagName="span"
                          editKey={`${id}-${field}`}
                          onBlur={updateTodoTitle} // save on enter/blur
                          html={data[field]}
                        />
                      </>
                      //  ) : null}
                    );
                  })}
                  <p className="todo-list-title">{date}</p>
                </div>
              </>
            ) : (
              //Non-editable content
              <div className="todo-list-title">
                {["description", "url"].map((field) => {
                  return <span>{data[field]}</span>;
                })}
              </div>
            )}
          </label>
          {user && (data.author === user.sub || user.moderator) && deleteButton}
        </div>
      );
    });
  };
  return (
    <>
      <div className="todo-list">
        <h2>Submit an action</h2>
        <form className="todo-create-wrapper" onSubmit={saveTodo}>
          <input
            className="todo-create-input"
            placeholder="Action title"
            name="description"
            // ref={(el) => (inputElement = el)}
            ref={inputEl}
            onChange={handleInputChange}
            autoComplete="off"
            style={{ marginRight: 20 }}
          />
          <input
            className="todo-create-input"
            placeholder="URL"
            name="url"
            onChange={handleInputChange}
            autoComplete="off"
            style={{ marginRight: 20 }}
          />
          <input
            className="todo-create-input"
            placeholder="Location"
            name="location"
            onChange={handleInputChange}
            autoComplete="off"
            style={{ marginRight: 20 }}
          />
          <select
            name="tags"
            onChange={handleInputChange}
            className="todo-create-input"
          >
            <option>Select a tag</option>
            <option>covid19</option>
            <option>Black Lives Matter</option>
          </select>
          <div className="todo-actions">
            <button className="todo-create-button">Submit</button>
          </div>
        </form>

        {renderTodos()}
      </div>
      <SettingsMenu
        showMenu={showMenu}
        handleModalClose={closeModal}
        handleClearCompleted={clearCompleted}
      />
    </>
  );
}
// }

export default Home;
