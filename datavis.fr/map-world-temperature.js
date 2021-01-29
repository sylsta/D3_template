// Notre page HTML contient un DIV dont l'ID est map. Comme pour les précédents tutoriels géographiques, on commence
// par définir notre projection. Celle-ci est de type orthographique, le scale définit le zoom réalisé et est dépendant
// de la taille que l'on veut associer à notre SVG. La fonction translate permet de centrer la projection (au lieu de
// l'avoir en haut à gauche). Le clipAngle est important car sans lui les pays de l'autre côté de la terre seraient
// visibles. La fonction rotate permet de définir sur quel endroit de la terre sera située la projection dans son
// état initial. Notez enfin que nous avons défini l'ID world sur notre SVG.

const width = 800, height = 800;

const projection = d3.geoOrthographic()
    .scale(350)
    .translate([width / 2, height / 2])
    .clipAngle(90) // without this options countries on the other side are visible
    .precision(.1)
    .rotate([0,0,0]);

const path = d3.geoPath()
    .projection(projection);

const svg = d3.select("#map").append("svg")
    .attr("id", "world")
    .attr("width", width)
    .attr("height", height);

// Append all meridians and parallels
// L'ajout des méridiens et des parallèles est grandement facilité par D3JS. En effet, la fonction d3.geo.graticule()
// nous retourne une liste de chaînes de caractères les représentants. Il nous suffit ensuite d'ajouter un path avec
// ces données pour les dessiner. Ces méridiens et parallèles seront situés sous les pays, si ce n'est pas ce que
// vous voulez il faut les ajouter après avec créé les pays.
const graticule = d3.geoGraticule();
svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

d3.json("d3js/map-world-temperature/world-countries.json").then(function(collection) {
    // Le chargement des pays n'a rien d'original par rapport aux précédents tutoriaux. N'oubliez pas de définir un
    // ID sur chaque pays. Il servira juste en dessous pour attribuer une couleur à ce pays.
    var countries = svg.selectAll("path")
        .data(collection.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("id", d => d.id);
    // // Pour afficher de graticule sur la couche des pays.
    // svg.append("path")
    //     .datum(graticule)
    //     .attr("class", "graticule")
    //     .attr("d", path);

    // La liste des températures moyenne par pays peut être récupérée dans le fichier world-temperature.csv.
    // Il vous faudra également le fichier CSS associé temperature.css. Celui-ci contient la définition d'un dégradé
    // du bleu vers le rouge en 60 nuances. Ce nombre est important car nous l'utilisons pour construire notre fonction
    // quantile qui permet d'associer une température à un nombre compris entre 0 et 60. De la même façon nous
    // construisons à la ligne 11 60 rectangles représentant ce dégradé. Pour plus de détails sur la création de
    // légendes vous pouvez vous référer au tutoriel Carte choroplèthe. Notez simplement qu'à la ligne 35 nous
    // utilisons les ID définit pour chacun de nos pays afin de leur associer une couleur en fonction de
    // leur température moyenne.
    d3.csv("d3js/map-world-temperature/world-temperature.csv").then(function(data) {
        // 60 is the number of class in temperature.css
        var quantile = d3.scaleQuantile().domain([
            d3.min(data, e => e.temperature),
            d3.max(data, e => +e.temperature)])
            .range(d3.range(60));

        var legend = svg.append('g')
            .attr('transform', 'translate(35, 10)')
            .attr('id', 'legend');

        legend.selectAll('.colorbar')
            .data(d3.range(60))
            .enter().append('rect')
            .attr('y', d => d * 5 + 'px')
            .attr('height', '5px')
            .attr('width', '20px')
            .attr('x', '0px')
            .attr("class", d => "temperature-" + d);

        legendScale = d3.scaleLinear()
            .domain([d3.min(data, e => +e.temperature), d3.max(data, e => +e.temperature)])
            .range([0, 60 * 5]);

        svg.append("g")
            .attr('transform', 'translate(25, 10)')
            .call(d3.axisLeft(legendScale).ticks(10));

        data.forEach(function(e,i) {
            d3.select("#" + e.country)
                .attr("class", d => "country temperature-" + quantile(+e.temperature));
        });
    });
});

// Nous commençons par définir les deux domaines de rotation que nous allons utiliser (phi : φ et lambda : λ).
// Le domaine de départ est notre globe (sur la largeur puis sur la hauteur). Les ranges correspondent au schéma
// ci-dessous. Vous pouvez voir à quoi correspond la rotation de ces axes sur le site suivant : Voir la rotation
// des axes. Notez que nos fichiers HTML et Javascript sont encodés en UTF8, sans quoi nous ne pourrions pas utiliser
// directement ces symboles en tant que caractères valides.
const λ = d3.scaleLinear()
    .domain([0, width])
    .range([-180, 180]);

const φ = d3.scaleLinear()
    .domain([0, height])
    .range([90, -90]);


// Le mécanisme de "drag" se définit en deux temps, d'abord nous récupérons la position d'origine ou l'utilisateur
// clique pour débuter son action, ensuite nous définissons une fonction qui réalisera la rotation tant que
// l'utilisateur n'a pas relâché le bouton de la souris ou son doigt sur un écran tactile. Les méridiens et parallèles
// sont redessinés en premier, puis on redessine les pays. Enfin, on associe la fonction de "drag" à notre SVG.
var drag = d3.drag().subject(function() {
    var r = projection.rotate();
    return {
        x: λ.invert(r[0]),
        y: φ.invert(r[1])
    };

}).on("drag", function() {
    projection.rotate([λ(d3.event.x), φ(d3.event.y)]);

    svg.selectAll(".graticule")
        .datum(graticule)
        .attr("d", path);

    svg.selectAll(".country")
        .attr("d", path);
});

svg.call(drag);
