const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({
      error: "User not found!",
    });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const checkUserAlreadyExist = users.some(
    (user) => user.username === username
  );

  if (checkUserAlreadyExist) {
    return response.status(400).json({
      error: "User already exist!",
    });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).send(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const user = request.user;

  return response.status(200).send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const newTodo = {
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return response.status(201).send(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = user.todos.find((item) => item.id === id);

  const todoIndex = user.todos.indexOf(todo);

  if (!todo) {
    response.status(404).json({
      error: "To do not found!",
    });
  }

  todo.title = title;
  todo.deadline = deadline;

  user.todos.splice(todoIndex, 1, todo);

  return response.status(201).send(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((item) => item.id === id);

  const todoIndex = user.todos.indexOf(todo);

  if (!todo) {
    response.status(404).json({
      error: "To do not found!",
    });
  }

  todo.done = true;

  user.todos.splice(todoIndex, 1, todo);

  return response.status(201).send(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((item) => item.id === id);

  const index = user.todos.indexOf(todo);

  if (!todo) {
    response.status(404).json({
      error: "To do not found!",
    });
  }

  if (index !== -1) {
    user.todos.splice(index, 1);
  }

  return response.status(204).send(user.todos);
});

module.exports = app;
