const API_KEY = 'AIzaSyDY0zEGiZRJ6kmm79kgqTkxuGnkXgJ0zhg';
let map, directionsService, directionsRenderer, userLocation;

// Initialize the map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 1.3801001587360433, lng: 103.84918473018321 },
        zoom: 11,
        mapId: '7eb9cb155077df0'
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true
    });
    directionsRenderer.setMap(map);

    // Get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Add marker for user's current location
                new google.maps.Marker({
                    position: userLocation,
                    map,
                    title: 'Your Location',
                    icon: {
                        url: "images/user-location.png",
                        scaledSize: new google.maps.Size(34, 38)
                    },
                    animation: google.maps.Animation.DROP
                });

                // Center map on user's location
                map.setCenter(userLocation);

                // Display all workshops initially
                updateWorkshopsOnMap(workshops);
            },
            (error) => {
                console.error('Error getting user location:', error);
            }
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
}

// Update the workshops displayed on the map
function updateWorkshopsOnMap(workshopsToDisplay) {
    // Clear previous directions
    directionsRenderer.set('directions', null);
    document.getElementById('travel-time').innerHTML = ''; // Clear previous travel times

    workshopsToDisplay.forEach(workshop => {
        const address = workshop.Workshop_Address;
        const encodedAddress = encodeURIComponent(address);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${API_KEY}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'OK') {
                    const location = data.results[0].geometry.location;
                    const latitude = location.lat;
                    const longitude = location.lng;

                    const marker = new google.maps.Marker({
                        position: { lat: latitude, lng: longitude },
                        map,
                        title: workshop.Workshop_Name,
                        icon: {
                            url: "images/map-marker.png",
                            scaledSize: new google.maps.Size(38, 38)
                        },
                    });

                    const infowindow = new google.maps.InfoWindow({
                        content: workshop.Workshop_Name
                    });

                    marker.addListener("click", () => {
                        infowindow.open(map, marker);
                    });

                    // Request directions from user location to workshop
                    const request = {
                        origin: userLocation,
                        destination: { lat: latitude, lng: longitude },
                        travelMode: 'DRIVING'
                    };

                    directionsService.route(request, (result, status) => {
                        if (status === 'OK') {
                            directionsRenderer.setDirections(result);

                            // Get and display travel time
                            const travelTime = result.routes[0].legs[0].duration.text;
                            const travelTimeElement = document.createElement('p');
                            travelTimeElement.textContent = `Travel time to ${workshop.Workshop_Name}: ${travelTime} by car.`;
                            document.getElementById('travel-time').appendChild(travelTimeElement);
                        } else {
                            console.error('Directions request failed due to ' + status);
                        }
                    });
                } else {
                    console.error('Geocoding error:', data.status);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    });
}

// Filter workshops based on selected workshop name
function filterWorkshop() {
    const selectedWorkshopName = document.getElementById('workshopFilter').value;
    if (selectedWorkshopName) {
        const filteredWorkshops = workshops.filter(workshop => workshop.Workshop_Name === selectedWorkshopName);
        updateWorkshopsOnMap(filteredWorkshops);
    } else {
        updateWorkshopsOnMap(workshops);
    }
}

//modal js
document.addEventListener('DOMContentLoaded', (event) => {
    // Get the modal
    const modal = document.getElementById("workshopModal");

    // Get the <span> element that closes the modal
    const span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Function to open the modal with specific workshop details
    window.openWorkshopModal = function(workshop) {
        const modalContent = document.getElementById("modalWorkshopContent");
        modalContent.innerHTML = `
            <h2 style="text-align:center;padding-bottom:30px;">${workshop.Workshop_Name}</h2>
            <div class="row">
                <div class="col">
                    <div class="formContainer">
                        <h2>Registration</h2>
                        <form id="registrationForm" action="/workshops" method="post">
                            <label for="registerName">Full Name</label>
                            <input type="text" id="registerName" name="registerName" required>
                            <br>
                            <label for="registerEmail">Email</label>
                            <input type="email" id="registerEmail" name="registerEmail" required>
                            <br>
                            <label for="registerDate">Date</label>
                            <input type="date" min="${workshop.Workshop_StartDate}" max="${workshop.Workshop_EndDate}" id="registerDate" name="registerDate" required>
                            <input type="hidden" id="workshopID" name="workshopID" value="${workshop.Workshop_ID}">
                            <br>
                            <br>
                            <div>By registering, I agree to FinancialFlare's Terms of Service</div>
                            <button class="registerButton" type="submit">Register</button>
                        </form>
                    </div>
                </div>
                <div class="col">
                    <div class="infoContainer">
                        <h2>Details</h2>
                        <strong>Start Date:</strong> <p>${workshop.Workshop_StartDate}</p>
                        <strong>End Date:</strong> <p>${workshop.Workshop_EndDate}</p>
                        <strong>Time:</strong> <p>${workshop.Workshop_StartTime} to ${workshop.Workshop_EndTime}</p>
                        <strong>Address:</strong> <p>${workshop.Workshop_Address}</p>
                        <strong>Description:</strong> <p>${workshop.Workshop_Description}</p>
                    </div>
                </div>
            </div>
        `;
        modal.style.display = "block";

        // Add the event listener to the form after it's been added to the DOM
        const registrationForm = document.getElementById('registrationForm');
        
        registrationForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent the default form submission
            
            const confirmRegistration = confirm("Are you sure you want to register for this workshop?");
            
            if (confirmRegistration) {
                registrationForm.submit(); // Proceed with form submission if user confirms
            }
        });
    }
});
