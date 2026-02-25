import { useEffect, useRef, useState, useCallback } from 'react';

// Memoized outside component so it never changes
const ICE_SERVERS = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
    ],
};

const useWebRTC = (roomName) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const peerConnection = useRef(null);
    const socket = useRef(null);
    // Keep a stable ref to the local stream for cleanup
    const localStreamRef = useRef(null);

    const createPeerConnection = useCallback(() => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (event) => {
            if (event.candidate && socket.current && socket.current.readyState === WebSocket.OPEN) {
                socket.current.send(JSON.stringify({
                    type: 'ice-candidate',
                    candidate: event.candidate
                }));
            }
        };

        pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        pc.onconnectionstatechange = () => {
            console.log('Connection state:', pc.connectionState);
        };

        return pc;
    }, []);

    const startCall = useCallback(async () => {
        if (!localStreamRef.current) {
            console.error('No local stream available');
            return;
        }
        // Clean up any existing peer connection before starting a new one
        if (peerConnection.current) {
            peerConnection.current.close();
        }
        peerConnection.current = createPeerConnection();
        localStreamRef.current.getTracks().forEach(track => {
            peerConnection.current.addTrack(track, localStreamRef.current);
        });

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify({
                type: 'offer',
                offer: offer
            }));
        }
    }, [createPeerConnection]);

    useEffect(() => {
        if (!roomName) return;

        let cancelled = false;

        const init = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (cancelled) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }
                localStreamRef.current = stream;
                setLocalStream(stream);

                const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
                const wsUrl = `${wsScheme}://${window.location.hostname}:8000/ws/signaling/${roomName}/`;
                const ws = new WebSocket(wsUrl);
                socket.current = ws;

                ws.onopen = () => console.log('WebSocket connected');
                ws.onerror = (e) => console.error('WebSocket error', e);

                ws.onmessage = async (e) => {
                    const data = JSON.parse(e.data);

                    if (data.type === 'offer') {
                        if (!peerConnection.current) {
                            peerConnection.current = createPeerConnection();
                            localStreamRef.current.getTracks().forEach(track => {
                                peerConnection.current.addTrack(track, localStreamRef.current);
                            });
                        }
                        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                        const answer = await peerConnection.current.createAnswer();
                        await peerConnection.current.setLocalDescription(answer);
                        ws.send(JSON.stringify({
                            type: 'answer',
                            answer: answer
                        }));
                    } else if (data.type === 'answer') {
                        if (peerConnection.current) {
                            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                        }
                    } else if (data.type === 'ice-candidate') {
                        if (peerConnection.current) {
                            try {
                                await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                            } catch (err) {
                                console.error('Error adding ICE candidate', err);
                            }
                        }
                    }
                };
            } catch (err) {
                console.error('Failed to get media or connect:', err);
            }
        };

        init();

        return () => {
            cancelled = true;
            // Stop all tracks (turn off camera/mic light)
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            }
            // Close peer connection
            if (peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }
            // Close WebSocket
            if (socket.current) {
                socket.current.close();
                socket.current = null;
            }
            setLocalStream(null);
            setRemoteStream(null);
        };
    }, [roomName, createPeerConnection]);

    return { localStream, remoteStream, startCall };
};

export default useWebRTC;
