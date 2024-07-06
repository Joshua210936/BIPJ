document.addEventListener('DOMContentLoaded', (event) => {
    const modal = document.getElementById('filterModal');
    const filterButton = document.querySelector('.filter-icon');
    const closeButton = document.querySelector('.close-button');

    filterButton.addEventListener('click', (event) => {
        event.preventDefault();
        modal.style.display = 'block';
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Prevent form submission
    const form = modal.querySelector('form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        form.submit(); // Now submit the form
        modal.style.display = 'none'; // Close modal after handling the form data
        alert("Workshop added successfully!"); // Show confirmation popup
    });
    
    // Prevent clicks inside the modal from propagating to the window click listener
    modal.querySelector('.modal-content').addEventListener('click', (event) => {
        event.stopPropagation();
    });
});