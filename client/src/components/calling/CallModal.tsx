import React, { useEffect, useRef, useState } from 'react';
import { getSocket } from '../../services/socketService';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, AlertCircle } from 'lucide-react';

export interface CallData {
  callId: string;
  conversationId: string;
  projectId: string;
  caller: {
    userId: string;
    displayName: string;
    avatarUrl?: string;
  };
  callType: 'audio' | 'video';
  isIncoming: boolean;
  targetUserId?: string;
}

interface CallModalProps {
  activeCall: CallData | null;
  onClose: () => void;
  currentUserId?: string;
}

export const CallModal: React.FC<CallModalProps> = ({ activeCall, onClose, currentUserId }) => {
  const [callState, setCallState] = useState<'ringing' | 'connecting' | 'connected' | 'ended' | 'error'>('ringing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!activeCall) return;

    const socket = getSocket();
    setCallState(activeCall.isIncoming ? 'ringing' : 'connecting');
    setCallDuration(0);

    // Default ICE Servers (STUN fallback)
    const rtcConfig: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const cleanupCall = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };

    const startWebRtc = async (isCaller: boolean, targetUser: string) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: activeCall.callType === 'video',
        });
        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection(rtcConfig);
        peerConnectionRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('webrtc_ice_candidate', {
              callId: activeCall.callId,
              candidate: event.candidate,
              targetUserId: targetUser,
            });
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'connected') {
            setCallState('connected');
            timerRef.current = setInterval(() => {
              setCallDuration((prev) => prev + 1);
            }, 1000);
          } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            setCallState('ended');
            setTimeout(onClose, 1500);
          }
        };

        if (isCaller) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc_offer', {
            callId: activeCall.callId,
            offer,
            targetUserId: targetUser,
          });
        }
      } catch (err: any) {
        console.error('WebRTC media access error:', err);
        setCallState('error');
        setErrorMessage(err.message || 'Camera/microphone access denied or unavailable');
      }
    };

    // Socket Event Listeners for Call Signaling
    const handleCallAccepted = (data: { callId: string; calleeUserId: string }) => {
      if (data.callId === activeCall.callId) {
        setCallState('connecting');
        startWebRtc(true, data.calleeUserId);
      }
    };

    const handleCallDeclined = () => {
      setCallState('ended');
      setErrorMessage('Call declined by peer');
      setTimeout(onClose, 1500);
    };

    const handleCallCancelled = () => {
      setCallState('ended');
      setErrorMessage('Call cancelled by caller');
      setTimeout(onClose, 1500);
    };

    const handleWebRtcOffer = async (data: { callId: string; offer: any; senderUserId: string }) => {
      if (data.callId === activeCall.callId && peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          socket.emit('webrtc_answer', {
            callId: activeCall.callId,
            answer,
            targetUserId: data.senderUserId,
          });
        } catch (err) {
          console.error('Error handling WebRTC offer:', err);
        }
      }
    };

    const handleWebRtcAnswer = async (data: { callId: string; answer: any }) => {
      if (data.callId === activeCall.callId && peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (err) {
          console.error('Error handling WebRTC answer:', err);
        }
      }
    };

    const handleIceCandidate = async (data: { callId: string; candidate: any }) => {
      if (data.callId === activeCall.callId && peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
    };

    const handleCallEnded = () => {
      setCallState('ended');
      cleanupCall();
      setTimeout(onClose, 1200);
    };

    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_declined', handleCallDeclined);
    socket.on('call_cancelled', handleCallCancelled);
    socket.on('webrtc_offer', handleWebRtcOffer);
    socket.on('webrtc_answer', handleWebRtcAnswer);
    socket.on('webrtc_ice_candidate', handleIceCandidate);
    socket.on('call_ended', handleCallEnded);

    if (!activeCall.isIncoming && activeCall.targetUserId) {
      // Outgoing call - initiate webRtc when callee accepts
    }

    return () => {
      cleanupCall();
      socket.off('call_accepted', handleCallAccepted);
      socket.off('call_declined', handleCallDeclined);
      socket.off('call_cancelled', handleCallCancelled);
      socket.off('webrtc_offer', handleWebRtcOffer);
      socket.off('webrtc_answer', handleWebRtcAnswer);
      socket.off('webrtc_ice_candidate', handleIceCandidate);
      socket.off('call_ended', handleCallEnded);
    };
  }, [activeCall]);

  if (!activeCall) return null;

  const socket = getSocket();

  const handleAcceptCall = () => {
    socket.emit('call_accept', { callId: activeCall.callId });
    setCallState('connecting');
    const targetUser = activeCall.caller.userId;

    const rtcConfig: RTCConfiguration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: activeCall.callType === 'video' })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const pc = new RTCPeerConnection(rtcConfig);
        peerConnectionRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('webrtc_ice_candidate', {
              callId: activeCall.callId,
              candidate: event.candidate,
              targetUserId: targetUser,
            });
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'connected') {
            setCallState('connected');
          }
        };
      })
      .catch((err) => {
        setCallState('error');
        setErrorMessage('Failed to access microphone/camera');
      });
  };

  const handleDeclineCall = () => {
    socket.emit('call_decline', { callId: activeCall.callId });
    setCallState('ended');
    onClose();
  };

  const handleEndCall = () => {
    socket.emit('call_end', { callId: activeCall.callId });
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setCallState('ended');
    onClose();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center border border-cyan-500/30">
              {activeCall.caller.displayName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-white">{activeCall.caller.displayName}</h3>
              <p className="text-xs text-neutral-400 capitalize">
                {activeCall.callType} call • {callState} {callState === 'connected' && `(${formatDuration(callDuration)})`}
              </p>
            </div>
          </div>
          {callState === 'connected' && (
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
              ● Live WebRTC
            </span>
          )}
        </div>

        {/* Video / Call Container */}
        <div className="relative min-h-[360px] bg-neutral-950 flex items-center justify-center overflow-hidden">
          {callState === 'error' && (
            <div className="p-6 text-center text-rose-400 flex flex-col items-center gap-2">
              <AlertCircle size={40} />
              <p className="font-medium text-sm">{errorMessage || 'Call error occurred'}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-neutral-800 text-white rounded-lg text-xs font-semibold hover:bg-neutral-700"
              >
                Close
              </button>
            </div>
          )}

          {callState === 'ringing' && activeCall.isIncoming && (
            <div className="flex flex-col items-center gap-4 p-8 animate-bounce">
              <div className="w-24 h-24 rounded-full bg-cyan-500/10 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 text-3xl font-bold shadow-lg shadow-cyan-500/20">
                {activeCall.caller.displayName.substring(0, 2).toUpperCase()}
              </div>
              <p className="text-lg text-cyan-200 font-medium">Incoming {activeCall.callType} call...</p>
            </div>
          )}

          {(callState === 'connecting' || (callState === 'ringing' && !activeCall.isIncoming)) && (
            <div className="flex flex-col items-center gap-4 p-8">
              <div className="w-20 h-20 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 animate-spin flex items-center justify-center">
                <Phone className="text-cyan-400" size={28} />
              </div>
              <p className="text-neutral-300 font-medium text-sm">Ringing peer user...</p>
            </div>
          )}

          {/* Remote Video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-[360px] object-cover ${callState === 'connected' && activeCall.callType === 'video' ? 'block' : 'hidden'}`}
          />

          {/* Local Video Picture-in-Picture Overlay */}
          <div className={`absolute bottom-4 right-4 w-36 h-24 bg-neutral-900 rounded-lg overflow-hidden border border-neutral-700 shadow-lg ${callState === 'connected' && activeCall.callType === 'video' ? 'block' : 'hidden'}`}>
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-5 bg-neutral-900 border-t border-neutral-800 flex items-center justify-center gap-6">
          {callState === 'ringing' && activeCall.isIncoming ? (
            <>
              <button
                onClick={handleDeclineCall}
                className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-full shadow-lg transition-all"
              >
                <PhoneOff size={20} /> Decline
              </button>
              <button
                onClick={handleAcceptCall}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-full shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Phone size={20} /> Accept Call
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleMute}
                disabled={callState !== 'connected'}
                className={`p-3.5 rounded-full border transition-all ${isMuted ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700'}`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {activeCall.callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  disabled={callState !== 'connected'}
                  className={`p-3.5 rounded-full border transition-all ${isVideoOff ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700'}`}
                  title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                </button>
              )}

              <button
                onClick={handleEndCall}
                className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-full shadow-lg shadow-rose-600/30 transition-all"
              >
                <PhoneOff size={20} /> End Call
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
