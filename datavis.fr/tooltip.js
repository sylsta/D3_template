
    const width = $("#svgDiv").width(),
    height = 500;

    const svg = d3.select('#svgDiv').append("svg")
    .attr("id", "svg")
    .attr("width", width)
    .attr("height", height);

    const eetooltip = new EETooltip({
    'svgId': 'svg',
    'tooltipId': 'tooltipDiv',
    'headerText': "Information",
    'footerText': "Données DataVis 2015"
});

    const group = svg.append("g");
    for (var i = 0; i < 22; ++i) {
    var rect = group.append("rect")
			.attr("x",20 + 50 * i)
			.attr("y",20)
			.attr("width", 50)
			.attr("height", 50 + Math.round(Math.random() * 450))
			.style("fill", "#1f8dd6")
			.style("stroke","black")
			.style("stroke-width","1");

    rect.on("mouseover", function(d) {
			eetooltip.addDataBlock("height", this.getBBox().height);
			eetooltip.addDataBlock("x", this.getBBox().x);
			eetooltip.show();
		});
	
		rect.on("mouseout", function(d) {
			eetooltip.hide();
			eetooltip.removeAllDataBlocks();
		});
	}
