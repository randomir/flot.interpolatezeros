/*
Flot plugin for interpolating time-series with zeros on a fixed x-grid defined
with `minTickSize` as unit.

Use it in common chart options:

  series: {
    interpolateZeros: null or true or false
  }

or specify it for a specific series

  $.plot($("#placeholder"), [{ data: [ ... ], interpolateZeros: true or false }])

Setting `interpolateZeros` in a specific series will override the common options
setting.

Written by Radomir Stevanovic, October 2012.
Released under the MIT license.
*/

(function ($) {
    var options = {
        series: {
            interpolateZeros: null
        }
    };
    
    var init = function(plot) {
        var interpolateZeros = function(plot, series, datapoints) {
            if (!series.interpolateZeros)
                return;
            
            // map of app. size of time units in milliseconds.
            // copied from flot code, since there is no frendlier way to find
            // out the exact numeric step size.
            var timeUnitSize = {
                "second": 1000,
                "minute": 60 * 1000,
                "hour": 60 * 60 * 1000,
                "day": 24 * 60 * 60 * 1000,
                "month": 30 * 24 * 60 * 60 * 1000,
                "year": 365.2425 * 24 * 60 * 60 * 1000
            };
            var minSize = 0;
            var minTickSize = series.xaxis.options.minTickSize;
            if (minTickSize != null) {
                if (typeof minTickSize == "number")
                    minSize = minTickSize;
                else
                    minSize = minTickSize[0] * timeUnitSize[minTickSize[1]];
            }
            
            // TODO: support for lines.step=true charts
            //var withsteps = series.lines.show && series.lines.steps;
            
            var ps = datapoints.pointsize, points = datapoints.points;
            var newpoints = [].concat(points.slice(0, ps));
            var i = ps, k = 0;
            while (i < points.length) {
                if (points[i] == null) {
                    // copy
                    for (var j = 0; j < ps; j++)
                        newpoints.push(points[i+j]);
                    i += ps;
                } else {
                    var predicted = newpoints[k] + minSize;
                    if (points[i] <= predicted) {
                        // copy
                        for (var j = 0; j < ps; j++)
                            newpoints.push(points[i+j]);
                        i += ps;
                        k += ps;
                    } else {
                        // insert zeros
                        newpoints.push(predicted);
                        for (var j = 1; j < ps; j++)
                            newpoints.push(0);
                        k += ps;
                    }
                }
            }
            
            // overwrite old points
            datapoints.points = newpoints;
        };
        
        plot.hooks.processDatapoints.push(interpolateZeros);
    };
    
    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'interpolatezeros',
        version: '0.1'
    });
})(jQuery);
