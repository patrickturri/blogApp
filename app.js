var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var expressSanitizer = require('express-sanitizer');
var app = express();
var methodOverride = require('method-override');

// APP CONFIG
mongoose.connect('mongodb://localhost:27017/restful_blog_app', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride('_method'));

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: { type: Date, default: Date.now }
});

var Blog = mongoose.model('Blog', blogSchema);

// Blog.create({
// 	title: 'Test Blog',
// 	image:
// 		'https://images.unsplash.com/photo-1600791080058-ada091a95c14?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1266&q=80',
// 	body: 'HELLO THIS IS A BLOG POST!'
// });

// RESTFUL ROUTES

app.get('/', (req, res) => {
	res.redirect('/blogs');
});

app.get('/blogs', (req, res) => {
	Blog.find({}, (err, blogs) => {
		if (err) {
			console.log(err);
		} else {
			res.render('index', { blogs: blogs });
		}
	});
});

// NEW ROUTE
app.get('/blogs/new', (req, res) => {
	res.render('new');
});
// CREATE ROUTE
app.post('/blogs', (req, res) => {
	// create blog
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, (err, newBlog) => {
		if (err) {
			res.render('new');
		} else {
			res.redirect('/blogs');
		}
	});
});

// SHOW ROUTE
app.get('/blogs/:id', (req, res) => {
	Blog.findById(req.params.id, (err, foundBlog) => {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.render('show', { blog: foundBlog });
		}
	});
});

// UPDATE ROUTE
app.put('/blogs/:id', (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.redirect('/blogs/' + req.params.id);
		}
	});
});

// EDIT ROUTE
app.get('/blogs/:id/edit', (req, res) => {
	Blog.findById(req.params.id, (err, foundBlog) => {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.render('edit', { blog: foundBlog });
		}
	});
});

// DELETE ROUTE
app.delete('/blogs/:id', (req, res) => {
	// destroy blog
	Blog.findByIdAndRemove(req.params.id, (err) => {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.redirect('/blogs');
		}
	});
	// redirect somewhere
});

app.listen(3000, 'localhost', () => {
	console.log('SERVER IS RUNNING!');
});
