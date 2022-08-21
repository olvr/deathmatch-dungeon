"use strict";

// (function () {

    // let socket, //Socket.IO client
    //     buttons, //Button elements
    //     message, //Message element
    //     score, //Score element
    //     points = { //Game points
    //         draw: 0,
    //         win: 0,
    //         lose: 0
    //     };

    let socket;
    const gameWidth = 320;
    const gameHeight = 180;
    let scale;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("width", gameWidth);
    canvas.setAttribute("height", gameHeight);
    // document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    
    let bCanvas = document.createElement('canvas');
    bCanvas.width = gameWidth;
    bCanvas.height = gameHeight;
    var bCtx = bCanvas.getContext("2d");
    bCtx.imageSmoothingEnabled = false;

    const keyboardState = {};
    const mouse = { x: 0, y: 0 };
    const playerSpeed = 1;
    const spriteSize = 16;

    const map = {
        cols: 32,
        rows: 32,
        tileSize: 16,
        tiles: [
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        ],
        getTile: function(col, row) {
            return this.tiles[row * this.cols + col];
        },
        canMoveToXY: function(x, y) {
            return this.getTile(Math.floor(x / this.tileSize), Math.floor(y / this.tileSize));
        }
    }

    let sprites = new Image();

    const gameState = {
        players: [
            {
                username: "",
                playerId: Math.floor(Math.random() * 100000000),
                sessionId: '',
                // x: Math.floor((Math.random() * gameWidth) - spriteSize), y: Math.floor((Math.random() * gameHeight) - spriteSize),
                x: 32,
                y: 32,
                screen: {
                    x: 32,
                    y: 32,
                },
                color: '#ae83c3',
                health: 1,
                rotation: 0,
                projectiles: []
            }
        ],
        viewport: {
            following: {},
            x: 0,
            y: 0,
            width: gameWidth,
            height: gameHeight
        }
    }

    const myPlayerId = gameState.players[0].playerId;
    // console.log(gameState.players[0].x,  gameState.players[0].y)

    function resizeCanvas() {
        if (window.innerWidth < gameWidth || window.innerHeight < gameHeight) {
            canvas.width = gameWidth;
            canvas.height = gameHeight;
            scale = 1;
            return;
        }
        let ratio = gameWidth / gameHeight;
        let w = Math.floor(window.innerWidth / gameWidth) * gameWidth;
        let h = Math.floor(window.innerHeight / gameHeight) * gameHeight;
        if (h < w / ratio) {
            canvas.width = h * ratio;
            canvas.height = h;
        } else {
            canvas.width = w;
            canvas.height = w / ratio;
        }
        scale = canvas.width / gameWidth;
    }

    function blit() {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(bCanvas, 0, 0, bCanvas.width, bCanvas.height, 0, 0, canvas.width, canvas.height);
        // ctx.putImageData(scaleImageData(bCtx.getImageData(0, 0, bCanvas.width, bCanvas.height), Math.floor(canvas.width / bCanvas.width)), 0, 0);
    }

    function scaleImageData(imageData, scale) {
        if (scale == 1) return imageData;
        var scaled = ctx.createImageData(imageData.width * scale, imageData.height * scale);
        var subLine = ctx.createImageData(scale, 1).data
        for (var row = 0; row < imageData.height; row++) {
            for (var col = 0; col < imageData.width; col++) {
                var sourcePixel = imageData.data.subarray(
                    (row * imageData.width + col) * 4,
                    (row * imageData.width + col) * 4 + 4
                );
                for (var x = 0; x < scale; x++) subLine.set(sourcePixel, x*4)
                for (var y = 0; y < scale; y++) {
                    var destRow = row * scale + y;
                    var destCol = col * scale;
                    scaled.data.set(subLine, (destRow * scaled.width + destCol) * 4)
                }
            }
        }
    
        return scaled;
    }

    /**
     * Disable all button
     */
    function disableButtons() {
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].setAttribute("disabled", "disabled");
        }
    }

    /**
     * Enable all button
     */
    function enableButtons() {
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].removeAttribute("disabled");
        }
    }

    /**
     * Set message text
     * @param {string} text
     */
    function setMessage(text) {
        message.innerHTML = text;
    }

    /**
     * Set score text
     * @param {string} text
     */
    function displayScore(text) {
        score.innerHTML = [
            "<h2>" + text + "</h2>",
            "Won: " + points.win,
            "Lost: " + points.lose,
            "Draw: " + points.draw
        ].join("<br>");
    }

    /**
     * Bind Socket.IO and button events
     */
    function bind() {

    //     socket.on("start", () => {
    //         enableButtons();
    //         setMessage("Round " + (points.win + points.lose + points.draw + 1));
    //     });

    //     socket.on("win", () => {
    //         points.win++;
    //         displayScore("You win!");
    //     });

    //     socket.on("lose", () => {
    //         points.lose++;
    //         displayScore("You lose!");
    //     });

    //     socket.on("draw", () => {
    //         points.draw++;
    //         displayScore("Draw!");
    //     });

    //     socket.on("end", () => {
    //         disableButtons();
    //         setMessage("Waiting for opponent...");
    //     });

    //     socket.on("connect", () => {
    //         disableButtons();
    //         setMessage("Waiting for opponent...");
    //     });

    //     socket.on("disconnect", () => {
    //         disableButtons();
    //         setMessage("Connection lost!");
    //     });

    //     socket.on("error", () => {
    //         disableButtons();
    //         setMessage("Connection error!");
    //     });

    //     for (let i = 0; i < buttons.length; i++) {
    //         ((button, guess) => {
    //             button.addEventListener("click", function (e) {
    //                 disableButtons();
    //                 socket.emit("guess", guess);
    //             }, false);
    //         })(buttons[i], i + 1);
    //     }

        socket = io({ upgrade: false, transports: ["websocket"] });

        // We have connected so set our sessionId as our socket.id
        socket.on('connect', function() {
            console.log("Connected: " + socket.id);
            gameState.players[0].sessionId = socket.id;
        });

        socket.on('playerDisconnect', function(sessionId) {
            // gameState.players[0].sessionId = socket.sessionid;
            console.log("Player disconnected: " + sessionId);
            for (let i = 0; i < gameState.players.length; i++) {
                if (gameState.players[i].sessionId == sessionId) gameState.players.splice(i, 1);
            }
        });

        socket.on('stateUpdate', function (player) {
            if (player.playerId === myPlayerId) {
                // ignore own update
                return;
            }
        
            let playerWasFound = false;
            for (let i = 0; i < gameState.players.length; ++i) {
                if (gameState.players[i].playerId === player.playerId) {
                    gameState.players[i] = player;
                    playerWasFound = true;
                    break;
                }
            }
        
            if (!playerWasFound) {
                // New player
                gameState.players.push(player);
            }
        });

        document.addEventListener("keydown", e => {
            keyboardState[e.key] = true;
            if (keyboardState.w || keyboardState.a || keyboardState.s || keyboardState.d || keyboardState.ArrowLeft || keyboardState.d || keyboardState.ArrowRight || keyboardState.ArrowUp || keyboardState.ArrowDown) {
                e.stopPropagation();
                e.preventDefault();
            }
        });
        
        document.addEventListener("keyup", e => {
            keyboardState[e.key] = false;
        });
    
        document.addEventListener("mousemove", e => {
            mouse.x = Math.round((e.clientX - canvas.getBoundingClientRect().left) / scale);
            mouse.y = Math.round((e.clientY - canvas.getBoundingClientRect().top) / scale);
            // angle = math.atan2(y2 - y1, x2 - x1) * 180 / math.pi;
            // Show name and health only when hovered?
            gameState.players.forEach(player => {
            });
        });
    
        document.addEventListener("mousedown", e => {
            if (e.buttons != 1) return; // LMB is 1
            // if (!document.hasFocus()) console.log("not active");;
            let dx = mouse.x - (gameState.players[0].screen.x + spriteSize / 2);
            let dy = mouse.y - (gameState.players[0].screen.y + spriteSize / 2);
            let mag = Math.sqrt(dx * dx + dy * dy);
    
            const projectile = {
                x: gameState.players[0].x + spriteSize / 2,
                y: gameState.players[0].y + spriteSize / 2,
                vx: (dx / mag) * playerSpeed,
                vy: (dy / mag) * playerSpeed
            }
    
            gameState.players[0].projectiles.push(projectile);
        });

        window.addEventListener("resize", e => {
            resizeCanvas();
        });
    }

    function gameUpdate() {
        // Update projectiles
        gameState.players.forEach(player => {
            player.projectiles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > window.innerWidth ||
                    p.y < 0 || p.y > window.innerHeight) {
                    p.remove = true;
                }
            });
            player.projectiles = player.projectiles.filter(p => {
                return (p.remove !== true);
            });
        });

        // Move player
        let p = gameState.players[0];
        // We are always the first element in our players array
        if ((keyboardState.w || keyboardState.ArrowUp) && map.canMoveToXY(p.x, p.y - playerSpeed) && map.canMoveToXY(p.x + spriteSize - 1, p.y - playerSpeed)) p.y -= playerSpeed;

        if (keyboardState.a || keyboardState.ArrowLeft && map.canMoveToXY(p.x - playerSpeed, p.y) && map.canMoveToXY(p.x - playerSpeed, p.y + spriteSize - 1)) p.x -= playerSpeed;

        if (keyboardState.s || keyboardState.ArrowDown && map.canMoveToXY(p.x, p.y + playerSpeed + spriteSize - 1) && map.canMoveToXY(p.x + spriteSize - 1, p.y + playerSpeed + spriteSize - 1)) p.y += playerSpeed;

        if (keyboardState.d || keyboardState.ArrowRight && map.canMoveToXY(p.x + playerSpeed + spriteSize - 1, p.y) && map.canMoveToXY(p.x + playerSpeed + spriteSize - 1, p.y + spriteSize - 1)) p.x += playerSpeed;

        // Move viewport
        // Player being followed should default to screen center
        gameState.viewport.following.screen.x = (gameWidth / 2) - spriteSize / 2;    
        gameState.viewport.following.screen.y = (gameHeight / 2) - spriteSize / 2;  
        // Make viewport offset of player world position
        gameState.viewport.x = gameState.viewport.following.x - (gameWidth / 2) + spriteSize / 2;
        gameState.viewport.y = gameState.viewport.following.y - (gameHeight / 2) + spriteSize / 2;
        // TODO: Min and max to keep viewport within map/in map corners allow player to move from screen center?

        // Update the server with the new state
        socket.emit('stateUpdate', p);
    }

    function gameRender() {
        bCtx.fillStyle = "rgb(56, 56, 56)";
        bCtx.fillRect(0, 0, canvas.width, canvas.height);

        // Render floor
        let startCol = Math.floor(gameState.viewport.x / map.tileSize);
        let endCol = startCol + (gameState.viewport.width / map.tileSize);
        // if (endCol > map.cols - 1) endCol = map.cols - 1;
        let startRow = Math.floor(gameState.viewport.y / map.tileSize);
        let endRow = startRow + (gameState.viewport.height / map.tileSize);
        // if (endRow > map.rows - 1) endRow = map.rows - 1;
        let offsetX = -gameState.viewport.x + startCol * map.tileSize;
        let offsetY = -gameState.viewport.y + startRow * map.tileSize;
        for (let c = startCol; c <= endCol; c++) {
            for (let r = startRow; r <= endRow; r++) {
                let tile = map.getTile(c, r);
                let x = (c - startCol) * 16 + offsetX;
                let y = (r - startRow) * 16 + offsetY;
                if (tile && c >= 0 && c < map.cols && r >= 0 && r < map.rows) {
                    bCtx.drawImage(sprites, 0, 0, spriteSize, spriteSize, x, y, spriteSize, spriteSize);
                }
            }
        }

        bCtx.font = "10px sans-serif";
        bCtx.fillStyle = "rgb(240, 240, 240)";
        bCtx.fillText("Mouse: " + mouse.x + ", " + mouse.y + " Player: " + gameState.players[0].x + ", " + gameState.players[0].y, 5, 10);

        gameState.players.forEach(player => {
            renderPlayer(player);
            player.projectiles.forEach(projectile => {
                renderProjectile(projectile);
            });
        });

        blit();
    }

    function renderPlayer(player) {
        // Render player sprite
        bCtx.fillStyle = "rgb(255, 255, 0)";
        bCtx.fillRect(player.screen.x, player.screen.y, spriteSize, spriteSize);
        // Display name
        bCtx.font = "12px sans-serif";
        bCtx.fillStyle = "rgb(240, 240, 240)";
        bCtx.fillText(player.username, player.screen.x - (bCtx.measureText(player.username).width / 2) + (spriteSize / 2), (player.screen.y - spriteSize - 6));
        // Display health
        bCtx.fillStyle = "rgb(255, 0, 0)";
        bCtx.fillRect(player.screen.x - spriteSize / 2, player.screen.y - spriteSize, spriteSize * 2, 4);
    }
    
    function renderProjectile(p) {
        let px = p.x - gameState.viewport.x;
        let py = p.y - gameState.viewport.y;
        if (px < 0 || px > gameWidth - 1 || py < 0 || py > gameHeight - 1) return;
        bCtx.fillStyle = "rgb(255, 255, 255)";
        bCtx.fillRect(px - 2, py - 2, 4, 4);
    }

    function loop(timestamp) {
        gameUpdate();
        gameRender();
        requestAnimationFrame(loop);
    }

    /**
     * Client module init
     */
    function init() {
        // socket = io({ upgrade: false, transports: ["websocket"] });
        // buttons = document.getElementsByTagName("button");
        // message = document.getElementById("message");
        // score = document.getElementById("score");
        // disableButtons();
        
        bind();
        
        resizeCanvas();

        gameState.viewport.following = gameState.players[0];
        
        sprites.onload = function() {
            document.getElementById("menu").style.display = "none";
            document.body.appendChild(canvas);
            // document.getElementById("container").appendChild(canvas);
            requestAnimationFrame(loop);
        }
        sprites.src = "./sprites.png";

    }

    document.querySelector("form").addEventListener("submit", e => {
        e.preventDefault();
        gameState.players[0].username = document.getElementById("username").value;
        // console.log(gameState);
        init();
    });

    //window.addEventListener("load", init, false);

// })();
