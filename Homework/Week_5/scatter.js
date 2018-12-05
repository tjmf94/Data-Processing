// Thomas Franx
// 12485640
// Data Processing assignment week 5

window.onload = function() {

  // Insert header, personal information and introduction.
  d3.select("body").append("h2").text("D3 Scatterplot: the relationship between Consumer Confidence and the percentage of Women in Science.");
  d3.select("body").append("h4").text("Thomas Franx, 12485640");
  d3.select("body").append("p").text("This scatterplot show the relationship between the level of consumer confidence and the percentage of Women that are employed in Science, which appears to be limited.")
  d3.select("body").append("p").text("The data is downloaded from OECD statistics website (https://stats.oecd.org).");

  var years = ["2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015"];

  var select = d3.select('body')
                 .append('select')
  	             .attr('class','select')
                 .on('change', onchange)

  var options = select.selectAll('option')
               	      .data(years)
                      .enter()
               	      .append('option')
               		    .text(function (d) { return d; });

  // specify width and height to create scatterplot
  function onchange() {
    year = d3.select('select').property('value');
    createScatter(year, 1000, 500);
};

};

function createScatter(year, width, height){
  var womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
  var consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"

  var requests = [d3.json(womenInScience), d3.json(consConf)];

  Promise.all(requests).then(function(response) {
    const data = cleanData(response);
    drawDots(data, year, width, height);

  }).catch(function(e){
    throw(e);
  });
}

function cleanData(response){

  // create variables for response data
  const womenInScienceData = response[0];
  const consumerConfidenceData = response[1];

  // create object to store data
  var dataObj = {};

  // loop over years
  for (yearNumber in consumerConfidenceData.structure.dimensions.observation[0]["values"]){

    // create object for each year
    var year = consumerConfidenceData.structure.dimensions.observation[0]["values"][yearNumber]["id"]
    dataObj[year] = {};

    // loop over countries
    for (countryNumber in consumerConfidenceData.structure.dimensions.series[0]["values"]){

      // add list for each country
      var country = consumerConfidenceData.structure.dimensions.series[0]["values"][countryNumber]["name"];
      dataObj[year][country] = [];

      // append consumer confidence data to country list
      var consumerConfidenceValue = consumerConfidenceData.dataSets[0].series[countryNumber + ":0:0"].observations[yearNumber][0];
      dataObj[year][country].push(consumerConfidenceValue);

      // if women in science data is available, append to country list
      if (womenInScienceData.dataSets[0].series["0:" + countryNumber].observations.hasOwnProperty(yearNumber)){
        var womenInScienceValue = womenInScienceData.dataSets[0].series["0:" + countryNumber].observations[yearNumber][0];
        dataObj[year][country].push(womenInScienceValue);

      // if unavailable, append "unknown to list"
      }else{
        dataObj[year][country].push("unknown");
      }
    }
  }
  // return cleaned data
  return dataObj;
}

function drawDots(data, year, width, height){

  // put data in right format for drawing circles
  const dataLists = createDataLists(data);

  // set padding
  var padding = 50;

  // create function for x-axis scaling
  var xScale = d3.scaleLinear()
                       .domain([0, d3.max(dataLists[year], function(d) { return d[2]; }) * 1.5])
                       .range([padding, width - padding * 2]);

  // create function for y-axis scaling
  var yScale = d3.scaleLinear()
                       .domain([0, d3.max(dataLists[year], function(d) { return d[1]; }) * 1.5])
                       .range([height - padding, padding * 2]);

  //Create SVG element
  var svg = d3.select("body")
              .append("svg")
              .attr("width", width)
              .attr("height", height);

  // draw circles
  svg.selectAll("circle")
     .data(dataLists[year])
     .enter()
     .append("circle")
     .attr("cx", function(d) {
       if isNumber(d[2]){
         return xScale(d[2]);
       }
     })
     .attr("cy", function(d) {
       return yScale(d[1]);
     })
     .attr("r", 7)
     .attr("fill", function(d) {
       return generateColor(d[0])
     });

  createAxis(dataLists, year, width, height, padding, xScale, yScale, svg);
}


