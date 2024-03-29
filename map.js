var size = 500;

var mapProjection;

var map, ocean, graticule, countries;

var isGlobe = true;

var rotateX = 0;

var path;
var rotation;

window.onresize = function () {
    size = window.innerWidth / 2;
    var scale = size / 500;
    d3.select("svg").attr("width", size * 2).attr("height", size + 10).style("width", size * 2 + "px").style("height", size * 2 + "px");
    d3.select("#map").attr("transform","scale(" + scale + ")");
};

var mapFeatures, chapterFeatures;;
d3.json( "neighborhoods.json", function( json )
{
	d3.json( "points.json", function( points ){
        chapterFeatures = points.features;
        //mapFeatures = neighborhoods.features;
		mapFeatures = topojson.feature(json,json.objects.neighborhoods).features;
        build_map();
        animatelines();
	})	
});

var colorScale = d3.scaleLinear()
    .domain([-180, -120, -60, 0, 60, 120, 180])
    .range(['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#1b9e77']);

var pastelScale = d3.scaleLinear()
    .domain([-180, -120, -60, 0, 60, 120, 180])
    .range(['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#fbb4ae']);

function build_map()
{	
	mapProjection = d3.geoOrthographic()
	    .scale( size / 2 )
	    .translate( [ size, size / 1.5] )
	    .clipAngle( 90 )
	    .rotate([0,-15]);

	map = d3.select( "body" )
		.append( "svg:svg" )
		.attr( "width", size*2 + "px" )
		.attr( "height", size * 2 + "px" )
		.style("width", size * 2 + "px").style("height", size * 2 + "px")
		.append( "g" )
			.attr( "id", "map" );
	
	path = d3.geoPath()
	    .projection( mapProjection );
	    
	var filter = map.append( "svg:defs" )
		.append( "svg:filter" ).attr( "id", "blur" )
		.append( "svg:feGaussianBlur" ).attr( "stdDeviation", 3 );
	
	var gradient = map.select("defs")
		.append( "svg:radialGradient" ).attr( "id", "gradient" );
	gradient.append( "stop" ).attr( { "offset" : "0%", "stop-color" : "black", "stop-opacity" : 0 } );
	gradient.append( "stop" ).attr( { "offset" : "50%", "stop-color" : "black", "stop-opacity" : 0 } );
	gradient.append( "stop" ).attr( { "offset" : "60%", "stop-color" : "black", "stop-opacity" : 0.05 } );
	gradient.append( "stop" ).attr( { "offset" : "70%", "stop-color" : "black", "stop-opacity" : 0.15 } );
	gradient.append( "stop" ).attr( { "offset" : "100%", "stop-color" : "black", "stop-opacity" : 1 } );
	
	map.append( "svg:ellipse" ).attr({
		"cx" : size,
		"cy" : size / 1.5,
		"rx" : size / 2,
		"ry" : size / 2,
		"fill" : "#bdd7e7",
		"stroke" : "black",
		"stroke-width" : "1px",
		"filter" : "url(#blur)",
		"id" : "map-bg"
	});

	ocean = map.append("svg:g")
		.attr("id","ocean")
		.attr("class","layer");

	graticule = map.append("svg:g")
		.attr("id","graticule")
		.attr("class","layer");
	
	countries = map.append( "svg:g" )
		.attr( "id", "countries" )
		.attr("class","layer");

	chapters = map.append( "svg:g" )
		.attr( "id", "chapters" )
		.attr("class","layer");
	
	
	var oceanData = [];

	for ( var lat = -90; lat < 90; lat+= 45 ){
		for ( var lon = -180; lon < 180; lon += 45 ){
			var coords = [[[lon,lat],[lon+45,lat],[lon+45,lat+45],[lon,lat+45],[lon,lat]]];
			oceanData.push( {"type":"Feature",area:["ocean"],"properties":{area:["ocean"]},"geometry":{"type":"Polygon","coordinates":coords}} )
		}
	}

	ocean.selectAll("path")
		.data(oceanData)
		.enter()
		.append("path")
		.attr("vector-effect","non-scaling-stroke")
		.attr("class","ocean")
		.attr("d",path);

	graticule.selectAll("path")
		.data( d3.geoGraticule().step([20,20]).lines() )
		.enter()
		.append("path")
		.attr("vector-effect","non-scaling-stroke")
		.attr("d",path)
		.attr("pointer-events","none");

	countries.selectAll( "path" )
		.data( mapFeatures )
		.enter()
		.append( "svg:path" )
		.attr("vector-effect","non-scaling-stroke")
		.attr("fill", function(){
			return pastelScale( Math.random() * 360 - 180 );
		})
		.attr( "d", path );

	// chapters.selectAll( "image" )
	// 	.data( chapterFeatures )
	// 	.enter()
	// 	.append( "svg:image" )
	// 	.attr("xlink:href","rainbowrat.png")
	// 	.attr( "x", function(d){
	// 		return mapProjection( d.geometry.coordinates )[0] - 30;
	// 	})
	// 	.attr( "y", function(d){
	// 		return mapProjection( d.geometry.coordinates )[1] - 25;
	// 	})
	// 	.attr("width",60)
	// 	.attr("height",50)
	// 	.style("display",function(d){
	// 		return path(d) ? "block" : "none";
	// 	});

	// map.append( "svg:circle" ).attr({
	// 	"cx" : size,
	// 	"cy" : size / 1.5,
	// 	"r" : size / 2,
	// 	"fill" : red,
	// 	"fill-opacity" : 0.2,
	// 	"id" : "shadow",
	// 	"pointer-events": "none"
	// });

	// map.append( "svg:path" ).attr({
	// 	"d" : "M801,333 a302,302 0 1,1 0,-1",
	// 	"id" : "title-path",
	// 	"pointer-events": "none"
	// });

	// map.append( "text" )
	// 	.attr( "id","title-text" )
	// 	.append( "textPath" )
	// 	.attr( "xlink:href", "#title-path" )
	// 	.text( "#ratmap #ratmap #ratmap #ratmap #ratmap #ratmap #ratmap #ratmap #ratmap #ratmap #ratmap #ratmap #ratmap #ratmap #ratmap #ratmap #ratmap #ratmap" );

    

	window.onresize();

	startRotation();			

	return countries;
}


