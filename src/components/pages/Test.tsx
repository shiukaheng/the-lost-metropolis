import { useEffect, useState } from "react";

export function useLogWebsockets(endpoint: string) {
    const [status, setStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected');
    const [lastMessage, setLastMessage] = useState<any>(null);
  
    // Construct the WebSocket URL dynamically based on current location
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname;
    const wsPort = window.location.port ? `:${window.location.port}` : '';
    const wsUrl = `${wsProtocol}//${wsHost}${wsPort}${endpoint}`;
  
    useEffect(() => {
      const ws = new WebSocket(wsUrl);
  
      ws.onopen = () => {
        setStatus('connected');
        console.log('WebSocket connection opened:', wsUrl);
      };
  
      ws.onmessage = (event) => {
        setLastMessage(event.data);
        console.log('WebSocket received:', event.data);
      };
  
      ws.onerror = (error) => {
        setStatus('error');
        console.error('WebSocket error:', error);
      };
  
      ws.onclose = () => {
        setStatus('disconnected');
        console.log('WebSocket connection closed:', wsUrl);
      };
  
      // Cleanup
      return () => {
        ws.close();
      };
    }, [wsUrl]); // Reconnect if wsUrl changes
  
    return { status, lastMessage };
  }


export function TestPage() {
    const { status, lastMessage } = useLogWebsockets("/sync");
    return (
        <div className="p-16">
            <h1 className="text-4xl text-white">Test for websockets!</h1>
            <p className="text-white">Status: {status}</p>
            <p className="text-white">Last message: {lastMessage}</p>
        </div>
    )
}