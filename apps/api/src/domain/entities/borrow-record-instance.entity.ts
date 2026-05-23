export interface BorrowRecordInstanceEntity {
  id: number;
  borrowRecordId: number;
  equipmentInstanceId: number;
  returnedAt: string | null;
}
