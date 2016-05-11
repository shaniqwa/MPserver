var drawAgeGroupDiagram = function (diagramData) {
    // Create the chart
var dataSum = 0;
dataSum = parseInt(diagramData.counterAgeGroup1) + parseInt(diagramData.counterAgeGroup2) + parseInt(diagramData.counterAgeGroup3) + parseInt(diagramData.counterAgeGroup4) + parseInt(diagramData.counterAgeGroup5) + parseInt(diagramData.counterAgeGroup6);

    $('#AGcontainer').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Age Group'
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
            title: {
                text: ''
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}%',
                     formatter:function() {
                    var pcnt = (this.y / dataSum) * 100;
                    return Highcharts.numberFormat(pcnt) + '%';
                    }
                }
            }
        },

        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
        },

        series: [{
            name: 'Brands',
            colorByPoint: true,
            data: [{
                name: 'under 14',
                y: (diagramData.counterAgeGroup1 / dataSum) * 100,
                drilldown: 'under 14'
            }, {
                name: '15-24',
                y: (diagramData.counterAgeGroup2 / dataSum) * 100,
                drilldown: '15-24'
            }, {
                name: '25-34',
                y:  (diagramData.counterAgeGroup3 / dataSum) * 100,
                drilldown: '25-34'
            }, {
                name: '35-44',
                y:  (diagramData.counterAgeGroup4 / dataSum) * 100,
                drilldown: '35-44'
            }, {
                name: '45-55',
                y:  (diagramData.counterAgeGroup5 / dataSum) * 100,
                drilldown: '45-55'
            }, {
                name: '55+',
                y:  (diagramData.counterAgeGroup6 / dataSum) * 100,
                drilldown: '55+'
            }]
        }],
        drilldown: {
            series: [{
                name: 'Microsoft Internet Explorer',
                id: 'Microsoft Internet Explorer',
                data: [
                    // [
                    //     'v11.0',
                    //     24.13
                    // ],
                    // [
                    //     'v8.0',
                    //     17.2
                    // ],
                    // [
                    //     'v9.0',
                    //     8.11
                    // ],
                    // [
                    //     'v10.0',
                    //     5.33
                    // ],
                    // [
                    //     'v6.0',
                    //     1.06
                    // ],
                    // [
                    //     'v7.0',
                    //     0.5
                    // ]
                ]
            }, {
                name: 'Chrome',
                id: 'Chrome',
                data: [
                    // [
                    //     'v40.0',
                    //     5
                    // ],
                    // [
                    //     'v41.0',
                    //     4.32
                    // ],
                    // [
                    //     'v42.0',
                    //     3.68
                    // ],
                    // [
                    //     'v39.0',
                    //     2.96
                    // ],
                    // [
                    //     'v36.0',
                    //     2.53
                    // ],
                    // [
                    //     'v43.0',
                    //     1.45
                    // ],
                    // [
                    //     'v31.0',
                    //     1.24
                    // ],
                    // [
                    //     'v35.0',
                    //     0.85
                    // ],
                    // [
                    //     'v38.0',
                    //     0.6
                    // ],
                    // [
                    //     'v32.0',
                    //     0.55
                    // ],
                    // [
                    //     'v37.0',
                    //     0.38
                    // ],
                    // [
                    //     'v33.0',
                    //     0.19
                    // ],
                    // [
                    //     'v34.0',
                    //     0.14
                    // ],
                    // [
                    //     'v30.0',
                    //     0.14
                    // ]
                ]
            }, {
                name: 'Firefox',
                id: 'Firefox',
                data: [
                    // [
                    //     'v35',
                    //     2.76
                    // ],
                    // [
                    //     'v36',
                    //     2.32
                    // ],
                    // [
                    //     'v37',
                    //     2.31
                    // ],
                    // [
                    //     'v34',
                    //     1.27
                    // ],
                    // [
                    //     'v38',
                    //     1.02
                    // ],
                    // [
                    //     'v31',
                    //     0.33
                    // ],
                    // [
                    //     'v33',
                    //     0.22
                    // ],
                    // [
                    //     'v32',
                    //     0.15
                    // ]
                ]
            }, {
                name: 'Safari',
                id: 'Safari',
                data: [
                    // [
                    //     'v8.0',
                    //     2.56
                    // ],
                    // [
                    //     'v7.1',
                    //     0.77
                    // ],
                    // [
                    //     'v5.1',
                    //     0.42
                    // ],
                    // [
                    //     'v5.0',
                    //     0.3
                    // ],
                    // [
                    //     'v6.1',
                    //     0.29
                    // ],
                    // [
                    //     'v7.0',
                    //     0.26
                    // ],
                    // [
                    //     'v6.2',
                    //     0.17
                    // ]
                ]
            }, {
                name: 'Opera',
                id: 'Opera',
                data: [
                    // [
                    //     'v12.x',
                    //     0.34
                    // ],
                    // [
                    //     'v28',
                    //     0.24
                    // ],
                    // [
                    //     'v27',
                    //     0.17
                    // ],
                    // [
                    //     'v29',
                    //     0.16
                    // ]
                ]
            }]
        }
    });
};