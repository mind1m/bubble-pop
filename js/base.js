var PTM = 32;

var world = null;
var mouseJointGroundBody;
var canvas;
var context;
var myDebugDraw;        
var myQueryCallback;
var mouseJoint = null;        
var run = true;
var frameTime60 = 0;
var statusUpdateCounter = 0;
var showStats = false;        
var mouseDown = false;
var shiftDown = false;        
var mousePosPixel = {
    x: 0,
    y: 0
};
var prevMousePosPixel = {
    x: 0,
    y: 0
};        
var mousePosWorld = {
    x: 0,
    y: 0
};        
var canvasOffset = {
    x: 0,
    y: 0
};        
var viewCenterPixel = {
    x:320,
    y:240
};
var currentGame = new gameWorld();

function myRound(val,places) {
    var c = 1;
    for (var i = 0; i < places; i++)
        c *= 10;
    return Math.round(val*c)/c;
}
        
function getWorldPointFromPixelPoint(pixelPoint) {
    return {                
        x: (pixelPoint.x - canvasOffset.x)/PTM,
        y: (pixelPoint.y - (canvas.height - canvasOffset.y))/PTM
    };
}

function updateMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    mousePosPixel = {
        x: evt.clientX - rect.left,
        y: canvas.height - (evt.clientY - rect.top)
    };
    mousePosWorld = getWorldPointFromPixelPoint(mousePosPixel);
}

function setViewCenterWorld(b2vecpos, instantaneous) {
    var currentViewCenterWorld = getWorldPointFromPixelPoint( viewCenterPixel );
    var toMoveX = b2vecpos.get_x() - currentViewCenterWorld.x;
    var toMoveY = b2vecpos.get_y() - currentViewCenterWorld.y;
    var fraction = instantaneous ? 1 : 0.25;
    canvasOffset.x -= myRound(fraction * toMoveX * PTM, 0);
    canvasOffset.y += myRound(fraction * toMoveY * PTM, 0);
}

function onMouseMove(canvas, evt) {
    prevMousePosPixel = mousePosPixel;
    updateMousePos(canvas, evt);
}


function onMouseDown(canvas, evt) {            
    updateMousePos(canvas, evt);
    mouseDown = true;

    // Make a small box.
    var aabb = new b2AABB();
    var d = 0.001;            
    aabb.set_lowerBound(new b2Vec2(mousePosWorld.x - d, mousePosWorld.y - d));
    aabb.set_upperBound(new b2Vec2(mousePosWorld.x + d, mousePosWorld.y + d));
    
    // Query the world for overlapping shapes.            
    myQueryCallback.m_fixture = null;
    myQueryCallback.m_point = new b2Vec2(mousePosWorld.x, mousePosWorld.y);
    world.QueryAABB(myQueryCallback, aabb);
    
    if (myQueryCallback.m_fixture)
    {
        var body = myQueryCallback.m_fixture.GetBody();
        
        var bodies_to_destroy = [];

        check_combination = function(body) {
        	var contact_edge = body.GetContactList();
	        while (contact_edge.a) {
	        	var contact = contact_edge.get_contact();
	        	var body_a = contact.GetFixtureA().GetBody();
	        	var body_b = contact.GetFixtureB().GetBody();
	        	var second_body = null;
	        	if (body_a == body) second_body = body_b
	        	else second_body = body_a;
	        	if (second_body.GetUserData() == body.GetUserData()) {
	        		if (bodies_to_destroy.indexOf(second_body) < 0) {
	        			bodies_to_destroy.push(second_body);
	        			check_combination(second_body);
	        		}	        		
	        	}
	        	// second_body.SetUserData(4);
	        	contact_edge = contact_edge.get_next();
	        }
        }
        bodies_to_destroy.push(body);
        check_combination(body);
        for (var i = 0; i<bodies_to_destroy.length; i++) {
        	world.DestroyBody(bodies_to_destroy[i]);	
        }
        
    }

}

