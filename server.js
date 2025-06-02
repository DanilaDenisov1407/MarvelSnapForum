const express = require('express');
const fs = require('fs');
const app = express();

const PORT = 3000;
const USERS_FILE = 'users.json';

app.use(express.static('public'));
app.use(express.json());

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '{}');
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.post('/register', (req, res) => {
  const { login, password } = req.body;
  const users = loadUsers();

  if (users[login]) {
    return res.json({ success: false, message: 'User already exists' });
  }

  users[login] = { password };
  saveUsers(users);
  res.json({ success: true });
});

app.post('/login', (req, res) => {
  const { login, password } = req.body;
  const users = loadUsers();

  if (!users[login] || users[login].password !== password) {
    return res.json({ success: false, message: 'Wrong login or password' });
  }

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
