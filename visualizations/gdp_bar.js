function GDP() {
    this.name = "World GDP per Capita";

    this.id = 'gdp';

    this.loaded = false;

    var self = this;

    // Array of bar objects
    this.countriesBarArr = [];
    // Object for accessing bar data based on ranking (e.g. 1: [country, gdp], 2: [country, gdp], etc.])
    this.barData;
    this.first_position = 1;
    this.last_position;
    this.currentYear;

    // Data structure for accessing Y positions based on ranking using key-value pairs (e.g. 1: 100, 2: 200, etc.)
    var ranking_y_positions;

    // Chart layout intialization
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

    this.preload = function() {
        var self = this;
        this.data = loadTable(
            'data/gdp/gdp_per_capita.csv', 'csv', 'header',
            function(table) {
                self.loaded = true;
            });
    }
    
    this.destroy = function() {
        console.log("in destroy");
        this.ui.remove();
    };

    this.setup = function() {
        console.log("World GDP setup initiated");

        // Create ui HTML div
        this.ui = createDiv().id('ui');
        this.ui.parent('app');

        // Create title 
        var title = createP().parent('ui').html("<b>Controls</b>");

        // Year slider
        let firstYear = this.data.columns[2];
        let lastYear = this.data.columns[this.data.getColumnCount() -2];
        var yearDiv = createDiv().parent('ui').html("Select Year: " + firstYear + " - " + lastYear);
        this.yearSlider = createSlider(firstYear, lastYear, firstYear, 1).parent(yearDiv);
        this.currentYear = this.yearSlider.value();

        // Number of bars selector
        var numBarsDiv = createDiv().parent('ui').html("Select Number of Countries:");
        this.numBarsSelector = createSelect().parent(numBarsDiv);
        for(let i = 1; i<= 25; i++) {
            this.numBarsSelector.option(i);
        }
        this.numBarsSelector.selected(15);
        this.numBarsSelector.changed(change_num_bars);

        // Bar chart parameters (Showing top X number of countries countries, adjust accordingly);
        this.last_position = this.numBarsSelector.value();
        ranking_y_positions = get_ranking_y_pos(this.first_position, this.last_position, this.layout);

        // Initial data query
        this.data_year_query(this.currentYear, this.first_position, this.last_position);
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log("Data not yet loaded");
            return;
        }
    
        // Update year if there is a change
        if (this.currentYear != this.yearSlider.value()) {
            this.data_year_query(this.yearSlider.value(), this.first_position, this.last_position);
            this.currentYear = this.yearSlider.value();
        }

        // Bar chart elements
        drawTitle(this.last_position, this.currentYear, this.layout);
        drawAxis(this.layout);
        drawAxisLabels("GDP per Capita", "Ranking", this.layout);
        drawYAxisTickLables(ranking_y_positions, this.layout);

        // Update and draw bars
        for (var i = 0; i < this.countriesBarArr.length; i++) {
            this.countriesBarArr[i].update();
            this.countriesBarArr[i].draw();
        }
    };

    ///////////////////////////////////////
    // Chart components helper functions //
    ///////////////////////////////////////
    function drawTitle(numOfCountries, year, layout) {
        fill(0);
        noStroke();
        textSize(20);
        textAlign('center', 'center');
        
        var title = "Top " + numOfCountries + " Countries with the Highest GDP per Capita in " + year;

        text(title, (layout.plotWidth() / 2) + layout.leftMargin, layout.topMargin / 2);
    };

    function drawYAxisTickLables(ranking_positions, layout) {
        for (let i = self.first_position; i <= self.last_position; i++) {
            text(i, layout.leftMargin - 20, ranking_positions[i]);
        }
    }


    /////////////////////////////
    // Other Bar chart methods //
    /////////////////////////////

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

    // Gets the data of the countries from the first to last positons based on the year
    // Updates the barData and countriesBarArr attributes
    this.data_year_query = function(year, first_position, last_position) {
        var countries = this.data.getColumn('Country Name');
        var gdp = this.data.getColumn(year.toString());

        // Create an array of pairs [country, gdp]
        var pairs = countries.map((name, index) => [name, gdp[index]]);
        // Sort the pairs by gdp (second element in each pair) in decending order
        pairs.sort((a, b) => b[1] - a[1]);
        // Get the data of the countries from the first to last positons
        var selectedPairs = pairs.slice(first_position - 1, last_position);

        // Create an object with the data of the countries from the first to last positons
        this.barData = {};
        var counter = 0;
        for(let i = first_position; i <= last_position; i++) {
            this.barData[i] = selectedPairs[counter];
            counter++;
        }

        var minGDP = this.barData[last_position][1];
        var maxGDP = this.barData[first_position][1];

        // Create a bar object for each of the top X countries and push it to an array if there is no pre-existing array
        // Or if number of bars has changed
        if (this.countriesBarArr.length == 0 || this.countriesBarArr.length != last_position) {
            var barArr = [];
            for (let i = first_position; i <= last_position; i++) {
                let bar = new Bar(this.barData[i][0], this.barData[i][1], i, minGDP, maxGDP, this.layout, ranking_y_positions);
                barArr.push(bar);
            }
            this.countriesBarArr = barArr;
        }
        // Update existing bar objects and create new ones if there are new countries
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
                // No pre-existing bar object found for the country
                if (!found) {
                    let bar = new Bar(this.barData[i][0], this.barData[i][1], i, minGDP, maxGDP, this.layout, ranking_y_positions);
                    newBarArray.push(bar);
                }
            }
            this.countriesBarArr = newBarArray;
        }
    }

    // Change the number of bars displayed
    function change_num_bars() {
        self.last_position = self.numBarsSelector.value();
        ranking_y_positions = get_ranking_y_pos(self.first_position, self.last_position, self.layout);
        self.data_year_query(self.currentYear, self.first_position, self.last_position);
    }
}

