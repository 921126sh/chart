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
var radius = null;

/**
 * 항목 목록
 * 
 * @type {Array}
 */
var items = [
    { "nm": "sh1", "high": 80, "position": null },
    { "nm": "sh2", "high": 50, "position": null },
    { "nm": "sh3", "high": 70, "position": null },
    { "nm": "sh4", "high": 50, "position": null },
    { "nm": "sh5", "high": 80, "position": null },
];

/**
 * 마우스 누름 여부
 * 
 * @type {Boolean}
 */
var isMouseDown = false;

/**
 * 
 * 
 * @type {Boolean}
 */
var rects = [];

var chartHelper;

/**
 * 차트 최초호출 함수다.
 */
(function init() {
    chartHelper = chartHelperFn();
    radius = canvas.height / 2;
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
    var ang = 0,
        idx = 0,
        rect = {};
    rects = [];

    ctx.font = radius * 0.11 + "px arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    for (idx; idx < items.length; idx++) {
        ang = idx * Math.PI / (items.length / 2);
        x = Math.sin(ang) * radius * 1.15;
        y = -Math.cos(ang) * radius * 1.1;
        rect = { "x": x - 20, "y": y - 20, "w": ctx.measureText(items[idx].nm).width + 4, "h": 40 };

        ctx.lineWidth = 4;
        ctx.strokeStyle = "#E3E3E3";
        ctx.fillStyle = "white";
        chartHelper.roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10, true);
        ctx.fillStyle = "#000000";
        ctx.fillText(items[idx].nm, x, y);
        rects.push(rect);
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

        x = Math.sin(ang) * radius;
        y = -Math.cos(ang) * radius;
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.lineWidth = 6;
        ctx.stroke();
    }

}
function cloneObject(obj) {
    return Object.assign({}, obj);
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
 * 
 * @param {MouseEvent} 마우스 이벤트 객체
 */
canvas.onmousedown = function (e) {
    isMouseDown = true;
}

/**
 * 마우스 무브
 * 
 * @param {MouseEvent} 마우스 이벤트 객체
 */
canvas.onmousemove = function (e) {
    // TODO 좌표 표시를 위한 임시로직
    var c = chartHelper.getMousePos(e);
    document.querySelector('p')
        .innerHTML = `X = ${c.x} Y = ${c.y}`;

    // 
    chartHelper.checkCursorRange(e);
}

/**
 * 마우스 업
 * 
 * @param {MouseEvent} 마우스 이벤트 객체
 */
canvas.onmouseup = function (e) {
    isMouseDown = false;
}

/**
 * 마우스 리브
 * 
 * @param {MouseEvent} 마우스 이벤트 객체
 */
canvas.onmouseleave = function (e) {
    isMouseDown = false;
}

/** ====================================================================================================================================*
 *                                                         public                                                                       *  
 *======================================================================================================================================*/

/**
 * 차트 헬퍼 함수이다.
 */
function chartHelperFn() {
    return {
        roundRect: function (ctx, x, y, width, height, radius, fill, stroke) {
            if (typeof stroke == "undefined") {
                stroke = true;
            }
            if (typeof radius === "undefined") {
                radius = 5;
            }
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            if (stroke) {
                ctx.stroke();
            }
            if (fill) {
                ctx.fill();
            }
        },

        //TODO 클릭이벤트로 접근 시 선택된 항목이 무엇인지 캐싱해놓기
        checkCursorRange: function (e) {
            var p = this.getMousePos(e);
            rects.some(rect => {
                if (p.x >= rect.x && p.x <= rect.x + rect.w &&
                    p.y >= rect.y && p.y <= rect.y + rect.h) {
                    canvas.style.cursor = "pointer";
                    return true;
                }

                canvas.style.removeProperty("cursor");
                return false;
            });
        },

        getMousePos: function (e) {
            var r = canvas.getBoundingClientRect();
            return {
                x: e.clientX - r.left - canvas.width / 2,
                y: e.clientY - r.top - canvas.height / 2
            };
        }
    }
}



