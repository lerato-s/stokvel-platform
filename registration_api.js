
// This is like writing down the address where we need to send our letter
const API_CONFIG = {
    // BASE_URL is the main address of our server - like the main post office
    // When testing on your own computer, we use localhost (your own computer's address)
    BASE_URL: 'http://localhost:3000/api',  // Change this to your actual server address later
    
    
    ENDPOINTS: {
        REGISTER: '/register',      // Where we send new user information
        LOGIN: '/login',            // Where we send login information
        VERIFY_EMAIL: '/verify'     // Where we check if email is real
    }
};


/**
 * registerUser - Sends the user's registration information to the server
 * 
 * @param {Object} userData - The user's information from the registration form
 * @param {string} userData.username - The name the user wants to use
 * @param {string} userData.email - The user's email address
 * @param {string} userData.password - The user's secret password
 * @param {string} userData.role - The user's role (admin/member/treasurer)
 * @returns {Promise<Object>} - The server's response (success or error message)
 */
async function registerUser(userData) {
    
    // Build the complete address where we're sending the data
    
    const fullURL = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.REGISTER;
    
    console.log('📮 Sending registration to:', fullURL);
    
    try {
        
        // Send the data to the server using fetch()
       
        
        const response = await fetch(fullURL, {
            
            
            method: 'POST',
            
            
            headers: {
                
                'Content-Type': 'application/json',
                
                // We can add authentication headers here if needed
                
            },
            
            
            body: JSON.stringify({
                username: userData.username,
                email: userData.email,
                password: userData.password,
                role: userData.role
            })
        });
        
        // The server sends back a response - we need to unwrap it
        // response.json() unwraps the JSON paper to see what's inside
        const data = await response.json();
        
        // Check if the server was happy or unhappy with our data
        
        
        if (!response.ok) {
            
            console.error('Server responded with error:', response.status);
            
            // Create an error object with the message from the server
           
            const error = new Error();
            error.status = response.status;
            error.message = data.message || 'Registration failed on the server';
            error.details = data;  // Keep all the error details for debugging
            
            // throw the error up to be caught by our catch() block below
            throw error;
        }
        
        // STEP 5: If we get here, everything worked perfectly!
        console.log('✅ Registration successful! Server says:', data.message);
        
        
        return {
            success: true,
            message: data.message || 'Account created successfully!',
            user: data.user || null,  // Server might send back user info
            token: data.token || null  // Server might send back an authentication token
        };
        
    } catch (error) {

        
        console.error('🚨 Registration failed completely!');
        console.error('Error details:', error);
        
        // Figure out what kind of error happened so we can give a helpful message
        
        let friendlyMessage = '';
        
        if (error.status === 400) {
            // 400 means "Bad Request" - the server is saying our data isn't right
            friendlyMessage = error.message || 'Please check your information and try again.';
            console.log('📝 Validation failed on server:', friendlyMessage);
            
        } else if (error.status === 409) {
            // 409 means "Conflict" - usually means username or email already exists
            friendlyMessage = 'This email or username is already registered. Maybe try logging in?';
            console.log('👥 Duplicate account detected');
            
        } else if (error.status === 500) {
            // 500 means "Internal Server Error" - something went wrong on the server
            friendlyMessage = 'The server is having technical difficulties. Please try again later.';
            console.log('💥 Server error - not your fault!');
            
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            // This happens when the internet is down or the server is unreachable
            friendlyMessage = 'Cannot connect to the server. Please check your internet connection.';
            console.log('🌐 Network error - check your internet connection');
            
        } else {
            // Any other kind of error we didn't specifically plan for
            friendlyMessage = error.message || 'An unexpected error occurred. Please try again.';
            console.log('❓ Unknown error occurred');
        }
        
        // Return an error object that our form can understand
        // This is better than throwing the error because it won't crash the app
        return {
            success: false,
            message: friendlyMessage,
            error: error,  // Keep the original error for debugging
            status: error.status || 0
        };
    }
}


// HELPER FUNCTION: Check if email is available
// This checks if someone has already used an email address


/**
 * checkEmailAvailability - Asks the server if an email is already registered
 * This is useful to check BEFORE submitting the whole form
 * 
 * @param {string} email - The email address to check
 * @returns {Promise<Object>} - Whether the email is available or taken
 */
