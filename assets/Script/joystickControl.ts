const {ccclass, property} = cc._decorator;

@ccclass
export default class joystickControl extends cc.Component {

	@property({
		type: cc.Node,
		tooltip: "player node"
	})
	player: cc.Node = null;
	
	@property({
		tooltip: "player max speed"
	})
	maxSpeed: Number = 10;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
		// hide FPS info
		cc.debug.setDisplayStats(false);
		
		// 不要忘了注册写好的触摸事件
		this.onJoystick();
		
		// 获取 joystick_btn
		this.joystickBtn = this.node.children[0];
		
		// player 的移动方向
		this.playerDir = cc.v2(0, 0);
	}

    start () {

    }

    update (dt) {
		this.resTouchMove();
	}
	
	// 注册
	onJoystick() {
		// touch start
		this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this); 
		// this.onTouchStart 即 onTouchstart() 函数，以下同理
		// touch move
		this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
		// touch end
		this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
		// touch cancel
		this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
	}
	
	// 注销
	onDestroy() {
		this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this); 
		this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
		this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
		this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
	}
	
	onTouchStart(e: cc.Event.EventTouch) {
		// 坐标转换，设置 joystick_btn 的位置
		let pos = this.node.convertToNodeSpaceAR(e.getLocation());
		this.joystickBtn.setPosition(pos);
	}
	
	// 触摸移动的同时改变 joystick_btn 的位置
	onTouchMove(e: cc.Event.EventTouch) {
		// getDelta() 获取触点距离上一次事件移动的距离对象，对象包含 x 和 y 属性
		let posDelta = e.getDelta();
		this.joystickBtn.setPosition(this.joystickBtn.position.add(posDelta));
		
		// set direction
		// normalize() 向量归一化(方向不变但长度为1)
		this.playerDir = this.joystickBtn.position.normalize();
	}
	
	// reset
	onTouchEnd(e: cc.Event.EventTouch) {
		this.joystickBtn.setPosition(cc.v2(0, 0));
	}
	
	// 限制 joystick_btn 的移动范围
	resTouchMove() {
		// mag() 函数，这是Vec2的一个方法，返回该向量的长度。
		// len 按钮中心(joystick_btn)到原点(摇杆背景中心 joystick_pane)的直线长度，是一个向量
		let len = this.joystickBtn.position.mag();
		// 最大范围
		let maxLen = this.node.width / 2;
		// 比例
		let ratio = len / maxLen;
		
		// 将joystick_btn 限制在 joystick_pane 中
		if(ratio > 1) {
			this.joystickBtn.setPosition(this.joystickBtn.position.div(ratio));
		}
		
		// player 移动
		this.playerMove(ratio);
	}
	
	// player 移动
	playerMove(ratio) {
		// mul() 矩阵乘法
		let dis = this.playerDir.mul(this.maxSpeed * ratio);
		this.player.setPosition(this.player.position.add(dis));
		
		// 为 player 加上移动范围限制
		let resPlayerX = cc.winSize.width / 2 - this.player.width / 2;
		let resPlayerY = cc.winSize.height / 2 - this.player.height / 2;
		if(this.player.x > resPlayerX) {
			this.player.x = resPlayerX;
		}else if (this.player.x < -resPlayerX) {
			this.player.x = -resPlayerX;
		}
		if(this.player.y > resPlayerY) {
			this.player.y = resPlayerY;
		}else if(this.player.y < -resPlayerY) {
			this.player.y = -resPlayerY;
		}
		
		// 角度更改
		let r = Math.atan2(this.playerDir.y, this.playerDir.x);
		let degree = r * 180 / (Math.PI);
		degree = Math.abs((360 - degree + 90) % 360);
		this.player.angle = -degree;
	}
}
