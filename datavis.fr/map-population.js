// Le code est strictement identique à celui de l'exemple précédent pour la création de la carte (il faut juste ajouter
// l'attribut class avec pour valeur Blues sur le SVG pour initier les couleurs et passer la width de 550 à 700 pour
// afficher la légende de l'échelle).

const width = 700, height = 550;

// Create a path object to manipulate geo data
const path = d3.geoPath();

// Define projection property
const projection = d3.geoConicConformal() // Lambert-93
    .center([2.454071, 46.279229]) // Center on France
    .scale(2600)
    .translate([width / 2 - 50, height / 2]);

path.projection(projection); // Assign projection to path object

// Create the DIV that will contain our map
const svg = d3.select('#map').append("svg")
    .attr("id", "svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "Blues");

// Append the group that will contain our paths
const deps = svg.append("g");

// Pour charger nos données (le JSON et le CSV) nous utilisons les promesses qui ont été introduites avec D3JS v5.
// Les promesses permettent de gérer facilement des requêtes asynchrones. Ici elles nous permettent de synchroniser le
// chargement de nos deux fichiers. Le fichier CSV est parsé comme on avait précédement parsé du JSON mais ici
// on utilise la méthode d3.csv() (notez que le séparateur utilisé doit être la virgule). La création des path ne
// varie quasiment pas, on ajoute seulement un id à chaque path, ce qui nous permettra de le retrouver ultérieurement.
// Notez que l'id doit commencer par une lettre. Il est ici composé d'un 'd' concaténé avec le code du département que
// l'on trouve dans notre fichier geoJSON.
var promises = [];
promises.push(d3.json('d3js/map-population/departments.json'));
promises.push(d3.csv("d3js/map-population/population.csv"));

Promise.all(promises).then(function(values) {
    const geojson = values[0];
    const csv = values[1];

    var features = deps
        .selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr('id', d => "d" + d.properties.CODE_DEPT)
        .attr("d", path);

    // Quantile scales map an input domain to a discrete range, 0...max(population) to 1...9
    // Nous commençons par définir la fonction qui nous permettra d'obtenir la couleur de notre département. Pour cela,
    // nous utilisons une projection discontinue d3.scaleQuantile() entre 0 et le max de notre population vers le range
    // de 1 à 9. Cela implique que nous aurons 9 variations de couleurs pour représenter la population de chaque
    // département.
    var quantile = d3.scaleQuantile()
        .domain([0, d3.max(csv, e => +e.POP)])
        .range(d3.range(9));

    // Comme nous l'avons vu dans le premier tutoriel, nous ajoutons ensuite un groupe qui contientra nos rectangle de
    // différentes couleurs. Ce groupe est décalé via la méthode translate pour être positionné correctement.
    var legend = svg.append('g')
        .attr('transform', 'translate(525, 150)')
        .attr('id', 'legend');

    // Nous ajoutons ensuite 9 rectangles aux dimensions de 20px par 20px et nous décalons chaque rectangle de 20px
    // sur l'axe vertical. La coloration se fait simplement avec la ligne qui ajoute l'attribut class à chaque
    // rectangle. Nous reviendrons sur sa définition à la fin du chapitre, l'attribut CSS aura pour valeur q1-9, q2-9...
    legend.selectAll('.colorbar')
        .data(d3.range(9))
        .enter().append('svg:rect')
        .attr('y', d => d * 20 + 'px')
        .attr('height', '20px')
        .attr('width', '20px')
        .attr('x', '0px')
        .attr("class", d => "q" + d + "-9");

    // Ici, nous attaquons une partie qui nous sera fort utile dans les chapitres suivant : la construction d'un axe
    // gradué. Cela se fait en deux étapes : la définition du domaine et la définition de l'axe. Le domaine utilisé
    // (scale) représente encore une projection d'un nombre compris entre 0 et le max de notre population.
    // Le range de destination en revanche tient compte de la hauteur de nos rectangle (20px) et de leur nombre (9)
    // pour que l'échelle soit de la même taille que l'ensemble de nos rectangles.
    var legendScale = d3.scaleLinear()
        .domain([0, d3.max(csv, e => +e.POP)])
        .range([0, 9 * 20]);

    // Nous définissons ensuite l'axe qui utilise le domaine précédement définit. L'axe est orienté sur la droite
    // (et du coup automatiquement vertical, les autres valeurs possible sont axisLeft toujours vertical et
    // axisBottom ou axisTop pour un axe horizontal). ticks indique le nombre de tiret que nous souhaitons
    // (D3JS fait au mieux). L'ensemble est décalé pour se placer correctement à droite des rectangles.
    var legendAxis = svg.append("g")
        .attr('transform', 'translate(550, 150)')
        .call(d3.axisRight(legendScale).ticks(6));

    // Pour chaque entrée de notre CSV, nous faisons comme pour la succession de rectangle et ajoutons l'attribut
    // class pour définir notre couleur. Celle-ci utilise la fonction quantile que nous avons précédemment définie.
    // Le code gérant l'affichage du tooltip n'a pas beaucoup varié, par contre le CSS a été un peu amélioré
    // pour plus de lisibilité.
    csv.forEach(function(e,i) {
        d3.select("#d" + e.CODE_DEPT)
            .attr("class", d => "department q" + quantile(+e.POP) + "-9")
            .on("mouseover", function(d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("<b>Région : </b>" + e.NOM_REGION + "<br>"
                    + "<b>Département : </b>" + e.NOM_DEPT + "<br>"
                    + "<b>Population : </b>" + e.POP + "<br>")
                    .style("left", (d3.event.pageX + 30) + "px")
                    .style("top", (d3.event.pageY - 30) + "px");
            })
            .on("mouseout", function(d) {
                div.style("opacity", 0);
                div.html("")
                    .style("left", "-500px")
                    .style("top", "-500px");
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

// Mise à jour des données
// Si votre fichier CSV possède plusieurs données, vous pouvez vouloir mettre à jour automatiquement la carte en
// choisissant la colonne à afficher. En supposant que vous disposez d'une liste de choix comme pour les couleurs
// dans notre exemple, le code nécessaire est assez court.
/*
d3.select("#data").on("change", function() {
    selectedData = this.value;

    quantile = d3.scale.scaleQuantile
        .domain([0, d3.max(csv, e => +e[selectedData])])
        .range(d3.range(9));

    legendScale.domain([0, d3.max(csv, e => +e[selectedData])]);
    legendAxis.call(d3.axisRight(legendScale).ticks(6));

    csv.forEach(function(e,i) {
        d3.select("#d" + e.CODE_DEPT)
            .attr("class", d => "department q" + quantile(+e[selectedData]) + "-9");
    });
});
*/
//La variable selectedData est déclarée juste avant la lecture du CSV et initialisé à 'POP', c'est-à-dire la colonne
// population de notre fichier CSV. La 1ère ligne de ce code récupère la valeur sélectionnée par l'utilisateur, elle
// correspond à la colonne qu'il a choisi. Ensuite nous mettons à jour notre projection pour tenir compte du nouvel
// intervalle de données. Le domaine de la légende est lui aussi recalculé et un simple appel à la fonction call
// permet de rafraichir les libellés. Enfin pour chaque entrée du CSV on met à jour nos départements. Ce code doit être
// inclu dans la fonction qui charge le CSV.


// Autres fichiers geoJSON pour la France
//Suite à la remarque d'une internaute, nous rajoutons un lien vers le github suivant :
// https://github.com/gregoiredavid/france-geojson
// Il permet de récupérer au format geoJSON les communes, départements et régions au niveau de la France entière ainsi
// que les communes et départements spécifiques à chaque région ou département.
