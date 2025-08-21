const morgan = require('morgan');
const fs = require('fs');

const accessLog = morgan('combined', {

    stream: {
        write: (message) => {
            console.log(message);
            fs.appendFileSync('logs/access.log', message); // Lưu log vào file access.log
        }
    }
});

const clearAccessLog = () => {
    fs.writeFileSync('logs/access.log', '');
}

module.exports = { accessLog, clearAccessLog };