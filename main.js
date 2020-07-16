//the codes layout and a little bit of the actual code is from kittykatattacks learning pixi.js tutorial i also used pixi.js and collections.js

//alise
let Resources = PIXI.Loader.shared.resources
let Loader = PIXI.Loader.shared
let TextureCache = PIXI.utils.TextureCache
let Sprite = PIXI.Sprite
let Container = PIXI.Container
let Graphics = PIXI.Graphics

//varibles that will be used all over
let gameScene,player,bullets,astorids,scoreText,endScoreText,playAgain,warpedPlayer
let lastShot = 0;
var inputs = {};
var shipX = 512
var shipY = 512
//player varibles
let score = 0
let difficulty = 0

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
    
    player = new Sprite(Resources["images/player.png"].texture)
    player.position.set(512,512);
    player.vx = 0
    player.vy = 0
    player.thrust = 0
    player.anchor.set(0.5,0.5)
    gameScene.addChild(player)
    
    warpedPlayer = new Sprite(Resources["images/player.png"].texture)
    warpedPlayer.anchor.set(0.5,0.5)
    gameScene.addChild(warpedPlayer)
    
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
    
    playAgain = new Sprite(Resources["images/PlayAgain.png"].texture)
    playAgain.position.set(512,600)
    playAgain.anchor.set(0.5,0.5)
    playAgain.interactive = true;
    playAgain.on("mousedown",resetGame)
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
    if(inputs.left.isDown) player.rotation -= 0.1
    if(inputs.right.isDown) player.rotation += 0.1
    if(inputs.up.isDown) player.thrust += (8 - player.thrust) * 0.2
    else player.thrust *= 0.94
    if(inputs.space.isDown)
    {
        if(lastShot + 100 < new Date().getTime())
        {
            lastShot = new Date().getTime()
            let bullet = new Sprite(Resources["images/bullet.png"].texture)
            bullet.x = player.x + (Math.sin(player.rotation) * (player.width / 2))
            bullet.y = player.y - (Math.cos(player.rotation) * (player.height / 2))
            bullet.anchor.set(0.5,0.5)
            bullet.vx = 10 * Math.sin(player.rotation)
            bullet.vy = -10 * Math.cos(player.rotation)
            bullet.rotation = player.rotation
            bullet.hit = false;
            gameScene.addChild(bullet)
            bullets.push(bullet)
        }
    }
}

function play(delta)
{
    player.vx = player.thrust * Math.sin(player.rotation)
    player.vy = -player.thrust * Math.cos(player.rotation)
    shipX += player.vx
    shipX = (shipX + 1024) % 1024
    shipY += player.vy
    shipY = (shipY + 1024) % 1024
    player.position.set(shipX,shipY)
    warpedPlayer.rotation = player.rotation
    if((shipX < 200 || shipX > 824) && (shipY < 200 || shipY > 824))
    {
        warpedPlayer.position.set(shipX - 1024,shipY - 1024)
    }
    else if(shipX < 200 || shipX > 824)
    {
        warpedPlayer.position.set(shipX - 1024,shipY)
    }
    else if(shipY < 200 || shipY > 824)
    {
        warpedPlayer.position.set(shipX,shipY - 1024)      
    }
    else
    {
        warpedPlayer.position.set(-500,-500) 
    }
    difficulty += 0.001
    
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
    
    if(randomInt(1,100) > 96 - Math.floor(difficulty / 3))
    {
        let as = makeAst()
        if(randomInt(1,100) > 90 - (Math.floor(difficulty - 7) * 3) && difficulty >= 7)
        {
            as.scale.set(2,2);
        }
        astorids.push(as)
    }
    
    //updates the score
    scoreText.text = "Score: " + score
    
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
                        score += 5
                        break;
                    case 1:
                        score += 3
                        break;
                    case 0.5:
                        score += 1
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
        if(hitTestRectangle(player,as) || hitTestRectangle(warpedPlayer,as))
        {
            state = end
        }
    })
}

function resetGame()
{
    gameScene.visible = true;
    endScene.visible = false;
    score = 0;
    difficulty = 0;
    shipX = 512
    shipY = 512
    player.rotation = 0;
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
    endScoreText.text = "Score:" + score
}

function makeAst()
{
    let as = new Sprite(Resources["images/astroid.png"].texture)
    var randX = randomInt(-40,1064);
    var randY = randomInt(-40,1064);
    var rand = randomInt(0,3);
    var randAngle = 0
    as.speed = randomInt(10,30 + Math.floor(difficulty * 3.2)) / 10
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

function hitTestRectangle(r1, r2) 
{

  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  r1.centerX = r1.x + (r1.width * r1.scale.x) / 2;
  r1.centerY = r1.y + (r1.height * r1.scale.y) / 2;
  r2.centerX = r2.x + (r2.width * r2.scale.x) / 2;
  r2.centerY = r2.y + (r2.height * r2.scale.y) / 2;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = (r1.width * r1.scale.x) / 2;
  r1.halfHeight = (r1.height * r1.scale.y) / 2;
  r2.halfWidth = (r2.width * r2.scale.x) / 2;
  r2.halfHeight = (r2.height * r2.scale.y) / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) 
  {

    //A collision might be occurring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) 
    {
      //There's definitely a collision happening
      hit = true;
    } 
    else 
    {

      //There's no collision on the y axis
      hit = false;
    }
  }
  else 
  {

    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
};

function contain(sprite, container) 
{
  let collision = undefined;
  //Left
  if (sprite.x - (sprite.width / 2) < container.x) 
  {
    sprite.x = container.x + (sprite.width / 2);
    collision = "left";
  }
  //Top
  if (sprite.y - (sprite.width / 2)< container.y) 
  {
    sprite.y = container.y + (sprite.width / 2);
    collision = "top";
  }
  //Right
  if (sprite.x + (sprite.width / 2) > container.width)
  {
    sprite.x = container.width - (sprite.width / 2);
    collision = "right";
  }
  //Bottom
  if (sprite.y + (sprite.height / 2) > container.height) 
  {
    sprite.y = container.height - (sprite.height / 2);
    collision = "bottom";
  }
  //Return the `collision` value
  return collision;
}


//The `randomInt` helper function
function randomInt(min, max) 
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function keyboard(value) 
{
  let key = {};
  key.value = value;
  key.isDown = false;
  key.isUp = true;
  //The `downHandler`
  key.downHandler = event => 
  {
    if (event.key === key.value) 
    {
      key.isDown = true;
      key.isUp = false;
      event.preventDefault();
    }
  };

  //The `upHandler`
  key.upHandler = event => 
  {
    if (event.key === key.value) 
    {
      key.isDown = false;
      key.isUp = true;
      event.preventDefault();
    }
  };

  //Attach event listeners
  const downListener = key.downHandler.bind(key);
  const upListener = key.upHandler.bind(key);
  
  window.addEventListener(
    "keydown", downListener, false
  );
  window.addEventListener(
    "keyup", upListener, false
  );
  
  // Detach event listeners
  key.unsubscribe = () => 
  {
    window.removeEventListener("keydown", downListener);
    window.removeEventListener("keyup", upListener);
  };
  
  return key;
}