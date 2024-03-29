import { Request } from 'express';
import { Account } from '../../types';
import { Attempt, Jwt, User } from '../../models';
import { Helpers } from '../../../helpers';
import { logger } from '../../../core';

export const login = async (email: string, password: string, rememberMe = false, req: Request): Promise<Account> => {
  // Look up by the email address.
  // (note that we lowercase it to ensure the lookup is always case-insensitive
  // regardless of wich database we're using)
  const userRecord = await User.findOne({ email: email.toLowerCase() }).populate('roles');

  // If there was no matching user, respond thru the "badCombo" exit.
  if (!userRecord) {
    throw 'badCombo';
  }

  //  If the password doesn't match, then also exit thru "badCombo" exit.
  const isValidPassword = await Helpers.utils.passwords.checkPassword(password, userRecord.password);
  if (!isValidPassword) throw 'badCombo'; // .intercept('incorrect', 'badCombo');

  /**
   * If "Remember Me" was enabled, then keep the session alive for
   * a longer amount of time. (This causes an updated "Set Cookie"
   * response header to be sent as the result of this request -- thus
   * we must dealing with a traditional HTTP request in order for
   * this to work.)
   */
  if (rememberMe && req.socket) {
    logger.warn(
      'Received `rememberMe: true` from a virtaul request, but it was ignored\n' +
        "because a browser's session cookie cannot be reset over sockets.\n" +
        'Please use a traditional HTTP request instead.',
    );
  }

  const address = await Helpers.utils.addressFromRequest(req);

  const attempt = {
    user: userRecord.id,
    successful: true,
    ...address,
  };

  // @ts-ignore
  new Attempt(attempt).save((err) => {
    if (err) logger.warn(err);
  });

  // Returns the token immedately
  const jwtData = await Helpers.token.createToken(req, userRecord, rememberMe);
  const jwt = await new Jwt({ token: jwtData.token, expires: jwtData.expires, owner: userRecord.id }).save();
  if (!jwt) throw 'JSON web token could not be created';

  // Send success response (this is where the session actually gets persisted)
  return {
    ...userRecord.toJSON(),
    accessToken: jwtData.token || 'token',
    refreshToken: jwtData.expires || 'expires',
  };
};
