function initMap(){
    map = new google.maps.Map(document.getElementById('map'),{
        center: {lat: 1.3801001587360433, lng: 103.84918473018321},
        zoom: 12,
        mapId: '7eb9cb155077df0'
    });

    //1.3365408985337843, 103.96105621086166
    //Name
    //Lat, Long,
    //Img URL
    //scaledSize width, height
    workshops.forEach(workshops => {
        const marker = new google.maps.Marker({
            position: {lat: parseFloat(workshops.Workshop_Latitude), lng: parseFloat(workshops.Workshop_Longitude)},
            map,
            title: workshops.Workshop_Name,
            icon: {
                url: "images/map-marker.png",
                scaledSize: new google.maps.Size(38, 38)
            },
            animation: google.maps.Animation.DROP
        });
        
        const infowindow = new google.maps.InfoWindow({
            content: workshops.Workshop_Name,
        }); //adds content to infowindow
    
        marker.addListener("click", ()=>{
            infowindow.open(map,marker);
        }); //opens infowindow on click
    })
};

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
                        <form action="/workshops" method="post">
                            <label for="registerName">Full Name</label>
                            <input type="text" id="registerName" name="registerName" required>
                            <br>
                            <label for="registerEmail">Email</label>
                            <input type="email" id="registerEmail" name="registerEmail" required>
                            <br>
                            <label for="registerDate">Date</label>
                            <input type="date" id="registerDate" name="registerDate" required>
                            <input type="hidden" id="workshopID" name="workshopID">
                            <br>
                            <br>
                            <div>By registering, I agree to FinancialFlare's Terms of Service</div>
                            <button class="registerButton" type="submit" data-workshop-id="{{this.Workshop_ID}}">Register</button>
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
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const registerButton = document.querySelectorAll('.registerButton');
    
    registerButton.forEach(button => {
        button.addEventListener('click', (event) => {
            const workshopID = button.getAttribute('data-workshop-id');
        });
    });
    document.getElementById('workshopID').value = workshopID;
});
