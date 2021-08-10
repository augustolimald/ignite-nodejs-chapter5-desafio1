import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferError } from "./CreateTransferError";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

enum OperationType {
	TRANSFERIN= 'transfer:in',
	TRANSFEROUT= 'transfer:out',
}

@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ from_user_id, to_user_id, amount, description }: ICreateTransferDTO) {
    const from_user = await this.usersRepository.findById(from_user_id);
    if(!from_user) {
      throw new CreateTransferError.UserNotFound();
    }

		const to_user = await this.usersRepository.findById(to_user_id);
    if(!to_user) {
      throw new CreateTransferError.UserNotFound();
    }

		const { balance } = await this.statementsRepository.getUserBalance({ user_id: from_user_id });
		if (balance < amount) {
			throw new CreateTransferError.InsufficientFunds()
		}

    const statementOut = await this.statementsRepository.create({
      user_id: from_user_id,
      sender_id: null,
      type: 'transfer:out' as OperationType,
      amount,
      description
    });

		const statementIn = await this.statementsRepository.create({
      user_id: to_user_id,
      sender_id: from_user_id,
      type: 'transfer:in' as OperationType,
      amount,
      description
    });

    return statementOut;
  }
}
