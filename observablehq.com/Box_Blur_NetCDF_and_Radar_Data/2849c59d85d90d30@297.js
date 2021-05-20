import define1 from "./e93997d5089d7165@2289.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["observable_radar@2.nc",new URL("./files/3ae552cf6f1cb6b0ef0d7f4e05dd4bd9c3b034499632cc59e1bd774b489a310dd5d06c424a11c3875f6b5926d9c91644ca236bed752db037be83171833222f76",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Box Blur, NetCDF, and Radar Data`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`This notebook plots NEXRAD Level II radar data for a violent EF4 tornado that tracked through Mississippi on 12 April 2020. The radar data was downloaded from a [public bucket hosted on AWS](https://registry.opendata.aws/noaa-nexrad/), decoded using [NASA's RSL library](https://trmm-fc.gsfc.nasa.gov/trmm_gv/software/rsl/), and interpolated to a 250-m grid stored in NetCDF format. NetCDF data can be read directly into the notebook thanks to the [netcdfjs library](https://github.com/cheminfo/netcdfjs).`
)});
  main.variable(observer()).define(["DOM","values","colors"], function*(DOM,values,colors)
{
  const context = DOM.context2d(values.x.length, values.y.length);
  context.canvas.width=values.x.length;
  context.canvas.height=values.y.length;
  const context2 = DOM.context2d(values.x.length, values.y.length);
  context2.canvas.width=values.x.length;
  context2.canvas.height=values.y.length;
  context2.canvas.style.width = values.x.length*1.5+"px";
  context2.canvas.style.height = values.y.length*1.5+"px";
  
  //yield context.canvas;
  const target = context.getImageData(0, 0, values.x.length, values.y.length);
  const targetData = target.data;
  
  for (let i = 0; i<values.x.length; i++) {
    //console.log(i);
    for (let j=0; j<values.y.length; j++) {
      let idx = i*values.x.length+j;
      let color = colors(values.values[idx]);
      //console.log(color);
      targetData[idx*4] = color[0]*255;
      targetData[idx*4+1] = color[1]*255;
      targetData[idx*4+2] = color[2]*255;
      targetData[idx*4+3] = color[3]*255;
    }
  }
  
  context.putImageData(target, 0, 0);
  let data = context.getImageData(0,0,values.x.length,values.y.length);
  //context2.drawImage(data,0,0);
  var imageObject=new Image();
    imageObject.onload=function(){
      //context2.scale(4,4);
      context2.drawImage(imageObject,0,0);
    }
  imageObject.src = context.canvas.toDataURL();
  yield context2.canvas;
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`The 250-m data is plotted above. Each radar pixel, or gate, is visible, which is good for seeing fine-scale detail but also contributes to a noisy appearance. Radar data is commonly smoothed for a friendlier look. A separable implementation of a [blox blur](https://en.wikipedia.org/wiki/Box_blur) is contained in the \`\`smooth\`\` cell to handle smoothing. Use the slider to change the number of smoothing passes. Notice how the 45 dBZ contour on the right changes as the number of smoothing passes increases. It is often desirable to have nice, smooth contours when rendering meteorological data.`
)});
  main.variable(observer("viewof passes")).define("viewof passes", ["slider"], function(slider){return(
slider({
  min: 0, 
  max: 50, 
  step: 1, 
  value: 10,
  description: "Passes of radius 1 box blur"
})
)});
  main.variable(observer("passes")).define("passes", ["Generators", "viewof passes"], (G, _) => G.input(_));
  main.variable(observer()).define(["html"], function(html){return(
html`<canvas id="smoothedRadar"></canvas><svg id="contours" class="svgClass"></svg>`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`By smoothing, the 45 dBZ contour takes on a textbook appearance down to a well-defined flanking line associated with the rear flank downdraft. The idealized supercell schematic below is from [UCAR](https://courses.comet.ucar.edu/pluginfile.php/3757/mod_imscp/content/1/classic.html).`
)});
  main.variable(observer()).define(function()
{
  let img = new Image();
  img.src='https://courses.comet.ucar.edu/pluginfile.php/3757/mod_imscp/content/1/HailSpikesFigure8.jpg'
  return img;
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`## Code Cells`
)});
  main.variable(observer("smooth")).define("smooth", function(){return(
function smooth(values, width, height) {
  let buffer = values.slice(0,values.length);
  const factor = 1/9;
  //first pass horizontal
  for (let i=0; i<height; i++) {
    for (let j=0; j<width; j++) {
      //handle edge pixels by mirroring
      if (j<1) {
        buffer[width*i+j]=(values[width*i+j] + values[width*i+j] + values[width*i+j+1]);
        continue;
      }
      if (j+1==width) {
        buffer[width*i+j]=(values[width*i+j] + values[width*i+j] + values[width*i+j-1]);
        continue;
      }
      buffer[width*i+j] = (values[width*i+j-1] + values[width*i+j] + values[width*i+j+1]);
    }
  }
  //second pass vertical
  for (let i=0; i<height; i++) {
    for (let j=0; j<width; j++) {
      //handle edge pixels by mirroring
      if (i<1) {
        values[width*i+j]=(buffer[width*i+j] + buffer[width*i+j] + buffer[width*(i+1)+j])*factor;
        continue;
      }
      if (i+1==height) {
        values[width*i+j]=(buffer[width*i+j] + buffer[width*i+j] + buffer[width*(i-1)+j])*factor;
        continue;
      }
      values[width*i+j] = (buffer[width*(i-1)+j] + buffer[width*i+j] + buffer[width*(i+1)+j])*factor;
    }
  }
  return values;
}
)});
  main.variable(observer("path")).define("path", ["d3"], function(d3){return(
d3.geoPath(d3.geoIdentity().scale(1.5))
)});
  main.variable(observer("pathg")).define("pathg", ["d3"], function(d3)
{
  const svg = d3.select("#contours");
  
  const g = svg.append("g")
    .attr("fill","none")
    .attr("stroke", "black")
    .attr("stroke-linejoin","round")
    .attr("stroke-width", 3);
  return g;
}
);
  main.variable(observer()).define(["pathg","contour","path"], function(pathg,contour,path)
{
  pathg
      .selectAll("path").data(contour)
      .join("path")
        .attr("d",d=>path(d))       
}
);
  main.variable(observer("contour")).define("contour", ["d3","values","smoothed"], function(d3,values,smoothed)
{
  // Compute the contour polygons at log-spaced intervals; returns an array of MultiPolygon.
  var contours = d3.contours()
      .size([values.x.length, values.y.length])
      .thresholds([45])
      (smoothed);
  return contours;
}
);
  main.variable(observer("smoothed")).define("smoothed", ["values","passes","smooth","d3","colors"], function(values,passes,smooth,d3,colors)
{
  let width = values.x.length;
  let height = values.y.length;
  let smoothed = values.values.slice(0,values.values.length);
  for (let i=0; i<passes; i++) {
    smoothed = smooth(smoothed, width, height);
  }
  const context = d3.select("#smoothedRadar").node().getContext("2d");
  context.canvas.width=width;
  context.canvas.height=height;
  context.canvas.style.width = values.x.length*1.5+"px";
  context.canvas.style.height = values.y.length*1.5+"px";
  const target = context.getImageData(0, 0, width, height);
  const targetData = target.data;
  for (let i = 0; i<width; i++) {
    for (let j=0; j<height; j++) {
      let idx = i*width+j;
      let color = colors(smoothed[idx]);
      targetData[idx*4] = color[0]*255;
      targetData[idx*4+1] = color[1]*255;
      targetData[idx*4+2] = color[2]*255;
      targetData[idx*4+3] = color[3]*255;
    }
  }
  
  context.putImageData(target, 0, 0);
  return smoothed;
}
);
  main.variable(observer("reader")).define("reader", ["netcdf","FileAttachment"], async function(netcdf,FileAttachment){return(
new netcdf(await FileAttachment("observable_radar@2.nc").arrayBuffer())
)});
  main.variable(observer("values")).define("values", ["reader"], function(reader)
{
  var values = new Float32Array(reader.getDataVariable('radar'));
  var x = new Float32Array(reader.getDataVariable('x'));
  var y = new Float32Array(reader.getDataVariable('y'));
  return {
    values:values,
    x:x,
    y:y
  };
}
);
  const child1 = runtime.module(define1);
  main.import("slider", child1);
  main.variable(observer("maxVal")).define("maxVal", ["d3","values"], function(d3,values){return(
d3.max(values.values)
)});
  main.variable(observer("minVal")).define("minVal", ["d3","values"], function(d3,values){return(
d3.min(values.values)
)});
  main.variable(observer("colors")).define("colors", ["d3","rgb"], function(d3,rgb){return(
d3.scaleLinear().domain([0,10,20,30,40,50,60,70]).range(rgb)
)});
  main.variable(observer("rgb")).define("rgb", function()
{
  return [[120/256.,120/256.,120/256.,1], 
          [120/256.,120/256.,120/256.,1], 
          [31/256.,188/256.,255/256.,1],
          [0/256.,133/256.,18/256.,1], 
          [250/256.,208/256.,0/256.,1], 
          [240/256.,124/256.,18/256.,1],
          [214/256.,18/256.,0/256.,1], 
          [201/256.,92/256.,255/256.,1]
         ]
}
);
  main.variable(observer()).define(["html","values"], function(html,values){return(
html`<style> .svgClass { 
background: #ebebeb; 
width:${values.x.length*1.5}px;
height:${values.y.length*1.5}px;
display:inline-block;
vertical-align:top;
} </style>`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@6")
)});
  main.variable(observer("netcdf")).define("netcdf", ["require"], function(require){return(
require('https://unpkg.com/netcdfjs@0.3.1/dist/netcdfjs.min.js')
)});
  return main;
}
