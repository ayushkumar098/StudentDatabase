const mysql = require("mysql");
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.set("view engine", "ejs");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "students",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database: ", err);
    return;
  }
  console.log("Connected to MySQL database");
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/add", (req, res) => {
  res.render("add");
});

app.post("/add", function (req, res) {
  let joinedDomain;
  if (Array.isArray(req.body.domain)) {
    joinedDomain = req.body.domain.join(", ");
  } else {
    joinedDomain = req.body.domain;
  }
  // const stringArray = req.body.language.split(",");
  // const stringWithSpaces = stringArray.join(" ");
  // const stringWithSpaces = req.body.language.replace(/,/g, "");

  const newData = {
    name: req.body.name,
    regNo: req.body.regNo,
    branch: req.body.branch,
    passingYear: req.body.passingYear,
    class10Marks: req.body.class10Marks,
    class12Marks: req.body.class12Marks,
    collegeCGPA: req.body.collegeCGPA,
    domain: joinedDomain,
    language: req.body.language,
  };

  connection.query(
    "INSERT INTO studentstable SET ?",
    newData,
    (err, results) => {
      if (err) {
        console.error("Error inserting data into MySQL database: ", err);
        return;
      }
      console.log(
        "New row inserted into MySQL database with ID: ",
        results.insertId
      );
      res.redirect("/add");
    }
  );
});

app.get("/filters", (req, res) => {
  const sql = "SELECT * FROM studentstable";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error executing SELECT query: ", err);
      return;
    }
    //console.log("Results:", results);
    res.render("filters", { items: results, filterApplied: false, filter: null});
  });
});

app.post("/filters", (req, res) => {
  const min10 = req.body.class10Marks;
  const min12 = req.body.class12Marks;
  const minCgpa = req.body.collegeCGPA;
  const branch = req.body.branch;
  const domain = req.body.domain;
  const languageWithoutSpace = req.body.language;
  const space = " ";
  const language = languageWithoutSpace+space;
  console.log(language);

  const sql = `SELECT * FROM studentstable WHERE class10Marks > ${min10} and class12Marks > ${min12} and collegeCGPA > ${minCgpa} and branch = '${branch}' and domain LIKE '%${domain}%' and language LIKE '%${language}%'`;
  
  connection.query(sql, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      return;
    }
    res.render("filters", { items: results, filterApplied:true,  filter: [min10, min12,minCgpa, branch, domain, language]});
  });
});

app.listen(3000, function () {
  console.log("Server started on port " + process.env.PORT);
});

// Close the connection to the database
// connection.end((err) => {
//   if (err) {
//     console.error('Error closing connection to MySQL database: ', err);
//     return;
//   }
//   console.log('Connection to MySQL database closed');
// });
