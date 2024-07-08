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
    