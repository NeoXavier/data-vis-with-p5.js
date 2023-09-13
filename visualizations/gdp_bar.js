function GDP() {
    this.name = "World GDP per Capita";

    this.id = 'gdp';

    this.loaded = false;

    // Public attributes
    this.countriesBarArr = [];
    this.barData;
    this.first_position;
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

        // Year slider
        var yearDiv = createDiv().parent('ui');
        let firstYear = years[0];
        let lastYear = years[years.length - 1];
        this.yearSlider = createSlider(firstYear, lastYear, firstYear, 1).parent(yearDiv);
        this.yearDisplay = createDiv().parent(yearDiv).html(this.yearSlider.value());
        currentYear = this.yearSlider.value();

        // Bar chart parameters (Showing top 10 countries, adjust accordingly);
        this.first_position = 1;
        this.last_position = 25;
        ranking_y_positions = get_ranking_y_pos(this.first_position, this.last_position, this.layout);

        this.data_year_query(currentYear, this.first_position, this.last_position);
    };

    this.destroy = function() {
        console.log("in destroy");
        this.ui.remove();
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log("Data not yet loaded");
            return;
        }

        // Update year if there is a change
        if (currentYear != this.yearSlider.value()) {
            this.yearDisplay.html(this.yearSlider.value());
            this.data_year_query(this.yearSlider.value(), this.first_position, this.last_position);
            currentYear = this.yearSlider.value();
        }

        // Bar chart elements
        drawAxis(this.layout);
        drawAxisLabels("GDP per Capita", "Ranking", this.layout);
        drawYAxisTickLables(ranking_y_positions, this.layout);

        for (var i = 0; i < this.countriesBarArr.length; i++) {
            this.countriesBarArr[i].update();
            this.countriesBarArr[i].draw();
        }
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
        if (this.countriesBarArr.length == 0) {
            for (let i = first_position; i <= last_position; i++) {
                let bar = new Bar(this.barData[i][0], this.barData[i][1], i, minGDP, maxGDP, this.layout, ranking_y_positions);
                this.countriesBarArr.push(bar);
            }
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

// min and max values of the overall dataset
function Bar(_name, _gdp, _position, min, max, layout, y_positions) {
    this.name = _name;
    this.gdp = _gdp;
    this.position = _position;
    //this.color = get_color();
    this.color = color(random(0, 200), random(155, 255), random(155, 255));

    var layout = layout;
    var y_positions = y_positions;
    var plotWidth = layout.plotWidth();

    var barHeight = get_bar_height(y_positions);
    var targetBarWidth;
    var currentBarWidth = 0;
    var widthChangeDirection = 1;
    var targetY;
    var currentY = 0;
    var yChangeDirection = 1;

    this.draw = function() {
        let x = layout.leftMargin + layout.pad;
        fill(this.color);
        rect(x, currentY, currentBarWidth, barHeight);
        fill(50);
        textAlign(RIGHT, CENTER);
        text(this.name, x + currentBarWidth - 10, currentY + barHeight / 2);
        textAlign(LEFT, CENTER);
        text(round(this.gdp), x + currentBarWidth + 10, currentY + barHeight / 2);
    }

    this.update = function() {
        if (currentBarWidth == 0) {
            currentBarWidth = round(map(this.gdp, min * 0.9, max * 1.1, 100, plotWidth - layout.pad));
            targetBarWidth = currentBarWidth;
        }
        if (currentY == 0) {
            currentY = y_positions[this.position] - barHeight / 2;
            targetY = currentY;
        }

        if (currentBarWidth != targetBarWidth) {
            currentBarWidth += 5 * widthChangeDirection;
            if (abs(currentBarWidth - targetBarWidth) < 5) {
                currentBarWidth = targetBarWidth;
            }
        }
        if (currentY != targetY) {
            currentY += 2 * yChangeDirection;
            if (abs(currentY - targetY) < 5) {
                currentY = targetY;
            }
        }
    }

    this.changeBarParams = function(ranking, gdp, new_min, new_max, y_positions, layout) {
        this.position = ranking;
        this.gdp = gdp;
        targetBarWidth = round(map(this.gdp, new_min * 0.9, new_max * 1.1, 100, plotWidth - layout.pad));
        if (targetBarWidth >= currentBarWidth) {
            widthChangeDirection = 1;
        }
        else {
            widthChangeDirection = -1;
        }
        targetY = y_positions[this.position] - barHeight / 2;
        if (targetY >= currentY) {
            yChangeDirection = 1;
        }
        else {
            yChangeDirection = -1;
        }
    }

    function get_bar_height(y_positions) {
        var barHeight;
        var spacing = (y_positions[y_positions['last']] - y_positions[y_positions['first']]) / (y_positions['last'] - 1)

        if (spacing < 25) {
            var gap = 2.5;
            barHeight = spacing - gap;
        }
        else if (spacing > 40) {
            barHeight = 30;
        }
        else {
            barHeight = 25;
        }
        return barHeight;
    }

    function get_color(){
        const backgroundColors = [
            [255, 0, 0],     // Red
            [0, 255, 0],     // Green
            [0, 0, 255],     // Blue
            [255, 255, 0],   // Yellow
            [255, 0, 255],   // Magenta
            [0, 255, 255],   // Cyan
            [128, 128, 128], // Gray
            [255, 128, 0],   // Orange
            [0, 128, 255],   // Light Blue
            [128, 0, 0],     // Dark Red
            [0, 128, 0],     // Dark Green
            [0, 0, 128],     // Dark Blue
            [128, 128, 0],   // Olive
            [128, 0, 128],   // Purple
            [0, 128, 128],   // Teal
            [192, 192, 192], // Silver
            [255, 165, 0],   // Gold
            [139, 69, 19],   // Saddle Brown
            [255, 69, 0],    // Red-Orange
            [173, 216, 230], // Light Blue
            [70, 130, 180],  // Steel Blue
            [46, 139, 87],   // Sea Green
            [255, 192, 203], // Pink
            [255, 140, 0]    // Dark Orange
        ];
        var randomColor = random(backgroundColors);
        return color(randomColor[0], randomColor[1], randomColor[2]);
    }

    // Checks if the mouse is hovering over the bar
    // Input: x and y coordinates of the Bar object and the width and height of the bar
    function checkMouseHover(x, y, width, height) {
        if (mouseX > x && mouseX < x + width && mouseY > y && mouseY < y + height) {
            return true;
        }
    }
}
