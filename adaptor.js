/**
 * Created by yangfch3.
 * Date: 2018/4/9
 * Egret 4.x 5.x Websocket 适配器，用于适配 pomelo 客户端
 *
 * *** 确保在调用此库前已初始化 pomelo-client-websocket 和 egret 代码 ***
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module['exports'] = factory() :
        typeof define === 'function' && define['amd'] ? define(factory) :
            (global['EgretSocketPomeloClientAdaptor'] = factory());
}(this, function () {
    // 重写 JSON.parse
    var _parse = JSON.parse;
    JSON.parse = function (toParse, revier) {
        if (typeof toParse === 'object') return toParse;
        return _parse(toParse, revier);
    };

    function EgretSocketPomeloClientAdaptor(egretSocket) {
        if (!window.Pomelo) {
            throw new Error('未找到 window.Pomelo 类');
        }
        if (!egretSocket) {
            throw new Error('请传入正确的 egret WebSocket 对象');
        }
        this.msgStore = null;
        this.resStore = null;
        this.egretSocket = egretSocket;
        this.pomelo = new Pomelo();

        this.firstConnect = true;

        this.nameKey = 'name';
        this.dataKey = 'params';
    }

    var pro = EgretSocketPomeloClientAdaptor.prototype;

    // 事件名键 数据键
    pro.config = function (nameKey, dataKey) {
        this.nameKey = nameKey;
        this.dataKey = dataKey;
    };

    pro.addEventListener = function (event, cb, ctx) {
        this.egretSocket.addEventListener(event, cb, ctx);
    };

    pro.dispatchEvent = function (c) {
        this.egretSocket.dispatchEvent(c);
    };

    pro.dispatchEventWith = function (c, a, f) {
        this.egretSocket.dispatchEventWith(c, a, f);
    };

    pro.hasEventListener = function (c) {
        this.egretSocket.hasEventListener(c);
    };

    pro.removeEventListener = function (c, a, f, b) {
        this.egretSocket.removeEventListener(c, a, f, b);
    };

    pro.connect = function (host, port, scheme, cb) {
        var initInfo = {
            host: host,
            port: port,
            scheme: scheme
        };

        var self = this;
        if (this.firstConnect) {
            this.pomelo.on('close', function () {
                self.egretSocket.dispatchEventWith(egret.Event.CLOSE);
            });
            this.pomelo.on('connect', function () {
                self.egretSocket.dispatchEventWith(egret.Event.CONNECT);
            });
            this.pomelo.on('error', function () {
                self.egretSocket.dispatchEventWith(egret.IOErrorEvent.IO_ERROR);
            });
            this.pomelo.on('io-error', function () {
                self.egretSocket.dispatchEventWith(egret.IOErrorEvent.IO_ERROR);
            });
            this.pomelo.on('__CLIENT_ROUTE', function (route, body) {
                var msg = self._buildMsg(route, body);
                self.resStore = msg;
                egret.ProgressEvent.dispatchProgressEvent(self, egret.ProgressEvent.SOCKET_DATA);
            });
            this.pomelo.on('__CLIENT_RESPONSE', function (body) {
                var msg = self._buildMsg(null, body);
                self.resStore = msg;
                egret.ProgressEvent.dispatchProgressEvent(self, egret.ProgressEvent.SOCKET_DATA);
            });
        }
        this.firstConnect = false;

        this.pomelo.init(initInfo, function (data) {
            if (data.code === 500) {
                console.error('连接失败: ', initInfo);
                return;
            }
            self.connected = true;
            typeof cb === 'function' && cb(data);
        });
    };

    pro.connectByUrl = function (url, cb) {
        var self = this;
        if (this.firstConnect) {
            this.pomelo.on('close', function () {
                self.egretSocket.dispatchEventWith(egret.Event.CLOSE);
            });
            this.pomelo.on('connect', function () {
                self.egretSocket.dispatchEventWith(egret.Event.CONNECT);
            });
            this.pomelo.on('error', function () {
                self.egretSocket.dispatchEventWith(egret.IOErrorEvent.IO_ERROR);
            });
            this.pomelo.on('io-error', function () {
                self.egretSocket.dispatchEventWith(egret.IOErrorEvent.IO_ERROR);
            });
            this.pomelo.on('__CLIENT_ROUTE', function (route, body) {
                var msg = self._buildMsg(route, body);
                self.resStore = msg;
                egret.ProgressEvent.dispatchProgressEvent(self, egret.ProgressEvent.SOCKET_DATA);
            });
            this.pomelo.on('__CLIENT_RESPONSE', function (body) {
                var msg = self._buildMsg(null, body);
                self.resStore = msg;
                egret.ProgressEvent.dispatchProgressEvent(self, egret.ProgressEvent.SOCKET_DATA);
            });
        }
        this.firstConnect = false;

        this.pomelo.initByUrl(url, {}, function (data) {
            if (data.code === 500) {
                console.error('连接初始化失败: ', url);
                return;
            }
            self.connected = true;
            typeof cb === 'function' && cb(data);
        });
    };

    pro._buildMsg = function (name, body) {
        var msg = {};
        msg[this.nameKey] = name || '_';
        msg[this.dataKey] = body;
        return msg;
    };

    pro.close = function() {
        this.pomelo.disconnect();
        this.egretSocket.connected = false;
    };

    pro.writeUTF = function (msg, skipCook) {
        !skipCook && this.msgCook(msg);
        this.msgStore = msg;
    };

    pro.msgCook = function (msg) {
        msg.__route__ = '_';
    };

    pro.readBytes = function (binData) {};

    pro.readUTF = function () {
        var resStore = this.resStore;
        this.resStore = null;
        return resStore;
    };

    pro.flush = function (cb) {
        if (!this.msgStore) {
            return;
        }
        let route = this.msgStore['__route__'];
        delete this.msgStore['__route__'];
        this.pomelo.request(route, this.msgStore, function (data) {
            typeof cb === 'function' && cb(data);
        });
        this.msgStore = null;
    };

    return EgretSocketPomeloClientAdaptor;
}));


