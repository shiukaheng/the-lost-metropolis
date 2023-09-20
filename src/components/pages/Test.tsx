import { useWebSocketState, useWebsocketCallback } from "../utilities/useWebSocketCallback";

export function TestPage() {
  const [ state, status ] = useWebSocketState("/sync");
  return (
    <div className="p-16">
      <h1 className="text-4xl text-white">Test for websockets!</h1>
      <p className="text-white">Status: {status}</p>
      <p className="text-white">State: {JSON.stringify(state)}</p>
    </div>
  )
}