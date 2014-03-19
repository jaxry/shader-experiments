
(function($) { //scoping function to contain global variables

$(document).ready(main);

var gl, program;
var params;
var statsUi;

function main() {

    init();
    initGui();
    animate();
}

function init() {
    
    params = {

        screenWidth: $(window).width(),
        screenHeight: $(window).height(),

        mouseX: 0,
        mouseY: 0,

        time: Date.now()
    };

    var canvas =  $('canvas');

    gl = canvas[0].getContext('webgl');
    program = initProgram();

    $(window).resize(function(event) {
        params.screenWidth = $(window).width();
        params.screenHeight = $(window).height();

        canvas.prop('width', params.screenWidth);
        canvas.prop('height', params.screenHeight);

        gl.viewport(0, 0, params.screenWidth, params.screenHeight);
    });
    $(window).trigger('resize');

    canvas.mousemove(function(event) {

        params.mouseX = event.clientX / canvas.width();
        params.mouseY = 1 - (event.clientY / canvas.height());
    });
}

function animate() {

    program.draw();
    statsUi.update();
    window.requestAnimationFrame(animate);
}

function initProgram() {

    var program = createProgram(gl, '#vertex-shader', '#fragment-shader');
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

    program.draw = function() {

        gl.uniform2f(locResolution, params.screenWidth, params.screenHeight);
        gl.uniform2f(locMouse, params.mouseX, params.mouseY);
        gl.uniform1f(locTime, (Date.now() - params.time) / 1000);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    };

    return program;
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
    gl.shaderSource(vertexShader, $(vertexShaderID).text());
    gl.compileShader(vertexShader);

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, $(fragmentShaderID).text());
    gl.compileShader(fragmentShader);

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    return program;
}

})(jQuery);