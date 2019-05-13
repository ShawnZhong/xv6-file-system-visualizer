let superBlock;
let blockList;

class BlockUtils {
    static render() {
        Block.container.innerHTML = "";
        blockList.forEach(e => Block.container.appendChild(e.initGridDOM()));
        superBlock.gridDOM.onmouseover();
    }

    static initBlockList() {
        superBlock = new SuperBlock(1);
        blockList = new Array(superBlock.nblocks);

        blockList[0] = new UnusedBlock(0);
        blockList[1] = superBlock;

        let i = 2;

        while (i < 2 + superBlock.ninodeblocks)
            blockList[i] = new InodeBlock(i++);

        blockList[i] = new UnusedBlock(i++);
        blockList[i] = new BitmapBlock(i++);

        while (i < superBlock.nblocks)
            blockList[i] = new DataBlock(i++);
    }
}


class Block extends Grid {
    static container = document.getElementById("block-container");

    type = "Block";
    belongsToTextFile = false;
    isDirectoryBlock = false;
    belongsToInum = -1;

    constructor(blockNumber) {
        super();
        this.blockNumber = blockNumber;

        this.dataView = new DataView(image, Config.blockSize * blockNumber, Config.blockSize);
        this.uint8Array = new Uint8Array(this.dataView.buffer, this.dataView.byteOffset, this.dataView.byteLength);
        this.uint32Array = new Uint32Array(this.dataView.buffer, this.dataView.byteOffset, this.dataView.byteLength);
    }


    isBlockAscii() {
        return this.uint8Array.every(e => e < 128);
    }

    getClassName() {
        return this.type.toLowerCase().replace(' ', '-');
    }

    getDetailContentDOM() {
        if (this.isDirectoryBlock)
            return this.getEntriesDOM();

        if (this.belongsToTextFile) {
            const node = document.createElement("pre");
            node.innerText = new TextDecoder("utf-8").decode(this.dataView);
            return node;
        }


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

    getRelatedGrid() {
        if (this.belongsToInum !== -1) return [inodeList[this.belongsToInum]];
        return super.getRelatedGrid();
    }
}


class SuperBlock extends Block {
    type = "Super Block";

    constructor(blockNumber) {
        super(blockNumber);

        this.size = this.dataView.getUint32(0, true);
        this.nblocks = this.dataView.getUint32(4, true);
        this.ninodes = this.dataView.getUint32(8, true);
        this.ninodeblocks = this.ninodes * Config.inodeSize / Config.blockSize;
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
    type = "Bitmap Block";

    getDetailContentDOM() {
        const node = document.createElement("pre");
        node.innerHTML = Array.from(this.uint8Array)
            .map(e => e.toString(2).padStart(8, '0'))
            .join(", \t");
        return node;
    }
}

class DataBlock extends Block {
    type = "Data Block";

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
}

class UnusedBlock extends Block {
    type = "Unused Block";

}

class InodeBlock extends Block {
    type = "Inode Block";
}