let currentEditingIndex = null;

// Show modal to add/edit a document
let addDocumentButton = document.getElementById('add-document-button');
addDocumentButton.addEventListener('click', () => {
    document.getElementById("documentModal").style.display = "block";
    currentEditingIndex = null;  // Reset the editing index
    clearInput();  // Clear input for adding new document
});

// Close the modal
let closeDocumentModal = document.getElementById('close-document-modal');
closeDocumentModal.addEventListener('click', () => {
    document.getElementById("documentModal").style.display = "none";
    clearInput();  // Clear input when modal is closed
});

// Save document to localStorage
document.getElementById('submit-document-button').addEventListener('click', function () {
    var title = document.getElementById('document-input').value;
    var content = document.getElementById('document-body').value;  // Get plain text from textarea

    var documents = JSON.parse(localStorage.getItem('documents')) || [];

    if (currentEditingIndex !== null) {
        // Update an existing document
        documents[currentEditingIndex] = { title, content };
    } else {
        // Add a new document
        documents.push({ title, content });
    }

    localStorage.setItem('documents', JSON.stringify(documents));  // Save to localStorage
    document.getElementById("documentModal").style.display = "none";  // Close modal

    // Reload document list
    loadDocument();

    clearInput();  // Clear input after saving
});

// Function to load and display documents
function loadDocument() {
    var documents = JSON.parse(localStorage.getItem('documents')) || [];
    var content = '';

    documents.forEach(function (doc, index) {
        let docTitle = doc.title;
        let docContent = doc.content;  // Plain text content
        let the_first_characters = docContent.substring(0, 10);
        content += '<div class="card">' +
            '<h3 class="note-title"><strong>Title: ' + docTitle + '</strong></h3>' +
            '<div>' + the_first_characters + '</div>' +
            '<button onclick="editDocument(' + index + ')" class="edit-button">Edit</button>' +
            '<button onclick="deleteDocument(' + index + ')" class="delete-button">Delete</button>' +
            '</div>';
    });

    document.getElementById('documents-list').innerHTML = content;
}

// Function to edit a document
function editDocument(index) {
    var documents = JSON.parse(localStorage.getItem('documents')) || [];
    var doc = documents[index];

    document.getElementById('document-input').value = doc.title;  // Populate title
    document.getElementById('document-body').value = doc.content;  // Populate textarea with existing content

    currentEditingIndex = index;  // Set the current editing document index
    document.getElementById("documentModal").style.display = "block";  // Show modal
}

// Function to delete a document
function deleteDocument(index) {
    var documents = JSON.parse(localStorage.getItem('documents')) || [];
    documents.splice(index, 1);  // Remove the document from the list

    localStorage.setItem('documents', JSON.stringify(documents));  // Update localStorage
    loadDocument();  // Reload the document list
}

// Load document list on page load
loadDocument();

// Helper function to clear input fields
function clearInput() {
    document.getElementById('document-input').value = '';
    document.getElementById('document-body').value = '';
}
