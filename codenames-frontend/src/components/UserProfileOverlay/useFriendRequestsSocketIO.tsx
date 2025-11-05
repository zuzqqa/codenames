import {useEffect, useState, useRef} from "react";
import {useSocket} from "../../providers/SocketProvider";
import {apiUrl} from "../../config/api";

interface FriendRequestsState {
    friends: string[];
    sentRequests: string[];
    receivedRequests: string[];
}

// Allow passing initial lists (from REST) so UI reflects server state on open
const useFriendRequestsSocketIO = (
    username: string,
    initial?: Partial<FriendRequestsState>
) => {
    const [state, setState] = useState<FriendRequestsState>({
        friends: initial?.friends ?? [],
        sentRequests: initial?.sentRequests ?? [],
        receivedRequests: initial?.receivedRequests ?? [],
    });

    const {profileSocket} = useSocket();
    // queue of actions to call once socket is ready (persist across renders)
    const pendingEmitsRef = useRef<Array<() => void>>([]);

    // Sync initial data when it becomes available (e.g., after fetching profile)
    useEffect(() => {
        if (!initial) return;
        setState((prev) => ({
            ...prev,
            friends: initial.friends ?? prev.friends,
            sentRequests: initial.sentRequests ?? prev.sentRequests,
            receivedRequests: initial.receivedRequests ?? prev.receivedRequests,
        }));
    }, [initial?.friends?.length, initial?.sentRequests?.length, initial?.receivedRequests?.length]);

    useEffect(() => {
        if (!username || !profileSocket) return;

        // Join user's private profile room and flush pending emits
        const join = () => {
            profileSocket.emit('joinProfile', username);
            // flush pending emits
            while (pendingEmitsRef.current.length > 0) {
                const fn = pendingEmitsRef.current.shift();
                if (fn) fn();
            }
        };

        if (profileSocket.connected) {
            join();
        } else {
            const onConnect = () => join();
            profileSocket.on('connect', onConnect);
            return () => {
                profileSocket.off('connect', onConnect);
            };
        }

        const onFriendRequestReceived = ({from}: any) => {
            setState((prev) => ({
                ...prev,
                receivedRequests: [...new Set([...prev.receivedRequests, from])],
            }));
        };

        const onFriendRequestAccepted = ({by}: any) => {
            setState((prev) => ({
                ...prev,
                sentRequests: prev.sentRequests.filter((u) => u !== by),
                friends: [...new Set([...prev.friends, by])],
            }));
        };

        const onFriendRequestDeclined = ({by}: any) => {
            setState((prev) => ({
                ...prev,
                sentRequests: prev.sentRequests.filter((u) => u !== by),
            }));
        };

        const onFriendRemoved = ({by}: any) => {
            setState((prev) => ({
                ...prev,
                friends: prev.friends.filter((f) => f !== by),
            }));
        };

        profileSocket.on('friendRequestReceived', onFriendRequestReceived);
        profileSocket.on('friendRequestAccepted', onFriendRequestAccepted);
        profileSocket.on('friendRequestDeclined', onFriendRequestDeclined);
        profileSocket.on('friendRemoved', onFriendRemoved);

        return () => {
            profileSocket.off('friendRequestReceived', onFriendRequestReceived);
            profileSocket.off('friendRequestAccepted', onFriendRequestAccepted);
            profileSocket.off('friendRequestDeclined', onFriendRequestDeclined);
            profileSocket.off('friendRemoved', onFriendRemoved);
        };
    }, [username, profileSocket]);

    // Helper to call backend REST endpoints to persist changes
    const callApi = async (path: string, method = 'POST') => {
        try {
            const res = await fetch(`${apiUrl}${path}`, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            return res;
        } catch (e) {
            console.error('Friend request API call failed', e);
            throw e;
        }
    };

    // === Functions to send events back to server ===
    const sendFriendRequest = async (receiverUsername: string) => {
        // Persist via REST
        try {
            await callApi(`/api/users/send-request/${receiverUsername}?senderUsername=${encodeURIComponent(username)}`, 'POST');
        } catch (e) {
            // If REST fails, don't optimistically add
            return;
        }

        const doEmit = () => {
            profileSocket!.emit('sendFriendRequest', {from: username, to: receiverUsername});
        };

        if (!profileSocket || !profileSocket.connected) {
            pendingEmitsRef.current.push(doEmit);
        } else {
            doEmit();
        }

        setState((prev) => ({
            ...prev,
            sentRequests: [...new Set([...prev.sentRequests, receiverUsername])],
        }));
    };

    const acceptFriendRequest = async (senderUsername: string) => {
        // Persist via REST
        try {
            await callApi(`/api/users/accept-request/${senderUsername}?receiverUsername=${encodeURIComponent(username)}`, 'POST');
        } catch (e) {
            // If REST fails, don't change UI
            return;
        }

        const doEmit = () => {
            profileSocket!.emit('acceptFriendRequest', {from: senderUsername, to: username});
        };

        if (!profileSocket || !profileSocket.connected) {
            pendingEmitsRef.current.push(doEmit);
        } else {
            doEmit();
        }

        // Optimistic UI update
        setState((prev) => ({
            ...prev,
            receivedRequests: prev.receivedRequests.filter((u) => u !== senderUsername),
            friends: [...new Set([...prev.friends, senderUsername])],
        }));
    };

    const declineFriendRequest = async (senderUsername: string) => {
        try {
            await callApi(`/api/users/decline-request/${senderUsername}?receiverUsername=${encodeURIComponent(username)}`, 'POST');
        } catch (e) {
            return;
        }

        const doEmit = () => {
            profileSocket!.emit('declineFriendRequest', {from: senderUsername, to: username});
        };

        if (!profileSocket || !profileSocket.connected) {
            pendingEmitsRef.current.push(doEmit);
        } else {
            doEmit();
        }

        setState((prev) => ({
            ...prev,
            receivedRequests: prev.receivedRequests.filter((u) => u !== senderUsername),
        }));
    };

    const removeFriend = async (friendUsername: string) => {
        try {
            await callApi(`/api/users/remove-friend/${friendUsername}?userUsername=${encodeURIComponent(username)}`, 'DELETE');
        } catch (e) {
            return;
        }

        const doEmit = () => {
            profileSocket!.emit('removeFriend', {user: username, friend: friendUsername});
        };

        if (!profileSocket || !profileSocket.connected) {
            pendingEmitsRef.current.push(doEmit);
        } else {
            doEmit();
        }

        setState((prev) => ({
            ...prev,
            friends: prev.friends.filter((f) => f !== friendUsername),
        }));
    };

    const undoFriendRequest = async (receiverUsername: string) => {
        try {
            // Using decline endpoint to cancel a sent request
            await callApi(`/api/users/decline-request/${encodeURIComponent(username)}?receiverUsername=${encodeURIComponent(receiverUsername)}`, 'POST');
        } catch (e) {
            return;
        }

        const doEmit = () => {
            profileSocket!.emit('declineFriendRequest', {from: username, to: receiverUsername});
        };

        if (!profileSocket || !profileSocket.connected) {
            pendingEmitsRef.current.push(doEmit);
        } else {
            doEmit();
        }

        setState((prev) => ({
            ...prev,
            sentRequests: prev.sentRequests.filter((u) => u !== receiverUsername),
        }));
    };

    return {
        ...state,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        removeFriend,
        undoFriendRequest,
    };
};

export default useFriendRequestsSocketIO;
