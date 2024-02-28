

/**
 *
 *
 * @export
 * @param {*} req
 * @param {*} res
 * @param {*} data
 * @param {*} status
 */
export function success (res, data, status, limit?, size?, page?, total?) {
    res.status(status || 200).send({
        data: data,
        limit: limit ? limit : null,
        size: size ? size : null, 
        page: page ? page : null,
        total: total ? total : null

    })
}

/**
 *
 *
 * @export
 * @param {*} req
 * @param {*} res
 * @param {*} message
 * @param {*} status
 * @param {*} details
 */
export function errorResponse (req, res, message, status, details) {
    console.log(details)
    res.status(status || 500).send({
        error: message,
        data: ''
    })
}

export async function encryptPassword (passwordString) {
    const saltRounds = 10
    const bcrypt = require("bcrypt")
    return await bcrypt.hash(passwordString, saltRounds, (err, hash ) => {
        if (err) return -1
        if (hash) return hash
    })

    
}