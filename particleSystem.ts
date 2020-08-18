
class ParticleSystem{

    pool = new Pool(400,false)
    particles = new TableMap<Particle>('id',['poolitemid'])
    

    constructor(
        public spawnrate:number,
        public pos:Vector,
    ){
        
        var rng = new RNG(0)
        this.pool.onPoolItemInstaniated.listen(pi => {
            var particlelifetime = 10
            let particle = new Particle(pi.id,1,particlelifetime, new Vector(0,0), new Vector(0,0))
            this.particles.add(particle)
            pi.onMount.listen(() => {
                particle.pos = this.pos.c()
                particle.speed = new Vector(rng.range(-10,10),rng.range(-10,10))
                particle.sizeanim.write(10,0,particlelifetime * 1000,AnimType.once)
            })
            pi.onDismount.listen(() => {
                //instantiate explosion
            })
        })
        this.pool.init()

        setInterval(() => {
            let pi = this.pool.get()
            let particle = this.particles.get(pi.id)
            setTimeout(() => {
                this.pool.return(pi.id)
            },particle.lifetimesec * 1000)
        },spawnrate)

    }

    update(dt:number){
        var gravity = new Vector(0,5)
        var particles = this.getActiveParticles()
        for(var particle of particles){
            particle.speed.add(gravity.c().scale(dt))
            particle.pos.add(particle.speed.c().scale(dt))
        }
    }

    getActiveParticles(){
        return this.pool.getActiveItems().map(pi => this.particles.getForeign('poolitemid',pi.id)[0])
    }
}

class Particle{
    id:number
    sizeanim = new Anim()
    
    constructor(
        public poolitemid:number,
        public size:number,
        public lifetimesec:number,
        public pos:Vector,
        public speed:Vector,
    ){

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