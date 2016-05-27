var drawLocalVsWorldDiagram = function (diagramData) {
    //console.log(diagramData); 
    var local, global;
    if (diagramData[8].totalCounter == 0){
       local = 0;
       global = 0;
    }
    else{
        local = Math.floor( diagramData[6].counterLocal / diagramData[8].totalCounter ); 
        global = Math.floor( diagramData[7].internalCounter / diagramData[8].totalCounter );
    }
    
    
    
    //console.log(local + " " + global);
    // Make monochrome colors and set them as default for all pies
    Highcharts.getOptions().plotOptions.pie.colors = (function () {
        var colors = [],
            base = Highcharts.getOptions().colors[0],
            i;

        for (i = 0; i < 10; i += 1) {
            // Start out with a darkened base color (negative brighten), and end
            // up with a much brighter color
            colors.push(Highcharts.Color(base).brighten((i - 3) / 7).get());
        }
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
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            name: 'Brands',
            data: [
                { name: 'Local', y: local },
                { name: 'World', y: global }
            ]
        }]
    });
};