document.getElementById('addTimelinePost').addEventListener('click', function(event) {
    event.preventDefault();

    var form = document.getElementById('timelineForm');
    
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
    })
    .catch(error => console.error(error));
});