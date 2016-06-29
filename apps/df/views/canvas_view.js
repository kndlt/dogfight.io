Df.CanvasView = SC.View.extend({
    classNames: ['canvas-view'],
    
    // for key event captures
    acceptsFirstResponder: YES,
    acceptsKeyPane: YES,

    render: function (context, firstTime) {
        if (firstTime) {
            context.push('<canvas style="background:#666;"></canvas>');
        }
    },
    
    didCreateLayer: function () {
        var me = this;
        this.canvas = this.$('canvas')[0];
        this.engine = Df.engine;
        Df.camera = this.camera = Df.Camera.create({
            x: 0,
            y: 0,
            zoom: 1
        });
        this.ctx = this.canvas.getContext("2d");
        this.resizeCanvas();
        
        window.addEventListener('resize', this.resizeCanvas.bind(this), false);
        this.worker = setInterval(this.triggerPaint.bind(this), this.engine.msStep);

        // for key event captures
        this.becomeFirstResponder();
    },
    
    didUpdateLayer: function () {
        // no-op;
    },

    paint: function (timestamp) {
        var scope = this.engine.scope;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.camera.applyInverseTransform(this.ctx);
        this.applyCameraToViewPortTransform(this.ctx);
        scope.paint(this.ctx, this.camera, timestamp);
        this.ctx.restore();
    },

    applyCameraToViewPortTransform: function (ctx) {
        ctx.translate(this.canvas.width/2, this.canvas.height/2);
    },

    triggerPaint: function () {
        window.requestAnimationFrame(this.paint.bind(this));
    },

    resizeCanvas: function () {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    updateAim: function (evt) {
        this.engine.aim.clientX = evt.clientX;
        this.engine.aim.clientY = evt.clientY;
        this.engine.aim.cameraX = evt.clientX - this.canvas.width/2;
        this.engine.aim.cameraY = evt.clientY - this.canvas.height/2;
        this.engine.aim.x = this.engine.aim.cameraX / this.camera.zoom + this.camera.x;
        this.engine.aim.y = this.engine.aim.cameraY / this.camera.zoom + this.camera.y;
    },

    mouseEntered: function (evt) {
        this.updateAim(evt);
        return YES; // so we get other events
    },

    mouseMoved: function (evt) {
        this.updateAim(evt);
        return YES; // so we get other events
    },

    mouseExited: function (evt) {
        this.updateAim(evt);
        return YES; // so we get other events
    },

    mouseDown: function (evt) {
        console.log('Mouse down');
        // var rect = this.canvas.getBoundingClientRect();
        this.updateAim(evt);
        this.engine.aim.isDown = true;

        return YES; // so we get other events
    },

    mouseDragged: function (evt) {
        // no op
        return YES; // so we get other events
    },

    mouseUp: function (evt) {
        console.log('Mouse up');
        if (!this.isFirstResponder) {
            this.becomeFirstResponder();    
        }
        
        this.updateAim(evt);
        this.engine.aim.isDown = false;

        // apply one more time to set final position
        // this.mouseDragged(evt); 
        // this.engine.aim = null; // cleanup info
        return YES; // handled!
    },

    touchStart: function (touch) {
        this.touchInfo = {
            x: touch.clientX,
            y: touch.clientY,
            cx: this.camera.get('x'),
            cy: this.camera.get('y')
        };
    },

    touchesDragged: function (touch) {
        var info = this.touchInfo;
        var zoom = this.camera.get('zoom');
        var dx = touch.clientX - info.x;
        var dy = touch.clientY - info.y;
        var x = info.cx - dx / zoom;
        var y = info.cy - dy / zoom;
        //this.camera.set('x', x);
        //this.camera.set('y', y);
    },

    touchEnd: function (touch) {
        console.log('Touch End');
        this.touchesDragged(touch); 
        this.touchInfo = null;
    },

    keyDown: function (evt) {
        var timestamp = evt.timeStamp;
        switch (evt.keyCode) {
        case SC.Event.KEY_RETURN: 
            console.log('Enter down at ' + timestamp);
            break;
        case SC.Event.KEY_UP: case 119:
            this.engine.control.up = timestamp;
            break;
        case SC.Event.KEY_DOWN: case 115:
            this.engine.control.down = timestamp;
            break;
        case SC.Event.KEY_LEFT: case 97:
            this.engine.control.left = timestamp;
            break;
        case SC.Event.KEY_RIGHT: case 100:
            this.engine.control.right = timestamp;
            break;
        default: 
            console.log('Key down ' + evt.keyCode + ' at ' + timestamp);
        }

        this.updateControlIntent();

        return YES;
    },

    keyUp: function (evt) {
        var timestamp = evt.timeStamp;

        switch (evt.keyCode) {
        case SC.Event.KEY_RETURN: 
            console.log('Enter up at ' + timestamp);
            break;
        case SC.Event.KEY_UP: case 87:
            this.engine.control.up = false;
            break;
        case SC.Event.KEY_DOWN: case 83: 
            this.engine.control.down = false;
            break;
        case SC.Event.KEY_LEFT: case 65:
            this.engine.control.left = false;
            break;
        case SC.Event.KEY_RIGHT: case 68:
            this.engine.control.right = false;
            break;
        default: 
            console.log('Key up ' + evt.keyCode + ' at ' + timestamp);
        }

        this.updateControlIntent();

        return YES;
    },

    updateControlIntent: function () {

        this.engine.control.intentX = ((this.engine.control.left ? -1 : 0) + (this.engine.control.right ? 1 : 0));
        this.engine.control.intentY = ((this.engine.control.up ? -1 : 0) + (this.engine.control.down ? 1 : 0));

    }

});
