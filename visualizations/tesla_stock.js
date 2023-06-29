// TODO
// Add date selector

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

        let yearRange = this.getYearRange();
        this.select = createSelect();
        this.select.position(350, 30);
        for(let i = 0; i < yearRange.length; i++) {
            this.select.option(yearRange[i]);
        }

        this.startMonthSlider = createSlider(1, 12, 01, 1);
        this.startMonthSlider.position(400, 10);
        this.endMonthSlider = createSlider(1, 12, 12, 1);
        this.endMonthSlider.position(600, 10);

        this.startDaySlider = createSlider(1, 31, 1, 1);
        this.startDaySlider.position(400, 30);
        this.endDaySlider = createSlider(1, 31, 31, 1);
        this.endDaySlider.position(600, 30);

        this.generatePlotData(startDate, endDate);

        this.minPrice = min(this.plotData.getColumn('Low')) - 1;
        this.maxPrice = max(this.plotData.getColumn('High'));

        this.minYear = this.plotData.getString(0, 'Date').split('-')[0];
        this.maxYear = this.plotData.getString(this.plotData.getRowCount() - 1, 'Date').split('-')[0];
    };

    this.getYearRange = function() {
        var years = [];
        for (let i = 0; i < this.data.getRowCount(); i++) {
            let current_year = this.data.getString(i, 'Date').split('-')[0];
            if (!years.includes(current_year)) {
                years.push(current_year);
            }
        }
        return years;
    }

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
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        this.drawTitle();
        drawAxis(this.layout);
        drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);
        drawYAxisTickLabels(this.minPrice, this.maxPrice, this.layout, this.mapPriceToHeight.bind(this), 2);

        // Check mouse above which data point, Returns the cooresponding data point
        var mouseDataPoint = this.checkMouse(mouseX, mouseY);

        var rectWidth = floor(this.layout.plotWidth() / this.numDataPoints);
        if (rectWidth > 10) {
            rectWidth = 10;
        }

        for (var i = 0; i < this.plotData.getRowCount(); i++) {

            let open = round(this.plotData.getNum(i, 'Open'), 2);
            let close = round(this.plotData.getNum(i, 'Close'), 2);
            let low = round(this.plotData.getNum(i, 'Low'), 2);
            let high = round(this.plotData.getNum(i, 'High'), 2);

            if (i % ceil(this.numDataPoints / this.layout.numXTickLabels) == 0 || i == this.plotData.getRowCount() - 1) {
                this.drawDateAxisLabel(i, this.plotData.getString(i, 'Date'));
            };

            if (mouseDataPoint == i) {
                stroke(155);
                line(this.mapDataPointToWidth(mouseDataPoint), this.layout.topMargin, this.mapDataPointToWidth(mouseDataPoint), this.layout.bottomMargin);
            }

            this.drawCandleStick(i, open, close, low, high, rectWidth);
        }
        if (mouseDataPoint != null) {
            this.drawStockValues(mouseDataPoint);
        }
    };

    this.drawCandleStick = function(dataPoint, open, close, low, high, rectWidth) {
        stroke(0);
        line(this.mapDataPointToWidth(dataPoint), this.mapPriceToHeight(low), this.mapDataPointToWidth(dataPoint), this.mapPriceToHeight(high));
        noStroke();
        push();
        rectMode(CENTER);
        if (close > open) {
            fill(152, 221, 50);
            let rectHeight = this.mapPriceToHeight(close) - this.mapPriceToHeight(open);
            rect(this.mapDataPointToWidth(dataPoint), this.mapPriceToHeight(close) - rectHeight / 2, rectWidth, rectHeight);
        }
        else {
            fill(237, 70, 75);
            let rectHeight = this.mapPriceToHeight(open) - this.mapPriceToHeight(close);
            rect(this.mapDataPointToWidth(dataPoint), this.mapPriceToHeight(open) - rectHeight / 2, rectWidth, rectHeight);
        }
        pop();
    }

    this.drawStockValues = function(dataPoint) {

        let date = this.plotData.getString(dataPoint, 'Date');
        let open = round(this.plotData.getNum(dataPoint, 'Open'), 2);
        let close = round(this.plotData.getNum(dataPoint, 'Close'), 2);
        let low = round(this.plotData.getNum(dataPoint, 'Low'), 2);
        let high = round(this.plotData.getNum(dataPoint, 'High'), 2);
        let volume = round(this.plotData.getNum(dataPoint, 'Volume'), 2);

        pointerX = this.mapDataPointToWidth(dataPoint);
        pointerY = abs(this.mapPriceToHeight(open) + this.mapPriceToHeight(close)) / 2;
        noStroke();
        textSize(10);
        textAlign('left', 'top');

        fill(200);
        stroke(200);
        line(pointerX, pointerY, pointerX + 10, pointerY - 5);

        rectMode(CORNER);
        rect(pointerX + 10, pointerY - 5, 100, 95);

        fill(0);
        ellipse(pointerX, pointerY, 5, 5);

        fill(0);
        text('Date: ' + date, pointerX + 15, pointerY);
        text('Opening Price: $' + open, pointerX + 15, pointerY + 15);
        text('Closing Price: $' + close, pointerX + 15, pointerY + 30);
        text('Lowest Price: $' + low, pointerX + 15, pointerY + 45);
        text('Highest Price: $' + high, pointerX + 15, pointerY + 60);
        text('Volume: ' + volume, pointerX + 15, pointerY + 75);

    }

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

    this.mapXtoDataPoint = function(x) {
        return round(map(x, this.layout.leftMargin + 10, this.layout.rightMargin - 10, 0, this.numDataPoints - 1));
    }
    this.drawDateAxisLabel = function(value, label) {
        // Map function must be passed with .bind(this).
        var x = this.mapDataPointToWidth(value);

        fill(0);
        noStroke();
        textAlign('center', 'center');
        textSize(15);

        // Add tick label.
        text(label,
            x,
            this.layout.bottomMargin + this.layout.marginSize / 2);

        // Add tick mark
        stroke(0);
        line(x, this.layout.bottomMargin, x, this.layout.bottomMargin + 5);
    }


    this.checkMouse = function(mouseX, mouseY) {
        var withinPlotX = mouseX > this.layout.leftMargin + 10 && mouseX < this.layout.rightMargin - 10;
        var withinPlotY = mouseY > this.layout.topMargin + 10 && mouseY < this.layout.bottomMargin - 10;
        if (withinPlotX && withinPlotY) {
            return this.mapXtoDataPoint(mouseX);
        }
        else {
            return null;
        }
    }

    this.destroy = function() {
    };

}
