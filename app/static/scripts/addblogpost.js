// addblogpost.js

// Get references to the form and its fields
const titleField = document.getElementById('title');
const imageUrlField = document.getElementById('image_url');
const contentField = document.getElementById('myMarkdownEditor');
const categoryField = document.getElementById('category');
const form = document.getElementById('blogPostForm');

function validateFormInput(input, errorElement, validationRegex, requiredMessage, invalidMessage) {
    errorElement.textContent = '';
    if (input.value.trim() === '') {
        errorElement.textContent = requiredMessage;
        return false;
    }
    if (!validationRegex.test(input.value)) {
        errorElement.textContent = invalidMessage;
        return false;
    }
    return true;
}

function checkFormValidity() {
    var valid = true;
    const titleRegex = /^.+$/; // Adjust as needed
    const urlRegex = /^https?:\/\/[^ \n]+$/i;
    const contentRegex = /^.+$/;
    const categoryRegex = /^.+$/;

    valid &= validateFormInput(
        titleField,
        document.getElementById('title-error'),
        titleRegex,
        'Title is required',
        'Title is invalid'
    );

    valid &= validateFormInput(
        imageUrlField,
        document.getElementById('image_url-error'),
        urlRegex,
        'Image URL is required',
        'Image URL is invalid'
    );

    valid &= validateFormInput(
        categoryField,
        document.getElementById('category-error'),
        categoryRegex,
        'Category is required',
        'Category is invalid'
    );

    return valid;
}

// This function will send a POST request to create a new blog post
// This function will send a POST request to create a new blog post
function createPost(title, imageUrl, category) {
    const payload = new FormData(form);
    fetch('/api/blog_posts', {
        method: 'POST',
        body: payload
    })
    .then(response => {
        if (!response.ok) {
            console.log(response);
            return response.text();
        }
        return response.json();
    })
    .then(responseData => {
        if (typeof responseData === 'string') {
            throw new Error(`Server responded with status ${responseData}`);
        }
        titleField.value = '';
        imageUrlField.value = '';
        categoryField.value = '';
        simplemde.value(''); 
        alert('Post created successfully!');
    })
    .catch(e => {
        console.log('There was a problem with the request:', e.message);
    });
}

// Handle the button click event
document.getElementById('addBlogPost').addEventListener('click', function(event) {
    event.preventDefault();
    contentField.value = simplemde.value(); // update textarea value with SimpleMDE content

    if (!checkFormValidity()) return;

    createPost(titleField.value, imageUrlField.value, categoryField.value);
});