// function animatelines() {

//     // First set all the lines to be invisible
//     d3.selectAll(".path").style("opacity","0");
      
//     // Then highlight the main line to be fully visable and give it a thicker stroke
//     d3.select(".path").style("opacity","1").style("stroke-width",4);
  
//     // First work our the total length of the line 
//     var totalLength = d3.select(".path").node().getTotalLength();
    
//     d3.selectAll(".path")
//       // Set the line pattern to be an long line followed by an equally long gap
//       .attr("stroke-dasharray", totalLength + " " + totalLength)
//       // Set the intial starting position so that only the gap is shown by offesetting by the total length of the line
//       .attr("stroke-dashoffset", totalLength)
//       // Then the following lines transition the line so that the gap is hidden...
//       .transition()
//       .duration(5000)
//       .ease("quad") //Try linear, quad, bounce... see other examples here - http://bl.ocks.org/hunzy/9929724
//       .attr("stroke-dashoffset", 0);
          
  
// }

function pauseRotation(){
	clearInterval(rotation);
}
function startRotation(){
	rotation = setInterval(function(){
		rotateX += .5;
		if ( rotateX >= 180 ) rotateX -= 360;
		var y = mapProjection.rotate()[1];
		move_globe( [rotateX,rotateX*2] );
		map.select( "#title-path" ).attr( "transform", "rotate(" + rotateX + ",500,333.33333)" );
		map.select( "#title-text" ).attr( "fill", colorScale(rotateX) );
		countries.selectAll("path")
			.attr( "fill", pastelScale(rotateX) );
	},50);
}

function move_globe( coords, animate, end )
{
	if( animate )
	{
		coords[ 1 ] = coords[ 1 ] >  30 ?  30 :
		    coords[ 1 ] < -30 ? -30 :
		    coords[ 1 ];
		    
		d3.transition()
			.duration( 500 )
			.tween( "rotate", function()
			{
				var r = d3.interpolate( mapProjection.rotate(), coords );
				return function( t )
				{
					mapProjection.rotate( r( t ) );
					d3.selectAll( "#map .layer path" ).attr("d", function(d) { return path(d) || "M0 0"; });
					chapters.selectAll("image")
						.attr( "x", function(d){
							return mapProjection( d.geometry.coordinates )[0] - 30;
						})
						.attr( "y", function(d){
							return mapProjection( d.geometry.coordinates )[1] - 25;
						})
				};
			})
			.each( "end", end || function(){} ); // Function to run at the end of the animation
	}
	else
	{
		mapProjection.rotate( coords );
		d3.selectAll( "#map .layer path" ).attr("d", function(d) { return path(d) || "M0 0"; });
		chapters.selectAll("image")
			.attr( "x", function(d){
				return mapProjection( d.geometry.coordinates )[0] - 30;
			})
			.attr( "y", function(d){
				return mapProjection( d.geometry.coordinates )[1] - 25;
			})
			.style("display",function(d){
				return path(d) ? "block" : "none";
			});
	}
}
