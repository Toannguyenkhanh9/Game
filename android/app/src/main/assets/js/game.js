
gameurl = ' ';
imgUrl = " ";


var openid = '';
var GlobalLevel = 1;
window.GlobalLevel = 1;
var COREBALL_THEME = {
    // Premium dark gold theme inspired by the promo video.
    bgTop: '#030201',
    bgMid: '#0a0602',
    bgBottom: '#010100',

    gridDot: 'rgba(255, 202, 90, 0.045)',
    softRay: 'rgba(255, 188, 54, 0.022)',

    coreStart: '#fff7c5',
    coreMid: '#ffd15a',
    coreEnd: '#d27a03',
    coreBorder: 'rgba(255, 245, 196, 0.96)',
    coreGlow: 'rgba(255, 175, 21, 0.78)',

    ballStart: '#fff7cd',
    ballMid: '#ffd366',
    ballEnd: '#db8a08',
    ballBorder: 'rgba(255, 242, 196, 0.94)',
    ballGlow: 'rgba(255, 182, 24, 0.60)',

    queueStart: '#fff3bb',
    queueMid: '#ffc95c',
    queueEnd: '#cb7600',
    queueBorder: 'rgba(255, 238, 170, 0.94)',

    needle: 'rgba(255, 199, 86, 0.56)',
    textDark: '#331800',
    textLight: '#281100',

    passBg: '#080500',
    failBg: '#170402',
    runBg: '#030201'
};

// Lightweight visual FX layer. Only visuals are changed; gameplay state is untouched.
var COREBALL_FX = (function () {
    var shots = [];
    var impacts = [];
    var bursts = [];
    var trails = [];
    var state = null;

    function now() { return Date.now(); }
    function clamp01(v) { return Math.max(0, Math.min(1, v)); }
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }
    function lerp(a, b, t) { return a + (b - a) * t; }

    function shot(x1, y1, x2, y2) {
        var t = now();
        shots.push({ x1:x1, y1:y1, x2:x2, y2:y2, t:t, life:340 });
        for (var i = 0; i < 7; i++) {
            trails.push({
                x: x1,
                y: y1,
                x2: x2,
                y2: y2,
                d: i / 7,
                t: t + i * 16,
                life: 240 + Math.random() * 110,
                r: 1.8 + Math.random() * 2.6
            });
        }
    }

    function impact(x, y, dangerous) {
        var t = now();
        impacts.push({ x:x, y:y, t:t, life:340, dangerous:!!dangerous });
        for (var i = 0; i < 16; i++) {
            var a = Math.PI * 2 * i / 16 + Math.random() * 0.22;
            var speed = 70 + Math.random() * 110;
            bursts.push({
                x:x, y:y,
                vx:Math.cos(a) * speed,
                vy:Math.sin(a) * speed,
                r:1.6 + Math.random() * 3.2,
                t:t,
                life:360 + Math.random() * 220,
                dangerous:!!dangerous,
                glow:true
            });
        }
    }

    function pass(x, y) {
        var t = now();
        state = { type:'pass', x:x, y:y, t:t, life:1100 };
        for (var i = 0; i < 66; i++) {
            var a = Math.PI * 2 * i / 66 + Math.random() * 0.08;
            var speed = 85 + Math.random() * 220;
            bursts.push({
                x:x, y:y,
                vx:Math.cos(a) * speed,
                vy:Math.sin(a) * speed,
                r:1.8 + Math.random() * 4.1,
                t:t,
                life:620 + Math.random() * 420,
                dangerous:false,
                glow:true
            });
        }
    }

    function fail(x, y) {
        state = { type:'fail', x:x, y:y, t:now(), life:760 };
        impact(x, y, true);
    }

    function reset() {
        shots.length = 0;
        impacts.length = 0;
        bursts.length = 0;
        trails.length = 0;
        state = null;
    }

    function drawLightning(ctx, w, h, alpha) {
        function bolt(startX, endX, yMid, amp, color) {
            ctx.beginPath();
            ctx.moveTo(startX, yMid);
            var x = startX;
            var step = (endX - startX) / 8;
            for (var i = 1; i < 8; i++) {
                x += step;
                ctx.lineTo(x, yMid + (Math.random() * 2 - 1) * amp);
            }
            ctx.lineTo(endX, yMid);
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.shadowColor = color;
            ctx.shadowBlur = 18;
            ctx.stroke();
        }
        var left = 'rgba(255,214,137,' + (0.75 * alpha) + ')';
        var right = 'rgba(255,184,72,' + (0.68 * alpha) + ')';
        bolt(0, w * 0.24, h * 0.42, h * 0.035, left);
        bolt(w, w * 0.76, h * 0.42, h * 0.035, right);
        bolt(0, w * 0.2, h * 0.58, h * 0.028, 'rgba(255,157,63,' + (0.42 * alpha) + ')');
        bolt(w, w * 0.8, h * 0.58, h * 0.028, 'rgba(255,157,63,' + (0.42 * alpha) + ')');
    }

    function render(ctx, w, h) {
        if (!ctx) return;
        var t = now();
        var i, e, p, alpha, prog;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Tiny floating particles along the shot path.
        for (i = trails.length - 1; i >= 0; i--) {
            p = trails[i];
            prog = clamp01((t - p.t) / p.life);
            if (prog >= 1) { trails.splice(i, 1); continue; }
            var tx = lerp(p.x, p.x2, prog * 0.92);
            var ty = lerp(p.y, p.y2, prog * 0.92);
            alpha = (1 - prog) * 0.78;
            ctx.shadowColor = 'rgba(255,186,46,0.95)';
            ctx.shadowBlur = 14;
            ctx.fillStyle = 'rgba(255,230,145,' + alpha + ')';
            ctx.beginPath();
            ctx.arc(tx + Math.sin((t + i * 15) / 65) * 5 * (1 - prog), ty, p.r * (1 - prog * 0.4), 0, Math.PI * 2);
            ctx.fill();
        }

        // Main shooting streak.
        for (i = shots.length - 1; i >= 0; i--) {
            e = shots[i];
            prog = clamp01((t - e.t) / e.life);
            if (prog >= 1) { shots.splice(i, 1); continue; }
            var head = easeOutCubic(prog);
            var tail = Math.max(0, head - 0.62);
            var sx = e.x1 + (e.x2 - e.x1) * tail;
            var sy = e.y1 + (e.y2 - e.y1) * tail;
            var ex = e.x1 + (e.x2 - e.x1) * head;
            var ey = e.y1 + (e.y2 - e.y1) * head;

            var grad = ctx.createLinearGradient(sx, sy, ex, ey);
            grad.addColorStop(0, 'rgba(255,156,0,0)');
            grad.addColorStop(0.25, 'rgba(255,185,40,' + (0.36 * (1 - prog)) + ')');
            grad.addColorStop(0.72, 'rgba(255,215,112,' + (0.72 * (1 - prog * 0.22)) + ')');
            grad.addColorStop(1, 'rgba(255,255,236,' + (0.98 * (1 - prog * 0.35)) + ')');

            ctx.strokeStyle = grad;
            ctx.lineCap = 'round';
            ctx.shadowColor = 'rgba(255,183,32,0.98)';
            ctx.shadowBlur = 20;
            ctx.lineWidth = 8;
            ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();

            ctx.strokeStyle = 'rgba(255,250,220,' + (0.8 * (1 - prog)) + ')';
            ctx.shadowBlur = 10;
            ctx.lineWidth = 2.2;
            ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();

            var flare = ctx.createRadialGradient(ex, ey, 1, ex, ey, 16 + 18 * (1 - prog));
            flare.addColorStop(0, 'rgba(255,255,255,' + (0.95 * (1 - prog)) + ')');
            flare.addColorStop(0.25, 'rgba(255,243,174,' + (0.88 * (1 - prog)) + ')');
            flare.addColorStop(1, 'rgba(255,179,22,0)');
            ctx.fillStyle = flare;
            ctx.beginPath(); ctx.arc(ex, ey, 16 + 18 * (1 - prog), 0, Math.PI*2); ctx.fill();
        }

        // Impact rings.
        for (i = impacts.length - 1; i >= 0; i--) {
            e = impacts[i];
            prog = clamp01((t - e.t) / e.life);
            if (prog >= 1) { impacts.splice(i, 1); continue; }
            alpha = 1 - prog;
            ctx.shadowBlur = 16;
            ctx.shadowColor = e.dangerous ? 'rgba(255,72,28,.92)' : 'rgba(255,196,51,.95)';
            ctx.strokeStyle = e.dangerous ? 'rgba(255,97,52,'+alpha+')' : 'rgba(255,236,148,'+alpha+')';
            ctx.lineWidth = 2.8;
            ctx.beginPath(); ctx.arc(e.x, e.y, 7 + 34 * easeOutCubic(prog), 0, Math.PI*2); ctx.stroke();
            ctx.strokeStyle = e.dangerous ? 'rgba(255,70,18,' + (alpha * 0.55) + ')' : 'rgba(255,204,71,' + (alpha * 0.48) + ')';
            ctx.lineWidth = 8;
            ctx.beginPath(); ctx.arc(e.x, e.y, 5 + 16 * easeOutQuad(prog), 0, Math.PI*2); ctx.stroke();
        }

        // Spark particles.
        for (i = bursts.length - 1; i >= 0; i--) {
            p = bursts[i];
            prog = clamp01((t - p.t) / p.life);
            if (prog >= 1) { bursts.splice(i, 1); continue; }
            var sec = (t - p.t) / 1000;
            var px = p.x + p.vx * sec;
            var py = p.y + p.vy * sec + 42 * sec * sec;
            alpha = (1 - prog) * (1 - prog);
            ctx.shadowBlur = p.glow ? 10 : 6;
            ctx.shadowColor = p.dangerous ? 'rgba(255,51,24,.9)' : 'rgba(255,176,16,.95)';
            ctx.fillStyle = p.dangerous ? 'rgba(255,91,42,'+alpha+')' : 'rgba(255,231,118,'+alpha+')';
            ctx.beginPath(); ctx.arc(px, py, p.r * (1 - prog*0.35), 0, Math.PI*2); ctx.fill();
        }

        if (state) {
            prog = clamp01((t - state.t) / state.life);
            if (prog >= 1) {
                state = null;
            } else if (state.type === 'pass') {
                alpha = Math.sin(Math.min(1, prog * 2.2) * Math.PI / 2) * (1 - Math.max(0, prog - 0.72) / 0.28);
                var ringR = 56 + 210 * easeOutCubic(prog);
                var rg = ctx.createRadialGradient(state.x, state.y, 0, state.x, state.y, ringR);
                rg.addColorStop(0, 'rgba(255,244,187,' + (0.42 * alpha) + ')');
                rg.addColorStop(0.22, 'rgba(255,204,76,' + (0.22 * alpha) + ')');
                rg.addColorStop(0.5, 'rgba(255,150,12,' + (0.11 * alpha) + ')');
                rg.addColorStop(1, 'rgba(255,150,0,0)');
                ctx.fillStyle = rg; ctx.fillRect(0,0,w,h);

                // Sunburst behind the core.
                ctx.save();
                ctx.translate(state.x, state.y);
                ctx.rotate((t - state.t) / 700);
                for (i = 0; i < 18; i++) {
                    ctx.rotate((Math.PI * 2) / 18);
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(ringR * 0.12, -ringR * 1.02);
                    ctx.lineTo(-ringR * 0.12, -ringR * 1.02);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(255,215,94,' + (0.06 * alpha) + ')';
                    ctx.fill();
                }
                ctx.restore();

                ctx.strokeStyle = 'rgba(255,233,132,' + (0.95*alpha) + ')';
                ctx.lineWidth = 3.2;
                ctx.shadowColor = 'rgba(255,183,24,.95)';
                ctx.shadowBlur = 22;
                ctx.beginPath(); ctx.arc(state.x, state.y, ringR, 0, Math.PI*2); ctx.stroke();

                var disk = ctx.createRadialGradient(state.x, state.y, 1, state.x, state.y, 34 + 88 * easeOutCubic(prog));
                disk.addColorStop(0, 'rgba(255,255,255,' + (0.86 * alpha) + ')');
                disk.addColorStop(0.28, 'rgba(255,241,170,' + (0.76 * alpha) + ')');
                disk.addColorStop(1, 'rgba(255,196,49,0)');
                ctx.fillStyle = disk;
                ctx.beginPath(); ctx.arc(state.x, state.y, 34 + 88 * easeOutCubic(prog), 0, Math.PI*2); ctx.fill();

                ctx.globalCompositeOperation = 'source-over';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '900 ' + Math.max(26, Math.min(50, w * 0.094)) + 'px Arial, Helvetica, sans-serif';
                ctx.fillStyle = 'rgba(255,250,210,' + alpha + ')';
                ctx.shadowColor = 'rgba(255,163,10,.96)';
                ctx.shadowBlur = 22;
                ctx.fillText('LEVEL CLEARED!', w/2, Math.min(h-78, state.y + 168));
                ctx.globalCompositeOperation = 'lighter';
            } else {
                alpha = 1 - prog;
                ctx.fillStyle = 'rgba(170,15,5,' + (0.12*alpha) + ')';
                ctx.fillRect(0,0,w,h);
                drawLightning(ctx, w, h, alpha);
                ctx.strokeStyle = 'rgba(255,83,38,' + (0.75*alpha) + ')';
                ctx.lineWidth = 5;
                ctx.shadowColor = 'rgba(255,44,15,.9)';
                ctx.shadowBlur = 24;
                ctx.beginPath(); ctx.arc(state.x, state.y, 20 + 112 * easeOutCubic(prog), 0, Math.PI*2); ctx.stroke();
            }
        }

        ctx.restore();
    }

    return { shot:shot, impact:impact, pass:pass, fail:fail, reset:reset, render:render };
})();

