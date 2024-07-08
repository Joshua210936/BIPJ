function initMap(){
    map = new google.maps.Map(document.getElementById('map'),{
        center: {lat: 1.3801001587360433, lng: 103.84918473018321},
        zoom: 12,
        mapId: '7eb9cb155077df0'
    });

    //Name
    //Lat, Long,
    //Img URL
    //scaledSize width, height
    const markers=[
        [
            "NYP Financial Literacy Workshop",
            1.3801001587360433,
            103.84918473018321,
            "images/map-marker.png",
            38,
            38
        ],
        [
            "Singapore Fintech Festival",
            1.3336538111576972,
            103.95955845767105,
            "images/map-marker.png",
            38,
            38
        ]
    ];

    for (let i = 0; i<markers.length; i++){
        const currMarker = markers[i];

        const marker = new google.maps.Marker({
            position: {lat: currMarker[1], lng: currMarker[2]},
            map,
            title: currMarker[0],
            icon: {
                url: currMarker[3],
                scaledSize: new google.maps.Size(currMarker[4], currMarker[5])
            },
            animation: google.maps.Animation.DROP
        });
    
        const infowindow = new google.maps.InfoWindow({
            content: currMarker[0],
        }); //adds content to infowindow
    
        marker.addListener("click", ()=>{
            infowindow.open(map,marker);
        }); //opens infowindow on click
    }
    }

    