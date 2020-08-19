/// <reference path="anim.ts" />
/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/utilsx/utils.ts" />
/// <reference path="table.ts" />
/// <reference path="eventsystem.ts" />
/// <reference path="particleSystem.ts" />

//todo
//make it easy todo general unity settings (make a list of usefull settings)
//refine bezieranimation

class ParticleData{
    id:number
    
    constructor(
        public particleid:number,
        public hue:Anim,
        public size:BezierAnim,
    ){

    }
}


var screensize = new Vector(document.documentElement.clientWidth,document.documentElement.clientHeight)
var crret = createCanvas(screensize.x,screensize.y)
var canvas = crret.canvas
var ctxt = crret.ctxt
var onUpdate = new EventSystem<number>()
var onDraw = new EventSystem<void>()
var rng = new RNG(0)
var pdatatable = new TableMap<ParticleData>('id',['particleid'])
var ps = new ParticleSystem<ParticleData>(1, new Vector(300,800),4)
ps.init()
var sizepath = [new Vector(0,0),new Vector(0,1),new Vector(1,1),new Vector(1,0),]

ps.onParticleCreated.listen(particle => {
    particle.data = new ParticleData(particle.id,
        new Anim().write(0,360,particle.lifetimesec * 1000, AnimType.once), 
        new BezierAnim(sizepath).write(0,1,particle.lifetimesec * 1000, AnimType.once)
    )
    particle.pos = ps.pos.c()
    particle.speed = rotate2d(new Vector(0,-200),rng.range(-0.05,0.05)) 
})

ps.onParticleUpdate.listen(({particle,dt}) => {
    particle.update(dt)
})

ps.onParticleDraw.listen(p => {
    var size = p.data.size.getSmooth() * 10
    fillCircle(p.pos,size,`hsl(${p.data.hue.get()},100%,50%)`)
})

ps.onParticleDead.listen(p => {

    let subps = new ParticleSystem<ParticleData>(0,p.pos.c(),4)
    subps.init()
    subps.onParticleCreated.listen(particle => {
        particle.data = new ParticleData(particle.id,
            new Anim().write(0,360,particle.lifetimesec * 1000, AnimType.once), 
            new BezierAnim(sizepath).write(0,1,(particle.lifetimesec * 1000) * rng.range(0.3,1) , AnimType.once)
        )
        particle.pos = subps.pos.c()
        particle.speed = new Vector(rng.range(-50,50),rng.range(-50,50)).add(p.speed)
    })
    subps.onParticleUpdate.listen(({particle,dt}) => {
        particle.update(dt)
    })
    subps.onParticleDraw.listen(p => {
        var size = p.data.size.getSmooth()
        fillCircle(p.pos,size * 10,'orange')
    })

    let onupdateid = onUpdate.listen(dt => {
        subps.update(dt)
    })

    let ondrawid = onDraw.listen(() => {
        subps.draw()
    })

    setTimeout(() => {
        subps.delete()
        onUpdate.unlisten(onupdateid)
        onDraw.unlisten(ondrawid)
    },subps.particlelifetimeSec * 1000)
    subps.burst(20)
})

onUpdate.listen(dt => {
    ps.update(dt)
})

onDraw.listen(() => {
    ps.draw()
})




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
    ctxt.fillStyle = 'black'
    ctxt.fillRect(0,0,screensize.x,screensize.y)
    ctxt.fillStyle = 'white'
    ctxt.fillText(`fps ${fps}`,10,10)

    onUpdate.trigger(dt)
    onDraw.trigger()
    
    
})

function fillCircle(pos:Vector,radius:number,color:string){
    ctxt.fillStyle = color
    ctxt.beginPath()
    ctxt.ellipse(pos.x,pos.y,radius,radius,0,0,TAU)
    ctxt.fill()
}