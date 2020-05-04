/**
 * @file 质点类，包含加速度等信息
 */
import Vector from './Vector.js';

export default class Point {
    constructor (position, id = -1, group = -1, mass = 1.0) {

        // 质点坐标
        this.position = position;
        // 质点质量
        this.mass = mass;
        // 速度
        this.velocity = new Vector(0, 0);
        // 加速度
        this.acceleration = new Vector(0, 0);
        // id
        this.id = id;

        this.group = group;
    }

    /**
     * 更新加速度
     * @param {Vector} force - 受力大小
     */
    updateAcceleration (force) {

        // 加速度 = 受力大小 / 质量
        this.acceleration = this.acceleration.add(force.divide(this.mass));
    }
};