"use strict";

// (function () {

    let socket;
    let connected;
    let titleScreen = !0;
    let drips = [];
    let chat = {
        active: false,
        chats: [],
        txt: ""
    };
    let fps = 60;
    let oldTimeStamp = 0;
    let prevMouseDown = Date.now();
    let respawnTime = 0;
    const gW = 320;
    const gH = 180;
    let scale;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("width", gW);
    canvas.setAttribute("height", gH);
    const ctx = canvas.getContext("2d");
    
    let bCanvas = document.createElement('canvas');
    bCanvas.width = gW;
    bCanvas.height = gH;
    const bCtx = bCanvas.getContext("2d");

    let cCanvas = document.createElement('canvas');
    cCanvas.width = gW;
    cCanvas.height = gH;
    const cCtx = cCanvas.getContext("2d");

    const keyboardState = {};
    const mouse = { x: 0, y: 0 };
    const playerSpeed = 2; // was 1 at 120 fps
    const projectileSpeed = 3; // was 2 at 120 fps
    const spriteSize = 16;
    const projectileSize = 5;
    const maxRunes = 8;
    const startBounces = 5;

    let flameFrame = 0;
    let flameSize = 5;
    let flameStretch = 1;
    let flameSkew = 0;

    let items = [];
    const msg = {txt: "", time: 0};
    const scrolls = ["fireball","ricochet","split shot","double damage","runic hex", "invisibility"];
    const respawnPoints = [{x: 16, y: 248},{x: 16, y: 304},{x: 480, y: 248},{x: 480, y: 304}];
    let clickTimeout = 0;

    const sounds = {
        // fire: ,
        // rune: ,
        // hit: ,
        // ouch: ,
        // dead: ,
        scroll: [1.01,,749,.1,.09,.14,1,1.03,,,100,.03,-0.02,,,,.11,.7,.07],
        potion: [1.03,,146,,.02,.12,1,.6,-8.6,-6.3,,,,,,,,.8,.02,.15],
    }

    let match = {
        duration: 180,
        startTime: 0,
        ended: !1,
        launchTime: 0,
    }

    let results = [];

    const messages = {
        matchLaunch: ""
    }

    const msg2 = {
        killed: {
            txt: "",
            time: 0
        }
    }

    const map = {
        cols: 32,
        rows: 35,
        tileSize: 16,
        wallOffset: 7, // Where the walls start in the tile type array
        tiles: [],
        hex: [
            '0', '7e000', '1ffff80', '1ffff80', '187e180', '7f87e1fe', '7f8001fe', '7f8001fe', '7ffffffe', '7ffffffe', '7ffffffe', '7f8181fe', '7f8181fe', 'c018030', 'c018030', '7ffffffe', '7ffffffe', '7ffffffe', '7ffffffe', '7ffffffe', 'c018030', 'c018030', '7f8181fe', '7f8181fe', '7ffffffe', '7ffffffe', '7ffffffe', '7f8001fe', '7f8001fe', '7f87e1fe', '187e180', '1ffff80', '1ffff80', '7e000', '0'
        ],
        getTile: function(col, row) {
            return this.tiles[row * this.cols + col];
        },
        canMoveToXY: function(x, y) {
            let tile = 0;
            if (x < 0 || x > this.cols * this.tileSize || y < 0 || y > this.rows * this.tileSize) return false;

            tile = this.getTile(Math.floor(x / this.tileSize), Math.floor((y + this.tileSize / 2) / this.tileSize));
            if (tile > 4 && tile < 8) return false;
            
            tile = this.getTile(Math.floor(x / this.tileSize), Math.floor(y / this.tileSize));
            return (tile < 1 || tile > this.wallOffset) ? false : true;
        },
        getSourceCoords: function(tile) {
            if (tile > 0 && tile < 5) return {x: tile * this.tileSize, y: this.tileSize * 2};

            if (tile == 5) return {x: 80, y: 16};
            if (tile == 6) return {x: 96, y: 48};
            if (tile == 7) return {x: 96, y: 16};

            // Left wall
            if (tile == 4 + this.wallOffset) return {x: 0, y: 48};
            // Right wall
            if (tile == 2 + this.wallOffset) return {x: 32, y: 48};
            // Bottom wall
            if (tile == 1 + this.wallOffset) return {x: 16, y: 48};
            // Top wall
            if (tile == 8 + this.wallOffset) return {x: 80, y: 0};
            
            // Floor at top and left
            if (tile == 3 + this.wallOffset) return {x: 80, y: 32};
            // Floor at top and right
            if (tile == 5 + this.wallOffset) return {x: 0, y: 32};
            // Floor at bottom and right
            if (tile == 12 + this.wallOffset) return {x: 96, y: 0};
            // Floor bottom and left
            if (tile == 10 + this.wallOffset) return {x: 96, y: 32};
            
            // Floor bottom right
            // if (tile == 128 + this.wallOffset) return {x: 0, y: 48};
            // if (tile == 64 + this.wallOffset) return {x: 32, y: 48};
        }
    }

    // Convert hex map data to binary
    map.hex.forEach(h => {
        map.tiles = map.tiles.concat(Array.from(parseInt(h, 16).toString(2).padStart(32, 0)));
    });

    // Update map to set tiles to use
    for (let i = 0; i < map.tiles.length; i++) {
        let mapX = i % map.cols;
        let mapY = Math.floor(i / map.cols);
        if (map.tiles[i] == 0) {
            // Set based on surrounding tiles
            let bitMask = 0; 
            // Greater than 0, less than 5 is a floor tile
            if (Math.abs(map.getTile(mapX, mapY - 1) - 2.5) < 2.5) bitMask += 1;
            if (Math.abs(map.getTile(mapX, mapY + 1) - 2.5) < 2.5) bitMask += 8;
            if (Math.abs(map.getTile(mapX - 1, mapY) - 2.5) < 2.5) bitMask += 2;
            if (Math.abs(map.getTile(mapX + 1, mapY) - 2.5) < 2.5) bitMask += 4;
            
            // if (bitMask == 0) {
            //     if (Math.abs(map.getTile(mapX - 1, mapY + 1) - 2.5) < 2.5) bitMask = 64;
            //     if (Math.abs(map.getTile(mapX + 1, mapY + 1) - 2.5) < 2.5) bitMask = 128;
            // }
            if (bitMask > 0) map.tiles[i] = bitMask + map.wallOffset;
        } else if (map.tiles[i] == 1)  {
            // Set this tile to a random floor tile
            map.tiles[i] = Math.floor(Math.random() * 4) + 1;
        }
    }
    
    // Turn floor tiles at the top into a wall tile
    for (let i = 0; i < map.tiles.length; i++) {
        if (map.tiles[i] > 4) continue;
        let mapX = i % map.cols;
        let mapY = Math.floor(i / map.cols);
        if (map.getTile(mapX, mapY - 1) == 8 + map.wallOffset) map.tiles[i] = 5;
        if (map.getTile(mapX, mapY - 1) == 10 + map.wallOffset) map.tiles[i] = 6;
        if (map.getTile(mapX, mapY - 1) == 12 + map.wallOffset) map.tiles[i] = 7;
    }

    let spriteSheet = new Image();
    let sprites;

    const gameState = {
        players: [
            {
                active: false,
                entryTime: 0,
                username: "",
                playerId: Math.floor(Math.random() * 100000000),
                sessionId: '',
                x: 0, // World x coordinate
                y: 0, // World y coordinate
                hit: 0, // A timer to count down from when player is hit
                scroll: 0, // Which magic scroll is active
                health: 100, // Player's health
                dead: !1, // Awaiting respawn
                lastHitBy: 0, // Player most recently hit by
                lastHitByScroll: 0, // Scroll most recently hit by
                facing: 1, // Direction facing: 0 for left, 1 for right
                frame: 0, // Current animation frame
                walking: 0, // 1 if player is currently walking, 0 if not
                angle: 0, // Angle to mouse: radians, clockwise, 0 to right
                frags: 0,
                deaths: 0,
                projectiles: [],
                runes: []
            }
        ],
        viewport: {
            following: {},
            x: 0,
            y: 0,
            width: gW,
            height: gH
        }
    }

    const p0 = gameState.players[0];
    const myPlayerId = p0.playerId;

    function resizeCanvas() {
        if (window.innerWidth < gW || window.innerHeight < gH) {
            canvas.width = gW;
            canvas.height = gH;
            scale = 1;
            return;
        }
        let ratio = gW / gH;
        let w = Math.floor(window.innerWidth / gW) * gW;
        let h = Math.floor(window.innerHeight / gH) * gH;
        if (h < w / ratio) {
            canvas.width = h * ratio;
            canvas.height = h;
        } else {
            canvas.width = w;
            canvas.height = w / ratio;
        }
        scale = canvas.width / gW;
        blit();
    }

    function blit() {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(bCanvas, 0, 0, bCanvas.width, bCanvas.height, 0, 0, canvas.width, canvas.height);
    }

    var rotateVector = function(vec, ang) {
        ang = -ang * (Math.PI/180);
        var cos = Math.cos(ang);
        var sin = Math.sin(ang);
        return new Array(Math.round(10000*(vec[0] * cos - vec[1] * sin))/10000, Math.round(10000*(vec[0] * sin + vec[1] * cos))/10000);
    };

    /**
     * Bind Socket.IO
     */
    function bindSocket() {

        socket = io({'sync disconnect on unload': true, upgrade: false, transports: ["websocket"] });

        // We have connected so set our sessionId as our socket.id
        socket.on('connect', function() {
            console.log("Connected: " + socket.id);
            connected = true;
            p0.sessionId = socket.id;
        });
        
        // socket.on('matchUpdate', function(newMatch) {
        //     match = Object.assign(match, newMatch);
        // });

        socket.on('playerDisconnect', function(sessionId) {
            console.log("Player disconnected: " + sessionId);
            for (let i = 0; i < gameState.players.length; i++) {
                if (gameState.players[i].sessionId == sessionId) {
                    // msg.txt = gameState.players[i].username + " left the dungeon";
                    // msg.time = Date.now();
                    socket.emit("chat", 1, gameState.players[i].username + " left the dungeon");
                    gameState.players.splice(i, 1);
                }
            }
        });

        socket.on('chat', function (updateChat) {
            chat.chats = updateChat;
        });

        socket.on('addFrag', function (id, username) {
            let i = gameState.players.findIndex(o => {
                return o.sessionId === id;
            });
            if (i != -1) gameState.players[i].frags += 1;
            if (i == 0) {
                msg2.killed.txt = "You killed " + username + "!";
                msg2.killed.time = Date.now();
            } 
        });

        socket.on('itemUpdate', function (updateItems) {
            items = updateItems;
        });

        socket.on('claimItem', function (type, id) {
            let i = gameState.players.findIndex(o => {
                return o.sessionId === id;
            });
            if (i == 0) {
                // Item claimed is a potion
                if (type == 1) {
                    zzfx(...sounds.potion);
                    p0.health = Math.min(p0.health + 50, 100);
                    msg.txt = "Potion restores health";
                    msg.time = Date.now();
                }
                // Item claimed is a scroll
                else if (type > 1) {
                    zzfx(...sounds.scroll);
                    p0.scroll = type - 1;
                    msg.txt = "You picked up a scroll of " + scrolls[type - 1];
                    msg.time = Date.now();
                    if (type == 6) socket.emit("chat", 2, p0.username + " just turned invisible");
                }
            }
        });

        socket.on('removeRunes', function (id) {
            let i = gameState.players.findIndex(o => {
                return o.sessionId === id;
            });
            if (i != -1) gameState.players[i].runes.length = 0;
        });

        socket.on('addRune', function (id, rune) {
            let i = gameState.players.findIndex(o => {
                return o.sessionId === id;
            });
            if (gameState.players[i].runes.length >= maxRunes) gameState.players[i].runes.splice(0, 1);
            gameState.players[i].runes.push(rune);
        });

        socket.on('addProjectile', function (id, projectile) {
            let i = gameState.players.findIndex(o => {
                return o.sessionId === id;
            });
            if (i != -1) gameState.players[i].projectiles.push(projectile);
        });
        
        socket.on('setMatchStatus', function (sessionId, newMatch) {
            let i = gameState.players.findIndex(o => {
                return o.sessionId === sessionId;
            });
            if (i ==0) match = Object.assign(match, newMatch);
        });
        
        socket.on('startMatch', function () {
            match.launchTime = Date.now();
        });

        socket.on('stateUpdate', function (player) {
            // Ignore own update
            if (player.playerId === myPlayerId) return;

            let playerWasFound = false;
            for (let i = 0; i < gameState.players.length; ++i) {
                if (gameState.players[i].playerId === player.playerId) {
                    // Remove runes and projectiles, they are handled separately
                    delete player.runes;
                    delete player.projectiles;
                    delete player.frags;
                    // Update player object without losing references to it
                    gameState.players[i] = Object.assign(gameState.players[i], player);
                    playerWasFound = true;
                    break;
                }
            }
            
            if (!playerWasFound) {
                // New player
                gameState.players.push(player);
                if (player.entryTime > p0.entryTime) {
                    // msg.txt = player.username + " entered the dungeon";
                    // msg.time = Date.now();
                    socket.emit("chat", 1, player.username + " entered the dungeon");
                    if (match.startTime == 0 && p0.entryTime > 0) {
                        socket.emit('startMatch');
                    }  
                }
            }
        });
    }

    /**
     * Bind events
     */
    function bindEvents() {
        document.addEventListener("keydown", e => {
            const reserveKeys = ["Tab"];
            let regex = /^[A-Za-z0-9\s\.\,\?\!\']$/;
            if (reserveKeys.includes(e.key) ) {
                e.stopPropagation();
                e.preventDefault();
            }
            if (chat.active) {
                if (e.key.match(regex)) {
                    if (chat.txt.length < 40) chat.txt = chat.txt + e.key;
                }
                if (e.key == "Escape" || e.key == "Tab") chat.active = false;
                if (e.key == "Backspace" && chat.txt.length) chat.txt = chat.txt.substring(0, chat.txt.length - 1);
                if (e.key == "Enter") {
                    if (chat.txt.length) {
                        // socket.emit("chat", p0.username + ": " + chat.txt);
                        socket.emit("chat", 0, chat.txt, p0.username);
                        chat.active = false;
                        chat.txt = "";
                    } else {
                        chat.active = false;
                    }
                }
            } else if (!p0.active) {
                if (e.key.match(regex)) {
                    if (p0.username.length < 11) p0.username += e.key;
                }
                if (e.key == "Backspace" && p0.username.length > 0) p0.username = p0.username.substring(0, p0.username.length - 1);
                if (e.key == "Enter" && p0.username.length) {
                    init();
                }
                renderTitle();
            } else {
                if (e.key == "Tab") {
                    chat.active = true;
                } else {
                    keyboardState[e.key] = true;
                }
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
            // gameState.players.forEach(player => {
            // });
            // Face player based on mouse position
            p0.facing = (mouse.x < gW / 2) ? 0 : 1;

        });
    
        document.addEventListener("mousedown", e => {
            // zzfx(...[,,20,.04,,.6,,1.31,,,-990,.06,.17,,,.04,.07])
            if (p0.dead && Date.now() > clickTimeout + 1000) {
                clickTimeout = 0;
                respawn();
            }
            if (match.ended && Date.now() > clickTimeout + 5000) {
            // if (match.ended) {
                console.log("click on ended");
                clickTimeout = 0;
                match.ended = !1;
                // p0.active = !0;
                // p0.entryTime = Date.now();
                join();
                respawn()
            }
            if (!p0.active || Date.now() < prevMouseDown + 100) return;
            prevMouseDown = Date.now();

            if (e.buttons != 1 || p0.health <= 0) return; // LMB is 1
            // If invisible
            if (p0.scroll == 5) p0.scroll = 0;
            // If rune scroll
            if (p0.scroll == 4) {
                let runeX = gameState.viewport.x + mouse.x;
                let runeY = gameState.viewport.y + mouse.y;
                runeX -= runeX % map.tileSize;
                runeY -= runeY % map.tileSize;

                // Don't allow runes to be placed with immediate collision
                for (let j = 1; j < gameState.players.length; j++) {
                    if (rectCollision(gameState.players[j].x, gameState.players[j].y, spriteSize, spriteSize,runeX, runeY, spriteSize, spriteSize)) {
                        return;
                    }
                }

                // Only place runes on floor tiles
                if (map.canMoveToXY(runeX, runeY)) {
                    zzfx(...[.2,0,267,.1,.06,,,1.49,4.3,-0.8,,,,2,,.3,.15,.52,.05]);
                    socket.emit("addRune", {x: runeX, y: runeY, remove: !1});
                }
            }

            // Distance from mouse click to center of player sprite
            let dx = mouse.x - (p0.x - gameState.viewport.x) + spriteSize / 2 - spriteSize;
            let dy = mouse.y - (p0.y - gameState.viewport.y) + spriteSize / 2 - spriteSize;

            let mag = Math.sqrt(dx * dx + dy * dy);
            dx = dx / mag;
            dy = dy / mag;
            
            // console.log(Math.atan2(dy, dx) * 180 / Math.PI);
            // console.log(Math.atan2(dy, dx));
            p0.angle = Math.atan2(dy, dx);
            if (p0.angle < 0) p0.angle = Math.PI + (Math.PI + p0.angle);

            // console.log(dx/mag, dy/mag, mag);
            const projectile = {
                x: p0.x + spriteSize / 2 - projectileSize / 2 + Math.floor(dx * 10),
                y: p0.y + spriteSize / 2 - projectileSize / 2 + Math.floor(dy * 10),
                vx: dx * projectileSpeed,
                vy: dy * projectileSpeed,
                angle: p0.angle,
                bounces: startBounces
            }

            // If not runic hex then emit projectile
            if (p0.scroll != 4) {
                // zzfx(...[.5,0,135,.01,.02,.01,2,1.44,1.3,,-50,.02,.01,,,.2,,.2,.07,.2]);
                zzfx(...[.2,0,192,,,.4,4,4,,.6,,,,.6,,.4,,.3,.1,.05]);
                socket.emit("addProjectile", projectile);
            }
            
            // If player has the split shot magic scroll add other shots
            if (p0.scroll == 2) {
                let multi = rotateVector([dx, dy], 10);
                socket.emit("addProjectile", {x: projectile.x, y: projectile.y, vx: multi[0] * projectileSpeed, vy: multi[1] * projectileSpeed, bounces: 0});
                multi = rotateVector([dx, dy], -10);
                socket.emit("addProjectile", {x: projectile.x, y: projectile.y, vx: multi[0] * projectileSpeed, vy: multi[1] * projectileSpeed, bounces: 0});
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

    function rectCollision(rect1x, rect1y, rect1w, rect1h, rect2x, rect2y, rect2w, rect2h) {
        return (
            rect1x < rect2x + rect2w &&
            rect1x + rect1w > rect2x &&
            rect1y < rect2y + rect2h &&
            rect1h + rect1y > rect2y
        );
    }

    function gameUpdate() {
        // Check for match starting
        if (match.launchTime > 0) {
            if (p0.entryTime > 0) socket.emit("matchUpdate", match);
            let countdown = 3 - Math.floor((Date.now() - match.launchTime) / 1000);
            messages.matchLaunch = "The match is about to begin... " + countdown;
            // Start the match
            if (Date.now() > match.launchTime + 3000) {
                messages.matchLaunch = "The match has begun!";
                if (p0.entryTime > 0) results.length = 0;
                match.launchTime = 0;
                match.startTime = Date.now();
                if (p0.entryTime > 0) socket.emit("matchUpdate", match);
                respawn();
                // match.running = !0;
                for (let i = 1; i < gameState.players.length; i++) {
                    gameState.players[i].frags = 0;
                    gameState.players[i].deaths = 0;
                }
            }
        }

        // Clear match launch message
        if (match.startTime > 0 && Date.now() > match.startTime + 3000) messages.matchLaunch = ""; 

        // Check for match end
        if (match.startTime > 0 && Date.now() > match.startTime + match.duration * 1000) {
            // match.running = !1;
            match.ended = !0;
            match.startTime = 0;
            if (p0.entryTime > 0) socket.emit("matchUpdate", match);
            clickTimeout = Date.now();
            if (p0.entryTime > 0) {
                results.length = 0;
                for (let i = 0; i < gameState.players.length; i++) {
                    // Temporarily save the match results
                    if (gameState.players[i].entryTime > 0) results.push({player: gameState.players[i].username, score: gameState.players[i].frags, deaths: gameState.players[i].deaths});
                }
            }
            for (let i = 0; i < gameState.players.length; i++) {
                // Set all players' entry times and runes to zero
                gameState.players[i].entryTime = 0;
                gameState.players[i].runes.length = 0;
            }
        }

        // Check if match should be launched
        if (!match.ended && match.startTime == 0 && match.launchTime == 0) {
            for (let i = 1; i < gameState.players.length; i++) {
                if (gameState.players[i].entryTime > 0 && gameState.players[i].entryTime > p0.entryTime) {
                    if (p0.entryTime > 0) socket.emit('startMatch');
                    break;
                }
            }
        }

        let p = p0;
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
            p.frame = (p.frame < 3 && p.walking == 1) ? p.frame += 0.075 : 0;
        }

        // Move viewport offset to follow player
        gameState.viewport.x = gameState.viewport.following.x - (gW / 2) + spriteSize / 2;
        gameState.viewport.y = gameState.viewport.following.y - (gH / 2) + spriteSize / 2;

        // Update projectiles
        for (let i = 0; i < gameState.players.length; i++) {
            gameState.players[i].projectiles.forEach(async p => {
                p.x += p.vx;
                p.y += p.vy;
                // Check for collision with players
                for (let j = 0; j < gameState.players.length; j++) {
                    if (i == j) continue; // Don't check own projectiles (TODO: unless it's ricochet?)
                    // if (gameState.players[j].scroll == 5 || gameState.players[j].health < 1) continue;
                    if (gameState.players[j].scroll == 5 || gameState.players[j].dead) continue;
                    if (p.x < gameState.players[j].x + spriteSize
                        && p.x + projectileSize > gameState.players[j].x
                        && p.y < gameState.players[j].y + spriteSize
                        && projectileSize + p.y > gameState.players[j].y) {
                        p.remove = true;
                        // await playerHit(gameState.players[j], gameState.players[i]);
                        // Player hit
                        gameState.players[j].hit = 10;
                        // zzfx(...[.5,0,260,.01,.04,.07,4,4.7,,,,,,.4,,.3,.12,.4,.05,.01]);
                        if (j != 0) zzfx(...[.3,0,260,,.1,.07,4,4.7,,,,,,.4,,.4,.12,.3,.02,.01]);
                        if (j == 0 && p0.health > 0) {
                            zzfx(...[.5,,499,,.15,.04,,1.47,4.5,-6.8,,,.17,.5,,.3,.13,.73,.04,.12]);
                            p0.health -= (gameState.players[i].scroll == 3) ? 20 : 10;
                            p0.lastHitBy = gameState.players[i].sessionId;
                            p0.lastHitByScroll = gameState.players[i].scroll;
                            // console.log(p0.health);
                        }
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
                    if (gameState.players[j].scroll == 5) continue;
                    if (rectCollision(gameState.players[j].x, gameState.players[j].y, spriteSize, spriteSize, r.x, r.y, spriteSize, spriteSize)) {
                        // if (!r.remove) playerHit(gameState.players[j], gameState.players[i]);
                        if (j == 0 && !r.remove && gameState.players[j].health > 0) {
                            gameState.players[j].health -= 20;
                            gameState.players[j].lastHitBy = gameState.players[i].sessionId;
                            gameState.players[j].lastHitByScroll = gameState.players[i].scroll;
                        }
                        zzfx(...[.3,0,260,,.1,.07,4,4.7,,,,,,.4,,.4,.12,.3,.02,.01]);
                        gameState.players[j].hit = 10;
                        if (!r.remove) r.remove = true;
                    }
                }
            });
            gameState.players[i].runes = gameState.players[i].runes.filter(r => {
                return (r.remove !== true);
            });
        }

        if (p0.health <= 0 && !p0.dead) {
            p0.dead = !0;
            let index = gameState.players.findIndex(o => {
                return o.sessionId === p0.lastHitBy;
            });

            if (index != -1) {
                let style = ["rekt", "fried", "zapped", "burned", "nuked", "wasted", "derezzed"];
                socket.emit("chat", 2, p0.username + " got " + style[Math.floor(Math.random() * style.length)] + " by " + gameState.players[index].username + "'s " + scrolls[p0.lastHitByScroll]);
                messages.killedBy = "You were killed by " + gameState.players[index].username + "!";
            }
            // zzfx(...[.4,0,808,.01,.5,.58,1,.7,,6.27,-50,.09,.17,,,,,.5]);
            // zzfx(...[.2,0,808,.01,.4,.35,1,.7,,6.27,-50,.04,.02,,,,,.8]);
            zzfx(...[.2,0,415,.01,.4,.35,1,.7,,6.27,-50,.04,.11,,,,,.5]); // Loaded Sound 402
            messages.respawn = "Press fire to respawn";
            clickTimeout = Date.now();
            socket.emit("removeRunes");
            socket.emit("addFrag", p0.lastHitBy, p0.username);
            p0.deaths++;
            if (match.launchTime == 0) respawnTime = Date.now();
        }

        // Check for player collision with item
        let itemIdClaimed = -1;
        for (let i = 0; i < items.length; i++) {
            // We picked up an item
            if (rectCollision(p0.x, p0.y,spriteSize, spriteSize, items[i].x, items[i].y, spriteSize, spriteSize)) {
                itemIdClaimed = items[i].id;
                if (connected) socket.emit('claimItem', itemIdClaimed, items[i].type);
                items[i].type = 0;
            }
        }

        // Update the server with the new state
        if (connected) socket.emit('stateUpdate', p0);
    }

    function gameRender() {
        bCtx.fillStyle = "rgb(2, 2, 2)";
        bCtx.fillRect(0, 0, canvas.width, canvas.height);

        // Render match end screen
        if (match.ended) {
            write("match results", gW / 2, 2, "#fff", 3 , 1);
            write("Player", 20, 32)
            write("Score", 200, 32)
            write("Deaths", 250, 32)
            results.sort((a,b) => {
                if (a.score == b.score) {
                    return a.deaths - b.deaths;
                } else {
                    return b.score - a.score;
                }
            });
            results.forEach((r, i) => {
                write(r.player, 20, 50 + i * 20);
                write(r.score, 220, 50 + i * 20);
                write(r.deaths, 270, 50 + i * 20);
            });
            if (Date.now() > clickTimeout + 5000) write("Press fire to enter the dungeon", gW / 2, 150, "#fff", 2 , 1); 
        } else {
            // Render floor and walls
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
                        if (tile == 7 || tile == 6) torchAt(x, y, r * map.cols + c);
                    }
                }
            }

            // Move the animation frame on for the torches
            flameFrame += 1;

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
            items.forEach(item => {
                if (item.type == 0) return; // No item at spawn point
                let d = {x: 32, y: 16}; // Scroll
                if (item.type == 1) d.x = 48; // Potion
                bCtx.drawImage(sprites, d.x, d.y, spriteSize, spriteSize, item.x - gameState.viewport.x, item.y - gameState.viewport.y, spriteSize, spriteSize);
            });

            // Render shading
            cCtx.drawImage(bCanvas, 0, 0, gW, gH, 0, 0, gW, gH);
            cCtx.globalAlpha = 0.2;
            cCtx.fillStyle = "rgb(0, 0, 0)";
            cCtx.fillRect(0, 0, gW, gH);
            cCtx.globalAlpha = 1;
            cCtx.save();
            cCtx.beginPath();
            for (let c = startCol - 3; c <= endCol + 3; c++) {
                for (let r = startRow - 3; r <= endRow + 3; r++) {
                    let x = (c - startCol) * 16 + offsetX;
                    let y = (r - startRow) * 16 + offsetY;
                    if (map.getTile(c, r) == 6 || map.getTile(c, r) == 7) {
                        cCtx.arc(Math.floor(x + map.tileSize / 2), Math.floor(y + 2 * map.tileSize), 2 * map.tileSize, 0, Math.PI * 2);
                        cCtx.closePath();
                    }
                }
            }
            cCtx.clip();
            cCtx.drawImage(bCanvas, 0, 0, gW, gH, 0, 0, gW, gH);
            cCtx.restore();
            bCtx.drawImage(cCanvas, 0, 0, gW, gH, 0, 0, gW, gH);

            // Render messages
            if (msg.txt) {
                if (Date.now() > msg.time + 3000) msg.txt = "";
                write(msg.txt, gW / 2, 5, '#fff', 1, 1);
            };

            if (match.launchTime == 0 && match.startTime == 0 && Date.now() > p0.entryTime + 1000) write("Waiting for other players", gW / 2 + 1, 140, '#05d', 2, 1);

            // Display match launch phase message
            if (messages.matchLaunch != "") {
                write(messages.matchLaunch, gW / 2, 140, '#05d', 2, 1);
            }

            if (messages.killedBy != "") {
                write(messages.killedBy, gW / 2, 20, '#f00', 1, 1);
            }

            if (Date.now() < msg2.killed.time + 3000) {
                write(msg2.killed.txt, gW / 2, 20, '#05d', 1, 1);
            }

            // Click to respawn message
            if (p0.dead && Date.now() > clickTimeout + 1000) {
                write(messages.respawn, gW / 2, 2, '#fff', 2, 1);
            }

            // Render match timer
            if (match.startTime > 0) {
                let s = Math.floor((Date.now() - match.startTime) / 1000);
                s = match.duration - s;
                if (s >= 0) { 
                    let m = Math.floor(s / 60);
                    s = s % 60;
                    write(m + ":" + ((s < 10) ? "0" + s : s), 290, 2);
                }
            }
        }
        
        // Render chat dialog
        if (chat.active) {
            let w = write("Chat: " + chat.txt, 2, 15, '#fff', 1);
            bCtx.fillStyle = "#fff";
            bCtx.fillRect(3 + w, 15, 3, 5);
        }

        // Render chats
        if (chat.chats && chat.chats.length) {
            let colors = ["#fd0", "#fff", "#0e0"];
            for (let i = 0; i < chat.chats.length; i++) {
                let chatTxt = chat.chats[chat.chats.length - 1 - i];
                let color = colors[chatTxt.slice(0, 1)[0]];
                write(chatTxt.slice(1), 0, 174 - i * 7, color, 1);
            }
        }

        if (!match.ended) {
            // Render stats
            bCtx.drawImage(sprites, 69, 0, 11, 10, 1, 2, 11, 10);
            write(p0.health, 14, 2, '#fff', 2);
        }

        // Crosshair
        bCtx.drawImage(sprites, 0, 16, 5, 5, mouse.x - 3, mouse.y - 3, 5, 5);

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
            const width = (fontCode == 31) ? 3 : Math.ceil(binary.length / height);
            const marginX = charX + pixelSize;
            const formattedBinary = binary.padStart(width * height, 0);
            const binaryCols = formattedBinary.match(new RegExp(`.{${height}}`, 'g'));
            binaryCols.map((column, colPos) =>
                [...column].map((pixel, pixPos) => {
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

        return totalWidth;
    }

    function respawn() {
        const player = p0;
        const r = Math.floor(Math.random() * 3);
        player.health = 100;
        player.dead = !1;
        player.scroll = 0;
        player.hit = 0;
        player.x = respawnPoints[r].x;
        player.y = respawnPoints[r].y;
        messages.killedBy = "";
        messages.respawn = "";
        if (match.startTime == 0 || player.entryTime == 0) {
            player.frags = 0;
            player.deaths = 0;
        }
    }

    function renderPlayer(player) {
        // Don't display players who haven't entered the dungeon
        if (player.entryTime == 0) return;
        // Render player sprite
        // Dead
        if (player.health <= 0) {
            bCtx.drawImage(sprites, 0, 21, spriteSize, 11, player.x - gameState.viewport.x, player.y + 5 - gameState.viewport.y, spriteSize, 11);
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
            // If player is invisible
            if (player.scroll == 5) {
                bCtx.globalAlpha = (gameState.players.indexOf(player) == 0) ? 0.3 : 0;
            }
            bCtx.drawImage(sprites, dx, dy, spriteSize, spriteSize, player.x - gameState.viewport.x, player.y - gameState.viewport.y, spriteSize, spriteSize);
            bCtx.restore();
        }
        
        // Display opponents' names and health bars if they aren't invisible 
        if (gameState.players.indexOf(player) > 0 && player.scroll != 5) {
            // Display name
            write(player.username, player.x - gameState.viewport.x + spriteSize / 2, player.y - gameState.viewport.y - spriteSize, '#fff', 1, true);
            // Display health
            bCtx.fillStyle = "rgb(0, 0, 0)";
            bCtx.fillRect(player.x - gameState.viewport.x - spriteSize / 2 - 1, player.y - gameState.viewport.y - spriteSize / 2 - 1, spriteSize * 2 + 2, 5);
            bCtx.fillStyle = "rgb(255, 0, 0)";
            bCtx.fillRect(player.x - gameState.viewport.x - spriteSize / 2, player.y - gameState.viewport.y - spriteSize / 2, Math.round((spriteSize * 2) / 100 * player.health), 3);
        }
    }

    function renderProjectile(p) {
        let px = p.x - gameState.viewport.x;
        let py = p.y - gameState.viewport.y;
        if (px < 0 || px > gW - 1 || py < 0 || py > gH - 1) return;

        // Rotatable projectile
        // bCtx.save();
        // bCtx.translate(px + (spriteSize / 2), py + (spriteSize / 2));
        // bCtx.rotate(p.angle);
        // bCtx.translate(- px + (spriteSize / 2), - py + (spriteSize / 2));
        // bCtx.drawImage(sprites, 64, 0, spriteSize, spriteSize, px - spriteSize, py - spriteSize, spriteSize, spriteSize);
        // bCtx.restore();

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

    function join() {
        p0.active = !0;
        p0.entryTime = Date.now();
        socket.emit("getMatchStatus");
    }

    function init() {
        titleScreen = !1;
        gameState.viewport.following = p0;
        // p0.active = !0;
        // p0.entryTime = Date.now();
        bindSocket();
        join();
        respawn();
        requestAnimationFrame(loop);
    }
    
    // function sinRange(a, min, max) {
    //     return ((max - min) * Math.sin(a) + max + min) / 2;
    // }

    function torchAt(x, y) {
        if (flameFrame > 10) { 
            flameStretch = (Math.floor(Math.random() * 6) + 6) / 10;
            flameSkew = (Math.floor(Math.random() * 3) - 1) / 5;
            flameFrame = 0;
        }
        // bCtx.drawImage(sprites, 96, 16, spriteSize, spriteSize, x, y, spriteSize, spriteSize);
        bCtx.drawImage(sprites, 64, 9, 7, 7, x + 4, y + 6, 7, 7);
        bCtx.save();
        bCtx.translate(x + flameSize, y + flameSize + 1);
        bCtx.transform(1, 0, flameSkew, flameStretch, 0, 0);
        bCtx.scale(1, -1);
        bCtx.drawImage(sprites, 75, 11, flameSize, flameSize, 0, 0, flameSize, flameSize);
        bCtx.setTransform(1, 0, 0, 1, 0, 0); // Reset
        bCtx.restore();
    }

    function renderTitle(timestamp) {
        // let elapsed = (timestamp - oldTimeStamp) / 1000;
        // return;
        bCtx.fillStyle = ("#000");
        bCtx.fillRect(0, 0, gW, gH);
        const x = [52, 64, 91, 100, 106, 112, 124, 145, 154, 166, 172, 184, 196, 202, 208, 217, 238, 250, 256, 262, 271];
        for (let i = 0; i < 14; i++) {
            // (Math.floor(Math.random() * 4) * 16) + 16
            bCtx.drawImage(sprites, 16, 32, spriteSize, spriteSize, 51 + i * spriteSize, 16, spriteSize, spriteSize);
        }
        bCtx.drawImage(sprites, 0, 0, spriteSize, spriteSize, 51, 16, spriteSize, spriteSize);
        bCtx.save();
        bCtx.translate((259) * 2 + spriteSize, 0);
        bCtx.scale(-1, 1);
        bCtx.drawImage(sprites, 0, 0, spriteSize, spriteSize, 259, 16, spriteSize, spriteSize);
        bCtx.restore();
        
        write("Deathmatch Dungeon", gW / 2, gH / 5, '#fff', 3, 1);
        write("Deathmatch Dungeon", gW / 2, gH / 5 + 2, '#666', 3, 1);
        write("Deathmatch Dungeon", gW / 2 + 1, gH / 5 + 1, '#dd0a1e', 3, 1);
        bCtx.fillStyle = "#aa0a1e";
        if (timestamp > oldTimeStamp + 1000) {
            if (Math.random() < 0.5) {
                let r = Math.floor(Math.random() * x.length);
                drips.push({x: x[r], y: gH / 5 + 1});
                if (Math.random() < 0.5) {
                    let r = Math.floor(Math.random() * x.length);
                    drips.push({x: x[r], y: gH / 5 + 1});
                }
            }
            oldTimeStamp = timestamp;
        }
        drips.forEach(drip => {
            if (drip.y > gH) drip.remove = !0; 
            if (drip.y < gH / 5 + 1 + 28) bCtx.fillRect(drip.x, gH / 5 + 1, 3, drip.y - gH / 5 + 1);
            bCtx.fillRect(drip.x, drip.y, 3, 3);
            drip.y += drip.y / 120;
        });
        drips = drips.filter(drip => {
            return (drip.remove !== true);
        });

        let w = write("Enter your name: " + p0.username, 49, 75, '#eee', 2, 0);
        bCtx.fillStyle = "#eee";
        bCtx.fillRect(w + 49 + 2, 75, 6, 10); // Cursor
        write("WASD/arrows to move, mouse to aim, click to shoot", 50, 120, '#eee', 1);
        write("Tab to chat", 50, 130, '#eee', 1);
        // Crosshair
        bCtx.drawImage(sprites, 0, 16, 5, 5, mouse.x - 3, mouse.y - 3, 5, 5);
        blit();
        if (titleScreen) requestAnimationFrame(renderTitle);
    }
    
    window.addEventListener("load", () => {
        bindEvents();
        document.body.appendChild(canvas);
        resizeCanvas();
        // Load sprite sheet and make #00f transparent
        spriteSheet.onload = async function() {
            bCtx.imageSmoothingEnabled = false;
            bCtx.drawImage(spriteSheet, 0, 0, 112, 64, 0, 0, 112, 64);
            const imageData = bCtx.getImageData(0, 0, 112, 64);
            for (let i = 0; i < imageData.data.length; i += 4) {
                if (imageData.data[i] < 5 && imageData.data[i + 1] < 5 && imageData.data[i + 2] > 250) {
                    imageData.data[i + 3] = 0;
                }
            }
            bCtx.clearRect(0, 0, gW, gH);
            bCtx.putImageData(imageData, 0, 0);
            sprites = await createImageBitmap(bCanvas);
            renderTitle();
        }
        spriteSheet.src = "./sprites.png";
    });

    // ZzFX - Zuper Zmall Zound Zynth - Micro Edition
    // MIT License - Copyright 2019 Frank Force
    // https://github.com/KilledByAPixel/ZzFX

    // This is a tiny build of zzfx with only a zzfx function to play sounds.
    // You can use zzfxV to set volume.
    // There is a small bit of optional code to improve compatibility.
    // Feel free to minify it further for your own needs!

    let zzfx,zzfxV,zzfxX

    // ZzFXMicro - Zuper Zmall Zound Zynth - v1.1.2
    zzfxV=.3    // volume
    zzfx=       // play sound
    (p=1,k=.05,b=220,e=0,r=0,t=.1,q=0,D=1,u=0,y=0,v=0,z=0,l=0,E=0,A=0,F=0,c=0,w=1,m=0,B=0)=>{let M=Math,R=44100,d=2*M.PI,G=u*=500*d/R/R,C=b*=(1-k+2*k*M.random(k=[]))*d/R,g=0,H=0,a=0,n=1,I=0,J=0,f=0,x,h;e=R*e+9;m*=R;r*=R;t*=R;c*=R;y*=500*d/R**3;A*=d/R;v*=d/R;z*=R;l=R*l|0;for(h=e+m+r+t+c|0;a<h;k[a++]=f)++J%(100*F|0)||(f=q?1<q?2<q?3<q?M.sin((g%d)**3):M.max(M.min(M.tan(g),1),-1):1-(2*g/d%2+2)%2:1-4*M.abs(M.round(g/d)-g/d):M.sin(g),f=(l?1-B+B*M.sin(d*a/l):1)*(0<f?1:-1)*M.abs(f)**D*p*zzfxV*(a<e?a/e:a<e+m?1-(a-e)/m*(1-w):a<e+m+r?w:a<h-c?(h-a-c)/t*w:0),f=c?f/2+(c>a?0:(a<h-c?1:(h-a)/c)*k[a-c|0]/2):f),x=(b+=u+=y)*M.cos(A*H++),g+=x-x*E*(1-1E9*(M.sin(a)+1)%2),n&&++n>z&&(b+=v,C+=v,n=0),!l||++I%l||(b=C,u=G,n=n||1);p=zzfxX.createBuffer(1,h,R);p.getChannelData(0).set(k);b=zzfxX.createBufferSource();b.buffer=p;b.connect(zzfxX.destination);b.start();return b}
    zzfxX=new(window.AudioContext||webkitAudioContext) // audio context

// })();
