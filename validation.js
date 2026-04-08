const form = document.getElementById('form')
const username_input = document.getElementById('username')
const email_input = document.getElementById('email')
const password_input = document.getElementById('password')
const error_message = document.getElementById('error-message')

form.addEventListener('submit', (e) => {
   
   let errors = []

   if (username_input) {
    // if we have a username input then we are in the resgistration page

        errors = getRegistrationFormErrors(username_input.value , email_input.value, password_input.value)

   }

   else{
    // if we dont have a username input then we are in the login page

        errors = getLoginFormErrors(email_input.value, password_input.value)
   }

   if(errors.length > 0){
    // if there sre any errors 
        e.preventDefault()
        error_message.innerText = errors.join(". ")
   }
})

function getRegistrationFormErrors(usernameVal, emailVal, passwordVal){
    let errors = []

    //clearErrors() // clear previous errors before validating the form

    if(usernameVal === '' || usernameVal  === null){
        errors.push('Username is required')
        username_input.parentElement.classList.add('incorrect')

    }
    if(emailVal === '' || emailVal === null){
        errors.push('Email is required')
        email_input.parentElement.classList.add('incorrect')
        
    }
    if(passwordVal === '' || passwordVal === null){
        errors.push('Password is required')
        password_input.parentElement.classList.add('incorrect')
        
    }
    if(passwordVal.length < 8){
        errors.push('Password must be at least 8 characters long')
        password_input.parentElement.classList.add('incorrect')
    }
    return errors 

}

const allInputs = [username_input, email_input, password_input]
allInputs.forEach(input => {
    input.addEventListener('input', () => {
        if(input.parentElement.classList.contains('incorrect')){
            input.parentElement.classList.remove('incorrect')
            error_message.innerText = ''
        }

})
})


