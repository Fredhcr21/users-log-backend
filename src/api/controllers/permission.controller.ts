import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status-codes';
import { handleError, logger } from '../../core';
import { Helpers } from '../../helpers';
import { PermissionService } from '../services';

export const find = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug(`GET /permission/find : ${JSON.stringify(req.query)}`);
    const { filter = '{}' } = req.query;
    // @ts-ignore
    const result = await PermissionService.find(JSON.parse(filter), Helpers.utils.buildPaginationQuery(req.query));
    logger.debug(`GET /permission response: ${JSON.stringify(result)}`);
    res.status(HTTPStatus.OK).json(result);
    return next();
  } catch (err) {
    return next(handleError(err));
  }
};
