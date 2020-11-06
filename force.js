Promise.all([
	d3.json('airports.json'),
	d3.json('world-110m.json')
]).then(data=>{ 
	let airports = data[0]; // data1.csv
	let worldmap = data[1]; // data2.json
  let nodes = airports.nodes;
  let links = airports.links;
    console.log(data);
  let width = 2000;
  let height = 800;

    const svg = d3.select(".chart-area").append("svg")
    .attr("viewBox", [0,0,width,height]);

    const size = d3.scaleLinear()
      .domain(d3.extent(nodes, d=>d.passengers))
      .range([5, 15]);
    
    nodes.forEach(d=>{
        d.r = size(d.passengers);
    })

        //map
        console.log(topojson.feature(worldmap, worldmap.objects.countries)); //features collection
        let features = topojson.feature(worldmap, worldmap.objects.countries).features;
        console.log('features', features);
        console.log("worldmap", worldmap);
    
        let projection = d3.geoMercator()
        .fitExtent([[0,0], [width,height]], topojson.feature(worldmap, worldmap.objects.countries));
    
        let path = d3.geoPath()
        .projection(projection);
    
     d3.select(".chart-area").append("svg")
      .attr("viewBox", [0,0,width,height]);
      
      let map = svg.selectAll("path")
        .data(features)
        .join("path")
        .attr("d", path)
        .attr("fill", "black");
      
     let mapLines = svg.append("path")
     .datum(topojson.mesh(worldmap, worldmap.objects.countries))
     .attr("d", path)
     .attr('fill', 'none')
      .attr('stroke', 'white')
     .attr("class", "subunit-boundary");
        
    const force = d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(20))
    .force("link", d3.forceLink(links))
    .force('center', d3.forceCenter(1000, 300))
    .force('collide', d3.forceCollide().radius(function(d) {
      return d.r
    }))

      //drag
    const drag = d3.drag()
      .on("start", (event)=>{
        force.alphaTarget(0.3).restart();
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      })
      .on("drag", (event)=>{
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      })
      .on("end", (event)=>{
        force.alphaTarget(0.0);
        event.subject.fx = null;
        event.subject.fy = null;
      })

    // Create link as lines
    const link = svg.append("g")
        .attr("stroke", "#ccc")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

    //Create node as circles
    let node = svg
    .selectAll(".node")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", d=>d.r)
    .attr("fill", "lightgreen")
    .attr("stroke", "black")
    .call(drag);

//Tooltip
    node.append("title")
      .text(d=>d.name);
   
//Called each time the simulation ticks
//Each tick, take new x and y values for each link and circle, x y values calculated by d3 and appended to our dataset objects
    force.on("tick", ()=>{
      
      link.attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

      node.attr("cx", d => d.x)
      .attr("cy", d => d.y);
    });

    d3.selectAll("input[name=Display]").on("change", event=>{
      visType = event.target.value; // selected button
      switchLayout();
    });

    function switchLayout() {
      if (visType === "map") {
        // stop the simulation
        force.stop()

         // set the positions of links and nodes based on geo-coordinates
         // d.x = projection([d.longitude, d.latitude])[0]; // update x and use it for cx
        node.transition(500).attr("cx", d=>d.x = projection([d.longitude, d.latitude])[0])
            .attr("cy", d=> d.y = projection([d.longitude, d.latitude])[1]);
        link.transition(500).attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y) 
                      
        // set the map opacity to 1
        map.transition(500).style("opacity", 1);
        mapLines.transition(500).style("opacity", 1);
        
        //disable dragging
       drag.filter(event => visType == "force")}

        else { 
        force.alpha(2).restart() // restart the simulation

        // set the map opacity to 0
        map.transition(500).style("opacity", 0)
        mapLines.transition(500).style("opacity", 0)
      }
    }
  });


  

  
  