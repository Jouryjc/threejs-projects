/**
 * @file 力导向图元素
 */

let Node = function (data) {
	this.id = data.id;
	this.data = data || {};
};

let Edge = function (id, source, target, data) {
	this.id = id;
	this.source = source;
	this.target = target;
	this.data = data || {};
};

export {
	Node,
	Edge
}