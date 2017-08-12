var express         = require("express"),           // Express framework
    expressSanitizer= require("express-sanitizer"), // Prevent malicious injection
    methodOverride  = require("method-override"),   // To recognize ?_method=PUT in order to use PUT as following restful routes
    bodyParser      = require("body-parser"),       // Get data from form
    mongoose        = require("mongoose"),          // Useful tool to manipulate mongoDB 
    app             = express();                    // variable app will have access to express methods

// APP CONFIG   
mongoose.connect("mongodb://localhost/restful_blog_app");   // Configure mongoose if DB doesnt exist, a new one will be created
app.set("view engine", "ejs");                              // For ejs files, without specifying .ejs extension
app.use(express.static("public"));                          // Customized stylesheet will be under public folder and can be served later on
app.use(bodyParser.urlencoded({extended: true}));           // To use body-parser
app.use(expressSanitizer());                                // Must go after body-parser
app.use(methodOverride("_method"));                         // Override method to PUT / DELETE / GET etc.

// MONGOOSE / MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title   : String,                                       // or title: {type: String, default: "good"} <- set default value
    image   : String,
    desc    : String,
    created :                                               // Customize default date
        {   
            type: Date,
            default: Date.now
        }           
});
var Blog = mongoose.model("Blog", blogSchema);              // Compile blogSchema to a collection in DB

// RESTFUL ROUTES
app.get("/", function(req, res){                            // Default page 
   res.redirect("/blogs"); 
});

app.get("/blogs", function(req, res){                       // INDEX ROUTE
    Blog.find({}, function(err, blogs){                     // Retrieve all blog posts from database
        if(err){
            console.log("ERROR! CANNOT RETRIEVING DATA FROM DB");
        } else{
            res.render("index", {blogs: blogs});            // Pass blogs retrieved from DB to index page
        }
    });
});

app.get("/blogs/new", function(req, res){                   // NEW ROUTE
    res.render("new");
});

app.post("/blogs", function(req, res){                      // CREATE ROUTE
    req.body.blog.desc = req.sanitize(req.body.blog.desc);
    Blog.create(req.body.blog, function(err, newBlog){      // Store newly created blog post to database
        if(err){
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    });
});

app.get("/blogs/:id", function(req, res){                   // SHOW ROUTE
    Blog.findById(req.params.id, function(err, foundBlog){  // Retrieve data from DB by the ID shown on the url
        if(err){
            res.redirect("/blogs");
        } else{
            res.render("show", {blog: foundBlog});
        }
    });
});

app.get("/blogs/:id/edit", function(req, res){              //EDIT ROUTE
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

app.put("/blogs/:id", function(req, res){                   // UPDATE ROUTE
    req.body.blog.desc = req.sanitize(req.body.blog.desc);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){    // findByIdAndUpdate(id, newdata, callback)
        if(err){
            res.redirect("/blogs");
        } else{
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

app.delete("/blogs/:id", function(req, res){                // DELETE ROUTE
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        } else{
            res.redirect("/blogs");
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("SERVER IS RUNNING !");
});