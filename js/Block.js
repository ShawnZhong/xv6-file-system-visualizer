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

    getData(radix = 16) {
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

    getDetailDOM() {
        const node = document.createElement("div");
        node.innerHTML = this.getData().toString();
        return node;
    }

    renderGrid(className = "unused-block", body = "") {
        const node = document.createElement("div");
        node.classList.add(className);
        node.onmouseover = () => detailContentDOM.innerHTML = this.getDetailDOM().innerHTML;
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