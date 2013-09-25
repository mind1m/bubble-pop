var gameWorld = function() {
}

gameWorld.prototype.setNiceViewCenter = function() {
    PTM = 32;
    setViewCenterWorld( new b2Vec2(0,0), true );
}

gameWorld.prototype.addCircle = function(num) {
    if (typeof num === 'undefined') { num = 1; }

    var ZERO = new b2Vec2(0, 0);
    var temp = new b2Vec2(0, 0);

    var cshape = new b2CircleShape();
    cshape.set_m_radius(0.5);

    var bd = new b2BodyDef();
    bd.set_type(b2_dynamicBody);
    bd.set_position(ZERO);
    var body = world.CreateBody(bd);        
    body.CreateFixture(cshape, 1.0);
    //position
    var randomValue = Math.random();
    temp.Set(15*(Math.random()-0.5), 5 + 1*num);
    body.SetTransform(temp, 0.0);
    body.SetLinearVelocity(ZERO);
    body.SetAwake(1);
    body.SetActive(1);
    body.SetUserData(getRandomInt(1,4))
}

gameWorld.prototype.setup = function() {
    var CIRCLES_NUM = 100;
    // var NUMRANGE = [];    
    // while (NUMRANGE.length < 20)
    //     NUMRANGE.push(NUMRANGE.length+1);
    // bodies = [null]; // Indexes start from 1
    
    var bd_ground = new b2BodyDef();
    var groundBody = world.CreateBody(bd_ground);

    //ground edges
    var shape0 = new b2EdgeShape();
    shape0.Set(new b2Vec2(-40.0, -6.0), new b2Vec2(40.0, -6.0));
    groundBody.CreateFixture(shape0, 0.0);
    //left part
    shape0.Set(new b2Vec2(-2, -6.0), new b2Vec2(-5.0, -4.0));
    groundBody.CreateFixture(shape0, 0.0);
    shape0.Set(new b2Vec2(-5, -4.0), new b2Vec2(-8.0, -1.0));
    groundBody.CreateFixture(shape0, 0.0);
    shape0.Set(new b2Vec2(-8, -1), new b2Vec2(-8.0, 5));
    groundBody.CreateFixture(shape0, 0.0);

    //right part
    shape0.Set(new b2Vec2(2, -6.0), new b2Vec2(5.0, -4.0));
    groundBody.CreateFixture(shape0, 0.0);
    shape0.Set(new b2Vec2(5, -4.0), new b2Vec2(8.0, -1.0));
    groundBody.CreateFixture(shape0, 0.0);
    shape0.Set(new b2Vec2(8, -1), new b2Vec2(8.0, 5));
    groundBody.CreateFixture(shape0, 0.0);



    for (var i=0; i<CIRCLES_NUM; i++) {
        this.addCircle(i);

    }

}

gameWorld.prototype.step = function() {
    var SHOULD_BE_CIRCLES = 100;
    var bodyCount = world.GetBodyCount();
    if (bodyCount<SHOULD_BE_CIRCLES) {
        for (var i=0; i<SHOULD_BE_CIRCLES - bodyCount; i++) {
            this.addCircle(i);
        }
    }
}

gameWorld.prototype.getColorForId = function(id) {
    var color = "";
    if (id == 1) color = "#FFFF00"
    else if (id == 2) color =  "#FF00FF"
    else if (id == 3) color = "#00FFFF"
    else if (id == 4) color =  "#00FF55";
    return color;
}