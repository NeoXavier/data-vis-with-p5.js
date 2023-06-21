function Waffle(x,y,width,height,boxes_across, boxes_down, table, columnHeading, possibleValues){

    var x = x;
    var y = y;
    var height = height;
    var width = width;
    var boxes_down = boxes_down;
    var boxes_across = boxes_across;

    var column = table.getColumn(columnHeading);
    var possibleValues = possibleValues;

    var colours = ["red","green","blue","purple","yellow","orange"];

    var categories = [];
    var boxes = [];

    function categoryLocation(categoryName){
        for(var i=0;i<categories.length;i++){
            if(categoryName==categories[i].name){
                return i;
            }
        }
        return -1;
    }

    function addCategories(){
        for(var i=0;i<possibleValues.length;i++){
            categories.push({
                "name":possibleValues[i],
                "count":0,
                "colour":colours[i%colours.length]
            })
        }

        for(var i=0;i<column.length;i++){
            var catLocation = categoryLocation(column[i]);

            if(catLocation!=-1){
                categories[catLocation].count++;
            }
        }

        for(var i=0;i<categories.length;i++){
            categories[i].boxes = round((categories[i].count/column.length) * (boxes_down * boxes_across));
        }
    }

    function addBoxes(){
        var currentCategory = 0;
        var currentCategoryBox = 0;

        var boxWidth = width/boxes_across;
        var boxHeight = height/boxes_down;
        for(var i=0;i<boxes_down;i++){
            boxes.push([]);
            for(var j=0;j<boxes_across;j++){
                if(currentCategoryBox == categories[currentCategory].boxes){
                    currentCategoryBox=0;
                    currentCategory++;
                }
                boxes[i].push(new Box(x+(j*boxWidth),y+(i * boxHeight),boxWidth,boxHeight,categories[currentCategory]));
                currentCategoryBox++;
            }
        }
    }

    addCategories();
    addBoxes();

    this.draw = function(){
        //draw waffle diagram 
        fill(0);
        textSize(20);
        textAlign(LEFT, BOTTOM);
        text(columnHeading,x,y);
        for(var i=0;i<boxes.length;i++){
            for(var j=0;j<boxes[i].length;j++){

                if(boxes[i][j].category != undefined){
                    boxes[i][j].draw();
                }
            }
        }    

    }

    this.checkMouse = function(mouseX,mouseY){
        for(var i=0;i<boxes.length;i++){
            for(var j=0;j<boxes[i].length;j++){

                if(boxes[i][j].category!=undefined){
                    var mouseOver = boxes[i][j].mouseOver(mouseX, mouseY);
                    if(mouseOver!=false){
                        push();
                        fill(0);
                        textSize(20);
                        var tWidth = textWidth(mouseOver);
                        textAlign(LEFT,TOP);
                        rect(mouseX, mouseY, tWidth+20,40);
                        fill(255);
                        text(mouseOver, mouseX + 10, mouseY+10);
                        break;
                    }
                }
            }

        }
    }
}
