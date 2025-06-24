import asyncio
import socket
import websockets

alertas = []  
clientes_websocket = set()

async def notificar_clientes(alerta):
    if clientes_websocket:
        await asyncio.gather(*(cliente.send(alerta) for cliente in clientes_websocket))

async def websocket_handler(websocket):
    clientes_websocket.add(websocket)
    try:
        # Envia todos os alertas já recebidos para o cliente ao conectar
        for alerta in alertas:
            await websocket.send(alerta)
        async for _ in websocket:
            pass  # apenas mantém conexão aberta
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        clientes_websocket.remove(websocket)

async def servidor_tcp():
    loop = asyncio.get_running_loop()
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(('localhost', 9090))
    server.listen()
    server.setblocking(False)
    print("[TCP] Servidor escutando na porta 9090...")

    try:
        while True:
            conn, _ = await loop.sock_accept(server)
            data = await loop.sock_recv(conn, 1024)
            alerta = data.decode()
            if alerta:
                print(f"[TCP] Alerta recebido: {alerta}")
                alertas.append(alerta)
                await notificar_clientes(alerta)
            conn.close()
    finally:
        server.close()

async def main():
    ws_server = await websockets.serve(websocket_handler, "localhost", 6789)
    
    await asyncio.gather(
        servidor_tcp(),
        ws_server.wait_closed()
    )

if __name__ == "__main__":
    asyncio.run(main())