// DOM-level presentation helpers for the promo-style UI.
var COREBALL_UI = (function () {
    var clearTimer = 0;
    var shakeTimer = 0;

    function byId(id) { return document.getElementById(id); }

    function setHudVisible(visible) {
        var hud = byId('promoHud');
        if (hud) hud.classList.toggle('show', !!visible);
    }

    function setLevel(level) {
        var el = byId('promoHudLevel');
        if (el) el.textContent = 'Level ' + level;
        var num = byId('promoHudCoin');
        if (num) num.textContent = Math.max(0, Number(level || 1) - 1);
        var bar = byId('promoHudProgress');
        if (bar) {
            var p = 24 + ((Number(level || 1) * 13) % 62);
            bar.style.width = p + '%';
        }
    }

    function tap(evt) {
        var layer = byId('promoTapLayer');
        if (!layer || !evt) return;
        var point = evt;
        if (evt.changedTouches && evt.changedTouches.length) point = evt.changedTouches[0];
        else if (evt.touches && evt.touches.length) point = evt.touches[0];
        var x = typeof point.clientX === 'number' ? point.clientX : window.innerWidth / 2;
        var y = typeof point.clientY === 'number' ? point.clientY : window.innerHeight * 0.78;
        var node = document.createElement('span');
        node.className = 'promo-tap-ripple';
        node.style.left = x + 'px';
        node.style.top = y + 'px';
        node.innerHTML = '<i></i>';
        layer.appendChild(node);
        setTimeout(function () {
            if (node && node.parentNode) node.parentNode.removeChild(node);
        }, 520);
    }

    function shake(kind) {
        var stage = byId('stage');
        if (!stage) return;
        clearTimeout(shakeTimer);
        stage.classList.remove('shake-soft', 'shake-hard');
        // Force a reflow so rapid consecutive shots can retrigger the animation.
        void stage.offsetWidth;
        stage.classList.add(kind === 'hard' ? 'shake-hard' : 'shake-soft');
        shakeTimer = setTimeout(function () {
            stage.classList.remove('shake-soft', 'shake-hard');
        }, kind === 'hard' ? 380 : 180);
    }

    function levelClear(level) {
        var overlay = byId('levelClearOverlay');
        var levelEl = byId('levelClearNumber');
        if (!overlay) return;
        if (levelEl) levelEl.textContent = 'LEVEL ' + level;
        clearTimeout(clearTimer);
        overlay.classList.remove('show');
        void overlay.offsetWidth;
        overlay.classList.add('show');
        clearTimer = setTimeout(function () { overlay.classList.remove('show'); }, 1050);
    }

    function hideClear() {
        clearTimeout(clearTimer);
        var overlay = byId('levelClearOverlay');
        if (overlay) overlay.classList.remove('show');
    }

    return {
        setHudVisible:setHudVisible,
        setLevel:setLevel,
        tap:tap,
        shake:shake,
        levelClear:levelClear,
        hideClear:hideClear
    };
})();


