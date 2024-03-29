import { NextFunction, Request, Response } from 'express';
import * as HTTPStatus from 'http-status-codes';
import { handleError, logger } from '../../core';
import { RoleService } from '../services';
import { Helpers } from '../../helpers';
import { Role } from '../models';

export const find = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug(`GET /role : ${JSON.stringify(req.query)}`);
    const { filter = '{}' } = req.query;
    // @ts-ignore
    const result = await RoleService.find(JSON.parse(filter), Helpers.utils.buildPaginationQuery(req.query));
    logger.debug(`GET /role response: ${JSON.stringify(result)}`);
    res.status(HTTPStatus.OK).json(result);
    return next();
  } catch (err) {
    return next(handleError(err));
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug(`GET /role/:id : ${JSON.stringify(req.params)}`);
    const { id } = req.params;
    const result = await RoleService.getById(id);
    logger.debug(`GET /role/:id response: ${JSON.stringify(result)}`);
    res.status(HTTPStatus.OK).json(result);
    return next();
  } catch (err) {
    return next(handleError(err));
  }
};

export const getRolePermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug(`GET /role/permisssions : ${JSON.stringify(req.params)}`);
    const { id } = req.params;
    const result = await RoleService.getRolePermissions(id);
    logger.debug(`GET /role/permissions response: ${JSON.stringify(result)}`);
    res.status(HTTPStatus.OK).json(result);
    return next();
  } catch (err) {
    return next(handleError(err));
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug(`POST /role : ${req.body}`);
    const role = req.body;
    const result = await RoleService.create(role);
    logger.debug(`POST /role response: ${JSON.stringify(result)}`);
    res.status(HTTPStatus.OK).json(result);
    return next();
  } catch (err) {
    return next(handleError(err));
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const role = req.body;
    logger.debug(`PUT /role/:id : ${JSON.stringify(id, role)}`);
    const result = await RoleService.update(id, role);
    logger.debug(`PUT /role/:id response: ${JSON.stringify(result)}`);
    res.status(HTTPStatus.OK).json(result);
    return next();
  } catch (err) {
    return next(handleError(err));
  }
};

export const updateRolePermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const permissions = req.body;
    logger.debug(`PUT /role/permisisions/:id  : ${JSON.stringify({ id, permissions })}`);
    const result = await RoleService.updateRolePermissions(id, permissions);
    logger.debug(`PUT /role/permissions/:id response: ${JSON.stringify(result)}`);
    res.status(HTTPStatus.OK).json(result);
    return next();
  } catch (err) {
    return next(handleError(err));
  }
};

export const deleteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug(`DELETE /role/:id : ${JSON.stringify(req.params)}`);
    const { id } = req.params;
    const result = await RoleService.deleteById(id);
    logger.debug(`DELETE /role/:id response: ${JSON.stringify(result)}`);
    res.status(HTTPStatus.OK).json(result);
    return next();
  } catch (err) {
    return next(handleError(err));
  }
};
