
(function($) { //scoping function to contain global variables

var gl, program;
var cam, params;
var statsUi;

function Camera() {

    var updateRotation = true;
    var rotX = 0;
    var rotY = 0;
    var rotMAX = Math.PI / 2;

    this.pos = [0, 0, 0];
    this.look = [0, 0, 1];
    this.up = [0, 1, 0];
    this.right = [1, 0, 0];

    this.update = function() {

        if (updateRotation) {

            updateRotation = false;

            var s = Math.sin(rotY);
            var c = Math.cos(rotY);

            this.look = [0, s, c];
            this.up = [0, c, -s];

            s = Math.sin(rotX);
            c = Math.cos(rotX);

            this.right = [c, 0, -s];

            this.look[0] = this.look[2] * s;
            this.look[2] = this.look[2] * c;

            this.up[0] = this.up[2] * s;
            this.up[2] = this.up[2] * c;
        }
    };

    this.setRotValues = function(dx, dy) {

        rotX += dx * 0.0015;
        rotY -= dy * 0.0015;

        if (rotY > rotMAX) {
            rotY = rotMAX;
        }
        else if (rotY < -rotMAX) {
            rotY = -rotMAX;
        }

        updateRotation = true;
    }

};

main();

function main() {

    init();
    initGui();
    animate();
}

function init() {

    params = {

        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,

        mouseX: 0,
        mouseY: 0,

        time: Date.now(),
    };

    cam = new Camera();

    var canvas =  document.getElementById('canvas');
    gl = canvas.getContext('webgl');

    program = initProgram();

    window.onresize = function() {

        params.screenWidth = window.innerWidth;
        params.screenHeight = window.innerHeight;

        canvas.width = params.screenWidth;
        canvas.height = params.screenHeight;

        gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.onresize();

    canvas.onmousemove = function(e) {
        // params.mouseX = event.clientX / canvas.width();
        // params.mouseY = 1 - (event.clientY / canvas.height());
        var dx = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        var dy = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
        cam.setRotValues(dx, dy);
    };

    canvas.onclick = function(e) {

        canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
        canvas.requestPointerLock();
    }

    window.onkeydown = function(e) {
        console.log(e);
    }
}

function initProgram() {

    var program = createProgram(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(program);

    var locVertexCoords = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(locVertexCoords);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.vertexAttribPointer(locVertexCoords, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 0,
        0, 1,
        1, 1,
        1, 0]), gl.STATIC_DRAW);

    var locResolution = gl.getUniformLocation(program, 'u_resolution');
    var locMouse = gl.getUniformLocation(program, 'u_mouse');
    var locTime = gl.getUniformLocation(program, 'u_time');

    var locCamPos = gl.getUniformLocation(program, 'u_camPos');
    var locCamLook = gl.getUniformLocation(program, 'u_camLook');
    var locCamUp = gl.getUniformLocation(program, 'u_camUp');
    var locCamRight = gl.getUniformLocation(program, 'u_camRight');

    program.draw = function() {

        gl.uniform2f(locResolution, canvas.width, canvas.height);
        // gl.uniform2f(locMouse, params.mouseX, params.mouseY);
        gl.uniform1f(locTime, (Date.now() - params.time) / 1000);

        gl.uniform3fv(locCamPos, cam.pos);
        gl.uniform3fv(locCamLook, cam.look);
        gl.uniform3fv(locCamUp, cam.up);
        gl.uniform3fv(locCamRight, cam.right);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    };

    return program;
}

function animate() {
    cam.update();
    program.draw();
    statsUi.update();
    window.requestAnimationFrame(animate);
}

function initGui() {

    statsUi = new Stats();
    statsUi.domElement.style.position = 'absolute';
    statsUi.domElement.style.left = '0px';
    statsUi.domElement.style.top = '0px';
    document.body.appendChild(statsUi.domElement);
}

function createProgram(gl, vertexShaderID, fragmentShaderID) {

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, document.getElementById(vertexShaderID).innerHTML);
    gl.compileShader(vertexShader);

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, document.getElementById(fragmentShaderID).innerHTML);
    gl.compileShader(fragmentShader);

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    return program;
}

})();