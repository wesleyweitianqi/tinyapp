require('dotenv').config();
const express = require('express');
const res = require('express/lib/response');
const cookie = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override')
const {getUserByEmail} = require('./helpers.js')

const app = express();
const port = 8080; 
app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('X-HTTP-Method-Override'))
app.use(cookieSession({
  name:'session',
  keys:['wesley', 'jenny']
}));

const generateRandomString = function() {
  let string = '';
  const lib = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    let randomIndex = Math.floor(Math.random() * 62);
    string += lib[randomIndex];
  }
  return string;
};

const urlsForUser = function(user_id) {
  let newObj = {};
  for (let i in urlDatabase) {
    if (urlDatabase[i].userID === user_id) {
      newObj[i] = urlDatabase[i];
    }
  }
  return newObj;
};

const shortUrlLookup = function(id) {
  if (urlDatabase[id]) {
    return urlDatabase[id];
  }
  return null;
}

const creatUserRandomID = function() {
  const len=Object.keys(users).length;
  let randomID = 'user' + (len+1) +'RandomID';
  return randomID;
}

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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

app.get('/', (req,res) => {
  res.render('HomePage', {email: undefined})
});

app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req,res) => {
  console.log(urlDatabase)
  const validUser = urlsForUser(req.session.user_id)
  if (!req.session.user_id) {
    const templateVars = {urls: validUser, email: null};
    return res.render('urls_index', templateVars);
  }
  const email = users[req.session.user_id].email;
  const templateVars = {urls: validUser, email: email};
  res.render('urls_index', templateVars);
 
});

//new longUrl input 
app.get('/urls/new', (req,res) => { 
  if (!req.session.user_id) {
    return res.redirect('/login')
  } else {
    const templateVars = {email : users[req.session.user_id].email}
    res.render("urls_new", templateVars);
  }
})

//add shortUrl and LongUrl to index page
app.post("/urls/new", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let id = req.session.user_id;
  urlDatabase[generateRandomString()] = {longURL: `http://${req.body.longURL}`, userID : id}
  res.redirect('/urls'); // Respond with 'Ok' (we will replace this)
});

//creat new route by template
app.get('/urls/:id', (req,res) => {
  if (!shortUrlLookup(req.params.id)) {
    return res.send("Page Not Found")
  } else if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.send("You donot have this shorten urls")
  } else {
    const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id].longURL, email: users[req.session.user_id].email};
    res.render('urls_show', templateVars);
  }
})

app.post('/urls/:id', (req,res) => {
  urlDatabase[req.params.id] = {longURL: `http://${req.body.longURL}`, userID: req.session.user_id}
  res.redirect('/urls');
})

app.get('/u/:id', (req, res) => {
  if (!urlDatabase[req.params.id].longURL) {
    return res.send('That short URL does not exist')
  }
  const longURL = urlDatabase[req.params.id].longURL
  res.redirect(longURL);
})

app.post('/urls/:id/delete',(req,res) => {
  const body =req.body.id;
  delete urlDatabase[req.params.id]
  res.redirect('/urls');
})

app.get('/login', (req, res) => {
  if(req.session.user_id) {
    return res.redirect('urls')
  }  
  res.render('login', {email: undefined})
})

app.post('/login', (req, res) => {
  if(getUserByEmail(req.body.email, users)) {
    const loggedPassword = getUserByEmail(req.body.email, users).password;
    if (bcrypt.compareSync(req.body.password, loggedPassword)) {
      const value = getUserByEmail(req.body.email, users).id;
      req.session.user_id = getUserByEmail(req.body.email, users).id
      return res.redirect('/urls')
    }
  }
  return res.redirect('/register')
})

app.post('/logout', (req, res) => {
    res
      .clearCookie('session')
      .redirect('/urls')
})
   
app.get('/register', (req,res) => {
  if(req.session.user_id) {
    return res.redirect('urls')
  }
  res.render('register', {email:null})
})

app.post('/register', (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.sendStatus(400).end();
  }
  if (getUserByEmail(req.body.email, users)) {
    // if (lookup(req.body.email).password !== req.body.password) {
      return res.send("This Email was reigistered");
    } else {
    const randomID = creatUserRandomID();
    // const shortenedID = generateRandomString()
    const password = req.body.password;
    users[randomID] = {id: randomID, email: req.body.email, password:bcrypt.hashSync(password,10)}
    //urlDatabase[shortenedID] = {email: req.body.email, userID:randomID}
    req.session.user_id = randomID;
    return res.redirect('/urls')
  }  
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});