class Block {
    type = "block";
    belongsToTextFile = false;
    isDirectoryBlock = false;

    constructor(blockNumber) {
        this.blockNumber = blockNumber;

        this.block = new DataView(image, Config.blockSize * blockNumber, Config.blockSize);
        this.uint8Array = new Uint8Array(this.block.buffer, this.block.byteOffset, this.block.byteLength);
        this.uint32Array = new Uint32Array(this.block.buffer, this.block.byteOffset, this.block.byteLength);

        this.isBlockAscii = this.uint8Array.every(e => e < 128);
    }

    getHumanReadableDataDOM(innerHTML) {
        const node = document.createElement("div");
        if (innerHTML)
            node.innerHTML = innerHTML;
        else if (this.isDirectoryBlock)
            node.innerHTML = this.getEntriesDOM().innerHTML;
        else if (this.belongsToTextFile)
            node.innerHTML = new TextDecoder("utf-8").decode(this.block);
        else
            return;
        return node;
    }

    getMachineReadableDataDOM() {
        const node = document.createElement("pre");
        node.innerHTML = Array.from(this.uint32Array)
            .map(e => e.toString(16).padStart(8, '0'))
            .join(", \t");
        return node;
    }

    getBlockSummaryDOM() {
        const blockSummary = document.createElement("h4");
        blockSummary.innerText = `Block ${this.blockNumber}: ${this.type}`;

        const node = document.createElement("div");
        node.appendChild(blockSummary);
        return node;

    }

    getDetailDOM() {
        const node = document.createElement("div");
        node.appendChild(this.getBlockSummaryDOM());

        const humanReadableDataDOM = this.getHumanReadableDataDOM();
        if (humanReadableDataDOM)
            node.appendChild(humanReadableDataDOM);
        else
            node.appendChild(this.getMachineReadableDataDOM());

        return node;
    }

    renderGrid() {
        const node = document.createElement("div");
        node.classList.add(this.type.toLowerCase().replace(' ', '-'));
        node.onmouseover = () => {
            detailContentDOM.innerHTML = this.getDetailDOM().innerHTML;
            node.classList.add("hover");
        };

        node.onmouseleave = () => node.classList.remove("hover");
        blockContainerDOM.appendChild(node);
    }


}


class SuperBlock extends Block {
    type = "Super Block";

    constructor(blockNumber) {
        super(blockNumber);

        this.size = this.block.getUint32(0, true);
        this.nblocks = this.block.getUint32(4, true);
        this.ninodes = this.block.getUint32(8, true);
        this.ninodeblocks = this.ninodes * Config.inodeSize / Config.blockSize;
    }

    getHumanReadableDataDOM() {
        const innerHTML = `${this.size} + ${this.nblocks} + ${this.ninodes}`;
        return super.getHumanReadableDataDOM(innerHTML);
    }
}

class BitmapBlock extends Block {
    type = "Bitmap Block";

    getMachineReadableDataDOM() {
        const node = document.createElement("pre");
        node.innerHTML = Array.from(this.uint8Array)
            .map(e => e.toString(2).padStart(8, '0'))
            .join(", \t");
        return node;
    }

}

class UnusedBlock extends Block {
    type = "Unused Block";
}

class InodeBlock extends Block {
    type = "Inode Block";
}

class DataBlock extends Block {
    type = "Data Block";


    getEntries() {
        let entries = {};
        for (let i = 0; i < Config.blockSize / Config.entrySize; i++) {
            const inum = this.block.getUint16(Config.entrySize * i, true);
            if (inum === 0) continue;

            const nameOffset = this.block.byteOffset + Config.entrySize * i + 2;
            const nameArray = new Uint8Array(this.block.buffer, nameOffset, Config.entrySize - 2);
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