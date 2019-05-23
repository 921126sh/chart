/*! *****************************************************************************
작성자: 김성현
소속 : (주)iKooB 개발부 프론트 엔지니어
작성일: 2019.05.21
파일명: chart.js
설명: 원 차트 항목의 범위를 마우스 클릭이동 형식으로 유동적으로 변경이 가능한 차트다.
기술스펙:
 - HTML5
 - CSS3
 - ES5+ 

이력: 
 - 2019.05.22 [ 마우스가 항목의 범위로 이동 할 시 커서 스타일 변경 완료 ]
 - 2019.05.23 [ 마우스 클릭무브를 통한 항목 동적이동 완료 (*TODO 다음, 이전 항목의 범위를 넘어가지 못하는 로직 필요...)]

영역순서:
  1. variable definition 
  2. function definition 
  3. eventlistener definition 
  4. public
***************************************************************************** */



/** ====================================================================================================================================*
 *                                                      1. variable definition                                                          *  
 *======================================================================================================================================*/

/**
 * 캔버스 객체
 * @type {HTMLElement}
 */
var canvas = document.getElementById("canvas");

/**
 * 컨텍스트 객체
 * @type {object}
 */
var ctx = canvas.getContext("2d");

/**
 * 차트 도우미
 * @type {Object}
 */
var chartHelper;

/**
 * 반지름
 * @type {Number}
 */
var radius = null;

/**
 * 마우스 누름 여부
 * @type {Boolean}
 */
var isMouseDown = false;

/**
 * 항목영역 사각형의 x, y, w, h 목록
 * @type {Boolean}
 */
var itemRects = [];

/**
 * 항목 목록
 * @TODO 추후 서버에서 데이터 받아올것!
 * @type {Array}
 */
var items = [
    { "nm": "sh1", "high": 80, "x": null, "y": null },
    { "nm": "sh2", "high": 50, "x": null, "y": null },
    { "nm": "sh3", "high": 70, "x": null, "y": null },
    { "nm": "sh4", "high": 50, "x": null, "y": null },
    { "nm": "sh5", "high": 80, "x": null, "y": null },
];

/**
 * 선택된 항목의 인덱스
 * @type {Number}
 */
var selItemIdx = null;

/**
 * 이동중인 좌표
 * @type {Number}
 */
var curMovingCoordinate = { "x": null, "y": null };

var chartProperty = {
    circle: {
        STROKE_STYLE: '#E3E3E3'
    },
    item: {
        RECT_STROKE_STYLE: "#E3E3E3",
        RECT_FILL_STYLE: "white",
        RECT_LINE_WIDTH: 4,
        FONT: `${canvas.width / 2 * 0.80 * 0.11}px arial`,
        FONT_FILL_STYLE: "#000000"
    },

    direction: {
        STROKE_STYLE: "#E3E3E3",
        LINE_WIDTH: 6
    },
    range: {
        STROKE_STYLE: "red",
        FILL_STYLE: "red",
        GLOBAL_ALPHA: 0.2
    }
};


/** ====================================================================================================================================*
 *                                                      2. function definition                                                          *  
 *======================================================================================================================================*/

/**
 * 차트생성을 위한 초기화 함수다.
 */
(function init() {
    // 차트헬퍼를 초기화한다.
    chartHelper = chartHelperFn();

    // 원주율을 기준으로 영역을 초기화한다.
    radius = canvas.height / 2;
    ctx.translate(radius, radius);
    radius = radius * 0.80;

    // 차트생성을 요청한다.
    drawChart();
})();

/**
 * 차트를 생성한다.
 */
function drawChart() {
    // 0. 캔버스를 초기화한다.
    ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    // 1. 차트의 바탕인 원을 그린다.
    drawCircle();
    // 2. 차트의 항목을 그린다.
    drawItem();
    // 3. 차트의 항목을 표시할 방향 곡선을 그린다.
    drawDirection();
    // 4. 차트의 수치를 나타낼 범위를 그린다.
    drawRange();
}

