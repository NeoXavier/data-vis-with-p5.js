// Data visualization app World GDP per Capita bar chart extension
function GDP() {
    this.name = "World GDP per Capita";

    this.id = 'gdp';

    this.loaded = false;

    var self = this;

    // Array of bar objects
    this.countriesBarArr = [];
    // Object for accessing bar data based on ranking (e.g. 1: [country, gdp], 2: [country, gdp], etc.])
    this.barData;

    // First and last positions of the bar chart, e.g. first position = 1, last position = 15, the bar chart will show countries ranking 1 to 15
    this.firstPosition = 1;
    this.lastPosition;
    // Current year of data shown on the bar chart
    this.currentYear;

    // Data structure for accessing Y positions based on ranking using key-value pairs (e.g. 1: 100, 2: 200, etc.)
    var rankingYPositions;
    // UI element to show currently selected year
    var yearDisplay;

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

        // Setup UI elements
        setupUI();

        // Bar chart parameters (Showing top X number of countries countries, adjust accordingly);
        this.lastPosition = this.numBarsSelector.value();
        rankingYPositions = get_ranking_y_pos(this.firstPosition, this.lastPosition, this.layout);

        // Initial data query
        this.data_year_query(this.currentYear, this.firstPosition, this.lastPosition);
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log("Data not yet loaded");
            return;
        }

        // Update year if there is a change
        if (this.currentYear != this.yearSlider.value()) {
            this.data_year_query(this.yearSlider.value(), this.firstPosition, this.lastPosition);
            this.currentYear = this.yearSlider.value();
            yearDisplay.html(this.currentYear);
        }

        // Bar chart elements
        drawTitle(`Top ${this.lastPosition} Countries with the Highest GDP per Capita in ${this.currentYear}`, this.layout);
        drawAxis(this.layout);
        drawAxisLabels("GDP per Capita", "Ranking", this.layout);
        drawYAxisTickLables(rankingYPositions, this.layout);

        // Update and draw bars
        for (var i = 0; i < this.countriesBarArr.length; i++) {
            this.countriesBarArr[i].update();
            this.countriesBarArr[i].draw();
        }
    };

    ///////////////
    // UI Setup //
    ///////////////

    // Function to create UI elements
    function setupUI() {
        // Create ui HTML div
        self.ui = createDiv().id('ui');
        self.ui.parent('app');

        // Create title 
        var title = createP().parent('ui').html("<b>Controls</b>");

        // Year slider
        let firstYear = self.data.columns[2];
        let lastYear = self.data.columns[self.data.getColumnCount() - 2];
        var yearDiv = createDiv().parent('ui').html("Select Year: ");
        yearDisplay = createSpan().parent(yearDiv).style('display', 'inline-block');
        self.yearSlider = createSlider(firstYear, lastYear, firstYear, 1).parent(yearDiv);
        self.currentYear = self.yearSlider.value();
        yearDisplay.html(self.currentYear);

        // Number of bars selector
        var numBarsDiv = createDiv().parent('ui').html("Select Number of Countries:");
        self.numBarsSelector = createSelect().parent(numBarsDiv);
        for (let i = 1; i <= 25; i++) {
            self.numBarsSelector.option(i);
        }
        self.numBarsSelector.selected(15);
        self.numBarsSelector.changed(change_num_bars);

    }

    ///////////////////////////////////////
    // Chart components helper functions //
    ///////////////////////////////////////
    // Draws the Y axis tick labels
    // Input: object with ranking position as the key and y position as the value, chart layout
    function drawYAxisTickLables(ranking_positions, layout) {
        for (let i = self.firstPosition; i <= self.lastPosition; i++) {
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
    this.data_year_query = function(year, firstPosition, lastPosition) {
        var countries = this.data.getColumn('Country Name');
        var gdp = this.data.getColumn(year.toString());

        // Create an array of pairs [country, gdp]
        var pairs = countries.map((name, index) => [name, gdp[index]]);
        // Sort the pairs by gdp (second element in each pair) in decending order
        pairs.sort((a, b) => b[1] - a[1]);
        // Get the data of the countries from the first to last positons
        var selectedPairs = pairs.slice(firstPosition - 1, lastPosition);

        // Create an object with the data of the countries from the first to last positons
        this.barData = {};
        var counter = 0;
        for (let i = firstPosition; i <= lastPosition; i++) {
            this.barData[i] = selectedPairs[counter];
            counter++;
        }

        var minGDP = this.barData[lastPosition][1];
        var maxGDP = this.barData[firstPosition][1];

        // Create a bar object for each of the top X countries and push it to an array if there is no pre-existing array
        // Or if number of bars has changed
        if (this.countriesBarArr.length == 0 || this.countriesBarArr.length != lastPosition) {
            var barArr = [];
            for (let i = firstPosition; i <= lastPosition; i++) {
                let bar = new Bar(this.barData[i][0], this.barData[i][1], i, minGDP, maxGDP, this.layout, rankingYPositions);
                barArr.push(bar);
            }
            this.countriesBarArr = barArr;
        }
        // Update existing bar objects and create new ones if there are new countries
        else {
            // newBarArray is the array for the new countriesBarArr
            var newBarArray = [];
            for (let i = firstPosition; i <= lastPosition; i++) {
                var found = false;
                for (let j = 0; j < this.countriesBarArr.length; j++) {
                    if (this.countriesBarArr[j].name == this.barData[i][0]) {
                        this.countriesBarArr[j].changeBarParams(i, this.barData[i][1], minGDP, maxGDP, rankingYPositions, this.layout);
                        newBarArray.push(this.countriesBarArr[j]);
                        found = true;
                        break;
                    }
                }
                // No pre-existing bar object found for the country
                if (!found) {
                    let bar = new Bar(this.barData[i][0], this.barData[i][1], i, minGDP, maxGDP, this.layout, rankingYPositions);
                    newBarArray.push(bar);
                }
            }
            this.countriesBarArr = newBarArray;
        }
    }

    // Change the number of bars displayed
    function change_num_bars() {
        self.lastPosition = self.numBarsSelector.value();
        rankingYPositions = get_ranking_y_pos(self.firstPosition, self.lastPosition, self.layout);
        self.data_year_query(self.currentYear, self.firstPosition, self.lastPosition);
    }
}

