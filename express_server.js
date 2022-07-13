const express = require('express');
const res = require('express/lib/response');
const cookie = require('cookie-parser');
const cookieParser = require('cookie-parser');
const app = express();
const port = 8080; 
const generateRandomString = function() {
  let string = '';
  const lib = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    let randomIndex = Math.floor(Math.random() * 62);
    string += lib[randomIndex];
  }
  return string;
}

app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req,res) => {
  res.send("Hello!")
});

app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req,res) => {
  const templateVars = { greeting : "hello, World!"};
  res.render("hello_world", templateVars);
});

app.get('/urls', (req,res) => {
  const templateVars = {urls: urlDatabase, username: undefined};
  console.log(req.cookies)
  if (req.cookies.username) {
    templateVars.username = req.cookies['username']
  }
  res.render('urls_index', templateVars);
});

//new longUrl input 
app.get('/urls/new', (req,res) => {
  const templateVars = {username: req.cookies['username']}
  res.render("urls_new", templateVars);
})

// add shortUrl and LongUrl to index page
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect('/urls'); // Respond with 'Ok' (we will replace this)
});

//creat new route by template
app.get('/urls/:id', (req,res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render('urls_show', templateVars);
})


app.post('/urls/:id', (req,res) => {
  const inputLongUrl = req.body.longURL;
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect('/urls');
})

app.post('/urls/:id/delete',(req,res) => {
  const body =req.body.id;
  delete urlDatabase[req.params.id]
  res.redirect('/urls');
})

app.post('/login', (req, res) => {
  res
  .cookie('username', req.body.username, {path: '/urls'})
  .redirect('/urls');   
})

app.post('/logout', (req, res) => {
  res
    .clearCookie('username', {path: '/urls'})
    .redirect('/urls')
    
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});