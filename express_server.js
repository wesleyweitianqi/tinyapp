const express = require('express');
const res = require('express/lib/response');
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
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req,res) => {
  res.render("urls_new");
})

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect('/urls'); // Respond with 'Ok' (we will replace this)
});


app.get('/urls/:id', (req,res) => {

  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render('urls_show', templateVars);
})


app.get("/u/:id", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase.id;
  res.redirect(longURL);
});

app.post('/urls/:id/delete',(req,res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});