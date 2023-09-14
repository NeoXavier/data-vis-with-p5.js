/*
Description: Bar class for each individual bar in the bar chart
Inputs: 
    - Name of the bars
    - Value of the bars
    - Position of the bar respective to other bars(eg. 1st, 2nd, 3rd, etc.)
    - Minimum value of the bars (i.e. lowest value out of all the bars)
    - Maximum value of the bars (i.e. highest value out of all the bars)
    - Layout of the chart
    - Y positions of all the bars
*/
function Bar(_name, _value, _position, min, max, layout, y_positions) {
    // Public variables
    this.name = _name;
    this.value = _value;
    this.position = _position;
    this.color = color(random(0, 200), random(155, 255), random(155, 255));
    this.layout = layout;

    // Private variables
    var min = min;
    var max = max;
    var y_positions = y_positions;

    var plotWidth = this.layout.plotWidth();
    var barHeight = get_bar_height(y_positions);
    var targetBarWidth;
    var currentBarWidth = 0;
    var widthChangeDirection = 1;
    var targetY;
    var currentY = 0;
    var yChangeDirection = 1;

    // Draw the bar
    this.draw = function() {
        let x = this.layout.leftMargin + this.layout.pad;
        fill(this.color);
        rect(x, currentY, currentBarWidth, barHeight);
        fill(50);
        textAlign(RIGHT, CENTER);
        text(this.name, x + currentBarWidth - 10, currentY + barHeight / 2);
        textAlign(LEFT, CENTER);
        text(round(this.value), x + currentBarWidth + 10, currentY + barHeight / 2);
    }

    // Update Y position and width of the bar incrementally to create a smooth transition
    this.update = function() {
        // If the bar is not yet drawn, set the current width and y position to the target width and y position
        if (currentBarWidth == 0) {
            currentBarWidth = round(map(this.value, min * 0.9, max * 1.1, 100, plotWidth - this.layout.pad));
            targetBarWidth = currentBarWidth;
        }
        if (currentY == 0) {
            currentY = y_positions[this.position] - barHeight / 2;
            targetY = currentY;
        }

        // If the bar width or y position is not yet at the target, incrementally change the width and y position
        if (currentBarWidth != targetBarWidth) {
            currentBarWidth += 5 * widthChangeDirection;
            // "Snap" the bar width to the target width if the difference between the current width and target width is less than 5
            if (abs(currentBarWidth - targetBarWidth) < 5) {
                currentBarWidth = targetBarWidth;
            }
        }
        if (currentY != targetY) {
            currentY += 2 * yChangeDirection;
            // "Snap" the y position to the target y position if the difference between the current y position and target y position is less than 5
            if (abs(currentY - targetY) < 5) {
                currentY = targetY;
            }
        }
    }

    // Function to change parameters of the bar
    // Inputs: New ranking of bar, new value, new min and max values of the overall data, new y positions of the bars
    this.changeBarParams = function(ranking, value, new_min, new_max, new_y_positions) {
        this.position = ranking;
        this.value = value;
        y_positions = new_y_positions;

        // Changing bar width
        targetBarWidth = round(map(this.value, new_min * 0.9, new_max * 1.1, 100, plotWidth - this.layout.pad));
        // If the new bar width is greater than the current bar width
        if (targetBarWidth >= currentBarWidth) {
            widthChangeDirection = 1;
        }
        // If the new bar width is less than the current bar width
        else {
            widthChangeDirection = -1;
        }

        //Changing bar Y position
        targetY = y_positions[this.position] - barHeight / 2;
        // If the new Y position is greater than the current Y position
        if (targetY >= currentY) {
            yChangeDirection = 1;
        }
        // If the new Y position is less than the current Y position
        else {
            yChangeDirection = -1;
        }
    }

    // Generate the bar height based on the number of bars and the plot height
    function get_bar_height() {
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
}
