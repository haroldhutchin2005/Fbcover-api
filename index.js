const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { loadImage, createCanvas, registerFont } = require('canvas');
const jimp = require('jimp');

const app = express();
const port = process.env.PORT || 3000;

app.get('/fbcover', async (req, res) => {
    const circle = async (image) => {
        image = await jimp.read(image);
        image.circle();
        return await image.getBufferAsync("image/png");
    };

    let pathImg = path.join(__dirname, 'cache', 'fbcover1.png');
    let pathAva = path.join(__dirname, 'cache', 'fbcover2.png');
    let pathLine = path.join(__dirname, 'cache', 'fbcover3.png');
    const cacheDir = path.resolve(__dirname, 'cache');

    const mainName = req.query.name;
    let color = req.query.color || 'no';
    if (color.toLowerCase() === "no") color = '#ffffff';
    const address = req.query.address;
    const name = mainName.toUpperCase();
    const email = req.query.email;
    const subname = req.query.subname;
    const phoneNumber = req.query.sdt;
    const uid = req.query.uid;

    if (!address || !name || !email || !subname || !phoneNumber || !uid) {
        return res.json({ error: 'Missing data to execute the command' });
    }

    //=================CONFIG IMG=============//
    const avtAnime = (
        await axios.get(
            `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
            { responseType: "arraybuffer" }
        )
    ).data;
    const background = (
        await axios.get(
            `https://1.bp.blogspot.com/-ZyXHJE2S3ew/YSdA8Guah-I/AAAAAAAAwtQ/udZEj3sXhQkwh5Qn8jwfjRwesrGoY90cwCNcBGAsYHQ/s0/bg.jpg`,
            { responseType: "arraybuffer" }
        )
    ).data;
    const hieuung = (
        await axios.get(
            `https://1.bp.blogspot.com/-zl3qntcfDhY/YSdEQNehJJI/AAAAAAAAwtY/C17yMRMBjGstL_Cq6STfSYyBy-mwjkdQwCNcBGAsYHQ/s0/mask.png`,
            { responseType: "arraybuffer" }
        )
    ).data;

    fs.writeFileSync(pathAva, Buffer.from(avtAnime));
    fs.writeFileSync(pathImg, Buffer.from(background));
    fs.writeFileSync(pathLine, Buffer.from(hieuung));

    const avatar = await circle(pathAva);

    //=================DOWNLOAD FONTS=============//
    const fontPath = path.join(__dirname, 'cache', 'UTMAvoBold.ttf');
    if (!fs.existsSync(fontPath)) {
        const fontData = (await axios.get(
            `https://drive.google.com/u/0/uc?id=1DuI-ou9OGEkII7n8odx-A7NIcYz0Xk9o&export=download`,
            { responseType: "arraybuffer" }
        )).data;
        fs.writeFileSync(fontPath, Buffer.from(fontData));
    }

    //=================DRAW BANNER=============//
    const baseImage = await loadImage(pathImg);
    const baseAva = await loadImage(avatar);
    const baseLine = await loadImage(pathLine);
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    registerFont(fontPath, { family: 'UTMAvoBold' });

    ctx.strokeStyle = "rgba(255,255,255, 0.2)";
    ctx.lineWidth = 3;
    ctx.font = "100px UTMAvoBold";
    ctx.strokeText(name, 30, 100);
    ctx.strokeText(name, 130, 200);
    ctx.textAlign = "right";
    ctx.strokeText(name, canvas.width - 30, canvas.height - 30);
    ctx.strokeText(name, canvas.width - 130, canvas.height - 130);
    ctx.fillStyle = '#ffffff';
    ctx.font = "55px UTMAvoBold";
    ctx.fillText(name, 680, 270);
    ctx.font = "40px UTMAvoBold";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "right";
    ctx.fillText(subname.toUpperCase(), 680, 320);
    ctx.font = "23px UTMAvoBold";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "start";
    ctx.fillText(phoneNumber.toUpperCase(), 1350, 252);
    ctx.fillText(email.toUpperCase(), 1350, 332);
    ctx.fillText(address.toUpperCase(), 1350, 410);

    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(baseLine, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(baseAva, 824, 180, 285, 285);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);

    return res.sendFile(pathImg);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
