const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((users) => users.username === username);

  if (!user) {
    return response.status(400).json({ Error: "Username don't existis!" });
  }

  request.user = user;

  next();
}

function checksExistsTodo(request, response, next) {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todos) => todos.id === id);

  if (!todo) {
    return response.status(400).json({ Error: "Todo não existe"});
  }

  request.todo = todo;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernameTaken = users.some((users) => users.username === username);

  if (usernameTaken) {
    return response.status(400).json({ Error: "Username already taken! " });
  }

  users.push({
    name,
    username,
    id: uuidv4(),
    todos: []
  });

  return response.status(201).send(users);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  });

  return response.status(201).json(user.todos);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { todo } = request;
  const { title, deadline } = request.body;

  todo.title = title;
  todo.deadline = deadline;

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { todo } = request;
  const { user } = request;

  const indexTodo = user.todos.indexOf(todo);

  user.todos.splice(indexTodo, 1);

  return response.status(201).json();
});

module.exports = app;