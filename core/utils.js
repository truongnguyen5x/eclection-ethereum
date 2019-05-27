const AppConstant = require('./app_constants');
const bcrypt = require('bcrypt');

const Utils = {
    addFileExtension: function (file) {
        const {mimetype, originalname} = file;
        if (mimetype === 'image/jpeg' && !originalname.endsWith('.jpg')) {
            return file.originalname + '.jpg'
        }
        if (mimetype === 'image/png' && !originalname.endsWith('.png')) {
            return file.originalname + '.png'
        }
        return originalname
    },
    convertLinkDropbox: (originalUrl) => {
        return originalUrl.replace('https://www.dropbox.com', 'https://dl.dropboxusercontent.com');
    },
    convertToDDMMMYYY: (originDate) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const date = new Date(originDate);
        return date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
    },
    uploadImageFile: async function (file) {
        const fileName = this.addFileExtension(file);
        const path = '/image/' + fileName;
        const fetch = require('isomorphic-fetch');
        const Dropbox = require('dropbox').Dropbox;
        const dropbox = new Dropbox({
            accessToken: AppConstant.ACCESS_TOKEN_DROPBOX,
            fetch: fetch
        });
        const response1 = await dropbox.filesUpload({
            path: path,
            mode: "add",
            autorename: true,
            mute: false,
            strict_conflict: false,
            contents: file.buffer
        });
        const path_display = response1.path_display;
        const response2 = await dropbox.sharingCreateSharedLinkWithSettings({
            path: path_display,
            settings: {requested_visibility: 'public'}
        });
        return response2
    },

    deleteImageFile: (filePath) => {
        if (filePath === AppConstant.AVATAR_URL) {
            return;
        }
        const url = decodeURI(filePath);
        const regex = /https:\/\/dl.dropboxusercontent.com\/s\/[a-zA-Z0-9]+\/(.+)\?dl=0/;
        const result = url.match(regex);
        const path = '/image/' + result[1];
        console.log('Image delete path', path);
        const fetch = require('isomorphic-fetch');
        const Dropbox = require('dropbox').Dropbox;
        const dropbox = new Dropbox({
            accessToken: AppConstant.ACCESS_TOKEN_DROPBOX,
            fetch: fetch
        });
         dropbox.filesDeleteV2({
            path: path,
        });

    },
    bcrypt: (password) => {
        return bcrypt.hashSync(password, 9);
    }
};
module.exports = Utils;