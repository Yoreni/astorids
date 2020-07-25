function Button(writing,effect,colour = 0x666666)
{
    PIXI.Container.call(this);
    
    this.writing = writing
    this.effect = effect
    this.colour = colour
    
    let background = new Graphics()
    background.lineStyle(4,0x111111,1)
    background.beginFill(colour)
    background.drawRoundedRect(0,0,200,50,10)
    background.endFill()
    this.addChild(background)
    
    let text = new PIXI.Text("Play Again!",{fontSize: 36,fontWeight: "bold",fontFamily: "Calibri"})
    text.position.set(0,0)
    this.addChild(text)
    
    this.interactive = true;
    var filter = new PIXI.filters.ColorMatrixFilter();
    this.filters = [filter]
    
    this.on("pointerover",function() 
    {
        filter.brightness(1.3,false)
    });
    this.on("pointerout",function() 
    {
        filter.brightness(1,false)
    });
    
    this.on("mousedown",function() 
    {
        filter.brightness(0.8,false)
    });
                    
    this.on("mouseup",function() 
    {
        filter.brightness(1,false)
        this.effect()
    })
    
    background.pivot.set(this.width / 2,this.height / 2)
    text.anchor.set(0.5,0.5)
    console.log(this.effect)
}
Button.prototype = Object.create(PIXI.Container.prototype);