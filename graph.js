/************GLOBAL PARAMS*************/
var pie;
var related;
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var Graph = require('node-graph');
var assert = require('assert');
var async = require("async");
var statusa = 0;
var mongoose = require('mongoose');

var businessPieSchema = require("./schemas/scheme_businessPie.js").businessPieSchema; 
var BusinessPie = mongoose.model('Business_pie', businessPieSchema, 'Business_pie');

var pleasurePieSchema = require("./schemas/scheme_pleasurePie.js").pleasurePieSchema; 
var PleasurePie = mongoose.model('Pleasure_pie', pleasurePieSchema, 'Pleasure_pie');



var BusinessGraphSchema = require("./schemas/scheme_BusinessGraph.js").BusinessGraphSchema; 
var BusinessGraph = mongoose.model('Business_graph', BusinessGraphSchema, 'Business_graph');

var PleasureGraphSchema = require("./schemas/scheme_PleasureGraph.js").PleasureGraphSchema; 
var PleasureGraph = mongoose.model('Pleasure_graph', PleasureGraphSchema, 'Pleasure_graph');

 
/************GLOBAL PARAMS*************/


/************Default Graph*************/
var gr;
/************Constructor*************/
function graph(pieId, mode) {
    this.pieId = pieId;
    this.mode = mode;
}

/************Constructor*************/

/************Update Graph*************/
// graph.prototype.updateGraph = function() {
//     var mode = this.mode;
//     var pieId = this.pieId;

//     console.log("updateGraph");
//     var url = 'mongodb://52.35.9.144:27017/musicprofile';
//     MongoClient.connect(url, function(err, db) {
//       assert.equal(null, err);
//       //console.log("Connected correctly to server.");
//       var collection = (mode == 1) ? db.collection('Pleasure_graph') : db.collection('Business_graph');
//               collection.remove({
//                  pieId: pieId
//               }); 
//     });
//     return this.connectDB(pieId, mode);
// }
/************Update Graph*************/

graph.prototype.getGraphStatus = function() {
  return statusa;
}

/************Build Graph*************/
graph.prototype.buildGraph = function() {
    console.log("buildGraph");
    return this.connectDB(this.pieId, this.mode);
}
/************Build Graph*************/

