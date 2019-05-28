const AppConstants = {
    AVATAR_URL: 'https://dl.dropboxusercontent.com/s/vbbh9b8oo6wmuz8/blob.jpg?dl=0',
    UPLOAD_FILE_SIZE_LIMIT: 150 * 1024 * 1024,
    REGEX_USERNAME: /^[a-z0-9_-]{3,16}$/,
    REGEX_PASSWORD: /(?=.{8,})/,
    REGEX_NAME: /^(?!\s*$).+/,
    REGEX_ADDRESS: /^0x[a-zA-Z0-9]{40}$/,
    ADDRESS_0: '0x0000000000000000000000000000000000000000'
};
export default AppConstants;