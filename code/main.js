//the codes layout and a little bit of the actual code is from kittykatattacks learning pixi.js tutorial i also used pixi.js and collections.js

//alise
let Resources = PIXI.Loader.shared.resources
let Loader = PIXI.Loader.shared
let TextureCache = PIXI.utils.TextureCache
let Sprite = PIXI.Sprite
let Container = PIXI.Container
let Graphics = PIXI.Graphics

//varibles that will be used all over
let gameScene,ship,bullets,astorids,scoreText,endScoreText,playAgain,warpedShip
var inputs = {};

//player varibles
let player =
{
    score: 0,
    difficulty: 0,
    shipY: 512,
    shipX: 512,
    lastShot: 0,
}

let app = new PIXI.Application({width: 1024, height: 1024});
document.body.appendChild(app.view);
var state = null;

Loader.add("images/player.png").add("images/bullet.png").add("images/astroid.png").add("images/PlayAgain.png").add("images/background.png").load(setup);

function setup()
{
    gameScene = new Container()
    app.stage.addChild(gameScene)
    
    endScene = new Container()
    endScene.visible = false
    app.stage.addChild(endScene)
    
    let background = new Sprite(Resources["images/background.png"].texture)
    background.anchor.set(0.5,0.5)
    background.position.set(512,512)
    gameScene.addChild(background)
    
    ship = new Sprite(Resources["images/player.png"].texture)
    ship.position.set(512,512);
    ship.vx = 0
    ship.vy = 0
    ship.anchor.set(0.5,0.5)
    gameScene.addChild(ship)
    
    warpedShip = new Sprite(Resources["images/player.png"].texture)
    warpedShip.anchor.set(0.5,0.5)
    gameScene.addChild(warpedShip)
    
    bullets = new List()
    astorids = new List()
    
    inputs.left = keyboard("ArrowLeft")
    inputs.right = keyboard("ArrowRight")
    inputs.up = keyboard("ArrowUp")
    inputs.space = keyboard(" ")
    
    let style = new PIXI.TextStyle(
    {
        fontFamily: "Arial",
        fontSize: 48,
        fill: "white",
        stroke: '#000000',
        strokeThickness: 1,
    });
    
    scoreText = new PIXI.Text("Score: 0", style);
    gameScene.addChild(scoreText)
    
    //game over scene
    let style2 = new PIXI.TextStyle(
    {
        fontFamily: "Arial",
        fontSize: 72,
        fill: "white",
        stroke: '#000000',
        strokeThickness: 1,
    })
        
    let gameover = new PIXI.Text("Game Over",style2)
    gameover.position.set(512,472)
    gameover.anchor.set(0.5,0.5)
    endScene.addChild(gameover)
    
    endScoreText = new PIXI.Text("Score: 0",style)
    endScoreText.position.set(512,540)
    endScoreText.anchor.set(0.5,0.5)
    endScene.addChild(endScoreText)
    
    playAgain = new Button("Play again",resetGame)
    playAgain.position.set(512,600)
    //playAgain.anchor.set(0.5,0.5)
    endScene.addChild(playAgain)
    
    scaleToWindow(app.renderer.view);
    state = play
    app.ticker.add(delta => gameLoop(delta));
}

window.addEventListener("resize", function(event)
{
    scaleToWindow(app.renderer.view);
});

