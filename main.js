/**
 * Created by ${USER} on ${DATE}.
 */
const data = [
    {"position":1, "country":"Chine", "population":1355045511},
    {"position":2, "country":"Inde", "population":1210193422},
    {"position":3, "country":"États-Unis", "population":315664478},
    {"position":4, "country":"Indonésie", "population":237641326},
    {"position":5, "country":"Brésil", "population":193946886},
    {"position":6, "country":"Pakistan", "population":182614855},
    {"position":7, "country":"Nigeria", "population":174507539},
    {"position":8, "country":"Bangladesh", "population":152518015},
    {"position":9, "country":"Russie", "population":143056383},
    {"position":10, "country":"Japon", "population":127650000}
];
svg = d3.select("#container").append("svg");
var group = svg.append("g");
group.selectAll(".node")
    .data(data) // 2
    .enter() // 3
        .append("rect") // 4
        .attr("x", d => d.position * 30) // 5
        .attr("y", 0) //6
        .attr("width", 20) // 7
        .attr("height", d => d.population / 10000000); // 8