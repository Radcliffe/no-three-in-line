$(document).ready(function() {
    var N = 6;
    var arr = [];
    var dots = [];
    var selected = {};
    var selectedCount = 0;
    let grid = $('#grid');
    let score = $('#score');
    let scoreboard = $('#scoreboard');
    let restart = $('#restart');
    let input = $('input');
    let instructions = $('#instructions');
    let topScore = $('#top-score');
    var wait = 0;
    makeGrid(N);
    topScore.html(2*N);

    grid.on('click', '.dot', clickHandler);
    restart.on('click', restartHandler);
    input.on('change', inputHandler);

    function makeGrid(N) {
        grid.empty();
        arr.length = 0;
        dots.length = 0;
        var i, j, row, dot;
        for (i = 0; i < N; i++) {
            arr[i] = [];
            dots[i] = [];
            row = $(`<div class="row" id="row-${i}"></div>`);
            for (j = 0; j < N; j++) {
                dot = $(`<span class="dot" id="cell-${i}-${j}" row="${i}" col="${j}"></span>`);
                arr[i][j] = 0;
                dots[i][j] = dot;
                row.append(dot);
            }
            grid.append(row);
        }
    }

    function inputHandler(event) {
        event.preventDefault();
        let value = Number(this.value);
        if (!isNaN(value) && value >= 3 && value <= 20) {
            N = value;
            makeGrid(N);
            clearSelected();
            scoreboard.hide();
            instructions.show();
            selectedCount = 0;
            topScore.html(2*N);
        }
    }

    function clearSelected() {
        Object.keys(selected).forEach(function (key) {
            delete selected[key];
        });
    }

    function clickHandler(event) {
        if (wait > 0) {
            return false;
        }
        var target = $(event.target);
        var rowNo = Number(target.attr('row'));
        var colNo = Number(target.attr('col'));
        var i, j;
        if (selected[event.target.id]) {
            target.removeClass('selected');
            delete selected[event.target.id];
            removeLines(rowNo, colNo);
            selectedCount--;
            score.html(selectedCount);
            if (selectedCount == 0) {
                scoreboard.hide();
            }
            for (i = 0; i < N; i++) {
                for (j = 0; j < N; j++) {
                    if (arr[i][j] == 0) {
                        unblock(i, j);
                    }
                }
            }
        } else if (target.hasClass('blocked')) {
            var slopes = {};
            var keys = Object.keys(selected);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var cellId = key.split('-');
                var x1 = Number(cellId[1]);
                var y1 = Number(cellId[2]);
                var dx = x1 - rowNo;
                var dy = y1 - colNo;
                var g = gcd(dx, dy)
                if (dx < 0) {
                    g = -g;
                }
                dx = dx / g;
                dy = dy / g;
                if (dx == 0) {
                    dy = 1;
                }
                slope = dy + '/' + dx;
                if (slopes[slope]) {
                    x2 = slopes[slope][0];
                    y2 = slopes[slope][1];
                    highlight([[rowNo, colNo], [x1, y1], [x2, y2]]);
                    break;
                } else {
                    slopes[slope] = [x1, y1];
                }
            }
        } else {
            target.addClass('selected');
            instructions.hide();
            addLines(rowNo, colNo);
            selected[event.target.id] = 1;
            selectedCount++;
            score.html(selectedCount);
            scoreboard.show();
            for (i = 0; i < N; i++) {
                for (j = 0; j < N; j++) {
                    if (arr[i][j] > 0 && !isSelected(i, j)) {
                        block(i, j);
                    }
                }
            }
        }
    }

    function isSelected(rowNo, colNo) {
        return selected[`cell-${rowNo}-${colNo}`] === 1;
    }

    function block(rowNo, colNo) {
        dots[rowNo][colNo].addClass('blocked');
    }

    function unblock(rowNo, colNo) {
        dots[rowNo][colNo].removeClass('blocked');
    }

    function addLines(rowNo, colNo) {
        return addRemoveLines(rowNo, colNo, 1);

    }

    function removeLines(rowNo, colNo) {
        return addRemoveLines(rowNo, colNo, -1);
    }

    function addRemoveLines(rowNo, colNo, weight) {
        Object.keys(selected).forEach(function (key) {
            var dotId = key.split('-');
            var x = Number(dotId[1]);
            var y = Number(dotId[2]);
            var g = gcd(x - rowNo, y - colNo);
            var dx = (x - rowNo) / g;
            var dy = (y - colNo) / g;

            var i = x;
            var j = y;
            while (i >= 0 && i < N && j >= 0 && j < N) {
                arr[i][j] += weight;
                i += dx;
                j += dy;
            }

            i = x - dx;
            j = y - dy;
            while (i >= 0 && i < N && j >= 0 && j < N) {
                arr[i][j] += weight;
                i -= dx;
                j -= dy;
            }
        });
    }

    function gcd(x, y) {
        if (x < 0) x = -x;
        if (y < 0) y = -y;
        while (y > 0) {
            var z = x % y;
            x = y;
            y = z;
        }
        return x;
    }

    function highlight(arr) {
        wait += arr.length;
        arr.forEach(function (pt) {
            var x = pt[0];
            var y = pt[1];
            dots[x][y].addClass('highlight');
            setTimeout(function() {
                dots[x][y].removeClass('highlight');
                wait--;
            }, 500);
        });
    }

    function restartHandler(event) {
        event.preventDefault();
        scoreboard.hide();
        instructions.show();
        Object.keys(selected).forEach(function (key) {
            delete selected[key];
        });
        selectedCount = 0;
        $('.dot').removeClass('blocked');
        $('.dot').removeClass('selected');
        for (var i=0; i<N; i++) {
            for (var j=0; j<N; j++) {
                arr[i][j] = 0;
            }
        }
        wait = 0;
    }

});