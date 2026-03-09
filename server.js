const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const session = require('express-session');

app.use(session({
    secret: 'my_super_secret_key',
    resave: false,
    saveUninitialized: false
}))



const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    }
    else {
        console.log("Connection to the SQLite database.")
        db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE , password_hash TEXT)', (err) => {
            if (err) {
                console.error('Failed to create table:', err.message);
            } else {
                console.log('The users table is created!');
            }
        })
        db.run('CREATE TABLE IF NOT EXISTS posts(id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT, user_id INTEGER)', (err) => {
            if (err) {
                console.error('Failed to create table:', err.message);
            } else {
                console.log('The posts table is created!');
            }
        })
    }
})



app.get('/', (req, res) => {
    res.send('Hello World!');
})



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})



app.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        db.run('INSERT INTO users ( username, password_hash) VALUES (?, ?)', [username, hashedPassword], (err) => {
            if (err) {
                res.status(400).json({
                    error: "Error saving user"
                });
                console.error(err.message)
            } else {
                res.json({
                    message: "User registered successfully!"
                });
            }
        })
    })
})



app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (!row) {
            res.json({
                message: "User not found"
            })
        } else {
            bcrypt.compare(password, row.password_hash, (err, result) => {
                if (result === true) {
                    req.session.userId = row.id;
                    res.json({
                        message: "Login successful!",
                        user: row
                    })
                } else {
                    res.json({
                        message: "Incorrect password"}
                    )
                }
            })
        }

    })
})




app.get('/profile', (req, res) => {
    const profile = req.session.userId

    if (!profile) {
        res.send("Unauthorized")
    } else {
        res.send("Welcome to your profile!")
    }
})



app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.send("Error logging out");
        } else {
            res.send("Logged out successfully!");
        }
    })
})



const requireAuth = (req, res, next) => {
    const profile = req.session.userId;

    if (profile) {
        next();
    } else {
        res.status(401).send("Unauthorized")
    }
}



app.post('/posts', requireAuth, (req, res) => {
    const content = req.body.content;
    const authorId = req.session.userId;

    db.run('INSERT INTO posts (content , user_id) VALUES(?, ?)', [content, authorId], (err) => {
        if (err) {
            res.status(500).send("Error to save!");
            console.error(err.message)
        } else {
            res.send("Post created!")
        }
    });
});




app.get('/posts', (req, res) => {
    const sql = `SELECT posts.content, users.username 
    FROM posts 
    JOIN users ON posts.user_id = users.id`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).send("Error fetching posts");
            console.error(err.message)
        } else {
            res.json(rows);
        }
    });
});