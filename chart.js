/**
 * 캔버스 객체
 * 
 * @type {HTMLElement}
 */
var canvas = document.getElementById("canvas");

/**
 * 캔버스 객체
 * 
 * @type {object}
 */
var ctx = canvas.getContext("2d");

/**
 * 반지름
 * 
 * @type {Number}
 */
var radius = canvas.height / 2;

/**
 * 항목 목록
 * 
 * @type {Array}
 */
var items = [
    { "nm": "sh1", "high": 80 },
    { "nm": "sh2", "high": 50 },
    { "nm": "sh3", "high": 70 },
    { "nm": "sh4", "high": 50 },
    { "nm": "sh5", "high": 80 },
];

/**
 * 마우스 누름 여부
 * 
 * @type {Boolean}
 */
var isMouseDown = false;

/**
 * 차트 최초호출 함수다.
 */
(function init() {
    ctx.translate(radius, radius);
    radius = radius * 0.80;
    drawChart();
})();

/**
 * 차트를 생성한다.
 */
function drawChart() {
    drawCircle();
    drawItem();
    drawDirection();
    drawRange();
}

/**
 * 원을 그린다.
 */
function drawCircle() {
    for (var idx = 0; idx < 11; idx++) {
        ctx.beginPath();
        ctx.arc(0, 0, radius / 10 * idx, 0, 2 * Math.PI);
        ctx.strokeStyle = "#E3E3E3";
        ctx.stroke();
    }
}

/**
 * 항목을 그린다.
 */
function drawItem() {
    var ang;
    var idx;
    ctx.font = radius * 0.11 + "px arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    for (idx = 0; idx < items.length; idx++) {
        ang = idx * Math.PI / (items.length / 2);

        ctx.rotate(ang);
        ctx.translate(0, -radius * 1.15);
        ctx.rotate(-ang);
        ctx.fillText(items[idx].nm, 0, 0);
        ctx.rotate(ang);
        ctx.translate(0, radius * 1.15);
        ctx.rotate(-ang);
    }
}

/**
 * 방향을 그린다.
 */
function drawDirection() {
    var ang;
    ctx.beginPath();
    ctx.strokeStyle = "#E3E3E3";
    for (var idx = 0; idx < items.length; idx++) {
        ang = idx * Math.PI / (items.length / 2);
        ctx.lineWidth = radius * 0.01;
        ctx.lineCap = "round";
        ctx.moveTo(0, 0);
        ctx.rotate(ang);
        ctx.lineTo(0, -radius);
        ctx.stroke();
        ctx.rotate(-ang);
    }
}

/**
 * 범위를 그린다.
 */
function drawRange() {
    var x;
    var y;
    var ang;
    var high;

    ctx.beginPath();
    for (var idx = 0; idx < items.length; idx++) {
        ang = idx * Math.PI / (items.length / 2);
        high = radius * (items[idx].high / 100);
        x = Math.sin(ang) * (high);
        y = -Math.cos(ang) * (high);

        idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.globalAlpha = 0.2;
    ctx.fill();
    ctx.stroke();
}

/**
 * 마우스 다운
 * @param {MouseEvent} 마우스 이벤트 객체
 */
canvas.onmousedown = function (e) {
    isMouseDown = true;
    console.log(e.target)
}

/**
 * 마우스 무브
 * @param {MouseEvent} 마우스 이벤트 객체
 */
canvas.onmousemove = function (e) {


    document.getElementById('x')
        .innerHTML = "X:::::" + (e.clientX - ctx.canvas.offsetLeft - canvas.width / 2) + "Y::::" + (e.clientY - ctx.canvas.offsetTop - canvas.height / 2);
}

/**
 * 마우스 업
 * @param {MouseEvent} 마우스 이벤트 객체
 */
canvas.onmouseup = function (e) {
    isMouseDown = false;
}








/**
 * 마우스 리브
 * @param {MouseEvent} 마우스 이벤트 객체
 */
canvas.onmouseleave = function (e) {
    isMouseDown = false;
}