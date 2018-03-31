/**
 * Created by cjl on 2017/8/10.
 */

function formatDuring(mss) {
    var days = parseInt2(mss / (1000 * 60 * 60 * 24));
    var hours = parseInt2((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = parseInt2((mss % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = ((mss % (1000 * 60)) / 1000).toFixed(0) ;
    if(days !== 0) {
        return fix(days, 2) + ":" + fix(hours, 2) + ":" + fix(minutes, 2) + ":" + fix(seconds, 2);
    } else if(hours !== 0){
        return fix(hours, 2) + ":" + fix(minutes, 2) + ":" + fix(seconds, 2);
    } else if(minutes !== 0){
        return fix(minutes, 2) + ":" + fix(seconds, 2);
    } else {
        return "00:" + fix(seconds, 2);
    }
}

function parseInt2(a) {
    if(typeof a === 'number') {
        return Math.floor(a);
    }
    return parseInt(a);
}

function fix(num, length) {
    return ('' + num).length < length ? ((new Array(length + 1)).join('0') + num).slice(-length) : '' + num;
}


function GetQueryString() {
    if(location.search) {
        const searchStr = location.search;
        const queryString = searchStr.slice(1);
        const queryArr = queryString.split('&');
        const queryResult = {};
        if (queryArr) {
            queryArr.forEach(item => {
                const itemArr = item.split('=');
                if (itemArr.length > 0) {
                    queryResult[itemArr[0]] = decodeURIComponent(itemArr[1]);
                }
            });
        }
        return queryResult;
    } else {
        return null;
    }
}

export { formatDuring, fix, GetQueryString };