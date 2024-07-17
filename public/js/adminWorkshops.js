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

//remove button modal
document.addEventListener('DOMContentLoaded', function() {
    const removeButtons = document.querySelectorAll('.remove-button');
    const confirmationModal = document.getElementById('confirmationModal');
    const closeConfirmation = document.querySelector('.close-confirmation');
    const confirmRemoveButton = document.getElementById('confirmRemoveButton');
    const cancelRemoveButton = document.getElementById('cancelRemoveButton');
    const modalContent = confirmationModal.querySelector('.modal-content p');
    let workshopToRemove = null;

    removeButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            workshopToRemove = this.closest('table'); // Get the workshop table to be removed
            const workshopName = this.getAttribute('data-workshop-name'); // Get the workshop name
            const workshopID = this.getAttribute('data-workshop-id');
            modalContent.textContent = `Are you sure you want to remove the workshop "${workshopName}", ID = "${workshopID}"?`;
            confirmRemoveButton.setAttribute('href', `/adminWorkshops/delete/${workshopID}`);
            confirmationModal.style.display = 'block';
        });
    });

    closeConfirmation.addEventListener('click', function() {
        confirmationModal.style.display = 'none';
    });

    cancelRemoveButton.addEventListener('click', function() {
        confirmationModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == confirmationModal) {
            confirmationModal.style.display = 'none';
        }
    });
});