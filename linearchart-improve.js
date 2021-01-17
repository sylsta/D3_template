
const margin = {top: 50, right: 60, bottom: 30, left: 60},
    width = document.getElementById("container").offsetWidth * 0.95 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

const parseTime = d3.timeParse("%d/%m/%Y");
const dateFormat = d3.timeFormat("%d/%m/%Y");

const x = d3.scaleTime()
    .range([0, width]);

const y = d3.scaleLinear()
    .range([height, 0]);

const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.close));

const area = d3.area()
    .x(d => x(d.date))
    .y0(height)
    .y1(d => y(d.close));

const svg = d3.select("#chart").append("svg")
    .attr("id", "svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Graphic title
// L'ajout d'un titre est plutôt simple à réaliser, on lui demande juste d'être centré. Pour cela il faut le
// positionner au milieu de l'axe X et presque en haut du graphique (25px plus bas en ce qui nous concerne).
// Par ailleurs, il faut bien définir l'attribut text-anchor à middle.
svg.append("text")
    .attr("x", (width / 2))
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .style("fill", "#5a5a5a")
    .style("font-family", "Raleway")
    .style("font-weight", "300")
    .style("font-size", "24px")
    .text("Cours journalier de l'or depuis 2001");

// Création des axes et de la ligne
// Ce code est identique au précédent tutoriel, après avoir chargé le fichier de données, on le parcourt pour lire
// la date et la formatter, on n'oublie pas de passer en numérique la colonne du cours, on trie les données,
// on met à jour les domaines puis on ajoute les axes au graphique. Enfin on ajoute les lignes horizontales
// et la ligne correspondant au cours de l'or.
d3.tsv("linearchart-improve.data.tsv", function(error, data) {
    data.forEach(d => {
        d.date = parseTime(d.date);
        d.close = +d.close;
    });

    data.sort((a, b) => a.date - b.date);

    x.domain(d3.extent(data, d => d.date));
    y.domain(d3.extent(data, d => d.close));

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .style("text-anchor", "end")
        .text("$");

    svg.selectAll("y axis").data(y.ticks(10)).enter()
        .append("line")
        .attr("class", "horizontalGrid")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d));

    var linePath = svg.append("path")
        .datum(data)
        .style("fill", "none")
        .style("stroke", "#3498db")
        .style("stroke-width", "1px")
        .style("opacity", "0.6")
        .attr("d", line);

    // The linear gradient is directly referred in the area CSS
    // Création du dégradé sous la courbe (Area Chart)
    // Nous abordons une partie subtile de ce tutoriel et à notre connaissance il n'existe pas d'autre façon de
    // procéder pour obtenir un dégradé. Nous définissons un gradient linéaire au niveau de notre SVG et lui
    // attribuons l'ID areachart-gradient, ce gradient sera ensuite utilisé par notre Area Chart. Celui-ci
    // s'applique uniquement à la verticale (c'est pour cette raison que x1 et x2 sont définis à 0) entre
    // la plus faible et la plus haute valeur du cours de l'or (d.close).
    // La couleur du dégradé varie entre #F7FBFE (bleu très clair) à 0% et #3498DB (bleu plus foncé) à 100%.
    // Il est bien sûr possible d'ajouter des valeurs intermédiaire entre 0% et 100%.
    svg.append("linearGradient")
        .attr("id", "areachart-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", y(d3.min(data, d => d.close)))
        .attr("y2", y(d3.max(data, d => d.close)))
        .selectAll("stop")
        .data([
            {offset: "0%", color: "#F7FBFE"},
            {offset: "100%", color: "#3498DB"}
        ])
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    // Il ne nous reste plus qu'à dessiner notre Area Chart en faisant référence pour le remplissage à notre gradient.
    // L'opacité est diminuée pour permettre la visualisation des lignes horizontales.
    var areaPath = svg.append("path")
        .datum(data)
        .style("fill", "url(#areachart-gradient)")
        .style("opacity", "0.6")
        .attr("d", area);
    // Gestion des évènements de la souris
    // Add the two circle and the tooltip box
    // Dans cette partie la solution pour gérer les évènements de la souris et positionner notre tooltip est
    // entièrement différente du précédent tutoriel, elle est à la fois plus concise et plus élégante.
    // Dans un premier temps on ajoute notre tooltip à notre SVG via la fonction définit précédemment.
    var tooltip = addTooltip();

    // Used to retrieve the closer date for a cursor position
    // Nous définissons ensuite la fonction bisector pour retrouver la date la plus proche de la position de la souris
    // (celle sur la gauche en l'occurrence, nous aurions aussi pu choisir right).

    var bisectDate = d3.bisector(d => d.date).left;


    // append the rectangle to capture mouse
    // Plutôt de calculer de manière plus ou moins compliquée si la souris est en dehors de notre linechart, nous
    // construisons un rectangle qui fait exactement ses dimensions. Il suffit ainsi d'ajouter les fonctions mouseover
    // et mouseout pour savoir si l'on doit afficher le tooltip ou non. La dernière fonction gère le positionnement
    // du tooltip et la définition de son contenu.

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() {
            tooltip.style("display", null);
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
        })
        .on("mousemove", mousemove);
    // La fonction mousemove commence par récupérer la position X de la souris puis récupère l'index dans nos données
    // correspondant à cette position grâce à la fonction bisectDate définit précédemment. La donnée complète est donc
    // récupérée avec data[i]. Il ne nous reste plus qu'à déplacer notre tooltip au point de la courbe correspond
    // à la date récupérée. Ensuite nous mettons à jour le contenu du tooltip en utilisant les ids définit lors de
    // sa création.
    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0),
            d = data[i];

        tooltip.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")");

        d3.select('#tooltip-date')
            .text(dateFormat(d.date));
        d3.select('#tooltip-close')
            .text(d.close + "$");
    }
});

