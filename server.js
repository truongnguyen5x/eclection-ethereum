const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const FileStore = require('session-file-store')(session);
const API = require('./core/api_constants');
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    path: './database/sessions',
    resave: false,
    saveUninitialized: true,
    store: new FileStore(),
    secret: 'this-is-a-secret-token-1',
    cookie: { maxAge: 600*1000 }
}));

// const guest_router = require('./route/guest_router');
// app.use(API.GUEST, guest_router);
// const user_router = require('./route/user_router');
// app.use(API.USER, user_router);
// const admin_router = require('./route/admin_router');
// app.use(API.ADMIN, admin_router);


app.use(express.static(path.join(__dirname, 'public')));
if (process.env.NODE_ENV === "production") {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/build')));

    // Handle React routing, return all requests to React app
    app.get('*', (request, response) => {
        response.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

app.listen(port, () => console.log(`Listening on port ${port}`));