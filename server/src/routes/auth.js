import jwt from 'jwt-simple';
import moment from 'moment';
import {TOKEN_SECRET} from '../config';
import User from '../models/user';

/**
 * Creates a token using JWT that will be used to identify the user.
 * @param user
 * @returns {Calls|*|String}
 */
function createToken(user) {
    const payload = {
        exp: moment().add(14, 'days').unix(),
        iat: moment().unix(),
        sub: user._id
    };
    return jwt.encode(payload, TOKEN_SECRET);
}

/**
 * Ensures that the user is correctly authenticated to use a given service of the server.
 * @param req the request object sent by the user
 * @param res the response that will be sent back to the user by the server
 * @param next the next EpxressJS middleware that will be executed after this operation.
 * @returns {Socket|*}
 */
function ensureAuthenticated(req, res, next) {

    // Check if token is present in request
    if (!(req.headers && req.headers.authorization)) {
        return res.status(400).send({
            message: 'You did not provide a JSON Web Token in the authorization header.'
        });
    }

    // Decode the token
    var header = req.headers.authorization.split(' ');
    var token = header[1];
    var payload = jwt.decode(token, TOKEN_SECRET);
    var now = moment().unix();

    // Check if the token has expired
    if (now > payload.exp) {
        return res.status(401).send({
            message: 'Token has expired. '
        });
    }

    // Check if the user still exists in the DB
    User.findById(payload.sub, function(err, user) {
        if (!user) {
            return res.status(400).send({
                message: 'User no longer exists. '
            });
        }
        req.user = user;
        next();
    });
}

export {createToken, ensureAuthenticated};