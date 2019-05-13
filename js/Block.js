let superBlock;
let blockList;
let bitmap;

class BlockUtils {
    static render() {
        const container = document.getElementById("block-container");
        container.innerHTML = "";
        blockList.forEach(e => container.appendChild(e.initGridDOM()));
        superBlock.gridDOM.onmouseover();
    }

    static initBlockList() {
        superBlock = new SuperBlock(1);
        blockList = [];


        blockList.push(new UnusedBlock(0));
        blockList.push(superBlock);

        let i = 2;

        while (i < 2 + superBlock.ninodeblocks) {
            blockList.push(new InodeBlock(i++));
        }

        blockList.push(new UnusedBlock(i++));

        bitmap = new BitmapBlock(i++);
        blockList.push(bitmap);

        while (i < superBlock.nblocks)
            blockList.push(BlockUtils.isDataBlockEmpty(i) ? new UnusedBlock(i++) : new DataBlock(i++));
    }

    static isDataBlockEmpty(blockNumber) {
        return (bitmap.dataView.getUint8(blockNumber / 8) & (1 << blockNumber % 8)) === 0;
    }
}


class Block extends Grid {
    constructor(blockNumber) {
        super();
        this.blockNumber = blockNumber;

        this.dataView = new DataView(image, Config.blockSize * blockNumber, Config.blockSize);
        this.uint8Array = new Uint8Array(this.dataView.buffer, this.dataView.byteOffset, this.dataView.byteLength);
        this.uint32Array = new Uint32Array(this.dataView.buffer, this.dataView.byteOffset, this.dataView.byteLength);
    }


    getClassName() {
        return this.type.toLowerCase().replace(' ', '-');
    }

    getDetailContentDOM() {
        const node = document.createElement("pre");
        node.innerText = Array.from(this.uint32Array)
            .map(e => e.toString(16).padStart(8, '0'))
            .join(", \t");

        return node;
    }

    getDetailTitleDOM() {
        const node = document.createElement("h4");
        node.innerText = `Block ${this.blockNumber}: ${this.type}`;
        return node;
    }
}


class SuperBlock extends Block {


    constructor(blockNumber) {
        super(blockNumber);

        this.size = this.dataView.getUint32(0, true);
        this.nblocks = this.dataView.getUint32(4, true);
        this.ninodes = this.dataView.getUint32(8, true);
        this.ninodeblocks = this.ninodes * Config.inodeSize / Config.blockSize;

        this.type = "Super Block";
    }


    getDetailContentDOM() {
        const node = document.createElement("div");

        const size = document.createElement("p");
        size.innerText = "Image size: " + this.size;
        node.appendChild(size);

        const nblocks = document.createElement("p");
        nblocks.innerText = "Number of blocks: " + this.nblocks;
        node.appendChild(nblocks);

        const ninodes = document.createElement("p");
        ninodes.innerText = "Number of inodes: " + this.ninodes;
        node.appendChild(ninodes);

        return node;
    }
}

class BitmapBlock extends Block {
    constructor(blockNumber) {
        super(blockNumber);
        this.type = "Bitmap Block";
    }

    getDetailContentDOM() {
        const node = document.createElement("pre");
        node.innerHTML = Array.from(this.uint8Array)
            .map(e => e.toString(2).padStart(8, '0'))
            .join(", \t");
        return node;
    }
}

class DataBlock extends Block {
    constructor(blockNumber) {
        super(blockNumber);
        this.type = "Data Block";
        this.belongsToTextFile = false;
        this.isDirectoryBlock = false;
    }


    isBlockAscii() {
        return this.uint8Array.every(e => e < 128);
    }

    getDetailContentDOM() {
        if (this.isDirectoryBlock)
            return this.getEntriesDOM();

        if (this.belongsToTextFile) {
            const node = document.createElement("pre");
            node.innerText = new TextDecoder("utf-8").decode(this.dataView);
            node.classList.add("text");
            return node;
        }

        return super.getDetailContentDOM();
    }

    getEntries() {
        let entries = {};
        for (let i = 0; i < Config.blockSize / Config.entrySize; i++) {
            const inum = this.dataView.getUint16(Config.entrySize * i, true);
            if (inum === 0) continue;

            const nameOffset = this.dataView.byteOffset + Config.entrySize * i + 2;
            const nameArray = new Uint8Array(this.dataView.buffer, nameOffset, Config.entrySize - 2);
            const name = new TextDecoder("utf-8").decode(nameArray).replace(/\0/g, '');

            entries[name] = inum;
        }

        return entries;
    }

    getEntriesDOM() {
        const entries = this.getEntries();
        const node = document.createElement("div");
        node.innerHTML = Object.entries(entries).map(([name, inum]) => `${name} → ${inum}`).join("<br>");
        return node;
    }

    getRelatedGrid() {
        return this.belongingInode ? [this.belongingInode] : [];
    }
}


class InodeBlock extends Block {
    constructor(blockNumber) {
        super(blockNumber);
        this.type = "Inode Block";
    }

    getRelatedGrid() {
        return [...Array(Config.numberOfInodesPerBlock).keys()]
            .map(i => i + Config.numberOfInodesPerBlock * (this.blockNumber - 2))
            .map(i => inodeList[i]);
    }
}

class UnusedBlock extends DataBlock {
    constructor(blockNumber) {
        super(blockNumber);
        this.type = "Unused Block";
    }
}