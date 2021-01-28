// Le code est similaire à celui des précédent p

const width = document.getElementById("container").offsetWidth * 0.95,
    height = 600;

// Define projection property
const projection = d3.geoMercator()
    .scale(130)
    .translate([width / 2, height / 1.6]);

// And a path linked to it
const path = d3.geoPath()
    .pointRadius(2)
    .projection(projection);

// Create the DIV that will contain our map
const svg = d3.select('#map').append("svg")
    .attr("id", "svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "YlOrRd");

const cGroup = svg.append("g");

// Load GeoJSON data and run a function for each entry

d3.json('d3js/map-nobelprice/world-countries-no-antartica.json').then(function(geojson) {
    cGroup.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", d => "d" + d.properties.name.replace(/\s+/g, ''))
        .attr("class", "country");

    d3.csv("d3js/map-nobelprice/nobels.csv").then(function(csv) {
        // Pour éviter d'avoir les Etats-Unis en rouge foncé et tous les autres pays en jaune très clair,
        // nous utilisons une échelle non linéaire basée sur la fonction racine carré. Ainsi nous projetons
        // notre échelle non pas sur 0-350 mais sur 0-19 ce qui permet des différences de couleurs plus visibles.
        var quantize = d3.scaleQuantile()
            .domain([0, Math.sqrt(d3.max(csv, e => +e.NobelCount))])
            .range(d3.range(9));

        legend = svg.append('g')
            .attr('transform', 'translate(25, 150)')
            .attr('id', 'legend');

        legend.selectAll('.colorbar')
            .data(d3.range(9))
            .enter().append('svg:rect')
            .attr('y', d => d * 20 + 'px')
            .attr('height', '20px')
            .attr('width', '20px')
            .attr('x', '0px')
            .attr("class", d => "q" + d + "-9");
        // Nous redéfinissons également le scale de la légende en précisant qu'il n'est plus linéaire
        // mais de type racine carré.
        var legendScale = d3.scaleSqrt()
            .domain([0, d3.max(csv, e => +e.NobelCount)])
            .range([0, 9 * 20]);

        var legendAxis = svg.append("g")
            .attr('transform', 'translate(50, 150)')
            .call(d3.axisRight(legendScale).ticks(6));

        csv.forEach(function(e,i) {
            if (d3.select("#d" + e.Country.replace(/\s+/g, '')).empty()) {
                console.log(e.Country);
            }
            d3.select("#d" + e.Country.replace(/\s+/g, ''))
                .attr("class", d => "country q" + quantize(Math.sqrt(+e.NobelCount)) + "-9")
                .on("mouseover", function(d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html("<b>Pays : </b>" + e.Country + "<br>"
                        + "<b>Prix : </b>" + e.NobelCount + "<br>")
                        .style("left", (d3.event.pageX + 30) + "px")
                        .style("top", (d3.event.pageY - 30) + "px");
                })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                    div.html("")
                        .style("left", "0px")
                        .style("top", "0px");
                });
        });
    });
});

// Refresh colors on combo selection
d3.select("select").on("change", function() {
    d3.selectAll("svg").attr("class", this.value);
});

// Append a DIV for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// utlisé dans l'exemple source pour créer deux autres cartes avec des échelles différentes.
// const svg2 = d3.select('#map2').append("svg")
//     .attr("id", "svg")
//     .attr("width", width)
//     .attr("height", height)
//     .attr("class", "YlOrRd");
//
// const cGroup2 = svg2.append("g");
//
// d3.json('d3js/map-nobelprice/world-countries-no-antartica.json').then(function(geojson) {
//     cGroup2.selectAll("path")
//         .data(geojson.features)
//         .enter()
//         .append("path")
//         .attr("d", path)
//         .attr("id", function(d) {return "d2" + d.properties.name.replace(/\s+/g, ''); })
//         .attr("class", "country");
//
//     d3.csv("d3js/map-nobelprice/nobels.csv").then(function(csv) {
//         var quantize = d3.scaleQuantile()
//             .domain([0, d3.max(csv, function(e) { return +e.NobelCount; })])
//             .range(d3.range(9));
//
//         csv.forEach(function(e,i) {
//             if (d3.select("#d2" + e.Country.replace(/\s+/g, '')).empty()) {
//                 console.log(e.Country);
//             }
//             d3.select("#d2" + e.Country.replace(/\s+/g, ''))
//                 .attr("class", function(d) { return "country q" + quantize(+e.NobelCount) + "-9"; });
//         });
//     });
// });
//
// const svg3 = d3.select('#map3').append("svg")
//     .attr("id", "svg")
//     .attr("width", width)
//     .attr("height", height)
//     .attr("class", "YlOrRd");
//
// const cGroup3 = svg3.append("g");
//
// d3.json('d3js/map-nobelprice/world-countries-no-antartica.json').then(function(geojson) {
//     cGroup3.selectAll("path")
//         .data(geojson.features)
//         .enter()
//         .append("path")
//         .attr("d", path)
//         .attr("id", function(d) {return "d3" + d.properties.name.replace(/\s+/g, ''); })
//         .attr("class", "country");
//
//     d3.csv("d3js/map-nobelprice/nobels.csv").then(function(csv) {
//         var quantize = d3.scaleQuantile()
//             .domain([0, Math.log(d3.max(csv, function(e) { return +e.NobelCount; }))])
//             .range(d3.range(9));
//
//         csv.forEach(function(e,i) {
//             if (d3.select("#d3" + e.Country.replace(/\s+/g, '')).empty()) {
//                 console.log(e.Country);
//             }
//             d3.select("#d3" + e.Country.replace(/\s+/g, ''))
//                 .attr("class", function(d) { return "country q" + quantize(Math.log(+e.NobelCount)) + "-9"; });
//         });
//     });
// });
