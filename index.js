const blockContainerDOM = document.getElementById("block-container");
const inodeContainerDOM = document.getElementById("inode-container");

let image;
let superBlock;
let inodes;
let blocks;

async function main(file) {
    image = await loadImage(file);

    initBlocks();
    renderGrid();

    initInodes();
    renderInodes();
}

async function loadImage(file) {
    if (file instanceof File) { // local file
        const reader = new FileReader();
        return await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
            reader.readAsArrayBuffer(file);
        });
    } else { // remote file
        const response = await fetch(file);
        return await response.arrayBuffer();
    }
}

function initBlocks() {
    superBlock = new SuperBlock();

    blocks = new Array(superBlock.nblocks);

    blocks[0] = new Block(0);
    blocks[1] = superBlock;
    for (let i = 2; i < 2 + superBlock.ninodeblocks; i++)
        blocks[i] = new InodeBlock(i);

    blocks[superBlock.ninodeblocks + 2] = new BitmapBlock();

    for (let i = superBlock.ninodeblocks + 3; i < superBlock.nblocks; i++)
        blocks[i] = new DataBlock(i);
}

function renderGrid() {
    blockContainerDOM.innerHTML = "";
    for (let i = 0; i < superBlock.nblocks; i++)
        blocks[i].renderGrid();
}

function initInodes() {
    inodes = Array.from(new Array(superBlock.ninodes).keys(), i => new Inode(i));
}

function renderInodes() {
    inodeContainerDOM.innerHTML = "";
    inodes.forEach(e => e.renderGrid());
}

class Block {
    static SIZE = 512;

    constructor(blockNumber) {
        if (!blockNumber) return;
        this.blockNumber = blockNumber;
        this.block = new DataView(image, Block.SIZE * blockNumber, Block.SIZE);
        this.uint8Array = new Uint8Array(this.block.buffer, this.block.byteOffset, this.block.byteLength);
    }

    isAscii() {
        return this.uint8Array.every(e => e < 128);
    }

    getData(radix = 0) {
        switch (radix) {
            case 0:
                return new TextDecoder("utf-8").decode(this.block);
            case 2:
                return Array.from(this.uint8Array).map(e => e.toString(2).padStart(8, '0'));
            case 16:
                const uint32Array = new Uint32Array(this.block.buffer, this.block.byteOffset, this.block.byteLength);
                return Array.from(uint32Array).map(e => e.toString(16).padStart(8, '0'));
        }
    }

    renderGrid(className = "unused-block", body = "") {
        let node = document.createElement("div");
        node.classList.add(className);
        node.innerHTML = body;
        blockContainerDOM.appendChild(node);
    }
}

class SuperBlock extends Block {
    constructor() {
        super(1);

        this.size = this.block.getUint32(0, true);
        this.nblocks = this.block.getUint32(4, true);
        this.ninodes = this.block.getUint32(8, true);
        this.ninodeblocks = this.ninodes * Inode.SIZE / Block.SIZE;
    }

    renderGrid() {
        super.renderGrid("super-block");
    }
}

class BitmapBlock extends Block {
    constructor() {
        super(superBlock.ninodeblocks + 3);
    }

    getData() {
        return super.getData(2);
    }

    renderGrid() {
        super.renderGrid("bitmap-block");
    }
}

class InodeBlock extends Block {
    renderGrid() {
        super.renderGrid("inode-block");
    }
}

class DataBlock extends Block {
    renderGrid() {
        super.renderGrid("data-block");
    }
}

class DirectoryBlock extends DataBlock {
    static ENTRY_SIZE = 16;

    getEntries() {
        let entries = {};
        for (let i = 0; i < Block.SIZE / DirectoryBlock.ENTRY_SIZE; i++) {
            const inum = this.block.getUint16(DirectoryBlock.ENTRY_SIZE * i, true);
            if (inum === 0) continue;

            const nameOffset = this.block.byteOffset + DirectoryBlock.ENTRY_SIZE * i + 2;
            const nameArray = new Uint8Array(this.block.buffer, nameOffset, DirectoryBlock.ENTRY_SIZE - 2);
            const name = new TextDecoder("utf-8").decode(nameArray);

            entries[name] = inum;
        }

        return entries;
    }
}

class Inode {
    static SIZE = 64;
    static NDIRECT = 12;

    constructor(inum) {
        this.inum = inum;
        this.inode = new DataView(image, Block.SIZE * 2 + inum * Inode.SIZE);

        this.type = this.inode.getUint16(0, true);
        this.major = this.inode.getUint16(2, true);
        this.minor = this.inode.getUint16(4, true);
        this.nlink = this.inode.getUint16(6, true);
        this.size = this.inode.getUint32(8, true);

        this.indirectAddress = this.inode.getUint32(12 + Inode.NDIRECT * 4, true);
        this.dataAddresses = this.getAddresses();
        this.typeName = this.getTypeName();
    }

    getAddresses() {
        const numberOfAddresses = (this.size + Block.SIZE - 1) / Block.SIZE;
        let addresses = new Uint32Array(numberOfAddresses);

        // direct addresses
        for (let i = 0; i < Inode.NDIRECT; i++)
            addresses[i] = this.inode.getUint32(12 + i * 4, true);

        // indirect addresses
        if (numberOfAddresses > Inode.NDIRECT) {
            const indirectBlock = new Block(this.indirectAddress).block;
            for (let i = 0; i < numberOfAddresses - Inode.NDIRECT - 1; i++)
                addresses[Inode.NDIRECT + i] = indirectBlock.getUint32(i * 4, true);
        }

        return addresses;
    }

    getTypeName() {
        if (this.type > 3) return "Unknown";
        return ["unused", "directory", "file", "device"][this.type];
    }

    getDirectoryDOM() {
        const entries = Array.from(this.dataAddresses)
            .map(e => new DirectoryBlock(e).getEntries())
            .reduce((accumulator, currentValue) => Object.assign(accumulator, currentValue), {});

        const bodyDOM = document.createElement("div");
        bodyDOM.innerHTML = Object.entries(entries).map(([name, inum]) => `${name} => ${inum}`).join("<br>");
        return bodyDOM;
    }


    getFileDOM() {
        const blocks = Array.from(this.dataAddresses).map(e => new Block(e));
        const bodyDOM = document.createElement("div");
        // if (blocks.every(e => e.isAscii()))
        //     bodyDOM.innerHTML = blocks.map(e => e.getData()).toString();
        // else
        //     bodyDOM.innerHTML = blocks.map(e => e.getData(16)).toString();

        return bodyDOM;
    }


    renderGrid() {
        // const titleDOM = document.createElement("div");
        // titleDOM.innerText = `inum = ${this.inum}; type = ${this.type}`;


        //     node.classList.add(className);
        //
        //
        // const containerDOM = document.createElement("div");
        // containerDOM.appendChild(titleDOM);


        // if (this.type === 1)
        //     containerDOM.appendChild(this.getDirectoryDOM());
        // else if (this.type === 2)
        //     containerDOM.appendChild(this.getFileDOM());

        const node = document.createElement("div");
        node.classList.add(this.typeName + "-inode");


        inodeContainerDOM.appendChild(node);


    }
}
