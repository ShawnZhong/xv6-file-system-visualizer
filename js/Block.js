class Block extends Grid {
    container = blockContainer;

    belongsToTextFile = false;
    isDirectoryBlock = false;

    constructor(blockNumber) {
        super();
        this.blockNumber = blockNumber;

        this.dataView = new DataView(image, Config.blockSize * blockNumber, Config.blockSize);
        this.uint8Array = new Uint8Array(this.dataView.buffer, this.dataView.byteOffset, this.dataView.byteLength);
        this.uint32Array = new Uint32Array(this.dataView.buffer, this.dataView.byteOffset, this.dataView.byteLength);

        this.isBlockAscii = this.uint8Array.every(e => e < 128);
    }

    getType() {
        // implemented by child class
    }

    getClassName() {
        return this.getType().toLowerCase().replace(' ', '-');
    }

    getDetailContentDOM() {
        if (this.isDirectoryBlock)
            return this.getEntriesDOM();

        if (this.belongsToTextFile) {
            const node = document.createElement("div");
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
        node.innerText = `Block ${this.blockNumber}: ${this.getType()}`;
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
    }

    getType() {
        return "Super Block";
    }

    getDetailContentDOM() {
        const node = document.createElement("div");

        const size = document.createElement("p");
        size.innerText = "Image size: " + this.size;
        node.appendChild(size);

        const nblocks = document.createElement("p");
        nblocks.innerText = "Number of blockList: " + this.nblocks;
        node.appendChild(nblocks);

        const ninodes = document.createElement("p");
        ninodes.innerText = "Number of inodeList: " + this.ninodes;
        node.appendChild(ninodes);

        return node;
    }
}

class BitmapBlock extends Block {
    getDetailContentDOM() {
        const node = document.createElement("pre");
        node.innerHTML = Array.from(this.uint8Array)
            .map(e => e.toString(2).padStart(8, '0'))
            .join(", \t");
        return node;
    }

    getType() {
        return "Bitmap Block";
    }

}

class UnusedBlock extends Block {
    getType() {
        return "Unused Block";
    }
}

class InodeBlock extends Block {
    getType() {
        return "Inode Block";
    }
}

class DataBlock extends Block {
    getType() {
        return "Data Block";
    }

    getEntries() {
        let entries = {};
        for (let i = 0; i < Config.blockSize / Config.entrySize; i++) {
            const inum = this.dataView.getUint16(Config.entrySize * i, true);
            if (inum === 0) continue;

            const nameOffset = this.dataView.byteOffset + Config.entrySize * i + 2;
            const nameArray = new Uint8Array(this.dataView.buffer, nameOffset, Config.entrySize - 2);
            const name = new TextDecoder("utf-8").decode(nameArray);

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