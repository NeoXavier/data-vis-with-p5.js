function Bubble(_name)
{
    this.size = 20;
    this.target_size = 20;
    this.pos = createVector(0,0);
    this.direction = createVector(0,0);
    this.name = _name;
    this.maxAmt = 0;
    this.color = color(random(0,255), random(0,255), random(0,255));
    this.data = [];
    
    this.draw = function()
    {
        push();
        textAlign(CENTER);
        noStroke();
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.size);
        fill(0);
        text(this.name,this.pos.x,this.pos.y);
        pop();
    }
    
    this.update = function(_bubbles)
    {
        this.direction.set(0,0);
        
        // Iterate over all bubbles
        for(var i = 0; i < _bubbles.length; i++)
        {
            // If bubble is not the current bubble
            if(_bubbles[i].name != this.name)
            {
                // Distance between bubles
                var v = p5.Vector.sub(this.pos,_bubbles[i].pos); 
                var d = v.mag();

                // If bubbles overlap
                if(d < this.size/2 + _bubbles[i].size/2)
                {
                    if(d > 0)
                    {
                        this.direction.add(v)
                    }
                    // Initial case of d = 0
                    else
                    {
                        this.direction.add(p5.Vector.random2D()); 
                         
                    }
                }
            }
        }
        
        this.direction.normalize();
        this.direction.mult(2);
        this.pos.add(this.direction);
       
        //Incrementally change the size of the bubble
        if(this.size < this.target_size)
        {
            this.size += 1;
        }
        else if(this.size > this.target_size)
        {
            this.size -= 1;
        }
       
    }
    
    this.setData = function(i)
    {
        this.target_size = map(this.data[i], 0, this.maxAmt, 20, 250);
    }
    
    this.setMaxAmt = function(_maxAmt){
        this.maxAmt = _maxAmt;
    }
}
