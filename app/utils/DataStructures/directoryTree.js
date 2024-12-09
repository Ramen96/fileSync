import { v4 as uuidv4 } from "uuid";

class DirectoryTreeNode {
  constructor(id, name, type, parentId = null) {
    this.id = id;
    this.name = name;
    this.type = type; 
    this.parentId = parentId;
    this.children = [];
    // this.dbId = dbId;
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

  addNodeByPath(path, type, dbId) {
    const parts = path.split('/').filter(Boolean);
    let currentNode = this.root;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLastPart = i === parts.length - 1;
      
      let childNode = currentNode.children.find(child => child.name === part);
      
      if (!childNode) {
        const newId = uuidv4();
        const dataBaseID = dbId;
        childNode = new DirectoryTreeNode(newId, part, isLastPart ? type : 'folder', currentNode.id, dataBaseID);
        this.nodes.set(newId, childNode);
        currentNode.addChild(childNode);
      } else if (isLastPart && childNode.type === type) {
        throw new Error(`A ${type} named "${part}" already exists at this location`);
      } else if (isLastPart && childNode.type !== type) {
        console.warn(`A ${childNode.type} named "${part}" already exists at this location. Returning its ID.`);
      }
      
      currentNode = childNode;
    }
    
    return currentNode.id;
  }

  getNodeById(id) {
    return this.nodes.get(id);
  }

  getNodeByPath(path) {
    const parts = path.split('/').filter(Boolean);
    let currentNode = this.root;
    
    for (const part of parts) {
      currentNode = currentNode.children.find(child => child.name === part);
      if (!currentNode) return null;
    }
    
    return currentNode;
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