/************Connect to DB and load the pie's and the related*************/
graph.prototype.connectDB = function(pieId, mode) {

     var url = 'mongodb://52.35.9.144:27017/musicprofile';
      MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server.");
          var is_graph = false;
          var collection = db.collection('GenresAndRelated');
          //set the collections to the correct mode
          if(mode == 1){
                // var gr = new Graph(structure);
                console.log("GRAPH: mode = pleasure pie");
                // var collection = db.collection('Pleasure_pie');
                var graphsCollection = db.collection('Pleasure_graph');
          }else if (mode == 2){
                // var gr = new Graph(structure2);
                console.log("GRAPH: mode = business pie");
                // var collection = db.collection('Business_pie');
                var graphsCollection = db.collection('Business_graph');
              }

              async.waterfall([
                //find graph and push to graph element
                  function(callback) {
                    console.log("looking for graph");
                    if(mode == 1){
                      PleasureGraph.findOne({"pieId" : pieId}, function(err, document) {
                        if (err) { 
                           throw err;
                        } 
                        else if (document){
                              console.log("found gragh");
                              var structure = {};
                                  structure.nodes = [];
                                  structure.edges = [];
                              // console.log(document);
                              //structure = document;
                              for (i in document.nodes){
                                 structure.nodes.push({name:document.nodes[i].name , percent:document.nodes[i].percent , visited:document.nodes[i].visited, counter:document.nodes[i].counter});
                              }
                              for(j in document.edges){
                                 structure.edges.push({name:document.edges[j].name , from:document.edges[j].from , to:document.edges[j].to});
                              }
                              gr = new Graph(structure);
                              is_graph = true;

                              statusa = 1;
                              callback();
                            }
                            else{
                              //pie not found, retuen error!
                                console.log("GRAPH: can't find graph. mode: " + mode);
                                callback();
                            } 
                    }); //end of findOne pie  
                    }else if(mode ==2){
                      BusinessGraph.findOne({"pieId" : pieId}, function(err, document) {
                        if (err) { 
                           throw err;
                        } 
                        else if (document){
                              console.log("found gragh");
                              var structure = {};
                                  structure.nodes = [];
                                  structure.edges = [];
                              // console.log(document);
                              //structure = document;
                              for (i in document.nodes){
                                 structure.nodes.push({name:document.nodes[i].name , percent:document.nodes[i].percent , visited:document.nodes[i].visited, counter:document.nodes[i].counter});
                              }
                              for(j in document.edges){
                                 structure.edges.push({name:document.edges[j].name , from:document.edges[j].from , to:document.edges[j].to});
                              }
                              gr = new Graph(structure);
                              is_graph = true;

                              statusa = 1;
                              callback();
                            }
                            else{
                              //pie not found, retuen error!
                                console.log("GRAPH: can't find graph. mode: " + mode);
                                callback();
                            } 
                    }); //end of findOne pie
                    }
                    
                      
                  },

                  //find pie 
              function(callback) {
                if(!is_graph){
                  console.log("GRAPH: no graph,  looking for pieId: " + pieId);
                    collection.findOne({"start": 1}, function(err, genresAndRelated) {
                      if (err) { // didn't found pie data
                         throw err;
                      }
                      else if(genresAndRelated){ 
                          if(mode == 1){
                            PleasurePie.findOne({ pleasurePieId : pieId }, function(err, pie) {
                            if (err) { 
                               throw err;
                            } 
                            
                            if(pie){ //found pie data
                              console.log("found the pie, building graph");
                              
                               this.pie = pie;
                               // console.log(this.pie);
                               var structure = {};
                                      structure.nodes = [];
                                      structure.edges = [];

                               for(o in this.pie.genres){
                                  var genreNameTemp = this.pie.genres[o].genreName;
                                  var genrePercentTemp = this.pie.genres[o].percent;
                                  structure.nodes.push({name:genreNameTemp , percent:genrePercentTemp , visited:0, counter:0});
                                  for(y in genresAndRelated.genres){
                                     if( ! (typeof genresAndRelated.genres[y][genreNameTemp] === 'undefined' ) ){
                                          for(n = 0; n < 6; n++){
                                            var relatedGenre = genresAndRelated.genres[y][genreNameTemp][n].related.trim();
                                            for(m in this.pie.genres){
                                              pieGenre = this.pie.genres[m].genreName;
                                              if(pieGenre == relatedGenre){
                                                //in the pie
                                                var edgeName = genreNameTemp + "->" + relatedGenre;
                                                structure.edges.push({name:edgeName, from: genreNameTemp,  to: relatedGenre});
                                              }
                                            }
                                          }
                                      }
                                     }//end second for
                                  }//end first for
                                  console.log("GRAPH: finished buiding pragh from pie");
                                  console.log(structure);
                                  structure.pieId = pieId;
                                  var temp = new PleasureGraph(structure);
                                  temp.save(function(err,doc){
                                    gr = new Graph(structure);
                                    callback();  
                                  });
                                  
                                  
                              }else{
                                console.log("GRAPH: can't find pie. mode: " + mode);
                                callback();
                              }
                            });  
                          }else if (mode == 2){
                               BusinessPie.findOne({ businessPieId : pieId }, function(err, pie) {
                                  if (err) { 
                                     throw err;
                                  } 
                                  
                                  if(pie){ //found pie data
                                    console.log("found the pie, building graph");
                                     this.pie = pie;
                                     // console.log(this.pie);
                                     var structure = {};
                                            structure.nodes = [];
                                            structure.edges = [];

                                     for(o in this.pie.genres){
                                        var genreNameTemp = this.pie.genres[o].genreName;
                                        var genrePercentTemp = this.pie.genres[o].percent;
                                        structure.nodes.push({name:genreNameTemp , percent:genrePercentTemp , visited:0, counter:0});
                                        for(y in genresAndRelated.genres){
                                           if( ! (typeof genresAndRelated.genres[y][genreNameTemp] === 'undefined' ) ){
                                                for(n = 0; n < 6; n++){
                                                  var relatedGenre = genresAndRelated.genres[y][genreNameTemp][n].related.trim();
                                                  for(m in this.pie.genres){
                                                    pieGenre = this.pie.genres[m].genreName;
                                                    if(pieGenre == relatedGenre){
                                                      //in the pie
                                                      var edgeName = genreNameTemp + "->" + relatedGenre;
                                                      structure.edges.push({name:edgeName, from: genreNameTemp,  to: relatedGenre});
                                                    }
                                                  }
                                                }
                                            }
                                           }//end second for
                                        }//end first for
                                        console.log("GRAPH: finished buiding pragh from pie");
                                        console.log(structure);
                                        structure.pieId = pieId;
                                          var temp = new BusinessGraph(structure);
                                          temp.save(function(err,doc){
                                            gr = new Graph(structure);
                                            callback();  
                                          });
                                    }else{
                                      console.log("GRAPH: can't find pie. mode: " + mode);
                                      callback();
                                    }
                            });  
                         }
                 }
                });

                    }else{
                      console.log("GRAPH: graph already exsist. just load it");
                      callback();
                    }
                  }

              ], function (err, result) {
                  // all done
                  console.log("GRAPH: all done");
                  statusa = 1;
              }); //end of waterfall
      });  
} //end of function
/************Connect to DB and load the pie's and the related*************/           

