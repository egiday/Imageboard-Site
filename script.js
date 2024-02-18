let currentTopic = 'all'; // Default to showing all topics

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentTopic = e.target.getAttribute('data-topic');
            displayPosts(); // Refresh posts display based on the selected topic
        });
    });

    // Initial display of posts
    displayPosts();
});

// Function to display posts filtered by the current topic
function displayPosts() {
    const postsElement = document.getElementById('posts');
    postsElement.innerHTML = ''; // Clear current content

    let posts = JSON.parse(localStorage.getItem('posts')) || [];

    // Filter and sort posts
    let filteredPosts = posts.filter(post => currentTopic === 'all' || post.topic === currentTopic);
    filteredPosts.sort((a, b) => b.replies.length - a.replies.length);

    filteredPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <strong>${post.userName}</strong>
            <p>${post.postContent}</p>
            <button onclick="viewPost('${post.id}')">View ${post.replies.length} Replies</button>
        `;
        postsElement.appendChild(postElement);
    });
}

// Function for submitting a new post
function submitPost(event) {
    event.preventDefault(); // Prevent the default form submission

    const userName = document.getElementById('user-name').value.trim();
    const postContent = document.getElementById('post-content').value.trim();

    // Check if either field is empty after trimming whitespace
        if (!userName || !postContent) {
            return; // Exit the function to avoid submitting
        } else if (userName.length > 20 || postContent.length > 1000) {
            alert('Please ensure your name is no more than 20 characters and your post is no more than 200 characters.');
            return; // Exit the function to avoid submitting
        }

        const newPost = {
            id: Date.now().toString(),
            userName,
            postContent,
            topic: currentTopic, // Use the currentTopic variable set by your topic selection logic
            replies: []
        };

        let posts = JSON.parse(localStorage.getItem('posts')) || [];
        posts.push(newPost);
        localStorage.setItem('posts', JSON.stringify(posts));

        // Clear the form fields and hide the alert (if applicable)
        document.getElementById('user-name').value = '';
        document.getElementById('post-content').value = '';
        displayPosts(); // Refresh the posts display
    }


// Viewing a specific post and its replies
function viewPost(postId) {
    const post = JSON.parse(localStorage.getItem('posts')).find(p => p.id === postId);
    const postsElement = document.getElementById('posts');
    postsElement.innerHTML = `
        <div class="post-detail">
            <strong>${post.userName}</strong>
            <p>${post.postContent}</p>
            ${post.replies.map(reply => `<div class="reply"><p>${reply}</p></div>`).join('')}
            <input type="text" id="replyInput" placeholder="Write a reply...">
            <button onclick="addReply('${postId}')">Reply</button>
            <button onclick="displayPosts()">Back</button>
        </div>
    `;
}

// Adding a reply to a post
function addReply(postId) {
    const replyInput = document.getElementById('replyInput');
    const reply = replyInput.value.trim();
    if (!reply) return;

    let posts = JSON.parse(localStorage.getItem('posts'));
    const postIndex = posts.findIndex(p => p.id === postId);
    posts[postIndex].replies.push(reply);

    localStorage.setItem('posts', JSON.stringify(posts)); // Update localStorage with the new reply

    replyInput.value = ''; // Clear the input field
    viewPost(postId); // Refresh the post view
}

// Ensure the form submission is correctly hooked up
document.getElementById('post-form').addEventListener('submit', submitPost);
