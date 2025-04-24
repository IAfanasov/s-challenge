'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useLogger } from './logger/LoggerContext';

interface SocketContextProps {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextProps>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const logger = useLogger();

    useEffect(() => {
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL);

        socketInstance.on('connect', () => {
            setIsConnected(true);
            logger.debug('Connected to socket server');
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
            logger.debug('Disconnected from socket server');
        });

        socketInstance.on('connect_error', (err) => {
            logger.error(`Socket connection error: ${err.message}`);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}; 