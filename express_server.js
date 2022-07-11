const express = require('express');
const res = require('express/lib/response');
const app = express();
const port = 8080; 

app.set('view engine', 'ejs');

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