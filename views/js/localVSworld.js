var drawLocalVsWorldDiagram = function (diagramData) {
    // console.log(diagramData); 
    var local, world;
    if (diagramData.counterTotal == 0){
       local = 0;
       world = 0;
       //console.log("ZERO");
    }
    else{
        local =  diagramData.counterLocal; 
        world = diagramData.counterTotal -  diagramData.counterLocal;
    }

    
    
    // console.log(local + " " + world);
    // Make monochrome colors and set them as default for all pies
    Highcharts.getOptions().plotOptions.pie.colors = (function () {
        var colors = ["#8900fe","#00aae3"];
   
        return colors;
    }());

    // Build the chart
    $('#pieContainer').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {            
            text: 'Local VS World',
            style: {
                textTransform: "camelcase",
                fontFamily: 'Glegoo, serif'
            }
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: ('#00aae3' && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            name: 'Brands',
            data: [
                { name: 'Local', y: local },
                { name: 'World', y: world }
            ]
        }]
    });
};