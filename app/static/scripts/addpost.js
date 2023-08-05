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
    const requestError = document.getElementById('request-error');
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
    .then(response => {
        if (!response.ok) {
            switch (response.status) {
                case 429:
                    throw new Error('Too many requests');
                case 500:
                    throw new Error('Internal server error');
                default:
                    throw new Error('Unknown error');
            }
        }
        return response.json();
    })
    .then(newPost => {
        // Add new post to the timeline
        const timelinePosts = document.querySelector('.timeline-posts');
        const postElement = document.createElement('div');
        postElement.classList.add('timeline-post');

        const timelineId = document.createElement('div');
        timelineId.classList.add('timeline-id');
        timelineId.textContent = `#${newPost.id}`;
        postElement.appendChild(timelineId);

        const timelineLineLeft = document.createElement('div');
        timelineLineLeft.classList.add('timeline-line-left');
        postElement.appendChild(timelineLineLeft);

        const timelineLineRight = document.createElement('div');
        timelineLineRight.classList.add('timeline-line-right');
        postElement.appendChild(timelineLineRight);

        const timelineContent = document.createElement('div');
        timelineContent.classList.add('timeline-content');
        
        const contentHeader = document.createElement('div');
        contentHeader.classList.add('timeline-content-header');
        timelineContent.appendChild(contentHeader);

        const timelineAvatar = document.createElement('div');
        timelineAvatar.classList.add('timeline-avatar');
        const avatarImage = document.createElement('img');
        avatarImage.src = `https://www.gravatar.com/avatar/${newPost.email.toLowerCase().trim()}?s=200&d=identicon`;
        timelineAvatar.appendChild(avatarImage);
        contentHeader.appendChild(timelineAvatar);

        const timelineName = document.createElement('h4');
        timelineName.classList.add('timeline-name');
        timelineName.textContent = `${newPost.name} (${newPost.email})`;
        contentHeader.appendChild(timelineName);

        const content = document.createElement('p');
        content.classList.add('content');
        content.textContent = newPost.content;
        timelineContent.appendChild(content);

        const createdAt = document.createElement('p');
        createdAt.classList.add('created-at');
        const createdDate = new Date(newPost.created_at);
        const options = { timeZone: 'GMT', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour: '2-digit', hour12: true};
        const formattedDate = createdDate.toLocaleString('en-US', options);
        createdAt.textContent = formattedDate;
        timelineContent.appendChild(createdAt);

        postElement.appendChild(timelineContent);

        timelinePosts.insertAdjacentElement('afterbegin', postElement);

        // Reset form values
        form.reset();
        nameError.innerHTML = '';
        emailError.innerHTML = '';
        contentError.innerHTML = '';
        requestError.innerHTML = '';
    })
    .catch(error => {
        console.error(error);
        requestError.innerHTML = error.message;
    });
});