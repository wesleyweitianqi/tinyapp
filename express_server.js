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

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortUrl = generateRandomString();
  const id = req.body;
  urlDatabase[id] = shortUrl;
  console.log(id, shortUrl);
  res.send(shortUrl); // Respond with 'Ok' (we will replace this)
});

app.get('/urls/new', (req,res) => {
  console.log(req.body);
  res.render("urls_new");
})
app.get('/urls/:id', (req,res) => {
  const templateVars = {id: 'b2xVn2', longURL: "http://www.lighthouselabs.ca" };
  res.render('urls_show', templateVars);
})


app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});