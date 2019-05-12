class Block {

    constructor(blockNumber) {
        if (!blockNumber) return;
        this.blockNumber = blockNumber;
        this.block = new DataView(image, Config.blockSize * blockNumber, Config.blockSize);
        this.uint8Array = new Uint8Array(this.block.buffer, this.block.byteOffset, this.block.byteLength);
        this.uint32Array = new Uint32Array(this.block.buffer, this.block.byteOffset, this.block.byteLength);

        this.isTextFile = false;
        this.isDirectoryBlock = false;
    }

    isBlockAscii() {
        return this.uint8Array.every(e => e < 128);
    }

    getHexDataDOM() {
        const node = document.createElement("pre");
        node.innerHTML = Array.from(this.uint32Array)
            .map(e => e.toString(16).padStart(8, '0'))
            .join(", \t");
        return node;
    }

    isHumanReadable() {
        return this.isDirectoryBlock || this.isTextFile;
    }

    getHumanReadableDataDOM() {

        const node = document.createElement("div");
        if (this.isDirectoryBlock)
            node.innerHTML = this.getEntires();
        else if (this.isTextFile)
            node.innerHTML = new TextDecoder("utf-8").decode(this.block);
        return node;
    }

    getDetailDOM() {
        const node = document.createElement("div");
        node.appendChild(this.isHumanReadable() ? this.getHumanReadableDataDOM() : this.getHexDataDOM());
        return node;
    }

    renderGrid(className = "unused-block", body = "") {
        const node = document.createElement("div");
        node.classList.add(className);
        node.onmouseover = () => detailContentDOM.innerHTML = this.getDetailDOM().innerHTML;
        node.innerHTML = body;
        blockContainerDOM.appendChild(node);
    }

    getEntires() {
        let entries = {};
        for (let i = 0; i < Config.blockSize / Config.entrySize; i++) {
            const inum = this.block.getUint16(Config.entrySize * i, true);
            if (inum === 0) continue;

            const nameOffset = this.block.byteOffset + Config.entrySize * i + 2;
            const nameArray = new Uint8Array(this.block.buffer, nameOffset, Config.entrySize - 2);
            const name = new TextDecoder("utf-8").decode(nameArray);

            entries[name] = inum;
        }

        return Object.entries(entries).map(([name, inum]) => `${name} => ${inum}`).join("<br>");
    }

}

class SuperBlock extends Block {
    constructor() {
        super(1);

        this.size = this.block.getUint32(0, true);
        this.nblocks = this.block.getUint32(4, true);
        this.ninodes = this.block.getUint32(8, true);
        this.ninodeblocks = this.ninodes * Config.inodeSize / Config.blockSize;
    }

    renderGrid() {
        super.renderGrid("super-block");
    }
}

class BitmapBlock extends Block {
    constructor() {
        super(superBlock.ninodeblocks + 3);
    }

    getHexDataDOM() {
        const node = document.createElement("pre");
        node.innerHTML = Array.from(this.uint8Array)
            .map(e => e.toString(2).padStart(8, '0'))
            .join(", \t");
        return node;
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