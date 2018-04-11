# egret-socket-pomelo-client-adaptor
H5 游戏的前端已经使用了 egret.WebSocket 做为通讯库进行开发后，需要接入或适配后端 Pomelo 通信协议时可以使用此库。

使用此适配器，只需要简单地更改 Socket 实例的创建方式，无需大幅度重构即可快速适配至使用 Pomelo 客户端与 Pomelo 后端通信。

## Usage
使用 `egret.WebSocket` 的原代码：
```javascript
const sock = new egret.WebSocket();
sock.connect(host, port);
```

现需接入使用 Pomelo 的后端，可使用适配器进行适配
```javascript
const sock = new Adaptor(new egret.WebSocket());
```

## 原理
下面 `egret.WebSocket` 原型上的属性和方法
```javascript
Object.keys(egret.WebSocket.prototype);
// (12) ["constructor", "connect", "close", "onConnect", "onClose", "onError", "onSocketData", "flush", "writeUTF", "readUTF", "connected", "__class__"]
```

在适配器的原型上同样实现了其中的部分属性和方法（部分方法的参数有所变化，请阅读 200 行不到的源码以知悉），同时因为创建适配器时传入了 `egret.WebSocket` 实例，我们可以在适配器的方法里为该实例添加事件监听、改变这个实例的属性和状态、调用其方法、触发其事件。

由于不同项目的消息格式不尽相同，你可以通过覆写适配器原型上的两个方法进行适配器的定制：

1. `Adaptor.prototype.config()` - 定制自己的消息格式或进行其他任何你需要的功能增强
2. `Adaptor.prototype.msgCook(msg)` - `adaptor.writeUTF()` 调用时对消息进行个性化处理
3. `Adaptor.prototype._buildMsg()` - 对后端 Pomelo 返回的消息进行编辑构造

```javascript
// 为实例增加一些属性
Adaptor.prototype.config = function (nameKey, dataKey) {
    this.nameKey = nameKey;
    this.dataKey = dataKey;
};

// 每次 writeUTF 时都会调用此 msgCook
Adaptor.prototype.msgCook = function (msg) {
    msg['__route__'] = 'ttl.gameHandler.msgHandler';
};

// 收到任何服务器返回（包括 Response 和 Push）时都调用此方法来编辑重写返回内容
Adaptor._buildMsg = function (route, body) {
    var msg = {};
    msg[this.nameKey] = name || '_';
    msg[this.dataKey] = body;
    return msg;
};
```

## 限制
1. 不支持使用二进制格式的 egret.WebSocket 实例
