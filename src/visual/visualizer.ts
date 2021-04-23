import * as fs from "fs";
import { Network } from "../Network";
import * as os from "os";
import * as path from "path";
import UUID from "pure-uuid";
import * as server from "simple-autoreload-server";
import { fastIsNaN } from "../utils/Utils";
import * as open from "open";

type weightColors = "black" | "green" | "red";

export class Visualizer {
  private readonly directory: string;
  private readonly server;

  constructor() {
    const id = new UUID(4).format();
    this.directory = path.join(os.tmpdir(), id);
    fs.mkdirSync(this.directory);

    this.server = server({
      port: 8008,
      path: this.directory,
      watch: "**/**.js",
      reload: "**/**.js",
      watchDelay: 0,
    });
    console.log("Visualizer started at: localhost:8008/index.html");

    fs.writeFileSync(
      `${this.directory}/index.html`,
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Visualizer</title>
        </head>
        <body>
          <div id="network" style="height: 90vh; width: 90vw;"></div>
          <script src="https://visjs.github.io/vis-network/standalone/umd/vis-network.min.js"></script>
          <script src="script.js" type="text/javascript"></script>
        </body>
      </html>
    `
    );

    // Opens the URL in the default browser.
    open("http://localhost:8008/index.html");
  }

  update(network: Network) {
    const nodes = [];
    const topological: number[][] = network.adjacency.getTopologicalSort(false);
    topological.forEach((set, level) =>
      set.forEach((nodeIndex) => {
        let color;
        if (network.isInputNode(nodeIndex)) color = "red";
        else if (network.isOutputNode(nodeIndex)) color = "green";
        else color = "blue";

        nodes.push({
          id: nodeIndex,
          label: nodeIndex,
          level: level,
          color: { background: color },
        });
      })
    );
    const conns = [];
    network.adjacency.forEach((element, row, column) => {
      if (!fastIsNaN(element)) {
        conns.push({
          from: row,
          to: column,
          color: weightColor(element),
        });
      }
    });
    fs.writeFileSync(
      `${this.directory}/script.js`,
      `
      const nodes = new vis.DataSet(${JSON.stringify(nodes)});
      const edges = new vis.DataSet(${JSON.stringify(conns)});
      const options = {
        autoResize: true,
        height: "100%",
        width: "100%",
        edges: {
          arrows: {
             to: {enabled: true, scaleFactor:1, type:'arrow'}
           },
          smooth: {
            type: "cubicBezier",
            forceDirection: "horizontal"
          }
        },
        layout: {
          hierarchical: {
            direction: 'LR',
            sortMethod: "directed",
            shakeTowards: "roots"
          }
        },
        physics: true
      };
      new vis.Network(document.getElementById("network"), {nodes: nodes, edges: edges}, options);
    `
    );
  }
}

function weightColor(weight: number): weightColors {
  if (weight == 1) return "black";
  if (weight > 0) return "green";
  return "red";
}
