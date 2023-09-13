function GDP() {
    this.name = "World GDP per Capita";

    this.id = 'gdp';

    this.loaded = false;

    // Public attributes
    this.countriesBarArr = [];
    this.barData;
    this.first_position = 1;
    this.last_position;

    // Private attributes
    var years = [];
    var currentYear;
    var ranking_y_positions;
    var minGDP;
    var maxGDP;

    this.preload = function() {
        var self = this;
        this.data = loadTable(
            'data/gdp/gdp_per_capita.csv', 'csv', 'header',
            function(table) {
                self.loaded = true;
            });
    }

    var marginSize = 35;
    this.layout = {
        marginSize: marginSize,

        // Margin positions around the plot. Left and bottom have double
        // margin size to make space for axis and tick labels on the canvas.
        leftMargin: marginSize * 2,
        rightMargin: width - marginSize,
        topMargin: marginSize,
        bottomMargin: height - marginSize * 2,
        pad: 5,

        plotWidth: function() {
            return this.rightMargin - this.leftMargin;
        },

        plotHeight: function() {
            return this.bottomMargin - this.topMargin;
        },

    };

    this.setup = function() {
        console.log("World GDP setup initiated");

        // Create year array
        for (var i = 2; i < this.data.getColumnCount() - 1; i++) {
            var y = Number(this.data.columns[i]);
            years.push(y);
        }

        // Create ui HTML div
        this.ui = createDiv().id('ui');
        this.ui.parent('app');

        var title = createP().parent('ui').html("<b>Controls</b>");

        // Year slider
        var yearDiv = createDiv().parent('ui').html("Select Year:");
        let firstYear = years[0];
        let lastYear = years[years.length - 1];
        this.yearSlider = createSlider(firstYear, lastYear, firstYear, 1).parent(yearDiv);
        currentYear = this.yearSlider.value();

        // Number of bars selector

        var numBarsDiv = createDiv().parent('ui').html("Select Number of Countries:");
        this.numBarsSelector = createSelect().parent(numBarsDiv);
        for(let i = 1; i<= 25; i++) {
            this.numBarsSelector.option(i);
        }
        this.numBarsSelector.selected(10);
        this.numBarsSelector.changed(this.change_num_bars.bind(this));

        // Bar chart parameters (Showing top X number of countries countries, adjust accordingly);
        this.last_position = this.numBarsSelector.value();
        ranking_y_positions = get_ranking_y_pos(this.first_position, this.last_position, this.layout);

        this.data_year_query(currentYear, this.first_position, this.last_position);
    };
    
    this.destroy = function() {
        console.log("in destroy");
        this.ui.remove();
    };

    this.change_num_bars= function() {
        this.last_position = this.numBarsSelector.value();
        ranking_y_positions = get_ranking_y_pos(this.first_position, this.last_position, this.layout);
        this.data_year_query(currentYear, this.first_position, this.last_position);
    }

    this.draw = function() {
        if (!this.loaded) {
            console.log("Data not yet loaded");
            return;
        }
    
        // Update year if there is a change
        if (currentYear != this.yearSlider.value()) {
            this.data_year_query(this.yearSlider.value(), this.first_position, this.last_position);
            currentYear = this.yearSlider.value();
        }

        // Bar chart elements
        drawTitle(this.last_position, currentYear, this.layout);
        drawAxis(this.layout);
        drawAxisLabels("GDP per Capita", "Ranking", this.layout);
        drawYAxisTickLables(ranking_y_positions, this.layout);

        for (var i = 0; i < this.countriesBarArr.length; i++) {
            this.countriesBarArr[i].update();
            this.countriesBarArr[i].draw();
        }
    };

    function drawTitle(numOfCountries, year, layout) {
        fill(0);
        noStroke();
        textSize(20);
        textAlign('center', 'center');
        
        var title = "Top " + numOfCountries + " Countries with the Highest GDP per Capita in " + year;

        text(title, (layout.plotWidth() / 2) + layout.leftMargin, layout.topMargin / 2);
    };

    function drawYAxisTickLables(ranking_positions, layout) {
        for (let i = ranking_positions['first']; i <= ranking_positions['last']; i++) {
            text(i, layout.leftMargin - 20, ranking_positions[i]);
        }
    }

    // Maps the Y coordinates of the ranking lables
    // Input: First positon, Last Position, chart layout
    // Output: Object with ranking position as keys and y coordinates as values 
    function get_ranking_y_pos(first_pos, last_pos, layout) {
        let ranking_positions = {};
        for (let i = first_pos; i <= last_pos; i++) {
            ranking_positions[i] = map(i, first_pos, last_pos, layout.topMargin + 20, layout.bottomMargin - 20);
        }
        ranking_positions['first'] = first_pos;
        ranking_positions['last'] = last_pos;
        return ranking_positions;
    }

    // Gets the top 10 countries with the highest gdp for a given year
    // Updates the top10Data and countriesBarArr
    this.data_year_query = function(year, first_position, last_position) {
        var countries = this.data.getColumn('Country Name');
        var gdp = this.data.getColumn(year.toString());

        // Create an array of pairs [country, gdp]
        var pairs = countries.map((name, index) => [name, gdp[index]]);
        // Sort the pairs by gdp (second element in each pair) in decending order
        pairs.sort((a, b) => b[1] - a[1]);

        // Get the data of the countries from the first to last positons
        var selectedPairs = pairs.slice(first_position - 1, last_position);

        this.barData = {};
        var counter = 0;
        for(let i = first_position; i <= last_position; i++) {
            this.barData[i] = selectedPairs[counter];
            counter++;
        }

        minGDP = this.barData[last_position][1];
        maxGDP = this.barData[first_position][1];

        // Create a bar object for each of the top 10 countries and push it to an array
        // Or if number of bars has changed
        if (this.countriesBarArr.length == 0 || this.countriesBarArr.length != last_position) {
            var barArr = [];
            for (let i = first_position; i <= last_position; i++) {
                let bar = new Bar(this.barData[i][0], this.barData[i][1], i, minGDP, maxGDP, this.layout, ranking_y_positions);
                barArr.push(bar);
            }
            this.countriesBarArr = barArr;
        }
        else {
            // newBarArray is the array for the new countriesBarArr
            var newBarArray = [];
            for (let i = first_position; i <= last_position; i++) {
                var found = false;
                for (let j = 0; j < this.countriesBarArr.length; j++) {
                    if (this.countriesBarArr[j].name == this.barData[i][0]) {
                        this.countriesBarArr[j].changeBarParams(i, this.barData[i][1],minGDP, maxGDP, ranking_y_positions, this.layout);
                        newBarArray.push(this.countriesBarArr[j]);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    let bar = new Bar(this.barData[i][0], this.barData[i][1], i, minGDP, maxGDP, this.layout, ranking_y_positions);
                    newBarArray.push(bar);
                }
            }
            this.countriesBarArr = newBarArray;
        }
    }
}

