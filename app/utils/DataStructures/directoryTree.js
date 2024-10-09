class DirectoryTreeNode{
  constructor(id, name, type, parentId = null) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.parentId = parentId;
    this.children = [];
  }

  addChild(childNode){
    this.children.push(childNode);
  }
}

export class DirectoryTree {
  constructor(rootId) {
    this.nodes = new Map();
    this.root = new DirectoryTreeNode(rootId, 'Root', 'folder');
    this.nodes.set(rootId, this.root);
  }

  addNode(id, name, type, parentId){
    const newNode = new DirectoryTreeNode(id, name, type, parentId);
    this.nodes.set(id, newNode);

    if(parentId) {
      const parentNode = this.nodes.get(parentId);
      if(parentNode) {
        parentNode.addChild(newNode);
      }
    }
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

    while (currentNode) {
      path.unshift(currentNode.name);
      currentNode = this.nodes.get(currentNode.parentId);
    }
    return path.join('/');
  }
}