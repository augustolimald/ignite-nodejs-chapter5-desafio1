import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class CreateTransfers1628560151977 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.changeColumn(
			'statements', 
			'type', 
			new TableColumn({
				name: 'type',
				type: 'enum',
				enum: ['deposit', 'withdraw', 'transfer:in', 'transfer:out']
			})
		);

		await queryRunner.addColumn(
			'statements', 
			new TableColumn({
				name: 'sender_id',
				type: 'integer',
				isNullable: true,
			})
		);

		await queryRunner.createForeignKey(
			'statements',
			new TableForeignKey({
				name: 'FKUserTransfer',
				columnNames: ['sender_id'],
				referencedTableName: 'users',
				referencedColumnNames: ['id'],
				onUpdate: 'CASCADE',
				onDelete: 'RESTRICT',
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.changeColumn(
			'statements', 
			'type', 
			new TableColumn({
				name: 'type',
				type: 'enum',
				enum: ['deposit', 'withdraw']
			})
		);

		await queryRunner.dropColumn('statements', 'sender_id');
	}

}
