class DirectoryTreeNode {
  constructor(id, name, isFolder, fileType, parentId = null) {
    this.id = id;
    this.name = name;
    this.isFolder = isFolder;
    this.fileType = fileType; 
    this.parentId = parentId;
    this.children = [];
  }

  addChild(childNode) {
    this.children.push(childNode);
  }
}

export class DirectoryTree {
  constructor() {
    this.nodes = new Map();
    const rootId = uuidv4();
    this.root = new DirectoryTreeNode(rootId, '', 'folder');
    this.nodes.set(rootId, this.root);
  }

  getNodeById(id) {
    return this.nodes.get(id);
  }

  search(query, node = this.root) {
    let results = [];
    if (node.name.toLowerCase().includes(query.toLowerCase())) {
      results.push(node);
    }
    for (let child of node.children) {
      results = results.concat(this.search(query, child));
    }
    return results;
  }

  getPath(nodeId) {
    const path = [];
    let currentNode = this.nodes.get(nodeId);
    while (currentNode && currentNode !== this.root) {
      path.unshift(currentNode.name);
      currentNode = this.nodes.get(currentNode.parentId);
    }
    return '/' + path.join('/');
  }

  getChildNodebyCurrentNodeId(currentNodeId) {
    const thisNode = this.getNodeById(currentNodeId);
    return thisNode.children;
  }
}
