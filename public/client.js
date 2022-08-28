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
    let connected;
    let chat = {
        active: false,
        chats: [],
        txt: ""
    };
    let fps = 120;
    let oldTimeStamp = 0;
    let respawnTime = 0;
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
    const projectileSpeed = 2;
    const spriteSize = 16;
    const projectileSize = 5;
    const maxRunes = 12;
    const startBounces = 10;

    let items = [];
    const msg = {txt: "", time: 0};
    const scrolls = ["","ricochet","split shot","double damage","runic hex"];
    const respawnPoints = [{x: 80, y: 64},{x: 416, y: 64},{x: 80, y: 416},{x: 416, y: 416}];

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
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
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
            if (x < 0 || x > this.cols * this.tileSize || y < 0 || y > this.rows * this.tileSize) return;
            let tile = this.getTile(Math.floor(x / this.tileSize), Math.floor(y / this.tileSize));
            return (tile < 1 || tile > 4) ? false : true;
        },
        getSourceCoords: function(tile) {
            if (tile > 0 && tile < 5) return {x: tile * this.tileSize, y: this.tileSize * 2};

            // Left wall
            if (tile == 4 + 4) return {x: 0, y: 48};
            // Right wall
            if (tile == 2 + 4) return {x: 32, y: 48};
            // Bottom wall
            if (tile == 1 + 4) return {x: 16, y: 48};
            // Top wall
            if (tile == 8 + 4) return {x: 64, y: 48};
            
            // Floor at top and left
            if (tile == 3 + 4) return {x: 80, y: 32};
            // Floor at top and right
            if (tile == 5 + 4) return {x: 0, y: 32};
            // Floor at bottom and right
            if (tile == 12 + 4) return {x: 80, y: 48};
            // Floor bottom and left
            if (tile == 10 + 4) return {x: 48, y: 48};
            
            // Floor bottom right
            if (tile == 128 + 4) return {x: 0, y: 48};
            if (tile == 64 + 4) return {x: 32, y: 48};
        }
    }

    // Update map to set tiles to use
    for (let i = 0; i < map.tiles.length; i++) {
        if (map.tiles[i] == 0) {
            // Set based on surrounding tiles
            let bitMask = 0;
            let mapX = i % map.cols;
            let mapY = Math.floor(i / map.cols); 
            // Greater than 0, less than 5 is a floor tile
            if (Math.abs(map.getTile(mapX, mapY - 1) - 2.5) < 2.5) bitMask += 1;
            if (Math.abs(map.getTile(mapX, mapY + 1) - 2.5) < 2.5) bitMask += 8;
            if (Math.abs(map.getTile(mapX - 1, mapY) - 2.5) < 2.5) bitMask += 2;
            if (Math.abs(map.getTile(mapX + 1, mapY) - 2.5) < 2.5) bitMask += 4;

            if (bitMask == 0) {
                if (Math.abs(map.getTile(mapX - 1, mapY + 1) - 2.5) < 2.5) bitMask = 64;
                if (Math.abs(map.getTile(mapX + 1, mapY + 1) - 2.5) < 2.5) bitMask = 128;
            }
            if (bitMask > 0) map.tiles[i] = bitMask + 4;
        } else if (map.tiles[i] == 1)  {
            // Set this tile to a random floor tile
            map.tiles[i] = Math.floor(Math.random() * 4) + 1;
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
                hit: 0,
                // vx: 0,
                // vy: 0,
                // a: 1.05,
                // maxV: 1,
                // friction: 0.97,
                // color: '#ae83c3',
                scroll: 0, // which magic scroll is active
                health: 100,
                facing: 1,
                frame: 0,
                walking: 0,
                angle: 0,
                projectiles: [],
                runes: []
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

    var rotateVector = function(vec, ang) {
        ang = -ang * (Math.PI/180);
        var cos = Math.cos(ang);
        var sin = Math.sin(ang);
        return new Array(Math.round(10000*(vec[0] * cos - vec[1] * sin))/10000, Math.round(10000*(vec[0] * sin + vec[1] * cos))/10000);
    };

    /**
     * Bind Socket.IO and events
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

        socket = io({'sync disconnect on unload': true, upgrade: false, transports: ["websocket"] });

        // We have connected so set our sessionId as our socket.id
        socket.on('connect', function() {
            console.log("Connected: " + socket.id);
            connected = true;
            gameState.players[0].sessionId = socket.id;
        });

        socket.on('playerDisconnect', function(sessionId) {
            // gameState.players[0].sessionId = socket.sessionid;
            console.log("Player disconnected: " + sessionId);
            for (let i = 0; i < gameState.players.length; i++) {
                if (gameState.players[i].sessionId == sessionId) gameState.players.splice(i, 1);
            }
        });

        socket.on('chat', function (updateChat) {
            chat.chats = updateChat;
        });

        socket.on('stateUpdate', function (player, updateItems) {
            items = updateItems;

            if (player.playerId === myPlayerId) {
                // ignore own update
                return;
            }

            let playerWasFound = false;
            for (let i = 0; i < gameState.players.length; ++i) {
                if (gameState.players[i].playerId === player.playerId) {
                    //gameState.players[i] = player;
                    // Update player object without losing references to it
                    gameState.players[i] = Object.assign(gameState.players[i], player);

                    // if (gameState.players.length > 1) gameState.viewport.following = gameState.players[1];
                    
                    playerWasFound = true;
                    break;
                }
            }
            
            if (!playerWasFound) {
                // New player
                gameState.players.push(player);
                // gameState.viewport.following = gameState.players[1];
            }
        });

        document.addEventListener("keydown", e => {
            if (!chat.active) keyboardState[e.key] = true;
            // if (keyboardState.w || keyboardState.a || keyboardState.s || keyboardState.d || keyboardState.ArrowLeft || keyboardState.d || keyboardState.ArrowRight || keyboardState.ArrowUp || keyboardState.ArrowDown) {
            //     e.stopPropagation();
            //     e.preventDefault();
            // }
        });
        
        document.addEventListener("keyup", e => {
            if (chat.active) {
                let regex = /^[A-Za-z0-9\s]$/;
                if (e.key.match(regex)) {
                    if (chat.txt.length < 20) chat.txt = chat.txt + e.key;
                }
                if (e.key == "Escape") chat.active = false;
                if (e.key == "Backspace" && chat.txt.length) chat.txt = chat.txt.substring(0, chat.txt.length - 1);
                if (e.key == "Enter") {
                    if (chat.txt.length) {
                        socket.emit("chat", gameState.players[0].username + ": " + chat.txt);
                        chat.active = false;
                        chat.txt = "";
                    } else {
                        chat.active = false;
                    }
                }
            } else {
                if (e.key == "Enter") {
                    chat.active = true;
                } else {
                    keyboardState[e.key] = false;
                }
            }
        });
    
        document.addEventListener("mousemove", e => {
            mouse.x = Math.round((e.clientX - canvas.getBoundingClientRect().left) / scale);
            mouse.y = Math.round((e.clientY - canvas.getBoundingClientRect().top) / scale);
            // angle = math.atan2(y2 - y1, x2 - x1) * 180 / math.pi;
            // Show name and health only when hovered?
            // gameState.players.forEach(player => {
            // });
            // Face player based on mouse position
            gameState.players[0].facing = (mouse.x < gameWidth / 2) ? 0 : 1;

        });
    
        document.addEventListener("mousedown", e => {
            if (e.buttons != 1 || gameState.players[0].health <= 0) return; // LMB is 1
            // If rune scroll
            if (gameState.players[0].scroll == 4) {
                let runeX = gameState.viewport.x + mouse.x;
                let runeY = gameState.viewport.y + mouse.y;
                runeX -= runeX % map.tileSize;
                runeY -= runeY % map.tileSize;

                // Don't allow runes to be placed will immediate collision
                for (let j = 1; j < gameState.players.length; j++) {
                    if (rectCollision(gameState.players[j].x, gameState.players[j].y, spriteSize, spriteSize,runeX, runeY, spriteSize, spriteSize)) {
                        return;
                    }
                }

                // Only place runes on floor tiles
                if (map.canMoveToXY(runeX, runeY)) {
                    console.log(runeX, runeY);
                    if (gameState.players[0].runes.length >= maxRunes) gameState.players[0].runes.splice(0, 1);
                    gameState.players[0].runes.push({x: runeX, y: runeY});
                }
            }

            // Distance from mouse click to center of player sprite
            let dx = mouse.x - (gameState.players[0].x - gameState.viewport.x) + spriteSize / 2 - spriteSize;
            let dy = mouse.y - (gameState.players[0].y - gameState.viewport.y) + spriteSize / 2 - spriteSize;

            let mag = Math.sqrt(dx * dx + dy * dy);
            dx = dx / mag;
            dy = dy / mag;
            
            // console.log(Math.atan2(dy, dx) * 180 / Math.PI);
            // console.log(Math.atan2(dy, dx));
            gameState.players[0].angle = Math.atan2(dy, dx);
            if (gameState.players[0].angle < 0) gameState.players[0].angle = Math.PI + (Math.PI + gameState.players[0].angle);

            // console.log(dx/mag, dy/mag, mag);
            const projectile = {
                x: gameState.players[0].x + spriteSize / 2 - projectileSize / 2 + Math.floor(dx * 10),
                y: gameState.players[0].y + spriteSize / 2 - projectileSize / 2 + Math.floor(dy * 10),
                vx: dx * projectileSpeed,
                vy: dy * projectileSpeed,
                // vx: 0,
                // vy: 0,
                angle: gameState.players[0].angle,
                bounces: startBounces
            }

            if (gameState.players[0].scroll != 4) gameState.players[0].projectiles.push(projectile);
            
            // If player has the split shot magic scroll
            if (gameState.players[0].scroll == 2) {
                let multi = rotateVector([dx, dy], 10);
                gameState.players[0].projectiles.push({x: projectile.x, y: projectile.y, vx: multi[0] * projectileSpeed, vy: multi[1] * projectileSpeed, bounces: 0});
                multi = rotateVector([dx, dy], -10);
                gameState.players[0].projectiles.push({x: projectile.x, y: projectile.y, vx: multi[0] * projectileSpeed, vy: multi[1] * projectileSpeed, bounces: 0});
            }
        });

        window.addEventListener("resize", e => {
            resizeCanvas();
        });

        addEventListener("pagehide", e => {
            socket.disconnect();
        });

        // document.addEventListener("visibilitychange", () => {
        //     if (document.visibilityState !== 'visible') {
        //         // Disconnect?
        //     }
        // });
    }

    function playerHit(player, attacker) {
        if (player.health <= 0) return;
        player.hit = 20;
        player.health -= (attacker.scroll == 3) ? 20 : 10;
        if (player.health <= 0) {
            player.health = 0;
            respawnTime = Date.now();
            if (gameState.players.indexOf(attacker) == 0) {
            // if (gameState.players[0].pwned.length) {
                msg.txt = "Pwnage! " + player.username + " is out for the count!";
                msg.time = Date.now();
                // gameState.players[0].pwned = "";
            }
            if (gameState.players.indexOf(player) == 0) {
                msg.txt = "Oh no! " + attacker.username + " just pwned you!";
                msg.time = Date.now();
            }
        }
    }

    function rectCollision(rect1x, rect1y, rect1w, rect1h, rect2x, rect2y, rect2w, rect2h) {
        return (
            rect1x < rect2x + rect2w &&
            rect1x + rect1w > rect2x &&
            rect1y < rect2y + rect2h &&
            rect1h + rect1y > rect2y
        );
    }

    function gameUpdate() {
        // Update projectiles
        // gameState.players.forEach(player => {
        for (let i = 0; i < gameState.players.length; i++) {
            gameState.players[i].projectiles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                // Check for collision with players
                for (let j = 0; j < gameState.players.length; j++) {
                    // if (i == j && gameState.players[j].scroll != 1 && p.bounces == startBounces) continue; // Don't check own projectiles unless it's ricochet
                    if (i == j) continue; // Don't check own projectiles unless it's ricochet
                    if (p.x < gameState.players[j].x + spriteSize
                        && p.x + projectileSize > gameState.players[j].x
                        && p.y < gameState.players[j].y + spriteSize
                        && projectileSize + p.y > gameState.players[j].y) {
                        p.remove = true;
                        playerHit(gameState.players[j], gameState.players[i]);
                    }
                }
                // Check for collision with walls
                if (!map.canMoveToXY(p.x, p.y) || !map.canMoveToXY(p.x + projectileSize, p.y) || !map.canMoveToXY(p.x, p.y + projectileSize) || !map.canMoveToXY(p.x + projectileSize, p.y + projectileSize)) {
                    // If player has magic scroll 1 and the projectile still has bounces left
                    if (gameState.players[i].scroll == 1 && --p.bounces) {
                        if (p.vx > 0) {
                            if (!map.canMoveToXY(p.x, p.y) || !map.canMoveToXY(p.x, p.y + projectileSize)) {
                                p.vy *= -1;
                            } else {
                                p.vx *= -1;
                            }
                        } else {
                            if (!map.canMoveToXY(p.x + projectileSize, p.y) || !map.canMoveToXY(p.x + projectileSize, p.y + projectileSize)) {
                                p.vy *= -1;
                            } else {
                                p.vx *= -1;
                            }
                        }
                    } else {
                        p.remove = true;
                    }
                }
            });
            gameState.players[i].projectiles = gameState.players[i].projectiles.filter(p => {
                return (p.remove !== true);
            });
            // Collision with runes
            gameState.players[i].runes.forEach(r => {
                for (let j = 0; j < gameState.players.length; j++) {
                    if (i == j) continue; // Don't check own runes
                    if (rectCollision(gameState.players[j].x, gameState.players[j].y, spriteSize, spriteSize, r.x, r.y, spriteSize, spriteSize)) {
                        playerHit(gameState.players[j], gameState.players[i]);
                        r.remove = true;
                    }
                }
            });
            gameState.players[i].runes = gameState.players[i].runes.filter(r => {
                return (r.remove !== true);
            });
        // });
        }

        // Check for player collision with item
        let itemIdClaimed = -1;
        for (let i = 0; i < items.length; i++) {
            // We picked up an item
            if (rectCollision(gameState.players[0].x, gameState.players[0].y,spriteSize, spriteSize, items[i].x, items[i].y, spriteSize, spriteSize)) {
                // Potion
                if (items[i].type == 1) {
                    gameState.players[0].health = Math.min(gameState.players[0].health + 50, 100);
                    msg.txt = "Potion restores health";
                    msg.time = Date.now();
                }
                // Scroll
                else if (items[i].type > 1) {
                    gameState.players[0].scroll = items[i].type - 1;
                    msg.txt = "You picked up a scroll of " + scrolls[items[i].type - 1];
                    msg.time = Date.now();
                }
                items[i].type = 0;
                itemIdClaimed = items[i].id;
            }
        }

        let p = gameState.players[0];
        if (p.health > 0) {
            // Move player - we are always the first element in our players array
            p.walking = 0;
            if ((keyboardState.w || keyboardState.ArrowUp) && map.canMoveToXY(p.x, p.y - playerSpeed) && map.canMoveToXY(p.x + spriteSize - 1, p.y - playerSpeed)){
                p.y -= playerSpeed;
                p.walking = 1;
            }
            
            if ((keyboardState.a || keyboardState.ArrowLeft) && map.canMoveToXY(p.x - playerSpeed, p.y) && map.canMoveToXY(p.x - playerSpeed, p.y + spriteSize - 1)) {
                p.x -= playerSpeed;
                p.walking = 1;
            }
                
            if ((keyboardState.s || keyboardState.ArrowDown) && map.canMoveToXY(p.x, p.y + playerSpeed + spriteSize - 1) && map.canMoveToXY(p.x + spriteSize - 1, p.y + playerSpeed + spriteSize - 1)) {
                p.y += playerSpeed;
                p.walking = 1;
            }
                
            if ((keyboardState.d || keyboardState.ArrowRight) && map.canMoveToXY(p.x + playerSpeed + spriteSize - 1, p.y) && map.canMoveToXY(p.x + playerSpeed + spriteSize - 1, p.y + spriteSize - 1)) {
                p.x += playerSpeed;
                p.walking = 1;
            }

            // Move to the next walking frame or idle
            p.frame = (p.frame < 3 && p.walking) ? p.frame += 0.075 : 0;
        }

        // Move viewport offset to follow player
        gameState.viewport.x = gameState.viewport.following.x - (gameWidth / 2) + spriteSize / 2;
        gameState.viewport.y = gameState.viewport.following.y - (gameHeight / 2) + spriteSize / 2;

        // Update the server with the new state
        if (connected) socket.volatile.emit('stateUpdate', gameState.players[0], itemIdClaimed);
    }

    function gameRender() {
        bCtx.fillStyle = "rgb(2, 2, 2)";
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
                // console.log(tile, c, r);
                let s = map.getSourceCoords(tile);
                let x = (c - startCol) * 16 + offsetX;
                let y = (r - startRow) * 16 + offsetY;
                if (typeof s !== 'undefined' && tile && c >= 0 && c < map.cols && r >= 0 && r < map.rows) {
                    bCtx.drawImage(sprites, s.x, s.y, spriteSize, spriteSize, x, y, spriteSize, spriteSize);
                }
            }
        }

        // bCtx.font = "10px sans-serif";
        // bCtx.fillStyle = "rgb(240, 240, 240)";
        // bCtx.fillText("Mouse: " + mouse.x + ", " + mouse.y + " Player: " + gameState.players[0].x + ", " + gameState.players[0].y, 5, 10);

        // Render players and their projectiles
        gameState.players.forEach(player => {
            // Render the runes
            player.runes.forEach(rune => {
                bCtx.drawImage(sprites, 64, 16, spriteSize, spriteSize, rune.x - gameState.viewport.x, rune.y - gameState.viewport.y, spriteSize, spriteSize);
            });
            // Render the character
            renderPlayer(player);
            // Render the projectiles
            player.projectiles.forEach(projectile => {
                renderProjectile(projectile);
            });
        });

        // Render items
        // console.log(items);
        items.forEach(item => {
            if (!item.type) return; // No item at spawn point
            let d = {x: 32, y: 16}; // Scroll
            if (item.type == 1) d.x = 48; // Potion
            bCtx.drawImage(sprites, d.x, d.y, spriteSize, spriteSize, item.x - gameState.viewport.x, item.y - gameState.viewport.y, spriteSize, spriteSize);
        });

        if (msg.txt) {
            if (Date.now() > msg.time + 3000) msg.txt = "";
            write(msg.txt, gameWidth / 2, 5, '#fff', 1, 1);
        };
        
        // Render chat dialog
        if (chat.active) {
            write("Chat: " + chat.txt, 2, 15, '#fff', 1);
        }

        // Render chats
        if (chat.chats && chat.chats.length) {
            for (let i = 0; i < chat.chats.length; i++) { 
                write(chat.chats[chat.chats.length - 1 - i], 2, 174 - i * 7, '#fff', 1);
            }
        }

        renderStats();

        blit();
    }

    function write(txt = '', x = 100, y = 0, color = 'rgb(255,255,255)', size = 2, center = 0) {
        txt = String(txt).toUpperCase();
        size *= 5;
        const height = 5;
        const pixelSize = size/height;
        const chars = [...Array(33),29,,,,,,12,,,,"ᇄ",3,"ႄ",1,1118480,"縿",31,"庽","嚿","炟","皷","纷","䈟","线","皿",17,,,"⥊",,"䊼",,"㹏","纮","縱","縮","纵","纐","񴚦","粟","䟱","丿",1020241,"簡",33059359,1024159,"縿","纜","񼙯","繍","皷","䏰","簿",25363672,32541759,18157905,"惸",18470705,,,,,"С",];
        let totalWidth = 0;
        let output = [];

        totalWidth = [...txt].reduce((charX, char) => {
            const fontCode = chars[char.charCodeAt()] || '';
            const binaryChar = (fontCode > 0) ? fontCode : fontCode.codePointAt();
            const binary = (binaryChar || 0).toString(2);
            const width = Math.ceil(binary.length / height);
            // totalWidth += width + 1;
            const marginX = charX + pixelSize;
            
            const formattedBinary = binary.padStart(width * height, 0);
            const binaryCols = formattedBinary.match(new RegExp(`.{${height}}`, 'g'));

            binaryCols.map((column, colPos) =>
                [...column].map((pixel, pixPos) => {
                    // bCtx.fillStyle = !+pixel ? 'transparent' : color;
                    // bCtx.fillRect(x + marginX + colPos * pixelSize, y + pixPos * pixelSize, pixelSize, pixelSize);
                    if (pixel == 1) output.push({fill: color, rectX: x + marginX + colPos * pixelSize, rectY: y + pixPos * pixelSize, pixelSize});
                })
            );
            return charX + (width+1)*pixelSize;
        }, 0);

        const xOffset = (center) ? Math.floor(((totalWidth) / 2)) : 0;
        output.forEach(char => {
            bCtx.fillStyle = char.fill;
            bCtx.fillRect(char.rectX - xOffset, char.rectY, pixelSize, pixelSize);
        });
    }

    function renderStats() {
        bCtx.fillStyle = "rgba(02, 02, 02, 0.7)";
        bCtx.fillRect(0, 0, 41, 14);
        bCtx.drawImage(sprites, 80, 0, 11, 10, 1, 2, 11, 10);
        write(gameState.players[0].health, 14, 2, '#fff', 2);
    }
    
    function respawn(player) {
        if (gameState.players.indexOf(player) !== 0) return;
        const now = Date.now();
        let t = 3;
        if (now - respawnTime > 1000) t = 2;
        if (now - respawnTime > 2000) t = 1;
        if (now - respawnTime > 3000) t = 0;
        if (t) {
            write("Respawn in... " + ((t == 1) ? " " + t : t), gameWidth / 2, gameHeight / 5, '#fff', 2, 1);
            // console.log("Respawn in " + t);
        } else {
            // console.log("Respawn");
            const r = Math.floor(Math.random() * 3);
            player.health = 100;
            player.scroll = 0;
            player.hit = 0;
            player.x = respawnPoints[r].x;
            player.y = respawnPoints[r].y;
        }
    }
    
    function renderPlayer(player) {
        // Render player sprite
        // bCtx.fillStyle = "rgb(255, 255, 0)";
        // bCtx.fillRect(player.x - gameState.viewport.x, player.y - gameState.viewport.y, spriteSize, spriteSize);
        
        if (player.health <= 0) {
            bCtx.drawImage(sprites, 0, spriteSize, spriteSize, spriteSize, player.x - gameState.viewport.x, player.y - gameState.viewport.y, spriteSize, spriteSize);
            respawn(player);
        } else {
            // Flip the player sprite if it is facing left
            bCtx.save();
            if (player.facing == 0) {
                bCtx.translate((player.x - gameState.viewport.x) * 2 + spriteSize, 0);
                bCtx.scale(-1, 1);
            }
            
            let dx = Math.floor(player.frame) * spriteSize;
            let dy = 0;
            if (player.hit) {
                player.hit -= 1;;
                dx = spriteSize;
                dy = spriteSize;
            }
            bCtx.drawImage(sprites, dx, dy, spriteSize, spriteSize, player.x - gameState.viewport.x, player.y - gameState.viewport.y, spriteSize, spriteSize);
            bCtx.restore();
        }
        
        if (gameState.players.indexOf(player) > 0) {
            // Display name
            write(player.username, player.x - gameState.viewport.x + spriteSize / 2, player.y - gameState.viewport.y - spriteSize, '#fff', 1, true);
            // bCtx.font = "12px sans-serif";
            // bCtx.fillStyle = "rgb(240, 240, 240)";
            // bCtx.fillText(player.username, player.x - gameState.viewport.x - (bCtx.measureText(player.username).width / 2) + (spriteSize / 2), (player.y - gameState.viewport.y - spriteSize - 6));

            // Display health
            bCtx.fillStyle = "rgb(0, 0, 0)";
            bCtx.fillRect(player.x - gameState.viewport.x - spriteSize / 2 - 1, player.y - gameState.viewport.y - spriteSize / 2 - 1, spriteSize * 2 + 2, 5);
            bCtx.fillStyle = "rgb(255, 0, 0)";
            bCtx.fillRect(player.x - gameState.viewport.x - spriteSize / 2, player.y - gameState.viewport.y - spriteSize / 2, (spriteSize * 2) / 100 * player.health, 3);
        }
    }

    function renderProjectile(p) {
        let px = p.x - gameState.viewport.x;
        let py = p.y - gameState.viewport.y;
        if (px < 0 || px > gameWidth - 1 || py < 0 || py > gameHeight - 1) return;

        // bCtx.fillStyle = "rgb(255, 255, 255)";
        // bCtx.fillRect(px - 2, py - 2, 4, 4);
        
        // let dots = 5;
        // for (let x = 0; x < 18; x++) {
        //     // for (let y = 0; y < 3; y++) {
        //         // if (x % 6 == 0 ) {
        //         //     // console.log(x);
        //         //     bCtx.fillStyle = "rgb(0, 255, 0)";
        //         //     dots--;
        //         // } else {
        //         //     let r = Math.floor(Math.random() * 3);
        //         //     if (r == 0) bCtx.fillStyle = "rgb(255, 51, 0)";
        //         //     if (r == 1) bCtx.fillStyle = "rgb(255, 204, 0)";
        //         //     if (x == 10) bCtx.fillStyle = "rgb(255, 255, 255)";
        //         // }
        //         // console.log(bCtx.fillStyle,px + (x % 3), py + Math.floor(x / 6));
        //         let r = Math.floor(Math.random() * 3);
        //         if (x == r) {
        //             bCtx.fillStyle = "rgb(255, 51, 0)";
        //         } else {
        //             bCtx.fillStyle = "rgb(255, 255, 255)";
        //         }
        //         if (x == 13) bCtx.fillStyle = "rgb(255, 0, 0)";
        //         bCtx.fillRect(px + Math.floor(x / 3), py + (x % 3), 1, 1);
        //     // }
        // }

        // Rotatable projectile
        // bCtx.save();
        // bCtx.translate(px + (spriteSize / 2), py + (spriteSize / 2));
        // bCtx.rotate(p.angle);
        // bCtx.translate(- px + (spriteSize / 2), - py + (spriteSize / 2));
        // bCtx.drawImage(sprites, 64, 0, spriteSize, spriteSize, px - spriteSize, py - spriteSize, spriteSize, spriteSize);
        // bCtx.restore();

        // bCtx.drawImage(sprites, 16, 16, spriteSize, spriteSize, px, py, spriteSize, spriteSize);
        bCtx.drawImage(sprites, 64, 0, 5, 5, px, py, 5, 5);
    }

    function loop(timestamp) {
        let elapsed = timestamp - oldTimeStamp;
        let fpsInterval = 1000 / fps;
        if (elapsed > Math.floor(fpsInterval)) {
            oldTimeStamp = timestamp;
            gameUpdate();
            gameRender();
        }
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
