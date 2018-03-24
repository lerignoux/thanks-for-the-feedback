window.onload = function () {

  var easter_egg = new Konami(function() {
    var canvasContainer = document.getElementById("main");
    var canvas = document.createElement('canvas');
    canvas.style.width = canvasContainer.scrollWidth+"px";
    canvas.style.height = canvasContainer.scrollHeight+"px";
    // You must set this otherwise the canvas will be streethed to fit the container
    canvas.width=canvasContainer.scrollWidth;
    canvas.height=canvasContainer.scrollHeight;
    canvas.style.overflow = 'visible';
    canvas.style.position = 'absolute';
    canvas.style.margin_left="-50%";
    canvas.style.top="0px";
    canvas.style.zIndex="100";

    var ctx=canvas.getContext('2d');
    canvasContainer.appendChild(canvas);

    var ballRadius = 10;
    var x = canvas.width/2,
        y = canvas.height-30,
        dx = 2,
        dy = 0,
        jump_dy = -8,
        ay = 0.2,
        max_ay = 5,
        min_x = canvas.offsetLeft + ballRadius,
        max_x = canvas.offsetLeft + canvas.width - ballRadius;
    var rightPressed = false;
    var leftPressed = false;

    var jumping = false,
        currentLedge = null;

    var waterHeight = canvas.offsetTop + canvas.offsetHeight + 50,
        waterSpeed = 0.5;

    var over = false,
        success = false,
        reload = false;
    var creditsX = canvas.width/2,
        creditsY = 0,
        creditsDy = 1;

    var targets = cleanTargets( document.getElementById("targets").querySelectorAll('*'));

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
        ledgesHeight = 1;

    function getRandomLedges() {
      let res = [];
      height = 90 + ledgeMinPadding;
      while(height < canvas.offsetTop + canvas.offsetHeight) {
        let x = Math.floor(Math.random() * Math.floor(canvas.offsetWidth - ledgesWidth));
        res.push({offsetLeft: x, offsetTop: height});
        height += ledgeMinPadding;
      }
      return res
    }

    var ledges = getRandomLedges();
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', deviceOrientationHandler, false);
    }

    function deviceOrientationHandler(evt) {
      if (evt.gamma > 0) {
        rightPressed = true;
      }
      else {
        rightPressed = false;
      }
      if (evt.gamma < 0) {
        leftPressed = true;
      }
      else {
        leftPressed = false;
      }
    }

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    document.addEventListener('touchstart', touchHandler, false);
    function touchHandler(evt) {
        if (!jumping) {
          jumping = true;
          dy = jump_dy;
          min_x = canvas.offsetLeft;
          max_x = canvas.offsetLeft + canvas.width;
        }
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
          if (!jumping) {
            jumping = true;
            dy = jump_dy;
            min_x = canvas.offsetLeft;
            max_x = canvas.offsetLeft + canvas.width;
          }
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
          if(y > target.offsetTop - ballRadius*2 && y < target.offsetTop) {
            jumping = false;
            dy = 0;
            y = target.offsetTop - ballRadius
            min_x = target.offsetLeft + ballRadius;
            max_x = target.offsetLeft + target.offsetWidth - ballRadius;
            return true
          }
        }
        else if (target.localName == "i") {
          if(y > target.offsetTop - ballRadius*2 && y < target.offsetTop) {
            jumping = false;
            dy = 0;
            y = target.offsetTop - ballRadius
            min_x = target.offsetLeft + ballRadius;
            max_x = target.offsetLeft + target.offsetWidth - ballRadius;
            return true
          }
        }
        else {
          if(y > target.offsetTop - ballRadius*2 && y < target.offsetTop) {
            jumping = false;
            dy = 0;
            y = target.offsetTop - ballRadius
            min_x = target.offsetLeft + ballRadius;
            max_x = target.offsetLeft + target.offsetWidth - ballRadius;
            return true
          }
          else if(y > target.offsetTop+target.offsetHeight - ballRadius*2 && y < target.offsetTop+target.offsetHeight) {
            jumping = false;
            dy = 0;
            y = target.offsetTop+target.offsetHeight - ballRadius;
            min_x = target.offsetLeft + ballRadius;
            max_x = target.offsetLeft + target.offsetWidth - ballRadius;
            return true
          }
        }
      }
    }
    function getLedge(ledge) {
      if (x > ledge.offsetLeft && x < ledge.offsetLeft+ledgesWidth) {
        if(y > ledge.offsetTop - ballRadius*2 && y < ledge.offsetTop) {
          jumping = false;
          dy = 0;
          y = ledge.offsetTop - ballRadius
          min_x = ledge.offsetLeft + ballRadius;
          max_x = ledge.offsetLeft + ledgesWidth - ballRadius;
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
        console.log(ledges.length)
        for(i=0; i<ledges.length; i++) {
          if (getLedge(ledges[i])) {
            //destroyLedge(ledges[i]);
            setTimeout(function() {ledges.splice(i, 1); }, 1000);
            return;
          }
        }
        jumping = true;
        //No ledge found
        min_x = canvas.offsetLeft + ballRadius;
        max_x = canvas.offsetLeft + canvas.width - ballRadius;
      }
    }
    function drawBall() {
      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, Math.PI*2);
      ctx.fillStyle = "#325f73";
      ctx.fill();
      ctx.closePath();
    }
    function drawEnd() {
      ctx.beginPath();
      ctx.rect(0, canvas.offsetTop + 90, canvas.offsetWidth, 3);
      ctx.fillStyle = "#325f73";
      ctx.fill();
      ctx.closePath();
    }
    function drawledge(ledge) {
      ctx.beginPath();
      ctx.rect(ledge.offsetLeft, ledge.offsetTop, ledgesWidth, ledgesHeight);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.closePath();
    }
    function drawLedges() {
        for(i=0; i<ledges.length; i++) {
          drawledge(ledges[i]);
        }
    }
    function drawWater() {
      ctx.fillStyle = "rgba(0, 30, 100, 0.6)";
      ctx.fillRect(0, waterHeight, canvas.width, canvas.height);
    }
    function destroyLedge(ledge) {
      setTimeout(function(){
        ledge.remove();
      }, 1000);
      //
    }
    function movePlayer() {
      waterHeight = waterHeight - waterSpeed;
      if (jumping === true) {
        y = y + dy;
        if (y > canvas.offsetTop + canvas.offsetHeight) {
          y = canvas.offsetTop + canvas.offsetHeight;
          dy = 0;
          jumping = false;
        }
        if (dy + ay < max_ay) {
          // we fall faster
          dy = dy + ay
        }
        if (y > canvas.targetTop + canvas.offsetHeight) {
          dy = 0;
          jumping = false;
          y = canvas.targetTop + canvas.offsetHeight - ballRadius;
        }
      }
      if(rightPressed && x < canvas.offsetLeft + canvas.offsetWidth) {
          x += 5;
      }
      else if(leftPressed && x > canvas.offsetLeft) {
          x -= 5;
      }
      if (x < min_x - ballRadius || x > max_x + ballRadius) {
        jumping = true;
        dy = 5
      }
      if (y < canvas.offsetTop + 95){
        over = true;
        success = true;
      }
      if (y > waterHeight){
        over = true;
      }
    }
    function gameFrame() {
      drawBall();
      drawEnd();
      drawLedges();
      drawWater();
      LedgeDetection();
      movePlayer();
    }
    function draw_debug() {

      for(i=0; i<targets.length; i++) {
        let target = targets[i];
        ctx.beginPath();
        ctx.rect(target.offsetLeft, target.offsetTop, target.offsetWidth, 5);
        ctx.fillStyle = "#ff0000";
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.rect(target.offsetLeft, target.offsetTop+target.offsetHeight, target.offsetWidth, 5);
        ctx.fillStyle = "#00ff00";
        ctx.fill();
        ctx.closePath();
      }

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
        ctx.fillText("For her design suggestions, translation and support.", creditsX, creditsY+50);
        ctx.font = "22px Arial";
        ctx.fillStyle = "#aaaaaa";
        ctx.fillText("Alexis Roland", creditsX, creditsY+80);
        ctx.font = "16px Arial";
        ctx.fillStyle = "#325f73";
        ctx.fillText("For his big help on UX, features, ideas and debugging.", creditsX, creditsY+95);
        creditsY += creditsDy;

        if (waterHeight < creditsY+95) {
          waterHeight = creditsY+95;
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
