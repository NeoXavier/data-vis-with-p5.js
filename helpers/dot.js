function Dot(name, x, y, xValue, xName, yValue, dotColor) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.xValue = xValue;
    this.xName = xName;
    this.yValue = yValue;
    this.dotColor = dotColor;


    this.draw = function() {
        noStroke()
        fill(this.dotColor);
        ellipse(x, y, 5, 5);
    }

    this.isMouseOver = function() {
        if (dist(mouseX, mouseY, this.x, this.y) <= 5) {
            return true;
        }
    }

    this.showDotInfo = function() {

        var nameText = this.name;
        var yVarText = `Happiness Score: ${this.yValue}`;
        var xVarText = `${this.xName}: ${this.xValue}`;

        textSize(12);
        textAlign('left', 'top');
        var maxTextWidth = round(max(textWidth(nameText), textWidth(yVarText), textWidth(xVarText)));


        fill(200);
        if (this.x + maxTextWidth + 10 > width) {
            var shiftedX = this.x - maxTextWidth - 10;
            rect(shiftedX, this.y + 5, maxTextWidth + 10, 50, 5);
            fill(0);
            text(nameText, shiftedX + 5, this.y + 10);
            text(yVarText, shiftedX + 5, this.y + 25);
            text(xVarText, shiftedX + 5, this.y + 40);
        }
        else {
            rect(this.x + 5, this.y + 5, maxTextWidth + 10, 50, 5);
            fill(0);
            text(nameText, this.x + 10, this.y + 10);
            text(yVarText, this.x + 10, this.y + 25);
            text(xVarText, this.x + 10, this.y + 40);
        }
    }

}
