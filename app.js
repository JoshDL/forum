const   express                 = require('express'),
        mongoose                = require('mongoose'),
        passport                = require('passport'),
        LocalStrategy           = require('passport-local'),
        User                    = require('./models/user'),
        Post                    = require('./models/post'),
        Comment                 = require('./models/comment');

var PORT = 3002;

//Mongoose Setup
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/forum3", { useNewUrlParser: true });

//Express setup
const app = express();
app.set('view engine','ejs');

//Passport setup
app.use(require('express-session')({
    secret:"42",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//========
// Routes
//========

app.get('/', function(req, res){
    res.render('home');
});

app.get('/denied', function(req, res){
    res.render('denied');
});

app.get('/register', function(req, res){
    res.render('register');
});

app.post('/register', function(req, res){
    User.register(new User({
        username: req.body.username,
        nickname: req.body.nickname, 
        firstName: req.body.firstName, 
        lastName: req.body.lastName,
        country: req.body.country}), 
        req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register');
        }
        passport.authenticate('local')(req,res, function(){
            res.redirect('/success');
        })
    });
});

app.get('/success', function(req, res){
    res.render('success');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: "/dashboard",
    failureRedirect: "/"
}),function(req, res){
});

// app.get('/dashboard', isLoggedIn, function(req, res){
//     res.send(req.user)
// });

app.get('/dashboard', isLoggedIn, function(req, res){
    res.render('dashboard', { loggedUser : req.user })
});

app.get('/admin', isAdmin, function(req, res){
    res.render('admin', { loggedUser : req.user })
});

app.get('/admin/members', isAdmin, function(req, res){
    User.find({}, (err, User) => {
        if (err) {
            res.send(err);
        }
        res.render('members', {User});
    })
});

app.get('/admin/members/:id', isAdmin, function(req,res){
    User.findById(req.params.id, (err, User) => {
        if (err) {
            res.send(err);
        }
        res.render('account', {User} )});
});

app.post('/admin/members/:id', isAdmin, function (req, res){
    User.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: false }, (err, User) => {
        if (err) {
            res.send(err);
        }
        res.render('updated');
    })
});

///////////////////////////////////////////////////////////////////////
//      FFFFF    OOO    RRRRR   UU  UU   MM       MM
//      FF      OO OO   RR RR   UU  UU   MM MM MM MM
//      FFFF    OO OO   RRR     UU  UU   MM   MM  MM
//      FF       OOO    RR RR    UUUU    MM       MM
/////////////////////////////////////////////////////////////////////////

app.get('/forum', isUser, function(req, res){
    res.render('forum')
});

// Main forum routes

// app.get('/forum/general', isUser, function(req, res){
//     Post.find({}, (err, Post) => {
//         res.render('forum/general', {Post, User})
//     })
// });

// app.get('/forum/activismo', isUser, function(req, res){
//     Post.find({}, (err, Post) => {
//         res.render('forum/activismo', {Post, User})
//     })
// });

// app.get('/forum/libertarismo', isUser, function(req, res){
//     Post.find({}, (err, Post) => {
//         res.render('forum/libertarismo', {Post, User})
//     })
// });

// app.get('/forum/formacion', isUser, function(req, res){
//     Post.find({}, (err, Post) => {
//         res.render('forum/formacion', {Post, User})
//     })
// });

// app.get('/forum/proyectos', isUser, function(req, res){
//     Post.find({}, (err, Post) => {
//         res.render('forum/proyectos', {Post, User})
//     })
// });

// app.get('/forum/voluntariado', isUser, function(req, res){
//     Post.find({}, (err, Post) => {
//         res.render('forum/voluntariado', {Post, User})
//     })
// });

// app.get('/forum/sugerencias', isUser, function(req, res){
//     Post.find({}, (err, Post) => {
//         res.render('forum/sugerencias', {Post, User})
//     })
// });

// app.get('/forum/intranet', isUser, function(req, res){
//     Post.find({}, (err, Post) => {
//         res.render('forum/intranet', {Post, User})
//     })
// });

// app.get('/forum/offtopic', isUser, function(req, res){
//     Post.find({}, (err, Post) => {
//         res.render('forum/offtopic', {Post, User})
//     })
// });

// app.get('/forum/offtopic', isUser, function(req, res){
//     Post.find({}, (err, Post) => {
//         res.render('forum/offtopic', {Post, User})
//     })s
// });

app.get('/forum/:id', isUser, function(req, res){
    Post.find({}, (err, Post) => {
        res.render('forum/'+req.params.id, {Post, User})
    })
});


// Routes creating new posts


// routes to post

// app.get('/forum/:id', isUser, function(req, res){
//     res.render('forum/:id')
// });

