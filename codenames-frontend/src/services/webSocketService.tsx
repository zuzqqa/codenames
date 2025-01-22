import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import apiUrl from '../../api/api.ts';

const socketUrl = apiUrl + '/ws'; // WebSocket endpoint

const connect = (onMessage: (msg: any) => void) => {
    const client = new Client({
        brokerURL: socketUrl, // WebSocket server URL
        connectHeaders: {},
        debug: console.log,
        reconnectDelay: 5000,
        webSocketFactory: () => new SockJS(socketUrl),
        onConnect: () => {
            console.log('Connected');
            client.subscribe('/topic/messages', (message) => {
                const body = JSON.parse(message.body);
                onMessage(body);
            });
        },
        onStompError: (error) => console.error(error),
    });
    client.activate();
    return client;
};

export default connect;