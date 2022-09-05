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
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
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

    let match = {
        duration: 180,
        // running: !1,
        startTime: 0,
        ended: !1,
        launchTime: 0,
        // results: []
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
        tiles: [
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,
            0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,
            0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,0,
            0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
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

            if (tile == 5) return {x: 112, y: 48};
            if (tile == 6) return {x: 96, y: 48};
            if (tile == 7) return {x: 128, y: 48};

            // Left wall
            if (tile == 4 + this.wallOffset) return {x: 0, y: 48};
            // Right wall
            if (tile == 2 + this.wallOffset) return {x: 32, y: 48};
            // Bottom wall
            if (tile == 1 + this.wallOffset) return {x: 16, y: 48};
            // Top wall
            // if (tile == 8 + 4) return {x: 64, y: 48};
            if (tile == 8 + this.wallOffset) return {x: 112, y: 32};
            
            // Floor at top and left
            if (tile == 3 + this.wallOffset) return {x: 80, y: 32};
            // Floor at top and right
            if (tile == 5 + this.wallOffset) return {x: 0, y: 32};
            // Floor at bottom and right
            // if (tile == 12 + 4) return {x: 80, y: 48};
            if (tile == 12 + this.wallOffset) return {x: 128, y: 32};
            // Floor bottom and left
            // if (tile == 10 + 4) return {x: 48, y: 48};
            if (tile == 10 + this.wallOffset) return {x: 96, y: 32};
            
            // Floor bottom right
            // if (tile == 128 + this.wallOffset) return {x: 0, y: 48};
            // if (tile == 64 + this.wallOffset) return {x: 32, y: 48};
        }
    }

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
            
            if (bitMask == 0) {
                if (Math.abs(map.getTile(mapX - 1, mapY + 1) - 2.5) < 2.5) bitMask = 64;
                if (Math.abs(map.getTile(mapX + 1, mapY + 1) - 2.5) < 2.5) bitMask = 128;
            }
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

    let sprites = new Image();

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

    const myPlayerId = gameState.players[0].playerId;

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
            gameState.players[0].sessionId = socket.id;
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
                    gameState.players[0].health = Math.min(gameState.players[0].health + 50, 100);
                    msg.txt = "Potion restores health";
                    msg.time = Date.now();
                }
                // Item claimed is a scroll
                else if (type > 1) {
                    gameState.players[0].scroll = type - 1;
                    msg.txt = "You picked up a scroll of " + scrolls[type - 1];
                    msg.time = Date.now();
                    if (type == 6) socket.emit("chat", 2, gameState.players[0].username + " just turned invisible");
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
            if (player.playerId === myPlayerId) {
                // Ignore own update
                return;
            }

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
                if (player.entryTime > gameState.players[0].entryTime) {
                    // msg.txt = player.username + " entered the dungeon";
                    // msg.time = Date.now();
                    socket.emit("chat", 1, player.username + " entered the dungeon");
                    if (match.startTime == 0) {
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
                        // socket.emit("chat", gameState.players[0].username + ": " + chat.txt);
                        socket.emit("chat", 0, chat.txt, gameState.players[0].username);
                        chat.active = false;
                        chat.txt = "";
                    } else {
                        chat.active = false;
                    }
                }
            } else if (!gameState.players[0].active) {
                if (e.key.match(regex)) {
                    if (gameState.players[0].username.length < 11) gameState.players[0].username += e.key;
                }
                if (e.key == "Backspace" && gameState.players[0].username.length > 0) gameState.players[0].username = gameState.players[0].username.substring(0, gameState.players[0].username.length - 1);
                if (e.key == "Enter" && gameState.players[0].username.length) {
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
            gameState.players[0].facing = (mouse.x < gW / 2) ? 0 : 1;

        });
    
        document.addEventListener("mousedown", e => {
            if (gameState.players[0].dead && Date.now() > clickTimeout + 1000) {
                clickTimeout = 0;
                respawn();
            }
            if (match.ended && Date.now() > clickTimeout + 5000) {
            // if (match.ended) {
                console.log("click on ended");
                clickTimeout = 0;
                match.ended = !1;
                // gameState.players[0].active = !0;
                // gameState.players[0].entryTime = Date.now();
                join();
                respawn()
            }
            if (!gameState.players[0].active || Date.now() < prevMouseDown + 100) return;
            prevMouseDown = Date.now();

            if (e.buttons != 1 || gameState.players[0].health <= 0) return; // LMB is 1
            // If invisible
            if (gameState.players[0].scroll == 5) gameState.players[0].scroll = 0;
            // If rune scroll
            if (gameState.players[0].scroll == 4) {
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
                    socket.emit("addRune", {x: runeX, y: runeY, remove: !1});
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
                angle: gameState.players[0].angle,
                bounces: startBounces
            }

            // If not runic hex then emit projectile
            if (gameState.players[0].scroll != 4) socket.emit("addProjectile", projectile);
            
            // If player has the split shot magic scroll add other shots
            if (gameState.players[0].scroll == 2) {
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

    // async function playerHit(player, attacker) {
    //     // console.log(player.username + ": " + player.health)
    //     if (player.health <= 0 || player.scroll == 5) return;
    //     player.hit = 20;
    //     player.health -= (attacker.scroll == 3) ? 20 : 10;
    //     if (player.health <= 0) {
    //         player.health = 0;
    //         socket.emit("removeRunes", player.sessionId);
    //         if (!match.launch) respawnTime = Date.now();
    //         if (gameState.players.indexOf(attacker) == 0) {
    //             socket.emit("addFrag");
    //             msg.txt = "Pwnage! " + player.username + " is out for the count!";
    //             msg.time = Date.now();
    //         }
    //         if (gameState.players.indexOf(player) == 0) {
    //             msg.txt = "Oh no! " + attacker.username + " just pwned you!";
    //             msg.time = Date.now();
    //         }
    //     }
    // }

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
            if (gameState.players[0].entryTime > 0) socket.emit("matchUpdate", match);
            let countdown = 3 - Math.floor((Date.now() - match.launchTime) / 1000);
            messages.matchLaunch = "The match is about to begin... " + countdown;
            // Start the match
            if (Date.now() > match.launchTime + 3000) {
                messages.matchLaunch = "The match has begun!";
                if (gameState.players[0].entryTime > 0) results.length = 0;
                match.launchTime = 0;
                match.startTime = Date.now();
                if (gameState.players[0].entryTime > 0) socket.emit("matchUpdate", match);
                respawn();
                // match.running = !0;
                for (let i = 1; i < gameState.players.length; i++) {
                    gameState.players[i].frags = 0;
                    gameState.players[i].deaths = 0;
                }
            }
        }

        if (match.startTime > 0 && Date.now() > match.startTime + 3000) messages.matchLaunch = ""; 

        // Check for match end
        if (match.startTime > 0 && Date.now() > match.startTime + match.duration * 1000) {
            // match.running = !1;
            match.ended = !0;
            match.startTime = 0;
            if (gameState.players[0].entryTime > 0) socket.emit("matchUpdate", match);
            clickTimeout = Date.now();
            if (gameState.players[0].entryTime > 0) {
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
                if (gameState.players[i].entryTime > 0 && gameState.players[i].entryTime > gameState.players[0].entryTime) {
                    socket.emit('startMatch');
                    break;
                }
            }
        }

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
                        if (j == 0 && gameState.players[0].health > 0) {
                            gameState.players[0].health -= (gameState.players[i].scroll == 3) ? 20 : 10;
                            gameState.players[0].lastHitBy = gameState.players[i].sessionId;
                            gameState.players[0].lastHitByScroll = gameState.players[i].scroll;
                            // console.log(gameState.players[0].health);
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
                        gameState.players[j].hit = 10;
                        if (!r.remove) r.remove = true;
                    }
                }
            });
            gameState.players[i].runes = gameState.players[i].runes.filter(r => {
                return (r.remove !== true);
            });

            // if (gameState.players[i].dead && gameState.players[i].lastHitBy != "") {

            //     let index = gameState.players.findIndex(o => {
            //         return o.sessionId === gameState.players[i].lastHitBy;
            //     });
            //     if (index != -1) {
            //         // msg.txt = gameState.players[i].username + " got rekt by " + gameState.players[index].username + "'s " + scrolls[gameState.players[i].lastHitByScroll];
            //         // msg.time = Date.now();

            //         socket.emit("chat", 2, gameState.players[i].username + " got rekt by " + gameState.players[index].username + "'s " + scrolls[gameState.players[i].lastHitByScroll]);
                    
                    
            //     }
            // }

            // if (gameState.players[i].dead && gameState.players[i].lastHitBy != "") {
            //     let index = gameState.players.findIndex(o => {
            //         return o.sessionId === gameState.players[i].lastHitBy;
            //     });
            //     if (index == 0) {
            //         gameState.players[i].lastHitBy = "";
            //         msg2.killed.txt = "You killed " + gameState.players[i].username;
            //         msg2.killed.time = Date.now();
            //     }
            // }
            
        }

        if (gameState.players[0].health <= 0 && !gameState.players[0].dead) {
            // console.log("im dead")
            gameState.players[0].dead = !0;
            let index = gameState.players.findIndex(o => {
                return o.sessionId === gameState.players[0].lastHitBy;
            });

            if (index != -1) {
                let style = ["rekt", "fried", "zapped", "burned", "nuked", "wasted", "derezzed"];
                socket.emit("chat", 2, gameState.players[0].username + " got " + style[Math.floor(Math.random() * style.length)] + " by " + gameState.players[index].username + "'s " + scrolls[gameState.players[0].lastHitByScroll]);
                messages.killedBy = "You were killed by " + gameState.players[index].username + "!";
            }
            messages.respawn = "Press fire to respawn";
            clickTimeout = Date.now();
            socket.emit("removeRunes");
            socket.emit("addFrag", gameState.players[0].lastHitBy, gameState.players[0].username);
            gameState.players[0].deaths++;
            if (match.launchTime == 0) respawnTime = Date.now();
        }

        // Check for player collision with item
        let itemIdClaimed = -1;
        for (let i = 0; i < items.length; i++) {
            // We picked up an item
            if (rectCollision(gameState.players[0].x, gameState.players[0].y,spriteSize, spriteSize, items[i].x, items[i].y, spriteSize, spriteSize)) {
                itemIdClaimed = items[i].id;
                if (connected) socket.emit('claimItem', itemIdClaimed, items[i].type);
                items[i].type = 0;
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
            p.frame = (p.frame < 3 && p.walking == 1) ? p.frame += 0.075 : 0;
        }

        // Move viewport offset to follow player
        gameState.viewport.x = gameState.viewport.following.x - (gW / 2) + spriteSize / 2;
        gameState.viewport.y = gameState.viewport.following.y - (gH / 2) + spriteSize / 2;

        // Update the server with the new state
        if (connected) socket.emit('stateUpdate', gameState.players[0]);
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
            for (let c = startCol; c <= endCol; c++) {
                for (let r = startRow; r <= endRow; r++) {
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

            if (match.launchTime == 0 && match.startTime == 0 && Date.now() > gameState.players[0].entryTime + 1000) write("Waiting for other players", gW / 2 + 1, 140, '#05d', 2, 1);

            // Display match launch phase message
            // if (Date.now() < match.launchTime + 3000) {
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
            if (gameState.players[0].dead && Date.now() > clickTimeout + 1000) {
                write(messages.respawn, gW / 2, 2, '#fff', 2, 1);
            }

            // Render match timer
            if (match.startTime > 0) {
                let s = Math.floor((Date.now() - match.startTime) / 1000);
                s = match.duration - s;
                if (s >= 0) { 
                    let m = Math.floor(s / 60);
                    s = s % 60;
                    // write(((m == 1) ? " " + m : m) + ":" + ((s < 10) ? "0" + s : s), 290, 2);
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
            bCtx.drawImage(sprites, 80, 0, 11, 10, 1, 2, 11, 10);
            write(gameState.players[0].health, 14, 2, '#fff', 2);
        }

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
        const player = gameState.players[0];
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
        if (player.health <= 0) {
            bCtx.drawImage(sprites, 0, spriteSize, spriteSize, spriteSize, player.x - gameState.viewport.x, player.y - gameState.viewport.y, spriteSize, spriteSize);
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
        gameState.players[0].active = !0;
        gameState.players[0].entryTime = Date.now();
        socket.emit("getMatchStatus");
    }

    function init() {
        titleScreen = !1;
        gameState.viewport.following = gameState.players[0];
        // gameState.players[0].active = !0;
        // gameState.players[0].entryTime = Date.now();
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
        bCtx.drawImage(sprites, 96, 16, spriteSize, spriteSize, x, y, spriteSize, spriteSize);
        bCtx.save();
        bCtx.translate(x + flameSize, y + flameSize + 1);
        bCtx.transform(1, 0, flameSkew, flameStretch, 0, 0);
        bCtx.scale(1, -1);
        bCtx.drawImage(sprites, 112, 16, flameSize, flameSize, 0, 0, flameSize, flameSize);
        bCtx.setTransform(1, 0, 0, 1, 0, 0); // Reset
        bCtx.restore();
    }

    function renderTitle(timestamp) {
        // let elapsed = (timestamp - oldTimeStamp) / 1000;
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

        let w = write("Enter your name: " + gameState.players[0].username, 49, 75, '#eee', 2, 0);
        bCtx.fillStyle = "#eee";
        bCtx.fillRect(w + 49 + 2, 75, 6, 10); // Cursor
        write("WASD/arrows to move, mouse to aim, click to shoot", 50, 120, '#eee', 1);
        write("Tab to chat", 50, 130, '#eee', 1);
        blit();
        if (titleScreen) requestAnimationFrame(renderTitle);
    }
    
    function welcome() {
        bindEvents();
        document.body.appendChild(canvas);
        resizeCanvas();

        sprites.onload = function() {
            renderTitle();
        }
        sprites.src = "./sprites.png";
    }

    window.addEventListener("load", welcome, false);

// })();
