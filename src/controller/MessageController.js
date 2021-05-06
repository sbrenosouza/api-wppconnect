import {contactToArray} from "../util/functions";
import path from "path";

function returnError(res, session, error) {
    Logger.error(error);
    res.status(400).json({
        response: {
            message: "Sua mensagem não foi enviada.",
            session: session,
            log: error
        },
    });
}

function returnSucess(res, session, phone) {
    res.status(201).json({
        response: {
            message: "Mensagem enviada com sucesso.",
            contact: phone,
            session: session
        },
    });
}

export async function sendMessage(req, res) {
    const session = req.session;
    const {phone, message, isGroup = false} = req.body;


    try {
        for (const contato of contactToArray(phone)) {
            if (isGroup) {
                await res.client.sendText(`${contato}@g.us`, message);
            } else {
                await res.client.sendText(`${contato}@c.us`, message);
            }
        }

        req.io.emit("mensagem-enviada", {message: message, to: phone});
        returnSucess(res, session, phone);
    } catch (error) {
        returnError(res, session, error);
    }
}

export async function sendImage(req, res) {
    const session = req.session;
    const {phone, caption, path, isGroup = false} = req.body;

    if (!phone)
        return res.status(401).send({message: "Telefone não informado."});

    if (!path)
        return res.status(401).send({
            message: "Informe o caminho da imagem. Exemplo: C:\\folder\\image.jpg."
        });

    try {

        for (const contato of contactToArray(phone)) {
            if (isGroup) {
                await req.client.sendImage(`${contato}@g.us`, path, "image-api.jpg", caption);
            } else {
                await req.client.sendImage(`${contato}@c.us`, path, "image-api.jpg", caption);
            }
        }

        returnSucess(res, session, phone);
    } catch (error) {
        returnError(res, session, error);
    }
}

export async function sendFile(req, res) {
    const session = req.session;
    const {phone, isGroup = false} = req.body;

    if (!req.file) {
        return res.status(400).json({status: "Error", message: "O envio do arquivo é obrigatório."});
    }

    const {filename: file} = req.file;
    path.resolve(req.file.destination, "WhatsAppImages", file);

    const caminho = `${process.env.HOST}:${process.env.PORT}/files/${file}`;

    try {
        for (const contato of contactToArray(phone)) {
            if (isGroup) {
                await req.client.sendFile(`${contato}@g.us`, caminho, "File", "");
            } else {
                await req.client.sendFile(`${contato}@c.us`, caminho, "File", "");
            }
        }

        returnSucess(res, session, phone);
    } catch (error) {
        returnError(res, session, error);
    }
}

export async function sendFile64(req, res) {
    const session = req.session;
    const {base64, phone, isGroup = false} = req.body;

    if (!base64)
        return res.status(401).send({message: "O base64 do arquivo não foi informado."});

    try {
        for (const contato of contactToArray(phone)) {
            if (isGroup) {
                await req.client.sendFileFromBase64(`${contato}@g.us`, base64, "My File", "");
            } else {
                await req.client.sendFileFromBase64(`${contato}@c.us`, base64, "My File", "");
            }
        }

        returnSucess(res, session, phone);
    } catch (error) {
        returnError(res, session, error);
    }
}

export async function sendVoice(req, res) {
    const {phone, url: base64Ptt, isGroup = false} = req.body;

    try {
        for (const contato of contactToArray(phone)) {
            if (isGroup) {
                await req.client.sendPttFromBase64(`${contato}@g.us`, base64Ptt, "Voice Audio");
            } else {
                await req.client.sendPttFromBase64(`${contato}@c.us`, base64Ptt, "Voice Audio");
            }
        }

        return res.status(200).json("success");
    } catch (e) {
        console.log(e);
        return res.status(400).json({status: "FAIL"});
    }
}

export async function sendLinkPreview(req, res) {
    const session = req.session;
    const {phone, url, caption, isGroup = false} = req.body;

    try {
        let response = {};

        for (const contato of contactToArray(phone)) {
            if (isGroup) {
                response = await req.client.sendLinkPreview(`${contato}@g.us`, url, caption);
            } else {
                response = await req.client.sendLinkPreview(`${contato}@c.us`, url, caption);
            }
        }

        return res.status(200).json({status: "Success", message: "O link foi enviado com sucesso."});
    } catch (error) {
        Logger.error(error);
        return res.status(400).json({status: "Erro ao enviar mensagem", log: error});
    }
}

export async function sendLocation(req, res) {
    const session = req.session;
    const {phone, lat, lng, title, isGroup = false} = req.body;

    try {
        let response = {};

        for (const contato of contactToArray(phone)) {
            if (isGroup) {
                response = await req.client.sendLocation(`${contato}@g.us`, lat, lng, title);
            } else {
                response = await req.client.sendLocation(`${contato}@c.us`, lat, lng, title);
            }
        }

        return res.status(200).json({status: "Success", message: "A localização foi enviada com sucesso."});
    } catch (error) {
        Logger.error(error);
        return res.status(400).json({status: "Erro ao enviar localização"});
    }
}

export async function sendStatusText(req, res) {
    const session = req.session;
    const {message} = req.body;

    try {
        await req.client.sendText("status@broadcast", message);
        return res.status(200).json({status: "Success", message: "A mensagem foi enviada com sucesso."});
    } catch (error) {
        Logger.error(error);
        return res.status(400).json({status: "Erro ao enviar mensagem"});
    }
}