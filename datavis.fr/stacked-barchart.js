// Dans la mesure du possible, lorsque des valeurs numériques sont porteuses de sens ou utilisées plusieurs fois
// dans un code, il est préférable de les définir comme constante dans le code. Cela évite d'avoir à mettre un
// commentaire pour expliquer à quoi correspond une valeur. C'est le cas par exemple de la largeur du tooltip qui
// conditionne le comportement du mouseover. En informatique on appelle ces valeurs dans le code des "Magic Number" ou
// plus simplement "Constantes numériques non nommées" (voir sur Wikipédia "Nombre Magique").
//
// margin permet de définir les 4 marges de notre graphique qui s'appliqueront au diagramme empilé.
//      Sans titre, la marge du haut (top) est petite. A gauche (left) nous avons les valeurs associées à l'axe des
//      ordonnées. A droite (right) la marge permet d'écrire le texte "MM10". Enfin en bas (bottom) nous retrouvons
//      l'axe des abscisses
// width est calculé de manière dynamique en fonction de la largeur de la page à laquelle on retire les marges à
//      droite et à gauche
// height est fixe et arbitraire. On décide que l'ensemble doit s'afficher sur 600px de hauteur. On retire les marges
//      en haut et en bas
// keys représente les catégories de notre fichier qui seront utilisées pour calculer la hauteur de chaque
//      rectangle de notre diagramme
// colors possède la même taille que le tableau keys et contient la couleur qui sera associée à chaque catégorie
// legendCellSize indique la taille des carrés dans la légende (largeur et hauteur donc)
// tooltipWidth contient la largeur de notre tooltip en pixel


const margin = {top: 20, right: 40, bottom: 60, left: 50},
    width = document.getElementById("container").offsetWidth * 0.95 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom,
    keys = ["Biberon 1", "Biberon 2", "Biberon 3", "Biberon 4", "Biberon 5", "Biberon 6", "Biberon 7", "Biberon 8", "Biberon 9"],
    colors = ["#f7fcf0", "#e0f3db", "#ccebc5", "#a8ddb5", "#7bccc4", "#4eb3d3", "#2b8cbe", "#0868ac", "#084081"],
    legendCellSize = 20,
    tooltipWidth = 210;

// Nous pouvons ensuite créer notre SVG à partir de ces données. Il faut disposer sur la page d'un DIV dont l'ID est chart.
const svg = d3.select("#chart").append("svg")
    .attr("id", "svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.tsv("d3js/stacked-barchart/biberons.txt").then(function(data) {
    var stack = d3.stack()
        .keys(keys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    var series = stack(data);

    const x = d3.scaleBand()
        .domain(data.map(d => d.date))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(series[series.length - 1], d => d[1])])
        .range([height, 0]);

    // Filter X domain to display limited number of values
    const xAxis = d3.axisBottom(x)
        .tickValues(x.domain().filter(d => (d.includes("06/0") || d.includes("21/0"))));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "middle");

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .style("text-anchor", "end")
        .text("ml");

    // Create groups for each series, rects for each segment
    let groups = svg.selectAll("g.biberon")
        .data(series)
        .enter().append("g")
        .style("fill", (d, i) => colors[i]);

    let rect = groups.selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("x", d => x(d.data.date))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d[1]))
        .attr("height", d => height - y(d[1] - d[0]));

    addMovingAverage(data, x, y);
    addLegend(colors);
    let tooltip = addTooltip(keys.length);
    handleMouseEvent(data, x, y, tooltip);
});

function movingAverage(array, count) {
    var result = [], val;

    // calculate average for each subarray and add to result
    for (var i = Math.floor(count / 2), len = array.length - count / 2; i < len; i++) {
        val = d3.mean(array.slice(i - count / 2, i + count / 2), d => d.Total);
        result.push({"date": array[i].date, "value": val});
    }

    return result;
}

function addMovingAverage(data, x, y) {
    const line = d3.line()
        .x(d => (x.bandwidth() / 2) + x(d.date)) // décalage pour centrer au milieu des barres
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);

    let mm10array = movingAverage(data, 10);

    svg.append("path")
        .datum(mm10array)
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", "#ffab00")
        .style("stroke-width", 3);

    // Add "MM10" text at the end of the line
    let lastEntry = mm10array[mm10array.length - 1];
    svg.append("text")
        .attr("transform", "translate(" + x(lastEntry.date) + "," + y(lastEntry.value) + ")")
        .attr("dy", "0.5em")
        .attr("dx", "0.5em")
        .style("fill", "#ffab00")
        .style("font-size", "0.8em")
        .style("font-weight", "500")
        .text("MM10");
}

