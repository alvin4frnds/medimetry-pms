import { NextFunction, Request, Response } from 'express';
import { User } from '../../database/models/User';
import { config } from '../../config/Config';

export const AuthMiddleware = async function(req: Request, res: Response, next: NextFunction) {
    let token = req.headers.token;

    if (!token ) {
        if (!config.get("testAuthToken", false)) {
            return res.status(401).send({
                message: "Token not provided", success: 0
            });
        }

        if (config.get("testAuthToken")) {
            token = config.get("testAuthToken");
        }
    }

    const user = await User.getRepo().createQueryBuilder("user")
        .where("user.access_token = :token")
        .setParameters({token: token})
        .orderBy("user.id", "DESC")
        .getOne();
    if (typeof user === 'undefined' || !user)
        return res.status(401).send({
            message: "Invalid token", success: 0
        });

    const wpUserIds = [ user.user_id ];
    if (user.user_type === 'assistant' && user.meta["doctors"])
        user.meta["doctors"].forEach( doctor => {
            wpUserIds.push(doctor.doctor_id);
        });

    req.user = user;
    req["wpUserIds"] = wpUserIds;

    next();
};
