// Il n'y a rien de vraiment nouveau dans le code javascript par rapport aux précédents tutoriels (principalement Carte
// choroplète et Lignes avancées (Linear Chart)). Néanmoins nous allons étudier quelques points intéressant à commencer
// par la légende. Le code de départ est assez simple, on définit quelques constantes et on crée le SVG.
const width = document.getElementById("container").offsetWidth * 0.95,
    height = 500,
    legendCellSize = 20,
    colors = ['#d4eac7', '#c6e3b5', '#b7dda2', '#a9d68f', '#9bcf7d', '#8cc86a', '#7ec157', '#77be4e', '#70ba45', '#65a83e', '#599537', '#4e8230', '#437029', '#385d22', '#2d4a1c', '#223815'];

// La largeur de notre SVG est déterminée dynamiquement à partir d'un DIV contenant tout le tutoriel, le reste est fixe.
// On retrouve d'ailleurs notre tableau contenant la palette de couleurs dont nous parlons dans la section précédente.
// Le SVG est ajouté au DIV map déjà présent dans la page.
const svg = d3.select('#map').append("svg")
    .attr("id", "svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "svg");

// Projection
const projection = d3.geoNaturalEarth1()
    .scale(1)
    .translate([0, 0]);

const path = d3.geoPath()
    .pointRadius(2)
    .projection(projection);


// Construction du titre et du sous-titre
// Même chose ici, on s'assure de choisir une police élégante et des couleurs en accord avec notre thème. C'est la
// valeur de x associée à l'utilisation du text-anchor qui permet de centrer ces titres dans la visualisation.
// Rappelons par ailleurs qu'il est important de fournir la source des données que l'on représente lorsqu'on les a
// récupérés d'une étude ou d'un site.


svg.append("text")
    .attr("x", (width / 2))
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("fill", "#c1d3b8")
    .style("font-weight", "300")
    .style("font-size", "16px")
    .text("Sentiment de sécurité des habitants de chaque pays en 2018");

svg.append("text")
    .attr("x", (width / 2))
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .style("fill", "#929292")
    .style("font-weight", "200")
    .style("font-size", "12px")
    .text("(source : Gallup Report 2018 - Global Law and Order)");

// // Comme toujours lorsqu'on s'apprête à ajouter plusieurs éléments à notre SVG qui sont liés entre eux il est
// // préférable de créer un groupe les contenant tous (cela permet par exemple de les déplacer facilement).
// // Dans le code source tout ce qui suit se trouve dans la fonction addLegend. Dès le départ nous positionnons
// // (translate) notre groupe légèrement vers le bas et légèrement vers la droite par rapport au point de départ
// // en haut à gauche.

// var legend = svg.append('g')
//     .attr('transform', 'translate(40, 50)');

const cGroup = svg.append("g");

// Pour charger nos données nous utilisons la méthode des promesses introduite dans la V5 de D3JS. La construction de
// la carte est assez habituelle. Nous utilisons une nouvelle projection et son dimensionnement est calculé en fonction
// de la largeur et de la hauteur que nous avons définie (le .80 permet d'étaler la carte sur 80% de notre SVG).
// Nous associons à chaque pays un id qui correspond au code ISO de ce pays.
var promises = [];
promises.push(d3.json("d3js/map-improve/world-countries-no-antartica.json"));
promises.push(d3.csv("d3js/map-improve/data.csv"));

Promise.all(promises).then(function(values) {
    const geojson = values[0];
    const scores = values[1];

    var b  = path.bounds(geojson),
        s = .80 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    projection
        .scale(s)
        .translate(t);

    cGroup.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", d => "code" + d.id)
        .attr("class", "country");

    const min = d3.min(scores, d =>  +d.score),
        max = d3.max(scores, d =>  +d.score);
    var quantile = d3.scaleQuantile().domain([min, max])
        .range(colors);

    var legend = addLegend(min, max);
    var tooltip = addTooltip();
    // Notre fichier CSV que vous pouvez télécharger ici contient 4 colonnes : country, code, frenchCountry et score.
    // La colonne country n'est pas utilisée. La colonne code permet de faire le lien avec le fichier geoJSON,
    // la colonne frenchCountry est affichée dans le tooltip et le score permet de colorier chaque pays.
    // Le code se décompose ainsi :
    //    1. Calcul du min et du max de la colonne score
    //    2. Construction de notre scale qui vise à projeter l'ensemble continu des scores entre le min et le max vers un ensemble discontinu correspondant à nos couleurs. Cela implique que plusieurs valeurs peuvent avoir la même couleur.
    //    3. Construction de la légende à partir du min et du max
    //    4. Construction du tooltip. Notez qu'il aurait pu être réalisé en dehors du chargement des fichiers
    //    5. Pour chaque entrée de notre fichier CSV nous réalisons les opérations suivantes :
    //          Récupération du polygone associé au pays à partir de son code ISO
    //          Ajout d'un attribut scorecolor qui sera utilisé dans la partie suivante pour sélectionner tous les pays d'une même couleur
    //          Définition de l'attribut fill en fonction du quantile associé au score de ce pays
    //          Ajout de l'évènement mouseover qui passe en violet le pays, affiche le tooltip, le renseigne avec son nom et son score et enfin on positionne le curseur au niveau de la légende.
    //          Ajout de l'évènement mouseout qui remet la bonne couleur au pays, masque le tooltip et masque le curseur
    //          Ajout de l'évènement mousemove qui déplace le tooltip en fonction de la position de la souris, l'objectif est d'éviter que la souris se retrouve sur le tooltip, d'ou le léger décalage réalisé par la fonction translate.

    scores.forEach(function(e,i) {
        var countryPath = d3.select("#code" + e.code);
        countryPath
            .attr("scorecolor", quantile(+e.score))
            .style("fill", quantile(+e.score))
            .on("mouseover", function(d) {
                countryPath.style("fill", "#9966cc");
                tooltip.style("display", null);
                tooltip.select('#tooltip-country')
                    .text(shortCountryName(e.frenchCountry));
                tooltip.select('#tooltip-score')
                    .text(e.score);
                legend.select("#cursor")
                    .attr('transform', 'translate(' + (legendCellSize + 5) + ', ' + (getColorIndex(quantile(+e.score)) * legendCellSize) + ')')
                    .style("display", null);
            })
            .on("mouseout", function(d) {
                countryPath.style("fill", quantile(+e.score));
                tooltip.style("display", "none");
                legend.select("#cursor").style("display", "none");
            })
            .on("mousemove", function(d) {
                var mouse = d3.mouse(this);
                tooltip.attr("transform", "translate(" + mouse[0] + "," + (mouse[1] - 75) + ")");
            });
    });
});

function addLegend(min, max) {
    var legend = svg.append('g')
        .attr('transform', 'translate(40, 50)');

    // Les 8 premières lignes du code ci-dessous sont identiques à celle du paragraphe : Construction de la légende.
    // On se contente d'ajouter les deux évènements mouseover et mouseout. Le premier évènement positionne correctement
    // le curseur, à la bonne hauteur et légèrement sur la droite. Ensuite nous sélectionnons tous les pays qui
    // possèdent la même couleur que le carré sur lequel se trouve la souris (grâce à l'attribut scorecolor définit
    // juste au-dessus) et nous changeons leur couleur en violet. Le deuxième évènement permet de remettre la bonne
    // couleur sur ces pays et de masquer le curseur.
    legend.selectAll()
        .data(d3.range(colors.length))
        .enter().append('svg:rect')
        .attr('height', legendCellSize + 'px')
        .attr('width', legendCellSize + 'px')
        .attr('x', 5)
        .attr('y', d => d * legendCellSize)
        .attr('class', 'legend-cell')
        .style("fill", d => colors[d])
        .on("mouseover", function(d) {
            legend.select("#cursor")
                .attr('transform', 'translate(' + (legendCellSize + 5) + ', ' + (d * legendCellSize) + ')')
                .style("display", null);
            d3.selectAll("path[scorecolor='" + colors[d] + "']")
                .style('fill', "#9966cc");
        })
        .on("mouseout", function(d) {
            legend.select("#cursor")
                .style("display", "none");
            d3.selectAll("path[scorecolor='" + colors[d] + "']")
                .style('fill', colors[d]);
        });

    legend.append('svg:rect')
        .attr('y', legendCellSize + colors.length * legendCellSize)
        .attr('height', legendCellSize + 'px')
        .attr('width', legendCellSize + 'px')
        .attr('x', 5)
        .style("fill", "#999");
    // Données manquantes
    legend.append("text")
        .attr("x", 30)
        .attr("y", 35 + colors.length * legendCellSize)
        .style("font-size", "13px")
        .style("color", "#929292")
        .style("fill", "#929292")
        .text("données manquantes");

    legend.append("polyline")
        .attr("points", legendCellSize + ",0 " + legendCellSize + "," + legendCellSize + " " + (legendCellSize * 0.2) + "," + (legendCellSize / 2))
        .attr("id", "cursor")
        .style("display", "none")
        .style('fill', "#9966cc");
    // Nous ne détaillons pas la construction de l'élément de légende pour les données absentes, il est assez simple à
    // réaliser. Passons directement à l'axe de valeur situé à gauche de la palette.
    // Nous avons choisi de borner notre axe par le min et le max des scores de nos données. Depuis la version 4 de
    // D3JS le code est vraiment court.
    // Ce code construit une échelle linéaire entre notre domaine (de min à max) vers le range entre 0 et 340. Ce range
    // correspond à la hauteur de toute la palette de couleurs. Ensuite on ajoute un groupe à notre légende contenant
    // l'axe correspondant, on choisit simplement de le positionner à gauche. Nous n'avons pas déplacé cet élément
    // (translate), il se retrouve du coup juste au niveau de notre point rouge.
    var legendScale = d3.scaleLinear().domain([min, max])
        .range([0, colors.length * legendCellSize]);

    legendAxis = legend.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(legendScale));

    return legend;
}
// Par rapport au tutoriel sur les lignes avancées il n'y a rien de nouveau concernant le tooltip. Il est construit de
// manière statique (ses dimensions sont fixes). Nous avons simplement veillé à lui associer des couleurs en accord
// avec le thème. Comme indiqué dans les commentaires nous ajoutons un id pour les éléments dynamiques (pays et score).
// Tous les éléments du tooltip sont placés dans un groupe qui est par défaut masqué (display défini à none).
function addTooltip() {
    var tooltip = svg.append("g") // Group for the whole tooltip
        .attr("id", "tooltip")
        .style("display", "none");

    tooltip.append("polyline") // The rectangle containing the text, it is 210px width and 60 height
        .attr("points","0,0 210,0 210,60 0,60 0,0")
        .style("fill", "#222b1d")
        .style("stroke","black")
        .style("opacity","0.9")
        .style("stroke-width","1")
        .style("padding", "1em");

    tooltip.append("line") // A line inserted between country name and score
        .attr("x1", 40)
        .attr("y1", 25)
        .attr("x2", 160)
        .attr("y2", 25)
        .style("stroke","#929292")
        .style("stroke-width","0.5")
        .attr("transform", "translate(0, 5)");

    var text = tooltip.append("text") // Text that will contain all tspan (used for multilines)
        .style("font-size", "13px")
        .style("fill", "#c1d3b8")
        .attr("transform", "translate(0, 20)");

    text.append("tspan") // Country name udpated by its id
        .attr("x", 105) // ie, tooltip width / 2
        .attr("y", 0)
        .attr("id", "tooltip-country")
        .attr("text-anchor", "middle")
        .style("font-weight", "600")
        .style("font-size", "16px");

    text.append("tspan") // Fixed text
        .attr("x", 105) // ie, tooltip width / 2
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("fill", "929292")
        .text("Score : ");

    text.append("tspan") // Score udpated by its id
        .attr("id", "tooltip-score")
        .style("fill","#c1d3b8")
        .style("font-weight", "bold");

    return tooltip;
}

