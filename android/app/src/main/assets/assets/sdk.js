function a0_0x56e0(_0x5dafd4, _0x3fb165) {
    const _0x311ea2 = a0_0x311e();
    return a0_0x56e0 = function(_0x56e040, _0x5d90da) {
        _0x56e040 = _0x56e040 - 0x187;
        let _0x357203 = _0x311ea2[_0x56e040];
        return _0x357203;
    }
    ,
    a0_0x56e0(_0x5dafd4, _0x3fb165);
}
const a0_0x79c14 = a0_0x56e0;
(function(_0x544b65, _0x16beba) {
    const _0x1d44cf = a0_0x56e0
      , _0x1f069a = _0x544b65();
    while (!![]) {
        try {
            const _0x36ef07 = parseInt(_0x1d44cf(0x198)) / 0x1 + parseInt(_0x1d44cf(0x18f)) / 0x2 + parseInt(_0x1d44cf(0x1a6)) / 0x3 * (parseInt(_0x1d44cf(0x1b7)) / 0x4) + -parseInt(_0x1d44cf(0x187)) / 0x5 * (parseInt(_0x1d44cf(0x1a0)) / 0x6) + -parseInt(_0x1d44cf(0x18b)) / 0x7 * (parseInt(_0x1d44cf(0x1af)) / 0x8) + parseInt(_0x1d44cf(0x18c)) / 0x9 * (parseInt(_0x1d44cf(0x1a3)) / 0xa) + -parseInt(_0x1d44cf(0x1c2)) / 0xb * (parseInt(_0x1d44cf(0x18e)) / 0xc);
            if (_0x36ef07 === _0x16beba)
                break;
            else
                _0x1f069a['push'](_0x1f069a['shift']());
        } catch (_0x4be3fb) {
            _0x1f069a['push'](_0x1f069a['shift']());
        }
    }
}(a0_0x311e, 0x5d594));
let requesting = ![];
window[a0_0x79c14(0x1ac)] = () => {
    return requesting;
}
;
let watched = []
  , complate = null;
