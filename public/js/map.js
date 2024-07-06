mapboxgl.accessToken = mapToken;
console.log(mapToken);
const map = new mapboxgl.Map({
  container: "map", // container ID
  //   Choose from Mapbox's core styles, or make your own style with Mapbox studio
  style: "mapbox://styles/mapbox/streets-v12", //style url
  center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
  // center: [79.0193, 18.1124], // starting position [lng, lat]. Note that lat must be set between -90 and 90
  zoom: 8, // starting zoom
});

// create a HTML element for each feature
const el = document.createElement("div");
el.className = "marker";
// ☝️to run this two line for adding custom marker on map -> pass el in marker1 eg: const marker1 = new mapboxgl.Marker(el, {-----

// Create a default Marker and add it to the map.
const marker1 = new mapboxgl.Marker({
  color: "red",
  // draggable: true,
})
  .setLngLat(listing.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25, className: "my-class" }).setHTML(
      `<h4>${listing.location}</h4><p>Exact Location provided after Booking</p>`
    )
    // .setMaxWidth("300px")
  )
  .addTo(map);
