export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["chicago-homicide-dates.csv",new URL("./files/8271ea93a0683bf205b173733f35ecd232a405e45dbd70fa5b4ef239ec7855d0b3596c721a0d84e68e8aab1a9a45b76d78eb37dd198e98e668588d5a527e592d",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md","N"], function(md,N){return(
md`# Moving Average

${N}-day moving average of homicides per day. Data: [City of Chicago](https://data.cityofchicago.org/Public-Safety/Crimes-2001-to-present/ijzp-q8t2)`
)});
  main.variable(observer("viewof N")).define("viewof N", ["html"], function(html)
{
  const form = html`<form>
  <input name=i type=number min=1 max=365 value=100 step=1 style="width:40px;">
  <span style="font-size:smaller;font-style:oblique;">days (N)</span>
</form>`;
  form.i.oninput = () => form.value = form.i.valueAsNumber;
  form.i.oninput();
  return form;
}
);
  main.variable(observer("N")).define("N", ["Generators", "viewof N"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["d3","width","height","xAxis","yAxis","area","values"], function(d3,width,height,xAxis,yAxis,area,values)
{
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

  svg.append("g")
      .call(xAxis);
  
  svg.append("g")
      .call(yAxis);

  svg.append("path")
      .attr("fill", "steelblue")
      .attr("d", area(values));

  return svg.node();
}
);
  main.variable(observer("movingAverage")).define("movingAverage", function(){return(
function movingAverage(values, N) {
  let i = 0;
  let sum = 0;
  const means = new Float64Array(values.length).fill(NaN);
  for (let n = Math.min(N - 1, values.length); i < n; ++i) {
    sum += values[i];
  }
  for (let n = values.length; i < n; ++i) {
    sum += values[i];
    means[i] = sum / N;
    sum -= values[i - N + 1];
  }
  return means;
}
)});
  main.variable(observer("values")).define("values", ["movingAverage","bins","N"], function(movingAverage,bins,N){return(
movingAverage(bins.map(d => d.length), N)
)});
  main.variable(observer("data")).define("data", ["d3","FileAttachment","parseDate"], async function(d3,FileAttachment,parseDate){return(
d3.csvParse(await FileAttachment("chicago-homicide-dates.csv").text(), ({date}) => parseDate(date))
)});
  main.variable(observer("parseDate")).define("parseDate", ["d3"], function(d3){return(
d3.timeParse("%m/%d/%Y %I:%M:%S %p")
)});
  main.variable(observer("bins")).define("bins", ["d3","x","data"], function(d3,x,data){return(
d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(d3.timeDay))
  (data)
)});
  main.variable(observer("area")).define("area", ["d3","x","bins","y"], function(d3,x,bins,y){return(
d3.area()
    .defined(d => !isNaN(d))
    .x((d, i) => x(bins[i].x0))
    .y0(y(0))
    .y1(y)
)});
  main.variable(observer("x")).define("x", ["d3","data","margin","width"], function(d3,data,margin,width){return(
d3.scaleTime()
    .domain(d3.extent(data))
    .range([margin.left, width - margin.right])
)});
  main.variable(observer("y")).define("y", ["d3","values","height","margin"], function(d3,values,height,margin){return(
d3.scaleLinear()
    .domain([0, d3.max(values)]).nice()
    .rangeRound([height - margin.bottom, margin.top])
)});
  main.variable(observer("xAxis")).define("xAxis", ["height","margin","d3","x"], function(height,margin,d3,x){return(
g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
)});
  main.variable(observer("yAxis")).define("yAxis", ["margin","d3","y","width"], function(margin,d3,y,width){return(
g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").clone()
        .attr("x2", width)
        .attr("stroke-opacity", 0.1))
)});
  main.variable(observer("height")).define("height", function(){return(
500
)});
  main.variable(observer("margin")).define("margin", function(){return(
{top: 20, right: 12, bottom: 30, left: 30}
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@6")
)});
  return main;
}
