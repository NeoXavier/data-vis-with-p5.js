// Suggested enchancements:
// Legend
// Data filter

function WaffleChart() {
    this.name = "Waffle Chart";

    this.id = "waffle-chart";

    this.loaded = false;

    this.layout = {
        startX: 20,
        startY:20,
        waffleWidth: 200,
        waffleHeight: 200,
        waffleWidthPadding: 20,
        waffleHeightPadding: 60,
        secondRowPadding: 100
    }

    this.waffles = [];

    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/waffle/finalData.csv', 'csv', 'header',
            function(table) {
                self.loaded = true;
            });

    }

    this.setup = function() {
        var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

        var values = ['Take-away', 'Cooked from fresh', 'Ready meal', 'Ate out', 'Skipped meal', 'Left overs'];

        var l = this.layout;

        for (var i = 0; i < days.length; i++) {
            if (i < 4) {
                var w_x = l.startX + (i*(l.waffleWidth+ l.waffleWidthPadding));
                var w_y = l.startY;
                var w_width = l.waffleWidth;
                var w_height = l.waffleHeight;

                var w = new Waffle(w_x, w_y, w_width, w_height, 8, 8, this.data, days[i], values);
                this.waffles.push(w);
            }
            else {
                var w_x = l.startX + l.secondRowPadding;
                w_x += ((i - 4) * (l.waffleWidth + l.waffleWidthPadding));
                var w_y = l.startY + l.waffleHeight + l.waffleHeightPadding;
                var w_width = l.waffleWidth;
                var w_height = l.waffleHeight;

                var w = new Waffle(w_x, w_y, w_width, w_height, 8, 8, this.data, days[i], values);
                this.waffles.push(w);
            }
        }

    };

    this.destroy = function() { };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }
        background(255);
        for (var i = 0; i < this.waffles.length; i++) {
            var w = this.waffles[i];
            w.draw();
        }
        for (var i = 0; i < this.waffles.length; i++) {
            var w = this.waffles[i];
            w.checkMouse(mouseX, mouseY);
        }
    };
}