// Audio + haptic layer. Uses local audio files and persists the user's mute preference.
var COREBALL_AUDIO = (function () {
    var STORAGE_KEY = 'core-ball-sound-enabled';
    var enabled = true;
    var started = false;
    var background = null;
    var sfx = {};

    try {
        var saved = window.localStorage ? window.localStorage.getItem(STORAGE_KEY) : null;
        if (saved === '0') enabled = false;
    } catch (e) {}

    function makeAudio(src, volume, loop) {
        var a = new Audio(src);
        a.preload = 'auto';
        a.volume = volume;
        a.loop = !!loop;
        a.setAttribute('playsinline', '');
        return a;
    }

    background = makeAudio('audio/background.mp3', 0.22, true);
    function makePool(src, volume, size) {
        var pool = [];
        var count = Math.max(2, size || 3);
        for (var i = 0; i < count; i++) {
            pool.push(makeAudio(src, volume, false));
        }
        return { pool: pool, index: 0 };
    }

    // Reuse a small fixed pool instead of cloneNode() on every shot.
    // This avoids repeatedly allocating Android WebView media players.
    sfx.shoot = makePool('audio/shoot.wav', 0.34, 4);
    sfx.impact = makePool('audio/impact.wav', 0.34, 4);
    sfx.fail = makePool('audio/fail.wav', 0.58, 2);
    sfx.clear = makePool('audio/clear.wav', 0.52, 2);

    function updateButton() {
        var btn = document.getElementById('soundToggle');
        if (!btn) return;
        btn.classList.toggle('is-muted', !enabled);
        btn.setAttribute('aria-label', enabled ? 'Mute sound' : 'Turn sound on');
        btn.setAttribute('title', enabled ? 'Sound on' : 'Sound off');
    }

    function safePlay(audio) {
        if (!audio || !enabled) return;
        try {
            var p = audio.play();
            if (p && typeof p.catch === 'function') p.catch(function () {});
        } catch (e) {}
    }

    function playSfx(name) {
        if (!enabled || !sfx[name]) return;
        try {
            var entry = sfx[name];
            var pool = entry.pool || [];
            if (!pool.length) return;
            var a = pool[entry.index % pool.length];
            entry.index = (entry.index + 1) % pool.length;
            try { a.pause(); } catch (_) {}
            try { a.currentTime = 0; } catch (_) {}
            var p = a.play();
            if (p && typeof p.catch === 'function') p.catch(function () {});
        } catch (e) {}
    }

    function startMusic() {
        started = true;
        if (!enabled) return;
        safePlay(background);
    }

    function pauseMusic() {
        if (!background) return;
        try { background.pause(); } catch (e) {}
    }

    function setEnabled(next) {
        enabled = !!next;
        try {
            if (window.localStorage) window.localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
        } catch (e) {}
        updateButton();
        if (enabled && started) startMusic();
        else pauseMusic();
    }

    function toggle() { setEnabled(!enabled); }

    function unlock() {
        // Called from a real user gesture so iOS/Android WebView may start media playback.
        started = true;
        if (!enabled) return;
        try {
            background.muted = true;
            var p = background.play();
            if (p && typeof p.then === 'function') {
                p.then(function () {
                    background.pause();
                    background.currentTime = 0;
                    background.muted = false;
                    startMusic();
                }).catch(function () {
                    background.muted = false;
                    startMusic();
                });
            } else {
                background.muted = false;
                startMusic();
            }
        } catch (e) {
            try { background.muted = false; } catch (_) {}
            startMusic();
        }
    }

    function bindButton() {
        updateButton();
        var btn = document.getElementById('soundToggle');
        if (!btn || btn.__coreBallBound) return;
        btn.__coreBallBound = true;
        ['mousedown', 'touchstart'].forEach(function (name) {
            btn.addEventListener(name, function (evt) {
                evt.stopPropagation();
            }, { passive: false });
        });
        btn.addEventListener('click', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            if (!started) started = true;
            toggle();
        });
    }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) pauseMusic();
        else if (enabled && started) startMusic();
    });

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindButton);
    else setTimeout(bindButton, 0);

    return {
        unlock: unlock,
        startMusic: startMusic,
        pauseMusic: pauseMusic,
        toggle: toggle,
        setEnabled: setEnabled,
        isEnabled: function () { return enabled; },
        shoot: function () { playSfx('shoot'); },
        impact: function () { playSfx('impact'); },
        fail: function () { playSfx('fail'); },
        clear: function () { playSfx('clear'); }
    };
})();

var COREBALL_HAPTIC = (function () {
    function nativeFallback(kind) {
        if (!window.ReactNativeWebView || typeof window.ReactNativeWebView.postMessage !== 'function') return false;
        try {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'CORE_BALL_HAPTIC',
                kind: kind || 'impact',
                source: 'game'
            }));
            return true;
        } catch (e) { return false; }
    }

    function vibrate(pattern, kind) {
        // In React Native WebView prefer the native bridge for consistent Android haptics.
        if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
            return nativeFallback(kind);
        }

        // Standalone browser / non-RN WebView fallback.
        try {
            if (navigator && typeof navigator.vibrate === 'function') {
                var result = navigator.vibrate(pattern);
                if (result !== false) return true;
            }
        } catch (e) {}
        return false;
    }

    return {
        impact: function () { return false; },
        success: function () { vibrate([28, 35, 42], 'success'); },
        error: function () { vibrate([90, 45, 140], 'error'); }
    };
})();

var reg = new RegExp("[?&]" + 'openid' + "=([^?&]*)[&]?", "i");
var match = window.location.search.match(reg);
match == null ? "" : match[1];
if (match) {
    openid = match[1];
}
// --- HÀM GIAO TIẾP VỚI REACT NATIVE CỦA BẠN ---
window.sendDataToReactNativeApp = async () => {
    if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage('CORE_BALL_SHOW_REWARDED_REVIVE');
    } else {
        console.log("App đang chạy trên trình duyệt web, không tìm thấy ReactNativeWebView");
    }
};

