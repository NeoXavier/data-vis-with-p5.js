function GDP(){
    this.name = "World GDP per Capita";

    this.id = 'gdp';

    this.loaded = false;

    var bubbles = [];
    var maxAmt;
    var years = [];
    var yearButtons = [];

    this.preload = function(){
        var self = this;
        this.data = loadTable(
            'data/gdp/gdp_per_capita.csv', 'csv', 'header',
            function(table){
                self.loaded = true;
            });
    }

    this.setup = function(){
        console.log("in set up");
       this.data_setup();
    };

    this.destroy = function(){
        console.log("in destroy");
        select("#years").html("");
    };

    this.draw = function(){
        if(!this.loaded){
            console.log("Data not yet loaded");
            return;
        }
        translate(width/2, height/2);
        for(var i = 0; i<bubbles.length; i++){
            bubbles[i].update(bubbles);
            bubbles[i].draw();
        }
    };
    
    this.data_setup = function(){

        bubbles = [];
        maxAmt;
        years = [];
        yearButtons = [];
        
        var rows = this.data.getRows();
        var numColumns = this.data.getColumnCount();
        
        for(var i = 2; i < numColumns-1; i++){
            var y = this.data.columns[i];
            years.push(y);
            b = createButton(y,y);
            b.parent('years');
            b.mousePressed(function(){
                changeYear(this.elt.value, years, bubbles);
            })
            yearButtons.push(b);
        }

        maxAmt = 0;
        for(var i = 0; i < rows.length; i++){
            var b = new Bubble(rows[i].get(0));

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
