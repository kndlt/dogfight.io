sc_require('obj');

Df.Mach = Df.Obj.extend({

    color: "#DDDD55",

    // speed in pixels per second
    pps: 400,

    accelFactor: 30,

    airDragFactor: 0.1,

    init: function () {

        this.recoil = 0;

        this.control = {
            intentX: 0,
            intentY: 0
        };
        this.aim = {
            x: undefined,
            y: undefined,
            isDown: false
        };

        console.log('Mach init');
    },

    applyControl: function (control) {
        this.control.intentX = control.intentX;
        this.control.intentY = control.intentY;
    },

    applyAim: function (aim) {
        this.aim.x = aim.x;
        this.aim.y = aim.y;
        this.aim.isDown = aim.isDown;
    },

    beforeStep: function (elapsedTime) {
        sc_super();

        this.drag(elapsedTime);
        this.accel(this.control.intentX, this.control.intentY, elapsedTime);
        this.steer(elapsedTime);

        if (this.aim.isDown && this.recoil-- <= 0) {
            this.shoot();    
        }
        
    },

    shoot: function () {
        this.recoil = 10;
        var x = this.x;
        var y = this.y;
        var vx = Math.cos(this.rotation) * 370; 
        var vy = Math.sin(this.rotation) * 370;
        this.scope.fireBullet(x, y, vx, vy);
    },

    steer: function (elapsedTime) {
        var dx = this.aim.x - this.x;
        var dy = this.aim.y - this.y;
        var d = Math.sqrt(dx*dx+dy*dy);
        if (d > 0) {
            this.rotation = Math.atan2(dy, dx);
        }
    },

    accel: function (intentX, intentY, elapsedTime) {
        var intentSq = intentX * intentX + intentY * intentY;
        var intent = Math.sqrt(intentSq);

        if(intent > 1) {
            intentX = intentX/intent;
            intentY = intentY/intent;
        }

        this.vx += intentX * this.accelFactor;
        this.vy += intentY * this.accelFactor;

        var vSq = this.vx * this.vx + this.vy * this.vy;

        if (vSq > 0) {
            var v = Math.sqrt(vSq);
            if(v > this.pps){
                this.vx *= this.pps / v;
                this.vy *= this.pps / v;
            }
        }
    },

    drag: function (elapsedTime) {
        this.vx -= this.vx * this.airDragFactor;
        this.vy -= this.vy * this.airDragFactor;
    },

    paint: function (ctx, camera, timestamp) {
        sc_super();
        this.paintAim(ctx, camera, timestamp);
    },

    paintObj: function (ctx, camera, timestamp) {
        sc_super();
    },

    paintAim: function (ctx, camera, timestamp) {

        // draw aim
        ctx.save();
        ctx.translate(this.aim.x, this.aim.y);
        ctx.strokeStyle = '#dddddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0,2*Math.PI);
        ctx.stroke();
        // ctx.rotate(this.rotation - Math.PI / 2);
        ctx.restore();


    }

});