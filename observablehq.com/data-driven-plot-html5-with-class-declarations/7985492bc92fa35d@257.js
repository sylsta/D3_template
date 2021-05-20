// https://observablehq.com/@khlick/data-driven-plot-html5-with-class-declarations@257
import define1 from "./e93997d5089d7165@2289.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Data-Driven Plot (HTML5) with Class declarations`
)});
  main.variable(observer("view")).define("view", ["DOM","Axes","datArr","layout"], function(DOM,Axes,datArr,layout)
{
  const parent = DOM.element('div');
  var ax = new Axes(datArr,parent,layout);
  ax.init();
  return parent;
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`Interact with the above plot by scrolling, clicking and dragging. Double click to reset view. *Modify the parameters below.*`
)});
  main.variable(observer("xlabel")).define("xlabel", function(){return(
"Abscissa"
)});
  main.variable(observer("ylabel")).define("ylabel", function(){return(
"Ordinate"
)});
  main.variable(observer("viewof figureWidth")).define("viewof figureWidth", ["slider"], function(slider){return(
slider({
  min: 400, 
  max: 1000, 
  step: 5, 
  value: 800,
  description: "Figure Width (pixels)"
})
)});
  main.variable(observer("figureWidth")).define("figureWidth", ["Generators", "viewof figureWidth"], (G, _) => G.input(_));
  main.variable(observer("viewof figureHeight")).define("viewof figureHeight", ["slider"], function(slider){return(
slider({
  min: 200, 
  max: 1000, 
  step: 5,
  value: 475,
  description: "Figure Height (pixels)"
})
)});
  main.variable(observer("figureHeight")).define("figureHeight", ["Generators", "viewof figureHeight"], (G, _) => G.input(_));
  main.variable(observer("viewof xgrid")).define("viewof xgrid", ["radio"], function(radio){return(
radio({
  title: 'Abscissa grid',
  options: [
    { label: 'On', value: true },
    { label: 'Off', value: false },
  ],
  value: true
})
)});
  main.variable(observer("xgrid")).define("xgrid", ["Generators", "viewof xgrid"], (G, _) => G.input(_));
  main.variable(observer("viewof ygrid")).define("viewof ygrid", ["radio"], function(radio){return(
radio({
  title: 'Ordinate grid',
  options: [
    { label: 'On', value: true },
    { label: 'Off', value: false },
  ],
  value: true
})
)});
  main.variable(observer("ygrid")).define("ygrid", ["Generators", "viewof ygrid"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`
---
This notebook demonstrates a Javascript class object construction for a D3v5 based, data-driven, plot axes. This plot is functionally similar to how [plotly.js](https://plot.ly/javascript/) works, utilizing json or a JavaScript Object for the layout, axes decorations and figure lables while allowing each data Object to directly define individual lines, markers and names (for tooltips). Other than being much lightweight than plotly.js (and much less versitile), this graph-object is drawn on a HTML canvas and based on a data-object (At least at its creation date). The motivation for this was that the SVG based approach is heavily bogged down when plotting lines and markers of data with high sampling rate (or many points). By drawing from the Container.data property, we can eliminate the need to make multiple copies of the data (binding to hidden canvas elements) and still allow for zoooming. By using HTML5, we can also do away with memory-taxing SVG elements... I know that 10,000 circles and 10,000 diamonds makes the browser unhappy. This way, we can rasterize them to the canvas element.

The class definitions are in two layers, the basic Container object, which is customized through the Container.layout property (via the update() method), and the Axes object, which has all the specific plotting, tooltip, zooming, updating machinery. 

### Some Notable Behavior:

Built-in are the abilities to zoom and pan using the mouse (scroll wheel for zoom) or by touch (if on mobile or a touch-ready screen). A double-click on the plot will restore the best-fit view of the current data.

Using the layout Object, we can specify axes properties, individually, to adjust for scaling (linear or logarithmic), display of zero-lines and grids, and labels all "on the fly". 

Tooltips are drawn specifying the ID, X, and Y data-values and will always draw toward the center of the current display. That is, the pixel-space occupied by the graph is divided into quadrants which track the mouse location and will draw the tooltip nearest to the cursor toward the center of the pixel-space. If multiple data entries are occupying the same small region of the graph, the tooltip is grown to accomodate the different datums and the semi-transparent background is colored accordingly.
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`---
### TODO:
[ ] Setup mouse tracker to wait until user stops moving cursor for 0.1s before drawing tooltip to prevent artifacted tooltip animations.

[ ] Some things like zero-lines and changes in scale are not implemented.
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
---
## Data Objects
`
)});
  main.variable(observer("datArr")).define("datArr", function(){return(
[
  {
    "line": {
      "color":"rgb(61,38,168)",
      "width":1,
      "opacity":0.6,
      "style": "dashed-dotted"
    },
    "marker": {
      "symbol": "circle",
      "opacity": 1,
      "size": 5,
      "color":"rgb(61,38,168)",
    },
    "name":"I1",
    "mode":"markers",
    "x": [0.9699,1.0033,1.0368,1.0702,1.1037,1.1371,1.1706, 1.204,1.2375,1.2709,1.3043,1.3378,1.3712,1.4047,1.4381,1.4716, 1.505,1.5385,1.5719,1.6054,1.6388,1.6722,1.7057,1.7391,1.7726, 1.806,1.8395,1.8729,1.9064,1.9398,1.9732,2.0067,2.0401,2.0736, 2.107,2.1405,2.1739,2.2074,2.2408,2.2742,2.3077,2.3411,2.3746, 2.408,2.4415,2.4749,2.5084,2.5418,2.5753,2.6087,2.6421,2.6756, 2.709,2.7425,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,1.8562,0.9699,1.0033,1.0368,1.0702,1.1037,1.1371,1.1706, 1.204,1.2375,1.2709,1.3043,1.3378,1.3712,1.4047,1.4381,1.4716, 1.505,1.5385,1.5719,1.6054,1.6388,1.6722,1.7057,1.7391,1.7726, 1.806,1.8395,1.8729,1.9064,1.9398,1.9732,2.0067,2.0401,2.0736, 2.107,2.1405,2.1739,2.2074,2.2408,2.2742,2.3077,2.3411,2.3746, 2.408,2.4415,2.4749,2.5084,2.5418,2.5753,2.6087,2.6421,2.6756, 2.709,2.7425],
    "y": [0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.060606,0.070707,0.080808,0.090909, 0.10101, 0.11111, 0.12121, 0.13131, 0.14141, 0.15152, 0.16162, 0.17172, 0.18182, 0.19192, 0.20202, 0.21212, 0.22222, 0.23232, 0.24242, 0.25253, 0.26263, 0.27273, 0.28283, 0.29293, 0.30303, 0.31313, 0.32323, 0.33333, 0.34343, 0.35354, 0.36364, 0.37374, 0.38384, 0.39394, 0.40404, 0.41414, 0.42424, 0.43434, 0.44444, 0.45455, 0.46465, 0.47475, 0.48485, 0.49495, 0.50505, 0.51515, 0.52525, 0.53535, 0.54545, 0.55556, 0.56566, 0.57576, 0.58586, 0.59596, 0.60606, 0.61616, 0.62626, 0.63636, 0.64646, 0.65657, 0.66667, 0.67677, 0.68687, 0.69697, 0.70707, 0.71717, 0.72727, 0.73737, 0.74747, 0.75758, 0.76768, 0.77778, 0.78788, 0.79798, 0.80808, 0.81818, 0.82828, 0.83838, 0.84848, 0.85859, 0.86869, 0.87879, 0.88889, 0.89899, 0.90909, 0.91919, 0.92929, 0.93939, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949],
  },
  {
    "line": {
      "color":"rgb(39,150,235)",
      "width":5,
      "opacity":0.6,
      "style": "dashed-dotted"
    },
    "marker": {
      "symbol": "circle",
      "opacity": 1,
      "size": 5,
      "color":"rgb(39,150,235)",
    },
    "name":"R",
    "mode":"markers",
    "x": [3.2441,3.2776, 3.311,3.3445,3.3779,3.4114,3.4448,3.4783,3.5117,3.5452,3.5786, 3.612,3.6455,3.6789,3.7124,3.7458,3.7793,3.8127,3.8462,3.8796, 3.913,3.9465,3.9799,4.0134,4.0468,4.0803,4.1137,4.1472,4.1806, 4.214,4.2475,4.2809,4.3144,4.3478,4.3813,4.4147,4.4482,4.4816,4.5151,4.5485,4.5819,4.6154,4.6488,4.6823,4.7157,4.7492,4.7826,4.8161,4.8495,3.9465,3.9799,4.0134,4.0468,4.0803,4.1137,4.1472,4.1806, 4.214,4.2475,4.2809,4.3144,4.3478,4.3813,4.4147,4.4482,4.4816,4.5151,4.5485,4.5819,4.6154,4.6488,4.6823,4.7157,4.7492,4.7826,4.8161,4.8495,3.2441,3.2776, 3.311,3.3445,3.3779,3.4114,3.4448,3.4783,3.5117,3.5452,3.5786, 3.612,3.6455,3.6789,3.7124,3.7458,3.7793,3.8127,3.8462,3.8796, 3.913,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.2107,3.9465,3.9799,4.0134,4.0468,4.0803,4.1137,4.1472,4.1806, 4.214,4.2475,4.2809,4.3144,4.3478,4.3813,4.4147,4.4482,4.4816,4.5151,4.5485,4.5819,4.6154,4.6488,4.6823,4.7157,4.7492,4.7826,4.8161,4.8495,4.8829,4.9164,4.9498,4.9833],
    "y": [0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94934, 0.94888, 0.94812, 0.94704, 0.94565, 0.94394,  0.9419, 0.93952, 0.93679, 0.93369, 0.93022, 0.92634, 0.92204, 0.91729, 0.91205, 0.90627, 0.89992, 0.89291, 0.88516, 0.87656, 0.86695,  0.8561, 0.84367, 0.82908, 0.81121, 0.78719, 0.72727, 0.50505,  0.5052, 0.50566, 0.50643,  0.5075, 0.50889, 0.51061, 0.51265, 0.51503, 0.51776, 0.52085, 0.52433,  0.5282,  0.5325, 0.53726,  0.5425, 0.54827, 0.55463, 0.56164, 0.56939, 0.57799,  0.5876, 0.59845, 0.61088, 0.62547, 0.64334, 0.66735, 0.72727, 0.50505, 0.50505, 0.50505, 0.50505, 0.50505, 0.50505, 0.50505, 0.50505, 0.50505, 0.50505, 0.50505, 0.50505, 0.50505, 0.50505, 0.50505, 0.50505, 0.50505, 0.50505, 0.50505, 0.50505, 0.50505,0.050505,0.060606,0.070707,0.080808,0.090909, 0.10101, 0.11111, 0.12121, 0.13131, 0.14141, 0.15152, 0.16162, 0.17172, 0.18182, 0.19192, 0.20202, 0.21212, 0.22222, 0.23232, 0.24242, 0.25253, 0.26263, 0.27273, 0.28283, 0.29293, 0.30303, 0.31313, 0.32323, 0.33333, 0.34343, 0.35354, 0.36364, 0.37374, 0.38384, 0.39394, 0.40404, 0.41414, 0.42424, 0.43434, 0.44444, 0.45455, 0.46465, 0.47475, 0.48485, 0.49495, 0.50505, 0.51515, 0.52525, 0.53535, 0.54545, 0.55556, 0.56566, 0.57576, 0.58586, 0.59596, 0.60606, 0.61616, 0.62626, 0.63636, 0.64646, 0.65657, 0.66667, 0.67677, 0.68687, 0.69697, 0.70707, 0.71717, 0.72727, 0.73737, 0.74747, 0.75758, 0.76768, 0.77778, 0.78788, 0.79798, 0.80808, 0.81818, 0.82828, 0.83838, 0.84848, 0.85859, 0.86869, 0.87879, 0.88889, 0.89899, 0.90909, 0.91919, 0.92929, 0.93939, 0.94949, 0.50505, 0.49039, 0.47572, 0.46106,  0.4464, 0.43174, 0.41707, 0.40241, 0.38775, 0.37309, 0.35842, 0.34376,  0.3291, 0.31443, 0.29977, 0.28511, 0.27045, 0.25578, 0.24112, 0.22646,  0.2118, 0.19713, 0.18247, 0.16781, 0.15314, 0.13848, 0.12382, 0.10916,0.094493,0.079831,0.065168,0.050505],
  },
  {
    "line": {
      "color":"rgb(17,190,185)",
      "width":5,
      "opacity":0.6,
      "style": "dashed-dotted"
    },
    "marker": {
      "symbol": "circle",
      "opacity": 1,
      "size": 5,
      "color": "rgb(17,190,185)",
    },
    "name":"I2",
    "mode":"markers",
    "x": [5.4515,5.4849,5.5184,5.5518,5.5853,5.6187,5.6522,5.6856,5.7191,5.7525, 5.786,5.8194,5.8528,5.8863,5.9197,5.9532,5.9866,6.0201,6.0535, 6.087,6.1204,6.1538,6.1873,6.2207,6.2542,6.2876,6.3211,6.3545, 6.388,6.4214,6.4548,6.4883,6.5217,6.5552,6.5886,6.6221,6.6555, 6.689,6.7224,6.7559,6.7893,6.8227,6.8562,6.8896,6.9231,6.9565,  6.99,7.0234,7.0569,7.0903,7.1237,7.1572,7.1906,7.2241,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,6.3378,5.4515,5.4849,5.5184,5.5518,5.5853,5.6187,5.6522,5.6856,5.7191,5.7525, 5.786,5.8194,5.8528,5.8863,5.9197,5.9532,5.9866,6.0201,6.0535, 6.087,6.1204,6.1538,6.1873,6.2207,6.2542,6.2876,6.3211,6.3545, 6.388,6.4214,6.4548,6.4883,6.5217,6.5552,6.5886,6.6221,6.6555, 6.689,6.7224,6.7559,6.7893,6.8227,6.8562,6.8896,6.9231,6.9565,  6.99,7.0234,7.0569,7.0903,7.1237,7.1572,7.1906,7.2241],
    "y": [0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.050505,0.060606,0.070707,0.080808,0.090909, 0.10101, 0.11111, 0.12121, 0.13131, 0.14141, 0.15152, 0.16162, 0.17172, 0.18182, 0.19192, 0.20202, 0.21212, 0.22222, 0.23232, 0.24242, 0.25253, 0.26263, 0.27273, 0.28283, 0.29293, 0.30303, 0.31313, 0.32323, 0.33333, 0.34343, 0.35354, 0.36364, 0.37374, 0.38384, 0.39394, 0.40404, 0.41414, 0.42424, 0.43434, 0.44444, 0.45455, 0.46465, 0.47475, 0.48485, 0.49495, 0.50505, 0.51515, 0.52525, 0.53535, 0.54545, 0.55556, 0.56566, 0.57576, 0.58586, 0.59596, 0.60606, 0.61616, 0.62626, 0.63636, 0.64646, 0.65657, 0.66667, 0.67677, 0.68687, 0.69697, 0.70707, 0.71717, 0.72727, 0.73737, 0.74747, 0.75758, 0.76768, 0.77778, 0.78788, 0.79798, 0.80808, 0.81818, 0.82828, 0.83838, 0.84848, 0.85859, 0.86869, 0.87879, 0.88889, 0.89899, 0.90909, 0.91919, 0.92929, 0.93939, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949, 0.94949],
  },
  {
    "line": {
      "color":"rgb(251,187,62)",
      "width":5,
      "opacity":0.6,
      "style": "dashed-dotted"
    },
    "marker": {
      "symbol": "circle",
      "opacity": 1,
      "size": 5,
      "color": "rgb(251,187,62)",
    },
    "name":"S",
    "mode":"markers",
    "x": [7.7258,7.7592,7.7926,7.8261,7.8595, 7.893,7.9264,7.9599,7.9933,8.0268,8.0602,8.0936,8.1271,8.1605, 8.194,8.2274,8.2609,8.2943,8.3278,8.3612,8.3946,8.4281,8.4615, 8.495,8.5284,8.5619,8.5953,8.6288,8.6622,8.6957,8.7291,8.7625, 8.796,8.8294,8.8629,8.8963,8.9298,8.9632,8.9967,9.0301,9.0635, 9.097,9.1304,9.1639,9.1973,9.2308,9.2642,9.2977,9.3311,9.3645, 9.398,9.4314,9.4649,9.4983,7.7258,7.7592,7.7926,7.8261,7.8595, 7.893,7.9264,7.9599,7.9933,8.0268,8.0602,8.0936,8.1271,8.1605, 8.194,8.2274,8.2609,8.2943,8.3278,8.3612,8.3946,8.4281,8.4615, 8.495,8.5284,8.5619,8.5953,8.6288,8.6622,8.6957,8.7291,8.7625, 8.796,8.8294,8.8629,8.8963,8.9298,8.9632,8.9967,9.0301,9.0635, 9.097,9.1304,9.1639,9.1973,9.2308,9.2642,9.2977,9.3311,9.3645, 9.398,9.4314,9.4649,9.4983,7.8261,7.8595, 7.893,7.9264,7.9599,7.9933,8.0268,8.0602,8.0936,8.1271,8.1605, 8.194,8.2274,8.2609,8.2943,8.3278,8.3612,8.3946,8.4281,8.4615, 8.495,8.5284,8.5619,8.5953,8.6288,8.6622,8.6957,8.7291,8.7625, 8.796,8.8294,8.8629,8.8963,8.9298,8.9632,8.9967,9.0301,9.0635, 9.097,9.1304,9.1639,9.1973,9.2308,9.2642,9.2977,9.3311,9.3645, 9.398,9.4314,9.4649,9.4983],
    "y": [0.77273,  0.8222, 0.84202, 0.85676, 0.86878, 0.87902, 0.88794, 0.89584, 0.90291, 0.90926,   0.915,  0.9202, 0.92491, 0.92918, 0.93305, 0.93653, 0.93966, 0.94246, 0.94494, 0.94711, 0.94899, 0.95059,  0.9519, 0.95295, 0.95373, 0.95425, 0.95451, 0.95451, 0.95425, 0.95373, 0.95295,  0.9519, 0.95059, 0.94899, 0.94711, 0.94494, 0.94246, 0.93966, 0.93653, 0.93305, 0.92918, 0.92491,  0.9202,   0.915, 0.90926, 0.90291, 0.89584, 0.88794, 0.87902, 0.86878, 0.85676, 0.84202,  0.8222, 0.77273, 0.77273, 0.72325, 0.70343,  0.6887, 0.67667, 0.66644, 0.65751, 0.64961, 0.64255, 0.63619, 0.63045, 0.62525, 0.62054, 0.61627, 0.61241, 0.60892, 0.60579, 0.60299, 0.60052, 0.59834, 0.59646, 0.59487, 0.59355,  0.5925, 0.59172,  0.5912, 0.59094, 0.59086, 0.59047, 0.58969, 0.58852, 0.58695, 0.58497, 0.58258, 0.57976,  0.5765, 0.57278, 0.56859, 0.56389, 0.55866, 0.55287, 0.54646, 0.53939, 0.53159, 0.52298, 0.51345, 0.50286, 0.49101, 0.47762, 0.46226, 0.44423, 0.42212,  0.3924, 0.31818, 0.19214,  0.1741, 0.15875, 0.14536, 0.13351, 0.12291, 0.11338, 0.10477,0.096972,0.089903,0.083497,0.077702,0.072473,0.067776,0.063582,0.059865,0.056605,0.053786,0.051393,0.049415,0.047844,0.046671,0.045892,0.045503,0.045503,0.045892,0.046671,0.047844,0.049415,0.051393,0.053786,0.056605,0.059865,0.063582,0.067776,0.072473,0.077702,0.083497,0.089903,0.096972, 0.10477, 0.11338, 0.12291, 0.13351, 0.14536, 0.15875,  0.1741, 0.19214, 0.21424, 0.24397, 0.31818],
  }
]
)});
  main.variable(observer("layout")).define("layout", ["figureWidth","figureHeight","ylabel","ygrid","xlabel","xgrid"], function(figureWidth,figureHeight,ylabel,ygrid,xlabel,xgrid){return(
{
    "width": figureWidth,
    "height": figureHeight,
    "yaxis": {
        "title": ylabel,
        "zerolinecolor": "rgba(174, 174, 174,1)",
        "zeroline": true,
        "grid": ygrid === "true"
    }, 
    "xaxis": {
        "title": xlabel, 
        "zerolinecolor": "rgba(174, 174, 174,1)",
        "zeroline": true,
        "grid": xgrid === "true"
    }, 
    "font": {
        "family": "Times New Roman", 
        "size": 16
    }, 
    "margin": {
        "r": 15, 
        "b": 40, 
        "l": 60, 
        "t": 15
    }
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`---

## Classes
`
)});
  main.variable(observer("Container")).define("Container", ["d3"], function(d3){return(
class Container {
  constructor(parentNode,layoutOpts) {
    this.layout = {
      width: layoutOpts.width || 1226,
      height: layoutOpts.height || 717,
      margin: layoutOpts.margin || {t: 25, r: 25, b: 60, l: 60},
      font: {
        family: layoutOpts.font.family || "Times New Roman",
        size: layoutOpts.font.size || 16
      },
      yaxis: {
        title: layoutOpts.yaxis.title || "",
        zerolinecolor: layoutOpts.yaxis.zerolinecolor || "rgba(174,174,174,0.45)",
        zeroline: layoutOpts.yaxis.zeroline || true,
        scale: layoutOpts.yaxis.scale || "linear",
        grid: layoutOpts.yaxis.grid || false
      },
      xaxis: {
        title: layoutOpts.xaxis.title || "",
        zerolinecolor: layoutOpts.xaxis.zerolinecolor || "rgba(174,174,174,0.45)",
        zeroline: layoutOpts.xaxis.zeroline || true,
        scale: layoutOpts.xaxis.scale || "linear",
        grid: layoutOpts.xaxis.grid || false
      }
    };
    this.layout.extents = {
      width: this.layout.width - this.layout.margin.l - this.layout.margin.r,
      height: this.layout.height - this.layout.margin.t - this.layout.margin.b
    };
    this.stylesElem = document.createElement("style");
    this.stylesElem.type = "text/css";
    this.stylesElem.innerHTML = this.styles;
    //bind styles to dom
    document.getElementsByTagName("head")[0].appendChild(this.stylesElem);

    // Set the parent and build the plot
    // For some reason, needed to set attr and style dimensions... browser compat??
    this.parent = d3.select(parentNode)
      .attr("width", `${this.layout.width}px`)
      .attr("height", `${this.layout.height}px`)
      .attr("class", "container")
      .style("display","block")
      .style("margin", "auto")
      .style("width", `${this.layout.width}px`)
      .style("height", `${this.layout.height}px`);
    // SVG
    this.svg = this.parent.append("svg")
        .attr("width", `${this.layout.width}px`)
        .attr("height", `${this.layout.height}px`)
        .attr("class", "svg-container")
        .attr("xmlns", "http://www.w3.org/2000/svg")
      .append("g")
        .attr("transform", `translate(${this.layout.margin.l},${this.layout.margin.t})`);
    this.svgX = this.svg.append("g")
      .attr("transform", `translate(0,${this.layout.extents.height})`)
      .attr("class", "axes x-axis");
    this.svgY = this.svg.append("g")
      .attr("class", "axes y-axis");
    this.xLabel = this.svg.append("g")
      .attr("class", "x-label");
    this.yLabel = this.svg.append("g")
      .attr("class", "y-label");
    // CANVAS
    this.linemap = this.parent.append("canvas")
      .attr("width", this.layout.width)
      .attr("height", this.layout.height-2)
      .style("margin", `${this.layout.margin.t+1}px ${this.layout.margin.r}px ${this.layout.margin.b}px ${this.layout.margin.l}px`)
      .attr("class", "canvas-container");
    // Map
    this.pointmap = this.parent.append("canvas")
      .attr("width", this.layout.width)
      .attr("height", this.layout.height-2)
      .style("margin", `${this.layout.margin.t+1}px ${this.layout.margin.r}px ${this.layout.margin.b}px ${this.layout.margin.l}px`)
      .attr("class", "pointmap-container")
      .attr("tabindex", "0");

    // Canvas Context
    this.linectx = this.linemap.node().getContext("2d");
    //clip the context
    this.linectx.rect(1,1,this.layout.extents.width-7,this.layout.extents.height-1);
    this.linectx.clip();
    
    this.pointctx = this.pointmap.node().getContext("2d");
    //clip the context
    this.pointctx.rect(1,1,this.layout.extents.width-7,this.layout.extents.height-1);
    this.pointctx.clip();

    //this.databin = d3.select(document.createElement("custom"));
    //this.pointbin = d3.select(document.createElement("custom"));
    
    // Data
    this.data = [];
    this.dataBound = false;
  }// end Constructor
  // SET GET
  get styles() {
    return  `
      .container {
        width: ${this.layout.width}px !important;
        height:${this.layout.height}px !important;
      }
      .axes text {
        font-family: ${this.layout.font.family} !important;
        font-size: ${this.layout.font.size*0.9}pt !important;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      .axes line {
        stroke-opacity: 0.6 !important;
        stroke: rgb(60,60,60) !important;
        stroke-width: 2px !important;
        shape-rendering: crispEdges !important;
      }
      .canvas-container, .svg-container, .pointmap-container {
        position: absolute !important;
        background-color: transparent !important;
      }
      .canvas-container {
        z-index: 100 !important;
      }
      .pointmap-container {
        z-index: 101 !important;
        cursor: move !important; /* fallback if grab cursor is unsupported */
        cursor: grab !important;
        cursor: -moz-grab !important;
        cursor: -webkit-grab !important;
      }
      .pointmap-container:active {
        cursor: grabbing !important;
        cursor: -moz-grabbing !important;
        cursor: -webkit-grabbing !important;
        outline: none !important;

      }
      .pointmap-container:focus {
        outline: none !important;
      }
      .x-label, .y-label {
        font-family: ${this.layout.font.family} !important;
        font-size: ${this.layout.font.size}pt !important;
      }
    `;
  }
  // Methods
  update(layout) {
    for (let prop in layout) {
      if (!layout.hasOwnProperty(prop)) continue;
      this.layout[prop] = layout[prop];
    }
    // update styles
    this.stylesElem.innerHTML = this.styles;

  }
  drawLabel(obj,g){
    const axClass = g.attr("class");
    let whichAx = axClass === "y-label"? "y-axis" : "x-axis";
    let gLab = g.selectAll("text")
      .data([{label:obj.layout[whichAx.replace(/[^0-9a-z]/gi,"")].title}]);
    if (whichAx === "y-axis") {
      gLab.enter()
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -obj.layout.extents.height*12/13)
          .attr("dy", 20)
          .attr("fill", "rgba(30,30,30,0.6)")
          .attr("text-anchor","left")
          .attr("alignment-baseline","baseline")
        .merge(gLab)
          .text(d => d.label);
    } else {
      gLab.enter()
        .append("text")
          .attr("y", obj.layout.extents.height-5)
          .attr("x",obj.layout.extents.height/13)
          .attr("fill", "rgba(30,30,30,0.6)")
          .attr("text-anchor","left")
          .attr("alignment-baseline","baseline")
        .merge(gLab)  
          .text(d => d.label);
    }
    gLab.exit().remove();
  }
  // bind data
  bindData(inputData) {
    var that = this;
    return new Promise(
      (rv,rj) => {
        try {
          that.data = inputData;
        } catch(ee) {
          rj(ee);
        }
        rv(true);
      }
        
    ); 
  }
  
}
)});
  main.variable(observer("Axes")).define("Axes", ["Container","d3"], function(Container,d3){return(
class Axes extends Container {
  constructor(data, ...containerArgs) {
    // container args should contain parent and layoutOpts or just parent
    super(...containerArgs);
    this.tooltipAt = [];
    var that = this;
    // bind data
    this.bindData(data).then( () => {that.dataBound = true;} );
  }
  // SET GET
  get domains() {
    return {
      x: d3.extent(d3.merge(this.data.map( (d) => d.x ))), 
      y: d3.extent(d3.merge(this.data.map( (d) => d.y ))).map( (v,i,ar) => v + (!i ? -this.diff(ar)*0.05 : this.diff(ar)*0.05) )
    };
  }
  get xScale() {
    let xs = (this.layout.xaxis.scale === 'logarithmic') ? d3.scaleLog() : d3.scaleLinear();
    xs = xs
      .range([0,this.layout.extents.width])
      .domain(this.domains.x)
      .nice();
    return xs;
  }
  get yScale() {
    let ys = (this.layout.yaxis.scale === 'logarithmic') ? d3.scaleLog() : d3.scaleLinear();
    ys = ys 
      .range([this.layout.extents.height, 0])
      .domain(this.domains.y)
      .nice();
    return ys;
  }
  get xAxis() {
    return d3.axisBottom(this.xScale).ticks(9);
  }
  get yAxis() {
    return d3.axisLeft(this.yScale).ticks(5);
  }
  get zoomer() {
    const obj = this;
    return d3.zoom()
      .scaleExtent([0.9,100])
      .duration(700)
      .on("zoom", () => {
        const transform = d3.event.transform;
        obj.linectx.save();
        obj.draw(transform);
        obj.linectx.restore();
      });
  }

  // helpers
  init(){
    const obj = this;
    
    this.pointmap
      .call(this.zoomer)
      .on("dblclick.zoom", (d) => {
        const t = d3.zoomIdentity.translate(0,0).scale(1);
        obj.pointmap.transition()
           .duration(200)
           .ease(d3.easeLinear)
           .call(obj.zoomer.transform, t);
       });
    // draw
    this.draw(d3.zoomIdentity);
    this.pointmap
      .on("mousemove", () => {
        return obj.tooltipFinder(obj);
      });
  }
  draw(transform) {
    transform = transform || d3.zoomIdentity;
    //return false;
    const sX = transform.rescaleX(this.xScale);
    const sY = transform.rescaleY(this.yScale);

    // Labels
    let obj = this;
    this.xLabel.call((g)=> this.drawLabel(obj,g));
    this.yLabel.call((g) => this.drawLabel(obj,g));
    
    //
    this.svgX.call(this.xAxis.scale(sX));
    this.svgY.call(this.yAxis.scale(sY));
    // Clear the contexts before drawing on them again
    this.linectx.clearRect(0,0,this.layout.extents.width,this.layout.extents.height);
    this.pointctx.clearRect(0,0,this.layout.extents.width,this.layout.extents.height);
    // draw the lines first
    this.drawLines(sX,sY,transform.k,this.linectx);
    // drawing points last draws them on top of the lines
    this.drawPoints(sX,sY,transform.k,this.linectx);
  }
  update(data,layout) {
    this.dataBound = false;
    var obj = this;
    // update styles
    super.update(layout);
    this.bindData(data).then( () => {
      obj.dataBound = true;
      const t = d3.zoomIdentity.translate(0,0).scale(1);
        
      obj.pointmap.transition()
          .duration(5)
          .ease(d3.easeLinear)
          .call(obj.zoomer.transform, t);
      obj.draw(d3.zoomIdentity);
    } );
  }
  drawLines(sX,sY,kin,ctx) {
    const k = (kin > 1 ? kin * 0.75 : kin);
    const lineGen = d3.line()
      .x( d => sX(d.X) )
      .y( d => sY(d.Y) )
      .curve(d3.curveLinear)
      .context(ctx);
      
    // Update Grid------------------------------------------------------------------------------- GRID >
    if (this.layout.yaxis.grid || this.layout.xaxis.grid) {
      // draw grid lines
      if (this.layout.yaxis.grid){
        // draw y grid (horizontal)
        const yticks = this.yAxis.scale(sY).scale().ticks(5);
        ctx.restore();
        for (let yy in yticks){
          ctx.beginPath();
          ctx.setLineDash(this.strokeType("solid"));
          ctx.moveTo(0,sY(yticks[yy]));//X=min,Y=tick
          ctx.lineTo(this.layout.extents.width, sY(yticks[yy]));
          ctx.strokeStyle = "rgba(10,10,40,0.1)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.save();
      }
      if (this.layout.xaxis.grid){
        // draw x grids (vertical)
        const xticks =this.xAxis.scale(sX).scale().ticks(9);
        ctx.restore();
        for (let xx in xticks){
          ctx.beginPath();
          ctx.setLineDash(this.strokeType("solid"));
          ctx.moveTo(sX(xticks[xx]), 0);//X=tick,y=min
          ctx.lineTo(sX(xticks[xx]), this.layout.extents.height);
          ctx.strokeStyle = "rgba(10,10,40,0.1)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.save();
      }
    }
    // Update Zeros -------------------------------------------------------------------------- ZERO >
    if (this.layout.yaxis.zeroline || this.layout.xaxis.zeroline) {
      // draw zero lines
      if (this.layout.yaxis.zeroline){
        // draw y zero (horizontal)
        ctx.restore();
        ctx.beginPath();
        ctx.setLineDash(this.strokeType("solid"));
        ctx.moveTo(0,sY(0));
        ctx.lineTo(this.layout.extents.width, sY(0));
        ctx.strokeStyle = this.layout.yaxis.zerolinecolor;
        ctx.lineWidth = 1.5*k;
        ctx.stroke();
        ctx.save();
      }
      if (this.layout.xaxis.zeroline){
        // draw x zero (vertical)
        ctx.restore();
        ctx.beginPath();
        ctx.setLineDash(this.strokeType("solid"));
        ctx.moveTo(sX(0), 0);
        ctx.lineTo(sX(0), this.layout.extents.height);
        ctx.strokeStyle = this.layout.xaxis.zerolinecolor;
        ctx.lineWidth = 1.5*k;
        ctx.stroke();
        ctx.save();
        
      }
    }
    // DATA -------------------------------------------------------------------------- DATA >
    this.data.forEach( dat => {
      if(!/lines/gi.test(dat.mode)){ 
        return;
      }
      ctx.beginPath();
      lineGen( 
        dat.x.map( 
          (x,i) => ({"X":x, "Y":dat.y[i]}) 
        ) 
      );
      ctx.lineWidth = dat.line.width*k;
      ctx.lineCap="round";
      ctx.setLineDash(this.strokeType(dat.line.style).map( v => v*k ));
      ctx.strokeStyle = this.rgb2A(dat.line.color, dat.line.hasOwnProperty("opacity") ? dat.line.opacity : 1);
      ctx.shadowOffsetX = 1.5*k;
      ctx.shadowOffsetY = 2.5*k;
      ctx.shadowBlur    = 5*k;
      ctx.shadowColor   = "rgba(104, 104, 104, 0.25)";
      ctx.stroke();
    });
  }
  drawPoints(sX,sY,k,ctx) {
    //points drawn to scales
    let pointGen = d3.symbol().context(ctx);
    this.data.forEach( dat => {
      // each d in elems contains the stored data
      if(!/markers/gi.test(dat.mode)){ 
        return;
      }
      //dd.x.map( 
          //      (v,i) => ({name:dd.name,mode:dd.mode,x:v,y:dd.y[i],marker:dd.marker}) 
          //   )
      dat.x.map( (v,i) => {
        let d = {x:v,y:dat.y[i]};
        ctx.save();
        ctx.fillStyle = this.rgb2A(dat.marker.color, dat.marker.hasOwnProperty("opacity") ? dat.marker.opacity : 1);
        ctx.translate(sX(d.x),sY(d.y));
        ctx.beginPath();
        pointGen
          .type(this.markerType(dat.marker.symbol))
          .size(dat.marker.size**2 * (k>1?k*0.75:k))(d);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
    });
  }
  //static
  diff(arr) {
    let i = 0;
    let result = [];
    while (i < arr.length-1) {
      result.push(arr[++i] - arr[i-1]);
    }
    return result;
  }
  rgb2A(col,opc) {
    let rgb = col.split(",").map( v => v.replace(/\D/g,"") );
    return `rgba(${rgb.slice(0,3).concat(opc.toString()).join(",")})`
  }
  strokeType(type) {
    switch (type.toLowerCase()) {
      case "solid":
        return [0];
      case "dashed":
        return [18,12];
      case "dotted":
        return [2,8];
      case "dashed-dotted":
        return [18,10,1,8,1,10];
    }
  }
  markerType(type){
    type = type || "circle";
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
  }
  // TOOLTIPS
  tooltipDelay(func,delay,obj) {
    let prev = Date.now() - delay;
    return (...args) => {
      let cur = Date.now();
      if (cur-prev >= delay) {
        prev = cur;
        func.apply(args[2][0],args,obj);
      } else {
        obj.pointctx.clearRect(0,0,obj.layout.width,obj.layout.height);
      }
    }
  }
  tooltipFinder(obj) {
    
    let cLocation = d3.mouse(obj.pointmap.node());
    
    let currentZoom = d3.zoomTransform(obj.pointmap.node());
    let sx = currentZoom.rescaleX(obj.xScale);
    let sy = currentZoom.rescaleY(obj.yScale);
    let k = currentZoom.k;
    //setup an array to push the points to when > 1 point matches... i.e. two line pts.
    let tooltipData = [];
    // get the "points" data
    this.data.forEach( dat => {
        // each d in elems contains the stored data
        if(!/markers/gi.test(dat.mode)){ 
          return;
        }
        
        dat.x.map( (v,i) => {
          let d = {x:v,y:dat.y[i],name:dat.name,marker:dat.marker};
          let dx = sx(d.x) - cLocation[0];
          let dy = sy(d.y) - cLocation[1];
          // Check distance and return if cursor is too far from the point.
          if ( Math.sqrt(dx**2 + dy**2) > Math.sqrt(dat.marker.size**2 * (k>1?k*0.75:k)) ) return false;
          // close enough, push tooltip data
          tooltipData.push(d);
        });
    });
    
    // check if we didnt" find anything
    if (!tooltipData.length) {
      obj.tooltipAt = [];
      //obj.pointctx.resetTransform();
      obj.pointctx.setTransform(1,0,0,1,0,0);
      
      obj.pointctx.clearRect(0,0,obj.layout.width,obj.layout.height);
      
      return false;
    }
    
    if (tooltipData.length > 1) {
      
      // filter to grab a single point from each
      let checkIndex = tooltipData.map(d => d.name);
      checkIndex = checkIndex.map( (v,i,a) => a.indexOf(v)===i );
      tooltipData = tooltipData.filter((dat,ind) => checkIndex[ind]);
    }
    
    const pxDat = [parseInt(sx(tooltipData[0].x)),parseInt(sy(tooltipData[0].y))];
    if (obj.tooltipAt.length && pxDat.reduce( (b,v,i) => b = (b && (v === obj.tooltipAt[i])), true)) {
      return false;
    }
    
    // start by just plotting the first found tooltip.
    var dirStr = "";
    dirStr += (pxDat[1] < obj.layout.extents.height/2) ? "s" : "n";
    dirStr += (pxDat[0] < obj.layout.extents.width/2)  ? "e" : "w" ;
    
    // set transform and check if it applied
    
    obj.pointctx.setTransform(1,0,0,1,pxDat[0],pxDat[1]);
    const currentTrs = obj.pointctx.getTransform();
    
    if ((currentTrs.e !== pxDat[0] && currentTrs.f !== pxDat[1])) {
      obj.pointctx.setTransform(1,0,0,1,0,0);
      obj.pointctx.clearRect(0,0,obj.layout.width,obj.layout.height);
      return false;
    }
    obj.pointctx.clearRect(-currentTrs.e,-currentTrs.f,obj.layout.width,obj.layout.height);
    obj.makeTooltip(tooltipData,obj.pointctx,dirStr);
    obj.tooltipAt = pxDat;
  }
  makeTooltip(tipObjArray,cx,direction) {
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
      grad.addColorStop(arr[0], this.rgb2A(tipObjArray[ind].marker.color,0.16) );
      grad.addColorStop(arr[1], this.rgb2A(tipObjArray[ind].marker.color,0.16) );
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
      cx.shadowColor   = "rgba(104, 104, 104, 0.25)";
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
          //console.log("x:"+("       "+tipObjArray[0].x.toPrecision(3)).slice(-7));
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
        id:"ID:"+("              "+tipObjArray[ind].name).slice(-9),
        x: "x:"+("       "+tipObjArray[ind].x.toPrecision(3)).slice(-7),
        y: "y:"+("       "+tipObjArray[ind].y.toPrecision(3)).slice(-7),
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
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`---
## Libraries
`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  const child1 = runtime.module(define1);
  main.import("slider", child1);
  main.import("radio", child1);
  return main;
}
