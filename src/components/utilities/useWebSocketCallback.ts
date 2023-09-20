import { useEffect, useState, useCallback, useRef } from "react";

type Status = 'disconnected' | 'connected' | 'error';
type DataProcessor<T> = (data: any) => T;
type ShouldUpdatePredicate<T> = (previousData: T, newData: T) => boolean;

interface WebsocketCallbackOptions<T> {
  predicate?: ShouldUpdatePredicate<T>;
  dataProcessor?: DataProcessor<T>;
  subscriber?: (data: T) => void;
}

declare global {
  interface Window {
    websocketCache: Record<string, WebSocket>;
  }
}

export function useWebsocketCallback<T>(
  endpoint: string,
  options: WebsocketCallbackOptions<T> = {}
): Status {
  const [status, setStatus] = useState<Status>('disconnected');
  // const [lastMessage, setLastMessage] = useState<T | null>(null);
  const lastMessageRef = useRef<T | null>(null);

  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsHost = window.location.hostname;
  const wsPort = window.location.port ? `:${window.location.port}` : '';
  const wsUrl = `${wsProtocol}//${wsHost}${wsPort}${endpoint}`;

  if (!window.websocketCache) {
    window.websocketCache = {};
  }

  const handleMessage = useCallback(
    (data: any) => {
      let parsedData: T;

      try {
        parsedData = JSON.parse(data);
        if (options.dataProcessor) {
          parsedData = options.dataProcessor(parsedData);
        }
      } catch (err) {
        console.warn('Failed to parse WebSocket message:', data);
        return;
      }

      if (
        !options.predicate || lastMessageRef.current === null ||
        options.predicate(lastMessageRef.current, parsedData)
      ) {
        lastMessageRef.current = parsedData;

        if (options.subscriber) {
          options.subscriber(parsedData);
        }
      }
    },
    [options]
  );

  useEffect(() => {
    let ws: WebSocket;

    if (window.websocketCache[wsUrl]) {
      ws = window.websocketCache[wsUrl];
    } else {
      ws = new WebSocket(wsUrl);
      window.websocketCache[wsUrl] = ws;
    }

    ws.onopen = () => {
      setStatus('connected');
      console.log('WebSocket connection opened:', wsUrl);
    };

    ws.onmessage = (event) => {
      handleMessage(event.data);
      // console.log('WebSocket received:', event.data);
    };

    ws.onerror = (error) => {
      setStatus('error');
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      setStatus('disconnected');
      console.log('WebSocket connection closed:', wsUrl);
    };

    return () => {
      if (!ws.OPEN) {
        ws.close();
      }
    };
  }, [wsUrl, handleMessage]);

  return status;
}

export function useWebSocketState<T>(
  endpoint: string,
  options: WebsocketCallbackOptions<T> = {}
): [T | null, Status] {
  const [data, setData] = useState<T | null>(null);
  const status = useWebsocketCallback<T>(endpoint, {
    ...options,
    subscriber: (newData) => {
      console.log(newData)
      setData(newData);
    },
  });

  return [data, status];
}
