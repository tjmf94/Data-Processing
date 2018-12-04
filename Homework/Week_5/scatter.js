// Thomas Franx
// 12485640
// Data Processing assignment week 5

window.onload = function() {

  console.log('Yes, you can!')
  loadData()
};

function loadData(){
  var womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
  var consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"

  var requests = [d3.json(womenInScience), d3.json(consConf)];

  Promise.all(requests).then(function(response) {
    // var data = cleanData(response)
    console.log(response[0])
    console.log(response[0].dataSets[0].series["0:0"].observations);
  }).catch(function(e){
    throw(e);
  });
}

// function cleanData(response){
//   for
// }
ss