/**
 * 원을 그린다.
 */
function drawCircle() {
    for (var idx = 0; idx < 11; idx++) {
        ctx.beginPath();
        ctx.arc(0, 0, radius / 10 * idx, 0, 2 * Math.PI);
        ctx.strokeStyle = chartProperty.circle.STROKE_STYLE;
        ctx.stroke();
    }
}

/**
 * 항목을 그린다.
 */
function drawItem() {
    ctx.globalAlpha = 1;

    var ang = 0,
        idx = 0,
        rect = {};
    itemRects = [];
    ctx.font = chartProperty.item.FONT;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    for (idx; idx < items.length; idx++) {
        ang = idx * Math.PI / (items.length / 2);
        if (items[idx].x !== null) {
            ang = getPointDegreeOrRadian(items[idx], true);
        }
        if (isMouseDown && idx === selItemIdx) {
            ang = getPointDegreeOrRadian(curMovingCoordinate, true);
        }

        x = Math.sin(ang) * radius * 1.15;
        y = -Math.cos(ang) * radius * 1.1;

        if (isMouseDown && idx === selItemIdx) {
            items[idx].x = x;
            items[idx].y = y;
        }
        rect = { "x": x, "y": y, "w": ctx.measureText(items[idx].nm).width + 4, "h": 40 };
        ctx.lineWidth = chartProperty.item.RECT_LINE_WIDTH;
        ctx.strokeStyle = chartProperty.item.RECT_STROKE_STYLE;
        ctx.fillStyle = chartProperty.item.RECT_FILL_STYLE;
        chartHelper.roundRectForItem(ctx, rect.x - 20, rect.y - 20, rect.w, rect.h, 10, true);
        ctx.fillStyle = chartProperty.item.FONT_FILL_STYLE;
        ctx.fillText(items[idx].nm, x, y);
        itemRects[idx] = rect;
    }
}

/**
 * 방향을 그린다.
 */
function drawDirection() {
    var ang;

    ctx.beginPath();
    ctx.strokeStyle = chartProperty.direction.STROKE_STYLE
    for (var idx = 0; idx < items.length; idx++) {
        ang = idx * Math.PI / (items.length / 2);
        if (items[idx].x !== null) {
            ang = getPointDegreeOrRadian(items[idx], true);
        }
        if (isMouseDown && idx === selItemIdx) {
            ang = getPointDegreeOrRadian(curMovingCoordinate, true);
        }

        x = Math.sin(ang) * radius;
        y = -Math.cos(ang) * radius;
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.lineWidth = chartProperty.direction.LINE_WIDTH;
        ctx.stroke();
    }
}

/**
 * 범위를 그린다.
 */
