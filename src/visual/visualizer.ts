import * as fs from "fs";
import {Network} from "../Network";
import * as opn from "opn";

export class Visualizer {

  constructor() {
    opn("./index.html");
  }

  update(network: Network) {
    const adjacency = network.adjacency;
    const nodes = [];
    for (let i = 0; i < adjacency.rows; i++) {
      if (network.isInputNode(i)) nodes.push({id: i, label: i, color: "red"});
      else if (network.isOutputNode(i)) nodes.push({id: i, label: i, color: "green"});
      else nodes.push({id: i, label: i, color: "blue"});
    }
    const conns = [];
    adjacency.forEach(((element, row, column) => {
      if (element !== 0) conns.push({from: row, to: column});
    }));
    fs.writeFileSync("script.js", `
      const nodes = new vis.DataSet(${JSON.stringify(nodes)});
      const edges = new vis.DataSet(${JSON.stringify(conns)});
      const options = {
        autoResize: true,
        height: "100%",
        width: "100%",
        edges: {
          smooth: {
            type: "cubicBezier",
            forceDirection: "vertical"
          }
        },
        layout: {
          hierarchical: {
            direction: 'LR',
            sortMethod: "directed"
          }
        },
        physics: true
      };
      new vis.Network(document.getElementById("network"), {nodes: nodes, edges: edges}, options);
    `);
  }
}

const visualizer = new Visualizer();
setInterval(() => {
  const network = new Network(2, 3);
  for (let i = 0; i < 10; i++) network.mutate();
  visualizer.update(network);
}, 1000);