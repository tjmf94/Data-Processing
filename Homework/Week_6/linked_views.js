// Thomas Franx
// 12485640
// Data Processing assignment week 6
window.onload = function() {

  // add title and introduction
  d3.select("body").append("h2").text("D3 Linked Views: The Happy Planet Index (HPI) and it's four elements.");
  d3.select("body").append("h4").text("Thomas Franx, 12485640");
  d3.select("body").append("p").text("The Happy Planet Index combines four elements to show how efficiently residents of different countries are using environmental resources to lead long, happy lives. These four elements are wellbeing, life expectancy, inequality of outcomes and Ecological footprint. Wellbeing is about how satisfied the residents of each country say they feel with life overall, on a scale from zero to ten, based on data collected as part of the Gallup World Poll. Life expectancy is the average number of years a person is expected to live in each country based on data collected by the United Nations. Inequality of outcomes is the inequalities between people within a country, in terms of how long they live, and how happy they feel, based on the distribution in each country’s life expectancy and wellbeing data. Inequality of outcomes is expressed as a percentage. The ecological Footprint is the average impact that each resident of a country places on the environment, based on data prepared by the Global Footprint Network. Ecological Footprint is expressed using a standardized unit: global hectares (gha) per person. Click on a country to view it's HPI and the four elements it consists of. Hoover over figures to view detail!")

  // add data and code sources
  d3.select("body").append("p").text("The data is downloaded from the Happy Planet Index website (https://happyplanetindex.org/).").on("click", function() {window.open("https://happyplanetindex.org/"); });
  d3.select("body").append("p").text("The map is based on the example constructed by Michah Stubbs (click here to see example).").on("click", function() {window.open("http://bl.ocks.org/micahstubbs/8e15870eb432a21f0bc4d3d527b2d14f"); });


  // Set tooltip for map
  var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Happy Planet Index: </strong><span class='details'>" + d.happiness +"</span>";
              });

  // Set tooltip for chart
  var tipChart = d3.tip()
                   .attr('class', 'd3-tip')
                   .offset([-10, 0])
                   .html(function(d) {
                     return "<strong>" + d.name + "</strong><span class='details'>" + d.value + "<br></span>" + "<strong>" + d.text + "</strong><span class='details'>" + d.global + "<br></span>";
                   });

  // set map margins
  var margin = {top: 0, right: 0, bottom: 0, left: 0},
              width = 1000 - margin.left - margin.right,
              height = 600 - margin.top - margin.bottom;

  // set country colours
  var color = d3.scaleThreshold()
      .domain([16.7,20.7,24.7,28.6,31.9,36.1,40.7,44.7])
      .range(["rgb(166,36,48)", "rgb(214,48,48)", "rgb(235,92,28)", "rgb(242,145,5)", "rgb(255,201,18)", "rgb(252,235,18)","rgb(186,209,94)","rgb(46,171,102)"]);

  // create map svg element
  var svg = d3.select("body")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .attr("class", "map");

  // set up fuctions for map structure
  var path = d3.geoPath();

  var projection = d3.geoMercator()
                     .scale(130)
                     .translate( [width / 2, height / 1.5]);

  var path = d3.geoPath().projection(projection);

  // initialize tooltips
  svg.call(tip);
  svg.call(tipChart)

  // create svg element for bar chart
  var svgChart = d3.select("body")
              .append("svg")
              .attr("class", "chart")

  // get data
  var requests = [d3.json("world_countries.json"), d3.json("output.json")]

  // load data and initialize figures
  Promise.all(requests).then(function(response) {
    ready(response[0], response[1]);
  }).catch(function(e){
    throw(e);
  });

  function ready(data, happiness) {

    // Object for happiness data
    var happinessById = {};

    // add country codes as key and HPI as value
    for (country in happiness) {
      happinessById[happiness[country]["country-code"]] = parseFloat(happiness[country]["Happy Planet Index"])
    }

    // add HPI to right country
    data.features.forEach(function(d) {
      console.log(happinessById)
      if (isNaN(happinessById[d.id])) {
        d.happiness = "Index not available"
      }else {
        d.happiness = happinessById[d.id]
      }
    });

    // create countries in right colours
    svg.append('g')
       .attr('class', 'map')
       .append("g")
       .attr("class", "countries")
       .selectAll("path")
       .data(data.features)
       .enter().append("path")
       .attr("d", path)
       .style("fill", function(d) {
         if (color(happinessById[d.id]) == undefined) {
          return "rgb(238,238,238)"
         }else{
          return color(happinessById[d.id])
         }
        })
       .style('stroke', 'white')
       .style('stroke-width', 1.5)
       .style("opacity",0.8)
        // tooltips
       .style("stroke","white")
       .style('stroke-width', 0.3)
       .on('mouseover',function(d){
         tip.show(d);

         d3.select(this)
           .style("opacity", 1)
           .style("stroke","white")
           .style("stroke-width",3);
          })
       .on('mouseout', function(d){
          tip.hide(d);

          d3.select(this)
            .style("opacity", 0.8)
            .style("stroke","white")
            .style("stroke-width",0.3);
          })
       .on("click", function(d){
              updateBar(d.properties["name"], happiness);
            });

    svg.select("g")
        .append("path")
        .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
         // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
        .attr("class", "names")
        .attr("d", path);
  }

  function updateBar(country, dataSet, width, height){

    // set up data for chart
    var data = [{
                "name": "Country's Average Wellbeing (0-10): ",
                "value": parseFloat(dataSet[country]["Average Wellbeing(0-10)"]),
                "text": "Global Average Wellbeing (0-10): ",
                "global": 5.4,
        },
            {
                "name": "Country's Average Life Expectancy: ",
                "value": parseFloat(dataSet[country]["Average Life Expectancy"]),
                "text": "Global Average Life Expectancy: ",
                "global": 70.9,
        },
            {
                "name": "Country's average Inequality of Outcomes(%): ",
                "value": parseFloat(dataSet[country]["Inequality of Outcomes"]),
                "text": "Global Inequality of Outcomes is average(%): ",
                "global": 23,
        },
            {
                "name": "Country's average ecological footprint(gha/capita): ",
                "value": parseFloat(dataSet[country]["Footprint(gha/capita)"]),
                "text": "Global average ecological footprint(gha/capita): ",
                "global": 3.3,
        }];

        //sort bars
    data = data.sort(function (a, b) {
      return d3.ascending(a.value, b.value);
    })

        // set domain for y scaling
    yChart.domain(data.map(function (d) {
      return d.name;
    }));

    // Update svg element
    var bars = svgChart.selectAll(".bar")
                       .remove()
                       .exit()
                       .data(data)

    // Create bars and tip function
    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", function (d) {
          return yChart(d.name) + chartMargin.top;
        })
        .attr("height", yChart.bandwidth())
        .attr("x", function (d) {
          xChart.domain([0, chartWidth])
          return xChart(chartMargin.left)
        })
        .attr("width", function (d) {
          if (d.name == "Country's Average Wellbeing (0-10): ") {

            xChart.domain([0, 10]);
            return xChart(d.value);

          }else if (d.name == "Country's average ecological footprint(gha/capita): ") {

            xChart.domain([0, 15.8]);
            return xChart(d.value);

          }else if (d.name == "Country's average Inequality of Outcomes(%): ") {

            xChart.domain([0, 100]);
            return xChart(d.value);

          }else if (d.name == "Country's Average Life Expectancy: ") {

            xChart.domain([0, 100]);
            return xChart(d.value);
          }
        })
        .style("fill", function(d){
          if ((d.value / d.global) < 0.50) {
            return "rgb(166,36,48)"
          } else if ((d.value / d.global) < 0.85) {
            return "rgb(242,145,5)"
          } else {
            return "rgb(46,171,102)"
          }
        })
        .on('mouseover',function(d){
          tipChart.show(d);

          d3.select(this)
            .style("opacity", 1)
            .style("stroke","white")
            .style("stroke-width",3);
           })
        .on('mouseout', function(d){
           tipChart.hide(d);

           d3.select(this)
             .style("opacity", 1)
             .style("stroke","white")
             .style("stroke-width",0.3);
           });

  }

  // set margins
  var chartMargin = {
      top: 30,
      right: 50,
      bottom: 80,
      left: 300
  };

  // set width and height
  var chartWidth = 960;
  var chartHeight = 300;

  // calculate margins for bars
  var chartWitdthExPadding = chartWidth - chartMargin.left - chartMargin.right;
  var chartHeightExPadding = chartHeight - chartMargin.top - chartMargin.bottom;

  // set up structure for chart
  var chart = d3.select(".chart")
                .attr("width", chartWidth)
				        .attr("height", chartHeight)

  // set up scaling functions
  var xChart = d3.scaleLinear()
                 .range([0, chartWitdthExPadding])

  var yChart = d3.scaleBand()
                 .rangeRound([chartHeightExPadding, 0])

  // create xAxis
  var xAxis = d3.axisBottom(xChart);

  chart.append("g")
		   .attr("class", "xAxis")
		   .attr("transform", "translate(" + (191) + "," + (chartHeight - chartMargin.bottom) + ")")
		   .call(xAxis)

  // insert y axis text and titles
  var wellbeing = d3.select(".chart")
                    .append("text")
                    .attr("x", 0)
                    .attr("y", chartMargin.top + (chartHeightExPadding / 8 * 7) + 3)
                    .text("Average wellbeing")

  var footprint = d3.select(".chart")
                    .append("text")
                    .attr("x", 0)
                    .attr("y", chartMargin.top + (chartHeightExPadding / 8 * 5) + 3)
                    .text("Average ecological footprint")

  var footprint = d3.select(".chart")
                    .append("text")
                    .attr("x", 0)
                    .attr("y", chartMargin.top + (chartHeightExPadding / 8 * 3) + 3)
                    .text("Inequality of outcomes")

  var footprint = d3.select(".chart")
                    .append("text")
                    .attr("x", 0)
                    .attr("y",chartMargin.top + (chartHeightExPadding / 8 * 1  ) + 3)
                    .text("Life expectancy")

  var title = d3.select(".chart")
                .append("text")
                .attr("x", chartMargin.left + (chartWitdthExPadding / 2) - 300)
                .attr("y", chartMargin.top / 2)
                .text("The four elements of the HPI score compared to the rest of the world")
                .attr("font-size", "20px")

  var xTitle = d3.select(".chart")
                .append("text")
                .attr("x", chartMargin.left + (chartWitdthExPadding / 2) - 345)
                .attr("y", chartHeight - (chartMargin.bottom / 2))
                .text("Country's element average as percentage of world's average")
                .attr("font-size", "20px")

};
