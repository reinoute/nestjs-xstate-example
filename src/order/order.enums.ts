export enum Action {
  SetApprovalCode = 'setApprovalCode',
  SetReasonCancelled = 'setReasonCancelled',
}

export enum State {
  Idle = 'idle',
  Created = 'created',
  Approved = 'approved',
  Rejected = 'rejected',
  Cancelled = 'cancelled',
}
