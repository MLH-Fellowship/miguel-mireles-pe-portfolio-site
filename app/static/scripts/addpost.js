function validateFormInput(input, errorElement, validationRegex, requiredMessage, invalidMessage) {
    errorElement.innerHTML = '';
    if (input.value.trim() === '') {
        errorElement.innerHTML = requiredMessage;
        return false;
    }
    if (!validationRegex.test(input.value)) {
        errorElement.innerHTML = invalidMessage;
        return false;
    }
    return true;
}

function checkFormValidity(form, nameError, emailError, contentError) {
    var valid = true;
    const nameRegex = /^[\p{L}\p{M}]+(?:\p{Zs}[\p{L}\p{M}]+)*$|^[\p{L}\p{M}]+$/u;
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/u;

    valid &= validateFormInput(
        form.name,
        nameError,
        nameRegex,
        'Name is required',
        'Name is invalid'
    );

    valid &= validateFormInput(
        form.email,
        emailError,
        emailRegex,
        'Email is required',
        'Email is invalid'
    );

    valid &= validateFormInput(
        form.content,
        contentError,
        /.+/,
        'Content is required',
        ''
    );

    return valid;
}


document.getElementById('addTimelinePost').addEventListener('click', function(event) {
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const contentError = document.getElementById('content-error');
    event.preventDefault();

    var form = document.getElementById('timelineForm');

    if (!checkFormValidity(form, nameError, emailError, contentError)) {
        return;
    }
    
    const payload = new FormData(form);

    fetch('/api/timeline_post', {
        method: 'POST',
        body: payload
    })
    .then(response => response.json())
    .then(newPost => {
        // Add new post to the timeline
        const timelinePosts = document.querySelector('.timeline-posts');
        const postElement = document.createElement('div');
        postElement.classList.add('timeline-post');
        const createdDate = new Date(newPost.created_at);
        const options = { timeZone: 'GMT', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour: '2-digit', hour12: true };
        const formattedDate = createdDate.toLocaleString('en-US', options);
        postElement.innerHTML = `
            <div class="timeline-id">#${newPost.id}</div>
            <div class="timeline-line-left"></div>
            <div class="timeline-line-right"></div>
            <div class="timeline-content">
                <div class="timeline-content-header">
                    <div class="timeline-avatar">
                        <img src="https://www.gravatar.com/avatar/${newPost.email.toLowerCase().trim()}?s=200&d=identicon" />
                    </div>
                    <h4 class="timeline-name">${newPost.name} (${newPost.email})</h4>
                </div>
                <p class="content">${newPost.content}</p>
                <p class="created-at">${formattedDate}</p>
            </div>
        `;
        timelinePosts.insertAdjacentElement('afterbegin', postElement);

        // Reset form values
        form.reset();
        nameError.innerHTML = '';
        emailError.innerHTML = '';
        contentError.innerHTML = '';
    })
    .catch(error => console.error(error));
});