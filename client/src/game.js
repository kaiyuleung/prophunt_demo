const player =  {
    // sprite: "",
    // id: "id0",
    // moved: false,
}

const otherPlayers = {
    // id1: {sprite: ""},
    // id2: {sprite: ""},
    // id3: {sprite: ""},
}

const gameState = {
    cursors: "",
}

let socket;

class GameScene extends Phaser.Scene {
    constructor(){
        super('GameScene')
    }

    preload(){
        // Assets
        this.load.image('codey', 'https://content.codecademy.com/courses/learn-phaser/physics/codey.png');

        // Socket
        socket = io('http://127.0.0.1:3000');
    }

    create(){
        // Initialised Character sprite and physics
        player.sprite = this.physics.add.sprite(500,400, "codey")
        player.sprite.setCollideWorldBounds(true);

        // Initialsed Controls
        gameState.cursors = this.input.keyboard.createCursorKeys();

        // // Socket - share your cords
        // socket.on('where-are-you', (rep)=>{
        //     console.log("someone asked my location", { x: player.sprite.x, y: player.sprite.y });
        //     rep({ x: player.sprite.x, y: player.sprite.y })
        // })

        // Socket - joined room update list
        socket.on('update-room', (IDList, playerID, coords) => {

            // Update exsisting players' locations to newly joined player
            if(playerID !== player.id && !otherPlayers[playerID]){
                socket.emit('moving', player.room, { x: player.sprite.x, y: player.sprite.y })
            }

            // Updating local IDList with the socket room's IDList expect self
            IDList.filter(id => id !== socket.id).forEach(id => {
                // if receiving id does not exist in local IDList
                if(!otherPlayers[id]){
                    // Create player sprite
                    otherPlayers[id] = {
                        sprite: this.physics.add.sprite(coords.x, coords.y, "codey")
                    }
                    // socket.emit('req-update', palyer.room, id)

                    // socket.emit('init-coords', id, coord => {
                    //     console.log(coord);
                    //     otherPlayers[id] = {
                    //         sprite: this.physics.add.sprite(coord.x, coord.y, "codey")
                    //     }
                    // })
                }
                // if calling from 'moved'
                if(id === playerID && coords){
                    otherPlayers[id].sprite.x = coords.x
                    otherPlayers[id].sprite.y = coords.y 
                } 
            })

            // calling from 'disconnecting'
            if ( coords === null){
                otherPlayers[playerID].sprite.destroy();
                delete otherPlayers[playerID]
            }
            // console.log(otherPlayers);

        })
        socket.emit('join-room', 123, { x: player.sprite.x, y: player.sprite.y }, info => {
            player.id = info.id 
            player.room = info.room 
            console.log(`${player.id}@${player.room}`);
        })

        this.debug("create")
    }

    update(time, delta){
        // Controls
        if (gameState.cursors.right.isDown) {
            player.sprite.setVelocity(350, 0);
            player.moved = true;
        } 
        if (gameState.cursors.left.isDown) {
            player.sprite.setVelocity(-350, 0);
            player.moved = true;
        } 
        if (gameState.cursors.up.isDown) {
            player.sprite.setVelocity(0, -350);
            player.moved = true;
        } 
        if (gameState.cursors.down.isDown) {
            player.sprite.setVelocity(0, 350);
            player.moved = true;
        } 

        if (gameState.cursors.right.isDown && gameState.cursors.up.isDown) {
            player.sprite.setVelocity(Math.sqrt((350**2)/2), -Math.sqrt((350**2)/2));
            player.moved = true;
        } 
        if (gameState.cursors.right.isDown && gameState.cursors.down.isDown) {
            player.sprite.setVelocity(Math.sqrt((350**2)/2), Math.sqrt((350**2)/2));
            player.moved = true;
        } 
        if (gameState.cursors.left.isDown && gameState.cursors.up.isDown) {
            player.sprite.setVelocity(-Math.sqrt((350**2)/2), -Math.sqrt((350**2)/2));
            player.moved = true;
        } 
        if (gameState.cursors.left.isDown && gameState.cursors.down.isDown) {
            player.sprite.setVelocity(-Math.sqrt((350**2)/2), Math.sqrt((350**2)/2));
            player.moved = true;
        } 
        if (gameState.cursors.up.isUp && gameState.cursors.down.isUp && gameState.cursors.left.isUp && gameState.cursors.right.isUp){
            player.sprite.setVelocity(0, 0);
            player.moved = false;
        }
        if (gameState.cursors.space.isDown) {
            player.sprite.x = 500;
            player.sprite.y = 400;
            player.moved = true;
        }

        if (player.moved){
            socket.emit('moving', player.room, { x: player.sprite.x, y: player.sprite.y })
            // console.log(player.sprite.body.speed);
        }

        this.debug("update", delta, player.sprite.body.speed)
    }

    debug(mode, delta = 0.1, velocity=0){
        switch(mode){
            case "create":
                this.FPS = this.add.text(0, 0, "FPS", { fontSize: '15px' })
                this.speed = this.add.text(0, 20, "speed", { fontSize: '15px' })
                break;
            case "update":
                this.FPS.setText(`FPS: ${Math.floor(1000/delta)}`)
                this.speed.setText(`${velocity}`)
                break;
        }
    }

}

const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 800,
    backgroundColor: "131313",
    physics: {
        default: 'arcade',
        arcade: {
        gravity: { y: 0 },
        enableBody: true,
        }
    },
    scene: [GameScene]
}

const game = new Phaser.Game(config);