function onMouseUp(canvas, evt) {
    mouseDown = false;
    updateMousePos(canvas, evt);
}

function onMouseOut(canvas, evt) {
    onMouseUp(canvas,evt);
}


        

function init() {
    
    canvas = document.getElementById("canvas");
    context = canvas.getContext( '2d' );
    
    canvasOffset.x = canvas.width/2;
    canvasOffset.y = canvas.height/2;
    
    canvas.addEventListener('mousemove', function(evt) {
        onMouseMove(canvas,evt);
    }, false);
    
    canvas.addEventListener('mousedown', function(evt) {
        onMouseDown(canvas,evt);
    }, false);
    
    canvas.addEventListener('mouseup', function(evt) {
        onMouseUp(canvas,evt);
    }, false);
    
    canvas.addEventListener('mouseout', function(evt) {
        onMouseOut(canvas,evt);
    }, false);
    
    
    myDebugDraw = getCanvasDebugDraw();            
    myDebugDraw.SetFlags(e_shapeBit);
    
    myQueryCallback = new b2QueryCallback();
    
    Box2D.customizeVTable(myQueryCallback, [{
    original: Box2D.b2QueryCallback.prototype.ReportFixture,
    replacement:
        function(thsPtr, fixturePtr) {
            var ths = Box2D.wrapPointer( thsPtr, b2QueryCallback );
            var fixture = Box2D.wrapPointer( fixturePtr, b2Fixture );
            if ( fixture.GetBody().GetType() != Box2D.b2_dynamicBody ) //mouse cannot drag static bodies around
                return true;
            if ( ! fixture.TestPoint( ths.m_point ) )
                return true;
            ths.m_fixture = fixture;
            return false;
        }
    }]);


    //from changeTest
    resetScene();
    currentGame.setNiceViewCenter();    
    draw();
}



function createWorld() {
    
    if ( world != null ) 
        Box2D.destroy(world);
        
    world = new b2World( new b2Vec2(0.0, -10.0) );
    //world.SetDebugDraw(myDebugDraw);               
    currentGame.setup();
}

function resetScene() {
    createWorld();
    draw();
}

function step(timestamp) {
    
    if ( currentGame && currentGame.step ) 
        currentGame.step();
    
    world.Step(1/60, 3, 2);
    draw();   
}

function draw() {
    
    //black background
    context.fillStyle = 'rgb(0,0,0)';
    context.fillRect( 0, 0, canvas.width, canvas.height );
    
    context.save();            
    context.translate(canvasOffset.x, canvasOffset.y);
    context.scale(1,-1);                
    context.scale(PTM,PTM);
    context.lineWidth /= PTM;
                
        
    context.fillStyle = 'rgb(255,255,0)';
        //world.DrawDebugData();
    var node = world.GetBodyList();
	while (node.a) {
		// Draw the dynamic objects
		var position = node.GetPosition();
		if (position.get_y() < -20) {
			world.DestroyBody(node);
		}
		if (node.GetType() == 2) { //dynamic body

			// Canvas Y coordinates start at opposite location, so we flip
			// var flipy = canvasheight - position.y;
			var fl = node.GetFixtureList();
			if (!fl) {
				continue;
			}
			var shape = fl.GetShape();
			var shapeType = shape.GetType();
			var shapeId = node.GetUserData();
			context.fillStyle = currentGame.getColorForId(shapeId);
			if (shapeType == 0) {  //circle
					context.strokeStyle = "#CCCCCC";
					// context.fillStyle = "#FFFF00";
					context.beginPath();
					context.arc(position.get_x(),position.get_y(),shape.get_m_radius(),0,Math.PI*2,true);
					context.closePath();
					context.stroke();
					context.fill();
			}
		}
		node = node.GetNext();	
	}


    context.restore();
}


window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
})();

function animate() {
    if ( run )
        requestAnimFrame( animate );
    step();
}

function pause() {
    run = !run;
    if (run)
        animate();    
}