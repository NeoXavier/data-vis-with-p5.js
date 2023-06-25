function TeslaStock() {
    this.name = "Tesla Stock";

    this.id = "tesla_stock";

    this.title = "Tesla Stock Analysis";

    this.loaded = false;

    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/tesla/TSLA.csv', 'csv', 'header',
            function(table) {
                self.loaded = true;
            });
    }

    var marginSize = 35;
    // Layout object to store all common plot layout parameters and
    // methods.
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

        // Number of axis tick labels to draw so that they are not drawn on
        // top of one another.
        numXTickLabels: 5,
        numYTickLabels: 8,
    };

    this.setup = function() {
        var startDate = '2019-06-01';
        var endDate = '2019-12-31';

        this.generatePlotData(startDate, endDate);
        console.log(this.plotData.getString(0, 'Date'));
        console.log(this.plotData.getString(this.plotData.getRowCount()-1, 'Date'));

        this.minPrice = min(this.plotData.getColumn('Low')) - 1;
        this.maxPrice = max(this.plotData.getColumn('High'));
    };

    this.numDataPoints = 0;

    // Start and end date of data
    this.generatePlotData = function(startDate, endDate) {
        this.plotData = new p5.Table();

        // Date array format: [year, month, day]
        startDateArray = startDate.split('-');
        endDateArray = endDate.split('-');

        for (let i = 0; i < this.data.getRowCount(); i++) {
            var date = this.data.getString(i, 'Date');
            var dateArray = date.split('-');
            if (dateArray[0] < startDateArray[0]) {
                continue;
            }
            if (dateArray[0] > endDateArray[0]) {
                break;
            }
            if (dateArray[0] >= startDateArray[0] && dateArray[0] <= endDateArray[0]) {
                if (dateArray[0] == startDateArray[0] || dateArray[0] == endDateArray[0]) {
                    if (dateArray[1] < startDateArray[1]) {
                        continue;
                    }
                    if (dateArray[1] > endDateArray[1]) {
                        break;
                    }
                    if (dateArray[1] >= startDateArray[1] && dateArray[1] <= endDateArray[1]) {
                        if (dateArray[1] == startDateArray[1] || dateArray[1] == endDateArray[1]) {
                            if (dateArray[2] < startDateArray[2]) {
                                continue;
                            }
                            if (dateArray[2] > endDateArray[2]) {
                                break;
                            }
                            if (dateArray[2] >= startDateArray[2] && dateArray[2] <= endDateArray[2]) {
                                this.plotData.addRow(this.data.getRow(i));
                                continue;
                            }
                        }
                        else {
                            this.plotData.addRow(this.data.getRow(i));
                            continue;
                        }
                    }
                    else {
                        break;
                    }
                }
                else {
                    this.plotData.addRow(this.data.getRow(i));
                    continue;
                }
            }
        }
        this.numDataPoints = this.plotData.getRowCount();
    }

    // Names for each axis.
    this.xAxisLabel = 'Date';
    this.yAxisLabel = 'Price';

    this.draw = function() {
        this.drawTitle();
        drawAxis(this.layout);
        drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);
        drawYAxisTickLabels(this.minPrice, this.maxPrice, this.layout, this.mapPriceToHeight.bind(this), 2);

        rectMode(CENTER);
        var rectWidth = floor(this.layout.plotWidth() / this.numDataPoints);
        if(rectWidth > 10) {
            rectWidth = 10;
        }
        for (var i = 0; i < this.plotData.getRowCount(); i++) {

            if (i % ceil(this.numDataPoints / this.layout.numXTickLabels) == 0 || i == this.plotData.getRowCount() - 1) {
                this.drawDateAxisLabel(i, this.plotData.getString(i, 'Date'));
            };
            stroke(0);
            line(this.mapDataPointToWidth(i), this.mapPriceToHeight(this.plotData.getNum(i, 'Low')), this.mapDataPointToWidth(i), this.mapPriceToHeight(this.plotData.getNum(i, 'High')));
            noStroke();
            if (this.plotData.getNum(i, 'Close') > this.plotData.getNum(i, 'Open')) {
                fill(152, 221, 50);
                rect(this.mapDataPointToWidth(i), this.mapPriceToHeight(this.plotData.getNum(i, 'Open')), rectWidth, this.mapPriceToHeight(this.plotData.getNum(i, 'Close')) - this.mapPriceToHeight(this.plotData.getNum(i, 'Open')));
            }
            else {
                fill(237, 70, 75);
                rect(this.mapDataPointToWidth(i), this.mapPriceToHeight(this.plotData.getNum(i, 'Open')), rectWidth, this.mapPriceToHeight(this.plotData.getNum(i, 'Open')) - this.mapPriceToHeight(this.plotData.getNum(i, 'Close')));
            }


        }
        noLoop();

    };

    this.drawTitle = function() {
        fill(0);
        noStroke();
        textSize(20);
        textAlign('center', 'center');

        text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin, this.layout.topMargin / 2);
    };

    this.mapPriceToHeight = function(price) {
        return map(price, this.minPrice, this.maxPrice, this.layout.bottomMargin - 10, this.layout.topMargin + 10);
    }

    this.mapDataPointToWidth = function(i) {
        return map(i, 0, this.numDataPoints - 1, this.layout.leftMargin + 10, this.layout.rightMargin - 10);
    }
    this.drawDateAxisLabel = function(value, label) {
        // Map function must be passed with .bind(this).
        var x = this.mapDataPointToWidth(value);

        fill(0);
        noStroke();
        textAlign('center', 'center');

        // Add tick label.
        text(label,
            x,
            this.layout.bottomMargin + this.layout.marginSize / 2);

        // Add tick mark
        stroke(0);
        line(x, this.layout.bottomMargin, x, this.layout.bottomMargin + 5);

        //push();
        //translate(x, this.layout.bottomMargin + this.layout.marginSize / 2);
        //rotate(PI/3);
        //text(label, 0, 0);
        //pop();
    }


    this.checkMouse = function(mouseX, mouseY) {
    }

    this.destroy = function() {
    };

}
