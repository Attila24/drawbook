import jwt from 'jwt-simple';
import moment from 'moment';
import {TOKEN_SECRET} from '../config';
import User from '../db/models/user';

function createToken(user) {
    const payload = {
        exp: moment().add(14, 'days').unix(),
        iat: moment().unix(),
        sub: user._id
    };
    return jwt.encode(payload, TOKEN_SECRET); // TODO: make secret config
}

function ensureAuthenticated(req, res, next) {
    if (!(req.headers && req.headers.authorization)) {
        return res.status(400).send({
            message: 'You did not provide a JSON Web Token in the authorization header.'
        });
    }

    // decode the token
    var header = req.headers.authorization.split(' ');
    var token = header[1];
    var payload = jwt.decode(token, TOKEN_SECRET);
    var now = moment().unix();

    // check if the token has expired
    if (now > payload.exp) {
        return res.status(401).send({
            message: 'Token has expired. '
        });
    }

    // check if the user still exists in the db
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