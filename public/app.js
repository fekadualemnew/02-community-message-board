//THIS IS FOR REGISTRATION
const registerForm = document.getElementById('register-form');
const statusMessage = document.getElementById("status-message");
let currentUser = null;

registerForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;

    try {

        const response = await fetch('http://localhost:3000/register', {
            method: 'post',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })

        const data = await response.json();

        if (response.ok) {
            statusMessage.textContent = "Registered Successfully!";
            statusMessage.style.color = 'green';
            registerForm.reset();
        } else {
            statusMessage.textContent = "Registration Failed!";
            statusMessage.style.color = 'red';
        }

    } catch (error) {
        statusMessage.textContent = "Network error, please try again!";
        statusMessage.style.color = 'red';
    }
})





//THIS IS FOR LOGIN
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('login-username');
const passwordInput = document.getElementById('login-password');

const loginView = document.getElementById('login-view');
const feedView = document.getElementById('feed-view');


loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    usernameInput.value;
    passwordInput.value;

    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            username: usernameInput.value,
            password: passwordInput.value
        })
    })
    const data = await response.json();

    if (data.message === "Login successful!") {
        statusMessage.textContent = "Login Successfully!";
        loginView.style.display = "none";
        feedView.style.display = "block";
        fetchPosts();
        currentUser = data.user.username;

        //WELCOME MESSAGE
        const welcomeMessage = document.getElementById('welcome-message');
        welcomeMessage.textContent = `Welcome back, ${currentUser}`

    } else if (data.message === "User not found") {
        statusMessage.textContent = "User not found!"
    } else {
        statusMessage.textContent = "Incorrect password!";
    }
})


//FEED VIEW
const sendMessage = document.getElementById('send-message');
const contentInput = document.getElementById('post-content');

sendMessage.addEventListener('submit', async (e) => {
    e.preventDefault();

    const textToSave = contentInput.value;

    contentInput.value = '';

    try {
        if (textToSave === '') {
            console.log('empty input')
        } else {
            const response = await fetch('http://localhost:3000/posts', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    content: textToSave
                })
            })

            fetchPosts();
        }
    } catch {
        statusMessage.textContent = "Something went wrong!"
        statusMessage.style.color = 'red'
    }

});

async function fetchPosts() {
    const response = await fetch('http://localhost:3000/posts');

    const data = await response.json();

    const postListElement = document.getElementById("post-list");

    postListElement.innerHTML = '';

    for (let i = 0; i < data.length; i++) {
        const newPost = document.createElement('li');
        newPost.textContent = `${data[i].username}: ${data[i].content}`;
        //FOR TIMESTAMP
        const timeElement = document.createElement('small');
        timeElement.textContent = new Date(data[i].created_at).toLocaleString();
        newPost.appendChild(timeElement);

        if (currentUser === data[i].username) {

            //FOR DELETE
            const deleteBtn = document.createElement('button')
            newPost.appendChild(deleteBtn);

            deleteBtn.textContent = 'Delete';

            deleteBtn.addEventListener('click', async function () {
                const response = await fetch(`http://localhost:3000/posts/${data[i].id}`, {
                    method: 'DELETE'
                })
                fetchPosts();
            })

            //FOR EDIT
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            newPost.appendChild(editBtn);

            editBtn.addEventListener('click', async function () {
                const updateText = prompt("Edit your message:", data[i].content);
                if (updateText !== null) {
                    const response = await fetch(`http://localhost:3000/posts/${data[i].id}`, {
                        method: 'PUT',
                        headers: {
                            'content-type': 'application/json'
                        },
                        body: JSON.stringify({
                            content: updateText
                        })
                    });
                    fetchPosts();
                }
            })
        }
        postListElement.appendChild(newPost);
    }
}


// FOR LOGOUT
const logoutBtn = document.getElementById('logout-btn')

logoutBtn.addEventListener('click', async function () {

    const response = await fetch('http://localhost:3000/logout', {
        method: 'POST'
    });

    currentUser = null;
    feedView.style.display = "none";
    loginView.style.display = "block";
})



//FOR DELETE ALL
const deleteAllBtn = document.getElementById('delete-all-btn');

deleteAllBtn.addEventListener('click', async function () {
    const response = await fetch('http://localhost:3000/posts/all', {
        method: 'DELETE'
    })
    fetchPosts();
})



