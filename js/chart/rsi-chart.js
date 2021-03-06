/**
 * RsiChart renders RSI chart
 */
var RsiChart = {
  properties: {},
  data: {},
  components: {},

  /**
   * setProperties() sets width, margin, zoom factor and other dimensions of chart
   */
  setProperties: function(options) {
    var properties = {
      height: 130,
      interval: 40,
    };
    properties.chartHeight = properties.height - ChartView.properties.margin.top - ChartView.properties.margin.bottom;
    properties.graphWidth = ChartView.properties.chartWidth * ChartView.properties.zoomFactor;
    if (options) {
      for (var key in options) {
        properties[key] = options[key];
      }
    }

    this.properties = $.extend(true, {}, properties);
  },

  /**
   * init() initializes chart
   */
  init: function() {
    if(ChartView.data.indexError) return;
    this.setProperties();
    this.updateData();
    this.appendComponents();
    this.draw();
    this.initCloseAction();
    $('#rsi').css('display', 'none');
    this.hideScrollbar();
  },

  /**
   * update() handles chart updates after initial load
   */
  update: function() {
    this.setProperties();
    this.updateData();
    this.draw();
  },

  /**
   * updateData()
   */
  updateData: function() {
    var self = this;

    self.data.stockLine      = ChartView.data.visibleStockLine;
    self.data.xLabelData     = ChartView.getXLabels();

    var allDataArray = [];
    for (var i = 0; i < self.data.stockLine.length; i++) {
      allDataArray.push(parseInt(self.data.stockLine[i].rsi6));
      allDataArray.push(parseInt(self.data.stockLine[i].rsi12));
      allDataArray.push(parseInt(self.data.stockLine[i].rsi24));
    }
    var y2Range = [-10, 110];

    self.data.y2 = ChartView.buildY(y2Range[0], y2Range[1], self.properties.chartHeight);
    self.data.x  = ChartView.x('rdate');
    self.updateLegends();

  },

  /**
   * hideScrollbar()
   */
  hideScrollbar: function() {
    if(IE8){
      RsiChart.components.scrollBar
          .attr('fill-opacity', 0);
    }else{
      RsiChart.components.scrollBar
          .style('fill-opacity', 0);
    }
  },

  /**
   * initCloseAction() hides the chart
   */
  initCloseAction: function() {
    $('#rsi > .wrapper > .buttons > .close').on('click', function() {
      $('#rsi').css('display', 'none');
      $('#rsi-checkbox').attr('checked', false);
    });
  },

  /**
   * appendComponents()
   */
  appendComponents: function() {
    var self = this;
    $('#rsi-chart').empty();
    $('#rsi-chart-label').empty();

    self.componentsBuilder.chart.append();
    self.componentsBuilder.chartLabel.append();
    self.componentsBuilder.topBorder.append();
    self.componentsBuilder.rightBorder.append();
    self.componentsBuilder.bottomBorder.append();
    self.componentsBuilder.leftBorder.append();
    self.componentsBuilder.xLabels.append();
    self.componentsBuilder.y2Labels.append();
    self.componentsBuilder.guideLine30.append();
    self.componentsBuilder.guideLine70.append();

    // RSI lines
    this.components.chart.append('path').attr('class', 'rsi6');
    this.components.chart.append('path').attr('class', 'rsi12');
    this.components.chart.append('path').attr('class', 'rsi24');

    self.componentsBuilder.mouseOverlay.append();
    self.componentsBuilder.scrollbarRail.append();
    self.componentsBuilder.scrollBar.append();
  },

  /**
   * draw()
   */
  draw: function() {
    var self = this;
    $('#rsi-chart-container').css('width', ChartView.properties.chartWidth);

    for (var key in self.components) {

      // Link data
      if (self.componentsBuilder[key].linkData) {
        self.componentsBuilder[key].linkData();
      }

      // Enter loop
      if (self.componentsBuilder[key].enter) {
        self.componentsBuilder[key].enter();
      }

      // Update loop
      if (self.componentsBuilder[key].update) {
        self.componentsBuilder[key].update();
      }

      // Exit loop
      if (self.componentsBuilder[key].enter) {
        self.components[key].exit().remove();
      }
    }
    // Draw RSI lines
    function plotRSI(rsi, color){
      var line = d3.svg.line()
        .x(function(d,i) { return self.data.x(i); })
        .y(function(d)   {
          if(rsi ===  6) return self.data.y2(d.rsi6);
          if(rsi === 12) return self.data.y2(d.rsi12);
          if(rsi === 24) return self.data.y2(d.rsi24);
        })
        .interpolate('linear');

      self.components.chart.select('path.rsi' + rsi)
        .datum(self.data.stockLine)
        .attr('d', line)
        .attr('stroke', color)
        .attr('fill', 'none');
    }

    plotRSI(6,'#fff');
    plotRSI(12,'#d8db74');
    plotRSI(24,'#94599d');

  },

  /**
   * drawContainer()
   */
  drawContainer: function() {
    var self = this;

    self.componentsBuilder.chart.update();
    self.componentsBuilder.chartLabel.update();
    self.componentsBuilder.topBorder.update();
    self.componentsBuilder.rightBorder.update();
    self.componentsBuilder.bottomBorder.update();
    self.componentsBuilder.leftBorder.update();
  },

  /**
   * updateLegends()
   */
  updateLegends: function() {
    var self = this;
    $('#rsi-chart-legend .rsi6').text(ChartView.getStockLine()[ChartView.getStockLine().length-1].rsi6);
    $('#rsi-chart-legend .rsi12').text(ChartView.getStockLine()[ChartView.getStockLine().length-1].rsi12);
    $('#rsi-chart-legend .rsi24').text(ChartView.getStockLine()[ChartView.getStockLine().length-1].rsi24);
  },

  /**
   * componentsBuilder stores all chart components
   * Each component has an append (enter) and update method
   */
  componentsBuilder: {
    chart: {
      append: function() {
        RsiChart.components.chart = d3.select('#rsi-chart')
                                      .append('svg:svg')
                                      .attr('class', 'chart')
                                      .on('mouseenter', function() {
                                        ChartView.showAllScrollbars();
                                      })
                                      .on('mouseleave', function() {
                                        ChartView.hideAllScrollbars();
                                      });
      },
      update: function() {
        RsiChart.components.chart
        .attr('height', RsiChart.properties.chartHeight + 30)
        .attr('width', RsiChart.properties.graphWidth)
        .select('svg')
        .attr('width', RsiChart.properties.graphWidth);
      }
    },
    chartLabel: {
      append: function() {
        RsiChart.components.chartLabel = d3.select('#rsi-chart-label')
                                           .append('svg:svg')
                                           .attr('class', 'chart');
      },
      update: function() {
        RsiChart.components.chartLabel
        .attr('width', ChartView.properties.width)
        .attr('height', RsiChart.properties.height-17);
      }
    },
    topBorder: {
      append: function() {
        RsiChart.components.topBorder = RsiChart.components.chartLabel.append('svg:line')
                                                .attr('class', 'xborder-top-thick')
                                                .attr('stroke', 'rgb(77, 77, 77)')
                                                .attr('stroke-width', '2px');
      },
      update: function() {
        RsiChart.components.topBorder
        .attr('x1', ChartView.properties.margin.left)
        .attr('x2', ChartView.properties.chartWidth + ChartView.properties.margin.left)
        .attr('y1', ChartView.properties.margin.top)
        .attr('y2', ChartView.properties.margin.top);
      }
    },
    rightBorder: {
      append: function() {
        RsiChart.components.rightBorder = RsiChart.components.chartLabel.append('svg:line')
                                                  .attr('class', 'yborder-right')
                                                  .attr('stroke', 'rgb(77, 77, 77)')
                                                  .attr('stroke-width', '2px');
      },
      update: function() {
        RsiChart.components.rightBorder
        .attr('x1', ChartView.properties.chartWidth + ChartView.properties.margin.left)
        .attr('x2', ChartView.properties.chartWidth + ChartView.properties.margin.left)
        .attr('y1', RsiChart.properties.chartHeight - ChartView.properties.margin.bottom)
        .attr('y2', ChartView.properties.margin.top);
      }
    },
    bottomBorder: {
      append: function() {
        RsiChart.components.bottomBorder = RsiChart.components.chartLabel.append('svg:line')
                                                   .attr('class', 'xaxis')
                                                   .attr('stroke', 'rgb(77, 77, 77)')
                                                   .attr('stroke-width', '2px');
      },
      update: function() {
        RsiChart.components.bottomBorder
        .attr('x1', ChartView.properties.margin.left)
        .attr('x2', ChartView.properties.chartWidth + ChartView.properties.margin.left)
        .attr('y1', RsiChart.properties.chartHeight - ChartView.properties.margin.bottom)
        .attr('y2', RsiChart.properties.chartHeight - ChartView.properties.margin.bottom);
      }
    },
    leftBorder: {
      append: function() {
        RsiChart.components.leftBorder = RsiChart.components.chartLabel.append('svg:line')
                                                 .attr('class', 'yborder-left')
                                                 .attr('stroke', 'rgb(77, 77, 77)')
                                                 .attr('stroke-width', '2px');
      },
      update: function() {
        RsiChart.components.leftBorder
        .attr('x1', ChartView.properties.margin.left)
        .attr('x2', ChartView.properties.margin.left)
        .attr('y1', RsiChart.properties.chartHeight - ChartView.properties.margin.bottom)
        .attr('y2', ChartView.properties.margin.top);
      }
    },
    guideLine30: {
      append: function() {
        RsiChart.components.guideLine30 = RsiChart.components.chartLabel.append('svg:line')
                                                  .attr('class', 'guideline-30')
                                                  .attr('stroke', 'rgb(50, 50, 50)')
                                                  .attr('stroke-width', '1px')
                                                  .attr('shape-rendering', 'crispEdges');
      },
      update: function() {
        RsiChart.components.guideLine30
        .attr('x1', ChartView.properties.margin.left)
        .attr('x2', ChartView.properties.chartWidth + ChartView.properties.margin.left)
        .attr('y1', RsiChart.data.y2(30))
        .attr('y2', RsiChart.data.y2(30));
      }
    },
    guideLine70: {
      append: function() {
        RsiChart.components.guideLine70 = RsiChart.components.chartLabel.append('svg:line')
                                                  .attr('class', 'guideline-70')
                                                  .attr('stroke', 'rgb(50, 50, 50)')
                                                  .attr('stroke-width', '1px')
                                                  .attr('shape-rendering', 'crispEdges');
      },
      update: function() {
        RsiChart.components.guideLine70
        .attr('x1', ChartView.properties.margin.left)
        .attr('x2', ChartView.properties.chartWidth + ChartView.properties.margin.left)
        .attr('y1', RsiChart.data.y2(70))
        .attr('y2', RsiChart.data.y2(70));
      }
    },
    y2Labels: {
      append: function() {
        RsiChart.components.y2Labels = RsiChart.components.chartLabel.append('g')
                                               .attr('class','y2labels')
                                               .selectAll('text.yrule');
      },
      linkData: function() {
        RsiChart.components.y2Labels = RsiChart.components.y2Labels.data([30, 70, 100]);
      },
      enter: function() {
        RsiChart.components.y2Labels.enter().append('text').attr('class', 'yrule');
      },
      update: function() {
        RsiChart.components.y2Labels
        .attr('x', ChartView.properties.width - ChartView.properties.margin.right + 15)
        .attr('y', function(d) {
         return RsiChart.data.y2(d) + 4; //vertically center the texts
       })
        .attr('text-anchor', 'middle')
        .text(String);
      }
    },
    xLabels: {
      append: function() {
        RsiChart.components.xLabels = RsiChart.components.chart.append('g')
                                              .attr('class','xlabels')
                                              .selectAll('text.xrule');
      },
      linkData: function() {
        RsiChart.components.xLabels = RsiChart.components.xLabels.data(ChartView.getXLabels());
      },
      enter: function() {
        RsiChart.components.xLabels.enter().append('svg:text').attr('class', 'xrule');
      },
      update: function() {
        RsiChart.components.xLabels
        .attr('x', function(d,i){ return RsiChart.data.x(d.rdate); })
        .attr('y', RsiChart.properties.chartHeight-ChartView.properties.margin.bottom+15)
        .attr('text-anchor', 'middle')
        .text(function(d,i) {
          var today = new Date();
          if (ChartView.getChartWidth() - RsiChart.data.x(d.rdate) > 20 && RsiChart.data.x(d.rdate) > 20) {
            return Helper.toDate(d.rdate, 'yyyy/mm');
          } else {
            return '';
          }
        });
      }
    },
    scrollbarRail: {
      append: function() {
        RsiChart.components.scrollbarRail = RsiChart.components.chart
                                            .append('rect')
                                            .attr('class', 'scrollbar-rail')
                                            .attr('width', ChartView.properties.width-ChartView.getLeftMargin()-ChartView.getRightMargin())
                                            .attr('height', 30)
                                            .attr('x', 0)
                                            .attr('y', RsiChart.properties.height-55)
                                            .on('mouseenter', function() {
                                              ChartView.showAllScrollbars();
                                              ChartView.properties.mouseOverScrollbar = true;
                                            })
                                            .on('mouseleave', function() {
                                              var mChart = ChartView.properties.mouseOverChart;
                                              if(!mChart){
                                                ChartView.hideAllScrollbars();
                                                ChartView.properties.mouseOverScrollbar = false;
                                              }
                                            })
                                            .attr('fill-opacity', 0);
      },
      update: function() {
        RsiChart.components.scrollbarRail.attr('width', ChartView.properties.width-ChartView.getLeftMargin()-ChartView.getRightMargin());
      }
    },
    scrollBar: {
      append: function() {
        //because d3 drag requires data/datum to be valid
        RsiChart.components.scrollBar = RsiChart.components.chart.append('rect')
                                            .attr('class', 'scrollbar')
                                            .datum([])
                                            .attr('height', 7)
                                            .attr('rx', 4)
                                            .attr('ry', 4)
                                            .style('fill', 'rgb(107, 107, 107)')
                                            .style('stroke-width', '20')
                                            .style('stroke', 'rgb(107, 107, 107)')
                                            .style('stroke-opacity', '0')
                                            .on('mouseenter', function(e) {
                                                if(ChartView.isZoomed()){
                                                  ChartView.showAllScrollbars();
                                                  ChartView.properties.mouseOverScrollbar = true;
                                               }
                                            })
                                            .on('mouseleave', function(e) {
                                               var mChart = ChartView.properties.mouseOverChart;
                                               if(!mChart){
                                                  ChartView.hideAllScrollbars();
                                                  ChartView.properties.mouseOverScrollbar = false;
                                               }
                                            })
                                            .call(ChartView.scrollbarDragBehavior());
        ChartView.properties.mouseOverScrollbar = false;
        ChartView.properties.mouseOverChart     = false;
      },
      update: function() {
        RsiChart.components.scrollBar
        .attr('x', ChartView.getScrollbarPos())
        .attr('y', RsiChart.properties.height - 30)
        .attr('width', ChartView.getScrollbarWidth())
        .style('fill-opacity', ChartView.isZoomed()? 50:0);
      }
    },
    mouseOverlay: {
      append: function() {
      // Tooltip
        RsiChart.components.mouseOverlay = RsiChart.components.chart.append('rect')
        .attr('class','mouseover-overlay')
        .attr('fill', 'transparent')
        .attr('fill-opacity', 0)
        .attr('x', 0)
        .attr('y', ChartView.properties.margin.top)
        .attr('height', RsiChart.properties.height-55);

        if(!IE8){
          RsiChart.components.mouseOverlay
          .call(ChartView.zoomBehavior())
          .datum([])   //because d3 drag requires data/datum to be valid
          .call(ChartView.chartDragBehavior());
        }
      },
      update: function() {
        RsiChart.components.mouseOverlay
        .attr('width', RsiChart.properties.graphWidth)
        .on('mouseover', function(e){
          ChartView.mouseOverMouseOverlay();
          return Tooltip.show.rsi(); })
        .on('mouseout', function() {
          ChartView.mouseOutMouseOverlay();
          return Tooltip.hide.rsi(); })
        .on('mousemove', function() {
          Tooltip.show.rsi();
          var xPos, yPos, mouseX, mouseY;

          if(IE8) {
      			xPos = event.offsetX;
      			yPos = event.offsetY; //because of the old browser info box on top
          }
          else {
            xPos = d3.mouse(this)[0];
            yPos = d3.mouse(this)[1];
          }

          var j = ChartView.xInverse(xPos, RsiChart.data.x);
          var d = RsiChart.data.stockLine[j];

          var offset = 10;
          mouseX = xPos + ChartView.getLeftMargin();

          var model = {
            top: yPos + 40,
            // 180 = width of tooltip
            left: ChartView.getChartWidth() - xPos > 200 ? mouseX + offset : mouseX - 180 - offset,
            date: Helper.toDate(d.rdate),
            rsi6: d.rsi6,
            rsi12: d.rsi12,
            rsi24: d.rsi24,
          };
          return Tooltip.render.rsi(model);
        });
      }
    }
  },

  /**
   * Helper methods
   */
  helpers: {
    getRangeWithBuffer: function(min, max) {
      return [min - ((max - min)*0.5), max + ((max - min)*0.5)];
    },
    getYLabelsData: function(data) {
      var self = IndexChart;
      var max = d3.max(data);
      var min = d3.min(data);
      var labels = [];
      var diff = (max - min)/2;
      for (var i = 0; i < 3; i++) {
        labels.push(min + (i*diff));
      }
      return labels;
    }
  }
};


