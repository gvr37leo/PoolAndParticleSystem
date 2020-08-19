
class ParticleSystem<T>{
    id:number
    pool = new Pool(400,true)
    particles = new TableMap<Particle<T>>('id',['poolitemid'])
    onParticleCreated = new EventSystem<Particle<T>>()
    onParticleDead = new EventSystem<Particle<T>>()
    onParticleUpdate = new EventSystem<{ particle: Particle<T>; dt: number; }>()
    onParticleDraw = new EventSystem<Particle<T>>()
    private intervalid = null

    constructor(
        public particlesPerSecond:number,
        public pos:Vector,
        public particlelifetimeSec,
    ){
        
    }

    init(){
        this.pool.onPoolItemInstaniated.listen(pi => {
            
            let particle = new Particle<T>(this.id,pi.id,this.particlelifetimeSec, new Vector(0,0), new Vector(0,0))
            this.particles.add(particle)
            pi.onMount.listen(() => {
                
                this.onParticleCreated.trigger(particle)
            })
            pi.onDismount.listen(() => {
                this.onParticleDead.trigger(particle)
            })
        })
        this.pool.init()

        if(this.particlesPerSecond != 0){
            this.intervalid = setInterval(() => {
                this.burst(1)
            },(1 / this.particlesPerSecond) * 1000)
        }
    }

    delete(){
        clearTimeout(this.intervalid)
    }

    update(dt:number){
        var particles = this.getActiveParticles()
        for(var particle of particles){
            this.onParticleUpdate.trigger({particle,dt})
        }
    }

    burst(amount:number){
        for(var i = 0; i < amount;i++){
            let pi = this.pool.get()
            let particle = this.particles.get(pi.id)
            setTimeout(() => {
                this.pool.return(pi.id)
            },particle.lifetimesec * 1000)
        }
    }


    getActiveParticles(){
        return this.pool.getActiveItems().map(pi => this.particles.getForeign('poolitemid',pi.id)[0])
    }

    draw(){
        var particles = this.getActiveParticles()

        for(var particle of particles){
            this.onParticleDraw.trigger(particle)
            
        }
    }
}

class Particle<T>{
    id:number
    data:T

    constructor(
        public particleSystemid:number,
        public poolitemid:number,
        public lifetimesec:number,
        public pos:Vector,
        public speed:Vector,
    ){

    }

    update(dt:number){
        this.speed.add(gravity.c().scale(dt))
        this.pos.add(this.speed.c().scale(dt))
    }
}

class PoolItem{
    onMount:EventSystem<void> = new EventSystem()
    onDismount:EventSystem<void> = new EventSystem()
    public id:number

    constructor(
    ){

    }
}

class Pool{
    freeItems:Set<number> = new Set()
    usedItems:Set<number> = new Set()
    items:TableMap<PoolItem> = new TableMap('id',[])
    onPoolItemInstaniated:EventSystem<PoolItem> = new EventSystem()

    constructor(public initialsize:number, public grows:boolean){
        
    }

    init(){
        for(var i = 0; i < this.initialsize; i++){
            var item = new PoolItem()
            var id = this.items.add(item)
            this.freeItems.add(id)
            this.onPoolItemInstaniated.trigger(item)
        }
    }

    get(){
        var item:PoolItem
        if(this.freeItems.size > 0){

            let id = this.freeItems.keys().next().value
            item = this.items.get(id)
            this.freeItems.delete(id)
            this.usedItems.add(id)
            
        }else{
            if(this.grows){
                item = new PoolItem()
                let id = this.items.add(item)
                this.usedItems.add(id)
                this.onPoolItemInstaniated.trigger(item)
            }else{
                let id = first(Array.from(this.usedItems.keys()))
                item = this.items.get(id)
                this.usedItems.delete(id)
                this.usedItems.add(id)
                item.onDismount.trigger()
            }
        }
        item.onMount.trigger()
        return item
    }

    getActiveItems(){
        return Array.from(this.usedItems.keys()).map(id => this.items.get(id))
    }

    return(id:number){
        let item = this.items.get(id)
        this.usedItems.delete(id)
        this.freeItems.add(id)
        item.onDismount.trigger()
    }
}