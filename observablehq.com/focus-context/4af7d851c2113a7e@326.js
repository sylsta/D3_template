// https://observablehq.com/@d3/focus-context@326
export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["aapl.csv",new URL("./files/de259092d525c13bd10926eaf7add45b15f2771a8b39bc541a5bba1e0206add4880eb1d876be8df469328a85243b7d813a91feb8cc4966de582dc02e5f8609b7",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Focus + Context

This [area chart](/@d3/area-chart) uses brushing to specify a focused area. Drag the gray region to pan, or brush to zoom. Compare to a [zoomable chart](/@d3/zoomable-area-chart). Data: [Yahoo Finance](https://finance.yahoo.com/lookup)`
)});
  main.variable(observer("chart")).define("chart", ["d3","width","height","DOM","margin","data","xAxis","yAxis","area"], function(d3,width,height,DOM,margin,data,xAxis,yAxis,area)
{
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .style("display", "block");

  const clipId = DOM.uid("clip");

  svg.append("clipPath")
      .attr("id", clipId.id)
    .append("rect")
      .attr("x", margin.left)
      .attr("y", 0)
      .attr("height", height)
      .attr("width", width - margin.left - margin.right);

  const gx = svg.append("g");

  const gy = svg.append("g");

  const path = svg.append("path")
      .datum(data)
      .attr("clip-path", clipId)
      .attr("fill", "steelblue");

  return Object.assign(svg.node(), {
    update(focusX, focusY) {
      gx.call(xAxis, focusX, height);
      gy.call(yAxis, focusY, data.y);
      path.attr("d", area(focusX, focusY));
    }
  });
}
);
  main.variable(observer("viewof focus")).define("viewof focus", ["d3","width","focusHeight","margin","x","xAxis","data","area","y"], function(d3,width,focusHeight,margin,x,xAxis,data,area,y)
{
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, focusHeight])
      .style("display", "block");

  const brush = d3.brushX()
      .extent([[margin.left, 0.5], [width - margin.right, focusHeight - margin.bottom + 0.5]])
      .on("brush", brushed)
      .on("end", brushended);

  const defaultSelection = [x(d3.utcYear.offset(x.domain()[1], -1)), x.range()[1]];

  svg.append("g")
      .call(xAxis, x, focusHeight);

  svg.append("path")
      .datum(data)
      .attr("fill", "steelblue")
      .attr("d", area(x, y.copy().range([focusHeight - margin.bottom, 4])));

  const gb = svg.append("g")
      .call(brush)
      .call(brush.move, defaultSelection);

  function brushed({selection}) {
    if (selection) {
      svg.property("value", selection.map(x.invert, x).map(d3.utcDay.round));
      svg.dispatch("input");
    }
  }

  function brushended({selection}) {
    if (!selection) {
      gb.call(brush.move, defaultSelection);
    }
  }

  return svg.node();
}
);
  main.variable(observer("focus")).define("focus", ["Generators", "viewof focus"], (G, _) => G.input(_));
  main.variable(observer("update")).define("update", ["focus","d3","data","chart","x","y"], function(focus,d3,data,chart,x,y)
{
  const [minX, maxX] = focus;
  const maxY = d3.max(data, d => minX <= d.date && d.date <= maxX ? d.value : NaN);
  chart.update(x.copy().domain(focus), y.copy().domain([0, maxY]));
}
);
  main.variable(observer("data")).define("data", ["d3","FileAttachment"], async function(d3,FileAttachment){return(
Object.assign(d3.csvParse(await FileAttachment("aapl.csv").text(), d3.autoType).map(({date, close}) => ({date, value: close})), {y: "↑ Close $"})
)});
  main.variable(observer("area")).define("area", ["d3"], function(d3){return(
(x, y) => d3.area()
    .defined(d => !isNaN(d.value))
    .x(d => x(d.date))
    .y0(y(0))
    .y1(d => y(d.value))
)});
  main.variable(observer("x")).define("x", ["d3","data","margin","width"], function(d3,data,margin,width){return(
d3.scaleUtc()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right])
)});
  main.variable(observer("y")).define("y", ["d3","data","height","margin"], function(d3,data,height,margin){return(
d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([height - margin.bottom, margin.top])
)});
  main.variable(observer("xAxis")).define("xAxis", ["margin","d3","width"], function(margin,d3,width){return(
(g, x, height) => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
)});
  main.variable(observer("yAxis")).define("yAxis", ["margin","d3"], function(margin,d3){return(
(g, y, title) => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".title").data([title]).join("text")
        .attr("class", "title")
        .attr("x", -margin.left)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(title))
)});
  main.variable(observer("margin")).define("margin", function(){return(
{top: 20, right: 20, bottom: 30, left: 40}
)});
  main.variable(observer("height")).define("height", function(){return(
440
)});
  main.variable(observer("focusHeight")).define("focusHeight", function(){return(
100
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@6")
)});
  return main;
}
