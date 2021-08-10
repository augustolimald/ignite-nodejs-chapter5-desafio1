import { User } from "../../../users/entities/User";
import { Statement } from "../../entities/Statement";
import { CreateTransferError } from "./CreateTransferError";
import { CreateTransferUseCase } from "./CreateTransferUseCase";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";

let user1: User;
let user2: User;
let statement: Statement;
let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;
let createTransferUseCase: CreateTransferUseCase;

enum OperationType {
	DEPOSIT = 'deposit',
	WITHDRAW = 'withdraw',
}

describe('Create Statement test cases', () => {
	beforeAll(async () => {
		usersRepository = new InMemoryUsersRepository();
		statementsRepository = new InMemoryStatementsRepository();
		getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);
		createTransferUseCase = new CreateTransferUseCase(usersRepository, statementsRepository);

		user1 = await usersRepository.create({
			name: 'Fulano da Silva',
			email: 'fulano.silva@gmail.com',
			password: '1234',
		});

		user2 = await usersRepository.create({
			name: 'João da Silva',
			email: 'joao.silva@gmail.com',
			password: '1234',
		});

		statement = await statementsRepository.create({
			user_id: user1.id as string,
			sender_id: null,
			type: 'deposit' as OperationType,
			amount: 100,
			description: 'Depósito',
		});
	});
	
	it('should be able to transfer between two accounts', async () => {
		await createTransferUseCase.execute({
			from_user_id: user1.id as string,
			to_user_id: user2.id as string,
			amount: 50,
			description: 'Transferência'
		});

		const { balance: balance1 } = await getBalanceUseCase.execute({ user_id: user1.id as string });
		expect(balance1).toEqual(50);

		const { balance: balance2 } = await getBalanceUseCase.execute({ user_id: user2.id as string });
		expect(balance2).toEqual(50);
	});

	it('should not be able to transfer between two accounts without funds', async () => {
		await expect(
			createTransferUseCase.execute({
				from_user_id: user1.id as string,
				to_user_id: user2.id as string,
				amount: 120,
				description: 'Transferência'
			})
		).rejects.toEqual(new CreateTransferError.InsufficientFunds());

		const { balance: balance1 } = await getBalanceUseCase.execute({ user_id: user1.id as string });
		expect(balance1).toEqual(50);

		const { balance: balance2 } = await getBalanceUseCase.execute({ user_id: user2.id as string });
		expect(balance2).toEqual(50);
	});
});