const registerForm = document.getElementById('register-form');

registerForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const statusMessage = document.getElementById("status-message");

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
            statusMessage.textContent = "Registered Successfully!"
        } else {
            statusMessage.textContent = "Registration Failed!"
        }

    } catch (error) {
        statusMessage.textContent = "Network error, please try again!"
    }
})