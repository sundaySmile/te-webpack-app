export function isMobilePhone() {
    var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
    var flag = false;
    for (var v = 0; v < Agents.length; v++) {
        if (navigator.userAgent.indexOf(Agents[v]) > 0) {
            flag = true;
            break;
        }
    }
    return flag;
}

export function isEdge() {
  return /Edge/i.test(navigator.userAgent);
}

export function isChrome() {
  return !isEdge() && /Chrome/i.test(navigator.userAgent);
}

export function isIOS() {
  return /(iPhone|iPod|iPad)/i.test(navigator.platform);
}

export function isIOS10() {
  return (
    isIOS() &&
    navigator.userAgent.match(/OS ([\d_]+)/i) &&
    navigator.userAgent.match(/OS ([\d_]+)/i)[1].split('_').map(Number)[0] == 10
  );
}

export function isIOS11() {
  return (
    isIOS() &&
    navigator.userAgent.match(/OS ([\d_]+)/i) &&
    navigator.userAgent.match(/OS ([\d_]+)/i)[1].split('_').map(Number)[0] == 11
  );
}

export function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

export function isWechat() {
  return /MicroMessenger/i.test(navigator.userAgent);
}

export function isQQ() {
  return /\sQQ\//i.test(navigator.userAgent);
}

export function isWeibo() {
  return /Weibo/i.test(navigator.userAgent);
}

export function isX5PoweredBrowser() {
  return /TBS/i.test(navigator.userAgent);
}

export function isChromeBrowser() {
  return /Chrome/i.test(navigator.userAgent) && /Google Inc/i.test(navigator.vendor);
}

export function isFirefoxBrowser() {
  return /Firefox/i.test(navigator.userAgent);
}

export function isSafari() {
  return /Safari/i.test(navigator.userAgent) && !isChrome() && !isAndroid() && !isEdge();
}
