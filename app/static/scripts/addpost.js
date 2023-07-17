document.getElementById('addTimelinePost').addEventListener('click', function(event) {
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const contentError = document.getElementById('content-error');
    event.preventDefault();

    var form = document.getElementById('timelineForm');

    if (!form.checkValidity()) {
        // Append error message to the form
        nameError.innerHTML = '';
        emailError.innerHTML = '';
        contentError.innerHTML = '';

        // If email input is not valid, append error message 
        var email = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
        if (!email.test(form.email.value)) {
            emailError.innerHTML = 'Email is invalid';
        }
        var name = /^[\p{L}\p{M}]+(?:\p{Zs}[\p{L}\p{M}]+)+$/u;
        if (!name.test(form.name.value)) {
            nameError.innerHTML = 'Name is invalid';
        }

        // If name, email, or content is empty, append error message
        if (form.name.value === '') {
            nameError.innerHTML = 'Name is required';
        }
        if (form.email.value === '') {
            emailError.innerHTML = 'Email is required';
        }
        if (form.content.value === '') {
            contentError.innerHTML = 'Content is required';
        }

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