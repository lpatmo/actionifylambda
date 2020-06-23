/* Api methods to call /functions */

const create = (data) => {
  return fetch("/.netlify/functions/todos-create", {
    body: JSON.stringify(data),
    method: "POST",
  }).then((response) => {
    return response.json();
  });
};

const readAll = () => {
  return fetch("/.netlify/functions/todos-read-all").then((response) => {
    return response.json();
  });
};

const readProfile = (userId) => {
  return fetch(`/.netlify/functions/todos-read-all-profile/${userId}`, {
    method: "GET",
  }).then((response) => {
    return response.json();
  });
};

const update = (todoId, data) => {
  return fetch(`/.netlify/functions/todos-update/${todoId}`, {
    body: JSON.stringify(data),
    method: "POST",
  }).then((response) => {
    return response.json();
  });
};

const deleteTodo = (todoId) => {
  return fetch(`/.netlify/functions/todos-delete/${todoId}`, {
    method: "POST",
  }).then((response) => {
    return response.json();
  });
};

const batchDeleteTodo = (todoIds) => {
  return fetch(`/.netlify/functions/todos-delete-batch`, {
    body: JSON.stringify({
      ids: todoIds,
    }),
    method: "POST",
  }).then((response) => {
    return response.json();
  });
};

export default {
  create: create,
  readAll: readAll,
  readProfile: readProfile,
  update: update,
  delete: deleteTodo,
  batchDelete: batchDeleteTodo,
};
