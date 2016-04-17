function drawPie(pieData,profileImg) {

Highcharts.Renderer.prototype.color = function (color, elem, prop) {

    if (color && color.pattern && prop === 'fill') {
        // SVG renderer
        if (this.box.tagName == 'svg') {
            var patternA,
                patternB,
                bgColor,
                bgPattern,
                image,
                id;

            id = 'highcharts-pattern-' + idCounter++;

            patternA = this.createElement('pattern')
            .attr({
                id: id,
                patternUnits: 'userSpaceOnUse',
                width: '100%',
                height: '100%'
            })
            .add(this.defs);

            patternB = this.createElement('pattern')
            .attr({
                id: id + '-image',
                patternUnits: 'userSpaceOnUse',
                width: color.width,
                height: color.width
            })
            .add(this.defs);

            image = this.image(color.pattern, 0, 0, 6, 6)
            .add(patternB);


            bgColor = this.rect(0, 0, 0, 0, 0, 0)
            .attr({
                fill: color.fill,
                width: '100%',
                height: '100%'
            })
            .add(patternA);


            bgPattern = this.rect(0, 0, 0, 0, 0, 0)
            .attr({
                fill: 'url(' + this.url + '#' + id + '-image)',
                width: '100%',
                height: '100%'
            })
            .add(patternA);

            return 'url(' + this.url + '#' + id + ')';

            // VML renderer
        } else {
            var markup = ['<', prop, ' type="tile" src="', color.pattern, '" />'];
            elem.appendChild(
            document.createElement(this.prepVML(markup)));
        }

    } else {
        return base.apply(this, arguments);
    }
};


/**
 * Dark theme for Highcharts JS
 * @author Torstein Honsi
 */

// Load the fonts
Highcharts.createElement('link', {
   href: '//fonts.googleapis.com/css?family=Source+Sans+Pro',
   rel: 'stylesheet',
   type: 'text/css'
}, null, document.getElementsByTagName('head')[0]);

Highcharts.theme = {
   colors: ["#06befe", "#3872f8", "#8900fe", "#d120a6", "#ff166f","#d120a6", "#8900fe","#3872f8","#ff166f"],
   chart: {
      // backgroundColor: {
      //    linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
      //    stops: [
      //       [0, '#2a2a2b'],
      //       [1, '#3e3e40']
      //    ]
      // },
      backgroundColor: '#333335',
      style: {
         fontFamily: "'Source Sans Pro', sans-serif"
      },
      plotBorderColor: '#606063'
   },
   title: {
      style: {
         color: '#E0E0E3',
         textTransform: 'uppercase',
         fontSize: '24px'
      }
   },
   subtitle: {
      style: {
         color: '#E0E0E3',
         textTransform: 'uppercase'
      }
   },
   xAxis: {
      gridLineColor: '#707073',
      labels: {
         style: {
            color: '#E0E0E3'
         }
      },
      lineColor: '#707073',
      minorGridLineColor: '#505053',
      tickColor: '#707073',
      title: {
         style: {
            color: '#A0A0A3'

         }
      }
   },
   yAxis: {
      gridLineColor: '#707073',
      labels: {
         style: {
            color: '#E0E0E3'
         }
      },
      lineColor: '#707073',
      minorGridLineColor: '#505053',
      tickColor: '#707073',
      tickWidth: 1,
      title: {
         style: {
            color: '#A0A0A3'
         }
      }
   },
   tooltip: {
      // backgroundColor: 'rgba(0, 0, 0, 0.85)',
      useHTML: true,
      animation: true,
      borderWidth: 0,
      style: {
         color: '#F0F0F0',
         fontSize: '16px'
      },
      shape: 'circle',
      style: {
        zIndex: 9999,
        opacity: 0
      }
   },
   plotOptions: {
      series: {
         dataLabels: {
            color: '#B0B0B3'
         },
         marker: {
            lineColor: '#333'
         }
      },
      boxplot: {
         fillColor: '#505053'
      },
      candlestick: {
         lineColor: 'white'
      },
      errorbar: {
         color: 'white'
      }
   },
   legend: {
      itemStyle: {
         color: '#E0E0E3'
      },
      itemHoverStyle: {
         color: '#FFF'
      },
      itemHiddenStyle: {
         color: '#606063'
      }
   },
   credits: {
      style: {
         color: '#666'
      }
   },
   labels: {
      style: {
         color: '#707073',
         fontSize: '20px'
      }
   },

   drilldown: {
      activeAxisLabelStyle: {
         color: '#F0F0F3'
      },
      activeDataLabelStyle: {
         color: '#F0F0F3',
         fontSize: '20px'
      }
   },

   navigation: {
      buttonOptions: {
         symbolStroke: '#DDDDDD',
         theme: {
            fill: '#505053'
         }
      }
   },

   // scroll charts
   rangeSelector: {
      buttonTheme: {
         fill: '#505053',
         stroke: '#000000',
         style: {
            color: '#CCC'
         },
         states: {
            hover: {
               fill: '#707073',
               stroke: '#000000',
               style: {
                  color: 'white'
               }
            },
            select: {
               fill: '#000003',
               stroke: '#000000',
               style: {
                  color: 'white'
               }
            }
         }
      },
      inputBoxBorderColor: '#505053',
      inputStyle: {
         backgroundColor: '#333',
         color: 'silver'
      },
      labelStyle: {
         color: 'silver'
      }
   },

   navigator: {
      handles: {
         backgroundColor: '#666',
         borderColor: '#AAA'
      },
      outlineColor: '#CCC',
      maskFill: 'rgba(255,255,255,0.1)',
      series: {
         color: '#7798BF',
         lineColor: '#A6C7ED'
      },
      xAxis: {
         gridLineColor: '#505053'
      }
   },

   scrollbar: {
      barBackgroundColor: '#808083',
      barBorderColor: '#808083',
      buttonArrowColor: '#CCC',
      buttonBackgroundColor: '#606063',
      buttonBorderColor: '#606063',
      rifleColor: '#FFF',
      trackBackgroundColor: '#404043',
      trackBorderColor: '#404043'
   },

   // special colors for some of the
   legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
   background2: '#505053',
   dataLabelsColor: '#B0B0B3',
   textColor: '#C0C0C0',
   contrastTextColor: '#F0F0F3',
   maskColor: 'rgba(255,255,255,0.3)'
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);

    var colors = Highcharts.getOptions().colors,
        categories = [],
        data = [];
        var counter = 0;
        for(i in pieData){
            if($.inArray(pieData[i].category, categories) == -1){
                categories.push(pieData[i].category);
// console.log("color: " + counter);
                var obj = {
                    y: 0,
                    color: colors[counter],
                    drilldown: {
                        name: pieData[i].category,
                        categories: [],
                        data: [],
                        color: colors[counter]
                    }
                }
                    data.push(obj);
                    counter++;
            }
        }
        // console.log(data);
        

        for(i in data){
            for(j in pieData){
                if(pieData[j].category == data[i].drilldown.name){
                    data[i].y += pieData[j].percent;
                    data[i].y = Math.round(data[i].y * 100)/100;
                    data[i].drilldown.categories.push(pieData[j].genreName);
                    data[i].drilldown.data.push(pieData[j].percent);
                }
            }
        }

        var browserData = [],
            versionsData = [],
            i,
            j,
            dataLen = data.length,
            drillDataLen,
            brightness;


    // Build the data arrays
    for (i = 0; i < dataLen; i += 1) {

        // add browser data
        browserData.push({
            name: categories[i],
            y: data[i].y,
            color: data[i].color
        });

        // add version data
        drillDataLen = data[i].drilldown.data.length;
        for (j = 0; j < drillDataLen; j += 1) {
            brightness = 0.2 - (j / drillDataLen) / 2;
            versionsData.push({
                name: data[i].drilldown.categories[j],
                y: data[i].drilldown.data[j],
                color: Highcharts.Color(data[i].color).brighten(brightness).get()
            });
        }
    }


// var pixelX = 438;
// var pixelY = 276;
// var pixelR = 70;

    var circleX = 438;
    var circleY = 276;
    var circleR = 67;

function addCircle(chart){
    if (this.circle){
        // on a redraw, remove old circle
        $(this.circle.element).remove();
    }

    // translate my coordinates to pixel values
    var pixelX = chart.plotLeft + (chart.plotWidth  * 0.5) - (1  * 0.5);
    var pixelY = chart.plotTop  + (chart.plotHeight * 0.5) + (1 * 0.25);
    var pixelR = circleR;     

    // add my circle
    this.circle = chart.renderer.circle(pixelX, pixelY, pixelR).attr({
        zIndex: 100,
        align: 'center',
        fill: 'url(#pattern)',
        stroke: 'black',
        'stroke-width': 0
        });
    this.circle.add();        
}


    // Create the chart
    $('#MPcontainer').highcharts({
        chart: {
            type: 'pie',
            events:{
              load: function(){
                addCircle(this); 
              },
              redraw: function(){
                addCircle(this); 
              }
          }
                   
        },
        title: {
            text: 'Music Profile'
        },
        subtitle: {
            text: 'Explore your pie'
        },
        yAxis: {
            title: {
                text: 'Total percent market share'
            }
        },
        plotOptions: {
            pie: {
                borderColor: '#3e3e40',
                shadow: false,
                center: ['50%', '50%']
            }
        },
        tooltip: {
            valueSuffix: '%',
            positioner: function () {
        var tooltipX, tooltipY;
        tooltipX = this.chart.plotLeft + (this.chart.plotWidth  * 0.5)  - (152  * 0.5);;
        tooltipY = this.chart.plotTop  + (this.chart.plotHeight * 0.5) - (150 * 0.5);;
            return { x: tooltipX, y: tooltipY };
        },
        formatter: function () {
          var color = this.color;
          color = color.replace("rgb", "rgba");
          color = color.replace(")", ",0.6)");

          var name = toTitleCase(this.point.name);


          // console.log(color);
        return '<div class="custom-tooltip" style="background-color:' + color + '"><span><p>' + name + '</p>' + '<p><b>' + Highcharts.numberFormat(this.y).replace(",", " ") +'%</b></p></span></div>';
    },
        },
        series: [{
            name: ' ',
            data: browserData,
            size: '70%',
            dataLabels: {
                formatter: function () {
                    return this.y > 5 ? this.point.name : null;
                },
                color: '#ffffff',
                distance: -30
            }
        }, {
            name: ' ',
            data: versionsData,
            size: '85%',
            innerSize: '95%',
            cursor: 'pointer',
            events: {
                    click: function (event) {
                        // console.log(event.point.name);
                        sendEvent(event.point.name);
                    }
            },
            dataLabels: {
                formatter: function () {
                    // display only if larger than 1
                    return this.y > 1 ? '<b>' + this.point.name + ':</b> ' + this.y + '%' : null;
                }
            }
        }]
    }
    , function(chart) { // on complete

      var imgX = $("#MPcontainer").width()/2-77.5,
          imgY = 200;
    // chart.renderer.image('https://lh6.googleusercontent.com/-gaAgFzRLxQQ/AAAAAAAAAAI/AAAAAAAAAjc/ies0iU4BEqU/photo.jpg', imgX, imgY, 150, 150)
    //     .attr({
    //           zIndex: 100,
    //           class: 'img-circle',
    //           id: 'profileImg'
    //       })
    //     .css({

    //       })
    //     .add();   
    
    // var pixelX = 438;
    // var pixelY = 276;
    // var pixelR = 70;

    // // add my circle
    // chart.renderer.circle(pixelX, pixelY, pixelR)
    // .attr({
    //     zIndex: 100,
    //     align: 'center',
    //     fill: 'url(https://lh6.googleusercontent.com/-gaAgFzRLxQQ/AAAAAAAAAAI/AAAAAAAAAjc/ies0iU4BEqU/photo.jpg)',
    //     stroke: 'black',
    //     'stroke-width': 2
    //     })
    // .add();        






    var r = chart.renderer,
        pattern = r.createElement('pattern')
            .attr({
                id: 'pattern',
                patternUnits: 'userSpaceOnUse',
                x: 0,
                y: 0,
                width: 180,
                height: 190,
                viewBox: '0 0 135 135'
            })
            .add(r.defs);

   r.rect(0, 0, 135, 135, 0)
       .attr('fill', '#ddd')
       .add(pattern);
    
   r.image(profileImg,0,0,135,135)
       .add(pattern);
});


// document.addEventListener("getPlaylist", getPlaylistHandler, false);
};






function sendEvent(currGenre){
    $("#currGenre").html(currGenre);
    $("#currGenre").trigger("click");
    // var event = new CustomEvent(
    //     "getPlaylist", 
    //     {
    //         detail: {
    //             message: "a user request playlist",
    //             genre: currGenre,
    //             time: new Date(),
    //         },
    //         bubbles: true,
    //         cancelable: true
    //     }
    // );
    // document.getElementById("currGenre").dispatchEvent(event);
    
}


function convertHex(hex,opacity){
    hex = hex.replace('#','');
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);

    result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
    return result;
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

// function getPlaylistHandler(event){
//     console.log(event);
// }
