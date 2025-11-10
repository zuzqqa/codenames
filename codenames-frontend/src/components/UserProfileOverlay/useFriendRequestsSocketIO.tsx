import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../providers/SocketProvider";
import { apiUrl } from "../../config/api";

/**
 * Shape of the friend-related data tracked by the hook.
 */
interface FriendRequestsState {
  friends: string[];
  sentRequests: string[];
  receivedRequests: string[];
}

/**
 * Custom hook to manage friend requests and related Socket.IO events for the profile view.
 *
 * Responsibilities:
 * - keep local lists of friends, sent and received requests
 * - subscribe to profile socket events for real-time updates
 * - provide helper functions to call backend APIs and emit socket events (queued until socket connects)
 *
 * @param username the username of the current profile (used to join profile room and in API calls)
 * @param initial optional initial state to seed the lists (useful when loading from backend)
 */
const useFriendRequestsSocketIO = (
  username: string,
  initial?: Partial<FriendRequestsState>
) => {
  const [state, setState] = useState<FriendRequestsState>({
    friends: initial?.friends ?? [],
    sentRequests: initial?.sentRequests ?? [],
    receivedRequests: initial?.receivedRequests ?? [],
  });

  const { profileSocket } = useSocket();
  const pendingEmitsRef = useRef<Array<() => void>>([]);

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

    const onFriendRequestReceived = ({ from }: any) => {
      setState((prev) => ({
        ...prev,
        receivedRequests: [...new Set([...prev.receivedRequests, from])],
      }));
    };

    const onFriendRequestAccepted = ({ by }: any) => {
      setState((prev) => ({
        ...prev,
        sentRequests: prev.sentRequests.filter((u) => u !== by),
        friends: [...new Set([...prev.friends, by])],
      }));
    };

    const onFriendRequestDeclined = ({ by }: any) => {
      setState((prev) => ({
        ...prev,
        sentRequests: prev.sentRequests.filter((u) => u !== by),
      }));
    };

    const onFriendRemoved = ({ by }: any) => {
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

  /**
   * Small wrapper around fetch for friend-related API calls.
   * It centralizes credentials and headers and surfaces errors to the caller.
   *
   * @param path API path (appended to apiUrl)
   * @param method HTTP method to use (default POST)
   */
  const callApi = async (path: string, method = 'POST') => {
    try {
      return await fetch(`${apiUrl}${path}`, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      console.error('Friend request API call failed', e);
      throw e;
    }
  };

  /**
   * Sends a friend request: calls backend API, emits socket event (queued if socket not connected)
   * and updates local state to include the receiver in sentRequests.
   *
   * @param receiverUsername receiver of the friend request
   */
  const sendFriendRequest = async (receiverUsername: string) => {
    try {
      await callApi(`/api/users/send-request/${receiverUsername}?senderUsername=${encodeURIComponent(username)}`, 'POST');
    } catch (e) {
      return;
    }

    const doEmit = () => {
      profileSocket!.emit('sendFriendRequest', { from: username, to: receiverUsername });
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

  /**
   * Accepts a friend request: calls backend API, emits socket event and updates local lists.
   *
   * @param senderUsername who sent the original request
   */
  const acceptFriendRequest = async (senderUsername: string) => {
    try {
      await callApi(`/api/users/accept-request/${senderUsername}?receiverUsername=${encodeURIComponent(username)}`, 'POST');
    } catch (e) {
      return;
    }

    const doEmit = () => {
      profileSocket!.emit('acceptFriendRequest', { from: senderUsername, to: username });
    };

    if (!profileSocket || !profileSocket.connected) {
      pendingEmitsRef.current.push(doEmit);
    } else {
      doEmit();
    }

    setState((prev) => ({
      ...prev,
      receivedRequests: prev.receivedRequests.filter((u) => u !== senderUsername),
      friends: [...new Set([...prev.friends, senderUsername])],
    }));
  };

  /**
   * Declines a friend request: calls backend API, emits socket event and updates local lists.
   *
   * @param senderUsername who sent the original request
   */
  const declineFriendRequest = async (senderUsername: string) => {
    try {
      await callApi(`/api/users/decline-request/${senderUsername}?receiverUsername=${encodeURIComponent(username)}`, 'POST');
    } catch (e) {
      return;
    }

    const doEmit = () => {
      profileSocket!.emit('declineFriendRequest', { from: senderUsername, to: username });
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

  /**
   * Removes a friend: calls backend API, emits socket event and updates local friends list.
   *
   * @param friendUsername friend to remove
   */
  const removeFriend = async (friendUsername: string) => {
    try {
      await callApi(`/api/users/remove-friend/${friendUsername}?userUsername=${encodeURIComponent(username)}`, 'DELETE');
    } catch (e) {
      return;
    }

    const doEmit = () => {
      profileSocket!.emit('removeFriend', { user: username, friend: friendUsername });
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

  /**
   * Undo a previously sent friend request by calling the decline endpoint for the other user
   * and emitting a decline socket event. This keeps backend and frontend semantics aligned.
   *
   * @param receiverUsername user who was going to receive the original request
   */
  const undoFriendRequest = async (receiverUsername: string) => {
    try {
      // Using decline endpoint to cancel a sent request
      await callApi(`/api/users/decline-request/${encodeURIComponent(username)}?receiverUsername=${encodeURIComponent(receiverUsername)}`, 'POST');
    } catch (e) {
      return;
    }

    const doEmit = () => {
      profileSocket!.emit('declineFriendRequest', { from: username, to: receiverUsername });
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
