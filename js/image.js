class Image {
    constructor(imageName) {
        this.imageSelector = document.createElement("div");

        this.inputElement = document.createElement("input");
        this.inputElement.name = 'file';
        this.inputElement.value = path + imageName;
        this.inputElement.type = 'radio';
        this.inputElement.id = imageName;
        this.inputElement.onchange = () => main(path + imageName);
        this.imageSelector.appendChild(this.inputElement);


        const textElement = document.createElement("pre");
        textElement.textContent = imageName + ' ';

        const labelElement = document.createElement("label");
        labelElement.htmlFor = imageName;
        labelElement.appendChild(textElement);

        this.imageSelector.appendChild(labelElement);
    }

    choose() {
        this.inputElement.checked = true;
        this.inputElement.onchange();
    }

}


