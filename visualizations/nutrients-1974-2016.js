function NutrientsTimeSeries() {
    this.name = "Nutrients: 1974-2016";

    this.id = 'nutrients-timeseries';

    this.title = 'Nutrients: 1974-2016.';

    // Axis names
    this.xAxisLabel = 'Year';
    this.yAxisLabel = '%';

    this.colors = [];

    var marginSize = 35;

    this.layout = {
        marginSize: marginSize,

        //Margin positions. Left and bottom have double margin size due to 
        //axis and tick labels.
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

        // Enable or disable background grid
        grid: true,

        // Number of axis tick labels to draw so that they are not drawn on top of one another
        numXTickLabels: 10,
        numYTickLabels: 8,
    };

    this.drawTitle = function() {
        fill(0);
        noStroke();
        textAlign('center', 'center');
        text(this.title,
            (this.layout.plotWidth() / 2) + this.layout.leftMargin,
            this.layout.topMargin - (this.layout.marginSize / 2));
    };

    this.mapYearToWidth = function(value) {
        return map(value,
            this.startYear,
            this.endYear,
            this.layout.leftMargin,
            this.layout.rightMargin);
    };

    this.mapNutrientsToHeight = function(value) {
        return map(value,
            this.minPercentage,
            this.maxPercentage,
            this.layout.bottomMargin,
            this.layout.topMargin
        );
    }


    this.loaded = false;

    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/food/nutrients-1974-2016.csv', 'csv', 'header',
            function(table) {
                self.loaded = true;
            });
    };

    this.setup = function() {
        // Font defaults.
        textSize(16);

        // Set min and max years: assumes data is sorted by date.
        this.startYear = Number(this.data.columns[1]);
        this.endYear = Number(this.data.columns[this.data.columns.length - 1])

        for (var i = 0; i < this.data.getRowCount(); i++) {
            this.colors.push(color(random(255), random(255), random(255)));
        }

        // Set the min and max percetage,
        // do a dynamic find min and max inthe data source
        this.minPercentage = 80;
        this.maxPercentage = 400;
    };

    this.destroy = function() {
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        // Draw the title above the plot.
        this.drawTitle();

        // Draw all y-axis labels.
        drawYAxisTickLabels(this.minPercentage,
            this.maxPercentage,
            this.layout,
            this.mapNutrientsToHeight.bind(this),
            0);

        drawAxis(this.layout);

        drawAxisLabels(this.xAxisLabel,
            this.yAxisLabel,
            this.layout);

        var numYears = this.endYear - this.startYear;

        for (var i = 0; i < this.data.getRowCount(); i++) {
            var row = this.data.getRow(i);
            var previous = null;

            var title = row.getString(0);

            for (var j = 1; j < numYears; j++) {
                // Create an object to store data for the current year pay gap.
                var current = {
                    // Convert strings to numbers.
                    'year': this.startYear + j - 1,
                    'percentage': row.getNum(j)
                };

                if (previous != null) {
                    // Draw line segment connecting previous year to current year pay gap.
                    stroke(this.colors[i]);
                    line(this.mapYearToWidth(previous.year),
                        this.mapNutrientsToHeight(previous.percentage),
                        this.mapYearToWidth(current.year),
                        this.mapNutrientsToHeight(current.percentage));

                    // The number of x-axis labels to skip so that only numXTickLabels are drawn
                    var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);

                    // Draw the tick label marking the start of the previous year.
                    if (i % xLabelSkip == 0) {
                        drawXAxisTickLabel(previous.year, this.layout,
                            this.mapYearToWidth.bind(this));
                    }
                }
                else {
                    //draw the nutrients label
                    noStroke();
                    fill(this.colors[i]);
                    text(title, 100, this.mapNutrientsToHeight(current.percentage));
                }

                //Assign current year to previous year so that it is available 
                //during the next iteration of this loop to give us the start 
                //position of the next line segment.

                previous = current;
            }
        };
    };
}
