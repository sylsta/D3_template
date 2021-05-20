// Nous commençons par définir les dimensions de notre SVG
const width = 550, height = 550;

// Create a path object to manipulate geo data
const path = d3.geoPath();

// Define projection property
//La partie la plus délicate de ce tutoriel, la définition de la projection utilisée. Ici, nous choisissons une
// projection assez habituelle pour la cartographie (une liste des projections est disponible sur le site de D3JS).
// Nous centrons cette projection sur la France (latitude & longitude) et l'agrandissons pour finalement la centrer. 
const projection = d3.geoConicConformal() // Lambert-93
    .center([2.454071, 46.279229]) // Center on France
    .scale(2600)
    .translate([width / 2, height / 2]);

path.projection(projection); // Assign projection to path object

// Create the DIV that will contain our map

const svg = d3.select('#map').append("svg")
    .attr("id", "svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("preserveAspectRatio", "xMinYMid");

// Append the group that will contain our paths
const deps = svg.append("g");


// Le code suivant (et il n'y en a pas d'autres pour afficher la carte) charge le fichier geoJSON et pour chaque entrée
// de ce fichier ajoute un noeud path associé à un CSS particulier. Il est finalement rattaché au path que nous avions
// précédement déclaré.

d3.json('pop_departements_anamorphose.json').then(function(geojson) {
    // Bind the entry to a SVG path
    deps.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr('class', 'department')
        .attr("d", path)
        
        // Ce code ajoute simplement les méthodes mouseover et mouseout. Ces deux méthodes s'appliquent sur chaque path
        // que contient le SVG. Le mouseover déclenche une transition sur 200ms visant à faire apparaître le rectangle
        // décrivant le département puis définit le contenu html de ce rectangle (éditez le fichier geoJSON pour voir
        // les champs qui sont accessible). Ce rectangle est légèrement décalé pour ne pas gêner la souris. Le mouseout
        // fait disparaitre ce rectangle. Il est également vidé de son contenu et déplacé en dehors de la zone visible
        // afin de ne pas gêner la sélection d'un autre département (car même avec une opacité à 0 il reste au dessus
        // des départements).
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Département : " + d.properties.NOM_DEPT + "<br/>"
                +  "Région : " + d.properties.NOM_REGION + "<br/>"
                +  "Population : " + d.properties.population + "<br/>")
                .style("left", (d3.event.pageX + 30) + "px")
                .style("top", (d3.event.pageY - 30) + "px")
        })
        .on("mouseout", function(d) {
            div.style("opacity", 0);
            div.html("")
                .style("left", "-500px")
                .style("top", "-500px");
        });
});

// Append a DIV for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
