function Happiness() {
    this.name = "World Happiness Chart";

    this.id = 'happiness';

    this.loaded = false;

    var self = this;

    // Array of dot objects for scatterplot
    this.dots = [];
    // Min and max values of x and y
    this.y_min = 0;
    this.y_max;
    this.x_min = 0;
    this.x_max;

    var currentYear = '2018';

    // Table of all countries in focus (after all queries are made)
    var plotData;

    var showCorrelationChart = false;

    var variableSelector;
    var correlationChartButton;

    // Array of arrays of correlation indexes for corresponding variables
    var correlationData = [];

    // Chart layout intialization
    var marginSize = 45;
    this.layout = {
        marginSize: marginSize,

        // Margin positions around the plot. Left and bottom have double
        // margin size to make space for axis and tick labels on the canvas.
        leftMargin: marginSize * 2,
        rightMargin: width - marginSize,
        topMargin: marginSize,
        bottomMargin: height - marginSize * 2,
        pad: 20,
        grid: true,

        plotWidth: function() {
            return this.rightMargin - this.leftMargin;
        },

        plotHeight: function() {
            return this.bottomMargin - this.topMargin;
        },

        numYTickLabels: 10,
        numXTickLabels: 10
    };

    ///////////////////////////////////////////////////////////////
    //////////////////// Boilerplate functions ////////////////////
    ///////////////////////////////////////////////////////////////

    this.preload = function() {
        var self = this;
        this.data = loadTable(
            'data/world_happiness/report_2018-2019.csv', 'csv', 'header',
            function(table) {
                self.loaded = true;
            });
    }

    this.destroy = function() {
        console.log("in destroy");
        this.ui.remove();
    };

    this.setup = function() {
        console.log("World Happiness Chart intitalized");

        // Setup UI elements
        generateUI();

        // Initial data query
        plotData = getPlotData()
        // Initalization of array of dot objects
        this.dots = generateDotArray(variableSelector.value());
        // Generate correlation indexes for all variables, used to draw correlation heatmap
        generateCorrelationData();
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log("Data not yet loaded");
            return;
        }

        // Drawing correlation heatmap
        if (showCorrelationChart) {
            drawTitle(`Correlation Heatmap (${currentYear})`, this.layout);
            correlationHeatmap(this.layout.leftMargin + (marginSize * 3), this.layout.topMargin);
        }
        // Drawing scatterplot
        else {
            drawChartElements();
            for (var i = 0; i < this.dots.length; i++) {
                this.dots[i].draw();
                if (this.dots[i].isMouseOver()) {
                    var hoveredDot = this.dots[i];
                }
            }
            // Show data point info of dot at mouse position
            if (hoveredDot !== undefined) {
                hoveredDot.showDotInfo();
            }
        }

    };

    /////////////////////////////////////////////////////////
    //////////////////// Setup functions ////////////////////
    /////////////////////////////////////////////////////////

    // Creates UI div to dynamically change the chart
    function generateUI() {
        self.ui = createDiv().id('ui');
        self.ui.parent('app');

        // Create title 
        var title = createDiv().parent('ui').html("<b>Controls</b>").style('padding', '10px 5px');

        // Creating variable selector dropdown
        var variableSelectorDiv = createDiv().id('var-ctrls').parent('ui').html("Select Variable:").style('padding', '10px 5px');
        variableSelector = createSelect().parent('var-ctrls');
        for (var i = 4; i < self.data.columns.length; i++) {
            variableSelector.option(self.data.columns[i]);
        }
        variableSelector.selected(self.data.columns[4]);
        variableSelector.changed(selectorChangedEvent);

        // Creating year selector buttons
        var yearSelectorDiv = createDiv().parent('ui').html("Select Year: ").style('padding', '10px 5px');
        var button1 = createButton('2018').parent(yearSelectorDiv).style('display', 'inline-block').mousePressed(() => yearButtonPressed('2018'));
        var button2 = createButton('2019').parent(yearSelectorDiv).style('display', 'inline-block').mousePressed(() => yearButtonPressed('2019'));

        // Creating correlation heatmap toggle button
        var correlationHeatmapButtonDiv = createDiv().id('corr-heatmap-ctrls').parent('ui').style('padding', '10px 5px');
        correlationChartButton = createButton('Show Correlation Heatmap').parent('corr-heatmap-ctrls');
        correlationChartButton.mousePressed(correlationChartButtonPressed);

    }


    ///////////////////////////////////////////////////////////
    //////////////////// UI event handlers ////////////////////
    ///////////////////////////////////////////////////////////

    // Executes when variable selector dropdown is changed
    function selectorChangedEvent() {
        self.dots = generateDotArray(variableSelector.value());
    }

    // Executes when either year selector button is pressed
    function yearButtonPressed(year) {
        currentYear = year;
        // Query data for selected year
        plotData = getPlotData();
        // Generate new array of dot objects 
        self.dots = generateDotArray(variableSelector.value());
        // Generate new correlation indexes for all variables
        generateCorrelationData();
    }

    // Executes when correlation heatmap toggle button is pressed
    function correlationChartButtonPressed() {
        // Toggle show correlation chart state
        showCorrelationChart = !showCorrelationChart;
        if (showCorrelationChart) {
            correlationChartButton.html('Hide Correlation Heatmap');
        }
        else {
            correlationChartButton.html('Show Correlation Heatmap');
        }
    }

    ///////////////////////////////////////////////////////////
    //////////////////// Drawing functions ////////////////////
    ///////////////////////////////////////////////////////////

    // Draws chart elements
    function drawChartElements() {
        drawTitle(`World Happiness Chart (${currentYear})`, self.layout);
        drawAxis(self.layout);
        drawAxisLabels(variableSelector.value(), 'Happiness Score', self.layout);
        drawYAxisTickLabels(self.y_min, self.y_max, self.layout, map_Y.bind(self), 2);
        drawXAxisTickLabels();
    }

    // Draw x axis tick labels
    function drawXAxisTickLabels() {
        var xRange = self.x_max - self.x_min;
        var xStep = xRange / self.layout.numXTickLabels;

        textAlign('center', 'center');
        for (let i = 0; i <= self.layout.numXTickLabels; i++) {
            let x = (self.x_min + (i * xStep)).toFixed(2);
            noStroke();
            text(x, map_X(x), self.layout.bottomMargin + self.layout.pad);

            if (self.layout.grid) {
                stroke(200);
                line(map_X(x), self.layout.topMargin, map_X(x), self.layout.bottomMargin);
            }
        }
    }

    // Draw the correlation heatmap
    // Input x and y corresponds to the coordinates of the top left of heatmap
    function correlationHeatmap(x, y) {
        var increment = 50;
        var variableNames = self.data.columns.slice(3);

        for (let i = 0; i < correlationData.length; i++) {
            var yOffset = (i * increment);

            // Variable names
            noStroke();
            textAlign('right', 'center');
            textSize(15);
            fill(50);
            text(variableNames[i], x, y + ((i + 0.5) * increment));

            // Tick lines
            stroke(0);
            line(x + 20, y + ((i + 0.5) * increment), x + 25, y + ((i + 0.5) * increment));

            for (let j = 0; j < correlationData[i].length; j++) {
                var corrColor;
                var corrIndex = correlationData[i][j]
                var xOffset = (j * increment);

                // Mapping coorelation index to color
                // Positive correlation is blue, negative correlation is red
                if (corrIndex >= 0) { // Positive correlation
                    var colorMap = map(corrIndex, 1, 0, 50, 255);
                    corrColor = color(colorMap, colorMap, 255);
                }
                else { // Negative correlation
                    var colorMap = map(corrIndex, -1, 0, 50, 255);
                    corrColor = color(255, colorMap, colorMap);
                }

                // One square of the heatmap, i are rows, j are columns
                noStroke();
                fill(corrColor);
                rect(x + 25 + xOffset, y + yOffset, increment, increment);

                // Correlation index of each square
                textAlign('center', 'center');
                fill(50);
                text(corrIndex, x + 25 + ((j + 0.5) * increment), y + ((i + 0.5) * increment));

                // Draw variable names for the columns when generating the last row
                if (i == correlationData.length - 1) {
                    textAlign('left', 'center');
                    stroke(0);
                    line(x + 25 + ((j + 0.5) * increment), y + ((i + 1) * increment), x + 25 + ((j + 0.5) * increment), y + ((i + 1) * increment) + 5);

                    // Rotate text so that they do not overlap
                    push();
                    translate(x + 25 + ((j + 0.5) * increment), y + ((i + 1.5) * increment))
                    rotate(PI / 4);
                    noStroke();
                    text(variableNames[j], 0, 0);
                    pop();

                }
            }
            // Heatmap legend
            correlationHeatmapLegend(650, 195);
        }
    }

    // Draws the legend for the heatamp
    function correlationHeatmapLegend(x, y) {
        var positiveColor = color(50, 50, 255);
        var neutralColor = color(255, 255, 255);
        var negativeColor = color(255, 50, 50);

        gradientRect(x, y, 10, 100, positiveColor, neutralColor);
        gradientRect(x, y + 100, 10, 100, neutralColor, negativeColor);

        stroke(0);
        for (let i = 0; i < 5; i++) {
            line(x + 10, y + (i * 50), x + 15, y + (i * 50));
        }

        noStroke();
        fill(50);
        textSize(12);
        textAlign('left', 'center');
        text('1.0', x + 20, y)
        text('0.5', x + 20, y + 50)
        text('0.0', x + 20, y + 100)
        text('-0.5', x + 20, y + 150)
        text('-1.0', x + 20, y + 200);
    }

    // Reference: https://p5js.org/examples/color-linear-gradient.html
    // Draws a rectangle with a gradient fill from color 1 to color 2, gradient is vertical
    // Input: x coordinate, y coordinate, width, height, color 1, color 2
    function gradientRect(x, y, w, h, c1, c2) {
        noFill();
        for (let i = y; i <= y + h; i++) {
            let inter = map(i, y, y + h, 0, 1);
            let c = lerpColor(c1, c2, inter);
            stroke(c);
            line(x, i, x + w, i);
        }
    }

    /////////////////////////////////////////////////////////////////////////////
    //////////////////// Data Query and Processing functions ////////////////////
    /////////////////////////////////////////////////////////////////////////////

    // Updates the correlation data array
    function generateCorrelationData() {
        var columns = self.data.columns;
        var index = 0;

        // Getting and storing the correlation index for every permutation of 2 variable arrays
        for (var i = 3; i < columns.length; i++) {
            var correlationArray = [];
            var iArray = plotData.getColumn(columns[i]).map(parseFloat);
            for (var j = 3; j < columns.length; j++) {
                var jArray = plotData.getColumn(columns[j]).map(parseFloat);
                correlationArray.push(parseFloat(get_correlation_index(iArray, jArray).toFixed(3)));
            }
            correlationData[index] = correlationArray;
            index++;
        }
    }

    // Query the data for the current year
    function getPlotData() {
        var yearlyRows = self.data.findRows(currentYear, 'Year');
        var yearlyData = new p5.Table();
        for (i = 0; i < yearlyRows.length; i++) {
            yearlyData.addRow(yearlyRows[i]);
        }
        return yearlyData;
    }


    // Generates an array of Dot objects based on the plot data
    function generateDotArray(comparingVariableName) {
        self.y_max = max(plotData.getColumn('Score'));
        self.x_max = max(plotData.getColumn(comparingVariableName));

        var dotArray = [];
        var dotColor = color(random(155), random(155), random(155));

        // Creating a Dot object for each country
        for (let i = 0; i < plotData.getRowCount(); i++) {
            var country = plotData.getString(i, 'Country or region');
            var happiness = plotData.getNum(i, 'Score');
            var comparingVariable = plotData.getNum(i, comparingVariableName);

            let dot = new Dot(country, map_X(comparingVariable), map_Y(happiness), comparingVariable, comparingVariableName, happiness, dotColor);
            dotArray.push(dot);
        }

        return dotArray;
    }

    //////////////////////////////////////////////////////////
    //////////////////// Helper functions //////////////////// 
    //////////////////////////////////////////////////////////

    // Maps the y value to the Y axis
    function map_Y(value) {
        return map(value, 0, self.y_max, self.layout.bottomMargin, self.layout.topMargin + self.layout.pad);
    }

    // maps the x value to the X axis
    function map_X(value) {
        return map(value, 0, self.x_max, self.layout.leftMargin, self.layout.rightMargin - self.layout.pad);
    }


    // Returns the correlation index between of two arrays
    // Uses the Pearson correlation coefficient formula
    function get_correlation_index(array1, array2) {
        var sum1 = 0;
        var sum2 = 0;
        var sum1sq = 0;
        var sum2sq = 0;
        var psum = 0;
        var len = array1.length;

        for (var i = 0; i < len; i++) {
            sum1 += array1[i];
            sum2 += array2[i];
            sum1sq += Math.pow(array1[i], 2);
            sum2sq += Math.pow(array2[i], 2);
            psum += array1[i] * array2[i];
        }

        var numerator = psum - (sum1 * sum2 / len);
        var denominator = Math.sqrt((sum1sq - Math.pow(sum1, 2) / len) * (sum2sq - Math.pow(sum2, 2) / len));

        if (denominator == 0) {
            return 0;
        }
        else {
            return numerator / denominator;
        }
    }
}

