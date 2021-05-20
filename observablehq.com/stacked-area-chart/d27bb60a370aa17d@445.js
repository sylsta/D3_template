// https://observablehq.com/@d3/stacked-area-chart@445
import define1 from "./a33468b95d0b15b0@699.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["unemployment-2.csv",new URL("./files/7cbdbc28fc4f3b5cb40e26cdf411c88807dd134ad13cac7576ee0abe81f834d1fc9d8dcddca522d9f52d329396319a5c7e61e43c83074080c3e3f97189909ee3",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Stacked Area Chart

Unemployed persons by industry, 2000–2010. Data: [BLS](https://www.bls.gov/)`
)});
  main.variable(observer("key")).define("key", ["swatches","color","margin"], function(swatches,color,margin){return(
swatches({color, marginLeft: margin.left, columns: "180px"})
)});
  main.variable(observer("chart")).define("chart", ["d3","width","height","series","color","area","xAxis","yAxis"], function(d3,width,height,series,color,area,xAxis,yAxis)
{  
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

  svg.append("g")
    .selectAll("path")
    .data(series)
    .join("path")
      .attr("fill", ({key}) => color(key))
      .attr("d", area)
    .append("title")
      .text(({key}) => key);

  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .call(yAxis);

  return svg.node();
}
);
  main.variable(observer("data")).define("data", ["d3","FileAttachment"], async function(d3,FileAttachment){return(
Object.assign(d3.csvParse(await FileAttachment("unemployment-2.csv").text(), d3.autoType), {y: "Unemployment"})
)});
  main.variable(observer("series")).define("series", ["d3","data"], function(d3,data){return(
d3.stack().keys(data.columns.slice(1))(data)
)});
  main.variable(observer("area")).define("area", ["d3","x","y"], function(d3,x,y){return(
d3.area()
    .x(d => x(d.data.date))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]))
)});
  main.variable(observer("x")).define("x", ["d3","data","margin","width"], function(d3,data,margin,width){return(
d3.scaleUtc()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right])
)});
  main.variable(observer("y")).define("y", ["d3","series","height","margin"], function(d3,series,height,margin){return(
d3.scaleLinear()
    .domain([0, d3.max(series, d => d3.max(d, d => d[1]))]).nice()
    .range([height - margin.bottom, margin.top])
)});
  main.variable(observer("color")).define("color", ["d3","data"], function(d3,data){return(
d3.scaleOrdinal()
    .domain(data.columns.slice(1))
    .range(d3.schemeCategory10)
)});
  main.variable(observer("xAxis")).define("xAxis", ["height","margin","d3","x","width"], function(height,margin,d3,x,width){return(
g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
)});
  main.variable(observer("yAxis")).define("yAxis", ["margin","d3","y","data"], function(margin,d3,y,data){return(
g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(data.y))
)});
  main.variable(observer("height")).define("height", function(){return(
500
)});
  main.variable(observer("margin")).define("margin", function(){return(
{top: 20, right: 30, bottom: 30, left: 40}
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@6")
)});
  const child1 = runtime.module(define1);
  main.import("swatches", child1);
  return main;
}
