# egret-socket-pomelo-client-adaptor
H5 游戏的前端已经使用了 egret.WebSocket 做为通讯库进行开发后，需要接入或适配后端 Pomelo 通信协议时可以使用此库。

使用此适配器，只需要简单地更改 Socket 实例的创建方式，无需大幅度重构即可快速地迁移至 Pomelo 协议。

## Usage
使用 egret.WebSocket
```javascript
const sock = new egret.WebSocket();
sock.connect(host, port);
```

现需接入使用 Pomelo 的后端：使用适配器进行适配
```
const sock = new EgretSocketPomeloClientAdaptor(new egret.WebSocket());
// 然后根据后端 Pomelo 的逻辑特征微调逻辑
```

## 限制
1. 不支持使用二进制格式的 egret.WebSocket 实例
2. 重连部分暂未完善
