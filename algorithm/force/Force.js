/**
 * @file 力导向算法
 */

import Spring from './Spring.js';
import Vector from './Vector.js';
import Point from './Point.js';
import { Node, Edge } from './Elements.js';

export default class Force {
    constructor (options = {}) {
        this.nodes = [];
        this.edges = [];
        
		this.nodeSet = {};
        this.edgeSet = {};
        
		this.nodePoints = new Map();
        this.edgeSprings = new Map();

        this.initState = true; 

		this.nextEdgeId = 0;
		this.iterations = 0;
		this.renderTime = 0;
        
        this.width = options.width || 800;
        this.height = options.height || 600;
        this.center = options.center || new Vector(
            options.width ? options.width / 2 : 0,
            options.height ? options.height / 2 : 0
        );

        // 弹簧默认长度
        this.defaultSpringLen = options.defaultSpringLen || 20;
        // 刷新间隔时间
        this.tickInterval = options.tickInterval || 0.02;
        // 确定是否停止的阈值
        this.minEnergyThreshold = options.minEnergyThreshold || 0.1;
        this.maxInterations = options.maxInterations || 1000000;
        // 距离标度系数
        this.coulombDisScale = options.coulombDisScale || 0.01;
        // 排斥系数
        this.repulsion = options.repulsion || 50;
        // 弹簧系数
        this.stiffness = options.stiffness || 50;
        // 最大速度限制
        this.maxSpeed = options.maxSpeed || 1000;
        // 阻尼系数
        this.damping = options.damping || 0.8;
        this.onTick = options.onTick || function () {}
    }

    /**
     * 添加单个节点
     * @param {Node} node - 节点
     */
    addNode (node) {
        if (!(node.id in this.nodeSet)) {
            this.nodes.push(node);
        }

        this.nodeSet[node.id] = node;
		return node;
    }

    /**
     * 批量添加节点
     * @param {Array} data - 节点数组
     */
    addNodes (data) {
        let len = data.length;
        for (let i = 0; i < len; i++) {
			let node = new Node(data[i]);
			this.addNode(node);
		}
    }

    /**
     * 添加单条连线
     * @param {Edge} edge - 连线
     */
    addEdge (edge) {
        if (!(edge.id in this.edgeSet)) {
            this.edges.push(edge);
		}

	    this.edgeSet[edge.id] = edge;
		return edge;
    }

    /**
     * 批量添加节点
     * @param {Array} data - 连线数组
     */
    addEdges (data) {
        let len = data.length;

        for (let i = 0; i < len; i++) {
			let link = data[i];
            
            let node1 = this.nodeSet[link['source']];
			if (node1 == undefined) {
				throw new TypeError("invalid node name: " + link[0]);
			}

			let node2 = this.nodeSet[link['target']];
			if (node2 == undefined) {
				throw new TypeError("invalid node name: " + link[1]);
			}

			let attr = link['value'],
                edge = new Edge(this.nextEdgeId++, node1, node2, attr);
                
			this.addEdge(edge);
		}
    }

    /**
     * 设置数据
     * @param {Object} 
     */
    setData (data) {
        this.clearData();

        if (data?.nodes) {
            this.addNodes(data.nodes);
        }

        if (data?.edges) {
            this.addEdges(data.edges);
        }

        this.center = new Vector(this.width / 2, this.height / 2);
    }

    /**
     * 执行布局
     */
    execute () {
        let nodeLen = this.nodes.length,
            edgeLen = this.edges.length;

        let startX = this.width * 0.5,
            startY = this.height * 0.5;

        let initSize = 20;

        // 随机质点位置
        for (let i = 0; i < nodeLen; i++) {
            let node = this.nodes[i],
                x = startX + initSize * (Math.random() - 0.5),
                y = startY +  initSize * (Math.random() - 0.5),
                vec = new Vector(x, y);

            this.nodePoints.set(node.id, new Point(vec, node.id, node.data.group));
        }

        // 随机连线位置
        for (let i = 0; i < edgeLen; i++) {
			let edge = this.edges[i],
				source = this.nodePoints.get(edge.source.id),
				target = this.nodePoints.get(edge.target.id),
				length = this.defaultSpringLen * Number.parseInt(edge.data, 10);

			this.edgeSprings.set(edge.id, new Spring(source, target, length));
        }
        
        let self = this;
        window.requestAnimationFrame(function step () {
			self.tick(self.tickInterval);
            self.iterations++;
            
			let energy = self.calTotalEnergy();

            // 系统总能量一旦小于该值我们立即停止整个系统的更新, 以防止不必要的微小位移使得系统受力变化, 而长久处于扰动状态
			if (energy < self.minEnergyThreshold || self.iterations === self.maxInterations) {
				window.cancelAnimationFrame(step);
			} else {
				window.requestAnimationFrame(step);
			}
		});
    }

