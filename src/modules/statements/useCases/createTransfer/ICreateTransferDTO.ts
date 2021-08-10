export interface ICreateTransferDTO {
	from_user_id: string; 
	to_user_id: string;
	amount: number; 
	description: string; 
}