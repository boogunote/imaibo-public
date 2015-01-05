var PRODUCTION = true;
// Hide Phase II features
var HIDE = PRODUCTION;
var IE8 = !!$('.lt-ie9').length;

$(function(){
  'use strict';
  // Sets up routing logic for left content panel
  ContentView.init();

  // Gets data from API and plots graph
  ChartView.init();

  // Sets up routing logic for right content panel
  RightPanel.init();

  // Sets up sticky left and right columns
  $('#right-panel, #content').stick_in_parent({ recalc_every: 1 });

  // Hides certain features
  if(HIDE){
    $('#frequency').remove();
    $('#rsi-icon').remove();
    $('.link-stockpicker-view').remove();
    $('.link-news-view').remove();
    $('.vertical-collapse').remove();
    $('.vertical-uncollapse').remove();
  }

  // Show contents only after DOM loads
  $('.outer').css('visibility', 'visible');
});