function a0_0x311e() {
    const _0x4d9990 = ['emit', 'jsloaded', 'SDK_REWARDED_WATCH_COMPLETE', '286TauVKM', 'catch', 'hideBannerAd', 'localhost', 'GD_OPTIONS', '818730YKSLpD', 'Display', 'pauseAll', 'SDK_GAME_PAUSE', '1339338mhhKvi', '4203FWPFTb', 'local', '581928SHbpOm', '1360310rMgGZF', 'name', 'none', 'bannerDiv', 'main.min.js', 'resume', 'getElementById', 'bannerDiv\x20ok', 'audioEngine', '599679aAMSYz', 'info', 'location', 'href', 'game', '192.168', '__adErrorCallback', 'resumeAll', '12RUqBmY', 'onload', 'appendChild', '13810EHzODE', 'showBannerAd', 'log', '19191XBCAUB', 'SDK_GAME_START', 'script', 'interstitial', 'd8294d669a97415e8d077a24ff636a57', 'then', 'isAdPlaying', 'AdType', 'style', '16CWXCdM', 'createVideoAd', 'GameCanvas', 'gamedistribution-jssdk', 'createElement', '__adFinishedCallback', '127.0.0.1', 'SDK_READY', '268fMjYkQ', 'showAd', 'includes', 'gdsdk', 'display', 'head', 'rewarded', 'preloadAd'];
    a0_0x311e = function() {
        return _0x4d9990;
    }
    ;
    return a0_0x311e();
}
const createVideoAd = (_0x5cf8c5, _0x59a196) => {
    const _0x58b3a6 = a0_0x79c14;
    if (_0x5cf8c5 && (window[_0x58b3a6(0x19a)][_0x58b3a6(0x19b)]['includes'](_0x58b3a6(0x19d)) || window['location']['href'][_0x58b3a6(0x1b9)](_0x58b3a6(0x1b5)) || window[_0x58b3a6(0x19a)]['href'][_0x58b3a6(0x1b9)](_0x58b3a6(0x1c5))))
        return console[_0x58b3a6(0x1a5)](_0x58b3a6(0x18d)),
        _0x5cf8c5();
    const _0x87f5b0 = () => {
        const _0x2fe8b4 = _0x58b3a6;
        if (_0x59a196)
            return;
        window['__adErrorCallback'] && window[_0x2fe8b4(0x19e)](),
        window[_0x2fe8b4(0x19e)] = null,
        _0x5cf8c5 && _0x5cf8c5();
    }
    ;
    if (!window[_0x58b3a6(0x1ba)])
        return _0x87f5b0();
    if (requesting)
        return _0x87f5b0();
    requesting = !![],
    _0x5cf8c5 ? (watched = [],
    complate = _0x5cf8c5,
    gdsdk[_0x58b3a6(0x1b8)](_0x59a196 ? _0x58b3a6(0x1bd) : _0x58b3a6(0x1a9))['catch']( () => {
        const _0x5b0fe6 = _0x58b3a6;
        _0x5cf8c5 && _0x5cf8c5(),
        window[_0x5b0fe6(0x1b4)] = null,
        window['__adErrorCallback'] = null,
        requesting = ![];
    }
    )) : (complate = null,
    watched = [],
    gdsdk[_0x58b3a6(0x1b8)](_0x58b3a6(0x1bd))[_0x58b3a6(0x1c3)]( () => {
        const _0x2665f9 = _0x58b3a6;
        window[_0x2665f9(0x19e)] && window[_0x2665f9(0x19e)](),
        window['__adFinishedCallback'] = null,
        window[_0x2665f9(0x19e)] = null,
        requesting = ![];
    }
    ));
}
  , showBannerAd = () => {
    const _0xc15bd7 = a0_0x79c14
      , _0x1a7ce1 = document[_0xc15bd7(0x195)](_0xc15bd7(0x192));
    if (!_0x1a7ce1)
        return;
    _0x1a7ce1['style'][_0xc15bd7(0x1bb)] = 'block';
}
  , hideBannerAd = () => {
    const _0x57a4bd = a0_0x79c14
      , _0x5f4a41 = document['getElementById'](_0x57a4bd(0x192));
    if (!_0x5f4a41)
        return;
    _0x5f4a41[_0x57a4bd(0x1ae)][_0x57a4bd(0x1bb)] = _0x57a4bd(0x191);
}
;
window[a0_0x79c14(0x1c6)] = {
    'gameId': a0_0x79c14(0x1aa),
    'onEvent': function(_0x43ea0a) {
        const _0x59baa2 = a0_0x79c14;
        console['log'](_0x43ea0a[_0x59baa2(0x190)]);
        switch (_0x43ea0a['name']) {
        case _0x59baa2(0x1b6):
            document[_0x59baa2(0x195)](_0x59baa2(0x1b1))['parentNode'][_0x59baa2(0x1a2)](document[_0x59baa2(0x195)](_0x59baa2(0x192))),
            gdsdk['preloadAd']('interstitial'),
            gdsdk[_0x59baa2(0x1be)](_0x59baa2(0x1bd)),
            gdsdk[_0x59baa2(0x1b8)](gdsdk[_0x59baa2(0x1ad)][_0x59baa2(0x188)], {
                'containerId': _0x59baa2(0x192)
            })[_0x59baa2(0x1ab)]( () => console[_0x59baa2(0x199)](_0x59baa2(0x196)))[_0x59baa2(0x1c3)](_0x13ecec => console[_0x59baa2(0x199)](_0x13ecec));
            break;
        case _0x59baa2(0x1a7):
            requesting = ![],
            setTimeout( () => {
                const _0x264b97 = _0x59baa2;
                cc['game'][_0x264b97(0x194)]();
            }
            , 0x64),
            cc['audioEngine'][_0x59baa2(0x19f)](),
            cc[_0x59baa2(0x19c)][_0x59baa2(0x1bf)]('SDK_GAME_START');
            watched ? (window[_0x59baa2(0x1b4)] && window[_0x59baa2(0x1b4)](),
            window[_0x59baa2(0x1b4)] = null,
            window[_0x59baa2(0x19e)] = null) : (window['__adErrorCallback'] && window[_0x59baa2(0x19e)](),
            window[_0x59baa2(0x1b4)] = null,
            window['__adErrorCallback'] = null);
            complate && complate();
            break;
        case _0x59baa2(0x18a):
            setTimeout( () => {
                cc['game']['pause']();
            }
            , 0x64),
            cc[_0x59baa2(0x197)][_0x59baa2(0x189)](),
            cc[_0x59baa2(0x19c)]['emit'](_0x59baa2(0x18a));
            break;
        case _0x59baa2(0x1c1):
            watched = [];
            break;
        }
    }
},
function(_0x5b57ff, _0x3e5cd2, _0x1633f5) {
    const _0x57d47f = a0_0x79c14;
    var _0x431f57, _0x1a7511 = _0x5b57ff['getElementsByTagName'](_0x3e5cd2)[0x0];
    if (_0x5b57ff[_0x57d47f(0x195)](_0x1633f5))
        return;
    _0x431f57 = _0x5b57ff[_0x57d47f(0x1b3)](_0x3e5cd2),
    _0x431f57['id'] = _0x1633f5,
    _0x431f57['src'] = _0x57d47f(0x193),
    _0x431f57[_0x57d47f(0x1a1)] = () => {
        const _0x293e04 = _0x57d47f;
        window[_0x293e04(0x1b0)] = createVideoAd,
        window[_0x293e04(0x1a4)] = showBannerAd,
        window[_0x293e04(0x1c4)] = hideBannerAd,
        console[_0x293e04(0x1a5)](_0x293e04(0x1c0));
    }
    ,
    _0x5b57ff[_0x57d47f(0x1bc)]['appendChild'](_0x431f57);
}(document, a0_0x79c14(0x1a8), a0_0x79c14(0x1b2));
!(window['location'][a0_0x79c14(0x19b)][a0_0x79c14(0x1b9)](a0_0x79c14(0x19d)) || window[a0_0x79c14(0x19a)][a0_0x79c14(0x19b)][a0_0x79c14(0x1b9)]('localhost') || window[a0_0x79c14(0x19a)]['href'][a0_0x79c14(0x1b9)](a0_0x79c14(0x1b5))) && (console['log'] = () => {}
,
console['error'] = () => {}
);
