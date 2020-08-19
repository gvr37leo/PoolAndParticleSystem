/// <reference path="anim.ts" />
/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/utilsx/utils.ts" />
/// <reference path="table.ts" />
/// <reference path="eventsystem.ts" />
/// <reference path="particleSystem.ts" />

//todo
//colors
//bezier size
//tablemap delete foreign keys
//shared particles tablemap


class ParticleData{
    id:number
    
    
    
    constructor(
        public particleid:number,
        public hue:Anim,
        public size:Anim,
    ){

    }

    render(){

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
var ps = new ParticleSystem(1, new Vector(300,800),4)
var pstable = new TableMap<ParticleSystem>('id',[])
pstable.add(ps)
ps.init()

ps.onParticleCreated.listen(particle => {
    pdatatable.add(new ParticleData(particle.id,
        new Anim().write(0,360,particle.lifetimesec * 1000, AnimType.once), 
        new Anim().write(10,0,particle.lifetimesec * 1000, AnimType.once)
    ))
    particle.init(pstable)
    particle.speed = rotate2d(new Vector(0,-150),rng.range(-0.1,0.1)) 
})

ps.onParticleDead.listen(p => {
    var pdata = pdatatable.getForeign('particleid',p.id)[0]
    pdatatable.delete(pdata.id)

    // let subps = new ParticleSystem(0,p.pos.c(),4)
    // pstable.add(subps)
    // subps.init()
    // subps.onParticleCreated.listen(particle => {
    //     initParticle(particle)
        
    //     particle.speed = new Vector(rng.range(-10,10),rng.range(-40,-100))
    // })



    // subps.onParticleUpdate.listen(({particle,dt}) => {
    //     updateParticle(particle,dt)
    // })

    // subps.onParticleDraw.listen(p => {
    //     var size = 10
    //     ctxt.fillRect(p.pos.x - size/2,p.pos.y - size/2,size,size)
    // })

    // let onupdateid = onUpdate.listen(dt => {
    //     subps.update(dt)
    // })

    // let ondrawid = onDraw.listen(() => {
    //     subps.draw()
    // })

    // setTimeout(() => {
    //     subps.delete()
    //     onUpdate.unlisten(onupdateid)
    //     onDraw.unlisten(ondrawid)
    // },subps.particlelifetimeSec * 1000)
    // subps.burst(20)
})
ps.onParticleUpdate.listen(({particle,dt}) => {
    particle.update(dt)
})
ps.onParticleDraw.listen(p => {
    var pdata = pdatatable.getForeign('particleid',p.id)[0]
    var size = pdata.size.get()
    ctxt.fillStyle = `hsl(${pdata.hue.get()},100%,50%)`
    ctxt.beginPath()
    ctxt.ellipse(p.pos.x,p.pos.y,size,size,0,0,TAU)
    ctxt.fill()
    // ctxt.fillRect(p.pos.x - size/2,p.pos.y - size/2,size,size)
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
    ctxt.clearRect(0,0,screensize.x,screensize.y)
    ctxt.fillStyle = 'black'
    ctxt.fillText(`fps ${fps}`,10,10)
    
    onUpdate.trigger(dt)
    onDraw.trigger()
    
    
})
