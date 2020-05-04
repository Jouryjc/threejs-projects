/**
 * @file 力导向算法
 */



import { render } from './util.js';

/**
 * @desc 力算法
 */
export default function force(data, ctx, size) {
    const { nodes, links } = data;

    const maxInterval = 300; // 平衡位置间距
    const maxOffset = 10; // 最大变化位移
    const minOffset = 0; // 最小变化位移

    // https://github.com/d3/d3-force#collide_iterations
    const count = 100; 
    const attenuation = 40; // 力衰减

    const doforce = () => {
        nodes.forEach(d => {
            let [x1, y1] = d.position;

            nodes.forEach(e => {
                if (d.id === e.id) {
                    return;
                }
                let [x2, y2] = e.position;

                // 两点距离
                let interval = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));

                // 力衰减变量 https://github.com/d3/d3-force#simulation_alpha
                let forceOffset = 0;
                let x3, y3;

                // 如果大于平衡间距，靠拢。这里计算第三点的坐标用到了相似三角形原理
                if (interval > maxInterval) {

                    // https://github.com/d3/d3-force#simulation_alphaDecay
                    forceOffset = (interval - maxInterval) / attenuation;

                    forceOffset = Math.min(forceOffset, maxOffset);
                    forceOffset = Math.max(forceOffset, minOffset);
                    forceOffset += e.childs.length / attenuation;

                    let k = forceOffset / interval;
                    x3 = k * (x1 - x2) + x2;
                    y3 = k * (y1 - y2) + y2;
                
                // 如果小于平衡间距，排斥
                } else if (interval < maxInterval && interval > 0) {
                    forceOffset = (maxInterval - interval) / attenuation;

                    forceOffset = Math.min(forceOffset, maxOffset);
                    forceOffset = Math.max(forceOffset, minOffset);
                    forceOffset += e.childs.length / attenuation;

                    let k = forceOffset / (interval + forceOffset);
                    x3 = (k * x1 - x2) / (k - 1);
                    y3 = (k * y1 - y2) / (k - 1);
                } else {
                    x3 = x2;
                    y3 = y2;
                }

                // 边界设置
                x3 > size ? x3 -= 10 : null;
                x3 < 0 ? x3 += 10 : null;
                y3 > size ? y3 -= 10 : null;
                y3 < 0 ? y3 += 10 : null;
                e.position = [x3, y3];
            });
        })
    }

    let countForce = 0;

    const forceRun = () => {
        countForce++;
        if (countForce > count) {
            return;
        }
        doforce();
        render(ctx, data, size);
        
        requestAnimationFrame(forceRun);
    }

    forceRun();

}