// Gọi interstitial khi người chơi đã chuyển sang màn mới từ màn 2 trở đi.
window.sendCoreBallLevelInterstitial = function (level) {
    if (!window.ReactNativeWebView || Number(level) < 2) {
        return;
    }

    window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'CORE_BALL_SHOW_INTERSTITIAL_LEVEL',
        level: Number(level),
        requestId: 'core_ball_level_' + level + '_' + Date.now()
    }));
};
function coreBallT(key) {
    if (window.CoreBallI18n && typeof window.CoreBallI18n.t === 'function') {
        return window.CoreBallI18n.t(key);
    }

    var fallback = {
        level: 'Level',
        watchAd: 'Watch ad',
        loadingButton: 'Opening ad...',
        loadingText: 'Opening ad...<br>Please wait a moment.',
        reviveText: 'You failed!<br>Watch an ad to revive this level?'
    };

    return fallback[key] || key;
}
"undefined" == typeof window.define && (window.define = function () { }, window.define.amd = 1),
    "undefined" == typeof window.$AJB && (window.$AJB = {}),
    $AJB.lib = {},
    $AJB.general = {},
    $AJB.page = {},
    $AJB.lib.stopEvent = function () {
        "use strict";
        return function (a) {
            a && (a.preventDefault ? (a.preventDefault(), a.stopPropagation()) : (a.returnValue = !1, a.cancelBubble = !0))
        }
    },
    $AJB.lib.Storage = function () {
        "use strict";
        var a = {
            setValue: function (a, b) {
                window.localStorage && (window.localStorage[a] = b)
            },
            getValue: function (a) {
                return window.localStorage ? window.localStorage[a] : void 0
            }
        };
        return a
    },
    $AJB.general.BeginStage = function () {
        "use strict";

        function a(a) {
            function c() {
                b(h, "click", function () {
                    if (window.COREBALL_AUDIO) COREBALL_AUDIO.unlock();
                    e.fire(g, f)
                })
                // j.innerHTML = d.isAndroid ? "GO" : "▶"
            }
            var h = a.getElementsByClassName("button")[0],
                i = a.getElementsByClassName("text")[0],
                j = document.getElementById("txtAr"),
                k = {
                    show: function () {
                        a.style.display = ""
                    },
                    hide: function () {
                        a.style.display = "none"
                    },
                    level: function (a) {
                        f = a,
                            i.innerHTML = coreBallT("level") + " " + a
                    },
                    on: function (a, b) {
                        e.add(a, b)
                    },
                    off: function (a, b) {
                        e.remove(a, b)
                    }
                };
            return c(),
                k
        }
        var b = $AJB.lib.addEvent(),
            c = $AJB.lib.CustEvent(),
            d = $AJB.lib.util(),
            e = c(),
            f = 0,
            g = "start";
        return a
    },
    $AJB.general.Switcher = function () {
        "use strict";

        function a(a, b, c) {
            var d, e, f = null,
                g = !1,
                h = {
                    point: [0, 0],
                    enabled: !1,
                    color: COREBALL_THEME.runBg,
                    update: function () {
                        var a = h.point,
                            c = 30;
                        h.enabled && (0 === e ? (d = h.color, a[0] < b / 2 ? (a[0] = Math.min(a[0] + c, b / 2), h.point = a) : (h.point = a, g = !0)) : 1 === e && (d = "#000", a[0] > b / 2 ? (a[0] = Math.max(a[0] - c, b / 2), h.point = a) : (h.point = a, g = !0)))
                    },
                    render: function () {
                        var e = h.point;
                        h.enabled && (a.fillStyle = d, a.fillRect(e[0] - b / 2, e[1] - c / 2, b, c), g && (h.enabled = !1, f && f()))
                    },
                    switchStage: function (d, i) {
                        0 === d ? h.point = [-b / 2, c / 2] : 1 === d && (a.fillStyle = h.color, a.fillRect(0, 0, b, c), h.point = [b + b / 2, c / 2]),
                            h.enabled = !0,
                            g = !1,
                            e = d,
                            f = i
                    }
                };
            return h
        }
        return a
    },
    $AJB.lib.addEvent = function () {
        var a = $AJB.lib.util(),
            b = {
                click: "touchstart",
                mousedown: "touchstart",
                mouseup: "touchend"
            };
        return function (c, d, e, f) {
            if (!c) {
                console.warn("Core Ball: event target not found for", d);
                return;
            }

            c.addEventListener
                ? c.addEventListener(a.isMobile ? b[d] || d : d, e, f)
                : c.attachEvent
                    ? c.attachEvent("on" + d, e)
                    : c["on" + d] = e
        }
    },
    $AJB.general.Levels = function () {
        "use strict";

        function a(a, b) {
            return function () {
                var c = 0;
                return function () {
                    return c += a * b % 360
                }
            }
        }

        function b(a, b) {
            return function () {
                var c = 0,
                    d = 1,
                    e = +new Date;
                return function () {
                    var f = +new Date;
                    return f - e > b && (d = -d, e = f),
                        c += d * a % 360
                }
            }
        }

        function c(a, b, c, d) {
            return function () {
                var e = 0,
                    f = +new Date;
                return function () {
                    var g = +new Date;
                    return g - f > c && (a = b - a, f = g),
                        e += a * d % 360
                }
            }
        }

        function d(a) {
            var b = 1;
            return h(document.body, "mousedown", function () {
                b = -b
            }),


                function () {
                    var c = 0;
                    return function () {
                        return c += a * b % 360
                    }
                }
        }

        function e(a, b, c, d) {
            return h(document.body, "mousedown", function () {
                d = -d
            }),


                function () {
                    var e = 0,
                        f = +new Date;
                    return function () {
                        var g = +new Date;
                        return g - f > c && (a = b - a, f = g),
                            e += a * d % 360
                    }
                }
        }

        function f(a, b, c, d) {
            i[a] = {
                childs: k[b],
                queueCount: c,
                round: j[d]
            }
        }
        var g, h = $AJB.lib.addEvent(),
            i = {},
            j = {
                A1: a(1.5, 1),
                A2: a(1.5, -1),
                B1: a(2.5, 1),
                B2: a(2.5, -1),
                C1: b(2.2, 3e3),
                C2: b(3.5, 2e3),
                D1: c(2, 2.3, 1200, 1),
                D2: c(2, 2.3, 1200, -1),
                D3: c(4, 4.5, 1700, 1),
                D4: c(4, 4.5, 1700, -1),
                D5: c(4, 4.5, 1700, 1),
                D6: c(4, 4.5, 1700, -1),
                E1: d(2),
                E2: e(2, 2.3, 1e3, 1)
            },
            k = {
                0: [],
                2: [0, 180],
                3: [0, 120, 240],
                4: [0, 90, 180, 270],
                5: [0, 72, 144, 216, 288],
                6: [0, 60, 120, 180, 240, 300],
                7: [0, 52, 103, 155, 206, 258, 309],
                8: [0, 45, 90, 135, 180, 225, 270, 315],
                9: [0, 40, 80, 120, 160, 200, 240, 280, 320],
                10: [0, 36, 72, 108, 144, 180, 216, 252, 288, 324],
                11: [0, 33, 66, 99, 131, 164, 197, 230, 262, 295, 328],
                12: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
                13: [0, 28, 56, 84, 111, 139, 167, 194, 222, 250, 277, 305, 333],
                14: [0, 26, 52, 78, 103, 129, 155, 180, 206, 232, 258, 283, 309, 335],
                15: [0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336],
                16: [0, 23, 45, 68, 90, 113, 135, 158, 180, 203, 225, 248, 270, 293, 315, 338]
            },
            l = {
                1: ["4", 8, "A1"],
                2: ["6", 10, "A1"],
                3: ["2", 20, "A1"],
                4: ["8", 12, "A2"],
                5: ["12", 8, "A1"],
                6: ["10", 10, "A2"],
                7: ["12", 13, "A1"],
                8: ["16", 3, "A2"],
                9: ["0", 26, "A2"],
                10: ["16", 10, "A1"],
                11: ["10", 8, "B1"],
                12: ["6", 12, "B2"],
                13: ["12", 4, "B1"],
                14: ["8", 14, "B2"],
                15: ["8", 6, "B1"],
                16: ["5", 10, "B2"],
                17: ["6", 12, "B1"],
                18: ["8", 14, "B2"],
                19: ["0", 23, "B1"],
                20: ["10", 13, "B2"],
                21: ["4", 12, "C1"],
                22: ["6", 10, "C1"],
                23: ["8", 12, "C1"],
                24: ["7", 14, "C1"],
                25: ["2", 18, "C1"],
                26: ["4", 18, "C1"],
                27: ["0", 24, "C1"],
                28: ["4", 10, "C2"],
                29: ["6", 13, "C2"],
                30: ["4", 20, "C1"],
                31: ["6", 8, "D1"],
                32: ["2", 12, "D2"],
                33: ["3", 14, "D2"],
                34: ["3", 18, "D1"],
                35: ["8", 12, "D1"],
                36: ["7", 15, "D2"],
                37: ["16", 8, "D2"],
                38: ["0", 23, "D1"],
                39: ["12", 12, "D1"],
                40: ["12", 15, "D2"],
                41: ["5", 10, "E1"],
                42: ["6", 12, "E1"],
                43: ["3", 15, "E1"],
                44: ["3", 19, "E1"],
                45: ["0", 24, "E1"],
                46: ["2", 15, "E2"],
                47: ["4", 16, "E2"],
                48: ["12", 8, "E2"],
                49: ["3", 20, "E2"],
                50: ["16", 14, "E2"],
                51: ["4", 6, "D3"],
                52: ["4", 12, "D4"],
                53: ["6", 13, "D3"],
                54: ["0", 24, "D4"],
                55: ["4", 21, "D3"],
                56: ["16", 16, "A1"],
                57: ["4", 24, "C1"],
                58: ["4", 26, "D1"],
                59: ["4", 25, "E2"],
                60: ["13", 19, "E2"]
            };
        for (g in l) f(g, l[g][0], l[g][1], l[g][2]);
        return i
    },
    $AJB.general.Collide = function () {
        "use strict";
        var a = $AJB.lib.util(),
            b = {
                check: function (b, c, d) {
                    var e = b.childs(),
                        f = e.length,
                        g = Math.ceil(2 * c.rad());
                    for (d = d || 1; f--;)
                        if (c !== e[f].ball && a.getPointDistance(c.pos(), e[f].ball.pos()) <= g + Math.ceil(2 * d)) return !0;
                    return !1
                }
            };
        return b
    },
    $AJB.general.Tween = function () {
        "use strict";
        var a = {
            simple: function (b, c, d, e) {
                var f = (c - b) / e,
                    g = +new Date;
                return e > g - d ? (a.isEnd = !1, b + (g - d) * f) : (a.isEnd = !0, c)
            },
            isEnd: !0
        };
        return a
    },
    $AJB.general.BallQueue = function () {
        "use strict";

        function a(a, f, g, h, i) {
            function j() {
                var b, d, e = k(a),
                    j = e.length;
                for (b = 0; j > b; b++) d = c(h, null, e[b], null, i),
                    d.pos(f, g + 3 * d.rad() * b),
                    m.push(d)
            }

            function k(a) {
                for (var b = a, c = []; b--;) c.push(b + 1);
                return c
            }
            var l, m = [],
                n = [],
                o = b();
            return i = i || 1,
                l = {
                    ballList: m,
                    add: function () { },
                    remove: function (a) {
                        var b = m[a];
                        return m.splice(a, 1),
                            b
                    },
                    clear: function () {
                        n = [],
                            m = []
                    },
                    popup: function () {
                        var a = m.shift();
                        a.st = +new Date,
                            a.sv = a.pos().y,
                            n.push(a)
                    },
                    update: function () {
                        var a, b, c, h = n.length,
                            i = m.length;
                        if (h) {
                            for (b = n[0].rad(), a = g - 3 * b; h--;) n[h].pos(f, d.simple(n[h].sv, a, n[h].st, 50)),
                                c = n[n.length - 1].pos().y,
                                n[h].pos().y === a && (o.fire(e, n[h]), n.splice(h, 1));
                            for (; i--;) m[i].pos(f, c + 3 * b * (i + 1))
                        }
                    },
                    render: function () {
                        for (var a = m.length, b = n.length; a--;) m[a].render();
                        for (; b--;) n[b].render()
                    },
                    on: function (a, b) {
                        o.add(a, b)
                    },
                    off: function (a, b) {
                        o.remove(a, b)
                    },
                    destroy: function () {
                        for (var a = m.length; a--;) m[a].destroy();
                        o.destroy()
                    }
                },
                j(),
                l
        }
        var b = $AJB.lib.CustEvent(),
            c = $AJB.general.Ball(),
            d = $AJB.general.Tween(),
            e = "popup";
        return a
    },
    $AJB.general.Ball = function () {
        "use strict";

        function a(a, c, d, e, f) {
function g(textColor) {
    var c = b.getTextWidth(a, 0, 0, d, e);
    b.drawText(a, i - c / 2, j + e / 3, d, e, textColor || COREBALL_THEME.textDark)
}
            var h, i = 0,
                j = 0;
            return f = f || 1,
                c = (c || 12) * f,
                e = (e || 15) * f,
                h = {
                    pos: function (a, b) {
                        return "undefined" != typeof a && (i = a),
                            "undefined" != typeof b && (j = b), {
                            x: i,
                            y: j
                        }
                    },
                    scale: function (a) {
                        return "undefined" != typeof a && (f = a),
                            f
                    },
                    rad: function (a) {
                        return "undefined" != typeof a && (c = a),
                            c
                    },
render: function (e, type) {
    var text = "undefined" != typeof d ? d : e;
    var drawType = type || (c >= 35 * f ? 'core' : text ? 'queue' : 'ball');

    b.drawCircle(a, i, j, c, drawType);

    if ("undefined" != typeof text && text !== "") {
        var textColor = drawType === 'core' ? COREBALL_THEME.textLight : COREBALL_THEME.textDark;
        g(textColor);
    }
},
                    destroy: function () {
                        h = null
                    }
                }
        }
        var b = $AJB.lib.util();
        return a
    },
