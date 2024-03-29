import { NextFunction, Request, Response } from 'express';
import * as HTTTPStatus from 'http-status-codes';
import { handleError, logger } from '../../core';
import { AppointmentService } from '../services';
import { Helpers } from '../../helpers';

export const find = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug(`GET /appointment : ${JSON.stringify(req.query)}`);
    const { filter = '{}' } = req.query;
    // @ts-ignore
    const result = await AppointmentService.find(JSON.parse(filter), Helpers.utils.buildPaginationQuery(req.query));
    logger.debug(`GET /appointment response: ${JSON.stringify(result)}`);
    res.status(HTTTPStatus.OK).json(result);
    return next();
  } catch (err) {
    return next(handleError(err));
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug(`GET /appointment/:id : ${JSON.stringify(req.params)}`);
    const { id } = req.params;
    const result = await AppointmentService.getById(id);
    logger.debug(`GET /appointment/:id response: ${JSON.stringify(result)}`);
    res.status(HTTTPStatus.OK).json(result);
    return next();
  } catch (err) {
    return next(handleError(err));
  }
};

export const deleteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug(`DELETE /appointment/:id : ${JSON.stringify(req.params)}`);
    const { id } = req.params;
    const result = await AppointmentService.deleteById(id);
    logger.debug(`DELETE /appointment/:id response: ${JSON.stringify(result)}`);
    res.status(HTTTPStatus.OK).json(result);
    return next();
  } catch (err) {
    return next(handleError(err));
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug(`POST /appointment : ${JSON.stringify(req.body)}`);
    const role = req.body;
    const result = await AppointmentService.create(role);
    logger.debug(`POST /appointment response: ${JSON.stringify(result)}`);
    res.status(HTTTPStatus.OK).json(result);
    return next();
  } catch (err) {
    return next(handleError(err));
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const role = req.body;
    logger.debug(`PUT /appointment/:id : ${JSON.stringify(id, role)}`);
    const result = await AppointmentService.update(id, role);
    logger.debug(`PUT /appointment/:id response: ${JSON.stringify(result)}`);
    res.status(HTTTPStatus.OK).json(result);
    return next();
  } catch (err) {
    return next(handleError(err));
  }
};
