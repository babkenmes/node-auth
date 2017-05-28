
/// ***Requires bit6.js
var bit6CallHelper = function () {
    var _bit6Client;
    var _bit6PresCall;
    var _supCalls = [];
    var _socket ;
    function _initBit6(token, options, authDone, socket) {
        _socket = socket
        _bit6Client = typeof Bit6 != 'undefined' && Bit6 && Bit6.init ? Bit6.init(options) : new bit6.Client(options);
        _bit6Client.session.external(token, function (err) {
            if (err) {
                console.log('auth error', err.message);
            }
            else {
                console.log('auth done');
                if (authDone) {
                    authDone(_bit6Client);
                }
            }
        });
    }
    function _startOutgoingCall(to, callCallback, isSupCall) {
        to = "usr:" + to;
        var mediaMode = isSupCall ? 'p2p' : 'mix';
        var opts = {
            audio: true,
            video: false,
            screen: false,
            mode: mediaMode
        };
        var isPresCall = !isSupCall;
        var call = _bit6Client.startCall(to, opts);
        if (isPresCall) {
            _bit6PresCall = call;
            _attachCallEvents(callCallback, isPresCall);
            callCallback({ isCalling: true, inCall: false });
            _bit6PresCall.recording(true);
        }
        else {
            _supCalls.push(call);
            call.on('answer', function () {
                console.log('Sup listening now', call);
            });
        }
        call.connect();
        return call;
    }
    function _hangUp(callCallback) {
        _socket && _socket.emit("presentationCallOnline", false);
        var x = _bit6Client.dialogs.slice();
        for (var i in x) {
            console.log('multi-hangup: ', x[i]);
            x[i].hangup();
        }
        if (callCallback) callCallback({ isCalling: false, inCall: false });
    }
    function _attachIncomingCallEvents(callCallback, ringCallback, isSup) {
        _bit6Client.on('incomingCall', function (call) {
            console.log('Incoming call', call);
            var i = call.invite;
            var fromName = i.sender_name ? i.sender_name : _bit6Client.getNameFromIdentity(call.other);
            var groupName = i.group_name;
            var vid = call.options.video ? ' video' : '';
            var from, info;
            if (typeof groupName !== 'undefined') {
                from = groupName.length > 0 ? groupName : 'a group';
                from = 'Join ' + from + vid + ' call...';
                info = 'Invited by ' + fromName;
            }
            else {
                from = fromName + ' is' + vid + ' calling...';
                info = 'Do you dare to answer this call?';
            }

            if (isSup) {
                _supCalls.push(call)
                call.connect({ audio: false, video: false });
            }
            else {
                _bit6PresCall = call;
                ringCallback(_bit6PresCall);
                callCallback({ isCalling: true }, _bit6PresCall);
            }
            /// fuck you ponch && tiko 
            /// bit6CurrentCall = { 'dialog': c, 'from': from, 'info': info };
            _attachCallEvents(callCallback, !isSup);
        });
    }
    
   function stopRinging() {
        var audio = document.getElementById("ringtone");
        audio && audio.pause();
        audio && (audio.currentTime = 0);
   }
   function _logout() {
       _bit6Client && _bit6Client.session && _bit6Client.session.logout();
   }
   function _attachCallEvents(callCallback, isPresCall) {
        _bit6PresCall.on('progress', function () {
            console.log('CALL progress',_bit6PresCall);
            ///callCallback({ isCalling: true, inCall: false });
        });
        _bit6PresCall.on('answer', function () {
            console.log('CALL answered', _bit6PresCall);
            callCallback({ isCalling: false, inCall: true });
            if (isPresCall) {
                _socket && _socket.emit("presentationCallOnline", true);
                _bit6PresCall.recording(true);
            }
        });
        _bit6PresCall.on('error', function (err) {
            console.log('CALL error', _bit6PresCall, err);
        });
        _bit6PresCall.on('end', function () {
            if (isPresCall) {
                _socket && _socket.emit("presentationCallOnline", false);
            }
            callCallback({ isCalling: false, inCall: false });
            _hangUp();
            stopRinging();
            console.log('CALL ended', _bit6PresCall);
        });
    }
    return {
        initBit6: _initBit6,
        startOutgoingCall: _startOutgoingCall,
        hangUp: _hangUp,
        attachIncomingCallEvents: _attachIncomingCallEvents,
        attachCallEvents: _attachCallEvents,
        logout: _logout
    }
} ();