$AJB.lib.util = function () {
    "use strict";

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    return {
        drawBackground: function (ctx, w, h) {
            var theme = COREBALL_THEME;
            var t = Date.now();

            var bg = ctx.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, theme.bgTop);
            bg.addColorStop(0.48, theme.bgMid);
            bg.addColorStop(1, theme.bgBottom);
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, w, h);

            var cx = w / 2;
            var cy = h * 0.48;

            // Central ambience behind the core.
            var halo = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(w, h) * 0.7);
            halo.addColorStop(0, 'rgba(255, 207, 90, 0.14)');
            halo.addColorStop(0.22, 'rgba(255, 158, 19, 0.06)');
            halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = halo;
            ctx.fillRect(0, 0, w, h);

            // Wide theatrical rays like the promo video.
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(Math.sin(t / 5000) * 0.08);
            for (var i = 0; i < 22; i++) {
                ctx.rotate((Math.PI * 2) / 22);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(w * 0.06, -h);
                ctx.lineTo(-w * 0.06, -h);
                ctx.closePath();
                ctx.fillStyle = i % 2 ? 'rgba(255, 182, 52, 0.022)' : 'rgba(255, 222, 149, 0.015)';
                ctx.fill();
            }
            ctx.restore();

            // Elegant wave trails in the background.
            ctx.save();
            ctx.lineCap = 'round';
            for (var j = 0; j < 3; j++) {
                var y = h * (0.18 + j * 0.12) + Math.sin(t / 1600 + j) * 5;
                var grad = ctx.createLinearGradient(0, 0, w, 0);
                grad.addColorStop(0, 'rgba(255,170,18,0)');
                grad.addColorStop(0.18, 'rgba(255,211,117,' + (0.15 - j * 0.025) + ')');
                grad.addColorStop(0.5, 'rgba(255,196,72,' + (0.22 - j * 0.04) + ')');
                grad.addColorStop(0.82, 'rgba(255,152,24,' + (0.12 - j * 0.02) + ')');
                grad.addColorStop(1, 'rgba(255,152,24,0)');
                ctx.strokeStyle = grad;
                ctx.shadowColor = 'rgba(255,170,24,0.5)';
                ctx.shadowBlur = 9;
                ctx.lineWidth = j === 0 ? 3.6 : 2.2;
                ctx.beginPath();
                ctx.moveTo(-w * 0.08, y);
                ctx.bezierCurveTo(w * 0.18, y - 36, w * 0.38, y + 44, w * 0.56, y + 8);
                ctx.bezierCurveTo(w * 0.72, y - 22, w * 0.88, y + 22, w * 1.08, y - 6);
                ctx.stroke();
            }
            ctx.restore();

            // Fine star dust.
            ctx.fillStyle = theme.gridDot;
            for (var s = 0; s < 48; s++) {
                var px = (s * 67) % w;
                var py = (s * 131) % h;
                var tw = 0.22 + 0.18 * (1 + Math.sin((t / 680) + s)) / 2;
                ctx.fillStyle = 'rgba(255, 220, 130,' + tw + ')';
                ctx.beginPath();
                ctx.arc(px, py, (s % 5 === 0) ? 1.7 : 1.1, 0, Math.PI * 2);
                ctx.fill();
            }

            // Soft clouds at the bottom, matching the ad mood.
            ctx.save();
            var cloudGrad = ctx.createLinearGradient(0, h * 0.72, 0, h);
            cloudGrad.addColorStop(0, 'rgba(34,20,4,0)');
            cloudGrad.addColorStop(1, 'rgba(10,6,2,0.96)');
            ctx.fillStyle = cloudGrad;
            ctx.fillRect(0, h * 0.72, w, h * 0.28);
            ctx.fillStyle = 'rgba(28,18,6,0.96)';
            for (var c = 0; c < 8; c++) {
                var cr = w * (0.10 + (c % 3) * 0.03);
                var bx = (c / 7) * w;
                var by = h * 0.9 + (c % 2 ? -12 : 8);
                ctx.beginPath();
                ctx.arc(bx, by, cr, Math.PI, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        },

        drawCircle: function (ctx, x, y, r, type) {
            var theme = COREBALL_THEME;
            var t = Date.now();

            var isCore = type === 'core';
            var isQueue = type === 'queue';

            var start = isCore ? theme.coreStart : isQueue ? theme.queueStart : theme.ballStart;
            var mid = isCore ? theme.coreMid : isQueue ? theme.queueMid : theme.ballMid;
            var end = isCore ? theme.coreEnd : isQueue ? theme.queueEnd : theme.ballEnd;
            var border = isCore ? theme.coreBorder : isQueue ? theme.queueBorder : theme.ballBorder;
            var glow = isCore ? theme.coreGlow : theme.ballGlow;

            ctx.save();

            if (isCore) {
                var pulse = 1 + Math.sin(t / 180) * 0.04;
                var haloR = r * (1.30 + 0.08 * Math.sin(t / 260));
                var haloR2 = r * (1.52 + 0.05 * Math.cos(t / 340));
                ctx.shadowColor = 'rgba(255, 174, 18, 0.95)';
                ctx.shadowBlur = 26;
                ctx.strokeStyle = 'rgba(255, 212, 82, 0.30)';
                ctx.lineWidth = Math.max(2, r * 0.05);
                ctx.beginPath(); ctx.arc(x, y, haloR, 0, Math.PI * 2); ctx.stroke();
                ctx.strokeStyle = 'rgba(255, 235, 162, 0.18)';
                ctx.lineWidth = Math.max(1, r * 0.028);
                ctx.beginPath(); ctx.arc(x, y, haloR2, 0, Math.PI * 2); ctx.stroke();
                ctx.strokeStyle = 'rgba(255, 242, 168, 0.55)';
                ctx.beginPath(); ctx.arc(x, y, r * 1.08 * pulse, 0, Math.PI * 2); ctx.stroke();

                // Small rotating accent arcs.
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(t / 1000);
                ctx.shadowBlur = 12;
                ctx.lineWidth = Math.max(2, r * 0.032);
                ctx.strokeStyle = 'rgba(255, 230, 128, 0.52)';
                ctx.beginPath(); ctx.arc(0, 0, r * 1.18, 0.2, 1.2); ctx.stroke();
                ctx.beginPath(); ctx.arc(0, 0, r * 1.18, 3.5, 4.35); ctx.stroke();
                ctx.restore();
            }

            ctx.shadowColor = glow;
            ctx.shadowBlur = isCore ? 34 : isQueue ? 16 : 18;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            var gradient = ctx.createRadialGradient(
                x - r * 0.38,
                y - r * 0.4,
                r * 0.08,
                x,
                y,
                r
            );
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.12, start);
            gradient.addColorStop(0.55, mid);
            gradient.addColorStop(1, end);

            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Extra white hot center for the main core.
            if (isCore) {
                var inner = ctx.createRadialGradient(x, y, 1, x, y, r * 0.64);
                inner.addColorStop(0, 'rgba(255,255,255,0.98)');
                inner.addColorStop(0.18, 'rgba(255,247,196,0.9)');
                inner.addColorStop(1, 'rgba(255,213,78,0)');
                ctx.fillStyle = inner;
                ctx.beginPath(); ctx.arc(x, y, r * 0.64, 0, Math.PI * 2); ctx.fill();
            }

            ctx.shadowBlur = 0;
            ctx.lineWidth = Math.max(1, r * 0.06);
            ctx.strokeStyle = border;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(x - r * 0.25, y - r * 0.28, r * 0.22, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(255,255,255,0.24)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 220, 98, 0.40)';
            ctx.lineWidth = Math.max(1, r * 0.036);
            ctx.stroke();

            if (!isCore) {
                // Tiny pulse on pins and queue balls to keep them lively.
                ctx.beginPath();
                ctx.arc(x, y, r * (1.07 + 0.02 * Math.sin((t + x + y) / 220)), 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 214, 94, 0.16)';
                ctx.lineWidth = Math.max(1, r * 0.04);
                ctx.stroke();
            }

            ctx.restore();
        },

        drawLine: function (ctx, x1, y1, x2, y2, color, width) {
            var theme = COREBALL_THEME;

            ctx.save();
            ctx.strokeStyle = color || theme.needle;
            ctx.lineWidth = width || 1;
            ctx.lineCap = 'round';

            ctx.shadowColor = 'rgba(255, 181, 34, 0.34)';
            ctx.shadowBlur = 6;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            ctx.restore();
        },

        drawText: function (ctx, x, y, text, size, color) {
            ctx.save();

            ctx.font = '700 ' + size + 'px Arial, Helvetica, sans-serif';
            ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = color || COREBALL_THEME.textDark;

            ctx.shadowColor = 'rgba(255,255,255,0.18)';
            ctx.shadowBlur = 2;

            ctx.fillText(text, x, y);

            ctx.restore();
        },

        getTextWidth: function (ctx, b, c, text, size, color) {
            ctx.font = '700 ' + size + 'px Arial, Helvetica, sans-serif';
            return ctx.measureText(text).width;
        },

        getPointDistance: function (a, b) {
            return Math.floor(Math.sqrt(Math.floor(Math.pow(a.x - b.x, 2)) + Math.floor(Math.pow(a.y - b.y, 2))));
        },

        isMobile: /(mobile|iphone|ipod|ipad|ios|android|windows phone)/i.test(navigator.userAgent),
        isAndroid: /android/i.test(navigator.userAgent),
        isWeixin: /MicroMessenger/i.test(navigator.userAgent)
    };
};
    $AJB.general.Core = function () {
        "use strict";

        function a(a, d, e, f, g) {
            function h() {
                for (var a, b, c, d, e = l.length; e--;) a = 3 * Math.cos((l[e].angle + j.angle()) * Math.PI / 180) * m * g + n,
                    b = 3 * Math.sin((l[e].angle + j.angle()) * Math.PI / 180) * m * g + o,
                    c = a / Math.abs(a),
                    d = b / Math.abs(b),
                    l[e].ball.pos(a, b)
            }
            var i, j, k = 0,
                l = [],
                m = 50,
                n = a.width / 2,
                o = 4 * m * g;
            return g = g || 1,
                i = c(d, m, e, f, g),
                i.pos(n, o),
                j = {
                    pos: i.pos,
                    scale: i.scale,
                    rad: i.rad,
                    angle: function (a) {
                        return "undefined" != typeof a && (k = a),
                            k
                    },
                    addChild: function (a, b) {
                        l.push({
                            angle: a,
                            ball: b
                        })
                    },
                    clear: function () {
                        l = []
                    },
                    childs: function () {
                        return l
                    },
                    update: function () {
                        h()
                    },
                    render: function () {
                        var c, e = l.length,
                            f = a.width,
                            h = a.height;
d.clearRect(0, 0, f, h);
b.drawBackground(d, f, h);

for (c = 0; e > c; c++) {
    b.drawLine(
        d,
        n,
        o,
        l[c].ball.pos().x,
        l[c].ball.pos().y,
        COREBALL_THEME.needle,
        1.2 * g
    );
    l[c].ball.render(null, 'ball');
}

i.render(null, 'core');
                    },
                    destroy: function () {
                        j.clear(),
                            i = null,
                            j = null
                    }
                }
        }
        var b = $AJB.lib.util(),
            c = $AJB.general.Ball();
        return a
    },
    $AJB.lib.CustEvent = function () {
        return function (a) {
            function b(a) {
                return Object.prototype.toString.call(a).slice(8, -1).toLowerCase()
            }
            var c = {};
            return !a && (a = {}), {
                add: function (a, d) {
                    if ("function" === b(d)) {
                        var e = c;
                        a = a.toLowerCase(), !e[a] && (e[a] = []),
                            e[a].push(d)
                    }
                },
                remove: function (a, d) {
                    var e, f = c[a];
                    if (a = a.toLowerCase(), "function" === b(d) && f && f.length)
                        for (e = f.length - 1; e >= 0; e--) f[e] === d && f.splice(e, 1)
                },
                fire: function (b) {
                    var d, e, f, g;
                    if (b = b.toLowerCase(), d = c[b], d && d.length)
                        for (e = Array.prototype.slice.call(arguments, 1), g = d.length, f = 0; g > f; f++) d[f].apply(a, e)
                },
                destroy: function () {
                    var a, b = c.length - 1;
                    for (a = b; a >= 0; a--) evts.splice(a, 1)
                }
            }
        }
    },
    $AJB.general.Scene = function () {
        "use strict";

        function a(a, b, l, m) {
            function n(a) {
                var g = a.childs,
                    h = g.length;
                for (y = a.round(), w && w.destroy(), w = c(b, l, B, 50, m); h--;) w.addChild(g[h], d(l, null, "", null, m));
                x && x.destroy(),
                    x = e(a.queueCount, b.width / 2, w.pos().y + 4 * w.rad(), l, m),
                    x.on("popup", function (a) {
                        w.addChild(90 - w.angle(), a);
                        var collided = f.check(w, a, m);
                        COREBALL_FX.impact(a.pos().x, a.pos().y, collided);
                        COREBALL_UI.shake(collided ? 'hard' : 'soft');
                        if (!collided) {
                            COREBALL_AUDIO.impact();
                        }
                        collided ? (z = a, s()) : !x.ballList.length && r();
                    })
            }

            function o() {
                y && (w.angle(y()), w.update(), x.update())
            }

            function p() {
                var b, c, d, e, f = w.childs(),
                    g = f.length,
                    h = 25;
                for (a.style.backgroundColor = u.bgColor; g--;) b = f[g].angle + w.angle(),
                    c = Math.cos(b * Math.PI / 180) * h,
                    d = Math.sin(b * Math.PI / 180) * h,
                    e = f[g].ball.pos(),
                    f[g].ball.pos(e.x + c, e.y + d)
            }

            function q(a) {
                var b, c = [25, 15, 20, 15],
                    d = c.length,
                    e = 200,
                    f = e / d;
                for (w.update(), b = 1; d >= b; b++) a > f * b && z.rad(c[b - 1] * m)
            }

            function r() {
                if ("pass" !== A) {
                    a.style.backgroundColor = COREBALL_THEME.passBg;
                    A = "pass";
                    v = +new Date;
                    var cp = w.pos();
                    COREBALL_FX.pass(cp.x, cp.y);
                    COREBALL_UI.levelClear(B);
                    COREBALL_UI.shake('soft');
                    COREBALL_AUDIO.clear();
                    COREBALL_HAPTIC.success();
                }
            }

            function s() {
                if ("fail" !== A) {
                    a.style.backgroundColor = COREBALL_THEME.failBg;
                    A = "fail";
                    v = +new Date;
                    var fp = z && z.pos ? z.pos() : w.pos();
                    COREBALL_FX.fail(fp.x, fp.y);
                    COREBALL_UI.shake('hard');
                    COREBALL_AUDIO.fail();
                    COREBALL_HAPTIC.error();
                }
            }

            function t() {
                var a = "to be continued...",
                    c = h.getTextWidth(l, 0, 0, a, 30 * m);
                h.drawText(l, (b.width - c) / 2, 200 * m, a, 30 * m, "yellow")
            }
            var u, v, w, x, y, z, A = "run",
                B = 1;
            return u = {
                enabled: !1,
                run: function (b) {
                    var c = g[b];
                    B = b;
                    COREBALL_FX.reset();
                    COREBALL_UI.hideClear();
                    COREBALL_UI.setLevel(B);
                    c ? (u.enabled = !0, n(c), a.style.backgroundColor = COREBALL_THEME.runBg, A = "run") : t()
                },
                shot: function () {
                    if (x && x.ballList.length) {
                        var sb = x.ballList[0].pos();
                        var cp = w.pos();
                        var targetY = cp.y + 3 * w.rad();
                        COREBALL_FX.shot(sb.x, sb.y, cp.x, targetY);
                        COREBALL_AUDIO.shoot();
                        x.popup();
                    }
                },
                update: function () {
                    var a;
                    u.enabled && ("run" === A ? o() : "pass" === A ? (p(), +new Date - v > 1e3 && (A = "", k.fire(i))) : "fail" === A && (a = +new Date - v, q(a), a > 1e3 && (A = "", k.fire(j))))
                },
                render: function () {
                    if (u.enabled) {
                        w.render();
                        x.render();
                        COREBALL_FX.render(l, b.width, b.height);
                    }
                },
                on: function (a, b) {
                    k.add(a, b)
                },
                off: function (a, b) {
                    k.remove(a, b)
                }
            }
        }
        var b = $AJB.lib.CustEvent(),
            c = $AJB.general.Core(),
            d = $AJB.general.Ball(),
            e = $AJB.general.BallQueue(),
            f = $AJB.general.Collide(),
            g = $AJB.general.Levels(),
            h = $AJB.lib.util(),
            i = "passed",
            j = "failed",
            k = b();
        return a
    },
    $AJB.general.Game = function () {
        "use strict";

        function a() {
            var a = document.body.scrollWidth || document.documentElement.scrollWidth,
                b = document.body.scrollHeight || document.documentElement.scrollHeight;
            r.width = a,
                r.height = b,
                i = l(x, a, b),
                s.style.backgroundColor = i.color,
                s.style.width = a + "px",
                s.style.height = b + "px",
                j = b / 560
        }

        function b() {
            // u.href = B.replace(/#\{level\}/, D)
        }

        function c() {
            p.isWeixin ? n(u, "mousedown", function () {
                w.style.display = ""
            }) : p.isMobile && b()
        }

function d(a) {
    var nextLevel = +a;

    if (coreBallFailLevel !== nextLevel) {
        coreBallFailLevel = nextLevel;
        coreBallFailCount = 0;
    }

    D = nextLevel;
    o.setValue(z, D);
    document.title = A.replace(/\#\{level\}/, D);

    GlobalLevel = D;
    window.GlobalLevel = D;
    COREBALL_UI.setLevel(D);

    C.level(D);
    !p.isWeixin && p.isMobile && b();
}
function isCoreBallModalOpen() {
    var reviveModal = document.getElementById("reviveModal");
    var confirmModal = document.getElementById("confirmModal");

    return window.COREBALL_MODAL_OPEN === true ||
        (reviveModal && reviveModal.style.display === "flex") ||
        (confirmModal && confirmModal.style.display === "flex");
}

function setReviveLoading(isLoading) {
    var btnYes = document.getElementById("btnReviveYes");
    var btnNo = document.getElementById("btnReviveNo");
    var text = document.getElementById("reviveModalText");

    if (btnYes) {
        btnYes.disabled = !!isLoading;
        btnYes.innerHTML = isLoading ? coreBallT("loadingButton") : coreBallT("watchAd");
    }

    if (btnNo) {
        btnNo.disabled = !!isLoading;
    }

    if (text) {
        text.innerHTML = isLoading ? coreBallT("loadingText") : coreBallT("reviveText");
    }
}

function showReviveModal() {
    var modal = document.getElementById("reviveModal");

    console.log("SHOW REVIVE MODAL - Level:", D, "modal:", modal);

    if (!modal) {
        resetToLevel1FromRevive();
        return;
    }

    window.COREBALL_MODAL_OPEN = true;
    COREBALL_UI.setHudVisible(false);
    setReviveLoading(false);

    modal.style.setProperty("display", "flex", "important");
    modal.style.setProperty("position", "fixed", "important");
    modal.style.setProperty("top", "0", "important");
    modal.style.setProperty("left", "0", "important");
    modal.style.setProperty("width", "100vw", "important");
    modal.style.setProperty("height", "100vh", "important");
    modal.style.setProperty("z-index", "999999", "important");
    modal.style.setProperty("align-items", "center", "important");
    modal.style.setProperty("justify-content", "center", "important");
}

function hideReviveModal() {
    var modal = document.getElementById("reviveModal");

    window.COREBALL_MODAL_OPEN = false;
    setReviveLoading(false);

    if (modal) {
        modal.style.display = "none";
    }
}

function resetToLevel1FromRevive() {
    hideReviveModal();

    coreBallFailLevel = 1;
    coreBallFailCount = 0;

    h.enabled = !1;
    r.style.display = "none";
    COREBALL_UI.setHudVisible(false);

    d(1);
    C.level(D);
    C.show();
}

function startCurrentLevelAfterRevive() {
    hideReviveModal();

    if (!h) {
        console.log("Scene chưa sẵn sàng, không thể hồi sinh.");
        return;
    }

    h.enabled = !1;
    r.style.display = "";
    COREBALL_UI.setHudVisible(true);
    COREBALL_UI.setLevel(D);
    C.hide();

    i.switchStage(1, function () {
        h.run(D);
    });
}

function requestRewardedAdForRevive() {
    setReviveLoading(true);

    try {
        if (window.sendDataToReactNativeApp) {
            window.sendDataToReactNativeApp();
        }

        // Khi test trên browser không có ReactNativeWebView thì cho hồi sinh luôn để dễ test.
        if (!window.ReactNativeWebView) {
            setTimeout(function () {
                window.coreBallReviveFromAd();
            }, 500);
        }
    } catch (err) {
        console.log("Rewarded ad revive error:", err);
        setReviveLoading(false);
    }
}

// React Native gọi hàm này sau khi user xem xong rewarded ad và nhận reward.
window.coreBallReviveFromAd = function () {
    // Reward earned: start a fresh retry cycle for the current level.
    coreBallFailLevel = D;
    coreBallFailCount = 0;
    startCurrentLevelAfterRevive();
};

// React Native gọi hàm này nếu user tắt quảng cáo hoặc không nhận reward.
window.coreBallRewardAdClosedWithoutReward = function () {
    resetToLevel1FromRevive();
};
        function e() {
            var btnReviveYes = document.getElementById("btnReviveYes"),
    btnReviveNo = document.getElementById("btnReviveNo");

btnReviveYes && n(btnReviveYes, "mousedown", function (evt) {
    q(evt);
    requestRewardedAdForRevive();
});

btnReviveNo && n(btnReviveNo, "mousedown", function (evt) {
    q(evt);
    resetToLevel1FromRevive();
});
n(document.body, "mousedown", function (a) {
    var b;

    if (isCoreBallModalOpen()) {
        q(a);
        return;
    }

    if (r.style.display !== "none") {
        COREBALL_UI.tap(a);
    }

    if (a && a.changedTouches)
        for (b = a.changedTouches.length; b--;) h.shot();
    else h.shot();

    "1" != a.target.getAttribute("data-capture") && q(a)
}),
                n(w, "mousedown", function () {
                    w.style.display = "none"
                }),
                n(v, "mousedown", function () {
                    E || (E = !0, t.style.display = "", coreBallFailLevel = 1, coreBallFailCount = 0, d(1), setTimeout(function () {
                        t.style.display = "none",
                            E = !1
                    }, 1e3))
                }),
                h.on("passed", function () {
                    coreBallFailCount = 0;
                    coreBallFailLevel = D + 1;
                    i.switchStage(0, function () {
                        h.enabled = !1,
                            COREBALL_UI.setHudVisible(false),
                            d(D + 1),
                            window.sendCoreBallLevelInterstitial(D),
                            r.style.display = "none",
                            C.show(),

                            // 2. 分享接口
                            // 2.1 监听“分享给朋友”，按钮点击、自定义分享内容及分享结果接口
                            wx.onMenuShareAppMessage({
                                title: "Core Ball，我已玩到第" + D + "关了，你也来试试吧！",
                                desc: "Core Ball，我已玩到第" + D + "关了，你也来试试吧！",
                                link: gameurl,
                                imgUrl: imgUrl,
                                trigger: function (res) {
                                    // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
                                    // alert('用户点击发送给朋友');
                                },
                                success: function (res) {
                                    var UserInfo = new Object();
                                    UserInfo.openid = openid;
                                    UserInfo.shareLevel = D;
                                    // alert('已分享');
                                    ga('send', {
                                        'hitType': 'event', // Required.
                                        'eventCategory': 'wx', // Required.
                                        'eventAction': 'onMenuShareAppMessage_' + openid, // Required.
                                        'eventLabel': JSON.stringify(UserInfo),
                                        'eventValue': 1
                                    });
                                },
                                cancel: function (res) {
                                    // alert('已取消');
                                },
                                fail: function (res) {
                                    // alert(JSON.stringify(res));
                                }
                            }),

                            // 2.2 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
                            wx.onMenuShareTimeline({
                                title: "Core Ball，我已玩到第" + D + "关了，你也来试试吧！",
                                link: gameurl,
                                imgUrl: imgUrl,
                                trigger: function (res) {
                                    // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
                                    // alert('用户点击分享到朋友圈');
                                },
                                success: function (res) {
                                    // alert('已分享');
                                    var UserInfo = new Object();
                                    UserInfo.openid = openid;
                                    UserInfo.shareLevel = D;
                                    // alert('已分享');
                                    ga('send', {
                                        'hitType': 'event', // Required.
                                        'eventCategory': 'wx', // Required.
                                        'eventAction': 'onMenuShareTimeline_' + openid, // Required.
                                        'eventLabel': JSON.stringify(UserInfo),
                                        'eventValue': 1
                                    });
                                },
                                cancel: function (res) {
                                    // alert('已取消');
                                },
                                fail: function (res) {
                                    // alert(JSON.stringify(res));
                                }
                            }),

                            // 2.3 监听“分享到QQ”按钮点击、自定义分享内容及分享结果接口
                            wx.onMenuShareQQ({
                                title: "Core Ball，我已玩到第" + D + "关了，你也来试试吧！",
                                desc: "Core Ball，我已玩到第" + D + "关了，你也来试试吧！",
                                link: gameurl,
                                imgUrl: imgUrl,
                                trigger: function (res) {
                                    // alert('用户点击分享到QQ');
                                },
                                complete: function (res) {
                                    // alert(JSON.stringify(res));
                                },
                                success: function (res) {
                                    // alert('已分享');
                                    var UserInfo = new Object();
                                    UserInfo.openid = openid;
                                    UserInfo.shareLevel = D;
                                    // alert('已分享');
                                    ga('send', {
                                        'hitType': 'event', // Required.
                                        'eventCategory': 'wx', // Required.
                                        'eventAction': 'onMenuShareQQ_' + openid, // Required.
                                        'eventLabel': JSON.stringify(UserInfo),
                                        'eventValue': 1
                                    });
                                },
                                cancel: function (res) {
                                    // alert('已取消');
                                },
                                fail: function (res) {
                                    // alert(JSON.stringify(res));
                                }
                            })
                    })
                }),
h.on("failed", function () {
    if (coreBallFailLevel !== D) {
        coreBallFailLevel = D;
        coreBallFailCount = 0;
    }

    coreBallFailCount += 1;

    console.log(
        "FAILED LEVEL:", D,
        "FAIL COUNT:", coreBallFailCount,
        "FREE RETRIES LEFT:", Math.max(0, 2 - coreBallFailCount)
    );

    h.enabled = !1;
    r.style.display = "none";
    COREBALL_UI.setHudVisible(false);
    C.hide();

    // New rule for every level:
    // failure #1 and #2 = free retry, failure #3 = rewarded revive.
    if (coreBallFailCount <= 2) {
        setTimeout(function () {
            startCurrentLevelAfterRevive();
        }, 140);
        return;
    }

    setTimeout(function () {
        showReviveModal();
    }, 140);
}),
                C.on("start", function () {
                    r.style.display = "",
                        COREBALL_UI.setHudVisible(true),
                        COREBALL_UI.setLevel(D),
                        C.hide(),
                        i.switchStage(1, function () {
                            h.run(D)
                            // ga('send', {
                            //     'hitType': 'event', // Required.
                            //     'eventCategory': 'click', // Required.
                            //     'eventAction': 'start_' + openid, // Required.
                            //     'eventLabel': 'other',
                            //     'eventValue': 1
                            // })
                        })
                })
        }

        function f() {
            window.clearTimeout(F),
                h.update(),
                h.render(),
                i.update(),
                i.render(),
                F = window.setTimeout(f, 1e3 / y)
        }

        function g() {
            a(),
                h = k(document.body, r, x, j),
                e(),
                c(),
                C.level(D),
                C.show(),
                f()
        }
        var h, i, j, k = $AJB.general.Scene(),
            l = $AJB.general.Switcher(),
            m = $AJB.general.BeginStage(),
            n = $AJB.lib.addEvent(),
            o = $AJB.lib.Storage(),
            p = $AJB.lib.util(),
            q = $AJB.lib.stopEvent(),
            r = document.getElementById("stage"),
            s = document.getElementById("begin"),
            t = document.getElementById("tip"),
            u = document.getElementById("btnFW"),
            v = document.getElementById("btnReset"),
            w = document.getElementById("wxArrow"),
            x = r.getContext("2d"),
            y = 60,
            z = "core-ball-level",
            A = "Core Ball，我已玩到第#{level}关了，你也来试试吧!",
            B = "sinaweibo://share?content=Core Ball，我已玩到第#{level}关了，你也来试试吧！ http://timelineapp.pointstone.org/coreball/",
            C = m(s),
            D = +o.getValue(z) || 1,
            E = !1,
            F = 0,
            coreBallFailCount = 0,
            coreBallFailLevel = D,
            G = {
                start: g,
                shareTitle: A,
                shareLevel: D
            };
        return G;
    },
$AJB.page.index = function () {
    "use strict";

    window.coreBallGame = $AJB.general.Game();
    window.coreBallGame.start();

    GlobalLevel = window.coreBallGame.shareLevel || 1;
    window.GlobalLevel = GlobalLevel;
},
$AJB.page.index();

//GlobalLevel = $AJB.general.Game().shareLevel;

var ajax = {};
ajax.x = function () {
    if (typeof XMLHttpRequest !== 'undefined') {
        return new XMLHttpRequest();
    }
    var versions = [
        "MSXML2.XmlHttp.5.0",
        "MSXML2.XmlHttp.4.0",
        "MSXML2.XmlHttp.3.0",
        "MSXML2.XmlHttp.2.0",
        "Microsoft.XmlHttp"
    ];

    var xhr;
    for (var i = 0; i < versions.length; i++) {
        try {
            xhr = new ActiveXObject(versions[i]);
            break;
        } catch (e) { }
    }
    return xhr;
};

ajax.send = function (url, callback, method, data, sync) {
    var x = ajax.x();
    x.open(method, url, sync);
    x.onreadystatechange = function () {
        if (x.readyState == 4) {
            callback(x.responseText)
        }
    };
    if (method == 'POST') {
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    x.send(data)
};

ajax.get = function (url, data, callback, sync) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url + '?' + query.join('&'), callback, 'GET', null, sync)
};

