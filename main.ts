/// <reference path="anim.ts" />
/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/utilsx/utils.ts" />
/// <reference path="table.ts" />
/// <reference path="eventsystem.ts" />
/// <reference path="particleSystem.ts" />




var screensize = new Vector(document.documentElement.clientWidth,document.documentElement.clientHeight)
var crret = createCanvas(screensize.x,screensize.y)
var canvas = crret.canvas
var ctxt = crret.ctxt

var ps = new ParticleSystem(100, new Vector(300,200))

loop((dt) => {
    dt /= 1000
    ctxt.clearRect(0,0,screensize.x,screensize.y)


    ps.update(dt)
    var particles = ps.getActiveParticles()
    for(var particle of particles){
        var size = particle.sizeanim.get()
        ctxt.fillRect(particle.pos.x - size/2,particle.pos.y - size/2,size,size)
    }
    
})