function addLegend(colors) {
    let reverseColors = colors.reverse();
    let reverseKeys = keys.reverse();

    let legend = svg.append('g')
        .attr('transform', 'translate(10, 20)');

    legend.selectAll()
        .data(reverseColors)
        .enter().append('rect')
        .attr('height', legendCellSize + 'px')
        .attr('width', legendCellSize + 'px')
        .attr('x', 5)
        .attr('y', (d,i) => i * legendCellSize)
        .style("fill", d => d);

    legend.selectAll()
        .data(reverseKeys)
        .enter().append('text')
        .attr("transform", (d,i) => "translate(30, " + (i * legendCellSize + legendCellSize / 1.6) + ")")
        .style("font-size", "13px")
        .style("fill", "grey")
        .text(d => d);
}

function addTooltip(nbCategories) {
    let values = d3.range(1, nbCategories + 1); // Biberon de 1 à 9
    let band = tooltipWidth / values.length; // Espace alloué pour chaque catégorie

    var tooltip = svg.append("g") // Le tooltip est placé dans un groupe avec un ID
        .attr("id", "tooltip")
        .style("opacity", 0);

    tooltip.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", tooltipWidth)
        .attr("height", 80)
        .style("opacity","0.9")
        .style("fill", "white")
        .style("stroke-width","1")
        .style("stroke","#929292")
        .style("padding", "1em");

    tooltip.append("line") // A line inserted between title and values
        .attr("x1", 40)
        .attr("y1", 25)
        .attr("x2", 160)
        .attr("y2", 25)
        .style("stroke","#929292")
        .style("stroke-width","0.5")
        .attr("transform", "translate(0, 5)");

    var text = tooltip.append("text") // Text that will contain all tspan (used for multilines)
        .style("font-size", "13px")
        .style("fill", "grey")
        .attr("transform", "translate(0, 20)");

    text.append("tspan") // Date upated by its id
        .attr("x", tooltipWidth / 2)
        .attr("y", 0)
        .attr("id", "tooltip-date")
        .attr("text-anchor", "middle")
        .style("font-weight", "600")
        .style("font-size", "16px");

    text.selectAll("text.biberon")
        .data(values)
        .enter().append("tspan")
        .attr("x", d => band / 2 + band * (d - 1))
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("fill", "grey")
        .text(d => d);

    text.selectAll("text.biberon")
        .data(values)
        .enter().append("tspan")
        .attr("x", d => band / 2 + band * (d - 1))
        .attr("y", 45)
        .attr("id", d => "tooltip-" + d)
        .attr("text-anchor", "middle")
        .style("fill", "grey")
        .style("font-size", "0.8em")
        .style("font-weight", "bold");

    return tooltip;
}

function buildMousePolygon(data, x, y) {
    const tmpline = d3.line()
        .x(d => x.bandwidth() + x(d.date))
        .y(d => y(d.value))
        .curve(d3.curveStepBefore);

    let tmpArray = [];
    for (let i = 0; i < data.length; ++i) {
        tmpArray.push({"date": data[i].date, "value": data[i].Total});
    }

    // Create a detached group (it is not append to the page)
    const detachedGroup = d3.create("g");

    detachedGroup.append("path")
        .datum(tmpArray)
        .attr("d", tmpline);

    // Le path ajouté ci-dessous ne forme pas un chemin fermé sur lui même, nous le complétons avec ce chemin construit manuellement
    // https://www.dashingd3js.com/svg-paths-and-d3js
    let strPath = "M " + x.bandwidth() + " " + y(data[0].Total) + " H 0 V " + height + " H " + width + " V " + y(data[data.length - 1].Total);

    detachedGroup.append("path")
        .attr("d", strPath);

    var mergedPath = "";
    detachedGroup.selectAll("path")
        .each(function() { mergedPath += d3.select(this).attr("d"); });

    return mergedPath;
}

function handleMouseEvent(data, x, y, tooltip) {
    let mergedPath = buildMousePolygon(data, x, y);

    svg.append("path")
        .attr("d", mergedPath)
        .style("opacity", 0)
        .on("mouseover", function() {
            tooltip.style("opacity", 1);
        })
        .on("mouseout", function() {
            tooltip.style("opacity", 0);
        })
        .on("mousemove", function() {
            // No invert function on scale band
            // https://stackoverflow.com/questions/38633082/d3-getting-invert-value-of-band-scales
            let mouse = d3.mouse(this),
                i = Math.floor((mouse[0] / x.step())), // step = bandWidth + paddingInner : https://observablehq.com/@d3/d3-scaleband
                d = data[i];
            if (d === undefined) { return ; }

            let boundedX = mouse[0] < (tooltipWidth / 2) ? 0 : mouse[0] > (width - (tooltipWidth / 2)) ? width - tooltipWidth : mouse[0] - (tooltipWidth / 2);
            tooltip.attr("transform", "translate(" + boundedX + "," + (mouse[1] - 90) + ")");

            tooltip.select('#tooltip-date')
                .text("Biberons du " + d.date);
            for (let i = 1; i <= 9; i++) {
                tooltip.select('#tooltip-' + i)
                    .text(d["Biberon " + i]);
            }
        });
}
