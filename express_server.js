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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
const lookup = function(email) {
  for (let i in users) {
    if (users[i]['email'] === email) {
      return users[i];
    }
  }
  return null;
}

const creatUserRandomID = function() {
  const len=Object.keys(users).length;
  let randomID = 'user' + (len+1) +'RandomID';
  return randomID;
}

app.get('/', (req,res) => {

  res.render('HomePage', {email: undefined})
});

app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
});

// app.get('/hello', (req,res) => {
//   const templateVars = { greeting : "hello, World!"};
//   res.render("hello_world", templateVars);
// });

app.get('/urls', (req,res) => {
  const templateVars = {urls: urlDatabase, email: users[req.cookies.user_id].email};
  res.render('urls_index', templateVars);
});

//new longUrl input 
app.get('/urls/new', (req,res) => {
  
  const templateVars = {email : users[req.cookies.user_id].email}
  res.render("urls_new", templateVars);
})

//add shortUrl and LongUrl to index page
app.post("/urls/new", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect('/urls'); // Respond with 'Ok' (we will replace this)
});

//creat new route by template
app.get('/urls/:id', (req,res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id]};
  console.log(users)
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

app.get('/login', (req, res) => {  
  res.render('login', {email: undefined})
})

app.post('/login', (req, res) => {
  if(lookup(req.body.email)) {
    if (lookup(req.body.email).password === req.body.password) {
      const value = lookup(req.body.email).id;
      res.cookie('user_id', value)
      return res.redirect('/urls')
    }
  }
  return res.redirect('/register')
})

app.post('/logout', (req, res) => {
    res
      .clearCookie('user_id')
      .redirect('/register')
})
   
app.get('/register', (req,res) => {
  
  res.render('register', {email: undefined})
})

app.post('/register', (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.sendStatus(400).end();
  }
  if (lookup(req.body.email)) {
    // if (lookup(req.body.email).password !== req.body.password) {
      return res.sendStatus(400).end();
    } else {
    const randomID = creatUserRandomID();
    users[randomID] = {id: randomID, email: req.body.email, password: req.body.password}
    console.log(req.body)
    console.log(users)
    return res.cookie('user_id', randomID).redirect('/urls')
  } 
  
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});