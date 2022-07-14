const express = require('express');
const res = require('express/lib/response');
const cookie = require('cookie-parser');
const cookieParser = require('cookie-parser');
const app = express();
const port = 8080; 
app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

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

//login emailLookUp
const lookup = function(email) {
  let arr = [];
  for (let i in users) {
    if (users[i]['email'] === email) {
      return users[i];
    }
  }
  return null;
}

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
  console.log(urlDatabase)
  if (!req.cookies.user_id) {  // no cookie
    return res.redirect('/login')
  } else {
    const validUser = urlsForUser(req.cookies.user_id)
    console.log(req.cookies.user_id)
    console.log(req.body)
    const templateVars = {urls: validUser, email: users[req.cookies.user_id].email};
    res.render('urls_index', templateVars);
  }
});

//new longUrl input 
app.get('/urls/new', (req,res) => {
  console.log(req.cookies.user_id)
  if (!req.cookies.user_id) {
    return res.redirect('/login')
  } else {
    const templateVars = {email : users[req.cookies.user_id].email}
    res.render("urls_new", templateVars);

  }
})

//add shortUrl and LongUrl to index page
app.post("/urls/new", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let id = req.cookies.user_id;
  urlDatabase[generateRandomString()] = {longURL: req.body.longURL, userID : id}
  res.redirect('/urls'); // Respond with 'Ok' (we will replace this)
});

//creat new route by template
app.get('/urls/:id', (req,res) => {
  if (!shortUrlLookup(req.params.id)) {
    return res.send("Page Not Found")
  } else if (urlDatabase[req.params.id].userID !== req.cookies.user_id) {
    return res.send("You donot have this shorten urls")
  } else {
    const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id].longURL};
    console.log(users)
    res.render('urls_show', templateVars);
  }
})

app.post('/urls/:id', (req,res) => {
  const inputLongUrl = req.body.longURL;
  urlDatabase[req.params.id] = {longURL: req.body.longURL, userID: req.cookies.user_id}
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
  res.render('login', {email: undefined})
})

app.post('/login', (req, res) => {
  if(lookup(req.body.email)) {
    if (lookup(req.body.email).password === req.body.password) {
      const value = lookup(req.body.email).id;
      res.cookie('user_id', lookup(req.body.email).id)
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
      return res.send("This Email was reigistered");
    } else {
    const randomID = creatUserRandomID();
    const shortenedID = generateRandomString()
    users[randomID] = {id: randomID, email: req.body.email, password: req.body.password}
    //urlDatabase[shortenedID] = {email: req.body.email, userID:randomID}
    console.log(req.body)
    console.log(users)
    return res.cookie('user_id', randomID).redirect('/urls')
  } 
  
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});