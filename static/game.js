window.onload = function () {

  var running = false;

  var easter_egg = new Konami(function() {
    if (running) {
      return
    }
    running = true;

    var canvasContainer = document.getElementById("main");
    var canvas = document.createElement('canvas');
    canvas.style.width = canvasContainer.scrollWidth+"px";
    canvas.style.height = canvasContainer.scrollHeight+"px";
    canvas.width=canvasContainer.scrollWidth;
    canvas.height=canvasContainer.scrollHeight;
    canvas.style.overflow = 'visible';
    canvas.style.position = 'absolute';
    canvas.style.margin_left="-50%";
    canvas.style.top="0px";
    canvas.style.zIndex="100";

    var ctx=canvas.getContext('2d');
    canvasContainer.appendChild(canvas);

    var playerRadius = 16,
        playerImage = new Image(24, 24);
        playerImage.src = '/static/player.png',
        playerFrameIndex = 0,
        playerTickCount = 0,
        playerTicksPerFrame = 10,
        playerFrames = 4;;
    var x = canvas.width/2,
        y = canvas.height-30,
        dx = 2,
        dy = 0,
        jump_dy = -8,
        ay = 0.2,
        max_ay = 5,
        min_x = canvas.offsetLeft + playerRadius,
        max_x = canvas.offsetLeft + canvas.width - playerRadius;
    var rightPressed = false,
        leftPressed = false,
        rotationRef = 0;

    var falling = false,
        currentLedge = null;


    var waterHeight = canvas.offsetTop + canvas.offsetHeight + 50,
        waterSpeed = 0.5,
        bubbles = []
        bubbleSpeed = 2,
        bubbleDx = 10,
        bubbleSpawners = [
          {x: canvas.offsetLeft + Math.random() * canvas.offsetWidth, y: canvas.offsetTop + canvas.offsetHeight, generating: false},
          {x: canvas.offsetLeft + Math.random() * canvas.offsetWidth, y: canvas.offsetTop + canvas.offsetHeight, generating: false}
        ]
        waterSurfaceImage = new Image(10, 100);
        waterSurfaceImage.src = '/static/water_surface.png';
        waterSurfaceImage.width = canvas.offsetWidth;

    var started = false,
        over = false,
        success = false,
        reload = false;

    var creditsX = canvas.width/2,
        creditsY = 0,
        creditsDy = 1;

    var targets = cleanTargets( document.getElementById("targets").querySelectorAll('*'));
    generateBubbles();

    function cleanTargets(targets){
      res = [];
      for(i=0; i<targets.length; i++) {
        if (["hr", "button", "textarea", "i"].indexOf(targets[i].localName) >= 0) {
          res.push(targets[i]);
        }
        else if (["form", "a"].indexOf(targets[i].localName) < 0)
        {
          targets[i].style.opacity = "0.2";
        }
      }
      return res;
    }

    var ledgeMinPadding = 100,
        ledgesWidth = 150,
        ledgesHeight = 1,
        ledgeFading = 1000;

    function buttonCollision(y) {
      for(i=0; i<targets.length; i++) {
        if (targets[i].localName == "button" && y > targets[i].offsetTop && y < targets[i].offsetTop + targets[i].offsetHeight)
        return true;
      }
    }

    function getRandomLedges() {
      let res = [],
          id = 0;
      height = 90 + ledgeMinPadding;
      while(height < canvas.offsetTop + canvas.offsetHeight) {
        let x = Math.floor(Math.random() * Math.floor(canvas.offsetWidth - ledgesWidth));
        if (!buttonCollision(height)) {
          res.push({
            offsetLeft: x,
            offsetTop: height,
            id: id,
            decaying: false
          });
        }
        height += ledgeMinPadding;
        id += 1;
      }
      return res
    }

    var ledges = getRandomLedges();
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', deviceOrientationHandler, false);
    }

    function generateBubbles() {
      for(i=0; i<bubbleSpawners.length; i++) {
        let gen = false;
        if (bubbleSpawners[i].generating) {
          gen = Math.random() > 0.2
        }
        else {
          gen = Math.random() > 0.8
        }
        if (gen) {
          bubbleSpawners[i].generating = true;
          bubbles.push({
            x: bubbleSpawners[i].x + (Math.random() - 0.5) * bubbleDx,
            y: bubbleSpawners[i].y,
            dx: 0,
            radius: Math.random() * 3})
        }
        else {
          bubbleSpawners[i].generating = false;
        }
      }

      for(i=0; i<targets.length; i++) {
        if (targets[i].offsetTop + targets[i].offsetHeight > waterHeight + 20) {
          let genL = false
              genR = false;

          if (targets[i].generatingL) {
            genL = Math.random() > 0.2
          }
          else {
            genL = Math.random() > 0.8
          }

          if (targets[i].generatingR) {
            genR = Math.random() > 0.2
          }
          else {
            genR = Math.random() > 0.8
          }

          if (genL) {
            targets[i].generatingL = true;
            bubbles.push({
              x: targets[i].offsetLeft + (Math.random() - 0.5) * bubbleDx,
              y: targets[i].offsetTop + targets[i].offsetHeight,
              dx: 0,
              radius: Math.random() * 3})
          }
          else {
            targets[i].generatingL = false;
          }

          if (genR) {
            targets[i].generatingR = true;
            bubbles.push({
              x: targets[i].offsetLeft + targets[i].offsetWidth + (Math.random() - 0.5) * bubbleDx,
              y: targets[i].offsetTop + targets[i].offsetHeight,
              dx: 0,
              radius: Math.random() * 3})
          }
          else {
            targets[i].generatingR = false;
          }
        }
      }

      setTimeout(function() {generateBubbles(); }, Math.random() * 500);
    }

    function deviceOrientationHandler(evt) {
      rotationRef += evt.rotationRate.gamma
      if ( rotationRef > 2) {
        rotationRef = 2
      }
      if  ( rotationRef < -2) {
        rotationRef = -2
      }
      if (rotationRef < -0.4) {
        rightPressed = true;
      }
      else {
        rightPressed = false;
      }
      if (rotationRef > 0.4) {
        leftPressed = true;
      }
      else {
        leftPressed = false;
      }
    }

    function getBubblesSpawn() {
      return [{x: canvas.offsetLeft + Math.random() * canvas.offsetHeight, y: canvas.offsetTop + canvas.offsetHeight}]
    }

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    document.addEventListener('touchstart', touchHandler, false);
    function jump() {
      if (!started) {
        started = true;
      }
      if (!falling) {
        falling = true;
        dy = jump_dy;
        min_x = canvas.offsetLeft;
        max_x = canvas.offsetLeft + canvas.width;
      }
    }
    function touchHandler(evt) {
      jump();
    }
    function keyDownHandler(evt) {
        var e = evt || event;
        var code = e.keyCode || e.which;
        if(code == 39) {
            rightPressed = true;
        }
        else if(code == 37) {
            leftPressed = true;
        }
        else if(code == 32) {
          evt.preventDefault();
          jump();
        }
    }
    function keyUpHandler(evt) {
        var e = evt || event;
        var code = e.keyCode || e.which;
        if(code == 39) {
            rightPressed = false;
        }
        else if(code == 37) {
            leftPressed = false;
        }
    }
    function getTarget(target){
      if (x > target.offsetLeft && x < target.offsetLeft+target.offsetWidth) {
        if (target.localName == "hr") {
          if(y > target.offsetTop - playerRadius*2 && y < target.offsetTop) {
            falling = false;
            dy = 0;
            y = target.offsetTop - playerRadius
            min_x = target.offsetLeft + playerRadius;
            max_x = target.offsetLeft + target.offsetWidth - playerRadius;
            return true
          }
        }
        else if (target.localName == "i") {
          if(y > target.offsetTop - playerRadius*2 && y < target.offsetTop) {
            falling = false;
            dy = 0;
            y = target.offsetTop - playerRadius
            min_x = target.offsetLeft + playerRadius;
            max_x = target.offsetLeft + target.offsetWidth - playerRadius;
            return true
          }
        }
        else {
          if(y > target.offsetTop - playerRadius*2 && y < target.offsetTop) {
            falling = false;
            dy = 0;
            y = target.offsetTop - playerRadius
            min_x = target.offsetLeft + playerRadius;
            max_x = target.offsetLeft + target.offsetWidth - playerRadius;
            return true
          }
          else if(y > target.offsetTop+target.offsetHeight - playerRadius*2 && y < target.offsetTop+target.offsetHeight) {
            falling = false;
            dy = 0;
            y = target.offsetTop+target.offsetHeight - playerRadius;
            min_x = target.offsetLeft + playerRadius;
            max_x = target.offsetLeft + target.offsetWidth - playerRadius;
            return true
          }
        }
      }
    }
    function getLedge(ledge) {
      if (x > ledge.offsetLeft && x < ledge.offsetLeft+ledgesWidth) {
        if(y > ledge.offsetTop - playerRadius*2 && y < ledge.offsetTop) {
          falling = false;
          dy = 0;
          y = ledge.offsetTop - playerRadius
          min_x = ledge.offsetLeft + playerRadius;
          max_x = ledge.offsetLeft + ledgesWidth - playerRadius;
          return true
        }
      }
    }
    function LedgeDetection() {
      if (dy >= 0) {
        // Player falling
        for(i=0; i<targets.length; i++) {
          if (getTarget(targets[i])) {
            return
          }
        }
        for(i=0; i<ledges.length; i++) {
          if (getLedge(ledges[i])) {
            if (!ledges[i].decaying) {
              let id = ledges[i].id;
              ledges[i].decaying = true;
              ledges[i].end = new Date().getTime() + 1000;
              setTimeout(function() {destroyLedge(id); }, ledgeFading);
            }
            return;
          }
        }
        // No ledge found
        falling = true;
        min_x = canvas.offsetLeft + playerRadius;
        max_x = canvas.offsetLeft + canvas.width - playerRadius;
      }
    }
    function drawPlayer() {
      playerTickCount += 1;

      if (playerTickCount > playerTicksPerFrame) {
        playerTickCount = 0;
        // If the current frame index is in range
        if (playerFrameIndex < playerFrames - 1) {
            // Go to the next frame
            playerFrameIndex += 1;
        } else {
            playerFrameIndex = 0;
        }
      }

      let playerSize = 2* playerRadius;
      // ctx.drawImage(playerImage, x - playerRadius, y - playerRadius);
      ctx.drawImage(
        playerImage,
        playerFrameIndex * playerSize,
        0,
        playerSize,
        playerSize,
        x - playerRadius,
        y - playerRadius,
        playerSize,
        playerSize
      );

    }
    function drawGoal() {
      ctx.beginPath();
      ctx.rect(0, canvas.offsetTop + 90, canvas.offsetWidth, 3);
      ctx.fillStyle = "#325f73";
      ctx.fill();
      ctx.closePath();
    }
    function drawLedge(ledge) {
      ctx.beginPath();
      ctx.rect(ledge.offsetLeft, ledge.offsetTop, ledgesWidth, ledgesHeight);
      let alpha = 1;
      if (ledge.decaying) {
        alpha = (ledge.end - new Date().getTime()) / 1000;
      }
      ctx.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
      ctx.fill();
      ctx.closePath();
    }
    function drawLedges() {
        for(i=0; i<ledges.length; i++) {
          drawLedge(ledges[i]);
        }
    }
    function drawBubble(bubble) {
      ctx.beginPath();
      ctx.arc(bubble.x + bubble.dx, bubble.y, bubble.radius, 0, Math.PI*2);
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
      ctx.closePath();
    }
    function drawBubbles() {
      for(i=bubbles.length-1; i >= 0; i--) {
        drawBubble(bubbles[i]);
        if (bubbles[i].y - bubbles[i].radius < waterHeight) {
          bubbles.splice(i, 1);
        }
        else {
          bubbles[i].y -= bubbleSpeed;
          bubbles[i].dx = bubbles[i].dx + Math.random() - 0.5;
        }
      }
    }
    function drawWater() {
      ctx.fillStyle = "rgba(0, 30, 100, 0.6)";
      ctx.fillRect(0, waterHeight, canvas.width, canvas.height);
      let x = 0;
      while(x<canvas.offsetWidth) {
        ctx.drawImage(waterSurfaceImage, x, waterHeight - 4);
        x += 100;
      }
      drawBubbles();
    }
    function destroyLedge(id) {
      for (i=0; i<ledges.length; i++) {
        if (ledges[i].id == id) {
          ledges.splice(i, 1);
        }
      }
    }
    function movePlayer() {
      if (started) {
        waterHeight = waterHeight - waterSpeed;
      }
      if (falling === true) {
        y = y + dy;
        if (y > canvas.offsetTop + canvas.offsetHeight - playerRadius) {
          y = canvas.offsetTop + canvas.offsetHeight - playerRadius;
          dy = 0;
          falling = false;
        }
        if (dy + ay < max_ay) {
          // we fall faster
          dy = dy + ay
        }
        if (y > canvas.targetTop + canvas.offsetHeight) {
          dy = 0;
          falling = false;
          y = canvas.targetTop + canvas.offsetHeight - playerRadius;
        }
      }
      if(rightPressed) {
        if (x < canvas.offsetLeft + canvas.offsetWidth) {
          x += 5;
        }
        else {
          x = 0;
        }
      }
      else if(leftPressed) {
        if (x > canvas.offsetLeft) {
          x -= 5;
        }
        else {
          x = canvas.offsetWidth;
        }
      }
      if (x < min_x - playerRadius || x > max_x + playerRadius) {
        falling = true;
        dy = 5
      }
      if (y - playerRadius < canvas.offsetTop + 95){
        over = true;
        success = true;
      }
      if (y - playerRadius > waterHeight){
        over = true;
      }
      // Recenter on player position
      window.scrollTo(0, y - window.innerHeight / 2);
    }
    function gameFrame() {
      drawPlayer();
      drawGoal();
      drawLedges();
      drawWater();
      LedgeDetection();
      movePlayer();
    }
    function creditsFrame() {
        if (creditsY - 80 >= canvas.height){
          reload = true;
          document.location.reload();
        }
        if (success) {
          ctx.font = "30px Arial";
          ctx.fillStyle = "#325f73";
          ctx.textAlign = 'center';
          ctx.fillText("Congratulations", creditsX, creditsY-50);
        }
        else {
          ctx.font = "22px Arial";
          ctx.fillStyle = "#aa0000";
          ctx.textAlign = 'center';
          ctx.fillText("You failed", creditsX, creditsY-50);
        }
        ctx.font = "22px Arial";
        ctx.fillStyle = "#aaaaaa";
        ctx.textAlign = 'center';
        ctx.fillText("Special thanks to", creditsX, creditsY);
        ctx.fillStyle = "#aaaaaa";
        ctx.fillText("何亚雯.", creditsX, creditsY+35);
        ctx.font = "16px Arial";
        ctx.fillStyle = "#325f73";
        ctx.fillText("For her design suggestions, translation & support.", creditsX, creditsY+50);
        ctx.font = "22px Arial";
        ctx.fillStyle = "#aaaaaa";
        ctx.fillText("Alexis Rolland", creditsX, creditsY+80);
        ctx.font = "16px Arial";
        ctx.fillStyle = "#325f73";
        ctx.fillText("For his big help on UX, features, ideas design & debugging.", creditsX, creditsY+95);
        creditsY += creditsDy;

        if (waterHeight < creditsY+120) {
          waterHeight = creditsY+120;
        }
        drawWater();
    }
    function draw() {
      if (reload) {
        return
      }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (over) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
          ctx.fillRect(0,0, canvas.width, canvas.height);
          creditsFrame()
        }
        else {
          gameFrame();
        }
        requestAnimationFrame(draw);
    }

    draw();
  });
}