function gameLoop(delta)
{
    state(delta)
    //keyboard press handleing
    if(inputs.left.isDown) ship.rotation -= 0.1
    if(inputs.right.isDown) ship.rotation += 0.1
    if(inputs.up.isDown)
    {
        ship.vx += Math.sin(ship.rotation ) * 0.1
        if(Math.abs(ship.vx) >= Math.abs(Math.sin(ship.rotation) * 5) ship.vx = Math.sin(ship.rotation) * 5
        ship.vy += Math.cos(ship.rotation + Math.PI) * 0.1
        if(Math.abs(ship.vy) >= Math.abs(Math.cos(ship.rotation + Math.PI) * 5) ship.vy = Math.cos(ship.rotation + Math.PI) * 5
    }
    if(inputs.space.isDown)
    {
        if(player.lastShot + 100 < new Date().getTime())
        {
            player.lastShot = new Date().getTime()
            let bullet = new Sprite(Resources["images/bullet.png"].texture)
            bullet.x = ship.x + (Math.sin(ship.rotation) * (ship.width / 2))
            bullet.y = ship.y - (Math.cos(ship.rotation) * (ship.height / 2))
            bullet.anchor.set(0.5,0.5)
            bullet.vx = 5 * Math.sin(ship.rotation)
            bullet.vy = -5 * Math.cos(ship.rotation)
            bullet.rotation = ship.rotation
            bullet.hit = false;
            gameScene.addChild(bullet)
            bullets.push(bullet)
        }
    }
}

function play(delta)
{
    player.shipX += ship.vx
    player.shipX = (player.shipX + 1024) % 1024
    player.shipY += ship.vy
    player.shipY = (player.shipY + 1024) % 1024
    ship.position.set(player.shipX,player.shipY)
    warpedShip.rotation = ship.rotation
    if((player.shipX < 200 || player.shipX > 824) && (player.shipY < 200 || player.shipY > 824))
    {
        warpedShip.position.set(player.shipX - 1024,player.shipY - 1024)
    }
    else if(player.shipX < 200 || player.shipX > 824)
    {
        warpedShip.position.set(player.shipX - 1024,player.shipY)
    }
    else if(player.shipY < 200 || player.shipY > 824)
    {
        warpedShip.position.set(player.shipX,player.shipY - 1024)      
    }
    else
    {
        warpedShip.position.set(-500,-500) 
    }
    player.difficulty += 0.001
    
    bullets.forEach(function(bullet)
    {
        bullet.x += bullet.vx
        bullet.y += bullet.vy
        if(contain(bullet, {x: -8, y: -18, width: 1032, height: 1042}) != undefined)
        {
            gameScene.removeChild(bullet)
            bullets.delete(bullet)
        }
    });
    
    if(randomInt(1,100) > 96 - Math.floor(player.difficulty / 3))
    {
        let as = makeAst()
        if(randomInt(1,100) > 90 - (Math.floor(player.difficulty - 7) * 3) && player.difficulty >= 7)
        {
            as.scale.set(2,2);
        }
        astorids.push(as)
    }
    
    //updates the score
    scoreText.text = "Score: " + player.score
    
    astorids.forEach(function(as)
    {
        as.x += as.vx;
        as.y += as.vy;
        if(contain(as, {x: -100, y: -100, width: 1152, height: 1152}) != undefined)
        {
            gameScene.removeChild(as);
            astorids.delete(as);
        }
        bullets.forEach(function(bullet)
        {
            //colission detection between bullet and astroid
            if(hitTestRectangle(bullet,as) && !bullet.hit)
            {
                bullet.hit = true;
                switch(as.scale.x)
                {
                    case 2:
                        player.score += 5
                        break;
                    case 1:
                        player.score += 3
                        break;
                    case 0.5:
                        player.score += 1
                        break;
                }
                
                as.scale.x /= 2
                as.scale.y /= 2
                if(as.scale.x < 0.5)
                {
                    gameScene.removeChild(as)
                    astorids.delete(as)
                }
                else
                {
                    
                    let as2 = makeAst()
                    as2.x = as.x
                    as2.y = as.y
                    as2.scale.x = as.scale.x;
                    as2.scale.y = as.scale.y;
                    as2.rotation = as.rotation + Math.PI * 0.25
                    as2.vx = as2.speed * Math.sin(as2.rotation)
                    as2.vy = -as2.speed * Math.cos(as2.rotation)
                    gameScene.addChild(as2)
                    astorids.push(as2)
                    
                    as.rotation -= Math.PI * 0.25
                    as.vx = as.speed * Math.sin(as.rotation)
                    as.vy = -as.speed * Math.cos(as.rotation)     
                    
                    gameScene.removeChild(bullet)
                    bullets.delete(bullet)
                }
            }
        })
        //colission detection between player and astroid
        if(hitTestRectangle(ship,as) || hitTestRectangle(warpedShip,as))
        {
            state = end
        }
    })
}

function resetGame()
{
    gameScene.visible = true;
    endScene.visible = false;
    player.score = 0;
    player.difficulty = 0;
    player.shipX = 512
    player.shipY = 512
    ship.rotation = 0;
    ship.vx = 0;
    ship.vy = 0;
    bullets.forEach(function(bullet)
    {
        gameScene.removeChild(bullet);
        bullets.delete(bullet);
    })
    astorids.forEach(function(as)
    {
        gameScene.removeChild(as);
        astorids.delete(as);
    })
    state = play;
}

function end(delta)
{
    gameScene.visible = false
    endScene.visible = true
    endScoreText.text = "Score:" + player.score
}

function makeAst()
{
    let as = new Sprite(Resources["images/astroid.png"].texture)
    var randX = randomInt(-40,1064);
    var randY = randomInt(-40,1064);
    var rand = randomInt(0,3);
    var randAngle = 0
    as.speed = randomInt(10,30 + Math.floor(player.difficulty * 3.2)) / 10
    switch (rand)
    {
        case 0:
            randX = -40;
            randAngle = (randomInt(-90,90) / 100) * Math.PI
            break;
        case 1:
            randX = 1064;
            randAngle = (randomInt(0,180) / 100) * Math.PI
            break;
        case 2:
            randY = -40;
            randAngle = (randomInt(90,270) / 100) * Math.PI
            break;
        case 3:
            randY = 1064;
            randAngle = (randomInt(180,360) / 100) * Math.PI
            break;
    }
    as.rotation = randAngle
    as.x = randX
    as.y = randY
    as.anchor.set(0.5,0.5)
    as.vx = as.speed * Math.sin(as.rotation)
    as.vy = -as.speed * Math.cos(as.rotation)
    gameScene.addChild(as)
    return as
}