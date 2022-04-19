const express = require("express");
const path = require("path");
const fs = require("fs");

const bodyParser = require("body-parser");
const app = express();
const User = require("./models/user");
const session = require("express-session");
var MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const multer = require("multer");
const adminRouter = require("./routes/admin");
const shopRouter = require("./routes/shop");
const authRouter = require("./routes/auth");
const mongoose = require("mongoose");
const errorController = require("./controllers/error");
const helmet = require ('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

var store = new MongoDBStore({
  uri: "mongodb+srv://shivam:Shiv7132@cluster0.hfqxk.mongodb.net/myDatabase?retryWrites=true&w=majority",
  collection: "mySessions",
});

const fileStorage=multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, "images");
  },
  filename: (req, file, cb)=>{
    file.filename='vcvc';
    cb(null, new Date().getTime() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb)=>{
  if(file.mimetype === 'image/png'|| 
  file.mimetype === 'image/jpg' || 
  file.mimetype === 'image/jpeg'){
    cb(null, true);
  }
  else{
    cb(null, false);
  }
};
app.set("view engine", "ejs");
app.set("views", "views");

app.use(helmet());
app.use(compression());



app.use(express.static(path.join(__dirname, "public")));
app.use('/images',express.static(path.join(__dirname, "images")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"));

console.log(
  " --------------------------------------------------------------------------"
);
console.log(
  "|                             SERVER STARTS                                |"
);
console.log(
  " --------------------------------------------------------------------------"
);

app.use(flash());
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRouter);
app.use(shopRouter);
app.use(authRouter);

const accessLogStream = fs.createWriteStream(path.join(__dirname,"access.log"), {flags: 'a'});

app.use(morgan('combined', {stream: accessLogStream}));

app.get("/500", errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error);
  res.redirect("/500");
});
const MONGO_URI=`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.hfqxk.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

mongoose
  .connect(MONGO_URI)
  .then((result) => {
    console.log("database connected successfully");
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
