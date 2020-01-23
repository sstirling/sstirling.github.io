$(window).load(function() {

    var qsRegex;
    var buttonFilter;
    var $quicksearch = $('#quicksearch');
    var $container = $('#database')
    var timeout;

   
    var public_spreadsheet_url = '1PW7U4VxuzXQOgabtiU3A33y428Lah9xBi-1L4ELfJgM';


    var timestampdata = "https://spreadsheets.google.com/feeds/cells/" + public_spreadsheet_url + "/2/public/full?alt=json"

    // Call the Google Spreadsheet as a regular JSON to get latest timestamp which is not included in Tabletop.js


    $.ajax({
        url: timestampdata,
        dataType: "jsonp",
        success: function(data) {
            // Get timestamp and parse it to readable format


            var date = data.feed.updated.$t

            var MM = {
                Jan: "Jan.",
                Feb: "Feb.",
                Mar: "March",
                Apr: "April",
                May: "May",
                Jun: "June",
                Jul: "July",
                Aug: "Aug.",
                Sep: "Sept.",
                Oct: "Oct.",
                Nov: "Nov.",
                Dec: "Dec."
            }

            var formatdate = String(new Date(date)).replace(
                /\w{3} (\w{3}) (\d{2}) (\d{4}) (\d{2}):(\d{2}):[^(]+\(([A-Z]{3})\)/,
                function($0, $1, $2, $3, $4, $5, $6) {
                    return MM[$1] + " " + $2 + ", " + $3 + " at " + $4 % 12 + ":" + $5 + (+$4 > 12 ? "PM" : "AM") + " " + $6
                }
            )


            $('.updated').append("Last updated " + formatdate)
        },
    });



    // Tabletop initialization

    Tabletop.init({
        key: public_spreadsheet_url,
        callback: getTable,
        simpleSheet: true
    })

    // Function that fetches the Google Spreadsheet


    function getTable(data, tabletop) {

        var sheetname = tabletop.foundSheetNames[0];
        var sheetnamecontrol = tabletop.foundSheetNames[1];

        // Get title of datasheet

        var title = sheetname;
        $("h3").append(title)

        // Get credits and explainer from "Control spreadsheet"

        $.each(tabletop.sheets(sheetnamecontrol).all(), function(i, v) {

            var explainer = v.explainer
            var credits = v.credits
            $(".credit").append(credits)
            $(".explainer").append(explainer)
        });

        var result = [];
        var count = 1;


        $.each(tabletop.sheets(sheetname).all(), function(i, v) {


            // Parses the resulting JSON into the individual squares for each row

            $container.append('<div id="element-item"><div class="headimg"><a href="' + v.comedian + '"><img src="' + v.img + '" width="100%"></a></div><div class="name">' + v.special + '</div><div class="colorsubhed">' + v.other + '</div><div class="category">' + v.rating + '</div><div class="description">' + v.lol + '</div><img src="' + v.delivery + '" ><div class="boldsubhed">' + v.style + '</div><div class="readmore">Read <a href="' + v.quality1 + ' " target="_blank">more</a></div></div>');


            // Gets all unique filtercategory values and puts them into an array
            if ($.inArray(v.quality1, result) == -1) {

                result.push(v.quality1);

                // Creates the filter buttons

                $('#filter').append('<button id="' + v.quality1 + '" class="btn btn-default" data-value="choice' + count++ + '">' + v.quality1 + '</button>')

            }


        });

        // Adds the search function


        // $quicksearch.keyup(debounce(function() {
        //     qsRegex = new RegExp($quicksearch.val(), 'gi');
        //     $container.isotope();
        // }));


        // imagesLoaded waits until all images are loaded before firing
        $container.imagesLoaded(function() {

            // Sorts them into responsive square layout using isotope.js

            $container.isotope({
                itemSelector: '#element-item',
                layoutMode: 'masonry',
                // so that isotope will filter both search and filter results
                filter: function() {
                    var $this = $(this);
                    var searchResult = qsRegex ? $this.text().match(qsRegex) : true;

                    var buttonResult = buttonFilter ? $this.is(buttonFilter) : true;

                    return searchResult && buttonResult;

                }

            });
        });



        // debounce so filtering doesn't happen every millisecond
        function debounce(fn, threshold) {

            return function debounced() {
                if (timeout) {
                    clearTimeout(timeout);
                }

                function delayed() {
                    fn();
                    timeout = null;
                }
                timeout = setTimeout(delayed, threshold || 100);
            }
        }

        // Adds a click function to all buttons in the group

        $('.btn-group').each(function(i, buttonGroup) {
            var $buttonGroup = $(buttonGroup);
            var allbuttonids = $("button").attr('id');
            $buttonGroup.on('click', 'button', function() {

                // Changes to .is-checked class when clicked

                $buttonGroup.find('.is-checked').removeClass('is-checked');
                $(this).addClass('is-checked');

                // Gets all values that matches the clicked button's data value

                buttonFilter = $(this).attr('data-value');
                textFilter = $(this).text();


                function getitems() {
                    var name = $(this).find('.category').text();

                    if (textFilter != "Show All") {
                        return name.match(textFilter);

                    } else {
                        return "*";
                    }

                }

                buttonFilter = getitems || buttonFilter;

                $container.isotope();


            });
        });


    };

});