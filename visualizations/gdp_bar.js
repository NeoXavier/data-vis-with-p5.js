function GDP(){
    this.name = "World GDP per Capita";

    this.id = 'gdp';

    this.loaded = false;

    // Public attributes
    this.countriesBarArr;
    this.barData;
    this.first_position;
    this.last_position;
    
    // Private attributes
    var years = [];
    var currentYear;
    var ranking_y_positions;

    this.preload = function(){
        var self = this;
        this.data = loadTable(
            'data/gdp/gdp_per_capita.csv', 'csv', 'header',
            function(table){
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

        // Number of axis tick labels to draw so that they are not drawn on
        // top of one another.
        numXTickLabels: 5,
        numYTickLabels: 8,
    };

    this.setup = function(){
        console.log("World GDP setup initiated");
        
        // Create year array
        for(var i = 2; i < this.data.getColumnCount()-1; i++){
            var y = Number(this.data.columns[i]);
            years.push(y);
        }

        // Create ui HTML div
        this.ui = createDiv().id('ui');
        this.ui.parent('app');
        
        // Year slider
        var yearDiv = createDiv().parent('ui');
        let firstYear = years[0];
        let lastYear = years[years.length-1]; 
        this.yearSlider = createSlider(firstYear, lastYear, firstYear, 1).parent(yearDiv);
        this.yearDisplay = createDiv().parent(yearDiv).html(this.yearSlider.value());
        currentYear = this.yearSlider.value();
        
        // Bar chart parameters (Showing top 10 countries, adjust accordingly);
        this.first_position = 1;
        this.last_position = 10;
        ranking_y_positions = get_ranking_y_pos(this.first_position, this.last_position, this.layout);

        this.data_year_query(currentYear,this.first_position, this.last_position);
    };

    this.destroy = function(){
        console.log("in destroy");
        this.ui.remove();
    };

    this.draw = function(){
        if(!this.loaded){
            console.log("Data not yet loaded");
            return;
        }

        // Update year if there is a change
        if(currentYear != this.yearSlider.value()){
            this.yearDisplay.html(this.yearSlider.value());
            this.data_year_query(this.yearSlider.value());
            currentYear = this.yearSlider.value();
        }
        
        // Bar chart elements
        drawAxis(this.layout);
        drawAxisLabels("GDP per Capita", "Ranking", this.layout);
        drawYAxisTickLables(ranking_y_positions, this.layout);

        for(var i = 0; i < this.countriesBarArr.length; i++){
            this.countriesBarArr[i].draw(this.barData, ranking_y_positions, this.layout);
        }
        stroke(0);
        line(this.layout.leftMargin+10, ranking_y_positions[1], this.layout.leftMargin+10, ranking_y_positions[1]+431);
        noLoop();
    };

    function drawYAxisTickLables(ranking_positions, layout){
        for(let i = ranking_positions['first']; i<= ranking_positions['last']; i++){
            text(i, layout.leftMargin - 20, ranking_positions[i]);
        }
    }
    
    // Maps the Y coordinates of the ranking lables
    // Input: First positon, Last Position, chart layout
    // Output: Object with ranking position as keys and y coordinates as values 
    function get_ranking_y_pos(first_pos, last_pos, layout){
        let ranking_positions = {};
        for(let i = first_pos; i <= last_pos; i++){
            ranking_positions[i] = map(i, first_pos, last_pos, layout.topMargin+20, layout.bottomMargin-20);
        }
        ranking_positions['first'] = first_pos;
        ranking_positions['last'] = last_pos;
        return ranking_positions;
    }

    // Gets the top 10 countries with the highest gdp for a given year
    // Updates the top10Data and countriesBarArr
    this.data_year_query = function(year, first_position, last_position){
        var countries = this.data.getColumn('Country Name');
        var gdp = this.data.getColumn(year.toString());
    
        // Create an array of pairs [country, gdp]
        var pairs = countries.map((name, index) => [name, gdp[index]]);
        // Sort the pairs by gdp (second element in each pair) in decending order
        pairs.sort((a, b) => b[1] - a[1]);

        // Get the data of the countries from the first to last positons
        var top = pairs.slice(first_position-1, last_position);
        this.barData = top;
        
        // Create a bar object for each of the top 10 countries and push it to an array
        var bars =[];
        for(let i = 0; i < top.length; i++){
            let bar = new Bar(top[i][0], top[i][1], i+1);
            bars.push(bar);
        }
        this.countriesBarArr = bars;
    }
}

function Bar(_name, _gdp, _position){
    this.name = _name;
    this.gdp = _gdp;
    this.position = _position;
    
    this.draw = function(countriesData, y_pos_ranking, layout){
        fill(0, 255, 255);
        let rectHeight = get_bar_height(y_pos_ranking);
        let rectWidth = map(this.gdp, countriesData[y_pos_ranking['last']-1][1]*0.9, countriesData[y_pos_ranking['first']-1][1]*1.1, 100, layout.rightMargin-layout.leftMargin-layout.pad);
        let x = layout.leftMargin+layout.pad;
        let y = y_pos_ranking[this.position] - rectHeight/2;
        rect(x, y, rectWidth, rectHeight);
        fill(0);
        textAlign(RIGHT, CENTER);
        text(this.name, x + rectWidth - 10, y + rectHeight/2);
        textAlign(LEFT, CENTER);
        text(round(this.gdp), x + rectWidth + 10, y + rectHeight/2);
    }

    function get_bar_height(y_pos_ranking){
        var barHeight;
        var spacing = (y_pos_ranking[y_pos_ranking['last']] - y_pos_ranking[y_pos_ranking['first']]) / (y_pos_ranking['last']-1)

        if(spacing < 25){
            var gap = 2.5;
            barHeight = spacing - gap;
        }
        else if(spacing > 40){
            barHeight = 30;
        }
        else{
            barHeight = 25;
        }
        return barHeight;
    }
    
    // Checks if the mouse is hovering over the bar
    // Input: x and y coordinates of the Bar object and the width and height of the bar
    function checkMouseHover(x, y, width, height){
        if(mouseX > x && mouseX < x + width && mouseY > y && mouseY < y + height){
            return true;
        }
    }
}
