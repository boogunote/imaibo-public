var IndexChart = {
  properties: {},
  setProperties: function(options) {
    var properties = {
      height: 400,
      interval: 40,
    };
    if (options) {
      for (var key in options) {
        properties[key] = options[key];
      }
    }
    this.properties = $.extend(true, {}, properties);
  },  
  init: function () {
    // ChartView.setProperties();
    this.setProperties();
    this.drawContainer();
    this.drawGraph(true);
  },
  drawContainer: function () {
    $('#chart').empty();
    $('#chart-label').empty();

    var data = ChartView.data;

    data.sentiment.indexList.length = data.daily.stockLine.length;

    //Inheriting from ChartView
    var containerWidth = ChartView.properties.width;
    var margin     = ChartView.properties.margin;
    var chartWidth = containerWidth - margin.left - margin.right;
    var zoomFactor = ChartView.properties.zoomFactor;
    var graphWidth = chartWidth * zoomFactor;
    var volumeHeight = ChartView.properties.volumeHeight;
    var interval = ChartView.properties.interval;

    //index chart defined.
    var height = this.properties.height;

    var chart = d3.select('#chart')
    .append('svg:svg')
    .attr('class', 'chart')
    .attr('id', 'graph')
    .attr('height', height);

    $('#chart-container').slimScroll({
      height: (height+40).toString() + 'px',
      width: containerWidth.toString() + 'px',
      color: '#ffcc00',
    });

    $('.slimScrollDiv').css('position', 'absolute')
    .css('top', '0')
    .css('left', '50px')
    .css('width', chartWidth.toString() + 'px');

    var chart_label = d3.select('#chart-label')
    .append('svg:svg')
    .attr('class', 'chart')
    .attr('width', containerWidth + 120)
    .attr('height', height);

    data = ChartView.data.daily.stockLine;

    var x = ChartView.x(data, 'rdate');
    var y1 = ChartView.y1(data, height ,'moodindex');
    var y2 = ChartView.y2(data, height, 'highpx', 'lowpx');

    chart_label.append('svg:line')
    .attr('class', 'horizontal-line')
    .attr('x1', margin.left)
    .attr('x2', margin.left + chartWidth) //shift to the left
    .attr('y1', height - margin.bottom)
    .attr('y2', height - margin.bottom)
    .attr('stroke', '#25bcf1')
    .attr('stroke-width', '2px')
    .on('mouseover', function(e){ return Tooltip.show(); })
    .on('mousemove', function() {
      var xPos = d3.mouse(this)[0],
       yPos = d3.mouse(this)[1];
    });

    chart_label.append('svg:line')
    .attr('class', 'xaxis')
    .attr('x1', margin.left)
    .attr('x2', margin.left + chartWidth) //shift to the left
    .attr('y1', height - margin.bottom)
    .attr('y2', height - margin.bottom)
    .attr('stroke', '#464646')
    .attr('stroke-width', '2px');

    chart_label.append('svg:line')
    .attr('class', 'border-left')
    .attr('x1', margin.left)
    .attr('x2', margin.left)
    .attr('y1', height - margin.bottom)
    .attr('y2', margin.top)
    .attr('stroke', '#464646')
    .attr('stroke-width', '2px');

    chart_label.append('svg:line')
    .attr('class', 'border-right')
    .attr('x1', containerWidth - margin.right )
    .attr('x2', containerWidth - margin.right )
    .attr('y1', height - margin.bottom)
    .attr('y2', margin.top)
    .attr('stroke', '#464646')
    .attr('stroke-width', '2px');

    //top border
    chart_label.append('svg:line')
    .attr('class', 'border-top')
    .attr('x1', margin.left)
    .attr('x2', containerWidth - margin.right )
    .attr('y1', margin.top)
    .attr('y2', margin.top)
    .attr('stroke', '#464646')
    .attr('stroke-width', '2px');

    // left y-axis labels
    chart_label.append('g')
    .attr('class','y1labels')
    .selectAll('text.yrule')
    .data(y1.ticks(5))
    .enter().append('svg:text')
    .attr('class', 'yrule')
    .attr('x', margin.left - 15)
    .attr('y', y1)
    .attr('text-anchor', 'middle')
    .text(String);

    // right y-axis labels
    chart_label.append('g')
    .attr('class','y2labels')
    .selectAll('text.yrule')
    .data(y2.ticks(5))
    .enter().append('svg:text')
    .attr('class', 'yrule')
    .attr('x', containerWidth-margin.right + 22)
    .attr('y', y2)
    .attr('text-anchor', 'middle')
    .text(String);

    $('.xlabels > text').click(function(){
      var x = this.getAttribute('x');
      $('#xlabelLine').remove();
      $('#xlabelLineActive').remove();
      chart.append('svg:line')
      .attr('class', 'xlabelLine')
      .attr('id', 'xlabelLine')
      .attr('x1', x)
      .attr('x2', x)
      .attr('y1', height-margin.bottom) //make it line up with the label
      .attr('y2', margin.top)
      .attr('stroke', '#44b6ea');

      chart.append('g')
      .attr('id','xlabelLineActive')
      .append('svg:rect')
      .attr('x', parseFloat(x) - 50)
      .attr('y', height-margin.top)
      .attr('height', 30)
      .attr('width',  100)
      .attr('fill', '#44b6ea')
    });

    $('.y2labels > text').click(function(){
      $('#y2labelLine').remove();
      $('#y2labelLineActive').remove();
      var y = parseFloat(this.getAttribute('y')) - 5;

      chart.append('g')
      .attr('id','y2labelLineActive')
      .append('svg:rect')
      .attr('x', width-margin.right-5)
      .attr('y', y-5)
      .attr('height', 15)
      .attr('width',  50)
      .attr('fill', '#f65c4e')

      chart.append('svg:line')
      .attr('class', 'y2labelLine')
      .attr('id', 'y2labelLine')
      .attr('x1', margin.left-100)
      .attr('x2', width - margin.right)
      .attr('y1', y) //make it line up with the label
      .attr('y2', y)
      .attr('stroke', '#df5748');
    });

    var latest_daily = data.slice(-1)[0];

    $('#ma60-label').text(' MA60=' + latest_daily.ma60);
    $('#ma20-label').text(' MA20=' + latest_daily.ma20);
    $('#ma10-label').text(' MA10=' + latest_daily.ma10);
    $('#ma5-label').text(' MA5=' + latest_daily.ma5);
  },
  drawGraph: function(isNew) {
    // $('#chart').empty();
    // $('#chart-label').empty();

    //not a fan of this.
    //it builds up the memory stack
    var prop = ChartView.properties,
    width      = prop.width,
    height     = this.properties.height,
    chartHeight = height - prop.margin.top - prop.margin.bottom,
    chartWidth = prop.width - prop.margin.left - prop.margin.right,
    graphWidth = chartWidth * prop.zoomFactor,
    margin     = prop.margin,
    data       = ChartView.data,
    interval   = this.properties.interval,
    zoomFactor = prop.zoomFactor,
    x          = ChartView.x(data.daily.stockLine, 'rdate'),
    v          = ChartView.v(data.daily.stockLine, 'volumn'),
    y1         = ChartView.y1(data.daily.stockLine, this.properties.height, 'moodindex'),
    y2         = ChartView.y2(data.daily.stockLine, this.properties.height, 'highpx', 'lowpx'),
    xlabels,
    gvolume,
    gcandlesticks,
    glinestems,
    tooltip;

    var chart = d3.select('#chart')
    .attr('width', graphWidth)
    .select('svg')
    .attr('width', graphWidth);

    var chart_label = d3.select('#chart-label')
    .attr('width', width)
    .select('svg')
    .attr('width', width);

    if(isNew){
      xlabels = chart.append('g').attr('class','xlabels');
      gvolume = chart.append('g').attr('class','volume');
      gcandlesticks = chart.append('g').attr('class','candlesticks');
      glinestems = chart.append('g').attr('class','linestems');
      // tooltip =  chart.append('rect').attr('class', 'mouseover-overlay')
      // vertical = chart.append('svg:line');
      // horizontal = chart.append('svg:line');
      // vertical_block = chart_label.append('svg:rect');
      // horizontal_block = chart_label.append('svg:rect');


    }else{
      xlabels = chart.selectAll('g.xlabels');
      gvolume = chart.selectAll('g.volume');
      gcandlesticks = chart.selectAll('g.candlesticks');
      glinestems =  chart.selectAll('g.linestems');
      // tooltip =   chart.selectAll('rect.mouseover-overlay');
      // vertical = chart.selectAll('line.xlabelLine');
      // horizontal = chart.selectAll('line.ylabelLine');
      // vertical_block = chart_label.select('g#vertical-block');
      // horizontal_block = chart_label.select('g#horizontal-block');


      chart.selectAll('g.xlabels')
      .selectAll('text.xrule')
      .remove();

      chart
      .selectAll('g.volume > rect')
      .remove();

      chart
      .selectAll('g.candlesticks > rect')
      .remove();

      chart
      .selectAll('g.linestems > line')
      .remove();

      chart
      .selectAll('svg > .line')
      .remove();
    }

    //x-axis labels
    xlabels
    .selectAll('text.xrule')
    .data(data.daily.stockLine)
    .enter().append('svg:text')
    .attr('class', 'xrule')
    .attr('x', function(d,i){ return x(i); })
    .attr('y', height-margin.bottom+20)
    .attr('text-anchor', 'middle')
    .text(function(d,i){ return i%interval===0 ? Helper.toDate(d.rdate) : ''; });

    //sentimetal rect bars
    gvolume
    .attr('class','volume')
    .selectAll('rect')
    .data(data.daily.stockLine)
    .enter().append('svg:rect')
    .attr('x', function(d,i) { return x(i) - 2.8*zoomFactor; })
    .attr('y', function(d) { return height - margin.bottom - v(d.volumn); })
    .attr('height', function(d) { return v(d.volumn); })
    .attr('width', function(d) { return 0.8 * graphWidth/data.daily.stockLine.length; })
    .attr('fill', '#595959');

    //rectangles of the candlesticks graph
    gcandlesticks
    .attr('class','candlesticks')
    .selectAll('rect')
    .data(data.daily.stockLine)
    .enter().append('svg:rect')
    .attr('x', function(d, i) { return x(i) - 2.8*zoomFactor; })
    .attr('y', function(d) { return y2(max(d.openpx, d.closepx)); })
    .attr('height', function(d) { return y2(min(d.openpx, d.closepx))-y2(max(d.openpx, d.closepx)); })
    .attr('width', function(d) { return 0.8 * (graphWidth)/data.daily.stockLine.length; })
    .attr('fill', function(d) { return d.openpx > d.closepx ? '#f65c4e' : '#3bbb57'; });

    //verticle lines of the candlesticks graph
    glinestems
    .attr('class','linestems')
    .selectAll('line.stem')
    .data(data.daily.stockLine)
    .enter().append('svg:line')
    .attr('class', 'stem')
    .attr('x1', function(d, i) { return x(i) - 2.8*zoomFactor + 0.4 * (graphWidth - margin.left - margin.right)/data.daily.stockLine.length; })
    .attr('x2', function(d, i) { return x(i) - 2.8*zoomFactor + 0.4 * (graphWidth - margin.left - margin.right)/data.daily.stockLine.length; })
    .attr('y1', function(d) { return y2(d.highpx); })
    .attr('y2', function(d) { return y2(d.lowpx); })
    .attr('stroke', function(d){ return d.openpx > d.closepx ? '#f65c4e' : '#3bbb57'; });

    chart
    .on('mousemove', function(){
      var xPos = d3.mouse(this)[0];
      var yPos = d3.mouse(this)[1];

      // vertical
      // .attr('class', 'xlabelLine')
      // .attr('id', 'xlabelLine')
      // .attr('x1', xPos)
      // .attr('x2', xPos)
      // .attr('y1', height-margin.bottom) //make it line up with the label
      // .attr('y2', margin.top)
      // .attr('stroke', '#44b6ea');

      // vertical_block
      // .attr('id','vertical-block')
      // .attr('x', chartWidth+50)
      // .attr('y', yPos-10)
      // .attr('height', 20)
      // .attr('width',  50)
      // .attr('fill', '#f65c4e');

      yPos = yPos > 370? 370: yPos;
      yPos = yPos < 10? 10: yPos;

      // horizontal
      // .attr('class', 'ylabelLine')
      // .attr('id', 'ylabelLine')
      // .attr('x1', chartWidth)
      // .attr('x2', 0)
      // .attr('y1', yPos) //make it line up with the label
      // .attr('y2', yPos)
      // .attr('stroke', '#f65c4e');

      // horizontal_block
      // .attr('id','horizontal-block')
      // .attr('x', xPos+25)
      // .attr('y', chartHeight+10)
      // .attr('height', 20)
      // .attr('width',  50)
      // .attr('fill', '#44b6ea');

    });




    //sentimentLine
    plotLine('#25bcf1',  'sentimentLine');

    //add all MA lines
    plotLine('#fff',  'ma5');
    plotLine('#d8db74', 'ma10');
    plotLine('#94599d', 'ma20');
    plotLine('#36973a', 'ma60');

    var line = d3.svg.line()
    .x(function(d, i){ return x(i); })
    .y(function(d){ return y2(0); });

    chart.append('path')
    .datum(data.daily.stockLine)
    .attr('class','line')
    .attr('d', line)
    .attr('stroke', '#fff')
    .attr('fill', 'true')
    .attr('id', 'dotted');

    /*
     * args:
     *  - color: string, in hex.
     *          e.g. '#fff', '#9f34a1'
     *  - id: what you want to id your line as. Don't put '#'
     e.g 'ma5', 'ma10'. NOT 'ma5-line'
     */
     function plotLine(color ,id){
      var _id = (id == 'sentimentLine'? 'sentimentLine': id+'-line'); // _id concats into, e.g, ma5-line
      var line = d3.svg.line()
      .x(function(d, i){ return x(i); })
      .y(function(d){
        var isMA = id.slice(0,2) == 'ma';
        return isMA? y2(d[id]): y1(d.moodindex);
      })
      .interpolate('linear');

      chart.append('path')
      .datum(data.daily.stockLine)
      .attr('class','line')
      .attr('d', line)
      .attr('stroke', color)
      .attr('fill', 'none')
      .attr('id', _id);

      if(id != 'sentimentLine'){
        var checkbox = $('#' + id + '-checkbox');
        d3.select('#'+ id + '-line').style('opacity', checkbox.is(':checked')? 1:0);
      }

    }




    if (isNew) {
      tooltip =  chart.append('rect').attr('class', 'mouseover-overlay')
      .attr('fill', 'transparent');
    } else {
      tooltip =   chart.selectAll('rect.mouseover-overlay');
    }

    //tooltips
    tooltip
    .attr('class', 'mouseover-overlay')
    .attr('fill', 'transparent')
    .attr('x', 0)
    .attr('y', margin.top)
    .attr('width', graphWidth)
    .attr('height', height-margin.top-margin.bottom)
    .on('mouseover', function(e){
      return Tooltip.show(); })
    .on('mouseout', function(){
      return Tooltip.hide(); })
    .on('mousemove', function(){
      var xPos = d3.mouse(this)[0],
      yPos = d3.mouse(this)[1],
      j = ChartView.xInverse(xPos, x),
      cursorPriceLevel = y2.invert(yPos)
      d = d2 = data.daily.stockLine[j];

      var model = {
        top: d3.event.layerY-5,
        left: chartWidth-d3.event.layerX>150 ? d3.event.layerX+80 : d3.event.layerX-105,
        date: d.rdate,
        price: cursorPriceLevel,
        security: d,
        sentiment: {
          price: d2.moodindex,
          change: d2.moodindexchg
        }
      };
      return Tooltip.render.index(model);
    });
  },

};
