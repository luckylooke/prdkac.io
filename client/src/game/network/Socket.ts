import { pack, unpack } from 'msgpackr';
const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
window.socket = null;

class Socket {
  private socket: null | WebSocket;
  private queue: any[];

  constructor() {
    this.socket = null;
    this.queue = [];
  }
  
  connect(address: string, onOpen: any, onMessage: any, onClose: any) {
    const endpoint = `${protocol}${address}`;
  
    if (window.socket !== null) {
      window.socket.close();
    }
  
    this.socket = new WebSocket(endpoint);
    this.socket.binaryType = 'arraybuffer';
    window.socket = this.socket;
  
    this.socket.addEventListener('open', () => {
      this.onOpen();
      onOpen();
    });
    this.socket.addEventListener('close', (event: CloseEvent) => {
      onClose(event);
      this.close();
    });
    this.socket.addEventListener('message', (message: any) => {
      if (typeof message.data === 'string') return;
  
      const payload = unpack(message.data);
      onMessage(payload);
    });
  
    return this.socket;
  }

  onOpen() {
    for (const msg of this.queue) {
      this.emit(msg);
    }
  }

  emit(data: any) {
    if (this.socket?.readyState !== 1) {
      return this.queue.push(data);
    }

    const payload = pack(data);
    this.socket?.send(payload);
  }

  close() {
    if (this.socket) {
      this.socket.close(1000);
      this.socket = null;
      window.socket = null;
    }
  }
}

export default new Socket();