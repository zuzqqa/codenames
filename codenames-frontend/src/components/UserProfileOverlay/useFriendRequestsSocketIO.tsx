import {useEffect, useState} from "react";
import {useSocket} from "../../providers/SocketProvider";
import {apiUrl} from "../../config/api";
import {useToast} from "../Toast/ToastContext";

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
    const { addToast } = useToast();

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

        // Join user's private profile room
        const join = () => {
            if (profileSocket && profileSocket.connected) {
                profileSocket.emit('joinProfile', username);
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

    // === Functions to send events back to server ===
    const sendFriendRequest = (receiverUsername: string) => {
        // Persist change through backend REST API; update local state optimistically
        setState((prev) => ({
            ...prev,
            sentRequests: [...new Set([...prev.sentRequests, receiverUsername])],
        }));

        fetch(`${apiUrl}/api/users/send-request/${encodeURIComponent(receiverUsername)}?senderUsername=${encodeURIComponent(username)}`, {
            method: 'POST',
            credentials: 'include',
        }).then((res) => {
            if (!res.ok) {
                // rollback optimistic update
                setState((prev) => ({
                    ...prev,
                    sentRequests: prev.sentRequests.filter((u) => u !== receiverUsername),
                }));
                addToast('Failed to send friend request', 'error');
            }
        }).catch(() => {
            setState((prev) => ({
                ...prev,
                sentRequests: prev.sentRequests.filter((u) => u !== receiverUsername),
            }));
            addToast('Failed to send friend request', 'error');
        });
    };

    const acceptFriendRequest = (senderUsername: string) => {
        // Optimistic update
        setState((prev) => ({
            ...prev,
            receivedRequests: prev.receivedRequests.filter((u) => u !== senderUsername),
            friends: [...new Set([...prev.friends, senderUsername])],
        }));

        fetch(`${apiUrl}/api/users/accept-request/${encodeURIComponent(senderUsername)}?receiverUsername=${encodeURIComponent(username)}`, {
            method: 'POST',
            credentials: 'include',
        }).then((res) => {
            if (!res.ok) {
                // rollback optimistic update
                setState((prev) => ({
                    ...prev,
                    friends: prev.friends.filter((u) => u !== senderUsername),
                    receivedRequests: [...new Set([...prev.receivedRequests, senderUsername])],
                }));
                addToast('Failed to accept friend request', 'error');
            }
        }).catch(() => {
            setState((prev) => ({
                ...prev,
                friends: prev.friends.filter((u) => u !== senderUsername),
                receivedRequests: [...new Set([...prev.receivedRequests, senderUsername])],
            }));
            addToast('Failed to accept friend request', 'error');
        });
    };

    const declineFriendRequest = (senderUsername: string) => {
        setState((prev) => ({
            ...prev,
            receivedRequests: prev.receivedRequests.filter((u) => u !== senderUsername),
        }));

        fetch(`${apiUrl}/api/users/decline-request/${encodeURIComponent(senderUsername)}?receiverUsername=${encodeURIComponent(username)}`, {
            method: 'POST',
            credentials: 'include',
        }).then((res) => {
            if (!res.ok) {
                // rollback
                setState((prev) => ({
                    ...prev,
                    receivedRequests: [...new Set([...prev.receivedRequests, senderUsername])],
                }));
                addToast('Failed to decline friend request', 'error');
            }
        }).catch(() => {
            setState((prev) => ({
                ...prev,
                receivedRequests: [...new Set([...prev.receivedRequests, senderUsername])],
            }));
            addToast('Failed to decline friend request', 'error');
        });
    };

    const removeFriend = (friendUsername: string) => {
        setState((prev) => ({
            ...prev,
            friends: prev.friends.filter((f) => f !== friendUsername),
        }));

        fetch(`${apiUrl}/api/users/remove-friend/${encodeURIComponent(friendUsername)}?userUsername=${encodeURIComponent(username)}`, {
            method: 'DELETE',
            credentials: 'include',
        }).then((res) => {
            if (!res.ok) {
                // rollback
                setState((prev) => ({
                    ...prev,
                    friends: [...new Set([...prev.friends, friendUsername])],
                }));
                addToast('Failed to remove friend', 'error');
            }
        }).catch(() => {
            setState((prev) => ({
                ...prev,
                friends: [...new Set([...prev.friends, friendUsername])],
            }));
            addToast('Failed to remove friend', 'error');
        });
    };

    const undoFriendRequest = (receiverUsername: string) => {
        setState((prev) => ({
            ...prev,
            sentRequests: prev.sentRequests.filter((u) => u !== receiverUsername),
        }));

        // reuse decline endpoint to cancel sent request
        fetch(`${apiUrl}/api/users/decline-request/${encodeURIComponent(username)}?receiverUsername=${encodeURIComponent(receiverUsername)}`, {
            method: 'POST',
            credentials: 'include',
        }).then((res) => {
            if (!res.ok) {
                setState((prev) => ({
                    ...prev,
                    sentRequests: [...new Set([...prev.sentRequests, receiverUsername])],
                }));
                addToast('Failed to cancel friend request', 'error');
            }
        }).catch(() => {
            setState((prev) => ({
                ...prev,
                sentRequests: [...new Set([...prev.sentRequests, receiverUsername])],
            }));
            addToast('Failed to cancel friend request', 'error');
        });
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
