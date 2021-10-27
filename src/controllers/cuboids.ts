import { Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { Id } from 'objection';
import { Cuboid, Bag } from '../models';

export const list = async (req: Request, res: Response): Promise<Response> => {
  const ids = req.query.ids as Id[];
  const cuboids = await Cuboid.query().findByIds(ids).withGraphFetched('bag');
  return res.status(200).json(cuboids);
};

export const get = async (req: Request, res: Response): Promise<Response> => {
  const id: Id = req.params.id;
  const cubo = await Cuboid.query().findById(id).withGraphFetched('cuboids');
  if (!cubo) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }
  return res.status(200).json(cubo);
};

export const create = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { width, height, depth, bagId } = req.body;
  const bag = await Bag.query().findById(bagId).withGraphFetched('cuboids');
  const volume = width * height * depth;
  if (!bag) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }

  if (Number(volume) > Number(bag.volume)) {
    return res
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .json({ message: 'Insufficient capacity in bag' });
  }
  const cuboid = await Cuboid.query().insert({
    width,
    height,
    depth,
    bagId,
  });

  return res.status(HttpStatus.CREATED).json(cuboid);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: Id = req.params.id;
  const { width, height, depth, bagId } = req.body;
  const cubo = await Cuboid.query().findById(id).withGraphFetched('cuboids');
  if (!cubo) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }
  const newCube = {
    ...cubo,
    width,
    height,
    depth,
  };
  const updated = await Cuboid.query().update(newCube);
  return res.status(200).json(updated);
};
