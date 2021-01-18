import * as fs from "fs";
import {Network} from "../Network";
import * as opn from "opn";
import * as os from "os";
import * as path from "path";
import UUID from "pure-uuid";

export class Visualizer {
  private directory: string;

  constructor() {
    const id = new UUID(4).format();
    const directory = path.join(os.tmpdir(), id);
    fs.mkdirSync(directory);
    this.directory = directory;

    fs.writeFileSync(`${this.directory}/index.html`, `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Visualizer</title>
          <meta content="1" http-equiv="refresh">
        </head>
        <body>
          <div id="network" style="height: 90vh; width: 90vw;"></div>
          <script src="https://visjs.github.io/vis-network/standalone/umd/vis-network.min.js"></script>
          <script src="script.js" type="text/javascript"></script>
        </body>
      </html>
    `);
    opn(`${this.directory}/index.html`);
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
    fs.writeFileSync(`${this.directory}/script.js`, `
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
