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