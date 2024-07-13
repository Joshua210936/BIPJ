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
            <h2>${workshop.Workshop_Name}</h2>
            <p><strong>Start Date:</strong> ${workshop.Workshop_StartDate}</p>
            <p><strong>End Date:</strong> ${workshop.Workshop_EndDate}</p>
            <p><strong>Time:</strong> ${workshop.Workshop_StartTime} to ${workshop.Workshop_EndTime}</p>
            <p><strong>Address:</strong> ${workshop.Workshop_Address}</p>
            <p><strong>Description:</strong> ${workshop.Workshop_Description}</p>
            <img src="/images/${workshop.Workshop_Image}" alt="${workshop.Workshop_Image}" class="workshopTableImage"/>
        `;
        modal.style.display = "block";
    }
});
    