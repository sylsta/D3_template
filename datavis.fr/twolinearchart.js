
const margin = {top: 20, right: 45, bottom: 30, left: 60},
    width = document.getElementById("container").offsetWidth * 0.95 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

const parseTime = d3.timeParse("%d/%m/%Y");

const x = d3.scaleTime()
    .range([0, width]);

const y0 = d3.scaleLinear()
    .range([height, 0]);

const y1 = d3.scaleLinear()
    .range([height, 0]);

const line0 = d3.line()
    .x(d => x(d.date))
    .y(d => y0(d.chomage));

const line1 = d3.line()
    .x(d => x(d.date))
    .y(d => y1(d.cac40));

const svg = d3.select("#chart").append("svg")
    .attr("id", "svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var map = {};
d3.tsv("d3js/twolinearchart/cac40VSchomage.txt").then(function(data) {
    data.forEach(function(d) {
        d.date = parseTime(d.date);
        d.chomage = +d.chomage;
        d.cac40 = +d.cac40;
        map[d.date] = d;
    });

    x.domain(d3.extent(data, d => d.date));
    y0.domain(d3.extent(data, d => d.chomage));
    y1.domain(d3.extent(data, d => d.cac40));

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "axisSteelblue")
        .attr("transform", "translate(" + width + ", 0)")
        .call(d3.axisRight(y0))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "-0.71em")
        .style("text-anchor", "end")
        .text("%");

    svg.append("g")
        .attr("class", "axisRed")
        .call(d3.axisLeft(y1))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Pts");

    svg.selectAll("y axis").data(y1.ticks(10)).enter()
        .append("line")
        .attr("class", "horizontalGrid")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => y1(d))
        .attr("y2", d => y1(d));

    svg.append("path")
        .datum(data)
        .style("stroke", "steelblue")
        .attr("class", "line")
        .attr("d", line0);

    svg.append("path")
        .datum(data)
        .style("stroke", "red")
        .attr("class", "line")
        .attr("d", line1);
});
