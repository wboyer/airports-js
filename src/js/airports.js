/*jshint multistr: true */

define(function ()
{
    var earthRadius = (6356.752 + 6378.137) / 2; // average between poles and equator
    var toRadians = Math.PI / 180;
    var nmiToKm = 0.539957;

    function haversin(theta)
    {
        return (1.0 - Math.cos(theta)) / 2;
    }

    function round(number, places)
    {
        var factor = Math.pow(10, places);

        return Math.round(number * factor) / factor;
    }

    function greatCircleDistance(lat1, lng1, lat2, lng2)
    {
        lat1 *= toRadians;
        lat2 *= toRadians;
        lng1 *= toRadians;
        lng2 *= toRadians;

        return earthRadius * 2 * Math.asin(Math.sqrt(
                haversin(lat2 - lat1) + Math.cos(lat1) * Math.cos(lat2) * haversin(lng2 - lng1)
        ));
    }

    function updateDistance()
    {
        var data1 = $("#airport-desc-1").data("data");
        var data2 = $("#airport-desc-2").data("data");

        if (data1 && !data1.error && data2 && !data2.error) {
            var km = greatCircleDistance(data1.lat, data1.lng, data2.lat, data2.lng);
            $("#distance-1").html("<strong>Distance:</strong> " + round(km, 2) + " km, " + round(km * nmiToKm, 2) + " nmi");
        }
        else
            $("#distance-1").html("");
    }

    function clearAirportDescription(description)
    {
        description.removeData("data");
        description.html("");

        updateDistance();
    }

    function updateAirportDescription(description, airportData)
    {
        if (airportData) {
            if (airportData.error)
                clearAirportDescription(description);

            description.data("data", airportData);

            if (!airportData.error)
                description.html("<strong>" + airportData.code + "</strong>" + " - " + airportData.name + "<br>" +
                                    airportData.city + ", " + airportData.country +
                                    " (" + round(airportData.lat, 2) + ", " + round(airportData.lng, 2) + ")");

            updateDistance();
        }
        else
            description.html("loading...");
    }

    return {
        lookupAirport: function (input)
        {
            input = $(input);
            var code = input.val().toUpperCase();

            var description = $("#" + input.attr("id").replace("input", "desc"));
            var data = description.data("data");

            if (data) {
                var currentCode = data.code;
                if (code == currentCode)
                    return;
            }

            clearAirportDescription(description);

            if (code.length != 3)
                return;

            updateAirportDescription(description);

            $.ajax({
                url: "/api/airports/" + code
            })
            .done(function (airportData)
            {
                updateAirportDescription(description, airportData);
            })
            .fail(function ()
            {
                updateAirportDescription(description, { "code": code, "error": true });
            });
        },

        getSuggestions: function (query, callback)
        {
            $.ajax({
                url: "/api/airports/search/" + query.toLowerCase()
            }).done(function (results)
            {
                if (results)
                    callback(results.slice(0, 30));  // TODO: Result set should be limited server-side.
            });
        },

        renderSuggestion: function (suggestion)
        {
            var main = suggestion.code;
            if (suggestion.name)
                main += ' - ' + suggestion.name;

            var sub = "";
            if (suggestion.city)
                sub += suggestion.city;
            if (suggestion.country) {
                if (sub.length)
                    sub += ' - ';
                sub += suggestion.country;
            }

            return '<div class="suggestion"><div class="suggestion-main">' + main + '</div><div class="suggestion-sub">' + sub + '</div></div>';
        },

        renderNoSuggestions: function ()
        {
            return '<div class="suggestion"><span class="suggestion-empty">no suggestions</span></div>';
        },

        initDemo: function ($, typeahead, document)
        {
            var cssPath = '/dist/airports-js/dist/css/demo.css';

            if (document.createStyleSheet)
                document.createStyleSheet(cssPath);
            else
                $("head").append($("<link rel='stylesheet' href='" + cssPath + "' type='text/css' media='screen' />"));

            $("#demo").html(' \
                <div id="demo-container"> \
                    <div class="row"> \
                        <div class="col-xs-12 col-md-5"> \
                            <div id="airports"> \
                                <div class="airport"><input id="airport-input-1" type="text" class="airport-input" placeholder="type something"><div id="airport-desc-1" class="airport-desc"></div></div> \
                                <div class="airport"><input id="airport-input-2" type="text" class="airport-input" placeholder="type something"><div id="airport-desc-2" class="airport-desc"></div></div> \
                                <div class="distance" id="distance-1"></div> \
                            </div> \
                        </div> \
                        <div class="col-xs-12 col-md-7"> \
                            <div id="mapContainer"> \
                            </div> \
                        </div> \
                    </div> \
                </div> \
            ');

            var self = this;

            $(".airport-input").typeahead(
                {
                    minLength: 1,
                    hint: false,
                    highlight: true
                },
                {
                    name: 'airport-search',
                    source: function (query, cb)
                    {
                        self.getSuggestions(query, cb);
                    },
                    displayKey: "code",
                    templates: {
                        suggestion: this.renderSuggestion,
                        empty: this.renderNoSuggestions
                    }
                }
            );

            $(".airport-input").bind("typeahead:selected change blur", function ()
            {
                self.lookupAirport(this);
            });

            $(".airport-input").bind("keyup", function (event)
            {
                self.lookupAirport(this);

                if (event.which == 13)
                    $(".airport-input").typeahead('close');

                return true;
            });
        }
    };
});