function drawRange() {
    var x
        , y
        , ang
        , high;

    ctx.beginPath();
    for (var idx = 0; idx < items.length; idx++) {
        ang = idx * Math.PI / (items.length / 2);
        if (items[idx].x !== null) {
            ang = getPointDegreeOrRadian(items[idx], true);
        }
        if (isMouseDown && idx === selItemIdx) {
            ang = getPointDegreeOrRadian(curMovingCoordinate, true);
        }

        high = radius * (items[idx].high / 100);
        x = Math.sin(ang) * (high);
        y = -Math.cos(ang) * (high);

        idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.strokeStyle = chartProperty.range.STROKE_STYLE;
    ctx.fillStyle = chartProperty.range.FILL_STYLE;
    ctx.globalAlpha = chartProperty.range.GLOBAL_ALPHA;
    ctx.fill();
    ctx.stroke();
}

/**
 * 각도 혹은 라디안을 반환한다.
 * 
 * @param {Object} coor x, y 좌표값
 * @param {Boolean} isRadian 라디안반환 여부
 */
function getPointDegreeOrRadian(coor, isRadian) {
    return isRadian ?
        (180 - Math.atan2(coor.x, coor.y) * (180 / Math.PI)) * (Math.PI / 180) :
        180 - Math.atan2(coor.x, coor.y) * (180 / Math.PI);
}


/** ====================================================================================================================================*
 *                                                      3. eventlistener definition                                                     *  
 *======================================================================================================================================*/

canvas.onmousedown = function (event) {
    isMouseDown = true;
    selItemIdx = chartHelper.checkCursorRange(event);

    if (selItemIdx !== null) {
        prevDegree = getPointDegreeOrRadian(itemRects[selItemIdx === 0 ? items.length - 1 : selItemIdx - 1], true);
        nextDegree = getPointDegreeOrRadian(itemRects[selItemIdx === items.length - 1 ? 0 : selItemIdx + 1], true);
    }
}

canvas.onmousemove = function (e) {
    // TODO==== [START] 좌표 표시를 위한 임시로직
    var c = chartHelper.getMousePos(event);
    document.querySelector('p')
        .innerHTML = `X = ${c.x} Y = ${c.y} D = ${getPointDegreeOrRadian(curMovingCoordinate, false)}`;
    // ======== [END] 좌표 표시를 위한 임시로직

    chartHelper.checkCursorRange(event);
    if (isMouseDown && selItemIdx !== null) {
        curMovingCoordinate = { "x": c.x, "y": c.y }
        curDegree = getPointDegreeOrRadian(curMovingCoordinate, true);
        drawChart();
        
// TODO 클릭된 항목의 위치를 변경한다.
// if (curDegree > prevDegree && curDegree < nextDegree || curDegree < prevDegree && curDegree < nextDegree || curDegree > prevDegree && curDegree > nextDegree) {
// drawChart();
// }

    }
}

canvas.onmouseup = function (event) {
    isMouseDown = false;
    var c = chartHelper.getMousePos(event);

    if (selItemIdx !== null) {
        items[selItemIdx].x = c.x;
        items[selItemIdx].y = c.y;
    }
}

canvas.onmouseleave = function (event) {
    isMouseDown = false;
    selItemIdx = null;
}

/** ====================================================================================================================================*
 *                                                      4. public                                                                       *  
 *======================================================================================================================================*/

/**
 * 차트 헬퍼 함수이다.
 */
function chartHelperFn() {
    return {
        /**
         * 항목을 감싸는 사각형을 그린다.
         * 
         * @param {object} ctx 캔버스 컨텍스트
         * @param {Number} x x축
         * @param {Number} y y축
         * @param {Number} w 넓이
         * @param {Number} h 높이
         * @param {Number} radius 반지름
         * @param {Boolean} fill 채움 여부
         * @param {Boolean} stroke 그리기 여부
         */
        roundRectForItem: function (ctx, x, y, w, h, radius, fill, stroke) {
            if (typeof stroke === "undefined") {
                stroke = true;
            }
            if (typeof radius === "undefined") {
                radius = 5;
            }

            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + w - radius, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
            ctx.lineTo(x + w, y + h - radius);
            ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
            ctx.lineTo(x + radius, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
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

        /**
         * 커서활성화 영역인지 검사 한다.
         * @param {Event} e 클릭 이벤트 객체
         */
        checkCursorRange: function (e) {
            var p = this.getMousePos(e);
            var selIdx = null;

            itemRects.some((rect, idx) => {
                if (p.x >= rect.x - 20 && p.x <= rect.x - 20 + rect.w &&
                    p.y >= rect.y - 20 && p.y <= rect.y - 20 + rect.h) {
                    canvas.style.cursor = "pointer";
                    selIdx = idx;
                    return true;
                }

                canvas.style.removeProperty("cursor");
                return false;
            });

            return selIdx;
        },

        /**
         * 마우스의 좌표를 반환한다.
         * @param {Event} e 클릭 이벤트 객체
         */
        getMousePos: function (e) {
            var r = canvas.getBoundingClientRect();
            return {
                x: e.clientX - r.left - canvas.width / 2,
                y: e.clientY - r.top - canvas.height / 2
            };
        }
    }
}