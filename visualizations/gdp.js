function bubble_GDP(){
    this.name = "World GDP per Capita";

    this.id = 'gdp';

    this.loaded = false;

    var bubbles = [];
    var maxAmt;
    var years = [];
    var currentYear;

    this.preload = function(){
        var self = this;
        this.data = loadTable(
            'data/gdp/gdp_per_capita.csv', 'csv', 'header',
            function(table){
                self.loaded = true;
            });
    }

    this.setup = function(){
        console.log("World GDP setup initiated");
        
        this.data_setup();

        this.ui = createDiv().id('ui');
        this.ui.parent('app');
        
        var yearDiv = createDiv().parent('ui');
        let firstYear = years[0];
        let lastYear = years[years.length-1]; 
        this.yearSlider = createSlider(firstYear, lastYear, firstYear, 1).parent(yearDiv);
        this.yearDisplay = createDiv().parent(yearDiv).html(this.yearSlider.value());
        console.log(firstYear);
        
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
            changeYear(this.yearSlider.value(), years, bubbles);
            currentYear = this.yearSlider.value();
        }
        
            

        translate(width/2, height/2);
        for(var i = 0; i<bubbles.length; i++){
            bubbles[i].update(bubbles);
            bubbles[i].draw();
        }
    };
    
    this.data_setup = function(){

        var rows = this.data.getRows();
        var numColumns = this.data.getColumnCount();
        
        // Create year array
        for(var i = 2; i < numColumns-1; i++){
            var y = Number(this.data.columns[i]);
            years.push(y);
        }

        maxAmt = 0;
        //Iterates through each country and creates a bubble obj
        for(var i = 0; i < rows.length; i++){
            var b = new Bubble(rows[i].get(0));

            // Iterates through each year and adds the data to the bubble
            for(var j = 2; j < numColumns-1; j++){
                if(rows[i].get(j) != ""){
                    var n = rows[i].getNum(j);
                    if(n > maxAmt){
                        maxAmt = n;
                    }
                    b.data.push(n);
                }else{
                    b.data.push(0);
                }
            }
            bubbles.push(b);
        }
        
        for(var i = 0; i < bubbles.length; i++){
            bubbles[i].setMaxAmt(maxAmt);
            bubbles[i].setData(0);
        }
    };

    function changeYear(year,_years, _bubbles){
        var y = _years.indexOf(year);
        for(var i = 0; i < _bubbles.length; i++){
            _bubbles[i].setData(y);
        }
    };
}
