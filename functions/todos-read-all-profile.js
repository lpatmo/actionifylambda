/* Import faunaDB sdk */
const faunadb = require("faunadb");
const getId = require("./utils/getId");
const q = faunadb.query;

exports.handler = (event, context) => {
  console.log("Function `todo-read-all-profile` invoked");
  /* configure faunaDB Client with our secret */
  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET,
  });
  const userId = getId(event.path);
  console.log(userId);
  return client
    .query(q.Paginate(q.Match(q.Index(`action_by_author`), "twitter|51627206")))
    .then((response) => {
      const todoRefs = response.data;
      console.log(response);
      const getAllTodoDataQuery = todoRefs.map((ref) => {
        return q.Get(ref);
      });
      // then query the refs
      return client.query(getAllTodoDataQuery).then((ret) => {
        return {
          statusCode: 200,
          body: JSON.stringify(ret),
        };
      });
    })
    .catch((error) => {
      console.log("error", error);
      return {
        statusCode: 400,
        body: JSON.stringify(error),
      };
    });
};
