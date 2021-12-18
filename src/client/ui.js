'use strict'

const Overlay = () => {
    return {
        buttons: []
    }
}

// TODO(nthunt): Is there any purpose in keeping update- and draw- as separate functions?
function updateOverlay(_overlay, _ctx) {
    
}

function drawOverlay(overlay, _ctx) {
    overlay.buttons.forEach(button => {
        updateOverlayButton(button, _ctx)
        drawOverlayButton(button, _ctx)
    })
}

const OverlayButton = (label) => {
    return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        label: label,
        labelColor: 'white',
        fillColor: 'gray',
        state: OverlayButtonState.unpressed,
    }
}

const OverlayButtonState = Object.freeze({
    "unpressed": 0,
    "hover": 1,
    "pressed": 2,
})

function updateOverlayButton(button, _ctx) {
    var cursorX = _ctx.input.mouse.x
    var cursorY = _ctx.input.mouse.y
    
    function insideButton() {
        var buttonX = button.x - button.width/2
        var buttonY = button.y - button.height/2
        return cursorX >= buttonX && cursorX <= buttonX + button.width && cursorY >= buttonY && cursorY <= buttonY + button.height
    }

    var hover = insideButton()
    var press = hover && _ctx.input.mouse.down
    if (press) {
        button.state = OverlayButtonState.pressed
    } else if (hover) {
        button.state = OverlayButtonState.hover
    } else {
        button.state = OverlayButtonState.unpressed
    }
}

function drawOverlayButton(button, _ctx) {
    var isPressed = button.state === OverlayButtonState.pressed
    var buttonX = button.x
    var buttonY = button.y + (isPressed ? 4 : 0)

    _ctx.fillStyle = button.fillColor
    _ctx.fillRect(buttonX - button.width/2, buttonY - button.height/2, button.width, button.height)

    if (button.state === OverlayButtonState.hover) {
        _ctx.fillStyle = COLORS.white + '33'
        _ctx.fillRect(buttonX - button.width/2, buttonY - button.height/2, button.width, button.height)
    } else if (button.state === OverlayButtonState.pressed) {
        _ctx.fillStyle = COLORS.black + '33'
        _ctx.fillRect(buttonX - button.width/2, buttonY - button.height/2, button.width, button.height)
    }

    _ctx.font = FONTS.button
    _ctx.fillStyle = button.labelColor
    _ctx.textAlign = 'center'
    _ctx.textBaseline = 'middle'
    _ctx.fillText(button.label, buttonX, buttonY)
}