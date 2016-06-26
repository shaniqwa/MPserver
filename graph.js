/************GLOBAL PARAMS*************/
var pie;
var related;
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var Graph = require('node-graph');
var assert = require('assert');
var async = require("async");
var statusa = 0;
/************GLOBAL PARAMS*************/

/************Default Graph*************/
var structure = {
    pieId: 1,
    nodes: [
        {
            name: 'test1', percent: 0, visited: 0, counter:0
        },
        {
            name: 'test2', percent: 0, visited: 0, counter:0
        }
    ],
    edges: [
        {
            name: 'test1->test2',
            from: 'test1',
            to: 'test2'
        }
    ]
}
var structure2 = {
    pieId: 1,
    nodes: [
        {
            name: 'test1', percent: 0, visited: 0, counter:0
        },
        {
            name: 'test2', percent: 0, visited: 0, counter:0
        }
    ],
    edges: [
        {
            name: 'test1->test2',
            from: 'test1',
            to: 'test2'
        }
    ]
}
/************Default Graph*************/
var gr
/************Constructor*************/
function graph(pieId, mode) {
    this.pieId = parseInt(pieId);
    this.mode = parseInt(mode);
    if(mode == 1){
     gr = null;
     gr = new Graph(structure);
   }
  else{
     gr = null;
     gr = new Graph(structure2);
   }
}

/************Constructor*************/

/************Update Graph*************/
graph.prototype.updateGraph = function() {
    var mode = this.mode;
    var pieId = this.pieId;

    console.log("updateGraph");
    var url = 'mongodb://52.35.9.144:27017/musicprofile';
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      //console.log("Connected correctly to server.");
      var collection = (mode == 1) ? db.collection('Pleasure_graph') : db.collection('Business_graph');
              collection.remove({
                 pieId: pieId
              }); 
    });
    return this.connectDB(pieId, mode);
}
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
          var collection = db.collection('GenresAndRelated');

                collection.findOne({"start": 1}, 
                function(err, document) {
                  if (err) { // didn't found pie data
                     throw err;
                  } 
                  else if(document){ 
                    this.related = document;

                    //set the collections to the correct mode
                    if(mode == 1){
                          var gr = new Graph(structure);
                          var collection = db.collection('Pleasure_pie');
                          var graphsCollection = db.collection('Pleasure_graph');
                    }else if (mode == 2){
                          var gr = new Graph(structure2);
                          var collection = db.collection('Business_pie');
                          var graphsCollection = db.collection('Business_graph');
                        }

                        async.waterfall([
                          //find graph and push to graph element
                            function(callback) {graphsCollection.findOne({"pieId": pieId}, function(err, document) {
                            if (err) { 
                               throw err;
                            } 
                            else if (document){
                                  //structure = document;
                                  for (i in document.nodes){
                                    var someNode = gr.getNode(document.nodes[i].name);
                                    if(typeof someNode === 'undefined')
                                     gr.nodes.push({name:document.nodes[i].name , percent:document.nodes[i].percent , visited:document.nodes[i].visited, counter:document.nodes[i].counter});
                                  }
                                  for(j in document.edges){
                                    var outboundEdges = gr.getEdge(document.edges[j].name); 
                                    if(typeof outboundEdges === 'undefined')
                                     gr.edges.push({name:document.edges[j].name , from:document.edges[j].from , to:document.edges[j].to});
                                  }
                                  // console.log("GRAPH: step 1 - find graph and push to element");
                                  // console.log(gr);
                                 
                                  statusa = 1;
                                  callback();
                                }
                                else{
                                  //pie not found, retuen error!
                                    console.log("GRAPH: can't find graph. mode: " + mode);
                                    callback("GRAPH: can't find graph. mode: " + mode, null);
                                } 
                              }); //end of findOne pie
                                
                            },

                            //find pie 
                            function(callback) {
                              collection.findOne({ pleasurePieId: pieId }, function(err, document) {
                                if (err) { 
                                   throw err;
                                } 
                                else if(document){ //found pie data
                                 
                                   this.pie = document;
                                   // console.log(this.pie);
                                   for(o in this.pie.genres){
                                      for(y in this.related.genres){
                                         var genreNameTemp = this.pie.genres[o].genreName;
                                         var genrePercentTemp = this.pie.genres[o].percent;
                                         if(typeof this.related.genres[y][genreNameTemp] === 'undefined'){
                                          //??
                                         }
                                         else{
                                               if (typeof gr.getNode(genreNameTemp) === 'undefined'){
                                                  gr.nodes.push({name:genreNameTemp , percent:genrePercentTemp , visited:0, counter:0});

                                                  for(n = 0; n < 6; n++){
                                                    var relatedGenre = this.related.genres[y][genreNameTemp][n].related.trim();
                                                    for(m in this.pie.genres){
                                                      pieGenre = this.pie.genres[m].genreName;
                                                      if(pieGenre == relatedGenre){
                                                        //in the pie
                                                        var edgeName = genreNameTemp + "->" + relatedGenre;
                                                        gr.edges.push({name:edgeName, from: genreNameTemp,  to: relatedGenre});
                                                      }
                                                    }
                                                  }
                                               }
                                               else{
                                                var someNode = gr.getNode(genreNameTemp);
                                                someNode.percent = genrePercentTemp;
                                               }
                                         }
                                      }//end second for
                                  }//end first for
                                  callback();
                                  //console.log(structure);  
                                }//end if document (with pie)
                                else{
                                    console.log("GRAPH: can't find pie. mode: " + mode);
                                    callback("GRAPH: can't find pie. mode: " + mode, null);
                                }
                              });     
                            }

                        ], function (err, result) {
                            // all done
                            graphsCollection.update({ pieId: pieId },{ pieId: pieId, nodes: gr.nodes, edges: gr.edges },{ upsert: true });
                                  statusa = 1;
                                  return gr;   
                        }); //end of waterfall
                   }//end if document found (with all genres)
        }); //end of findOne
  });  //end of connection to DB
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
