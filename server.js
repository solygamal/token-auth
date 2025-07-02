require('dotenv').config()
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const posts = [
  { username: 'sally', title: 'egypt' }
];
let refreshTokens = [];

const users = [];

app.post('/register', (req, res) => {
  const { username } = req.body;
  const user = { name: username };
  users.push(user);
  res.status(201).json({ message: 'User registered' });
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const user = { name: username };

  
  const accessToken = generateAccessToken(user);

  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
   refreshTokens.push(refreshToken);
  res.json({ accessToken , refreshToken  });

});

app.get('/posts', authenticateToken, (req, res) => {
  res.json(posts.filter(post => post.username === req.user.name));
});


app.post('/token', (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken });
  });
});

app.delete('/logout', (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter(token => token !== refreshToken);
  res.sendStatus(204);
});



function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
}

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
