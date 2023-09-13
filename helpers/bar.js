// min and max values of the overall dataset
function Bar(_name, _value, _position, min, max, layout, y_positions) {
    this.name = _name;
    this.value = _value;
    this.position = _position;
    //this.color = get_color();
    this.color = color(random(0, 200), random(155, 255), random(155, 255));
    //this.color = color(random(0, 255), random(0, 255), random(0, 255));

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
        text(round(this.value), x + currentBarWidth + 10, currentY + barHeight / 2);
    }

    this.update = function() {
        if (currentBarWidth == 0) {
            currentBarWidth = round(map(this.value, min * 0.9, max * 1.1, 100, plotWidth - layout.pad));
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

    this.changeBarParams = function(ranking, value, new_min, new_max, y_positions, layout) {
        this.position = ranking;
        this.value = value;
        targetBarWidth = round(map(this.value, new_min * 0.9, new_max * 1.1, 100, plotWidth - layout.pad));
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

    // Checks if the mouse is hovering over the bar
    // Input: x and y coordinates of the Bar object and the width and height of the bar
    function checkMouseHover(x, y, width, height) {
        if (mouseX > x && mouseX < x + width && mouseY > y && mouseY < y + height) {
            return true;
        }
    }
}