ajax.post = function (url, data, callback, sync) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url, callback, 'POST', query.join('&'), sync)
};

// ajax.post('http://timelineapp.pointstone.org/ci/authorize/get_jssdk_info', {
//     url: window.location.href
// }, function(data) {
//     // console.log(data);
//     // alert(data);
//     var jssdk_info_obj = JSON.parse(data);

//     wx.config({
//         debug: false,
//         appId: jssdk_info_obj.appid,
//         timestamp: jssdk_info_obj.timestamp,
//         nonceStr: jssdk_info_obj.noncestr,
//         signature: jssdk_info_obj.signature,
//         jsApiList: [
//             'checkJsApi',
//             'onMenuShareTimeline',
//             'onMenuShareAppMessage',
//             'onMenuShareQQ',
//             'onMenuShareWeibo',
//             'hideMenuItems',
//             'showMenuItems',
//             'hideAllNonBaseMenuItem',
//             'showAllNonBaseMenuItem',
//             'translateVoice',
//             'startRecord',
//             'stopRecord',
//             'onRecordEnd',
//             'playVoice',
//             'pauseVoice',
//             'stopVoice',
//             'uploadVoice',
//             'downloadVoice',
//             'chooseImage',
//             'previewImage',
//             'uploadImage',
//             'downloadImage',
//             'getNetworkType',
//             'openLocation',
//             'getLocation',
//             'hideOptionMenu',
//             'showOptionMenu',
//             'closeWindow',
//             'scanQRCode',
//             'chooseWXPay',
//             'openProductSpecificView',
//             'addCard',
//             'chooseCard',
//             'openCard'
//         ]
//     });

