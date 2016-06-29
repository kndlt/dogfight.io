debugger;
sc_require("scope/bullet_cloud");

Df.Scope = SC.Object.extend({

    init: function () {
        console.log('Scope init');
        this.objs = [];
        this.bulletCloud = Df.BulletCloud.create({
            scope: this
        });
    },

    add: function (obj) {
        console.log('Adding ' + obj.toString());
        this.objs.push(obj);
        obj.scope = this;
    },

    paint: function (ctx, camera, timestamp) {

        this.objs.forEach(function (obj) {
            obj.paint(ctx, camera, timestamp);
        });

        this.bulletCloud.paint(ctx, camera, timestamp);
    },

    step: function (elapsedTime) {

        this.objs.forEach(function (obj) {
            obj.step(elapsedTime);
        });

        this.bulletCloud.step(elapsedTime);
    }

});
