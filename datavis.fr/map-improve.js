
    const width = document.getElementById("container").offsetWidth * 0.95,
    height = 500,
    legendCellSize = 20,
    colors = ['#d4eac7', '#c6e3b5', '#b7dda2', '#a9d68f', '#9bcf7d', '#8cc86a', '#7ec157', '#77be4e', '#70ba45', '#65a83e', '#599537', '#4e8230', '#437029', '#385d22', '#2d4a1c', '#223815'];

    const svg = d3.select('#map').append("svg")
    .attr("id", "svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "svg");

    const projection = d3.geoNaturalEarth1()
    .scale(1)
    .translate([0, 0]);

    const path = d3.geoPath()
    .pointRadius(2)
    .projection(projection);

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

    const cGroup = svg.append("g");

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

    var legendScale = d3.scaleLinear().domain([min, max])
    .range([0, colors.length * legendCellSize]);

    legendAxis = legend.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(legendScale));

    return legend;
}

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