function createDataLists(data){

  // create object to store datalists
  dataLists = {};

  // loop over years of input data Object and create dictionary for each year
  for (years in data){
    dataLists[years] = []

    // set counter for value positions
    valueCounter = 0;

    // loop over countries and add list containing country name for each country
    for (country in data[years]){
      dataLists[years].push([country])

      // loop over data values and add to list for each country
      for (value in data[years][country]){
        dataLists[years][valueCounter].push(data[years][country][value])
      }
      // increase counter to reach next country list
      valueCounter += 1;
    }
  }
    // return data in format reading for drawing circles
    return dataLists
}

function generateColor(country){

  // generate dot colors
  if (country == "France"){
    return "#d73027"
  }else if (country == "Netherlands"){
    return "#fc8d59"
  }else if (country == "Portugal"){
    return "#fee090"
  }else if (country == "Germany"){
    return "#e0f3f8"
  }else if (country == "United Kingdom"){
    return "#91bfdb"
  }else{
    return "#4575b4"
  }
}


function createAxis(dataLists, year, width, height, padding, xScale, yScale, svg){

  // define x-axis
  var xAxis = d3.axisBottom()
                .scale(xScale);

  // define y-axis
  var yAxis = d3.axisLeft()
                .scale(yScale);
  // Create x-axis
  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(0," + (height - padding) + ")")
     .call(xAxis);

  // Create y-axis
  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(" + padding + ",0)")
     .call(yAxis);

  // add title
  svg.append('text')
     .attr('class', 'Title')
     .attr('x', width * 0.475)
     .attr('y', padding * 2.5)
     .attr('text-anchor', 'middle')
     .text('Relation between Consumer confidence and Women researchers as a percentage of total researchers');

  // add x-axis title
  svg.append('text')
     .attr('class', 'AxisTitle')
     .attr('x', width * 0.475)
     .attr('y', height - (padding / 5))
     .attr('text-anchor', 'middle')
     .text('Women researchers as a percentage of total researchers');

  // add y-axis title
  svg.append('text')
     .attr('class', 'AxisTitle')
     .attr('x', -270)
     .attr('y', 15)
     .attr("transform", "rotate(-90)")
     .attr('text-anchor', 'middle')
     .text('Consumer confidence');

  // add legend
  svg.append("rect")
     .attr("x", width - (padding * 5.4))
     .attr("y", height - (padding * 4.5))
     .attr("width", width / 6)
     .attr("height", height / 3)
     .attr("fill", "#cccccc")
     .attr("stroke", "#525252")
     .attr("stroke-width", 2);

  // add word legend
  svg.append('text')
     .attr('class', 'legendText')
     .attr('x', width - (padding * 5.4) + (width / 35))
     .attr('y', height - (padding * 4.5) + (height / 25))
     .attr('text-anchor', 'middle')
     .text('Legend:');

  // set up for legend dots and text
  var legend = svg.selectAll("legend")
                  .data(dataLists[year])
                  .enter()
                  .append("g")
                  .attr("class", "legend")
                  .attr("transform", function(d, i) {
                    return "translate(0," + i * 25 +")";
                  });

  // add text to legend
  legend.append("text")
            .attr('x', width - (padding * 5.4) + (width / 25) + (width / 50))
            .attr('y', height - (padding * 4.5) + (height / 25) + (height / 30))
            .text(function(d){
              return d[0]
            });

  // add dots to legend
  legend.append("circle")
        .attr("cx", width - (padding * 5.4) + (width / 35))
        .attr("cy", height - (padding * 4.5) + (height / 25) + (height / 40))
        .attr("r", 7)
        .attr("fill", function(d) {
          return generateColor(d[0])
        })

}