async function checkEmailAvailability(email) {
    
    const fullURL = API_CONFIG.BASE_URL + '/check-email';
    
    try {
        const response = await fetch(fullURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Could not check email availability');
        }
        
        // Return true if email is available, false if taken
        return {
            available: data.available,
            message: data.message
        };
        
    } catch (error) {
        console.error('Failed to check email:', error);
        return {
            available: false,
            message: 'Could not verify email availability',
            error: error
        };
    }
}



// This saves a backup copy on the user's computer


/**
 * saveRegistrationLocally - Saves a copy of registration data on the user's computer
 * This is like writing important information on a sticky note
 * Useful if the internet connection is lost
 * 
 * @param {Object} userData - The registration data to save
 */
function saveRegistrationLocally(userData) {
    // localStorage is like a tiny notebook inside the browser
    // It remembers things even after the page is closed
    
    try {
        // Create a safe copy without the password 
        const safeData = {
            username: userData.username,
            email: userData.email,
            role: userData.role,
            timestamp: new Date().toISOString()
            
        };
        
        // JSON.stringify converts our object to text
        // localStorage.setItem saves it in the browser's notebook
        localStorage.setItem('pendingRegistration', JSON.stringify(safeData));
        
        console.log('📝 Registration data saved locally (without password)');
        
    } catch (error) {
        console.warn('Could not save registration data locally:', error);
        // This might fail if localStorage is full or disabled
    }
}


// HELPER FUNCTION: Clear local registration data
// This removes the sticky note when we're done with it


/*
 * clearLocalRegistration - Removes saved registration data
 * Call this after successful registration
 */
function clearLocalRegistration() {
    try {
        localStorage.removeItem('pendingRegistration');
        console.log('🧹 Cleared local registration data');
    } catch (error) {
        console.warn('Could not clear local data:', error);
    }
}



// This connects our API to your existing HTML form


// Wait for the HTML to be fully loaded before we do anything
document.addEventListener('DOMContentLoaded', function() {
    
    console.log(' Registration API loaded and ready');
    
    // Find the form in the HTML page
    const form = document.getElementById('form');
    
    // If the form exists on this page, set it up
    if (form) {
        // Get all the input fields
        const username_input = document.getElementById('username');
        const email_input = document.getElementById('email');
        const password_input = document.getElementById('password');
        const role_select = document.getElementById('role');
        const error_message = document.getElementById('error-message');
        
        // Listen for when the user submits the form
        form.addEventListener('submit', async function(event) {
            
            // Stop the form from refreshing the page
            event.preventDefault();
            
            console.log('Form submitted - calling registration API');
            
            // Get all the values from the form fields
            const userData = {
                username: username_input.value,
                email: email_input.value,
                password: password_input.value,
                role: role_select.value
            };
            
            // Show a loading message to the user
            if (error_message) {
                error_message.innerText = 'Creating your account...';
                error_message.style.color = '#2196F3';  // Blue means "working on it"
            }
            
            // Disable the submit button so user doesn't click it alot
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerText;
            submitButton.disabled = true;
            submitButton.innerText = 'Registering...';
            
            // Save a local copy just in case
            saveRegistrationLocally(userData);
            
            // CALL OUR API FUNCTION 
            const result = await registerUser(userData);
            
            // Re-enable the submit button
            submitButton.disabled = false;
            submitButton.innerText = originalButtonText;
            
           
            if (result.success) {
              
                
                console.log(' Registration complete!');
                
                // Clear any saved local data since we don't need it anymore
                clearLocalRegistration();
                
                // Show a happy green success message
                if (error_message) {
                    error_message.innerText = result.message || 'Account created successfully!';
                    error_message.style.color = '#00C851';  
                }
                
                // Wait 2 seconds so they can read the message
                setTimeout(function() {
                    // Then send them to the login page
                    window.location.href = 'login.html';
                }, 2000);
                
            } else {
                
                
                console.log('❌ Registration failed:', result.message);
                
                // Show the error message in red
                if (error_message) {
                    error_message.innerText = result.message || 'Registration failed. Please try again.';
                    error_message.style.color = '#ff4444';
                }
                
                // The data is still saved locally in case they want to try again later
                console.log('Registration data saved locally - can retry later');
            }
        });
        
        console.log('Form connected to registration API');
    } else {
        console.log('ℹNo registration form found on this page');
    }
});




if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registerUser,
        checkEmailAvailability,
        saveRegistrationLocally,
        clearLocalRegistration,
        API_CONFIG
    };
}

