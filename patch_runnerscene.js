const fs = require('fs');
let code = fs.readFileSync('src/scenes/RunnerScene.js', 'utf8');

// Find update() function
let updateIndex = code.indexOf('update() {');
if (updateIndex !== -1) {
    let before = code.substring(0, updateIndex);
    let after = code.substring(updateIndex);

    // Replace the movement logic inside update()
    let oldMovementCode = `        let isGrounded = this.player.body.touching.down;

        let isMoving = false;
        let isJumping = false;`;

    let newMovementCode = `        let isGrounded = this.player.body.touching.down;

        let isMoving = false;
        let isJumping = false;

        let touch = this.registry.get('touchControls');
        let isTouchLeft = !!(touch && touch.isLeft);
        let isTouchRight = !!(touch && touch.isRight);
        let isTouchJump = !!(touch && touch.isJump);
        if (touch && touch.isJump) {
            touch.isJump = false;
        }

        let isMovingLeft = (this.cursors.left && this.cursors.left.isDown) || (this.keyA && this.keyA.isDown) || isTouchLeft;
        let isMovingRight = (this.cursors.right && this.cursors.right.isDown) || (this.keyD && this.keyD.isDown) || isTouchRight;`;

    // Also replace horizontal movement
    after = after.replace(oldMovementCode, newMovementCode);
    
    after = after.replace(
        "if (this.cursors.left.isDown || this.keyA.isDown) {",
        "if (isMovingLeft) {"
    );
    after = after.replace(
        "} else if (this.cursors.right.isDown || this.keyD.isDown) {",
        "} else if (isMovingRight) {"
    );

    let finalCode = before + after;
    fs.writeFileSync('src/scenes/RunnerScene.js', finalCode, 'utf8');
    console.log('Successfully updated RunnerScene.js update() logic!');
}