    /**
     * 刷新事件
     * @param {number} interval - 刷新间隔
     */
    tick (interval) {
		this.updateCoulombsLaw();
		this.updateHookesLaw();
		this.attractToCentre();
		this.updateVelocity(interval);
        this.updatePosition(interval);
        
        this.onTick(this.nodePoints, this.edgeSprings);
    }

    /**
	 * 更新节点之间的排斥力——库伦力
     * 公式：F=k*Q1*Q2/r²（k=1/4πε0)
     * https://baike.baidu.com/item/%E5%BA%93%E4%BB%91%E5%AE%9A%E5%BE%8B
	 */
	updateCoulombsLaw() {
		let len = this.nodes.length;

		for (let i = 0; i < len; i++) {
			for (let j = i + 1; j < len; j++) {
				if (i === j) continue;

				let iNode = this.nodes[i],
                    jNode = this.nodes[j];

                // 计算力大小
				let	v = this.nodePoints.get(iNode.id).position.subtract(this.nodePoints.get(jNode.id).position);
                let	dis = (v.magnitude() + 0.1) * this.coulombDisScale;
                
                // 计算力方向
				let direction = v.normalise();

                // 更新加速度
				this.nodePoints.get(iNode.id).updateAcceleration(direction.multiply(this.repulsion).divide(Math.pow(dis, 2)));
				this.nodePoints.get(jNode.id).updateAcceleration(direction.multiply(this.repulsion).divide(-Math.pow(dis, 2)));
			}
		}
    }
    
	/**
	 * 更新每条边的吸引力——弹簧力
     * 公式：F=-kx
     * https://zh.wikipedia.org/wiki/%E5%BC%B9%E5%8A%9B
	 */
	updateHookesLaw() {
		let len = this.edges.length;

		for (let i = 0; i < len; i++) {
			let spring = this.edgeSprings.get(this.edges[i].id),
				v = spring.target.position.subtract(spring.source.position),
				displacement = spring.length - v.magnitude(),
				direction = v.normalise();

            // 更新连线的加速度
			spring.source.updateAcceleration(direction.multiply(-this.stiffness * displacement));
			spring.target.updateAcceleration(direction.multiply(this.stiffness * displacement));
		}
    }

    attractToCentre () {
        let len = this.nodes.length;

		for (let i = 0; i < len; i++) {
			let point = this.nodePoints.get(this.nodes[i].id),
				direction = point.position.subtract(this.center);

			point.updateAcceleration(direction.multiply(-this.repulsion / 100.0));
		}
    }

    /**
	 * 更新速度
	 * @param {number} interval - 时间间隔
	 */
	updateVelocity(interval) {
		let len = this.nodes.length;

		for (let i = 0; i < len; i++) {
			let point = this.nodePoints.get(this.nodes[i].id);
			point.velocity = point.velocity.add(point.acceleration.multiply(interval)).multiply(this.damping);

			if (point.velocity.magnitude() > this.maxSpeed) {
				point.velocity = point.velocity.normalise().multiply(this.maxSpeed);
            }
            
            // 加速完成后重置加速度
			point.acceleration = new Vector(0, 0);
		}
	}

	/**
	 * 更新节点位置
	 * @param {number} interval - 时间间隔
	 */
	updatePosition(interval) {
		let len = this.nodes.length;

		for (let i = 0; i < len; i++) {
			let point = this.nodePoints.get(this.nodes[i].id);
			point.position = point.position.add(point.velocity.multiply(interval));
		}
	}
    
    /**
     * 计算总能量
     */
    calTotalEnergy () {
        let energy = 0.0,
			len = this.nodes.length;

		for (let i = 0; i < len; i++) {
			let point = this.nodePoints.get(this.nodes[i].id),
				speed = point.velocity.magnitude();

			energy += point.mass * Math.pow(speed, 2) * 0.5;
		}

		return energy;
    }

    /**
     * 清除数据
     */
    clearData () {
        this.nodes = [];
		this.edges = [];
		this.nodeSet = {};
		this.edgeSet = {};
		this.nodePoints = new Map();
		this.edgeSprings = new Map();
    }

};