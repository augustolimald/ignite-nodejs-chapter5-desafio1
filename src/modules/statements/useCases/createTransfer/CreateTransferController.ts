import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateTransferUseCase } from './CreateTransferUseCase';

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id } = request.user;
		const { user_id } = request.params;
    const { amount, description } = request.body;

    const createTransfer = container.resolve(CreateTransferUseCase);

    const statement = await createTransfer.execute({
      from_user_id: id,
      to_user_id: user_id,
      amount,
      description,
    });

    return response.status(201).json(statement);
  }
}
