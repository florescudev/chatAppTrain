/**
 * Created by Magnus Compus on 3/26/2020.
 */
const moment = require('moment');

function formatMessage(userName, text) {
    return {
        userName,
        text,
        time: moment().format('h:mm a:')
    }
}

module.exports = formatMessage;