//     wx.ready(function() {

//         // 2. 分享接口
//         // 2.1 监听“分享给朋友”，按钮点击、自定义分享内容及分享结果接口
//         wx.onMenuShareAppMessage({
//             title: "Core Ball，我已玩到第" + GlobalLevel + "关了，你也来试试吧！",
//             desc: "Core Ball，我已玩到第" + GlobalLevel + "关了，你也来试试吧！",
//             link: gameurl,
//             imgUrl: imgUrl,
//             trigger: function(res) {
//                 // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
//                 // alert('用户点击发送给朋友');
//             },
//             success: function(res) {
//                 var UserInfo = new Object();
//                 UserInfo.openid = openid;
//                 UserInfo.shareLevel = GlobalLevel;
//                 // alert('已分享');
//                 ga('send', {
//                     'hitType': 'event', // Required.
//                     'eventCategory': 'wx', // Required.
//                     'eventAction': 'onMenuShareAppMessage_' + openid, // Required.
//                     'eventLabel': JSON.stringify(UserInfo),
//                     'eventValue': 1
//                 });
//             },
//             cancel: function(res) {
//                 // alert('已取消');
//             },
//             fail: function(res) {
//                 // alert(JSON.stringify(res));
//             }
//         });

//         // 2.2 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
//         wx.onMenuShareTimeline({
//             title: "Core Ball，我已玩到第" + GlobalLevel + "关了，你也来试试吧！",
//             link: gameurl,
//             imgUrl: imgUrl,
//             trigger: function(res) {
//                 // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
//                 // alert('用户点击分享到朋友圈');
//             },
//             success: function(res) {
//                 // alert('已分享');
//                 var UserInfo = new Object();
//                 UserInfo.openid = openid;
//                 UserInfo.shareLevel = GlobalLevel;
//                 // alert('已分享');
//                 ga('send', {
//                     'hitType': 'event', // Required.
//                     'eventCategory': 'wx', // Required.
//                     'eventAction': 'onMenuShareTimeline_' + openid, // Required.
//                     'eventLabel': JSON.stringify(UserInfo),
//                     'eventValue': 1
//                 });
//             },
//             cancel: function(res) {
//                 // alert('已取消');
//             },
//             fail: function(res) {
//                 // alert(JSON.stringify(res));
//             }
//         });

