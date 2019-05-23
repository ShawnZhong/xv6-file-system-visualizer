let superBlock;
let blockList;
let bitmap;

class BlockUtils {
    static init() {
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

    static render() {
        Elements.blockContainer.innerHTML = "";
        blockList.forEach(e => Elements.blockContainer.appendChild(e.getGridElement()));
        superBlock.gridElement.onmouseover();
    }

    static isDataBlockEmpty(blockNumber) {
        return (bitmap.dataView.getUint8(blockNumber / 8) & (1 << blockNumber % 8)) === 0;
    }
}


class Block extends GridItem {
    constructor(blockNumber) {
        super();
        this.blockNumber = blockNumber;

        this.dataView = new DataView(image, Config.blockSize * blockNumber, Config.blockSize);
        this.uint8Array = new Uint8Array(this.dataView.buffer, this.dataView.byteOffset, this.dataView.byteLength);
        this.uint32Array = new Uint32Array(this.dataView.buffer, this.dataView.byteOffset, this.dataView.byteLength);
    }

    getDetailElement() {
        if (this.detailElement) return this.detailElement;

        this.detailElement = document.createElement("div");

        this.detailElement.appendChild(this.getErrorElement());
        this.detailElement.appendChild(this.getSummaryDOM());
        this.detailElement.appendChild(this.getDataElement());

        return this.detailElement;
    }

    getSummaryDOM() {
        const title = document.createElement("h4");
        title.innerText = "Contents in hexadecimal: ";
        return title;
    }

    getDataElement() {
        if (this.dataElement) return this.dataElement;
        return this.getHexDataElement();
    }

    getHexDataElement() {
        const element = document.createElement("pre");
        element.innerText = Array.from(this.uint32Array)
            .map(e => e.toString(16).padStart(8, '0'))
            .join(", \t");
        return element
    }

    getClassName() {
        return this.type.toLowerCase().replace(' ', '-');
    }

    getTitle() {
        return `Block ${this.blockNumber}: ${this.type}`;
    }

    isBlockAscii() {
        return false;
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


    getSummaryDOM() {
        const node = document.createElement("div");

        const title = document.createElement("h4");
        title.innerText = "Metadata: ";
        node.appendChild(title);

        const size = document.createElement("p");
        size.innerText = "Image size: " + this.size;
        node.appendChild(size);

        const nblocks = document.createElement("p");
        nblocks.innerText = "Number of blocks: " + this.nblocks;
        node.appendChild(nblocks);

        const ninodes = document.createElement("p");
        ninodes.innerText = "Number of inodes: " + this.ninodes;
        node.appendChild(ninodes);

        node.appendChild(super.getSummaryDOM());

        return node;
    }

    getGridText() {
        return 'S';
    }
}

class BitmapBlock extends Block {
    constructor(blockNumber) {
        super(blockNumber);
        this.type = "Bitmap Block";
    }

    getSummaryDOM() {
        const title = document.createElement("h4");
        title.innerText = "Contents in binary: ";
        return title;
    }

    getDataElement() {
        if (this.dataElement) return this.dataElement;

        this.dataElement = document.createElement("pre");
        this.dataElement.innerHTML = Array.from(this.uint8Array)
            .map(e => e.toString(2).padStart(8, '0'))
            .join(", \t");

        return this.dataElement;
    }

    getGridText() {
        return 'B';
    }
}

class DataBlock extends Block {
    constructor(blockNumber) {
        super(blockNumber);

        this.belongsToTextFile = false;
        this.isDirectoryBlock = false;

        this.type = "Data Block";
        this.gridText = 'D';
    }


    isBlockAscii() {
        return this.uint8Array.every(e => e < 128);
    }

    getSummaryDOM() {
        const node = document.createElement("div");

        if (this.inode) {
            const title = document.createElement("h4");
            title.innerText = `Basic information: `;
            node.appendChild(title);


            const inode = document.createElement("p");
            inode.innerText = `Used by: inode ${this.inode.inum}`;
            node.appendChild(inode);

            const type = document.createElement("p");
            type.innerText = `Type: ${this.inode.typeName}`;
            node.appendChild(type);

            if (this.inode.pathList.length !== 0) {
                const path = document.createElement("p");
                path.innerText = `Path: ${this.inode.pathList.join(", ")}`;
                node.appendChild(path);

            }
        }


        if (this.isDirectoryBlock || this.belongsToTextFile) {
            const content = document.createElement("h4");
            content.innerText = "Contents: ";
            node.appendChild(content);
        } else {
            node.appendChild(super.getSummaryDOM());
        }

        return node;
    }

    getDataElement() {
        if (this.dataElement) return this.dataElement;

        if (this.isDirectoryBlock)
            return this.getEntriesDOM();

        if (this.belongsToTextFile) {
            const node = document.createElement("pre");
            node.innerText = new TextDecoder("utf-8").decode(this.dataView).replace(/\0/g, '');
            node.classList.add("text");
            return node;
        }

        return this.getHexDataElement();
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
        const node = document.createElement("pre");
        node.innerHTML = Object.entries(entries).map(([name, inum]) => `${name} → ${inum}`).join("\n");
        return node;
    }

    getRelatedDOMList() {
        return this.inode ? [this.inode.gridElement, ...this.inode.getRelatedDOMList()] : [];
    }

    checkError() {
        if (!this.inode && !(this instanceof UnusedBlock)) {
            return "Bitmap marks block in use but it is not in use."
        }

        if (this.inode && this instanceof UnusedBlock) {
            return "Block used by inode but marked free in bitmap."
        }
    }

    getGridText() {
        return 'D';
    }
}


class InodeBlock extends Block {
    constructor(blockNumber) {
        super(blockNumber);
        this.type = "Inode Block";
    }

    getRelatedDOMList() {
        const numberOfInodesPerBlock = Config.blockSize / Config.inodeSize;
        return [...Array(numberOfInodesPerBlock).keys()]
            .map(i => i + numberOfInodesPerBlock * (this.blockNumber - 2))
            .map(i => inodeList[i].gridElement);
    }

    getGridText() {
        return 'I';
    }
}

class UnusedBlock extends DataBlock {
    constructor(blockNumber) {
        super(blockNumber);
        this.type = "Unused Block";
    }

    getGridText() {
        return '-';
    }
}