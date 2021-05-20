// https://observablehq.com/@khlick/zoomable-line-marker-chart-with-canvas@2300
import define1 from "./e93997d5089d7165@2289.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`
# Zoomable Line/Marker Chart with \`canvas\` and d3js

---
## This is the messy version, for an update see:
[data-driven-plot-html5-with-class-declarations](https://observablehq.com/@khlick/data-driven-plot-html5-with-class-declarations)

---

`
)});
  main.variable(observer("viewof dataSet")).define("viewof dataSet", ["select"], function(select){return(
select({
  title: "Choose Data set:",
  description: "Select a data set to plot.",
  options: ["Two Lines", "Simple Points", "Five Colors"],
  value: "Simple Points"
})
)});
  main.variable(observer("dataSet")).define("dataSet", ["Generators", "viewof dataSet"], (G, _) => G.input(_));
  main.variable(observer("viewof XLABEL")).define("viewof XLABEL", ["text"], function(text){return(
text({title: "Provide an X-Axis Label", placeholder: "X Label"})
)});
  main.variable(observer("XLABEL")).define("XLABEL", ["Generators", "viewof XLABEL"], (G, _) => G.input(_));
  main.variable(observer("viewof YLABEL")).define("viewof YLABEL", ["text"], function(text){return(
text({title: "Provide a Y-Axis Label", placeholder: "Y Label"})
)});
  main.variable(observer("YLABEL")).define("YLABEL", ["Generators", "viewof YLABEL"], (G, _) => G.input(_));
  main.variable(observer("viewof buttons")).define("viewof buttons", ["html"], function(html){return(
html`
<button id="reset">Reset</button>
<button id="clear">Clear</button>
<button id="draw">Draw</button>
<input type="checkbox" id="tipToggle">Toggle Tooltips</input>
<br />
<i>Note: Double click canvas will also reset zoom.</i>
`
)});
  main.variable(observer("buttons")).define("buttons", ["Generators", "viewof buttons"], (G, _) => G.input(_));
  main.variable(observer("v")).define("v", ["callbacks","d3","containers","tooltipDelay","tooltipFinder","bindData","theData","draw"], function(callbacks,d3,containers,tooltipDelay,tooltipFinder,bindData,theData,draw)
{
  callbacks();
  if (d3.select("#tipToggle").node().checked) {
    containers.pointmap.on('mousemove', tooltipDelay(tooltipFinder,200));
  } else {
    containers.pointmap.on('mousemove', null);
  }
  bindData(theData);
  draw(d3.zoomIdentity);
  return containers.div.node()
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`
---

## Motivation

I needed an interactive, dynamic, data visualization tool for eletrophysiological data and I wanted to write it in JavaScript (because, why not?). Similar to how ploty.js works, this chart utilizes a \`layoutOptions\` object to set global aesthetic features and a \`Data\` array of \`datum\` objects that contain specific properties for each datum. I didn't want to use a \`<svg>\` approach because the data can be quite numerous (displaying 100+ differnet 2-seconds-long traces sampled at 10kHz in an overlay).

My remaining reqirements are (TODO's):

- [x] Add tooltips to data showing  \`<x,y>\` in data-space and identity of datum (\`d.name\`)
- [ ] Add datum crosshair (toggle preferred but not mandatory)
- [ ] Add flair to data changes[1]. 


[1] I would like a very fast add and remove animation (<100ms) for inserting new and removing old data (datums). I am considering some sort of animated canvas transform... this will likely never be realized as it is low priority. Another though is to have added data fly-in from the bottom and removed data fly out to the left. These animations could be written as methods... I wonder if d3.js has a way to mark data as leaving before the \`exit().remove()\` call...?

---

## Current Progress
The current design has two \`canvas\` layers. The lower layer contains any lines if specified in \`data.mode="lines+markers"\`, along with showing the zero-lines if specified in \`layoutOpts.[x|y]axis.zeroline=true\` as well as the makers (again, as specified from the \`containers.pointbin\` data container). The upper layer will draw the tooltip lines and possibly the tooltips themselves.

**Update (9/13):**
Designed an animated tooltip (\`context2D\`) and a rudimentary callback for mousemove draws it. Though when moving from a valid point to a non-valid point causes the tooltip to draw in the top-left corner (0,0) even though the last valid point is the only one caught in the callback, this is as if the \`context.setTransform()\` failed. The abberant tip box will persist until enough 'moves' occur causing the \`clearRect\` build. I suspect I can get around this in the production version with a class definition allowing the easy tracking of if a tip is drawn. To fix it in notebook format, I would probably have to use some sort of mutable global variable, or maybe classes work, I haven't tried.

**Update (9/14 @ morning):**
Fixed the jumping and strange non-translated tooltips and better (correctly? but neccesary?) applied the tooltip clipping region by reading more about how \`clip()\`, \`save()\` and \`restore()\` work. Unlike many other canvas methods, \`clip()\` is 'permanent'. You can do things like change the canvas width to reset clear a clip, but what worked best for me was to \`save()\` the canvas state, then \`clip()\` the region I wanted, draw my animation inside the clipped region and then \`restore()\` the canvas state to drop the clipping region. I am not altogether sure the clipping region is needed because I also changed the way the tooltip making functin clears the canvas. Instead of clearing from an arbitrary point, I use the context2D method, \`getTransform()\`, to determine the current zero-offset and the method, \`context.canvas.clientWidth\` or \`Height\`, to get the canvas dimensions. I then draw a \`clearRect()\` from \`<-zeroOffset.e,-zeroOffset.f>\` at the canvas dimensions. This ensures the animation won't have strange persisting  blobs anywhere missed by the clear and clip. On the note of persisting blobs, *I would like to somehow persist the mouse calls and exit if the new mouse position contains the same data as is already drawn...* **_need to figure this out!_**

**Update (9/14 @ lunch break)**
Added delay to tooltip as well as toggle. Refactored positioning of text within tooltip to allow dynamic number of different datums overlapping at a given coordinate. This works in the X-direction very well for all 4 quadrants but when tooltips invert in Y (bottom quadrants), then Y-positioning fails. Will fix this after lunch, it will have to be 1) refactor height calcs like I did for width calcs and 2) switch the \`.textBaseline()\` props. **After lunch:** mostly there, I still want to track the mouse to prevent many redraws.


---

### This notebook is a work in progress...
As time goes on, sooner that later, I will clean up and refactor the code herein. If you're seeing this notebook and have any suggestions, I want to hear them, thanks!

## The Chart
`
)});
  main.variable(observer("callbacks")).define("callbacks", ["d3","containers","zoomer","extents","draw","tooltipDelay","tooltipFinder"], function(d3,containers,zoomer,extents,draw,tooltipDelay,tooltipFinder){return(
() => {
  // global
  const t = d3.zoomIdentity.translate(0,0).scale(1);
  containers.pointmap
      .call(zoomer)
      .on("dblclick.zoom", (d) => {
        containers.pointmap.transition()
           .duration(200)
           .ease(d3.easeLinear)
           .call(zoomer.transform, t);
       })
      .on("dblclick", (d) => {
        containers.pointmap.transition()
           .duration(200)
           .ease(d3.easeLinear)
           .call(zoomer.transform, t);
       });
  
  // reset view
  d3.selectAll("#reset").on("click", () =>{
    containers.canvas.transition()
      .duration(100)
      .ease(d3.easeLinear)
      .call(zoomer.transform, t);
    containers.pointmap.transition()
      .duration(100)
      .ease(d3.easeLinear)
      .call(zoomer.transform, t);
    
  });
  // clear canvas
  d3.selectAll("#clear").on("click", () =>{
    containers.context.clearRect(0,0,extents.width,extents.height);
    containers.pointctx.clearRect(0,0,extents.width,extents.height);
  }, false);
  // draw on canvas
  d3.selectAll("#draw").on("click", () =>{
    draw(t);
  }, false);
  d3.selectAll("#tipToggle").on("click", () => {
    if (d3.select("#tipToggle").node().checked) {
      containers.pointmap.on('mousemove', tooltipDelay(tooltipFinder,200));
    } else {
      containers.pointmap.on('mousemove', null);
    }
  });
  
}
)});
  main.variable(observer("tooltipDelay")).define("tooltipDelay", ["containers","layoutOpts"], function(containers,layoutOpts){return(
function tooltipDelay(func,delay) {
  let prev = Date.now() - delay;
  return (...args) => {
    let cur = Date.now();
    if (cur-prev >= delay) {
      prev = cur;
      func.apply(args[2][0],args);
    } else {
      containers.pointctx.clearRect(0,0,layoutOpts.width,layoutOpts.height);
    }
  }
}
)});
  main.variable(observer("tooltipFinder")).define("tooltipFinder", ["d3","containers","x","y","layoutOpts","extents","makeTooltip"], function(d3,containers,x,y,layoutOpts,extents,makeTooltip){return(
function tooltipFinder() {
  let cLocation = d3.mouse(this);
  let currentZoom = d3.zoomTransform(containers.pointmap.node());
  let sx = currentZoom.rescaleX(x);
  let sy = currentZoom.rescaleY(y);
  let k = currentZoom.k;
  //setup an aray to push the points to when > 1 point matches... i.e. two line pts.
  let tooltipData = [];
  // get the "points" data
  const elems = containers.pointbin.selectAll("custom.points");
  // check the distance between current location and all points.
  elems.each( (d) => {
    let dx = sx(d.x) - cLocation[0];
    let dy = sy(d.y) - cLocation[1];
    // Check distance and return if cursor is too far from the point.
    if ( Math.sqrt(dx**2 + dy**2) > Math.sqrt(d.marker.size**2 * (k>1?k*0.75:k)) ) return false;
    // close enough, push tooltip data
    tooltipData.push(d);
  });
  // check if we didnt' find anything
  if (!tooltipData.length) {
    
    //containers.pointctx.resetTransform();
    containers.pointctx.setTransform(1,0,0,1,0,0);
    
    containers.pointctx.clearRect(0,0,layoutOpts.width,layoutOpts.height);
    
    return false;
  }
  if (tooltipData.length > 1) {
    
    // filter to grab a single point from each
    let checkIndex = tooltipData.map(d => d.name);
    checkIndex = checkIndex.map( (v,i,a) => a.indexOf(v)===i );
    tooltipData = tooltipData.filter((dat,ind) => checkIndex[ind]);
  }
  
  const pxDat = [parseInt(sx(tooltipData[0].x)),parseInt(sy(tooltipData[0].y))];
  
  
  // start by just plotting the first found tooltip.
  var dirStr = '';
  dirStr += (pxDat[1] < extents.height/2) ? 's' : 'n';
  dirStr += (pxDat[0] < extents.width/2)  ? 'e' : 'w' ;
  
  // set transform and check if it applied
  
  containers.pointctx.setTransform(1,0,0,1,pxDat[0],pxDat[1]);
  const currentTrs = containers.pointctx.getTransform();
  
  if ((currentTrs.e !== pxDat[0] && currentTrs.f !== pxDat[1])) {
    containers.pointctx.setTransform(1,0,0,1,0,0);
    containers.pointctx.clearRect(0,0,layoutOpts.width,layoutOpts.height);
    return false;
  }
  makeTooltip(tooltipData,containers.pointctx,dirStr);
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
---

## Containers
`
)});
  main.variable(observer("containers")).define("containers", ["d3","DOM","layoutOpts","gX","gY","xlabeler","ylabeler","extents"], function(d3,DOM,layoutOpts,gX,gY,xlabeler,ylabeler,extents)
{
  // PLOT VIEWPORT -> iris.ui.axesPanel<.lastChild>
  const div = d3.select(DOM.element('div'))
    .style("margin", "auto")
    .attr("width", `${layoutOpts.width}px`)
    .attr("height", `${layoutOpts.height}px`)
    .attr("class", "container")
    .style("display","block");
  
  //SVG for axes
  const svg = div.append("svg")
      .attr("width", `${layoutOpts.width}px`)
      .attr("height", `${layoutOpts.height}px`)
      .attr("class", "svg-container")
      .attr("xmlns", "http://www.w3.org/2000/svg")
    .append("g")
      .attr("transform", `translate(${layoutOpts.margin.l},${layoutOpts.margin.t})`);
  // Add axes groups
  const XX = svg.append("g")
    .call(gX);
  const YY = svg.append("g")
    .call(gY);
  // Add title label containers
  const XLAB = svg.append("g")
    .call(xlabeler);
  const YLAB = svg.append("g")
    .call(ylabeler);
  
  //Canvas
  const canvas = div.append("canvas")
    .attr("width", layoutOpts.width)
    .attr("height", layoutOpts.height)
    .style("margin", `${layoutOpts.margin.t}px ${layoutOpts.margin.r}px ${layoutOpts.margin.b}px ${layoutOpts.margin.l}px`)
    .attr("class", "canvas-container");
  // Map
  const pointmap = div.append("canvas")
    .attr("width", layoutOpts.width)
    .attr("height", layoutOpts.height)
    .style("margin", `${layoutOpts.margin.t}px ${layoutOpts.margin.r}px ${layoutOpts.margin.b}px ${layoutOpts.margin.l}px`)
    .attr("class", "pointmap-container")
    .attr("tabindex", "0");
  
  // Canvas Context
  const context = canvas.node().getContext('2d');// bottom layer doesn't need transparent bg
  //clip the context
  context.rect(1,1,extents.width-7,extents.height-1);
  context.clip();
  
  const pointctx = pointmap.node().getContext('2d');
  //clip the context
  pointctx.rect(1,1,extents.width-7,extents.height-1);
  pointctx.clip();
  
  
  // Containers for holding formatted data
  let databin = d3.select(document.createElement('custom'));
  let pointbin = d3.select(document.createElement('custom'));
  
  return {div:div,svg:svg,canvas:canvas,context:context, pointmap:pointmap, pointctx:pointctx, databin:databin,pointbin:pointbin,X:XX,Y:YY,ylab:YLAB,xlab:XLAB}
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`---
## Control Functions`
)});
  main.variable(observer("draw")).define("draw", ["x","y","containers","XLABEL","xlabeler","YLABEL","ylabeler","fx","theData","extents","drawLines","drawPoints"], function(x,y,containers,XLABEL,xlabeler,YLABEL,ylabeler,fx,theData,extents,drawLines,drawPoints){return(
function draw(transform) {
  const sX = transform.rescaleX(x);
  const sY = transform.rescaleY(y);

  // Labels
  containers.xlab.data([{label:XLABEL}]).call(xlabeler);
  containers.ylab.data([{label:YLABEL}]).call(ylabeler);
  //console.log(dats)
  containers.X.call(fx.Axes(theData,extents).X.scale(sX));
  containers.Y.call(fx.Axes(theData,extents).Y.scale(sY));
  // get transforms for clearing
  let cT = containers.context.getTransform();
  let pT = containers.pointctx.getTransform();
  containers.context.clearRect(-cT.e,-cT.f,extents.width,extents.height);
  containers.pointctx.clearRect(-pT.e,-pT.f,extents.width,extents.height);// 
  // draw the data bound to databin and pointbin
  drawLines(sX,sY,transform.k,containers.context);
  // drawing points last draws them on top of the lines
  drawPoints(sX,sY,transform.k,containers.context);
}
)});
  main.variable(observer("zoomer")).define("zoomer", ["d3","containers","draw"], function(d3,containers,draw){return(
d3.zoom()
    .scaleExtent([0.9,100])
    .duration(700)
    .on("zoom", () => {
      const transform = d3.event.transform;
      containers.context.save();
      draw(transform);
      containers.context.restore();
    })
)});
  main.variable(observer("bindData")).define("bindData", ["containers","d3"], function(containers,d3){return(
(inputData) => {
  let lineBins = containers.databin.selectAll("custom.lines")
    .data(inputData);
  let ptBins = containers.pointbin.selectAll("custom.points")
    .data(d3.merge(inputData.map( dd => dd.x.map( 
        (v,i) => ({name:dd.name,mode:dd.mode,x:v,y:dd.y[i],marker:dd.marker}) 
      ))));
  // method for updates
  lineBins.exit().remove();
  ptBins.exit().remove();
  // add/modify data
  lineBins
    .enter()
    .append("custom")
    .attr("class", "lines")
    .attr("lineInfo", d => JSON.stringify(d.line) )
    .attr("x", d => d.x )
    .attr("y", d => d.y )
    .attr("name", d => d.name )
    .attr("mode", d => d.mode )
  .merge(lineBins)
    .transition().duration(500)
    .attr("lineInfo", d => JSON.stringify(d.line) )
    .attr("x", d => d.x )
    .attr("y", d => d.y )
    .attr("name", d => d.name )
    .attr("mode", d => d.mode );
  
  ptBins
    .enter()
    .append("custom")
    .attr("class", "points")
    .attr("markerInfo", d => JSON.stringify(d.marker) )
    .attr("x", d => d.x )
    .attr("y", d => d.y )
    .attr("name", d => d.name )
    .attr("mode", d => d.mode )
  .merge(ptBins)
    .transition().duration(500)
    .attr("markerInfo", d => JSON.stringify(d.marker) )
    .attr("x", d => d.x )
    .attr("y", d => d.y )
    .attr("name", d => d.name )
    .attr("mode", d => d.mode );
  // remove old data
  //lineBins.exit().remove();
  //ptBins.exit().remove();
}
)});
  main.variable(observer("drawPoints")).define("drawPoints", ["d3","containers","fx"], function(d3,containers,fx){return(
function drawPoints(sX,sY,k,ctx) {
  //points drawn to scales
  let pointGen = d3.symbol().context(ctx);
  const elems = containers.pointbin.selectAll("custom.points");
  elems.each( function(d,i) {
    // each d in elems contains the stored data
    if(!/markers/gi.test(d.mode)){ 
      return;
    }
    ctx.save();
    ctx.fillStyle = fx.rgb2A(d.marker.color, d.marker.hasOwnProperty("opacity") ? d.marker.opacity : 1);
    ctx.translate(sX(d.x),sY(d.y));
    ctx.beginPath();
    pointGen.type(fx.markerType(d.marker.symbol)).size(d.marker.size**2 * (k>1?k*0.75:k))(d);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
}
)});
  main.variable(observer("drawLines")).define("drawLines", ["d3","layoutOpts","fx","extents","containers"], function(d3,layoutOpts,fx,extents,containers){return(
function drawLines(sX,sY,kin,ctx) {
  const k = (kin > 1 ? kin * 0.75 : kin);
  const lineGen = d3.line()
    .x( d => sX(d.X) )
    .y( d => sY(d.Y) )
    .curve(d3.curveNatural)
    .context(ctx);
  // Update Zeros
  if (layoutOpts.yaxis.zeroline || layoutOpts.xaxis.zeroline) {
    // draw zero lines
    if (layoutOpts.yaxis.zeroline){
      // draw y zero (horizontal)
      ctx.restore();
      ctx.beginPath();
      ctx.setLineDash(fx.strokeType("solid"));
      ctx.moveTo(sX(0), 0);
      ctx.lineTo(sX(0), extents.height);
      ctx.strokeStyle = layoutOpts.yaxis.zerolinecolor;
      ctx.lineWidth = 1.5*k;
      ctx.stroke();
      ctx.save();
    }
    if (layoutOpts.xaxis.zeroline){
      // draw x zero (vertical)
      ctx.restore();
      ctx.beginPath();
      ctx.setLineDash(fx.strokeType("solid"));
      ctx.moveTo(0,sY(0));
      ctx.lineTo(extents.width, sY(0));
      ctx.strokeStyle = layoutOpts.xaxis.zerolinecolor;
      ctx.lineWidth = 1.5*k;
      ctx.stroke();
      ctx.save();
      
    }
  }
  // DATA
  const elems = containers.databin.selectAll("custom.lines");
  elems.each( dat => {
    if(!/lines/gi.test(dat.mode)){ 
      return;
    }
    ctx.beginPath();
    lineGen( 
      dat.x.map( 
        (x,i) => ({'X':x, 'Y':dat.y[i]}) 
      ) 
    );
    ctx.lineWidth = dat.line.width*k;
    ctx.lineCap="round";
    ctx.setLineDash(fx.strokeType(dat.line.style).map( v => v*k ));
    ctx.strokeStyle = fx.rgb2A(dat.line.color, dat.line.hasOwnProperty("opacity") ? dat.line.opacity : 1);
    ctx.shadowOffsetX = 1.5*k;
    ctx.shadowOffsetY = 2.5*k;
    ctx.shadowBlur    = 5*k;
    ctx.shadowColor   = 'rgba(104, 104, 104, 0.25)';
    ctx.stroke();
  });
  
}
)});
  main.variable(observer()).define(["containers","d3"], function(containers,d3)
{
  const elems = containers.databin.selectAll("custom.lines");
  var out = [];
  elems.each( d => out.push(d.x));
  out = d3.extent(d3.merge(out));
  
  return out
}
);
  main.variable(observer("makeTooltip")).define("makeTooltip", ["d3","fx"], function(d3,fx){return(
function makeTooltip(tipObjArray,cx,direction) {
  if (!tipObjArray) return false;
  // Tooltips will be draw at <0,0> and thus need a transformation to move
  // Direction is relative to <0,0>, the point of growth.
  // Directions can be: nw,ne,sw,se... eventually n,s,w,e will be acceptable.
  const N = tipObjArray.length;
  const currentTransform = cx.getTransform();
  const contextDims = {
    x0: currentTransform.e,
    y0: currentTransform.f,
    width: cx.canvas.clientWidth,
    height: cx.canvas.clientHeight
  };
  
  const tipOfst = 19;
  const tipBetween = 10;
  const tipTextField = 66;
  const tipTextWidth = N * tipTextField + (N-1)*tipBetween;
  const tipBoxWidth = tipTextWidth + 2*tipOfst;
  const boxOfst = 10;
  const radiusOfst = 25;
  const tipDims = {width: tipBoxWidth+2*boxOfst, height: 80};
  const boxHeight = tipDims.height - 2*boxOfst - 4; //4 = 2px*2 for each border
  // animation properties
  const ease = d3.easeBounce;
  const dur = 200;
  // Scale pattern for directional positioning
  let sc = [1,1];
  
  switch (direction) {
    case "nw":
      sc = [-1,-1];
      break;
    case "ne":
      sc[1] = -1;
      break;
    case "se":
      // default do nothing with scale
      break;
    case "sw":
      sc[0] = -1;
      break;
  }
  // make the drawing data
  const pts = d3.range(10).map( v => ( {x:0, y:0}) );
  const box = [
      {x:   3, y:  3},
      {x:  radiusOfst, y: boxOfst},
      {x: tipDims.width-radiusOfst, y: boxOfst},
      {x: tipDims.width-boxOfst, y: radiusOfst},
      {x: tipDims.width-boxOfst, y: tipDims.height-radiusOfst},//55},
      {x: tipDims.width-radiusOfst, y: tipDims.height-boxOfst},//70},
      {x:  radiusOfst, y: tipDims.height-boxOfst},//70},
      {x:  boxOfst, y: tipDims.height-radiusOfst},//55},
      {x:  boxOfst, y: radiusOfst},
      {x:   3, y:  3}
    ];
  const r1 = 7;
  const r2 = 12;
  // COLORS  ----------------------!!
  // get the color stops
  let stops = d3.merge(d3.range(N).map( (v,i) => [v/N, v/N+1/(N**2)] ));
  stops.push(1);
  stops.splice(Math.floor(stops.length/2),1);
  stops = stops.reduce( (r,k,i) => (!(i%2) ? r.push([k]):r[r.length-1].push(k)) && r, []);
   
  let grad = cx.createLinearGradient(boxOfst+tipOfst,0,tipDims.width-boxOfst-tipOfst,0);
  stops.forEach( (arr,i) => {
    const ind = ( sc[0] === -1 ? N-1-i : i );
    grad.addColorStop(arr[0], fx.rgb2A(tipObjArray[ind].marker.color,0.16) );
    grad.addColorStop(arr[1], fx.rgb2A(tipObjArray[ind].marker.color,0.16) );
  } );
  const fillColor = grad;//"rgba(200,200,200,0.55)";
  const strokeColor = "rgba(150,150,150,0.65)";
  // --------------------------------------------!!
  
  animate();
  // FUNCTIONS ----------------------------------------------------->
  function draw() {
    //cx.restore();
    // clear the canvas
    cx.clearRect(-contextDims.x0,-contextDims.y0,contextDims.width,contextDims.height);
    // Draw the box
    cx.beginPath();
    cx.moveTo(pts[0].x,pts[0].y);
    cx.bezierCurveTo(pts[0].x+r1/2,pts[0].y+r1/2,pts[1].x-r1/2,pts[1].y, pts[1].x,pts[1].y);
    cx.lineTo(pts[2].x,pts[2].y);
    cx.bezierCurveTo(pts[2].x+r2,pts[2].y,pts[3].x,pts[3].y-r2,pts[3].x,pts[3].y);
    cx.lineTo(pts[4].x,pts[4].y);
    cx.bezierCurveTo(pts[4].x, pts[4].y+r2, pts[5].x+r2, pts[5].y, pts[5].x, pts[5].y);
    cx.lineTo(pts[6].x,pts[6].y);
    cx.bezierCurveTo(pts[6].x-r2, pts[6].y, pts[7].x, pts[7].y+r2, pts[7].x, pts[7].y);
    cx.lineTo(pts[8].x,pts[8].y);
    cx.bezierCurveTo(pts[8].x,pts[8].y-r1/2,pts[9].x+r1/2,pts[9].y, pts[9].x,pts[9].y);
    cx.closePath();
    cx.shadowOffsetX = 1.5;
    cx.shadowOffsetY = 2.5;
    cx.shadowBlur    = 5;
    cx.shadowColor   = 'rgba(104, 104, 104, 0.25)';
    cx.stroke();
    cx.fill();
    //cx.save();
  }
  
  function animate() {
    // Interpolates all the points from <0,0> to the tip box shape
    // store current source
    pts.forEach( (p,i) => {
      p.sx = p.x;
      p.sy = p.y;
      p.tx = box[i].x;
      p.ty = box[i].y;
    } );
    
    
    cx.beginPath();
    cx.strokeStyle = strokeColor;
    cx.fillStyle = fillColor;
    cx.lineWidth = 2;
    // move/scale according to direction
    //cx.translate(st[0],st[1]);
    cx.scale(sc[0],sc[1]);
    // clip the drawing to required tip bounds
    cx.save();
    cx.beginPath();
    cx.rect(0,0,tipDims.width,tipDims.height);
    cx.clip();
    // run animation
    var timer = d3.timer( (els) => {
      const t = Math.min(1,ease(els/dur));
      //interp
      pts.forEach( pt => {
        pt.x = pt.sx*(1-t) + pt.tx*t;
        pt.y = pt.sy*(1-t) + pt.ty*t;
      } );
      // update graph
      draw();
      
      if (t === 1) {
        timer.stop();
        //addText
        // need to flip back to normal for correct text
        
        cx.scale(sc[0],sc[1]);
        // draw the text elements
        cx.beginPath();
        for(let i=0; i<tipObjArray.length; i++){
          drawText(i);
        }
        
        // drop the clip and restore the canvas
        cx.restore();
        //console.log('x:'+('       '+tipObjArray[0].x.toPrecision(3)).slice(-7));
      }
    } );
    
  }
  function drawText(i){
    //X-position: make N spaces, 5px between and find the centers of the spaces
    const xPos = sc[0]*parseInt(tipTextField/2*(i+(i+1)) + i*tipBetween + tipOfst + boxOfst);
    //Y-position: contract the box by 20px, find 3 equal spots, then find the centers of each
    const ypad = 10;
    //var yPos = d3.range(3).map(v=> Math.round((boxHeight-20)/3*(v+(v+1)/3) + boxOfst + 10));
    var yPos = d3.range(3).map( v => ((boxHeight-2*ypad) * (4*v+1) / 9) + boxOfst+ypad)
    yPos = sc[1] < 0 ? yPos.reverse() : yPos;
    const ind = ( sc[0] === -1 ? N-1-i : i );
    const txDat = {
      id:'ID:'+('              '+tipObjArray[ind].name).slice(-9),
      x: 'x:'+('       '+tipObjArray[ind].x.toPrecision(3)).slice(-7),
      y: 'y:'+('       '+tipObjArray[ind].y.toPrecision(3)).slice(-7),
      color: tipObjArray[ind].marker.color//"rgba(10,10,10,0.9)"
    };
    // ID LABEL
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.font = "10pt Times New Roman";
    cx.fillStyle = txDat.color;
    cx.fillText(
      txDat.id, 
      xPos,//tipDims.width/2*0.99, 
      sc[1]*yPos[0]//tipDims.height/2*0.7
    );
    // X POSITION
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.font = "12pt Times New Roman";
    cx.fillText(
      txDat.x, 
      xPos,//tipDims.width/2*0.99, 
      sc[1]*yPos[1],//tipDims.height/2,
      66
    );
    // Y POSITION
    cx.font = "12pt Times New Roman";
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillText(
      txDat.y, 
      xPos,//tipDims.width/2*0.99, 
      sc[1]*yPos[2],//tipDims.height/2*1.25,
      66
    );
  }
  // <----------------------------------------------------------------
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`---
## GrObs`
)});
  main.variable(observer("gX")).define("gX", ["extents","xAxis"], function(extents,xAxis){return(
g => g
    .attr("transform", `translate(0,${extents.height})`)
    .attr("class", "axes x-axis")
    .call(xAxis)
)});
  main.variable(observer("gY")).define("gY", ["yAxis"], function(yAxis){return(
g => g
    .attr("class", "axes y-axis")
    .call(yAxis)
)});
  main.variable(observer("xlabeler")).define("xlabeler", ["XLABEL","extents"], function(XLABEL,extents){return(
g => {
  let xlab = g.selectAll("text")
    .data([{label:XLABEL}]);
  
  xlab.enter()
    .append("text")
      .attr("class", "x-label")
      .attr("y", extents.height-5)
      .attr("x",extents.height/13)
      .attr("fill", "rgba(60,60,60,0.6)")
      .attr("text-anchor","left")
      .attr("alignment-baseline","baseline")
    .merge(xlab)
      .text(d => d.label);
  
  xlab.exit().remove();
}
)});
  main.variable(observer("ylabeler")).define("ylabeler", ["YLABEL","extents"], function(YLABEL,extents){return(
g => {
  let ylab = g.selectAll("text")
    .data([{label:YLABEL}]);
  
  ylab.enter()
    .append("text")
      .attr("class", "y-label")
      .attr("transform", `rotate(-90)`)
      .attr("x", -extents.height*12/13)
      .attr("dy", 20)
      .attr("fill", "rgba(60,60,60,0.6)")
      .attr("text-anchor","left")
      .attr("alignment-baseline","baseline")
    .merge(ylab)
      .text(d => d.label);
  
  ylab.exit().remove();
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
---

## Scalers (not scalars)`
)});
  main.variable(observer("x")).define("x", ["fx","theData","extents"], function(fx,theData,extents){return(
fx.Scales(theData,extents).X
)});
  main.variable(observer("y")).define("y", ["fx","theData","extents"], function(fx,theData,extents){return(
fx.Scales(theData,extents).Y
)});
  main.variable(observer("xAxis")).define("xAxis", ["fx","theData","extents"], function(fx,theData,extents){return(
fx.Axes(theData,extents).X
)});
  main.variable(observer("yAxis")).define("yAxis", ["fx","theData","extents"], function(fx,theData,extents){return(
fx.Axes(theData,extents).Y
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
---

## Positionals`
)});
  main.variable(observer("extents")).define("extents", ["layoutOpts"], function(layoutOpts){return(
{
  width: layoutOpts.width - layoutOpts.margin.l - layoutOpts.margin.r,
  height: layoutOpts.height - layoutOpts.margin.t - layoutOpts.margin.b
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
---
## Data`
)});
  main.variable(observer("layoutOpts")).define("layoutOpts", function(){return(
{
  "autosize": false,
  "width": 1226/1.3,
  "height": 717/1.3,
  "yaxis": {
    "title": "Y Axis Title", 
    "ticks": "outside", 
    "showgrid": false, 
    "zerolinecolor": "rgba(174, 174, 174,0.45)",
    "zeroline": true,
    "showline": true, 
    "type": "linear", 
    "autorange": true
  }, 
  "paper_bgcolor": "rgba(255, 255, 255, 0)", 
  "plot_bgcolor": "rgba(255, 255, 255, 0)", 
  "showlegend": true, 
  "breakpoints": [], 
  "titlefont": {
    "family": "Times New Roman"
  }, 
  "xaxis": {
    "tickmode": "auto", 
    "title": "X Axis Title", 
    "ticks": "outside", 
    "autorange": true, 
    "zerolinecolor": "rgba(174, 174, 174,0.3)", 
    "mirror": false, 
    "zeroline": true, 
    "showline": true, 
    "showgrid": false, 
    "type": "linear", 
    "anchor": "y", 
    "side": "bottom"
  }, 
  "hovermode": "closest", 
  "font": {
    "family": "Times New Roman", 
    "size": 16
  }, 
  "margin": {
    "r": 25, 
    "b": 60, 
    "l": 60, 
    "t": 25
  }, 
  "showlegend": false
}
)});
  main.variable(observer("theData")).define("theData", ["dataSet","data","dataPt","data5"], function(dataSet,data,dataPt,data5)
{
  let d = [];
  switch (dataSet) {
    case "Two Lines":
      return data;
      break;
    case "Simple Points":
      return dataPt;
      break;
    case "Five Colors":
      return data5;
      break;
  }
  
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`---
## Data Sets`
)});
  main.variable(observer("data")).define("data", function(){return(
[
  {
    "line": {
      "color":"rgb(50,135,200)",
      "width":5,
      "opacity":0.6,
      "style": "solid"
    },
    "marker": {
      "symbol": "circle",
      "opacity": 0.4,
      "size": 8.0,
      "color": "rgb(50,135,200)",
      "maxdisplayed": 0
    },
    "name":"Line1",
    "type":"scatter",
    "mode":"lines",
    "x":[0.0000, 0.0010, 0.0020, 0.0030, 0.0040, 0.0050, 0.0060, 0.0070, 0.0080, 0.0090, 0.0100, 0.0110, 0.0120, 0.0130, 0.0140, 0.0150, 0.0160, 0.0170, 0.0180, 0.0190, 0.0200, 0.0210, 0.0220, 0.0230, 0.0240, 0.0250, 0.0260, 0.0270, 0.0280, 0.0290, 0.0300, 0.0310, 0.0320, 0.0330, 0.0340, 0.0350, 0.0360, 0.0370, 0.0380, 0.0390, 0.0400, 0.0410, 0.0420, 0.0430, 0.0440, 0.0450, 0.0460, 0.0470, 0.0480, 0.0490, 0.0500, 0.0510, 0.0520, 0.0530, 0.0540, 0.0550, 0.0560, 0.0570, 0.0580, 0.0590, 0.0600, 0.0610, 0.0620, 0.0630, 0.0640, 0.0650, 0.0660, 0.0670, 0.0680, 0.0690, 0.0700, 0.0710, 0.0720, 0.0730, 0.0740, 0.0750, 0.0760, 0.0770, 0.0780, 0.0790, 0.0800, 0.0810, 0.0820, 0.0830, 0.0840, 0.0850, 0.0860, 0.0870, 0.0880, 0.0890, 0.0900, 0.0910, 0.0920, 0.0930, 0.0940, 0.0950, 0.0960, 0.0970, 0.0980, 0.0990, 0.1000, 0.1010, 0.1020, 0.1030, 0.1040, 0.1050, 0.1060, 0.1070, 0.1080, 0.1090, 0.1100, 0.1110, 0.1120, 0.1130, 0.1140, 0.1150, 0.1160, 0.1170, 0.1180, 0.1190, 0.1200, 0.1210, 0.1220, 0.1230, 0.1240, 0.1250, 0.1260, 0.1270, 0.1280, 0.1290, 0.1300, 0.1310, 0.1320, 0.1330, 0.1340, 0.1350, 0.1360, 0.1370, 0.1380, 0.1390, 0.1400, 0.1410, 0.1420, 0.1430, 0.1440, 0.1450, 0.1460, 0.1470, 0.1480, 0.1490, 0.1500, 0.1510, 0.1520, 0.1530, 0.1540, 0.1550, 0.1560, 0.1570, 0.1580, 0.1590, 0.1600, 0.1610, 0.1620, 0.1630, 0.1640, 0.1650, 0.1660, 0.1670, 0.1680, 0.1690, 0.1700, 0.1710, 0.1720, 0.1730, 0.1740, 0.1750, 0.1760, 0.1770, 0.1780, 0.1790, 0.1800, 0.1810, 0.1820, 0.1830, 0.1840, 0.1850, 0.1860, 0.1870, 0.1880, 0.1890, 0.1900, 0.1910, 0.1920, 0.1930, 0.1940, 0.1950, 0.1960, 0.1970, 0.1980, 0.1990, 0.2000, 0.2010, 0.2020, 0.2030, 0.2040, 0.2050, 0.2060, 0.2070, 0.2080, 0.2090, 0.2100, 0.2110, 0.2120, 0.2130, 0.2140, 0.2150, 0.2160, 0.2170, 0.2180, 0.2190, 0.2200, 0.2210, 0.2220, 0.2230, 0.2240, 0.2250, 0.2260, 0.2270, 0.2280, 0.2290, 0.2300, 0.2310, 0.2320, 0.2330, 0.2340, 0.2350, 0.2360, 0.2370, 0.2380, 0.2390, 0.2400, 0.2410, 0.2420, 0.2430, 0.2440, 0.2450, 0.2460, 0.2470, 0.2480, 0.2490, 0.2500, 0.2510, 0.2520, 0.2530, 0.2540, 0.2550, 0.2560, 0.2570, 0.2580, 0.2590, 0.2600, 0.2610, 0.2620, 0.2630, 0.2640, 0.2650, 0.2660, 0.2670, 0.2680, 0.2690, 0.2700, 0.2710, 0.2720, 0.2730, 0.2740, 0.2750, 0.2760, 0.2770, 0.2780, 0.2790, 0.2800, 0.2810, 0.2820, 0.2830, 0.2840, 0.2850, 0.2860, 0.2870, 0.2880, 0.2890, 0.2900, 0.2910, 0.2920, 0.2930, 0.2940, 0.2950, 0.2960, 0.2970, 0.2980, 0.2990, 0.3000, 0.3010, 0.3020, 0.3030, 0.3040, 0.3050, 0.3060, 0.3070, 0.3080, 0.3090, 0.3100, 0.3110, 0.3120, 0.3130, 0.3140, 0.3150, 0.3160, 0.3170, 0.3180, 0.3190, 0.3200, 0.3210, 0.3220, 0.3230, 0.3240, 0.3250, 0.3260, 0.3270, 0.3280, 0.3290, 0.3300, 0.3310, 0.3320, 0.3330, 0.3340, 0.3350, 0.3360, 0.3370, 0.3380, 0.3390, 0.3400, 0.3410, 0.3420, 0.3430, 0.3440, 0.3450, 0.3460, 0.3470, 0.3480, 0.3490, 0.3500, 0.3510, 0.3520, 0.3530, 0.3540, 0.3550, 0.3560, 0.3570, 0.3580, 0.3590, 0.3600, 0.3610, 0.3620, 0.3630, 0.3640, 0.3650, 0.3660, 0.3670, 0.3680, 0.3690, 0.3700, 0.3710, 0.3720, 0.3730, 0.3740, 0.3750, 0.3760, 0.3770, 0.3780, 0.3790, 0.3800, 0.3810, 0.3820, 0.3830, 0.3840, 0.3850, 0.3860, 0.3870, 0.3880, 0.3890, 0.3900, 0.3910, 0.3920, 0.3930, 0.3940, 0.3950, 0.3960, 0.3970, 0.3980, 0.3990, 0.4000, 0.4010, 0.4020, 0.4030, 0.4040, 0.4050, 0.4060, 0.4070, 0.4080, 0.4090, 0.4100, 0.4110, 0.4120, 0.4130, 0.4140, 0.4150, 0.4160, 0.4170, 0.4180, 0.4190, 0.4200, 0.4210, 0.4220, 0.4230, 0.4240, 0.4250, 0.4260, 0.4270, 0.4280, 0.4290, 0.4300, 0.4310, 0.4320, 0.4330, 0.4340, 0.4350, 0.4360, 0.4370, 0.4380, 0.4390, 0.4400, 0.4410, 0.4420, 0.4430, 0.4440, 0.4450, 0.4460, 0.4470, 0.4480, 0.4490, 0.4500, 0.4510, 0.4520, 0.4530, 0.4540, 0.4550, 0.4560, 0.4570, 0.4580, 0.4590, 0.4600, 0.4610, 0.4620, 0.4630, 0.4640, 0.4650, 0.4660, 0.4670, 0.4680, 0.4690, 0.4700, 0.4710, 0.4720, 0.4730, 0.4740, 0.4750, 0.4760, 0.4770, 0.4780, 0.4790, 0.4800, 0.4810, 0.4820, 0.4830, 0.4840, 0.4850, 0.4860, 0.4870, 0.4880, 0.4890, 0.4900, 0.4910, 0.4920, 0.4930, 0.4940, 0.4950, 0.4960, 0.4970, 0.4980, 0.4990, 0.5000, 0.5010, 0.5020, 0.5030, 0.5040, 0.5050, 0.5060, 0.5070, 0.5080, 0.5090, 0.5100, 0.5110, 0.5120, 0.5130, 0.5140, 0.5150, 0.5160, 0.5170, 0.5180, 0.5190, 0.5200, 0.5210, 0.5220, 0.5230, 0.5240, 0.5250, 0.5260, 0.5270, 0.5280, 0.5290, 0.5300, 0.5310, 0.5320, 0.5330, 0.5340, 0.5350, 0.5360, 0.5370, 0.5380, 0.5390, 0.5400, 0.5410, 0.5420, 0.5430, 0.5440, 0.5450, 0.5460, 0.5470, 0.5480, 0.5490, 0.5500, 0.5510, 0.5520, 0.5530, 0.5540, 0.5550, 0.5560, 0.5570, 0.5580, 0.5590, 0.5600, 0.5610, 0.5620, 0.5630, 0.5640, 0.5650, 0.5660, 0.5670, 0.5680, 0.5690, 0.5700, 0.5710, 0.5720, 0.5730, 0.5740, 0.5750, 0.5760, 0.5770, 0.5780, 0.5790, 0.5800, 0.5810, 0.5820, 0.5830, 0.5840, 0.5850, 0.5860, 0.5870, 0.5880, 0.5890, 0.5900, 0.5910, 0.5920, 0.5930, 0.5940, 0.5950, 0.5960, 0.5970, 0.5980, 0.5990, 0.6000, 0.6010, 0.6020, 0.6030, 0.6040, 0.6050, 0.6060, 0.6070, 0.6080, 0.6090, 0.6100, 0.6110, 0.6120, 0.6130, 0.6140, 0.6150, 0.6160, 0.6170, 0.6180, 0.6190, 0.6200, 0.6210, 0.6220, 0.6230, 0.6240, 0.6250, 0.6260, 0.6270, 0.6280, 0.6290, 0.6300, 0.6310, 0.6320, 0.6330, 0.6340, 0.6350, 0.6360, 0.6370, 0.6380, 0.6390, 0.6400, 0.6410, 0.6420, 0.6430, 0.6440, 0.6450, 0.6460, 0.6470, 0.6480, 0.6490, 0.6500, 0.6510, 0.6520, 0.6530, 0.6540, 0.6550, 0.6560, 0.6570, 0.6580, 0.6590, 0.6600, 0.6610, 0.6620, 0.6630, 0.6640, 0.6650, 0.6660, 0.6670, 0.6680, 0.6690, 0.6700, 0.6710, 0.6720, 0.6730, 0.6740, 0.6750, 0.6760, 0.6770, 0.6780, 0.6790, 0.6800, 0.6810, 0.6820, 0.6830, 0.6840, 0.6850, 0.6860, 0.6870, 0.6880, 0.6890, 0.6900, 0.6910, 0.6920, 0.6930, 0.6940, 0.6950, 0.6960, 0.6970, 0.6980, 0.6990, 0.7000, 0.7010, 0.7020, 0.7030, 0.7040, 0.7050, 0.7060, 0.7070, 0.7080, 0.7090, 0.7100, 0.7110, 0.7120, 0.7130, 0.7140, 0.7150, 0.7160, 0.7170, 0.7180, 0.7190, 0.7200, 0.7210, 0.7220, 0.7230, 0.7240, 0.7250, 0.7260, 0.7270, 0.7280, 0.7290, 0.7300, 0.7310, 0.7320, 0.7330, 0.7340, 0.7350, 0.7360, 0.7370, 0.7380, 0.7390, 0.7400, 0.7410, 0.7420, 0.7430, 0.7440, 0.7450, 0.7460, 0.7470, 0.7480, 0.7490, 0.7500, 0.7510, 0.7520, 0.7530, 0.7540, 0.7550, 0.7560, 0.7570, 0.7580, 0.7590, 0.7600, 0.7610, 0.7620, 0.7630, 0.7640, 0.7650, 0.7660, 0.7670, 0.7680, 0.7690, 0.7700, 0.7710, 0.7720, 0.7730, 0.7740, 0.7750, 0.7760, 0.7770, 0.7780, 0.7790, 0.7800, 0.7810, 0.7820, 0.7830, 0.7840, 0.7850, 0.7860, 0.7870, 0.7880, 0.7890, 0.7900, 0.7910, 0.7920, 0.7930, 0.7940, 0.7950, 0.7960, 0.7970, 0.7980, 0.7990, 0.8000, 0.8010, 0.8020, 0.8030, 0.8040, 0.8050, 0.8060, 0.8070, 0.8080, 0.8090, 0.8100, 0.8110, 0.8120, 0.8130, 0.8140, 0.8150, 0.8160, 0.8170, 0.8180, 0.8190, 0.8200, 0.8210, 0.8220, 0.8230, 0.8240, 0.8250, 0.8260, 0.8270, 0.8280, 0.8290, 0.8300, 0.8310, 0.8320, 0.8330, 0.8340, 0.8350, 0.8360, 0.8370, 0.8380, 0.8390, 0.8400, 0.8410, 0.8420, 0.8430, 0.8440, 0.8450, 0.8460, 0.8470, 0.8480, 0.8490, 0.8500, 0.8510, 0.8520, 0.8530, 0.8540, 0.8550, 0.8560, 0.8570, 0.8580, 0.8590, 0.8600, 0.8610, 0.8620, 0.8630, 0.8640, 0.8650, 0.8660, 0.8670, 0.8680, 0.8690, 0.8700, 0.8710, 0.8720, 0.8730, 0.8740, 0.8750, 0.8760, 0.8770, 0.8780, 0.8790, 0.8800, 0.8810, 0.8820, 0.8830, 0.8840, 0.8850, 0.8860, 0.8870, 0.8880, 0.8890, 0.8900, 0.8910, 0.8920, 0.8930, 0.8940, 0.8950, 0.8960, 0.8970, 0.8980, 0.8990, 0.9000, 0.9010, 0.9020, 0.9030, 0.9040, 0.9050, 0.9060, 0.9070, 0.9080, 0.9090, 0.9100, 0.9110, 0.9120, 0.9130, 0.9140, 0.9150, 0.9160, 0.9170, 0.9180, 0.9190, 0.9200, 0.9210, 0.9220, 0.9230, 0.9240, 0.9250, 0.9260, 0.9270, 0.9280, 0.9290, 0.9300, 0.9310, 0.9320, 0.9330, 0.9340, 0.9350, 0.9360, 0.9370, 0.9380, 0.9390, 0.9400, 0.9410, 0.9420, 0.9430, 0.9440, 0.9450, 0.9460, 0.9470, 0.9480, 0.9490, 0.9500, 0.9510, 0.9520, 0.9530, 0.9540, 0.9550, 0.9560, 0.9570, 0.9580, 0.9590, 0.9600, 0.9610, 0.9620, 0.9630, 0.9640, 0.9650, 0.9660, 0.9670, 0.9680, 0.9690, 0.9700, 0.9710, 0.9720, 0.9730, 0.9740, 0.9750, 0.9760, 0.9770, 0.9780, 0.9790, 0.9800, 0.9810, 0.9820, 0.9830, 0.9840, 0.9850, 0.9860, 0.9870, 0.9880, 0.9890, 0.9900, 0.9910, 0.9920, 0.9930, 0.9940, 0.9950, 0.9960, 0.9970, 0.9980, 0.9990, 1.0000, 1.0010, 1.0020, 1.0030, 1.0040, 1.0050, 1.0060, 1.0070, 1.0080, 1.0090, 1.0100, 1.0110, 1.0120, 1.0130, 1.0140, 1.0150, 1.0160, 1.0170, 1.0180, 1.0190, 1.0200, 1.0210, 1.0220, 1.0230, 1.0240, 1.0250, 1.0260, 1.0270, 1.0280, 1.0290, 1.0300, 1.0310, 1.0320, 1.0330, 1.0340, 1.0350, 1.0360, 1.0370, 1.0380, 1.0390, 1.0400, 1.0410, 1.0420, 1.0430, 1.0440, 1.0450, 1.0460, 1.0470, 1.0480, 1.0490, 1.0500, 1.0510, 1.0520, 1.0530, 1.0540, 1.0550, 1.0560, 1.0570, 1.0580, 1.0590, 1.0600, 1.0610, 1.0620, 1.0630, 1.0640, 1.0650, 1.0660, 1.0670, 1.0680, 1.0690, 1.0700, 1.0710, 1.0720, 1.0730, 1.0740, 1.0750, 1.0760, 1.0770, 1.0780, 1.0790, 1.0800, 1.0810, 1.0820, 1.0830, 1.0840, 1.0850, 1.0860, 1.0870, 1.0880, 1.0890, 1.0900, 1.0910, 1.0920, 1.0930, 1.0940, 1.0950, 1.0960, 1.0970, 1.0980, 1.0990, 1.1000, 1.1010, 1.1020, 1.1030, 1.1040, 1.1050, 1.1060, 1.1070, 1.1080, 1.1090, 1.1100, 1.1110, 1.1120, 1.1130, 1.1140, 1.1150, 1.1160, 1.1170, 1.1180, 1.1190, 1.1200, 1.1210, 1.1220, 1.1230, 1.1240, 1.1250, 1.1260, 1.1270, 1.1280, 1.1290, 1.1300, 1.1310, 1.1320, 1.1330, 1.1340, 1.1350, 1.1360, 1.1370, 1.1380, 1.1390, 1.1400, 1.1410, 1.1420, 1.1430, 1.1440, 1.1450, 1.1460, 1.1470, 1.1480, 1.1490, 1.1500, 1.1510, 1.1520, 1.1530, 1.1540, 1.1550, 1.1560, 1.1570, 1.1580, 1.1590, 1.1600, 1.1610, 1.1620, 1.1630, 1.1640, 1.1650, 1.1660, 1.1670, 1.1680, 1.1690, 1.1700, 1.1710, 1.1720, 1.1730, 1.1740, 1.1750, 1.1760, 1.1770, 1.1780, 1.1790, 1.1800, 1.1810, 1.1820, 1.1830, 1.1840, 1.1850, 1.1860, 1.1870, 1.1880, 1.1890, 1.1900, 1.1910, 1.1920, 1.1930, 1.1940, 1.1950, 1.1960, 1.1970, 1.1980, 1.1990, 1.2000, 1.2010, 1.2020, 1.2030, 1.2040, 1.2050, 1.2060, 1.2070, 1.2080, 1.2090, 1.2100, 1.2110, 1.2120, 1.2130, 1.2140, 1.2150, 1.2160, 1.2170, 1.2180, 1.2190, 1.2200, 1.2210, 1.2220, 1.2230, 1.2240, 1.2250, 1.2260, 1.2270, 1.2280, 1.2290, 1.2300, 1.2310, 1.2320, 1.2330, 1.2340, 1.2350, 1.2360, 1.2370, 1.2380, 1.2390, 1.2400, 1.2410, 1.2420, 1.2430, 1.2440, 1.2450, 1.2460, 1.2470, 1.2480, 1.2490, 1.2500, 1.2510, 1.2520, 1.2530, 1.2540, 1.2550, 1.2560, 1.2570, 1.2580, 1.2590, 1.2600, 1.2610, 1.2620, 1.2630, 1.2640, 1.2650, 1.2660, 1.2670, 1.2680, 1.2690, 1.2700, 1.2710, 1.2720, 1.2730, 1.2740, 1.2750, 1.2760, 1.2770, 1.2780, 1.2790, 1.2800, 1.2810, 1.2820, 1.2830, 1.2840, 1.2850, 1.2860, 1.2870, 1.2880, 1.2890, 1.2900, 1.2910, 1.2920, 1.2930, 1.2940, 1.2950, 1.2960, 1.2970, 1.2980, 1.2990, 1.3000, 1.3010, 1.3020, 1.3030, 1.3040, 1.3050, 1.3060, 1.3070, 1.3080, 1.3090, 1.3100, 1.3110, 1.3120, 1.3130, 1.3140, 1.3150, 1.3160, 1.3170, 1.3180, 1.3190, 1.3200, 1.3210, 1.3220, 1.3230, 1.3240, 1.3250, 1.3260, 1.3270, 1.3280, 1.3290, 1.3300, 1.3310, 1.3320, 1.3330, 1.3340, 1.3350, 1.3360, 1.3370, 1.3380, 1.3390, 1.3400, 1.3410, 1.3420, 1.3430, 1.3440, 1.3450, 1.3460, 1.3470, 1.3480, 1.3490, 1.3500, 1.3510, 1.3520, 1.3530, 1.3540, 1.3550, 1.3560, 1.3570, 1.3580, 1.3590, 1.3600, 1.3610, 1.3620, 1.3630, 1.3640, 1.3650, 1.3660, 1.3670, 1.3680, 1.3690, 1.3700, 1.3710, 1.3720, 1.3730, 1.3740, 1.3750, 1.3760, 1.3770, 1.3780, 1.3790, 1.3800, 1.3810, 1.3820, 1.3830, 1.3840, 1.3850, 1.3860, 1.3870, 1.3880, 1.3890, 1.3900, 1.3910, 1.3920, 1.3930, 1.3940, 1.3950, 1.3960, 1.3970, 1.3980, 1.3990, 1.4000, 1.4010, 1.4020, 1.4030, 1.4040, 1.4050, 1.4060, 1.4070, 1.4080, 1.4090, 1.4100, 1.4110, 1.4120, 1.4130, 1.4140, 1.4150, 1.4160, 1.4170, 1.4180, 1.4190, 1.4200, 1.4210, 1.4220, 1.4230, 1.4240, 1.4250, 1.4260, 1.4270, 1.4280, 1.4290, 1.4300, 1.4310, 1.4320, 1.4330, 1.4340, 1.4350, 1.4360, 1.4370, 1.4380, 1.4390, 1.4400, 1.4410, 1.4420, 1.4430, 1.4440, 1.4450, 1.4460, 1.4470, 1.4480, 1.4490, 1.4500, 1.4510, 1.4520, 1.4530, 1.4540, 1.4550, 1.4560, 1.4570, 1.4580, 1.4590, 1.4600, 1.4610, 1.4620, 1.4630, 1.4640, 1.4650, 1.4660, 1.4670, 1.4680, 1.4690, 1.4700, 1.4710, 1.4720, 1.4730, 1.4740, 1.4750, 1.4760, 1.4770, 1.4780, 1.4790, 1.4800, 1.4810, 1.4820, 1.4830, 1.4840, 1.4850, 1.4860, 1.4870, 1.4880, 1.4890, 1.4900, 1.4910, 1.4920, 1.4930, 1.4940, 1.4950, 1.4960, 1.4970, 1.4980, 1.4990, 1.5000, 1.5010, 1.5020, 1.5030, 1.5040, 1.5050, 1.5060, 1.5070, 1.5080, 1.5090, 1.5100, 1.5110, 1.5120, 1.5130, 1.5140, 1.5150, 1.5160, 1.5170, 1.5180, 1.5190, 1.5200, 1.5210, 1.5220, 1.5230, 1.5240, 1.5250, 1.5260, 1.5270, 1.5280, 1.5290, 1.5300, 1.5310, 1.5320, 1.5330, 1.5340, 1.5350, 1.5360, 1.5370, 1.5380, 1.5390, 1.5400, 1.5410, 1.5420, 1.5430, 1.5440, 1.5450, 1.5460, 1.5470, 1.5480, 1.5490, 1.5500, 1.5510, 1.5520, 1.5530, 1.5540, 1.5550, 1.5560, 1.5570, 1.5580, 1.5590, 1.5600, 1.5610, 1.5620, 1.5630, 1.5640, 1.5650, 1.5660, 1.5670, 1.5680, 1.5690, 1.5700, 1.5710, 1.5720, 1.5730, 1.5740, 1.5750, 1.5760, 1.5770, 1.5780, 1.5790, 1.5800, 1.5810, 1.5820, 1.5830, 1.5840, 1.5850, 1.5860, 1.5870, 1.5880, 1.5890, 1.5900, 1.5910, 1.5920, 1.5930, 1.5940, 1.5950, 1.5960, 1.5970, 1.5980, 1.5990, 1.6000, 1.6010, 1.6020, 1.6030, 1.6040, 1.6050, 1.6060, 1.6070, 1.6080, 1.6090, 1.6100, 1.6110, 1.6120, 1.6130, 1.6140, 1.6150, 1.6160, 1.6170, 1.6180, 1.6190, 1.6200, 1.6210, 1.6220, 1.6230, 1.6240, 1.6250, 1.6260, 1.6270, 1.6280, 1.6290, 1.6300, 1.6310, 1.6320, 1.6330, 1.6340, 1.6350, 1.6360, 1.6370, 1.6380, 1.6390, 1.6400, 1.6410, 1.6420, 1.6430, 1.6440, 1.6450, 1.6460, 1.6470, 1.6480, 1.6490, 1.6500, 1.6510, 1.6520, 1.6530, 1.6540, 1.6550, 1.6560, 1.6570, 1.6580, 1.6590, 1.6600, 1.6610, 1.6620, 1.6630, 1.6640, 1.6650, 1.6660, 1.6670, 1.6680, 1.6690, 1.6700, 1.6710, 1.6720, 1.6730, 1.6740, 1.6750, 1.6760, 1.6770, 1.6780, 1.6790, 1.6800, 1.6810, 1.6820, 1.6830, 1.6840, 1.6850, 1.6860, 1.6870, 1.6880, 1.6890, 1.6900, 1.6910, 1.6920, 1.6930, 1.6940, 1.6950, 1.6960, 1.6970, 1.6980, 1.6990, 1.700].map(x => x-0.8),
    "y":[1.0000, 0.9998, 0.9993, 0.9984, 0.9972, 0.9956, 0.9936, 0.9913, 0.9887, 0.9856, 0.9823, 0.9786, 0.9745, 0.9701, 0.9654, 0.9603, 0.9549, 0.9491, 0.9430, 0.9365, 0.9298, 0.9227, 0.9152, 0.9075, 0.8994, 0.8910, 0.8823, 0.8733, 0.8639, 0.8543, 0.8443, 0.8341, 0.8235, 0.8127, 0.8016, 0.7902, 0.7785, 0.7665, 0.7543, 0.7417, 0.7290, 0.7159, 0.7026, 0.6891, 0.6753, 0.6613, 0.6471, 0.6326, 0.6179, 0.6029, 0.5878, 0.5724, 0.5569, 0.5411, 0.5252, 0.5090, 0.4927, 0.4762, 0.4596, 0.4428, 0.4258, 0.4086, 0.3914, 0.3740, 0.3564, 0.3387, 0.3209, 0.3030, 0.2850, 0.2669, 0.2487, 0.2304, 0.2120, 0.1935, 0.1750, 0.1564, 0.1378, 0.1191, 0.1004, 0.0816, 0.0628, 0.0440, 0.0251, 0.0063, -0.0126, -0.0314, -0.0502, -0.0691, -0.0879, -0.1066, -0.1253, -0.1440, -0.1626, -0.1812, -0.1997, -0.2181, -0.2365, -0.2548, -0.2730, -0.2910, -0.3090, -0.3269, -0.3446, -0.3623, -0.3798, -0.3971, -0.4144, -0.4315, -0.4484, -0.4652, -0.4818, -0.4982, -0.5144, -0.5305, -0.5464, -0.5621, -0.5776, -0.5929, -0.6079, -0.6228, -0.6374, -0.6518, -0.6660, -0.6800, -0.6937, -0.7071, -0.7203, -0.7333, -0.7459, -0.7584, -0.7705, -0.7824, -0.7940, -0.8053, -0.8163, -0.8271, -0.8375, -0.8477, -0.8575, -0.8671, -0.8763, -0.8852, -0.8938, -0.9021, -0.9101, -0.9178, -0.9251, -0.9321, -0.9387, -0.9451, -0.9511, -0.9567, -0.9620, -0.9670, -0.9716, -0.9759, -0.9799, -0.9834, -0.9867, -0.9896, -0.9921, -0.9943, -0.9961, -0.9976, -0.9987, -0.9995, -0.9999, -1.0000, -0.9997, -0.9990, -0.9980, -0.9967, -0.9950, -0.9929, -0.9905, -0.9877, -0.9846, -0.9811, -0.9773, -0.9731, -0.9686, -0.9637, -0.9585, -0.9530, -0.9471, -0.9409, -0.9343, -0.9274, -0.9202, -0.9127, -0.9048, -0.8966, -0.8881, -0.8793, -0.8702, -0.8607, -0.8510, -0.8409, -0.8306, -0.8200, -0.8090, -0.7978, -0.7863, -0.7745, -0.7624, -0.7501, -0.7375, -0.7247, -0.7115, -0.6982, -0.6845, -0.6707, -0.6566, -0.6423, -0.6277, -0.6129, -0.5979, -0.5827, -0.5673, -0.5516, -0.5358, -0.5198, -0.5036, -0.4873, -0.4707, -0.4540, -0.4371, -0.4201, -0.4029, -0.3856, -0.3681, -0.3505, -0.3328, -0.3150, -0.2970, -0.2790, -0.2608, -0.2426, -0.2243, -0.2059, -0.1874, -0.1688, -0.1502, -0.1316, -0.1129, -0.0941, -0.0753, -0.0565, -0.0377, -0.0188, -0.0000, 0.0188, 0.0377, 0.0565, 0.0753, 0.0941, 0.1129, 0.1316, 0.1502, 0.1688, 0.1874, 0.2059, 0.2243, 0.2426, 0.2608, 0.2790, 0.2970, 0.3150, 0.3328, 0.3505, 0.3681, 0.3856, 0.4029, 0.4201, 0.4371, 0.4540, 0.4707, 0.4873, 0.5036, 0.5198, 0.5358, 0.5516, 0.5673, 0.5827, 0.5979, 0.6129, 0.6277, 0.6423, 0.6566, 0.6707, 0.6845, 0.6982, 0.7115, 0.7247, 0.7375, 0.7501, 0.7624, 0.7745, 0.7863, 0.7978, 0.8090, 0.8200, 0.8306, 0.8409, 0.8510, 0.8607, 0.8702, 0.8793, 0.8881, 0.8966, 0.9048, 0.9127, 0.9202, 0.9274, 0.9343, 0.9409, 0.9471, 0.9530, 0.9585, 0.9637, 0.9686, 0.9731, 0.9773, 0.9811, 0.9846, 0.9877, 0.9905, 0.9929, 0.9950, 0.9967, 0.9980, 0.9990, 0.9997, 1.0000, 0.9999, 0.9995, 0.9987, 0.9976, 0.9961, 0.9943, 0.9921, 0.9896, 0.9867, 0.9834, 0.9799, 0.9759, 0.9716, 0.9670, 0.9620, 0.9567, 0.9511, 0.9451, 0.9387, 0.9321, 0.9251, 0.9178, 0.9101, 0.9021, 0.8938, 0.8852, 0.8763, 0.8671, 0.8575, 0.8477, 0.8375, 0.8271, 0.8163, 0.8053, 0.7940, 0.7824, 0.7705, 0.7584, 0.7459, 0.7333, 0.7203, 0.7071, 0.6937, 0.6800, 0.6660, 0.6518, 0.6374, 0.6228, 0.6079, 0.5929, 0.5776, 0.5621, 0.5464, 0.5305, 0.5144, 0.4982, 0.4818, 0.4652, 0.4484, 0.4315, 0.4144, 0.3971, 0.3798, 0.3623, 0.3446, 0.3269, 0.3090, 0.2910, 0.2730, 0.2548, 0.2365, 0.2181, 0.1997, 0.1812, 0.1626, 0.1440, 0.1253, 0.1066, 0.0879, 0.0691, 0.0502, 0.0314, 0.0126, -0.0063, -0.0251, -0.0440, -0.0628, -0.0816, -0.1004, -0.1191, -0.1378, -0.1564, -0.1750, -0.1935, -0.2120, -0.2304, -0.2487, -0.2669, -0.2850, -0.3030, -0.3209, -0.3387, -0.3564, -0.3740, -0.3914, -0.4086, -0.4258, -0.4428, -0.4596, -0.4762, -0.4927, -0.5090, -0.5252, -0.5411, -0.5569, -0.5724, -0.5878, -0.6029, -0.6179, -0.6326, -0.6471, -0.6613, -0.6753, -0.6891, -0.7026, -0.7159, -0.7290, -0.7417, -0.7543, -0.7665, -0.7785, -0.7902, -0.8016, -0.8127, -0.8235, -0.8341, -0.8443, -0.8543, -0.8639, -0.8733, -0.8823, -0.8910, -0.8994, -0.9075, -0.9152, -0.9227, -0.9298, -0.9365, -0.9430, -0.9491, -0.9549, -0.9603, -0.9654, -0.9701, -0.9745, -0.9786, -0.9823, -0.9856, -0.9887, -0.9913, -0.9936, -0.9956, -0.9972, -0.9984, -0.9993, -0.9998, -1.0000, -0.9998, -0.9993, -0.9984, -0.9972, -0.9956, -0.9936, -0.9913, -0.9887, -0.9856, -0.9823, -0.9786, -0.9745, -0.9701, -0.9654, -0.9603, -0.9549, -0.9491, -0.9430, -0.9365, -0.9298, -0.9227, -0.9152, -0.9075, -0.8994, -0.8910, -0.8823, -0.8733, -0.8639, -0.8543, -0.8443, -0.8341, -0.8235, -0.8127, -0.8016, -0.7902, -0.7785, -0.7665, -0.7543, -0.7417, -0.7290, -0.7159, -0.7026, -0.6891, -0.6753, -0.6613, -0.6471, -0.6326, -0.6179, -0.6029, -0.5878, -0.5724, -0.5569, -0.5411, -0.5252, -0.5090, -0.4927, -0.4762, -0.4596, -0.4428, -0.4258, -0.4086, -0.3914, -0.3740, -0.3564, -0.3387, -0.3209, -0.3030, -0.2850, -0.2669, -0.2487, -0.2304, -0.2120, -0.1935, -0.1750, -0.1564, -0.1378, -0.1191, -0.1004, -0.0816, -0.0628, -0.0440, -0.0251, -0.0063, 0.0126, 0.0314, 0.0502, 0.0691, 0.0879, 0.1066, 0.1253, 0.1440, 0.1626, 0.1812, 0.1997, 0.2181, 0.2365, 0.2548, 0.2730, 0.2910, 0.3090, 0.3269, 0.3446, 0.3623, 0.3798, 0.3971, 0.4144, 0.4315, 0.4484, 0.4652, 0.4818, 0.4982, 0.5144, 0.5305, 0.5464, 0.5621, 0.5776, 0.5929, 0.6079, 0.6228, 0.6374, 0.6518, 0.6660, 0.6800, 0.6937, 0.7071, 0.7203, 0.7333, 0.7459, 0.7584, 0.7705, 0.7824, 0.7940, 0.8053, 0.8163, 0.8271, 0.8375, 0.8477, 0.8575, 0.8671, 0.8763, 0.8852, 0.8938, 0.9021, 0.9101, 0.9178, 0.9251, 0.9321, 0.9387, 0.9451, 0.9511, 0.9567, 0.9620, 0.9670, 0.9716, 0.9759, 0.9799, 0.9834, 0.9867, 0.9896, 0.9921, 0.9943, 0.9961, 0.9976, 0.9987, 0.9995, 0.9999, 1.0000, 0.9997, 0.9990, 0.9980, 0.9967, 0.9950, 0.9929, 0.9905, 0.9877, 0.9846, 0.9811, 0.9773, 0.9731, 0.9686, 0.9637, 0.9585, 0.9530, 0.9471, 0.9409, 0.9343, 0.9274, 0.9202, 0.9127, 0.9048, 0.8966, 0.8881, 0.8793, 0.8702, 0.8607, 0.8510, 0.8409, 0.8306, 0.8200, 0.8090, 0.7978, 0.7863, 0.7745, 0.7624, 0.7501, 0.7375, 0.7247, 0.7115, 0.6982, 0.6845, 0.6707, 0.6566, 0.6423, 0.6277, 0.6129, 0.5979, 0.5827, 0.5673, 0.5516, 0.5358, 0.5198, 0.5036, 0.4873, 0.4707, 0.4540, 0.4371, 0.4201, 0.4029, 0.3856, 0.3681, 0.3505, 0.3328, 0.3150, 0.2970, 0.2790, 0.2608, 0.2426, 0.2243, 0.2059, 0.1874, 0.1688, 0.1502, 0.1316, 0.1129, 0.0941, 0.0753, 0.0565, 0.0377, 0.0188, 0.0000, -0.0188, -0.0377, -0.0565, -0.0753, -0.0941, -0.1129, -0.1316, -0.1502, -0.1688, -0.1874, -0.2059, -0.2243, -0.2426, -0.2608, -0.2790, -0.2970, -0.3150, -0.3328, -0.3505, -0.3681, -0.3856, -0.4029, -0.4201, -0.4371, -0.4540, -0.4707, -0.4873, -0.5036, -0.5198, -0.5358, -0.5516, -0.5673, -0.5827, -0.5979, -0.6129, -0.6277, -0.6423, -0.6566, -0.6707, -0.6845, -0.6982, -0.7115, -0.7247, -0.7375, -0.7501, -0.7624, -0.7745, -0.7863, -0.7978, -0.8090, -0.8200, -0.8306, -0.8409, -0.8510, -0.8607, -0.8702, -0.8793, -0.8881, -0.8966, -0.9048, -0.9127, -0.9202, -0.9274, -0.9343, -0.9409, -0.9471, -0.9530, -0.9585, -0.9637, -0.9686, -0.9731, -0.9773, -0.9811, -0.9846, -0.9877, -0.9905, -0.9929, -0.9950, -0.9967, -0.9980, -0.9990, -0.9997, -1.0000, -0.9999, -0.9995, -0.9987, -0.9976, -0.9961, -0.9943, -0.9921, -0.9896, -0.9867, -0.9834, -0.9799, -0.9759, -0.9716, -0.9670, -0.9620, -0.9567, -0.9511, -0.9451, -0.9387, -0.9321, -0.9251, -0.9178, -0.9101, -0.9021, -0.8938, -0.8852, -0.8763, -0.8671, -0.8575, -0.8477, -0.8375, -0.8271, -0.8163, -0.8053, -0.7940, -0.7824, -0.7705, -0.7584, -0.7459, -0.7333, -0.7203, -0.7071, -0.6937, -0.6800, -0.6660, -0.6518, -0.6374, -0.6228, -0.6079, -0.5929, -0.5776, -0.5621, -0.5464, -0.5305, -0.5144, -0.4982, -0.4818, -0.4652, -0.4484, -0.4315, -0.4144, -0.3971, -0.3798, -0.3623, -0.3446, -0.3269, -0.3090, -0.2910, -0.2730, -0.2548, -0.2365, -0.2181, -0.1997, -0.1812, -0.1626, -0.1440, -0.1253, -0.1066, -0.0879, -0.0691, -0.0502, -0.0314, -0.0126, 0.0063, 0.0251, 0.0440, 0.0628, 0.0816, 0.1004, 0.1191, 0.1378, 0.1564, 0.1750, 0.1935, 0.2120, 0.2304, 0.2487, 0.2669, 0.2850, 0.3030, 0.3209, 0.3387, 0.3564, 0.3740, 0.3914, 0.4086, 0.4258, 0.4428, 0.4596, 0.4762, 0.4927, 0.5090, 0.5252, 0.5411, 0.5569, 0.5724, 0.5878, 0.6029, 0.6179, 0.6326, 0.6471, 0.6613, 0.6753, 0.6891, 0.7026, 0.7159, 0.7290, 0.7417, 0.7543, 0.7665, 0.7785, 0.7902, 0.8016, 0.8127, 0.8235, 0.8341, 0.8443, 0.8543, 0.8639, 0.8733, 0.8823, 0.8910, 0.8994, 0.9075, 0.9152, 0.9227, 0.9298, 0.9365, 0.9430, 0.9491, 0.9549, 0.9603, 0.9654, 0.9701, 0.9745, 0.9786, 0.9823, 0.9856, 0.9887, 0.9913, 0.9936, 0.9956, 0.9972, 0.9984, 0.9993, 0.9998, 1.0000, 0.9998, 0.9993, 0.9984, 0.9972, 0.9956, 0.9936, 0.9913, 0.9887, 0.9856, 0.9823, 0.9786, 0.9745, 0.9701, 0.9654, 0.9603, 0.9549, 0.9491, 0.9430, 0.9365, 0.9298, 0.9227, 0.9152, 0.9075, 0.8994, 0.8910, 0.8823, 0.8733, 0.8639, 0.8543, 0.8443, 0.8341, 0.8235, 0.8127, 0.8016, 0.7902, 0.7785, 0.7665, 0.7543, 0.7417, 0.7290, 0.7159, 0.7026, 0.6891, 0.6753, 0.6613, 0.6471, 0.6326, 0.6179, 0.6029, 0.5878, 0.5724, 0.5569, 0.5411, 0.5252, 0.5090, 0.4927, 0.4762, 0.4596, 0.4428, 0.4258, 0.4086, 0.3914, 0.3740, 0.3564, 0.3387, 0.3209, 0.3030, 0.2850, 0.2669, 0.2487, 0.2304, 0.2120, 0.1935, 0.1750, 0.1564, 0.1378, 0.1191, 0.1004, 0.0816, 0.0628, 0.0440, 0.0251, 0.0063, -0.0126, -0.0314, -0.0502, -0.0691, -0.0879, -0.1066, -0.1253, -0.1440, -0.1626, -0.1812, -0.1997, -0.2181, -0.2365, -0.2548, -0.2730, -0.2910, -0.3090, -0.3269, -0.3446, -0.3623, -0.3798, -0.3971, -0.4144, -0.4315, -0.4484, -0.4652, -0.4818, -0.4982, -0.5144, -0.5305, -0.5464, -0.5621, -0.5776, -0.5929, -0.6079, -0.6228, -0.6374, -0.6518, -0.6660, -0.6800, -0.6937, -0.7071, -0.7203, -0.7333, -0.7459, -0.7584, -0.7705, -0.7824, -0.7940, -0.8053, -0.8163, -0.8271, -0.8375, -0.8477, -0.8575, -0.8671, -0.8763, -0.8852, -0.8938, -0.9021, -0.9101, -0.9178, -0.9251, -0.9321, -0.9387, -0.9451, -0.9511, -0.9567, -0.9620, -0.9670, -0.9716, -0.9759, -0.9799, -0.9834, -0.9867, -0.9896, -0.9921, -0.9943, -0.9961, -0.9976, -0.9987, -0.9995, -0.9999, -1.0000, -0.9997, -0.9990, -0.9980, -0.9967, -0.9950, -0.9929, -0.9905, -0.9877, -0.9846, -0.9811, -0.9773, -0.9731, -0.9686, -0.9637, -0.9585, -0.9530, -0.9471, -0.9409, -0.9343, -0.9274, -0.9202, -0.9127, -0.9048, -0.8966, -0.8881, -0.8793, -0.8702, -0.8607, -0.8510, -0.8409, -0.8306, -0.8200, -0.8090, -0.7978, -0.7863, -0.7745, -0.7624, -0.7501, -0.7375, -0.7247, -0.7115, -0.6982, -0.6845, -0.6707, -0.6566, -0.6423, -0.6277, -0.6129, -0.5979, -0.5827, -0.5673, -0.5516, -0.5358, -0.5198, -0.5036, -0.4873, -0.4707, -0.4540, -0.4371, -0.4201, -0.4029, -0.3856, -0.3681, -0.3505, -0.3328, -0.3150, -0.2970, -0.2790, -0.2608, -0.2426, -0.2243, -0.2059, -0.1874, -0.1688, -0.1502, -0.1316, -0.1129, -0.0941, -0.0753, -0.0565, -0.0377, -0.0188, -0.0000, 0.0188, 0.0377, 0.0565, 0.0753, 0.0941, 0.1129, 0.1316, 0.1502, 0.1688, 0.1874, 0.2059, 0.2243, 0.2426, 0.2608, 0.2790, 0.2970, 0.3150, 0.3328, 0.3505, 0.3681, 0.3856, 0.4029, 0.4201, 0.4371, 0.4540, 0.4707, 0.4873, 0.5036, 0.5198, 0.5358, 0.5516, 0.5673, 0.5827, 0.5979, 0.6129, 0.6277, 0.6423, 0.6566, 0.6707, 0.6845, 0.6982, 0.7115, 0.7247, 0.7375, 0.7501, 0.7624, 0.7745, 0.7863, 0.7978, 0.8090, 0.8200, 0.8306, 0.8409, 0.8510, 0.8607, 0.8702, 0.8793, 0.8881, 0.8966, 0.9048, 0.9127, 0.9202, 0.9274, 0.9343, 0.9409, 0.9471, 0.9530, 0.9585, 0.9637, 0.9686, 0.9731, 0.9773, 0.9811, 0.9846, 0.9877, 0.9905, 0.9929, 0.9950, 0.9967, 0.9980, 0.9990, 0.9997, 1.0000, 0.9999, 0.9995, 0.9987, 0.9976, 0.9961, 0.9943, 0.9921, 0.9896, 0.9867, 0.9834, 0.9799, 0.9759, 0.9716, 0.9670, 0.9620, 0.9567, 0.9511, 0.9451, 0.9387, 0.9321, 0.9251, 0.9178, 0.9101, 0.9021, 0.8938, 0.8852, 0.8763, 0.8671, 0.8575, 0.8477, 0.8375, 0.8271, 0.8163, 0.8053, 0.7940, 0.7824, 0.7705, 0.7584, 0.7459, 0.7333, 0.7203, 0.7071, 0.6937, 0.6800, 0.6660, 0.6518, 0.6374, 0.6228, 0.6079, 0.5929, 0.5776, 0.5621, 0.5464, 0.5305, 0.5144, 0.4982, 0.4818, 0.4652, 0.4484, 0.4315, 0.4144, 0.3971, 0.3798, 0.3623, 0.3446, 0.3269, 0.3090, 0.2910, 0.2730, 0.2548, 0.2365, 0.2181, 0.1997, 0.1812, 0.1626, 0.1440, 0.1253, 0.1066, 0.0879, 0.0691, 0.0502, 0.0314, 0.0126, -0.0063, -0.0251, -0.0440, -0.0628, -0.0816, -0.1004, -0.1191, -0.1378, -0.1564, -0.1750, -0.1935, -0.2120, -0.2304, -0.2487, -0.2669, -0.2850, -0.3030, -0.3209, -0.3387, -0.3564, -0.3740, -0.3914, -0.4086, -0.4258, -0.4428, -0.4596, -0.4762, -0.4927, -0.5090, -0.5252, -0.5411, -0.5569, -0.5724, -0.5878, -0.6029, -0.6179, -0.6326, -0.6471, -0.6613, -0.6753, -0.6891, -0.7026, -0.7159, -0.7290, -0.7417, -0.7543, -0.7665, -0.7785, -0.7902, -0.8016, -0.8127, -0.8235, -0.8341, -0.8443, -0.8543, -0.8639, -0.8733, -0.8823, -0.8910, -0.8994, -0.9075, -0.9152, -0.9227, -0.9298, -0.9365, -0.9430, -0.9491, -0.9549, -0.9603, -0.9654, -0.9701, -0.9745, -0.9786, -0.9823, -0.9856, -0.9887, -0.9913, -0.9936, -0.9956, -0.9972, -0.9984, -0.9993, -0.9998, -1.0000, -0.9998, -0.9993, -0.9984, -0.9972, -0.9956, -0.9936, -0.9913, -0.9887, -0.9856, -0.9823, -0.9786, -0.9745, -0.9701, -0.9654, -0.9603, -0.9549, -0.9491, -0.9430, -0.9365, -0.9298, -0.9227, -0.9152, -0.9075, -0.8994, -0.8910, -0.8823, -0.8733, -0.8639, -0.8543, -0.8443, -0.8341, -0.8235, -0.8127, -0.8016, -0.7902, -0.7785, -0.7665, -0.7543, -0.7417, -0.7290, -0.7159, -0.7026, -0.6891, -0.6753, -0.6613, -0.6471, -0.6326, -0.6179, -0.6029, -0.5878, -0.5724, -0.5569, -0.5411, -0.5252, -0.5090, -0.4927, -0.4762, -0.4596, -0.4428, -0.4258, -0.4086, -0.3914, -0.3740, -0.3564, -0.3387, -0.3209, -0.3030, -0.2850, -0.2669, -0.2487, -0.2304, -0.2120, -0.1935, -0.1750, -0.1564, -0.1378, -0.1191, -0.1004, -0.0816, -0.0628, -0.0440, -0.0251, -0.0063, 0.0126, 0.0314, 0.0502, 0.0691, 0.0879, 0.1066, 0.1253, 0.1440, 0.1626, 0.1812, 0.1997, 0.2181, 0.2365, 0.2548, 0.2730, 0.2910, 0.3090, 0.3269, 0.3446, 0.3623, 0.3798, 0.3971, 0.4144, 0.4315, 0.4484, 0.4652, 0.4818, 0.4982, 0.5144, 0.5305, 0.5464, 0.5621, 0.5776, 0.5929, 0.6079, 0.6228, 0.6374, 0.6518, 0.6660, 0.6800, 0.6937, 0.7071, 0.7203, 0.7333, 0.7459, 0.7584, 0.7705, 0.7824, 0.7940, 0.8053, 0.8163, 0.8271, 0.8375, 0.8477, 0.8575, 0.8671, 0.8763, 0.8852, 0.8938, 0.9021, 0.9101, 0.9178, 0.9251, 0.9321, 0.9387, 0.9451, 0.9511, 0.9567, 0.9620, 0.9670, 0.9716, 0.9759, 0.9799, 0.9834, 0.9867, 0.9896, 0.9921, 0.9943, 0.9961, 0.9976, 0.9987, 0.9995, 0.9999, 1.0000, 0.9997, 0.9990, 0.9980, 0.9967, 0.9950, 0.9929, 0.9905, 0.9877, 0.9846, 0.9811, 0.9773, 0.9731, 0.9686, 0.9637, 0.9585, 0.9530, 0.9471, 0.9409, 0.9343, 0.9274, 0.9202, 0.9127, 0.9048, 0.8966, 0.8881, 0.8793, 0.8702, 0.8607, 0.8510, 0.8409, 0.8306, 0.8200, 0.8090]
  },
  {
    "line": {
      "color":"rgba(200,100,32)",
      "width":5,
      "opacity":0.6,
      "style": "solid"
    },
    "marker": {
      "symbol": "circle",
      "opacity": 0.6,
      "size": 8.0,
      "color": "rgba(200,100,32,0.8)",
      "maxdisplayed": 0
    },
    "name":"Line2",
    "type":"scatter",
    "mode":"lines",
    "x":[0.0000, 0.0010, 0.0020, 0.0030, 0.0040, 0.0050, 0.0060, 0.0070, 0.0080, 0.0090, 0.0100, 0.0110, 0.0120, 0.0130, 0.0140, 0.0150, 0.0160, 0.0170, 0.0180, 0.0190, 0.0200, 0.0210, 0.0220, 0.0230, 0.0240, 0.0250, 0.0260, 0.0270, 0.0280, 0.0290, 0.0300, 0.0310, 0.0320, 0.0330, 0.0340, 0.0350, 0.0360, 0.0370, 0.0380, 0.0390, 0.0400, 0.0410, 0.0420, 0.0430, 0.0440, 0.0450, 0.0460, 0.0470, 0.0480, 0.0490, 0.0500, 0.0510, 0.0520, 0.0530, 0.0540, 0.0550, 0.0560, 0.0570, 0.0580, 0.0590, 0.0600, 0.0610, 0.0620, 0.0630, 0.0640, 0.0650, 0.0660, 0.0670, 0.0680, 0.0690, 0.0700, 0.0710, 0.0720, 0.0730, 0.0740, 0.0750, 0.0760, 0.0770, 0.0780, 0.0790, 0.0800, 0.0810, 0.0820, 0.0830, 0.0840, 0.0850, 0.0860, 0.0870, 0.0880, 0.0890, 0.0900, 0.0910, 0.0920, 0.0930, 0.0940, 0.0950, 0.0960, 0.0970, 0.0980, 0.0990, 0.1000, 0.1010, 0.1020, 0.1030, 0.1040, 0.1050, 0.1060, 0.1070, 0.1080, 0.1090, 0.1100, 0.1110, 0.1120, 0.1130, 0.1140, 0.1150, 0.1160, 0.1170, 0.1180, 0.1190, 0.1200, 0.1210, 0.1220, 0.1230, 0.1240, 0.1250, 0.1260, 0.1270, 0.1280, 0.1290, 0.1300, 0.1310, 0.1320, 0.1330, 0.1340, 0.1350, 0.1360, 0.1370, 0.1380, 0.1390, 0.1400, 0.1410, 0.1420, 0.1430, 0.1440, 0.1450, 0.1460, 0.1470, 0.1480, 0.1490, 0.1500, 0.1510, 0.1520, 0.1530, 0.1540, 0.1550, 0.1560, 0.1570, 0.1580, 0.1590, 0.1600, 0.1610, 0.1620, 0.1630, 0.1640, 0.1650, 0.1660, 0.1670, 0.1680, 0.1690, 0.1700, 0.1710, 0.1720, 0.1730, 0.1740, 0.1750, 0.1760, 0.1770, 0.1780, 0.1790, 0.1800, 0.1810, 0.1820, 0.1830, 0.1840, 0.1850, 0.1860, 0.1870, 0.1880, 0.1890, 0.1900, 0.1910, 0.1920, 0.1930, 0.1940, 0.1950, 0.1960, 0.1970, 0.1980, 0.1990, 0.2000, 0.2010, 0.2020, 0.2030, 0.2040, 0.2050, 0.2060, 0.2070, 0.2080, 0.2090, 0.2100, 0.2110, 0.2120, 0.2130, 0.2140, 0.2150, 0.2160, 0.2170, 0.2180, 0.2190, 0.2200, 0.2210, 0.2220, 0.2230, 0.2240, 0.2250, 0.2260, 0.2270, 0.2280, 0.2290, 0.2300, 0.2310, 0.2320, 0.2330, 0.2340, 0.2350, 0.2360, 0.2370, 0.2380, 0.2390, 0.2400, 0.2410, 0.2420, 0.2430, 0.2440, 0.2450, 0.2460, 0.2470, 0.2480, 0.2490, 0.2500, 0.2510, 0.2520, 0.2530, 0.2540, 0.2550, 0.2560, 0.2570, 0.2580, 0.2590, 0.2600, 0.2610, 0.2620, 0.2630, 0.2640, 0.2650, 0.2660, 0.2670, 0.2680, 0.2690, 0.2700, 0.2710, 0.2720, 0.2730, 0.2740, 0.2750, 0.2760, 0.2770, 0.2780, 0.2790, 0.2800, 0.2810, 0.2820, 0.2830, 0.2840, 0.2850, 0.2860, 0.2870, 0.2880, 0.2890, 0.2900, 0.2910, 0.2920, 0.2930, 0.2940, 0.2950, 0.2960, 0.2970, 0.2980, 0.2990, 0.3000, 0.3010, 0.3020, 0.3030, 0.3040, 0.3050, 0.3060, 0.3070, 0.3080, 0.3090, 0.3100, 0.3110, 0.3120, 0.3130, 0.3140, 0.3150, 0.3160, 0.3170, 0.3180, 0.3190, 0.3200, 0.3210, 0.3220, 0.3230, 0.3240, 0.3250, 0.3260, 0.3270, 0.3280, 0.3290, 0.3300, 0.3310, 0.3320, 0.3330, 0.3340, 0.3350, 0.3360, 0.3370, 0.3380, 0.3390, 0.3400, 0.3410, 0.3420, 0.3430, 0.3440, 0.3450, 0.3460, 0.3470, 0.3480, 0.3490, 0.3500, 0.3510, 0.3520, 0.3530, 0.3540, 0.3550, 0.3560, 0.3570, 0.3580, 0.3590, 0.3600, 0.3610, 0.3620, 0.3630, 0.3640, 0.3650, 0.3660, 0.3670, 0.3680, 0.3690, 0.3700, 0.3710, 0.3720, 0.3730, 0.3740, 0.3750, 0.3760, 0.3770, 0.3780, 0.3790, 0.3800, 0.3810, 0.3820, 0.3830, 0.3840, 0.3850, 0.3860, 0.3870, 0.3880, 0.3890, 0.3900, 0.3910, 0.3920, 0.3930, 0.3940, 0.3950, 0.3960, 0.3970, 0.3980, 0.3990, 0.4000, 0.4010, 0.4020, 0.4030, 0.4040, 0.4050, 0.4060, 0.4070, 0.4080, 0.4090, 0.4100, 0.4110, 0.4120, 0.4130, 0.4140, 0.4150, 0.4160, 0.4170, 0.4180, 0.4190, 0.4200, 0.4210, 0.4220, 0.4230, 0.4240, 0.4250, 0.4260, 0.4270, 0.4280, 0.4290, 0.4300, 0.4310, 0.4320, 0.4330, 0.4340, 0.4350, 0.4360, 0.4370, 0.4380, 0.4390, 0.4400, 0.4410, 0.4420, 0.4430, 0.4440, 0.4450, 0.4460, 0.4470, 0.4480, 0.4490, 0.4500, 0.4510, 0.4520, 0.4530, 0.4540, 0.4550, 0.4560, 0.4570, 0.4580, 0.4590, 0.4600, 0.4610, 0.4620, 0.4630, 0.4640, 0.4650, 0.4660, 0.4670, 0.4680, 0.4690, 0.4700, 0.4710, 0.4720, 0.4730, 0.4740, 0.4750, 0.4760, 0.4770, 0.4780, 0.4790, 0.4800, 0.4810, 0.4820, 0.4830, 0.4840, 0.4850, 0.4860, 0.4870, 0.4880, 0.4890, 0.4900, 0.4910, 0.4920, 0.4930, 0.4940, 0.4950, 0.4960, 0.4970, 0.4980, 0.4990, 0.5000, 0.5010, 0.5020, 0.5030, 0.5040, 0.5050, 0.5060, 0.5070, 0.5080, 0.5090, 0.5100, 0.5110, 0.5120, 0.5130, 0.5140, 0.5150, 0.5160, 0.5170, 0.5180, 0.5190, 0.5200, 0.5210, 0.5220, 0.5230, 0.5240, 0.5250, 0.5260, 0.5270, 0.5280, 0.5290, 0.5300, 0.5310, 0.5320, 0.5330, 0.5340, 0.5350, 0.5360, 0.5370, 0.5380, 0.5390, 0.5400, 0.5410, 0.5420, 0.5430, 0.5440, 0.5450, 0.5460, 0.5470, 0.5480, 0.5490, 0.5500, 0.5510, 0.5520, 0.5530, 0.5540, 0.5550, 0.5560, 0.5570, 0.5580, 0.5590, 0.5600, 0.5610, 0.5620, 0.5630, 0.5640, 0.5650, 0.5660, 0.5670, 0.5680, 0.5690, 0.5700, 0.5710, 0.5720, 0.5730, 0.5740, 0.5750, 0.5760, 0.5770, 0.5780, 0.5790, 0.5800, 0.5810, 0.5820, 0.5830, 0.5840, 0.5850, 0.5860, 0.5870, 0.5880, 0.5890, 0.5900, 0.5910, 0.5920, 0.5930, 0.5940, 0.5950, 0.5960, 0.5970, 0.5980, 0.5990, 0.6000, 0.6010, 0.6020, 0.6030, 0.6040, 0.6050, 0.6060, 0.6070, 0.6080, 0.6090, 0.6100, 0.6110, 0.6120, 0.6130, 0.6140, 0.6150, 0.6160, 0.6170, 0.6180, 0.6190, 0.6200, 0.6210, 0.6220, 0.6230, 0.6240, 0.6250, 0.6260, 0.6270, 0.6280, 0.6290, 0.6300, 0.6310, 0.6320, 0.6330, 0.6340, 0.6350, 0.6360, 0.6370, 0.6380, 0.6390, 0.6400, 0.6410, 0.6420, 0.6430, 0.6440, 0.6450, 0.6460, 0.6470, 0.6480, 0.6490, 0.6500, 0.6510, 0.6520, 0.6530, 0.6540, 0.6550, 0.6560, 0.6570, 0.6580, 0.6590, 0.6600, 0.6610, 0.6620, 0.6630, 0.6640, 0.6650, 0.6660, 0.6670, 0.6680, 0.6690, 0.6700, 0.6710, 0.6720, 0.6730, 0.6740, 0.6750, 0.6760, 0.6770, 0.6780, 0.6790, 0.6800, 0.6810, 0.6820, 0.6830, 0.6840, 0.6850, 0.6860, 0.6870, 0.6880, 0.6890, 0.6900, 0.6910, 0.6920, 0.6930, 0.6940, 0.6950, 0.6960, 0.6970, 0.6980, 0.6990, 0.7000, 0.7010, 0.7020, 0.7030, 0.7040, 0.7050, 0.7060, 0.7070, 0.7080, 0.7090, 0.7100, 0.7110, 0.7120, 0.7130, 0.7140, 0.7150, 0.7160, 0.7170, 0.7180, 0.7190, 0.7200, 0.7210, 0.7220, 0.7230, 0.7240, 0.7250, 0.7260, 0.7270, 0.7280, 0.7290, 0.7300, 0.7310, 0.7320, 0.7330, 0.7340, 0.7350, 0.7360, 0.7370, 0.7380, 0.7390, 0.7400, 0.7410, 0.7420, 0.7430, 0.7440, 0.7450, 0.7460, 0.7470, 0.7480, 0.7490, 0.7500, 0.7510, 0.7520, 0.7530, 0.7540, 0.7550, 0.7560, 0.7570, 0.7580, 0.7590, 0.7600, 0.7610, 0.7620, 0.7630, 0.7640, 0.7650, 0.7660, 0.7670, 0.7680, 0.7690, 0.7700, 0.7710, 0.7720, 0.7730, 0.7740, 0.7750, 0.7760, 0.7770, 0.7780, 0.7790, 0.7800, 0.7810, 0.7820, 0.7830, 0.7840, 0.7850, 0.7860, 0.7870, 0.7880, 0.7890, 0.7900, 0.7910, 0.7920, 0.7930, 0.7940, 0.7950, 0.7960, 0.7970, 0.7980, 0.7990, 0.8000, 0.8010, 0.8020, 0.8030, 0.8040, 0.8050, 0.8060, 0.8070, 0.8080, 0.8090, 0.8100, 0.8110, 0.8120, 0.8130, 0.8140, 0.8150, 0.8160, 0.8170, 0.8180, 0.8190, 0.8200, 0.8210, 0.8220, 0.8230, 0.8240, 0.8250, 0.8260, 0.8270, 0.8280, 0.8290, 0.8300, 0.8310, 0.8320, 0.8330, 0.8340, 0.8350, 0.8360, 0.8370, 0.8380, 0.8390, 0.8400, 0.8410, 0.8420, 0.8430, 0.8440, 0.8450, 0.8460, 0.8470, 0.8480, 0.8490, 0.8500, 0.8510, 0.8520, 0.8530, 0.8540, 0.8550, 0.8560, 0.8570, 0.8580, 0.8590, 0.8600, 0.8610, 0.8620, 0.8630, 0.8640, 0.8650, 0.8660, 0.8670, 0.8680, 0.8690, 0.8700, 0.8710, 0.8720, 0.8730, 0.8740, 0.8750, 0.8760, 0.8770, 0.8780, 0.8790, 0.8800, 0.8810, 0.8820, 0.8830, 0.8840, 0.8850, 0.8860, 0.8870, 0.8880, 0.8890, 0.8900, 0.8910, 0.8920, 0.8930, 0.8940, 0.8950, 0.8960, 0.8970, 0.8980, 0.8990, 0.9000, 0.9010, 0.9020, 0.9030, 0.9040, 0.9050, 0.9060, 0.9070, 0.9080, 0.9090, 0.9100, 0.9110, 0.9120, 0.9130, 0.9140, 0.9150, 0.9160, 0.9170, 0.9180, 0.9190, 0.9200, 0.9210, 0.9220, 0.9230, 0.9240, 0.9250, 0.9260, 0.9270, 0.9280, 0.9290, 0.9300, 0.9310, 0.9320, 0.9330, 0.9340, 0.9350, 0.9360, 0.9370, 0.9380, 0.9390, 0.9400, 0.9410, 0.9420, 0.9430, 0.9440, 0.9450, 0.9460, 0.9470, 0.9480, 0.9490, 0.9500, 0.9510, 0.9520, 0.9530, 0.9540, 0.9550, 0.9560, 0.9570, 0.9580, 0.9590, 0.9600, 0.9610, 0.9620, 0.9630, 0.9640, 0.9650, 0.9660, 0.9670, 0.9680, 0.9690, 0.9700, 0.9710, 0.9720, 0.9730, 0.9740, 0.9750, 0.9760, 0.9770, 0.9780, 0.9790, 0.9800, 0.9810, 0.9820, 0.9830, 0.9840, 0.9850, 0.9860, 0.9870, 0.9880, 0.9890, 0.9900, 0.9910, 0.9920, 0.9930, 0.9940, 0.9950, 0.9960, 0.9970, 0.9980, 0.9990, 1.0000, 1.0010, 1.0020, 1.0030, 1.0040, 1.0050, 1.0060, 1.0070, 1.0080, 1.0090, 1.0100, 1.0110, 1.0120, 1.0130, 1.0140, 1.0150, 1.0160, 1.0170, 1.0180, 1.0190, 1.0200, 1.0210, 1.0220, 1.0230, 1.0240, 1.0250, 1.0260, 1.0270, 1.0280, 1.0290, 1.0300, 1.0310, 1.0320, 1.0330, 1.0340, 1.0350, 1.0360, 1.0370, 1.0380, 1.0390, 1.0400, 1.0410, 1.0420, 1.0430, 1.0440, 1.0450, 1.0460, 1.0470, 1.0480, 1.0490, 1.0500, 1.0510, 1.0520, 1.0530, 1.0540, 1.0550, 1.0560, 1.0570, 1.0580, 1.0590, 1.0600, 1.0610, 1.0620, 1.0630, 1.0640, 1.0650, 1.0660, 1.0670, 1.0680, 1.0690, 1.0700, 1.0710, 1.0720, 1.0730, 1.0740, 1.0750, 1.0760, 1.0770, 1.0780, 1.0790, 1.0800, 1.0810, 1.0820, 1.0830, 1.0840, 1.0850, 1.0860, 1.0870, 1.0880, 1.0890, 1.0900, 1.0910, 1.0920, 1.0930, 1.0940, 1.0950, 1.0960, 1.0970, 1.0980, 1.0990, 1.1000, 1.1010, 1.1020, 1.1030, 1.1040, 1.1050, 1.1060, 1.1070, 1.1080, 1.1090, 1.1100, 1.1110, 1.1120, 1.1130, 1.1140, 1.1150, 1.1160, 1.1170, 1.1180, 1.1190, 1.1200, 1.1210, 1.1220, 1.1230, 1.1240, 1.1250, 1.1260, 1.1270, 1.1280, 1.1290, 1.1300, 1.1310, 1.1320, 1.1330, 1.1340, 1.1350, 1.1360, 1.1370, 1.1380, 1.1390, 1.1400, 1.1410, 1.1420, 1.1430, 1.1440, 1.1450, 1.1460, 1.1470, 1.1480, 1.1490, 1.1500, 1.1510, 1.1520, 1.1530, 1.1540, 1.1550, 1.1560, 1.1570, 1.1580, 1.1590, 1.1600, 1.1610, 1.1620, 1.1630, 1.1640, 1.1650, 1.1660, 1.1670, 1.1680, 1.1690, 1.1700, 1.1710, 1.1720, 1.1730, 1.1740, 1.1750, 1.1760, 1.1770, 1.1780, 1.1790, 1.1800, 1.1810, 1.1820, 1.1830, 1.1840, 1.1850, 1.1860, 1.1870, 1.1880, 1.1890, 1.1900, 1.1910, 1.1920, 1.1930, 1.1940, 1.1950, 1.1960, 1.1970, 1.1980, 1.1990, 1.2000, 1.2010, 1.2020, 1.2030, 1.2040, 1.2050, 1.2060, 1.2070, 1.2080, 1.2090, 1.2100, 1.2110, 1.2120, 1.2130, 1.2140, 1.2150, 1.2160, 1.2170, 1.2180, 1.2190, 1.2200, 1.2210, 1.2220, 1.2230, 1.2240, 1.2250, 1.2260, 1.2270, 1.2280, 1.2290, 1.2300, 1.2310, 1.2320, 1.2330, 1.2340, 1.2350, 1.2360, 1.2370, 1.2380, 1.2390, 1.2400, 1.2410, 1.2420, 1.2430, 1.2440, 1.2450, 1.2460, 1.2470, 1.2480, 1.2490, 1.2500, 1.2510, 1.2520, 1.2530, 1.2540, 1.2550, 1.2560, 1.2570, 1.2580, 1.2590, 1.2600, 1.2610, 1.2620, 1.2630, 1.2640, 1.2650, 1.2660, 1.2670, 1.2680, 1.2690, 1.2700, 1.2710, 1.2720, 1.2730, 1.2740, 1.2750, 1.2760, 1.2770, 1.2780, 1.2790, 1.2800, 1.2810, 1.2820, 1.2830, 1.2840, 1.2850, 1.2860, 1.2870, 1.2880, 1.2890, 1.2900, 1.2910, 1.2920, 1.2930, 1.2940, 1.2950, 1.2960, 1.2970, 1.2980, 1.2990, 1.3000, 1.3010, 1.3020, 1.3030, 1.3040, 1.3050, 1.3060, 1.3070, 1.3080, 1.3090, 1.3100, 1.3110, 1.3120, 1.3130, 1.3140, 1.3150, 1.3160, 1.3170, 1.3180, 1.3190, 1.3200, 1.3210, 1.3220, 1.3230, 1.3240, 1.3250, 1.3260, 1.3270, 1.3280, 1.3290, 1.3300, 1.3310, 1.3320, 1.3330, 1.3340, 1.3350, 1.3360, 1.3370, 1.3380, 1.3390, 1.3400, 1.3410, 1.3420, 1.3430, 1.3440, 1.3450, 1.3460, 1.3470, 1.3480, 1.3490, 1.3500, 1.3510, 1.3520, 1.3530, 1.3540, 1.3550, 1.3560, 1.3570, 1.3580, 1.3590, 1.3600, 1.3610, 1.3620, 1.3630, 1.3640, 1.3650, 1.3660, 1.3670, 1.3680, 1.3690, 1.3700, 1.3710, 1.3720, 1.3730, 1.3740, 1.3750, 1.3760, 1.3770, 1.3780, 1.3790, 1.3800, 1.3810, 1.3820, 1.3830, 1.3840, 1.3850, 1.3860, 1.3870, 1.3880, 1.3890, 1.3900, 1.3910, 1.3920, 1.3930, 1.3940, 1.3950, 1.3960, 1.3970, 1.3980, 1.3990, 1.4000, 1.4010, 1.4020, 1.4030, 1.4040, 1.4050, 1.4060, 1.4070, 1.4080, 1.4090, 1.4100, 1.4110, 1.4120, 1.4130, 1.4140, 1.4150, 1.4160, 1.4170, 1.4180, 1.4190, 1.4200, 1.4210, 1.4220, 1.4230, 1.4240, 1.4250, 1.4260, 1.4270, 1.4280, 1.4290, 1.4300, 1.4310, 1.4320, 1.4330, 1.4340, 1.4350, 1.4360, 1.4370, 1.4380, 1.4390, 1.4400, 1.4410, 1.4420, 1.4430, 1.4440, 1.4450, 1.4460, 1.4470, 1.4480, 1.4490, 1.4500, 1.4510, 1.4520, 1.4530, 1.4540, 1.4550, 1.4560, 1.4570, 1.4580, 1.4590, 1.4600, 1.4610, 1.4620, 1.4630, 1.4640, 1.4650, 1.4660, 1.4670, 1.4680, 1.4690, 1.4700, 1.4710, 1.4720, 1.4730, 1.4740, 1.4750, 1.4760, 1.4770, 1.4780, 1.4790, 1.4800, 1.4810, 1.4820, 1.4830, 1.4840, 1.4850, 1.4860, 1.4870, 1.4880, 1.4890, 1.4900, 1.4910, 1.4920, 1.4930, 1.4940, 1.4950, 1.4960, 1.4970, 1.4980, 1.4990, 1.5000, 1.5010, 1.5020, 1.5030, 1.5040, 1.5050, 1.5060, 1.5070, 1.5080, 1.5090, 1.5100, 1.5110, 1.5120, 1.5130, 1.5140, 1.5150, 1.5160, 1.5170, 1.5180, 1.5190, 1.5200, 1.5210, 1.5220, 1.5230, 1.5240, 1.5250, 1.5260, 1.5270, 1.5280, 1.5290, 1.5300, 1.5310, 1.5320, 1.5330, 1.5340, 1.5350, 1.5360, 1.5370, 1.5380, 1.5390, 1.5400, 1.5410, 1.5420, 1.5430, 1.5440, 1.5450, 1.5460, 1.5470, 1.5480, 1.5490, 1.5500, 1.5510, 1.5520, 1.5530, 1.5540, 1.5550, 1.5560, 1.5570, 1.5580, 1.5590, 1.5600, 1.5610, 1.5620, 1.5630, 1.5640, 1.5650, 1.5660, 1.5670, 1.5680, 1.5690, 1.5700, 1.5710, 1.5720, 1.5730, 1.5740, 1.5750, 1.5760, 1.5770, 1.5780, 1.5790, 1.5800, 1.5810, 1.5820, 1.5830, 1.5840, 1.5850, 1.5860, 1.5870, 1.5880, 1.5890, 1.5900, 1.5910, 1.5920, 1.5930, 1.5940, 1.5950, 1.5960, 1.5970, 1.5980, 1.5990, 1.6000, 1.6010, 1.6020, 1.6030, 1.6040, 1.6050, 1.6060, 1.6070, 1.6080, 1.6090, 1.6100, 1.6110, 1.6120, 1.6130, 1.6140, 1.6150, 1.6160, 1.6170, 1.6180, 1.6190, 1.6200, 1.6210, 1.6220, 1.6230, 1.6240, 1.6250, 1.6260, 1.6270, 1.6280, 1.6290, 1.6300, 1.6310, 1.6320, 1.6330, 1.6340, 1.6350, 1.6360, 1.6370, 1.6380, 1.6390, 1.6400, 1.6410, 1.6420, 1.6430, 1.6440, 1.6450, 1.6460, 1.6470, 1.6480, 1.6490, 1.6500, 1.6510, 1.6520, 1.6530, 1.6540, 1.6550, 1.6560, 1.6570, 1.6580, 1.6590, 1.6600, 1.6610, 1.6620, 1.6630, 1.6640, 1.6650, 1.6660, 1.6670, 1.6680, 1.6690, 1.6700, 1.6710, 1.6720, 1.6730, 1.6740, 1.6750, 1.6760, 1.6770, 1.6780, 1.6790, 1.6800, 1.6810, 1.6820, 1.6830, 1.6840, 1.6850, 1.6860, 1.6870, 1.6880, 1.6890, 1.6900, 1.6910, 1.6920, 1.6930, 1.6940, 1.6950, 1.6960, 1.6970, 1.6980, 1.6990, 1.700],
    "y":[1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 0.9999, 0.9999, 0.9999, 0.9999, 0.9999, 0.9999, 0.9999, 0.9998, 0.9998, 0.9998, 0.9998, 0.9997, 0.9997, 0.9997, 0.9996, 0.9996, 0.9995, 0.9995, 0.9994, 0.9994, 0.9993, 0.9993, 0.9992, 0.9991, 0.9991, 0.9990, 0.9989, 0.9988, 0.9987, 0.9986, 0.9985, 0.9984, 0.9983, 0.9981, 0.9980, 0.9978, 0.9977, 0.9975, 0.9974, 0.9972, 0.9970, 0.9968, 0.9966, 0.9964, 0.9962, 0.9960, 0.9957, 0.9955, 0.9952, 0.9950, 0.9947, 0.9944, 0.9941, 0.9938, 0.9934, 0.9931, 0.9927, 0.9924, 0.9920, 0.9916, 0.9912, 0.9907, 0.9903, 0.9898, 0.9894, 0.9889, 0.9884, 0.9878, 0.9873, 0.9867, 0.9862, 0.9856, 0.9849, 0.9843, 0.9837, 0.9830, 0.9823, 0.9816, 0.9808, 0.9801, 0.9793, 0.9785, 0.9777, 0.9768, 0.9759, 0.9750, 0.9741, 0.9732, 0.9722, 0.9712, 0.9701, 0.9691, 0.9680, 0.9669, 0.9658, 0.9646, 0.9634, 0.9622, 0.9609, 0.9596, 0.9583, 0.9569, 0.9556, 0.9541, 0.9527, 0.9512, 0.9497, 0.9481, 0.9465, 0.9449, 0.9433, 0.9416, 0.9398, 0.9381, 0.9363, 0.9344, 0.9325, 0.9306, 0.9286, 0.9266, 0.9246, 0.9225, 0.9204, 0.9182, 0.9160, 0.9137, 0.9114, 0.9091, 0.9067, 0.9042, 0.9017, 0.8992, 0.8966, 0.8940, 0.8913, 0.8886, 0.8858, 0.8830, 0.8801, 0.8772, 0.8742, 0.8712, 0.8681, 0.8650, 0.8618, 0.8585, 0.8553, 0.8519, 0.8485, 0.8450, 0.8415, 0.8380, 0.8343, 0.8306, 0.8269, 0.8231, 0.8192, 0.8153, 0.8113, 0.8073, 0.8032, 0.7990, 0.7948, 0.7905, 0.7862, 0.7818, 0.7773, 0.7727, 0.7681, 0.7635, 0.7587, 0.7539, 0.7491, 0.7442, 0.7392, 0.7341, 0.7290, 0.7238, 0.7185, 0.7132, 0.7078, 0.7023, 0.6968, 0.6912, 0.6855, 0.6798, 0.6739, 0.6681, 0.6621, 0.6561, 0.6500, 0.6438, 0.6376, 0.6313, 0.6249, 0.6184, 0.6119, 0.6053, 0.5987, 0.5919, 0.5851, 0.5782, 0.5713, 0.5642, 0.5571, 0.5500, 0.5427, 0.5354, 0.5280, 0.5205, 0.5130, 0.5054, 0.4977, 0.4900, 0.4821, 0.4742, 0.4663, 0.4582, 0.4501, 0.4419, 0.4337, 0.4254, 0.4170, 0.4085, 0.4000, 0.3914, 0.3827, 0.3739, 0.3651, 0.3563, 0.3473, 0.3383, 0.3292, 0.3201, 0.3109, 0.3016, 0.2922, 0.2828, 0.2734, 0.2638, 0.2542, 0.2446, 0.2349, 0.2251, 0.2152, 0.2054, 0.1954, 0.1854, 0.1753, 0.1652, 0.1550, 0.1448, 0.1345, 0.1242, 0.1138, 0.1033, 0.0929, 0.0823, 0.0717, 0.0611, 0.0504, 0.0397, 0.0290, 0.0182, 0.0073, -0.0035, -0.0145, -0.0254, -0.0364, -0.0474, -0.0585, -0.0695, -0.0806, -0.0918, -0.1029, -0.1141, -0.1253, -0.1366, -0.1478, -0.1591, -0.1704, -0.1817, -0.1930, -0.2043, -0.2156, -0.2270, -0.2383, -0.2497, -0.2610, -0.2724, -0.2837, -0.2951, -0.3064, -0.3178, -0.3291, -0.3404, -0.3517, -0.3630, -0.3743, -0.3855, -0.3967, -0.4079, -0.4191, -0.4302, -0.4414, -0.4524, -0.4635, -0.4745, -0.4854, -0.4964, -0.5072, -0.5181, -0.5288, -0.5396, -0.5502, -0.5609, -0.5714, -0.5819, -0.5923, -0.6027, -0.6129, -0.6232, -0.6333, -0.6433, -0.6533, -0.6632, -0.6730, -0.6827, -0.6923, -0.7019, -0.7113, -0.7206, -0.7299, -0.7390, -0.7480, -0.7569, -0.7657, -0.7744, -0.7829, -0.7913, -0.7996, -0.8078, -0.8159, -0.8238, -0.8315, -0.8392, -0.8467, -0.8540, -0.8612, -0.8683, -0.8752, -0.8819, -0.8885, -0.8949, -0.9012, -0.9073, -0.9132, -0.9190, -0.9245, -0.9299, -0.9352, -0.9402, -0.9450, -0.9497, -0.9542, -0.9585, -0.9625, -0.9664, -0.9701, -0.9736, -0.9769, -0.9799, -0.9828, -0.9855, -0.9879, -0.9901, -0.9921, -0.9939, -0.9955, -0.9968, -0.9979, -0.9988, -0.9994, -0.9998, -1.0000, -0.9999, -0.9996, -0.9991, -0.9983, -0.9973, -0.9960, -0.9945, -0.9928, -0.9907, -0.9885, -0.9860, -0.9832, -0.9802, -0.9769, -0.9734, -0.9696, -0.9656, -0.9613, -0.9567, -0.9519, -0.9468, -0.9415, -0.9359, -0.9301, -0.9240, -0.9176, -0.9110, -0.9041, -0.8969, -0.8895, -0.8818, -0.8739, -0.8657, -0.8572, -0.8485, -0.8396, -0.8303, -0.8209, -0.8111, -0.8011, -0.7909, -0.7804, -0.7697, -0.7587, -0.7475, -0.7360, -0.7243, -0.7124, -0.7002, -0.6878, -0.6751, -0.6623, -0.6491, -0.6358, -0.6223, -0.6085, -0.5945, -0.5803, -0.5659, -0.5513, -0.5364, -0.5214, -0.5062, -0.4908, -0.4752, -0.4594, -0.4435, -0.4273, -0.4110, -0.3945, -0.3779, -0.3611, -0.3442, -0.3271, -0.3098, -0.2924, -0.2749, -0.2573, -0.2395, -0.2216, -0.2036, -0.1855, -0.1673, -0.1490, -0.1306, -0.1122, -0.0936, -0.0750, -0.0563, -0.0376, -0.0188, -0.0000, 0.0189, 0.0378, 0.0567, 0.0756, 0.0946, 0.1135, 0.1325, 0.1514, 0.1703, 0.1892, 0.2081, 0.2269, 0.2457, 0.2644, 0.2831, 0.3016, 0.3202, 0.3386, 0.3569, 0.3751, 0.3932, 0.4112, 0.4291, 0.4469, 0.4645, 0.4819, 0.4992, 0.5163, 0.5333, 0.5501, 0.5667, 0.5831, 0.5992, 0.6152, 0.6310, 0.6465, 0.6618, 0.6769, 0.6917, 0.7062, 0.7205, 0.7345, 0.7482, 0.7617, 0.7748, 0.7876, 0.8002, 0.8124, 0.8243, 0.8358, 0.8470, 0.8579, 0.8684, 0.8786, 0.8884, 0.8978, 0.9068, 0.9155, 0.9237, 0.9316, 0.9391, 0.9462, 0.9528, 0.9590, 0.9648, 0.9702, 0.9752, 0.9797, 0.9838, 0.9874, 0.9906, 0.9933, 0.9956, 0.9974, 0.9987, 0.9996, 1.0000, 0.9999, 0.9994, 0.9983, 0.9968, 0.9948, 0.9924, 0.9894, 0.9860, 0.9821, 0.9777, 0.9728, 0.9674, 0.9615, 0.9552, 0.9483, 0.9410, 0.9332, 0.9249, 0.9161, 0.9069, 0.8972, 0.8870, 0.8763, 0.8652, 0.8536, 0.8415, 0.8290, 0.8161, 0.8027, 0.7888, 0.7745, 0.7598, 0.7447, 0.7291, 0.7132, 0.6968, 0.6800, 0.6628, 0.6453, 0.6274, 0.6091, 0.5904, 0.5714, 0.5520, 0.5324, 0.5124, 0.4920, 0.4714, 0.4505, 0.4293, 0.4078, 0.3860, 0.3640, 0.3418, 0.3193, 0.2966, 0.2737, 0.2507, 0.2274, 0.2040, 0.1804, 0.1567, 0.1328, 0.1088, 0.0848, 0.0606, 0.0364, 0.0121, -0.0122, -0.0366, -0.0610, -0.0854, -0.1097, -0.1341, -0.1584, -0.1826, -0.2068, -0.2308, -0.2548, -0.2787, -0.3024, -0.3260, -0.3494, -0.3726, -0.3956, -0.4184, -0.4410, -0.4633, -0.4854, -0.5072, -0.5288, -0.5500, -0.5709, -0.5915, -0.6117, -0.6315, -0.6510, -0.6701, -0.6888, -0.7070, -0.7249, -0.7423, -0.7592, -0.7756, -0.7916, -0.8070, -0.8220, -0.8364, -0.8503, -0.8636, -0.8764, -0.8886, -0.9002, -0.9113, -0.9217, -0.9315, -0.9407, -0.9492, -0.9572, -0.9644, -0.9711, -0.9770, -0.9823, -0.9869, -0.9908, -0.9940, -0.9966, -0.9984, -0.9996, -1.0000, -0.9997, -0.9987, -0.9970, -0.9946, -0.9914, -0.9876, -0.9830, -0.9777, -0.9717, -0.9649, -0.9575, -0.9493, -0.9405, -0.9309, -0.9206, -0.9096, -0.8980, -0.8856, -0.8726, -0.8589, -0.8445, -0.8295, -0.8138, -0.7975, -0.7805, -0.7630, -0.7448, -0.7261, -0.7067, -0.6868, -0.6663, -0.6453, -0.6238, -0.6017, -0.5792, -0.5561, -0.5326, -0.5086, -0.4842, -0.4594, -0.4342, -0.4086, -0.3827, -0.3564, -0.3298, -0.3029, -0.2757, -0.2482, -0.2205, -0.1926, -0.1645, -0.1363, -0.1079, -0.0793, -0.0507, -0.0219, 0.0068, 0.0356, 0.0645, 0.0933, 0.1220, 0.1507, 0.1794, 0.2078, 0.2362, 0.2644, 0.2924, 0.3202, 0.3478, 0.3750, 0.4021, 0.4288, 0.4551, 0.4811, 0.5067, 0.5319, 0.5567, 0.5810, 0.6049, 0.6282, 0.6510, 0.6733, 0.6950, 0.7161, 0.7366, 0.7565, 0.7757, 0.7943, 0.8121, 0.8293, 0.8457, 0.8614, 0.8763, 0.8904, 0.9038, 0.9163, 0.9280, 0.9389, 0.9489, 0.9581, 0.9663, 0.9737, 0.9802, 0.9858, 0.9905, 0.9942, 0.9971, 0.9989, 0.9999, 0.9999, 0.9989, 0.9970, 0.9942, 0.9904, 0.9856, 0.9799, 0.9732, 0.9656, 0.9570, 0.9475, 0.9371, 0.9257, 0.9135, 0.9003, 0.8862, 0.8712, 0.8554, 0.8386, 0.8211, 0.8027, 0.7834, 0.7634, 0.7426, 0.7210, 0.6987, 0.6756, 0.6518, 0.6273, 0.6022, 0.5764, 0.5500, 0.5230, 0.4955, 0.4674, 0.4387, 0.4096, 0.3801, 0.3501, 0.3197, 0.2889, 0.2579, 0.2265, 0.1948, 0.1629, 0.1307, 0.0984, 0.0660, 0.0335, 0.0008, -0.0318, -0.0645, -0.0971, -0.1297, -0.1622, -0.1945, -0.2266, -0.2586, -0.2903, -0.3217, -0.3528, -0.3836, -0.4139, -0.4439, -0.4734, -0.5024, -0.5309, -0.5588, -0.5861, -0.6128, -0.6389, -0.6643, -0.6889, -0.7129, -0.7360, -0.7583, -0.7798, -0.8005, -0.8202, -0.8391, -0.8570, -0.8739, -0.8899, -0.9048, -0.9188, -0.9316, -0.9435, -0.9542, -0.9638, -0.9724, -0.9798, -0.9861, -0.9912, -0.9951, -0.9979, -0.9996, -1.0000, -0.9992, -0.9973, -0.9942, -0.9899, -0.9844, -0.9777, -0.9698, -0.9608, -0.9506, -0.9392, -0.9267, -0.9130, -0.8982, -0.8823, -0.8653, -0.8473, -0.8281, -0.8080, -0.7868, -0.7646, -0.7415, -0.7174, -0.6923, -0.6664, -0.6397, -0.6121, -0.5837, -0.5546, -0.5247, -0.4941, -0.4629, -0.4310, -0.3986, -0.3656, -0.3322, -0.2982, -0.2639, -0.2291, -0.1941, -0.1587, -0.1232, -0.0874, -0.0514, -0.0154, 0.0207, 0.0568, 0.0929, 0.1288, 0.1647, 0.2004, 0.2358, 0.2710, 0.3058, 0.3403, 0.3744, 0.4080, 0.4411, 0.4736, 0.5055, 0.5368, 0.5674, 0.5973, 0.6264, 0.6546, 0.6820, 0.7085, 0.7341, 0.7587, 0.7823, 0.8048, 0.8263, 0.8466, 0.8658, 0.8838, 0.9006, 0.9162, 0.9305, 0.9435, 0.9552, 0.9656, 0.9747, 0.9824, 0.9887, 0.9936, 0.9972, 0.9993, 1.0000, 0.9993, 0.9972, 0.9936, 0.9886, 0.9822, 0.9744, 0.9651, 0.9545, 0.9425, 0.9291, 0.9143, 0.8982, 0.8808, 0.8621, 0.8420, 0.8208, 0.7983, 0.7746, 0.7498, 0.7238, 0.6967, 0.6686, 0.6394, 0.6093, 0.5782, 0.5462, 0.5134, 0.4798, 0.4454, 0.4104, 0.3746, 0.3383, 0.3014, 0.2641, 0.2263, 0.1881, 0.1496, 0.1108, 0.0718, 0.0327, -0.0066, -0.0458, -0.0850, -0.1241, -0.1631, -0.2019, -0.2403, -0.2785, -0.3162, -0.3535, -0.3902, -0.4264, -0.4620, -0.4968, -0.5309, -0.5642, -0.5966, -0.6281, -0.6587, -0.6882, -0.7167, -0.7440, -0.7701, -0.7951, -0.8188, -0.8412, -0.8622, -0.8819, -0.9002, -0.9170, -0.9324, -0.9462, -0.9585, -0.9692, -0.9784, -0.9860, -0.9919, -0.9963, -0.9990, -1.0000, -0.9994, -0.9971, -0.9931, -0.9875, -0.9803, -0.9714, -0.9608, -0.9486, -0.9349, -0.9195, -0.9026, -0.8841, -0.8641, -0.8426, -0.8197, -0.7953, -0.7696, -0.7425, -0.7142, -0.6845, -0.6537, -0.6217, -0.5887, -0.5545, -0.5194, -0.4834, -0.4464, -0.4087, -0.3702, -0.3310, -0.2913, -0.2509, -0.2101, -0.1689, -0.1274, -0.0855, -0.0435, -0.0014, 0.0407, 0.0828, 0.1249, 0.1667, 0.2082, 0.2495, 0.2903, 0.3306, 0.3704, 0.4095, 0.4480, 0.4856, 0.5224, 0.5583, 0.5932, 0.6270, 0.6598, 0.6913, 0.7216, 0.7507, 0.7783, 0.8046, 0.8293, 0.8526, 0.8743, 0.8944, 0.9129, 0.9297, 0.9447, 0.9580, 0.9695, 0.9792, 0.9871, 0.9931, 0.9973, 0.9995, 0.9999, 0.9984, 0.9950, 0.9897, 0.9825, 0.9734, 0.9624, 0.9496, 0.9350, 0.9185, 0.9003, 0.8803, 0.8586, 0.8352, 0.8102, 0.7836, 0.7554, 0.7257, 0.6946, 0.6621, 0.6283, 0.5932, 0.5569, 0.5195, 0.4811, 0.4416, 0.4013, 0.3601, 0.3182, 0.2756, 0.2324, 0.1887, 0.1446, 0.1002, 0.0555, 0.0107, -0.0342, -0.0790, -0.1238, -0.1683, -0.2125, -0.2563, -0.2996, -0.3424, -0.3844, -0.4258, -0.4663, -0.5059, -0.5444, -0.5819, -0.6182, -0.6533, -0.6870, -0.7194, -0.7503, -0.7796, -0.8074, -0.8335, -0.8579, -0.8805, -0.9013, -0.9202, -0.9371, -0.9522, -0.9652, -0.9762, -0.9851, -0.9920, -0.9968, -0.9994, -0.9999, -0.9983, -0.9946, -0.9887, -0.9807, -0.9706, -0.9584, -0.9441, -0.9278, -0.9094, -0.8891, -0.8668, -0.8426, -0.8166, -0.7888, -0.7592, -0.7279, -0.6950, -0.6606, -0.6247, -0.5874, -0.5488, -0.5089, -0.4679, -0.4258, -0.3827, -0.3387, -0.2940, -0.2485, -0.2025, -0.1560, -0.1091, -0.0619, -0.0145, 0.0329, 0.0803, 0.1276, 0.1746, 0.2213, 0.2674, 0.3130, 0.3580, 0.4021, 0.4454, 0.4877, 0.5289, 0.5689, 0.6077, 0.6451, 0.6810, 0.7154, 0.7481, 0.7792, 0.8085, 0.8359, 0.8614, 0.8849, 0.9064, 0.9257, 0.9429, 0.9579, 0.9707, 0.9812, 0.9894, 0.9953, 0.9988, 1.0000, 0.9988, 0.9952, 0.9893, 0.9810, 0.9704, 0.9574, 0.9421, 0.9246, 0.9048, 0.8829, 0.8588, 0.8326, 0.8044, 0.7742, 0.7421, 0.7082, 0.6726, 0.6353, 0.5964, 0.5560, 0.5143, 0.4712, 0.4270, 0.3817, 0.3354, 0.2882, 0.2403, 0.1918, 0.1428, 0.0933, 0.0436, -0.0062, -0.0561, -0.1058, -0.1554, -0.2046, -0.2533, -0.3014, -0.3488, -0.3953, -0.4409, -0.4854, -0.5287, -0.5708, -0.6114, -0.6504, -0.6879, -0.7236, -0.7575, -0.7896, -0.8196, -0.8475, -0.8733, -0.8968, -0.9181, -0.9370, -0.9536, -0.9676, -0.9792, -0.9883, -0.9948, -0.9987, -1.0000, -0.9987, -0.9948, -0.9883, -0.9792, -0.9676, -0.9534, -0.9366, -0.9174, -0.8958, -0.8718, -0.8454, -0.8168, -0.7860, -0.7531, -0.7182, -0.6813, -0.6426, -0.6022, -0.5601, -0.5164, -0.4714, -0.4251, -0.3775, -0.3290, -0.2795, -0.2292, -0.1782, -0.1268, -0.0749, -0.0228, 0.0294, 0.0815, 0.1335, 0.1851, 0.2363, 0.2868, 0.3366, 0.3855, 0.4334, 0.4801, 0.5256, 0.5696, 0.6120, 0.6528, 0.6919, 0.7290, 0.7641, 0.7971, 0.8279, 0.8564, 0.8825, 0.9062, 0.9273, 0.9459, 0.9618, 0.9749, 0.9854, 0.9931, 0.9979, 0.9999, 0.9991, 0.9955, 0.9890, 0.9796, 0.9675, 0.9526, 0.9349, 0.9146, 0.8916, 0.8660, 0.8380, 0.8074, 0.7746, 0.7394, 0.7021, 0.6627, 0.6214, 0.5782, 0.5333, 0.4869, 0.4390, 0.3897, 0.3393, 0.2878, 0.2355, 0.1824, 0.1288, 0.0748, 0.0204, -0.0340, -0.0883, -0.1424, -0.1962, -0.2494, -0.3019, -0.3535, -0.4041, -0.4535, -0.5016, -0.5482, -0.5932, -0.6365, -0.6779, -0.7172, -0.7544, -0.7894, -0.8220, -0.8521, -0.8796, -0.9045, -0.9267, -0.9460, -0.9625, -0.9760, -0.9866, -0.9941, -0.9986, -1.0000, -0.9983, -0.9936, -0.9858, -0.9749, -0.9610, -0.9441, -0.9243, -0.9016, -0.8761, -0.8478, -0.8168, -0.7833, -0.7473, -0.7089, -0.6683, -0.6256, -0.5808, -0.5342, -0.4859, -0.4360, -0.3847, -0.3322, -0.2785, -0.2240, -0.1687, -0.1128, -0.0565, -0.0000, 0.0565, 0.1129, 0.1690, 0.2246, 0.2794, 0.3335, 0.3864, 0.4382, 0.4886, 0.5374, 0.5845, 0.6298, 0.6730, 0.7141, 0.7529, 0.7893, 0.8231, 0.8542, 0.8825, 0.9080, 0.9305, 0.9500, 0.9663, 0.9795, 0.9895, 0.9961, 0.9995, 0.9996, 0.9964, 0.9898, 0.9800, 0.9669, 0.9505, 0.9310, 0.9083, 0.8826, 0.8539, 0.8223, 0.7880, 0.7509, 0.7113, 0.6693, 0.6250, 0.5786, 0.5301, 0.4798, 0.4279, 0.3745, 0.3197, 0.2639, 0.2071, 0.1495, 0.0914, 0.0330, -0.0256, -0.0841, -0.1424, -0.2003, -0.2575, -0.3138, -0.3691, -0.4231, -0.4757, -0.5267, -0.5759, -0.6231, -0.6682, -0.7110, -0.7513, -0.7890, -0.8240, -0.8561, -0.8852, -0.9112, -0.9340, -0.9536, -0.9698, -0.9826, -0.9919, -0.9977, -1.0000, -0.9987, -0.9938, -0.9855, -0.9736, -0.9582, -0.9394, -0.9172, -0.8917, -0.8630, -0.8311, -0.7963, -0.7586, -0.7181, -0.6750, -0.6294, -0.5815, -0.5315, -0.4795, -0.4258, -0.3704, -0.3137, -0.2558, -0.1970, -0.1373, -0.0772, -0.0167, 0.0439, 0.1044, 0.1645, 0.2240, 0.2828, 0.3406, 0.3971, 0.4522, 0.5056, 0.5572, 0.6068, 0.6541, 0.6991, 0.7414, 0.7810, 0.8177, 0.8514, 0.8819, 0.9091, 0.9329, 0.9533, 0.9700, 0.9831, 0.9925, 0.9981, 1.0000, 0.9981, 0.9924, 0.9829, 0.9697, 0.9527, 0.9322, 0.9080, 0.8804, 0.8494, 0.8151, 0.7776, 0.7372, 0.6939, 0.6479, 0.5994, 0.5485, 0.4955, 0.4405, 0.3838, 0.3255, 0.2660, 0.2054, 0.1440, 0.0819, 0.0195, -0.0430, -0.1054, -0.1674, -0.2288, -0.2893, -0.3487, -0.4068, -0.4633, -0.5180, -0.5707, -0.6212, -0.6693, -0.7147, -0.7573, -0.7970, -0.8335, -0.8667, -0.8964, -0.9226, -0.9452, -0.9639, -0.9788, -0.9898, -0.9969, -0.9999, -0.9989, -0.9938, -0.9848, -0.9718, -0.9548, -0.9340, -0.9093, -0.8810, -0.8490, -0.8136, -0.7749, -0.7329, -0.6880, -0.6402, -0.5898, -0.5369, -0.4818]
  }
]
)});
  main.variable(observer("dataPt")).define("dataPt", function(){return(
[
  {
    "line": {
      "color":"rgb(50,135,200)",
      "width":5,
      "opacity":0.6,
      "style": "dashed-dotted"
    },
    "marker": {
      "symbol": "circle",
      "opacity": 1,
      "size": 12,
      "color": "rgb(50,135,200)",
      "maxdisplayed": 0
    },
    "name":"Line1",
    "type":"scatter",
    "mode":"markers",
    "x": [0.0000, 0.218, 0.5556, 0.8333, 1.1111, 1.3889, 1.6667, 1.9444, 2.2222, 2.5000],
    "y": [0.5377, 0.0225, -2.2588, 0.8622, 0.3188, -1.3077, -0.4336, 0.3426, 3.5784, 2.7694],
  },
  {
    "line": {
      "color":"rgba(200,100,32)",
      "width":5,
      "opacity":0.6,
      "style": "solid"
    },
    "marker": {
      "symbol": "star",
      "opacity": 0.6,
      "size": 12,
      "color": "rgb(200,100,32)",
      "maxdisplayed": 0
    },
    "name":"Line2",
    "type":"scatter",
    "mode":"lines+markers",
    "x":[-3.0000, -2.7083, -2.4167, -2.1250, -1.8333, -1.5417, -1.2500, -0.9583, -0.6667, -0.3750, -0.0833, 0.2083, 0.5000, 0.7917, 1.0833, 1.3750, 1.6667, 1.9583, 2.2500, 2.5417, 2.8333, 3.1250, 3.4167, 3.7083, 4.0000],
    "y":[-0.1199, 4.2649, 1.9554, 1.1669, 1.9447, 1.0250, 1.1059, 2.7197, 2.6390, 2.6472, 1.9015, 0.0225, 1.9472, 2.8602, 1.7189, 2.2647, 1.9569, 0.9266, 1.5239, 0.4427, 2.1184, 0.0829, 0.1611, 0.4205, -1.7143]
  }
]
)});
  main.variable(observer("data5")).define("data5", function(){return(
[
  {
    "line": {
      "color":"rgb(50,135,200)",
      "width":5,
      "opacity":0.6,
      "style": "dashed-dotted"
    },
    "marker": {
      "symbol": "cross",
      "opacity": 0.4,
      "size": 16,
      "color": "rgb(50,135,200)",
      "maxdisplayed": 0
    },
    "name":"Line1",
    "type":"scatter",
    "mode":"lines+markers",
    "x": [-5.0000, -1.6667, 1.6667, 5.0000],
    "y": [93.2682, -90.9659, 100.1070, 81.5100],
  },
  {
    "line": {
      "color": "rgb(20,32,100)",
      "width":5,
      "opacity":0.6,
      "style": "solid"
    },
    "marker": {
      "symbol": "diamond",
      "opacity": 0.6,
      "size": 20,
      "color": "rgb(20,32,100)",
      "maxdisplayed": 0
    },
    "name":"Line2",
    "type":"scatter",
    "mode":"lines+markers",
    "x":[-5.0000, -1.6667, 1.6667, 5.0000],
    "y":[-1.5486, -90.6076, -1.8990, -1.7984]
  },
  {
    "line": {
      "color":"rgb(200,100,32)",
      "width":5,
      "opacity":0.6,
      "style": "solid"
    },
    "marker": {
      "symbol": "square",
      "opacity": 0.6,
      "size": 12,
      "color": "rgb(200,100,32)",
      "maxdisplayed": 0
    },
    "name":"Line3",
    "type":"scatter",
    "mode":"lines+markers",
    "x":[-5.0000, -1.6667, 1.6667, 5.0000],
    "y":[110.8973, -90.7625, 111.5550, 112.0206]
  },
  {
    "line": {
      "color":"rgb(100,150,230)",
      "width":5,
      "opacity":0.6,
      "style": "dotted"
    },
    "marker": {
      "symbol": "y",
      "opacity": 0.6,
      "size": 24,
      "color": "rgb(100,150,230)",
      "maxdisplayed": 0
    },
    "name":"Line4",
    "type":"scatter",
    "mode":"lines+markers",
    "x":[-5.0000, -1.6667, 1.6667, 5.0000],
    "y":[-86.5902, -90.7294, -86.1688, -86.1751]
  },
  {
    "line": {
      "color":"rgb(255,10,100)",
      "width":5,
      "opacity":0.6,
      "style": "dashed"
    },
    "marker": {
      "symbol": "triangle",
      "opacity": 0.6,
      "size": 12,
      "color": "rgb(255,10,100)",
      "maxdisplayed": 0
    },
    "name":"Line5",
    "type":"scatter",
    "mode":"lines+markers",
    "x":[-5.0000, -1.6667, 1.6667, 5.0000],
    "y":[-169.7133, -90.8265, -171.9066, -169.7813]
  }
]
)});
  main.variable(observer()).define(["md"], function(md){return(
md`---
## Libraries and Imports`
)});
  main.variable(observer("styles")).define("styles", ["html","layoutOpts"], function(html,layoutOpts){return(
html`
<style>
  .container {
    width: ${layoutOpts.width}px;
    height:${layoutOpts.height}px;
  }
  .axes text {
    font-family: ${layoutOpts.font.family};
    font-size: ${layoutOpts.font.size*0.9}pt;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .axes line {
    stroke-opacity: 0.6;
    stroke: rgb(60,60,60);
    stroke-width: 2px;
    shape-rendering: crispEdges;
  }
  .canvas-container, .svg-container, .pointmap-container {
    position: absolute;
    background-color: transparent;
  }
  .canvas-container {
    z-index: 1;
  }
  .pointmap-container {
    z-index: 2;
    cursor: grab;
  }
  .pointmap-container:active {
    cursor: grabbing;
  }
  .pointmap-container:focus {
    outline: none;
  }
  .x-label, .y-label {
    font-family: ${layoutOpts.font.family};
    font-size: ${layoutOpts.font.size}pt;
  }
</style>
`
)});
  main.variable(observer("fx")).define("fx", ["d3"], function(d3){return(
{
  diff:(arr) => {
    let i = 0;
    let result = [];
    while (i < arr.length-1) {
      result.push(arr[++i] - arr[i-1]);
    }
    return result
  },
  markerType: function(type){
    type = type || 'circle';
    switch (type.toLowerCase()) {
      case "cross":
        return d3.symbolCross;
      case "diamond":
        return d3.symbolDiamond;
      case "square":
        return d3.symbolSquare;
      case "star":
        return d3.symbolStar;
      case "y":
        return d3.symbolWye;
      case "triangle":
        return d3.symbolTriangle;
      default:
        // circle is default if type is not there
        return d3.symbolCircle;
    }
  },
  strokeType: function(type) {
    switch (type.toLowerCase()) {
      case "solid":
        return [0]
      case "dashed":
        return [18,12]
        break;
      case "dotted":
        return [2,8]
      case "dashed-dotted":
        return [18,10,1,8,1,10]
    }
  },
   Scales: function(d,dims) {
     // xdomain padded by 1.2% of range (0.6% on each side)
    const xdomain = d3.extent(d3.merge(d.map( o => o.x )));
      //uncomment for padding.map( (v,i,ar) => v + (!i ? -this.diff(ar)*0.006 : this.diff(ar)*0.006) );//padded
     // ydomain padded by 10% of range (5% each side)
    const ydomain = d3.extent(d3.merge(d.map( o => o.y )))
      .map( (v,i,ar) => v + (!i ? -this.diff(ar)*0.05 : this.diff(ar)*0.05) );//padded
    
    let xscale = d3.scaleLinear()
      .domain(xdomain).nice()
      .range([0,dims.width]);
    
    let yscale = d3.scaleLinear()
      .domain(ydomain).nice()
      .range([dims.height,0]);
    return {X: xscale, Y: yscale}
  },
  Axes:function(d,dims) {
    const sc = this.Scales(d,dims);
    let xax = d3.axisBottom(sc.X)
      .ticks(9);
    let yax = d3.axisLeft(sc.Y)
      .ticks(5)
    return {X: xax, Y: yax}
  },
  rgb2A: function(col,opc) {
    let rgb = col.split(',').map( v => v.replace(/\D/g,'') );
    return `rgba(${rgb.slice(0,3).concat(opc.toString()).join(',')})`
  }
}
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("https://d3js.org/d3.v5.min.js")
)});
  const child1 = runtime.module(define1);
  main.import("select", child1);
  main.import("text", child1);
  main.import("button", child1);
  main.variable(observer()).define(["md"], function(md){return(
md`---

## Testing...
### Make cells below for testing.
`
)});
  main.variable(observer("viewof aBut")).define("viewof aBut", ["button"], function(button){return(
button({value: "Animate", description: "Click to view animation."})
)});
  main.variable(observer("aBut")).define("aBut", ["Generators", "viewof aBut"], (G, _) => G.input(_));
  main.variable(observer()).define(["aBut","tipAnim"], function(aBut,tipAnim)
{
  aBut;
  return tipAnim()
}
);
  main.variable(observer("tipAnim")).define("tipAnim", ["d3"], function(d3){return(
() => {
  const screen = window.devicePixelRatio || 1;
  const dims = {width: 360, height: 180};
  const box = {x: 30, y: 40, w: 200, h:80};
  const box_init = {x:0,y:0,w:20,h:20};
  const margins = {top: 50, right: 50, bottom: 50, left: 50};
  // animation props
  const ease = d3.easeCubicInOut;
  const ease1 = d3.easeBounce;
  const ease2 = d3.easeLinear;
  const duration = 700;//ms
  const duration1 = 800;
  const duration2 = 1500;
  // data
  const N = 592;
  var ptSize_init = 0.1;
  const ptSize = 3;
  let cscale = d3.scaleSequential(d3.interpolateViridis).domain([N-1,0]);
  const points = d3.range(N).map( id => ({
    id,color:cscale(id)
  }));
  // all points start at <0,0>
  points.forEach( (p,i) => {
    p.x = Math.random() * (box_init.w - ptSize_init);
    p.y = Math.random() * (box_init.h - ptSize_init);
  });
  
  const canvas = d3.create('canvas')
    .attr('width', `${dims.width}px`)
    .attr('height', `${dims.height}px`)
    .attr('class', 'cv')
    .style('margin', Object.values(margins).join(' '));
  
  const cx = canvas.node().getContext('2d');
  cx.rect(1,1,dims.width-3,dims.height-1);
  cx.clip();
  
  draw(box_init);//draw(box);
  
  animate1();
  
  function toUniform(ptData,ptSize,gridDims) {
    const ptPad = ptSize**2 * 0.6;
    ptData.forEach( pt => {
      pt.x = Math.random() * (gridDims.w - ptPad);
      pt.y = Math.random() * (gridDims.h - ptPad);
    } );
    return ptData;
  }
  
  function toGrid(ptData,ptSize,gridDims) {
    const ptPadded = ptSize**2 * 0.6;
    const ptPerRow = Math.floor(gridDims.w / ptPadded);
    const nRows = ptData.length / ptPerRow;
    
    ptData.forEach( (pt,i) => {
      pt.x = ptPadded * (i % ptPerRow);
      pt.y = ptPadded * Math.floor(i / ptPerRow);
    });
   return ptData; 
  }
  
  function draw(loc) {
    // get use context and plot the {x,y}
    cx.save();
    
    cx.clearRect(0,0,dims.width,dims.height);
    cx.translate(loc.x,loc.y);
    points.forEach( pt => {
      cx.fillStyle = pt.color;
      cx.beginPath();
      cx.arc(pt.x,pt.y,ptSize_init,0,Math.PI*2);
      cx.closePath();
      cx.fill();
      
    });
    cx.restore();
  }
  
  function animate1() {
    // store current point locations
    points.forEach( (pt,i) => {
      pt.sx = pt.x;
      pt.sy = pt.y;
    } );
    box_init.sx = box_init.x;
    box_init.sy = box_init.y;
    
    // calculate new point locations
    toUniform(points,ptSize,box);
    
    // move identities
    points.forEach( (pt,i) => {
      pt.tx = pt.x;
      pt.ty = pt.y;
    } );
    box_init.tx = box.x;
    box_init.ty = box.y;
    // interpolate between current and next (inside timer())
    var timer = d3.timer( (els) => {
      const t = Math.min(1,ease(els/duration));
      //interp
      points.forEach( pt => {
        pt.x = pt.sx*(1-t) + pt.tx*t;
        pt.y = pt.sy*(1-t) + pt.ty*t;
      } );
      box_init.x = box_init.sx*(1-t) + box_init.tx*t;
      box_init.y = box_init.sy*(1-t) + box_init.ty*t;
      ptSize_init = ptSize_init*(1-t) + ptSize*t;
      // update graph
      draw(box_init);
      
      if (t === 1) {
        timer.stop();
        animate2();
      }
    } );
  }
  
  function animate2() {
    // store current point locations
    points.forEach( (pt,i) => {
      pt.sx = pt.x;
      pt.sy = pt.y;
    } );
    
    // calculate new point locations
    toGrid(points,ptSize,box);
    
    // move identities
    points.forEach( (pt,i) => {
      pt.tx = pt.x;
      pt.ty = pt.y;
    } );
    
    // interpolate between current and next (inside timer())
    var timer = d3.timer( (els) => {
      const t = Math.min(1,ease1(els/duration1));
      //interp
      points.forEach( pt => {
        pt.x = pt.sx*(1-t) + pt.tx*t;
        pt.y = pt.sy*(1-t) + pt.ty*t;
      } );
      // update graph
      draw(box_init);
      
      if (t === 1) {
        timer.stop();
        animate3();
      }
    } );
  }
  
  function animate3() {
    // draw a clipping rect at the tip boundary, expand and fade points, fade in rect and text
    const ptEnd = ptSize*4;
    var opBoxStart = 0;
    const opBoxEnd = 0.1;
    var opPtStart = 1;
    const opPtEnd = 0.5;
    var timer = d3.timer( (els) => {
      const t = Math.min(1,ease2(els/duration2));
      const t2 = Math.min(1,ease(els/duration2));
      ptSize_init = ptSize_init*(1-t) + ptEnd*t;
      opBoxStart = opBoxStart*(1-t2) + opBoxEnd*t2;
      opPtStart = opPtStart*(1-t) + opPtEnd*t;
      // draw
      cx.save();
      cx.clearRect(0,0,dims.width,dims.height);
      cx.translate(box_init.x,box_init.y);
      points.forEach( pt => {
        cx.rect(0,0,box.w,box.h);
        cx.clip();
        cx.fillStyle = pt.color + ("00" + ((0xFF + opPtStart*255 + 1) & 0x0FF).toString(16)).slice(-2);
        cx.beginPath();
        cx.arc(pt.x,pt.y,ptSize_init,0,Math.PI*2);
        cx.closePath();
        cx.fill();
      });
      cx.restore();
      cx.beginPath();
      cx.fillStyle = "#2238ff"+("00" + ((0xFF + opBoxStart*255 + 1) & 0x0FF).toString(16)).slice(-2);
      cx.fillRect(box_init.x,box_init.y,box.w,box.h);
      cx.fill();
      cx.stroke();
      if (t === 1) {
        timer.stop();
      }
    } );
  }
  
  return canvas.node();
}
)});
  main.variable(observer("canvasDraw")).define("canvasDraw", ["d3"], function(d3)
{
  const dims = {w: 1226, h:717};
  const canvas = d3.create('canvas')
    .attr('width', `${dims.w}px`)
    .attr('height', `${dims.h}px`)
    .attr('class', 'cv')
    .style('margin', '50,50,50,50');
  
  const cx = canvas.node().getContext('2d');
  cx.rect(1,1,dims.w-3,dims.h-1);
  cx.clip();
  return {cv: canvas, cx: cx, dims: dims}
}
);
  main.variable(observer()).define(["d3"], function(d3){return(
d3.range(100).map(v=> ("00" + ((0xFF + v/100*255 + 1) & 0x0FF).toString(16)).slice(-2) )
)});
  main.variable(observer("tipAnim2")).define("tipAnim2", ["d3"], function(d3){return(
() => {
  const loc = [0.1, 4.5];
  const dims = {w:120,h:80};
  const margins = {t:3,r:3,b:3,l:3};
  const fillColor = "rgba(200,200,200,0.8)";
  const strokeColor = "rgba(150,150,150,0.8)";
  const canvas = d3.create('canvas')
    .attr('width', `${dims.width}px`)
    .attr('height', `${dims.height}px`)
    .attr('class', 'cv')
    .style('margin', Object.values(margins).join(' '));
  
  const cx = canvas.node().getContext('2d');
  
  const pts = d3.range(10).map( v => ({x:0,y:0}) );
  const box = [
      {x:   3, y:  3},
      {x:  25, y: 10},
      {x: 95, y: 10},//165
      {x: 95+14, y: 24},//179
      {x: 95+14, y: 55},//179
      {x: 95, y: 70},//165
      {x:  24, y: 70},
      {x:  10, y: 55},
      {x:  10, y: 25},
      {x:   3, y:  3}
    ];
  const r1 = 7;
  const r2 = 12;
  
  
  animate();
  // FUNCTIONS ----------------------------------------------------->
  function draw() {
    cx.restore();
    
    cx.clearRect(0,0,dims.w,dims.h);
    
    cx.beginPath();
    cx.moveTo(pts[0].x,pts[0].y);
    cx.bezierCurveTo(pts[0].x+r1/2,pts[0].y+r1/2,pts[1].x-r1/2,pts[1].y, pts[1].x,pts[1].y);
    cx.lineTo(pts[2].x,pts[2].y);
    cx.bezierCurveTo(pts[2].x+r2,pts[2].y,pts[3].x,pts[3].y-r2,pts[3].x,pts[3].y);
    cx.lineTo(pts[4].x,pts[4].y);
    cx.bezierCurveTo(pts[4].x, pts[4].y+r2, pts[5].x+r2, pts[5].y, pts[5].x, pts[5].y);
    cx.lineTo(pts[6].x,pts[6].y);
    cx.bezierCurveTo(pts[6].x-r2, pts[6].y, pts[7].x, pts[7].y+r2, pts[7].x, pts[7].y);
    cx.lineTo(pts[8].x,pts[8].y);
    cx.bezierCurveTo(pts[8].x,pts[8].y-r1/2,pts[9].x+r1/2,pts[9].y, pts[9].x,pts[9].y);
    cx.closePath();
    cx.shadowOffsetX = 1.5;
    cx.shadowOffsetY = 2.5;
    cx.shadowBlur    = 5;
    cx.shadowColor   = 'rgba(104, 104, 104, 0.25)';
    cx.stroke();
    cx.fill();
    
  }
  function animate() {
    const ease = d3.easeBounce;
    const dur = 200;
    // store current source
    pts.forEach( (p,i) => {
      p.sx = p.x;
      p.sy = p.y;
      p.tx = box[i].x;
      p.ty = box[i].y;
    } );
    cx.rect(1,1,dims.w-2,dims.h-2);
    cx.clip();
    cx.strokeStyle = strokeColor;
    cx.fillStyle = fillColor;
    cx.lineWidth = 4;
    
    cx.translate(0,0);
    cx.scale(1,1);
    var timer = d3.timer( (els) => {
      const t = Math.min(1,ease(els/dur));
      //interp
      pts.forEach( pt => {
        pt.x = pt.sx*(1-t) + pt.tx*t;
        pt.y = pt.sy*(1-t) + pt.ty*t;
      } );
      // update graph
      cx.clear
      draw();
      
      if (t === 1) {
        timer.stop();
        //addText
        cx.scale(1,1);
        cx.fillStyle = "rgba(10,10,10,1)";
        cx.textAlign = "center";
        cx.textBaseline = "bottom";
        cx.font = "14pt serif";
        cx.save();
        let xlen = cx.measureText('x:'+('       '+loc[0].toPrecision(3)).slice(-7)).width
        cx.fillText('x:'+('       '+xlen.toPrecision(3)).slice(-7), dims.w/2, dims.h/2*0.95);
        cx.font = "14pt serif";
        cx.textAlign = "center";
        cx.textBaseline = "top";
        cx.fillText('y: '+('       '+loc[1].toPrecision(3)).slice(-7), dims.w/2, dims.h/2*1.05);
        cx.restore();
       //("00" + ((0xFF + opPtStart*255 + 1) & 0x0FF).toString(16)).slice(-2); 
      }
    } );
  }
  // <----------------------------------------------------------------
  return canvas.node();
}
)});
  main.variable(observer()).define(["tipAnim2"], function(tipAnim2){return(
tipAnim2()
)});
  main.variable(observer()).define(["colorRect"], function(colorRect){return(
colorRect()
)});
  main.variable(observer("colorRect")).define("colorRect", ["d3"], function(d3){return(
function colorRect() {
  const canvas = d3.create('canvas')
    .attr('width', `500px`)
    .attr('height', `500px`)
    .attr('class', 'cv')
    .style('margin', "5 5 5 5");
  
  const cx = canvas.node().getContext('2d');
  
  const N = 6;
  
  let cscale = d3.scaleSequential(d3.interpolateViridis).domain([N-1,0]);
  // get the color stops
  let stops = d3.merge(d3.range(N).map( (v,i) => [v/N, v/N+1/(N**2)] ));
  stops.push(1);
  stops.splice(Math.floor(stops.length/2),1);
  stops = stops.reduce( (r,k,i) => (!(i%2) ? r.push([k]):r[r.length-1].push(k)) && r, []);
   
  let grad = cx.createLinearGradient(0,0,500,0);
  stops.forEach( (arr,i) => {
    grad.addColorStop(arr[0],cscale(i));
    grad.addColorStop(arr[1],cscale(i));
  } );
  
  /*
  grad.addColorStop(0,cscale(0));
  grad.addColorStop(0.25,cscale(0));
  grad.addColorStop(0.75,cscale(1));
  grad.addColorStop(1,cscale(1));
  grad.addColorStop(1,cscale(1));
  */
  cx.fillStyle = grad;
  cx.fillRect(0,20,500,500);
  return canvas.node();
}
)});
  main.variable(observer("st")).define("st", ["d3"], function(d3)
{
  const N = 3;
  const toMatrix = (arr, width) => 
    arr.reduce((rows, key, index) => (index % width == 0 ? rows.push([key]) 
      : rows[rows.length-1].push(key)) && rows, []);
  
  let stops = d3.merge(d3.range(N).map( (v,i) => [v/N, v/N+1/(N**2)] ));
  stops.push(1);
  stops.splice(Math.floor(stops.length/2),1);
  stops = stops.reduce( (r,k,i) => (!(i%2) ? r.push([k]):r[r.length-1].push(k)) && r, []);
  return stops
}
);
  main.variable(observer()).define(["containers"], function(containers){return(
containers.div
)});
  return main;
}