//         // 2.3 监听“分享到QQ”按钮点击、自定义分享内容及分享结果接口
//         wx.onMenuShareQQ({
//             title: "Core Ball，我已玩到第" + GlobalLevel + "关了，你也来试试吧！",
//             desc: "Core Ball，我已玩到第" + GlobalLevel + "关了，你也来试试吧！",
//             link: gameurl,
//             imgUrl: imgUrl,
//             trigger: function(res) {
//                 // alert('用户点击分享到QQ');
//             },
//             complete: function(res) {
//                 // alert(JSON.stringify(res));
//             },
//             success: function(res) {
//                 // alert('已分享');
//                 var UserInfo = new Object();
//                 UserInfo.openid = openid;
//                 UserInfo.shareLevel = GlobalLevel;
//                 // alert('已分享');
//                 ga('send', {
//                     'hitType': 'event', // Required.
//                     'eventCategory': 'wx', // Required.
//                     'eventAction': 'onMenuShareQQ_' + openid, // Required.
//                     'eventLabel': JSON.stringify(UserInfo),
//                     'eventValue': 1
//                 });
//             },
//             cancel: function(res) {
//                 // alert('已取消');
//             },
//             fail: function(res) {
//                 // alert(JSON.stringify(res));
//             }
//         });

//         // 2.4 监听“分享到微博”按钮点击、自定义分享内容及分享结果接口
//         wx.onMenuShareWeibo({
//             title: "Core Ball，我已玩到第" + GlobalLevel + "关了，你也来试试吧！",
//             desc: "Core Ball，我已玩到第" + GlobalLevel + "关了，你也来试试吧！",
//             link: gameurl,
//             imgUrl: imgUrl,
//             trigger: function(res) {
//                 // alert('用户点击分享到微博');
//             },
//             complete: function(res) {
//                 // alert(JSON.stringify(res));
//             },
//             success: function(res) {
//                 // alert('已分享');
//                 var UserInfo = new Object();
//                 UserInfo.openid = openid;
//                 UserInfo.shareLevel = GlobalLevel;
//                 // alert('已分享');
//                 ga('send', {
//                     'hitType': 'event', // Required.
//                     'eventCategory': 'wx', // Required.
//                     'eventAction': 'onMenuShareWeibo_' + openid, // Required.
//                     'eventLabel': JSON.stringify(UserInfo),
//                     'eventValue': 1
//                 });
//             },
//             cancel: function(res) {
//                 // alert('已取消');
//             },
//             fail: function(res) {
//                 // alert(JSON.stringify(res));
//             }
//         });

//     });
// });
