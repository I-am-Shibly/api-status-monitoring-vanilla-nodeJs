const fs = require('fs')
const path = require('path')

const lib = {}

lib.basedir = path.join(__dirname, '/../.data/')

lib.create = (dir, file, data, callback) => {
    fs.open(lib.basedir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // convert data to string
            const stringData = JSON.stringify(data)

            // write data to file and then close it
            fs.writeFile(fileDescriptor, stringData, (err2) => {
                if (!err2) {
                    fs.close(fileDescriptor, (err3) => {
                        if (!err3) {
                            callback(false)
                        } else {
                            callback('error closing the new file!')
                        }
                    })
                } else {
                    callback('error writing to new file')
                }
            })
        } else {
            callback("Couldn't create new file, it may already exist!")
        }
    })
}

lib.read = (dir, file, callback) => {
    fs.readFile(lib.basedir + dir + '/' + file + '.json', 'utf8', (err, data) => {
        callback(err, data)
    })
}

lib.update = (dir, file, data, callback) => {
    fs.open(lib.basedir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // convert data to string
            const stringData = JSON.stringify(data)

            // truncate the file
            fs.ftruncate(fileDescriptor, (err2) => {

                if (!err2) {
                    fs.writeFile(fileDescriptor, stringData, (err3) => {

                        if (!err3) {
                            fs.close(fileDescriptor, (err4) => {

                                if (!err4) {
                                    callback(false)
                                } else {
                                    callback('error closing file!')
                                }
                            })
                        } else {
                            callback('error writing to the file!')
                        }
                    })
                } else {
                    callback('error truncating file!')
                }
            })
        } else {
            callback("error updating... file may not exist!")
        }
    })
}

lib.delete = (dir, file, callback) => {
    fs.unlink(lib.basedir + dir + '/' + file + '.json', (err) => {
        if (!err) {
            callback(false)
        } else {
            callback(err)
        }
    })
}

lib.list = (dir, callback) => {
    fs.readdir(lib.basedir + dir + '/', (err, fileNames) => {
        if (!err && fileNames && fileNames.length > 0) {
            let trimmedFileNames = []
            fileNames.forEach(fileName => {
                trimmedFileNames.push(fileName.replace('.json', ''))
            })
            callback(false, trimmedFileNames)
        } else {
            callback('Error reading directory!')
        }
    })
}

module.exports = lib