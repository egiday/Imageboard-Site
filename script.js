let currentTopic = 'all'; // Default to showing all topics

document.addEventListener('DOMContentLoaded', () => {
    // Prompt for username if not already saved
    if (!localStorage.getItem('userName')) {
        const userName = prompt('Please enter your name:', '');
        if (userName) {
            localStorage.setItem('userName', userName);
        }
    }
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

function displayPosts(filteredPosts = null) {
    const postsElement = document.getElementById('posts');
    postsElement.innerHTML = ''; // Clear current content

    // Use the provided filteredPosts or retrieve all posts if none are provided
    let posts = filteredPosts || JSON.parse(localStorage.getItem('posts')) || [];

    // The existing sorting and filtering logic remains the same
    let sortedFilteredPosts = posts.filter(post => currentTopic === 'all' || post.topic === currentTopic);
    sortedFilteredPosts.sort((a, b) => b.replies.length - a.replies.length);

    sortedFilteredPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        let postHtml = `
            <strong>${post.userName}</strong>
            <p>${post.postContent}</p>
        `;

        // If there's an image, add an <img> element to display it
        if (post.image) {
            postHtml += `<img src="${post.image}" alt="User uploaded image" style="max-width: 100%; height: auto;">`;
        }

        postHtml += `<button onclick="viewPost('${post.id}')">View ${post.replies.length} Replies</button>`;

        postElement.innerHTML = postHtml;
        postsElement.appendChild(postElement);
    });
}

function searchPosts() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
    const posts = JSON.parse(localStorage.getItem('posts')) || [];

    // Filter posts by search query
    const filteredPosts = posts.filter(post => 
        post.postContent.toLowerCase().includes(searchQuery) ||
        post.userName.toLowerCase().includes(searchQuery) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchQuery)))
    );

    displayPosts(filteredPosts); // Directly use displayPosts with filtered results
}



function submitPost(event) {
    event.preventDefault(); // Prevent the default form submission

    const userName = localStorage.getItem('userName') || 'Anonymous';
    const postContent = document.getElementById('post-content').value.trim();
    const imageFile = document.getElementById('image-upload').files[0];

    if (!userName || !postContent) {
        return; // Exit the function to avoid submitting
    }

    // Convert image to Base64 if present
    if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = function() {
            const base64Image = reader.result;
            createPost(userName, postContent, base64Image);
        };
        reader.readAsDataURL(imageFile);
    } else {
        // No image uploaded, proceed without an image
        createPost(userName, postContent);
    }
}

// Refactored post creation logic into a separate function
function createPost(userName, postContent, imageBase64 = '') {
    const newPost = {
        id: Date.now().toString(),
        userName,
        postContent,
        image: imageBase64, // Store the Base64 image string
        topic: currentTopic, // Use the currentTopic variable set by your topic selection logic
        replies: []
    };

    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.push(newPost);
    localStorage.setItem('posts', JSON.stringify(posts));

    // Clear the form fields and refresh the posts display
    document.getElementById('user-name').value = '';
    document.getElementById('post-content').value = '';
    document.getElementById('image-upload').value = ''; // Reset file input
    displayPosts();
}


// Viewing a specific post and its replies
function viewPost(postId) {
    const post = JSON.parse(localStorage.getItem('posts')).find(p => p.id === postId);
    const postsElement = document.getElementById('posts');
    postsElement.innerHTML = `
        <div class="post-detail">
            <strong>${post.userName}</strong>
            <p>${post.postContent}</p>
            <div class="replies">
                ${post.replies.map(reply => `<div class="reply"><strong>${reply.userName}:</strong> <p>${reply.content}</p></div>`).join('')}
            </div>
            <input type="text" id="replyInput" placeholder="Write a reply...">
            <button onclick="addReply('${postId}')">Reply</button>
            <button onclick="displayPosts()">Back</button>
        </div>
    `;
}

// Adding a reply to a post
function addReply(postId) {
    const replyInput = document.getElementById('replyInput');
    const replyContent = replyInput.value.trim();a
    const userName = localStorage.getItem('userName') || 'Anonymous'; // Use stored username

    if (!replyContent) return;

    let posts = JSON.parse(localStorage.getItem('posts'));
    const postIndex = posts.findIndex(p => p.id === postId);
    const reply = { userName, content: replyContent };
    posts[postIndex].replies.push(reply);

    localStorage.setItem('posts', JSON.stringify(posts)); // Update localStorage with the new reply

    replyInput.value = ''; // Clear the input field
    viewPost(postId); // Refresh the post view
}



// Ensure the form submission is correctly hooked up
document.getElementById('post-form').addEventListener('submit', submitPost);