app.post('/forum/general_new', isUser, function(req, res){
    Post.create({
        title: req.body.title,
        section: "general",
        creator: req.user.nickname,
        // lastUserUpdated: req.user.nickname,
        comment: req.body.comment,
        children: [],
        function (err, Post){if (err) {res.send(err)} else {} }
    }, res.redirect('general'))
});

app.post('/forum/activismo_new', isUser, function(req, res){
    Post.create({
        title: req.body.title,
        section: "activismo",
        creator: req.user.nickname,
        // lastUserUpdated: req.user.nickname,
        comment: req.body.comment,
        children: [],
        function (err, Post){if (err) {res.send(err)} else {} }
    }, res.redirect('activismo'))
});

app.post('/forum/libertarimo_new', isUser, function(req, res){
    Post.create({
        title: req.body.title,
        section: "libertarimo",
        creator: req.user.nickname,
        // lastUserUpdated: req.user.nickname,
        comment: req.body.comment,
        children: [],
        function (err, Post){if (err) {res.send(err)} else {} }
    }, res.redirect('libertarimo'))
});

app.post('/forum/formacion_new', isUser, function(req, res){
    Post.create({
        title: req.body.title,
        section: "formacion",
        creator: req.user.nickname,
        // lastUserUpdated: req.user.nickname,
        comment: req.body.comment,
        children: [],
        function (err, Post){if (err) {res.send(err)} else {} }
    }, res.redirect('formacion'))
});

app.post('/forum/proyectos_new', isUser, function(req, res){
    Post.create({
        title: req.body.title,
        section: "proyectos",
        creator: req.user.nickname,
        // lastUserUpdated: req.user.nickname,
        comment: req.body.comment,
        children: [],
        function (err, Post){if (err) {res.send(err)} else {} }
    }, res.redirect('proyectos'))
});

app.post('/forum/voluntariado_new', isUser, function(req, res){
    Post.create({
        title: req.body.title,
        section: "voluntariado",
        creator: req.user.nickname,
        // lastUserUpdated: req.user.nickname,
        comment: req.body.comment,
        children: [],
        function (err, Post){if (err) {res.send(err)} else {} }
    }, res.redirect('voluntariado'))
});

app.post('/forum/sugerencias_new', isUser, function(req, res){
    Post.create({
        title: req.body.title,
        section: "sugerencias",
        creator: req.user.nickname,
        // lastUserUpdated: req.user.nickname,
        comment: req.body.comment,
        children: [],
        function (err, Post){if (err) {res.send(err)} else {} }
    }, res.redirect('sugerencias'))
});

app.post('/forum/intranet_new', isUser, function(req, res){
    Post.create({
        title: req.body.title,
        section: "intranet",
        creator: req.user.nickname,
        // lastUserUpdated: req.user.nickname,
        comment: req.body.comment,
        children: [],
        function (err, Post){if (err) {res.send(err)} else {} }
    }, res.redirect('intranet'))
});

app.post('/forum/offtopic_new', isUser, function(req, res){
    Post.create({
        title: req.body.title,
        section: "offtopic",
        creator: req.user.nickname,
        // lastUserUpdated: req.user.nickname,
        comment: req.body.comment,
        children: [],
        function (err, Post){if (err) {res.send(err)} else {} }
    }, res.redirect('offtopic'))
});



app.get('/forum/general/:id', isUser, function(req, res){
    Post.findById({ _id: req.params.id }, (err, Post)=>{
        if (err){
            console.log(err)
        } else {
            Comment.find({}, (err, Comment)=>{
                res.render('forum/posts', {Post, Comment})
            })
        }
    })
});

app.post('/forum/general/:id', isUser, function(req, res){
    Comment.create({
        comment: req.body.comment,
        creator: req.user.nickname
        }, function(err, comment){
        Post.findById({_id: req.params.id}, function(err,foundPost){
            foundPost.children.push(comment._id);
            foundPost.save(function(err,data){
                if (err){
                    console.log(err)
                } else {
                    res.redirect('back')
                }
            })
        })
    })
});

///////////////////////////////////// End of forum routes

app.post('/admin/members/:id', isAdmin, function (req, res){
    User.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: false }, (err, User) => {
        if (err) {
            res.send(err);
        }
        res.render('updated');
    })
});

app.get('/chat', isUser, function(req, res){
    res.render('chat')
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/')
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/')
};

function isUser(req, res, next){
    if(req.user.level>=0){
        return next();
    }
    res.redirect('/denied')
};

function isAdmin(req, res, next){
    if(req.user.level>=0){
        return next();
    }
    res.redirect('/denied')
};

function isIT(req, res, next){
    if(req.user.level>=0){
        return next();
    }
    res.redirect('/denied')
};
// function authLevel(req, res, next){

// };

// code to check passwords is in: http://jsfiddle.net/aelor/F6sEv/324/


//Server setup
app.listen(PORT, () =>
    console.log(`Server initialized on port: ${PORT}`)
);