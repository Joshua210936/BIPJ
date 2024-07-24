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

        const workshopStartDate = document.getElementById('workshopStartDate');
        const workshopEndDate = document.getElementById('workshopEndDate');

        workshopStartDate.value = new Date(workshopStartDate.value).toISOString().slice(0, 10);
        workshopEndDate.value = new Date(workshopEndDate.value).toISOString().slice(0, 10);

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

document.addEventListener('DOMContentLoaded', (event) => {

    // update button modal logic
    const updateButtons = document.querySelectorAll('.updateButton');
    
    updateButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const workshopID = button.getAttribute('data-workshop-id');
            const workshopName = button.getAttribute('data-workshop-name');
            const workshopImage = button.getAttribute('data-workshop-image');
            const workshopStartDate = button.getAttribute('data-workshop-start-date');
            const workshopEndDate = button.getAttribute('data-workshop-end-date');
            const workshopTimeStart = button.getAttribute('data-workshop-time-start');
            const workshopTimeEnd = button.getAttribute('data-workshop-time-end');
            const workshopAddress = button.getAttribute('data-workshop-address');
            const workshopLatitude = button.getAttribute('data-workshop-latitude');
            const workshopLongitude = button.getAttribute('data-workshop-longitude');
            const workshopDescription = button.getAttribute('data-workshop-description');

            document.getElementById('updateModal').style.display = 'block';
            
            // Set placeholders
            document.getElementById('workshopID').innerHTML = workshopID;
            document.getElementById('updateWorkshopName').value = workshopName;
            document.getElementById('previewWorkshopImage').src = `../images/${workshopImage}`;
            document.getElementById('updateWorkshopStartDate').value = workshopStartDate;
            document.getElementById('updateWorkshopEndDate').value = workshopEndDate;
            document.getElementById('updateStartTime').value = workshopTimeStart;
            document.getElementById('updateEndTime').value = workshopTimeEnd;
            document.getElementById('updateWorkshopAddress').value = workshopAddress;
            document.getElementById('updateWorkshopLatitude').value = workshopLatitude;
            document.getElementById('updateWorkshopLongitude').value = workshopLongitude;
            document.getElementById('updateDescription').value = workshopDescription;
            document.getElementById('updateWorkshopID').value = workshopID; // Hidden input field for ID
            document.getElementById('updateWorkshopForm').action = `/adminWorkshops/edit/${workshopID}`; // Set form action URL
        });
    });

    // Close modal logic
    const closeButtons = document.querySelectorAll('.close-confirmation');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('updateModal').style.display = 'none';
        });
    });
    window.addEventListener('click', (event) => {
        if (event.target == document.getElementById('updateModal')) {
            document.getElementById('updateModal').style.display = 'none';
        }
    });
    document.getElementById('updateModal').querySelector('.modal-content').addEventListener('click', (event) => {
        event.stopPropagation();
    });

    // Prevent form submission
    const form = document.getElementById('updateModal').querySelector('form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        form.submit(); // Now submit the form
        document.getElementById('updateModal').style.display = 'none'; // Close modal after handling the form data
        alert("Workshop updated successfully!"); // Show confirmation popup
    });
});