// Dans le précédent tutoriel il est impossible que la souris passe sur le tooltip sinon l'évènement d'écoute mousemove
// est perdu puisqu'il est posé sur le SVG et que le DIV de notre tooltip a pour parent le body de la page. Cette
// contrainte nous a obligé a toujours décalé le tooltip par rapport à la souris. Ce n'est pas le cas dans ce tutoriel
// ou la souris peut passer sur le tooltip sans que cela ne gêne le mécanisme d'écoute. Par contre nous avons dû créer
// ce tooltip entièrement en SVG pour l'ajouter à notre SVG. Notez que nous avons été particulièrement vigilants
// au style utilisé en choisissant police, couleur et transparence pour obtenir quelque chose de propre.
//  L'avantage du polyline pour le rectangle c'est que la bordure associée est propre au niveau du triangle.
//  Nous aurions pu dessiner un rectangle plus un triangle mais il y aurait eu un morceau de bordure au-dessus
//  du triangle. Ce tooltip est placé dans un groupe ce qui rendra facile son positionnement par la suite.
//  Deux IDs ont été défini, tooltip-date et tooltip-close pour mettre à jour la date et le cours de l'or en
//  fonction de la position de la souris.
function addTooltip() {
    // Création d'un groupe qui contiendra tout le tooltip plus le cercle de suivi
    var tooltip = svg.append("g")
        .attr("id", "tooltip")
        .style("display", "none");

    // Le cercle extérieur bleu clair
    tooltip.append("circle")
        .attr("fill", "#CCE5F6")
        .attr("r", 10);

    // Le cercle intérieur bleu foncé
    tooltip.append("circle")
        .attr("fill", "#3498db")
        .attr("stroke", "#fff")
        .attr("stroke-width", "1.5px")
        .attr("r", 4);

    // Le tooltip en lui-même avec sa pointe vers le bas
    // Il faut le dimensionner en fonction du contenu
    tooltip.append("polyline")
        .attr("points","0,0 0,40 55,40 60,45 65,40 120,40 120,0 0,0")
        .style("fill", "#fafafa")
        .style("stroke","#3498db")
        .style("opacity","0.9")
        .style("stroke-width","1")
        .attr("transform", "translate(-60, -55)");

    // Cet élément contiendra tout notre texte
    var text = tooltip.append("text")
        .style("font-size", "13px")
        .style("font-family", "Segoe UI")
        .style("color", "#333333")
        .style("fill", "#333333")
        .attr("transform", "translate(-50, -40)");

    // Element pour la date avec positionnement spécifique
    text.append("tspan")
        .attr("dx", "-5")
        .attr("id", "tooltip-date");

    // Positionnement spécifique pour le petit rond	bleu
    text.append("tspan")
        .style("fill", "#3498db")
        .attr("dx", "-60")
        .attr("dy", "15")
        .text("●");

    // Le texte "Cours : "
    text.append("tspan")
        .attr("dx", "5")
        .text("Cours : ");

    // Le texte pour la valeur de l'or à la date sélectionnée
    text.append("tspan")
        .attr("id", "tooltip-close")
        .style("font-weight", "bold");

    return tooltip;
}
