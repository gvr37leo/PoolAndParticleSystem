/// <reference path="anim.ts" />
/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/utilsx/utils.ts" />
/// <reference path="table.ts" />
/// <reference path="eventsystem.ts" />
/// <reference path="particleSystem.ts" />

//todo
//colors
//tablemap delete
//update


var screensize = new Vector(document.documentElement.clientWidth,document.documentElement.clientHeight)
var crret = createCanvas(screensize.x,screensize.y)
var canvas = crret.canvas
var ctxt = crret.ctxt
var onUpdate = new EventSystem<number>()
var onDraw = new EventSystem<void>()
var rng = new RNG(0)
var ps = new ParticleSystem(1, new Vector(300,800),4)
var pstable = new TableMap<ParticleSystem>('id',[])
pstable.add(ps)
ps.init()

ps.onParticleCreated.listen(particle => {
    initParticle(particle)
    particle.speed = rotate2d(new Vector(0,-150),rng.range(-0.1,0.1)) 
})

ps.onParticleDead.listen(p => {

    let subps = new ParticleSystem(0,p.pos.c(),4)
    pstable.add(subps)
    subps.init()
    subps.onParticleCreated.listen(particle => {
        initParticle(particle)
        
        particle.speed = new Vector(rng.range(-10,10),rng.range(-40,-100))
    })

    subps.onParticleUpdate.listen(({particle,dt}) => {
        updateParticle(particle,dt)
    })

    let onupdateid = onUpdate.listen(dt => {
        subps.update(dt)
    })

    let ondrawid = onDraw.listen(() => {
        drawParticles(subps)
    })

    setTimeout(() => {
        subps.delete()
        onUpdate.unlisten(onupdateid)
        onDraw.unlisten(ondrawid)
    },subps.particlelifetimeSec * 1000)
    subps.burst(20)
})
ps.onParticleUpdate.listen(({particle,dt}) => {
    updateParticle(particle,dt)
})
onUpdate.listen(dt => {
    ps.update(dt)
})

onDraw.listen(() => {
    drawParticles(ps)
})

function drawParticles(_ps:ParticleSystem){
    var particles = _ps.getActiveParticles()
    for(var particle of particles){
        var size = particle.sizeanim.get()
        ctxt.fillRect(particle.pos.x - size/2,particle.pos.y - size/2,size,size)
    }
}

function initParticle(particle:Particle){
    var ps2 = pstable.get(particle.particleSystemid) 
    particle.pos = ps2.pos.c()
    particle.sizeanim.write(10,0,particle.lifetimesec * 1000,AnimType.once)
}

function updateParticle(particle:Particle,dt:number){
    particle.speed.add(gravity.c().scale(dt))
    particle.pos.add(particle.speed.c().scale(dt))
}

var gravity = new Vector(0,40)

// setInterval(() => ps.burst(100),3000)

var fps = 0
setInterval(() => {
    fps = Math.round(1/lastdt)
},1000)
var lastdt = 0

loop((dt) => {
    dt /= 1000
    lastdt = dt
    ctxt.clearRect(0,0,screensize.x,screensize.y)
    ctxt.fillText(`fps ${fps}`,10,10)
    
    onUpdate.trigger(dt)
    onDraw.trigger()
    
    
})