/************NextGenres for NextSong use*************/   
graph.prototype.nextGenre = function(userId, startGenre, currGenre) {
  console.log(" ");
  console.log(" ");
  console.log("*************************************");
  console.log("file graph.js function nextGenre -->");
  console.log("*************************************");
  console.log("userId: " + userId + " startGenre: " + startGenre + " currGenre: " + currGenre);
  console.log(" ");
  console.log(" ");

    if(this.nextNode(currGenre)){ //if there is a circle in the graph and there are no nodes connected
       //return to stas genre after random
          return this.getRandomGenre(startGenre, currGenre);
    }
     
    else{ 

      for(i in gr.nodes){
          gr.nodes[i].visited = 0;
      }
       
       return false; 
    }
}
/************NextGenres for NextSong use*************/   

/************Checks if there are next nodes*************/  
graph.prototype.nextNode = function(currGenre) {
    var someNode = gr.getNode(currGenre);
    if(typeof someNode === 'undefined'){
      console.log("#: there is not " + currGenre + " genre in the pie");
      return false;
    }
      

    var outboundEdges = gr.outboundEdges(currGenre); 
    if(typeof outboundEdges[0] === 'undefined'){
      console.log("#: there are no nextNodes of " + currGenre + " in the pie");
      return false;
    }
    else{
      return true;
    }
}
/************Checks if there are next nodes*************/  

/************Searching for cycles in the graph*************/ 
graph.prototype.findCycle = function(startGenre, currGenre) {
    var someNode = gr.getNode(currGenre);
    if(someNode.visited == 0){
       return true;
    }
    else{
      console.log(" ");
      console.log(" ");
      console.log("*************************************************");
      console.log("#: nextGenre of " + currGenre + " creats a cycle");
      console.log("print cycle: ")
     
      for(b in gr.nodes){
        if (gr.nodes[b].visited == 1){
          console.log(gr.nodes[b].name + "=> ");
        }
      }
      
      console.log("*************************************************");
      console.log(" ");
      console.log(" ");
      return false;
    }
}
/************Searching for cycles in the graph*************/ 

/************Get graph json*************/ 
graph.prototype.getGraph = function() {
      return gr;
}
/************Get graph json*************/ 

/************returns random genre on account of percents*************/ 
graph.prototype.getRandomGenre = function(startGenre, currGenre) {
    var genres = [];
    var genresWeight = []; //weight of each element above
    var outboundEdges = gr.outboundEdges(currGenre);
    for(i in outboundEdges){
      if(this.findCycle(startGenre, outboundEdges[i].to)){
         genres.push(outboundEdges[i].to);
         var percent = gr.getNode(outboundEdges[i].to);
         genresWeight.push(percent.percent);
      }
      else{
        for(i in gr.nodes){
          gr.nodes[i].visited = 0;
        }
        
        return false;
      }
    }
    var totalweight=eval(genresWeight.join("+")); //get total weight (in this case, 100)
    var weighedGenres=new Array(); //new array to hold "weighted" genres
    var currentGenre = 0;
    while (currentGenre<genres.length){ //step through each genres[] element
        for (i=0; i<genresWeight[currentGenre]; i++)
            weighedGenres[weighedGenres.length]=genres[currentGenre];
        currentGenre++;
    }
    var randomnumber = Math.floor(Math.random()*totalweight);
    var temp = weighedGenres[randomnumber];
    gr.getNode(temp).counter++;
    gr.getNode(temp).visited++;
    if(typeof startGenre === 'undefined'){
      return false;
    }
    var firstNode = gr.getNode(startGenre);
    if(typeof firstNode === 'undefined'){
      return false;
    }
    firstNode.visited = 1;
    
    return weighedGenres[randomnumber];
}
/************returns random genre on account of percents*************/ 
module.exports = statusa;
module.exports = graph;
