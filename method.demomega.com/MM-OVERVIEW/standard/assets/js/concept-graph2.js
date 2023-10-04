///
// function for contextual menu
///
(function(root, factory) {
	if (typeof module === 'object' && module.exports) {
		module.exports = function(d3) {
			d3.contextMenu = factory(d3);
			return d3.contextMenu;
		};
	} else {
		root.d3.contextMenu = factory(root.d3);
	}
}(	this, 
	function(d3) {
		return function (menu, opts) {

			var openCallback,
				closeCallback;

			if (typeof opts === 'function') {
				openCallback = opts;
			} else {
				opts = opts || {};
				openCallback = opts.onOpen;
				closeCallback = opts.onClose;
			}

			// create the div element that will hold the context menu
			d3.selectAll('.d3-context-menu').data([1])
				.enter()
				.append('div')
				.attr('class', 'd3-context-menu');

			// close menu
			d3.select('body').on('click.d3-context-menu', function() {
				d3.select('.d3-context-menu').style('display', 'none');
				if (closeCallback) {
					closeCallback();
				}
			});

			// this gets executed when a contextmenu event occurs
			return function(data, index) {
				var elm = this;

				d3.selectAll('.d3-context-menu').html('');
				var list = d3.selectAll('.d3-context-menu')
					.on('contextmenu', function(d) {
						d3.select('.d3-context-menu').style('display', 'none'); 
		  				d3.event.preventDefault();
						d3.event.stopPropagation();
					})
					.append('ul');
				list.selectAll('li').data(typeof menu === 'function' ? menu(data) : menu).enter()
					.append('li')
					.attr('class', function(d) {
						var ret = '';
						if (d.divider) {
							ret += ' is-divider';
						}
						if (d.disabled) {
							ret += ' is-disabled';
						}
						if (!d.action) {
							ret += ' is-header';
						}
						return ret;
					})
					.html(function(d) {
						if (d.divider) {
							return '<hr>';
						}
						if (!d.title) {
							console.error('No title attribute set. Check the spelling of your options.');
						}
						return (typeof d.title === 'string') ? d.title : d.title(data);
					})
					.on('click', function(d, i) {
						if (d.disabled) return; // do nothing if disabled
						if (!d.action) return; // headers have no "action"
						d.action(elm, data, index);
						d3.select('.d3-context-menu').style('display', 'none');

						if (closeCallback) {
							closeCallback();
						}
					});

				// the openCallback allows an action to fire before the menu is displayed
				// an example usage would be closing a tooltip
				if (openCallback) {
					if (openCallback(data, index) === false) {
						return;
					}
				}

				// display context menu
				d3.select('.d3-context-menu')
					.style('left', (d3.event.pageX - 2) + 'px')
					.style('top', (d3.event.pageY - 2) + 'px')
					.style('display', 'block');

				d3.event.preventDefault();
				d3.event.stopPropagation();
			};
		};
	}
));



/////
//  Creation of the graph
/////


