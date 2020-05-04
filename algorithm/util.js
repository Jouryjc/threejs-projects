
/**
 * @desc 模拟数据
 */
export function getData(num, exLink) {
    const data = { nodes: new Array(num).fill(1), links: [] };
    data.nodes = data.nodes.map((d, id) => {
        return {
            id,
            name: d,
            position: [0, 0],
            childs: []
        }
    });

    data.nodes.forEach((d, i) => {
        // 都和0相连
        if (d.id !== 0) {
            data.links.push({
                source: 0,
                target: d.id,
                sourceNode: data.nodes[0],
                targetNode: d
            });
        }
    });

    // 随机抽取其中2个相连
    const randomLink = () => {
        data.nodes.sort(() => 0.5 - Math.random());
        data.links.push({
            source: data.nodes[0].id,
            target: data.nodes[1].id,
            sourceNode: data.nodes[0],
            targetNode: data.nodes[1]
        });
    }

    for (let i = 0; i < exLink; i++) {
        randomLink();
    };

    // 添加数据。childs
    const obj = {};
    data.nodes.forEach(d => {
        if (!obj[d.id]) {
            obj[d.id] = d;
        }
    });
    data.links.forEach(d => {
        obj[d.source].childs.push(d.targetNode);
        obj[d.target].childs.push(d.sourceNode);
    });

    return data;
}

/**
 * @desc 绘制
 * @param ctx canvas上下文
 * @param data 数据
 * @param size 画布大小
 */
export function render(ctx, data, size) {
    ctx.clearRect(0, 0, size, size); //清空所有的内容
    const box = 20;
    ctx.fillStyle = '#FF0000';
    data.links.forEach(d => {
        let { sourceNode, targetNode } = d;
        let [x1, y1] = sourceNode.position;
        let [x2, y2] = targetNode.position;
        ctx.beginPath(); //新建一条path
        ctx.moveTo(x1, y1); //把画笔移动到指定的坐标
        ctx.lineTo(x2, y2);  //绘制一条从当前位置到指定坐标(200, 50)的直线.
        ctx.closePath();
        ctx.stroke(); //绘制路径。
    });
    data.nodes.forEach(d => {
        let [x, y] = d.position;
        ctx.fillText(d.id, x, y + box);
        ctx.fillRect(x - box / 2, y - box / 2, box, box);
    });
}

/**
 * @desc 打乱顺序定位
 * @param data 数据
 * @param size 画布大小
 */
export function randomPosition(data, size) {
    const { nodes, links } = data;
    nodes.forEach(d => {
        let x = getRandom(0, size);
        let y = getRandom(0, size);
        d.position = [x, y];
    });
}

/**
 * @desc 获取随机数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 介于min跟max之间随机数
 */
function getRandom(min, max) {
    return Math.floor(min + Math.random() * (max - min));
}