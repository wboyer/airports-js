/*jshint multistr: true */

define(function ()
{
    var earthRadius = (6356.752 + 6378.137) / 2; // average between poles and equator
    var toRadians = Math.PI / 180;

    var testAirport1 = { "lat": 40.777245, "lng": -73.872608 };
    var testAirport2 = { "lat": 32.896828, "lng": -97.037997 };

    function haversin(theta)
    {
        return (1.0 - Math.cos(theta)) / 2;
    }

    return {
        greatCircleDistance: function (lat1, lng1, lat2, lng2)
        {
            lat1 *= toRadians;
            lat2 *= toRadians;
            lng1 *= toRadians;
            lng2 *= toRadians;

            return earthRadius * 2 * Math.asin(Math.sqrt(
                    haversin(lat2 - lat1) + Math.cos(lat1) * Math.cos(lat2) * haversin(lng2 - lng1)
            ));
        },

        search: function ()
        {
            alert('hi');
        },

        initDemo: function ($, typeahead, document)
        {
            var cssPath = '/dist/airports-js/src/css/demo.css';

            if (document.createStyleSheet)
                document.createStyleSheet(cssPath);
            else
                $("head").append($("<link rel='stylesheet' href='" + cssPath + "' type='text/css' media='screen' />"));

            $("#demo").html(' \
                <div style="position: relative; height: 400px; overflow: auto;"> \
                    <div class="row"> \
                        <div class="col-xs-12 col-md-5"> \
                            <div id="airports"> \
                                <input id="airport1" type="text" class="airport-input" placeholder="type something"><br> \
                                <input id="airport2" type="text" class="airport-input" placeholder="type something"> \
                            </div> \
                        </div> \
                        <div class="col-xs-12 col-md-7"> \
                            <div id="mapContainer"> \
                            </div> \
                        </div> \
                    </div> \
                </div> \
            ');

            $('.airport-input').typeahead({
                    minLength: 1,
                    highlight: true
                },
                {
                    name: 'airport-search',
                    source: this.search
                });
        }
    };
});
