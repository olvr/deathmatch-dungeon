test -f src/client.js && terser src/client.js -o src/client.min.js -c toplevel,drop_console,passes=3 -m toplevel --mangle-props regex=/socket.*/
cp src/client.min.js public/client.js
cp src/server.js public/server.js
cp src/index.html public/index.html
cp src/sprites.png public/sprites.png