// Avant de charger notre fichier de données, il nous faut déclarer deux fonctions utilitaires. La première permet de
// réduire la longueur du nom de certains pays et la deuxième permet de retrouver l'index d'une couleur dans notre
// tableau colors.
function shortCountryName(country) {
    return country.replace("Démocratique", "Dem.").replace("République", "Rep.");
}

function getColorIndex(color) {
    for (var i = 0; i < colors.length; i++) {
        if (colors[i] === color) {
            return i;
        }
    }
    return -1;
}

addSvgLegend1();
function addSvgLegend1() {
    const width = 200,
        height = 400;

    const svgLegend1 = d3.select('#svgLegend1').append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "svg");

    svgLegend1.append("circle")
        .attr("cx", 40)
        .attr("cy", 50)
        .attr("r", 3)
        .style("fill", "red");
}

addSvgLegend2();
function addSvgLegend2() {
    const width = 200,
        height = 400;

    const svgLegend2 = d3.select('#svgLegend2').append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "svg");

    svgLegend2.append("circle")
        .attr("cx", 40)
        .attr("cy", 50)
        .attr("r", 3)
        .style("fill", "red");

    var legend = svgLegend2.append('g')
        .attr('transform', 'translate(40, 50)');

    // Premier élément de notre légende : la palette de couleurs. Elle prend comme données les indexes de notre tableau
    // de couleurs. Chaque élément fait 20px de large et de haut (legendCellSize). On décale de 5px cette palette
    // par rapport au point de départ (le point rouge) et la position verticale (y) est augmentée pour chaque entrée
    // du tableau de couleurs. Après l'appel à la fonction enter() le code est exécuté autant de fois qu'il y a
    // d'éléments dans le tableau. Le d dont il est question correspond à l'index de parcours du tableau.
    // Ainsi pour définir la couleur d'une cellule il suffit de récupérer colors[d].
    // Si vous voulez construire une légende horizontale c'est x qui va varier en fonction de l'index de votre
    // tableau de données et y qui sera fixe.
    // Gestion de la souris sur la légende
    legend.selectAll()
        .data(d3.range(colors.length))
        .enter().append('svg:rect')
        .attr('y', d => d * legendCellSize)
        .attr('height', legendCellSize + 'px')
        .attr('width', legendCellSize + 'px')
        .attr('x', 5)
        .style("fill", d => colors[d]);
}

addSvgLegend3();
function addSvgLegend3() {
    const width = 200,
        height = 400;

    const svgLegend3 = d3.select('#svgLegend3').append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "svg");

    svgLegend3.append("circle")
        .attr("cx", 40)
        .attr("cy", 50)
        .attr("r", 3)
        .style("fill", "red");

    var legend = svgLegend3.append('g')
        .attr('transform', 'translate(40, 50)');

    legend.selectAll()
        .data(d3.range(colors.length))
        .enter().append('svg:rect')
        .attr('y', d => d * legendCellSize)
        .attr('height', legendCellSize + 'px')
        .attr('width', legendCellSize + 'px')
        .attr('x', 5)
        .style("fill", d => colors[d]);

    var legendScale = d3.scaleLinear().domain([44, 97])
        .range([0, colors.length * legendCellSize]);

    legendAxis = legend.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(legendScale));
}
