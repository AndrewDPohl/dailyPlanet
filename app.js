var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var methodOverride = require("method-override");
var pg = require("pg");

var config = {
	database: "dailyplanet_app",
	port: 5432,
	host: "localhost"
};


//takes information from the body of the individual page we are GETting from
app.use(bodyParser.urlencoded({extended: true}));

//allows us to use the Delete/Update methods
app.use(methodOverride("_method"));

//this is for allowing us to view our individual pages
app.set("view engine", "ejs");

//for adding style/css
app.use(express.static(__dirname + "/public"));

app.get("/site", function (req, res) {
	res.render("site/index.ejs");
});

app.get("/site/about", function (req, res) {
	res.render("site/about.ejs");
});

app.get("/site/contact", function (req, res) {
	res.render("site/contact.ejs");  
});

app.get("/articles", function (req, res) {
  pg.connect(config, function (err, client, done) {
    if (err) {
      console.log("OOPS!!! SOMETHING WENT WRONG!", err);
    }
    client.query("SELECT * FROM articles", [], function (err, result) {
      done();
      console.log(result.rows);
      res.render("articles/index", {articleList: result.rows});
    });
  });
});

app.get("/articles/new", function (req, res) {
	res.render("articles/new");
});


app.get("/articles/:id", function(req, res) {
  //var article_id = Number(req.params.article_id);
  pg.connect(config, function (err, client, done) {
    if (err) {
      console.error("OOPS!!! SOMETHING WENT WRONG!", err);
    }
    client.query("SELECT * FROM articles WHERE article_id=$1", [req.params.id], function (err, result) {
      done();
      // console.log("THIS IS RESULT");
      // console.log(result.rows);
      if (result.rows.length) {
        res.render("articles/show", {article: result.rows[0]});
      } else {
        res.status(404).send("article not found")
      }
        //      res.render("articles/show", {article: result.rows[0]});
    });
  });
});

app.post("/articles", function (req, res) {
 var newArticle = req.body.article;
   pg.connect(config, function(err, client, done){
        if (err) {
             console.error("OOOPS!!! SOMETHING WENT WRONG!", err);
        }
        client.query("INSERT INTO articles (title, summary, url, image) VALUES ($1, $2, $3, $4) RETURNING *", [newArticle.title, newArticle.summary, newArticle.url, newArticle.image], function (err, result) {
            done(); 
            console.log(result.rows);
            var article = result.rows[0];
            res.redirect("/articles/" + article.article_id);           
        });

    });
});

//Delete an article by ID
app.delete("/articles/:id", function (req, res) {
  pg.connect(config, function (err, client, done) {
    if (err) {
      console.error("OOPS!!!! SOMETHING WENT WRONG!", err);
    } 
    client.query("DELETE FROM articles WHERE article_id=$1 RETURNING *", [req.params.id], function(err, done){
      done();
      console.log(result.rows);
      if (result.rows.length) {
        console.log("DELETED SUCCESSFULLY");
        res.redirect("/");
      } else {
        res.status(404).send("article not found");
      }
    });

  });
});

//Listens to make sure that JS is running
app.listen(3000, function() {
	console.log(new Array(50).join("*"))
	console.log("LISTENING!");
  console.log(new Array(50).join("*"))
});