var CollapsibleTree = function(elt) {

    var menu = [{
      title: 'Go to description',
      action: function(elem, d, i) {
        // console.log('You have clicked the second item!');
        // console.log('The data for this circle is: ' + d);
		window.location = d.url + "#shi";
	}} , {
      title: 'Expand one level',
      action: function(elem, d, i) {
		toggle(d); that.updateBoth(d);
		//expandParents(d); that.updateBoth(d);
      }}, {
      title: 'Expand all',
      action: function(elem, d, i) {
		expandChildren(d); that.updateBoth(d);
		expandParents(d); that.updateBoth(d);
      }
    }]

 // panning variables
    var panSpeed = 200;
    var panBoundary = 20;

  var m = [20, 120, 20, 120],
      w = 1280 - m[1] - m[3],
      h = 950 - m[0] - m[2],
      i = 0,
      root,
      root2;

  var tree = d3.layout.tree()
      .size([w, h]);

  var parentdiagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.x, -d.y]; });

  var childdiagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.x, d.y]; });

  var svg = d3.select(elt).append("svg:svg")
	  .attr("width", "100%")
	  .attr("height", "90%")
	  .call(d3.behavior.zoom().on("zoom", function () {
		svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
	  }))
      .append("svg:g")
      .attr("transform", "translate(0,"+h/2+")"); // bidirectional-tree

	// test tooltip
	// create a tooltip
	  var Tooltip = d3.select("#categoryHierarchy")
		.append("div")
		.style("opacity", 1)
		.style("color", "#22354b")
		.attr("class", "tooltip")
		.style("background-color", "white")
		.style("border", "solid")
		.style("border-width", "2px")
		.style("border-radius", "5px")
		.style("padding", "5px")
		//.text("test tooltip")
		//.html("The exact value of<br>this cell is: ")

	  // Three function that change the tooltip when user hover / move / leave a cell
	  var mouseover = function(d) {
		Tooltip
		  .style("opacity", 1)
		d3.select(this)
		  .style("stroke", "black")
		  .style("opacity", 1)
		  //
		  //.text(d.comment);
	  }
	  var mousemove = function(d) {
		Tooltip
			//console.log(" d is " + d + " and comment is " + d.comment)
		  .html(d.comment)
		  //.html("test mousemove")
		  //.text(d.comment)
		  // .style("left", (d3.mouse(this)[0]+70) + "px")
		  // .style("top", (d3.mouse(this)[1]) + "px")
		  //.style("left", (d3.mouse(this)[0]) + "px")
		  .style("left", ((d3.event.pageX - 300) + 'px'))
		  //.style("top", (d3.mouse(this)[1]-h+60) + "px")
		  .style("top", (d3.event.pageY - 100) + "px")
		  //console.log("d3 mouse [0] " + d3.mouse(this)[0])
		  //console.log("d3 mouse [1] " + d3.mouse(this)[1])
		  //console.log("w " + w)
		  //console.log("h " + h)
		  //console.log("d3.event.pageX " + d3.event.pageX)
		  //console.log("d3.event.pageY " + d3.event.pageY)
		  
		  //.text(d.comment);
	  }
	  var mouseleave = function(d) {
		Tooltip
		  .style("opacity", 0)
		d3.select(this)
		  .style("stroke", "none")
		  .style("opacity", 0.8)
	  }



	var data = [1, 2, 3];

  var that = {
    init: function(json) {
    //init(json) {
      var that = this;
        root = json;
        root.x0 = w / 2;
        root.y0 = h / 2;
		that.toggleAll(root);
        that.updateBoth(root);
    },
    //,
	toggleAll: function(root) {
	var nodes = tree.nodes(root).reverse();
	  nodes.forEach(function(d) { toggle(d)   }
	)},
    updateBoth: function(source) {
      var duration = d3.event && d3.event.altKey ? 5000 : 500;

      // Compute the new tree layout.
      var nodes = tree.nodes(root).reverse();

      // Normalize for fixed-depth.
      nodes.forEach(function(d) { d.y = d.depth * 120; });
	  

      // Update the nodes…
      var node = svg.selectAll("g.node")
          .data(nodes, function(d) { return d.id || (d.id = ++i); });

	  // tree.nodes(that).forEach(function(d) { toggle(d); });

      // Enter any new nodes at the parent's previous position and click management
      var nodeEnter = node.enter().append("svg:g")
          .attr("class", "node")
          .attr("transform", function(d) { return "translate(" + source.x0 + "," + source.y0 + ")"; })
		  // .on('contextmenu', function(d) { 
			// d3.event.preventDefault();	  
			// window.location = d.url + "#shi"; 
			// })
/* 		.on("mouseover", function(d) {
			  var g = d3.select(this); // The node
			  // The class is used to remove the additional text later
			  var info = g.append('text')
				 .classed('info', true)
				 .attr('class','tooltip')
				 .style("fill", "#3D8496")
				 .style("color", "#31B672")
				 .style("stroke-width","2px")
				 .attr("width","90px")
				 .style("opacity", 1)
				 //.style("stroke", "#3D8496")
				 .attr('x', 15)
				 .attr('y', -10)
				 .text(d.comment);
		  })
		  .on("mouseout", function() {
			  // Remove the info text on mouse out.
			  d3.select(this).select('text.info').remove();
			  //d3.select(this).select('text.tooltip').remove();
		  }) */
		  .on("mouseover", mouseover)
		  .on("mousemove", mousemove)
		  .on("mouseleave", mouseleave)
		  .on('contextmenu', d3.contextMenu(menu, {
				onOpen: function() {
					console.log('opened!');
					console.log("menu " + menu);
				},
				onClose: function() {
					console.log('closed!');
				}
			}))
          .on("click", function(d) { toggle(d); that.updateBoth(d); });
 
 nodeEnter.append("svg:path")  // Fixed.
 	 .style("fill", function(d) {
		 //if (d.parents == null && d._parents == "") {
			if( d != root ) {
			 if (d.isparent == false) {
				 // console.log("NO Parents " + d.name + " .parents " + d.children + " _parents " + d._children);
				 return "green";
			 } else {
				return "red"; 
				// console.log("Parents " + d.name + " .parents " + d.children + " _parents " + d._children);
			 }}})
     .attr("d", d3.svg.symbol()
                 .size(200)
                 .type(function(d) {
		 if ( (d.children == null && d._children == "") || (d._children == null && d.children == "") ||  (d.parents == null && d._parents == "") || (d._parents == null && d.parents == "")) { 
			// console.log("NO Children " + d.name + " .children " + d.children + " _children " + d._children);
			return "triangle-up";
		 } else { 
			// console.log("Children " + d.name + " .children " + d.children + " _children " + d._children);
			return "circle";
	 }}));
	 // .style("fill", function(d) {
		 // if (d.isparent = true) {
			 // return "red";
		 // } else {
			// return "green"; 
	 // }});


 // nodeEnter.append("svg:path")  // Fixed.
     // .attr("d", d3.svg.symbol().type("triangle-up"))
     // .style("fill", "black");

     nodeEnter.append("svg:circle")
          .attr("r", 1e-6)
		  .style("fill", function(d) {
				if (d._parents) {
					if (d._children) {
						return "red";
					} else {
						return "red";
					}
				} else {
					if (d._children) {
						return "green";
					} else {
						return "blue";
					}
			}});

     nodeEnter.append("svg:diamond")
		  .style("fill", function(d) {
				if (d._parents) {
					if (d._children) {
						return "red";
					} else {
						return "red";
					}
				} else {
					if (d._children) {
						return "green";
					} else {
						return "red";
					}
			}});

      nodeEnter.append("svg:text")
          .attr("x", function(d) {
            if( that.isParent(d) ) {
              return -10;
            } else {
              return d.children || d._children ? -10 : 10;
            }
          })
          //.attr("dx", "0.5em")
          .attr("dx", "0em")
          .attr("dy", ".35em")
		  .attr("text-anchor", "start")
          // .attr("text-anchor", function(d) {
            // if( that.isParent(d) ) {
              // return "end";
            // } else {
              // return d.children || d._children ? "end" : "start";
            // }
          // })
          // .attr("transform",function(d) {
            // if( d != root ) {
              // if( that.isParent(d) ) {
                // return "rotate(45)";
              // } else {
                // return "rotate(45)";
              // }            
            // }
          // })
          .text(function(d) { return d.name; })
          .style("fill-opacity", 1e-6)
		   .call(wrap, 10);

      // Transition nodes to their new position.
      var nodeUpdate = node.transition()
          .duration(duration)
          .attr("transform", function(d) {
            if( that.isParent(d) ) {
              return "translate(" + d.x + "," + -d.y + ")";
            } else {
              return "translate(" + d.x + "," + d.y + ")";
            }
          });

      nodeUpdate.select("circle")
          .attr("r", 4.5)
		  .style("fill", function(d) {
			if (d._parents) {
				if (d._children) {
					return "red";
				} else {
					return "red";
				}
			} else {
				if (d._children) {
					return "green";
				} else {
					if ( (d.children == null && d._children == "") || (d._children == null && d.children == "") ) { 
						return "green";
					} else {
						return "white";
				}}
				}
			})
		  .style("stroke-width", function(d) {
			if (d.parents) {
				if (d.children) {
					return "3px";
				} else {
					return "0px";
				}
				} else {
				return "0px";
			}});
		  // .style("stroke", function(d) {
			// if (d.parents) {
				// if (d.children) {
					// return "black";
				// } else {
					// return "red";
				// }
			// } else {
				// if (d.children) {
					// return "green";
				// } else {
					// return "green";
				// }
			// }});					

      nodeUpdate.select("text")
          .style("fill-opacity", 1);

      // Transition exiting nodes to the parent's new position.
      var nodeExit = node.exit().transition()
          .duration(duration)
          .attr("transform", function(d) { return "translate(" + source.x + "," + source.y + ")"; })
          .remove();

      // nodeExit.select("circle")
          // .attr("r", 1e-6);

      // nodeExit.select("text")
          // .style("fill-opacity", 1e-6);

      // Update the links…
      var link = svg.selectAll("path.link")
          .data(tree.links_parents(nodes).concat(tree.links(nodes)), function(d) { return d.target.id; });

      // Enter any new links at the parent's previous position.
      link.enter().insert("svg:path", "g")
          .attr("class", "link")
          .attr("d", function(d) {
            var o = {x: source.x0, y: source.y0};
            if( that.isParent(d.target) ) {
              return parentdiagonal({source: o, target: o});
            } else {
              return childdiagonal({source: o, target: o});
            }
          })
        .transition()
          .duration(duration)
          .attr("d", function(d) {
            if( that.isParent(d.target) ) {
              return parentdiagonal(d);
            } else {
              return childdiagonal(d);
            }
          })

      // Transition links to their new position.
      link.transition()
          .duration(duration)
          .attr("d", function(d) {
            if( that.isParent(d.target) ) {
              return parentdiagonal(d);
            } else {
              return childdiagonal(d);
            }
          })

      // Transition exiting nodes to the parent's new position.
      link.exit().transition()
          .duration(duration)
          .attr("d", function(d) {
            var o = {x: source.x, y: source.y};
            if( that.isParent(d.target) ) {
              return parentdiagonal({source: o, target: o});
            } else {
              return childdiagonal({source: o, target: o});
            }
          })
          .remove();

      // Stash the old positions for transition.
      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    },

    isParent: function(node) {
      if( node.parent && node.parent != root ) {
        return this.isParent(node.parent);
      } else
      if( node.isparent ) {
        return true;
      } else {
        return false;
      }
    },

  }
  
  function expandChildren(d){   
    var children = (d.children)?d.children:d._children;
    if (d._children) {        
        d.children = d._children;
        d._children = null;       
    } 
    if(children)
      children.forEach(expandChildren);
	}

  function expandParents(d){   
    var parents = (d.parents)?d.parents:d._parents;
    if (d._parents) {        
        d.parents = d._parents;
        d._parents= null;       
    }
    if(parents)
      parents.forEach(expandParents);
  }

	function expandAll(){
		expand(root); 
		update(root);
	}

	function collapseAll(){
		root.children.forEach(collapse);
		collapse(root);
		update(root);
	}
  
  function  toggle(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      if (d.parents) {
        d._parents = d.parents;
        d.parents = null;
      } else {
        d.parents = d._parents;
        d._parents = null;
      }
    };

  function wrap(text, width) {
    text.each(function() {
        var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        lineHeight = 1.1, // ems
        //tspan = text.text(null).append("tspan").attr("x", function(d) { return d.children || d._children ? -7 : 7; }).attr("y", y).attr("dy", dy + "em");     
        //tspan = text.text(null).append("tspan").attr("y", y).attr("dy", dy + "em");
        tspan = text.text(null).append("tspan").attr("dx", "0.5em").attr("dy", dy + "em");     
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            var textWidth = tspan.node().getComputedTextLength();
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                ++lineNumber;
                //tspan = text.append("tspan").attr("x", function(d) { return d.children || d._children ? -7 : 7; }).attr("y", 0).attr("dy", lineNumber * lineHeight + dy + "em").text(word);
                tspan = text.append("tspan").attr("x",0).attr("y", 0).attr("dx", "0.5em").attr("dy", lineNumber * lineHeight + dy + "em").text(word);
                //tspan = text.append("tspan").attr("x", function(d) { return d.children || d._children ? -10 : 10; }).attr("y", 0).attr("dy", lineHeight + dy + "em").text(word);
            }
        }
    });
}



  return that;
}

