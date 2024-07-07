//Add Workshop Modal

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


    //Workshop Map
    const mapModal = document.getElementById('mapModal');
    const mapButton = document.getElementById('mapModalButton');
    const mapCloseButton = mapModal.querySelector('.map-close-button');

    mapButton.addEventListener('click', (event) => {
        event.preventDefault();
        mapModal.style.display = 'block';
    });

    mapCloseButton.addEventListener('click', () => {
        mapModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == mapModal) {
            mapModal.style.display = 'none';
        }
    });

    const mapForm = mapModal.querySelector('form');
    mapForm.addEventListener('submit', (event) => {
        event.preventDefault();
        mapForm.submit(); // Now submit the form
        mapModal.style.display = 'none'; // Close modal after handling the form data
        alert("Map info added successfully!"); // Show confirmation popup
    });

    mapModal.querySelector('.map-modal-content').addEventListener('click', (event) => {
        event.stopPropagation();
    });
});