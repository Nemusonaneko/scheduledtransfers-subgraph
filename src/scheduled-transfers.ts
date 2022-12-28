import {
  ScheduleTransfer as ScheduleTransferEvent,
  CancelTransfer as CancelTransferEvent,
  Withdraw as WithdrawEvent,
  SetRedirect as SetRedirectEvent,
  ChangeOracle as ChangeOracleEvent,
  SetMaxPrice as SetMaxPriceEvent,
} from "../generated/templates/ScheduledTransfers/ScheduledTransfers";
import { Payment, Pool } from "../generated/schema";

export function handleScheduleTransfer(event: ScheduleTransferEvent): void {
  let payment = new Payment(
    `${event.address.toHexString()}-${event.params.id.toHexString()}`
  );
  const pool = Pool.load(event.address.toHexString())!;
  payment.streamId = event.params.id;
  payment.payee = event.params.to;
  payment.usdAmount = event.params.usdAmount;
  payment.starts = event.params.starts;
  payment.ends = event.params.ends;
  payment.frequency = event.params.frequency;
  payment.lastPaid = event.params.starts;
  payment.pool = pool.id;
  payment.createdTimestamp = event.block.timestamp;
  payment.createdBlock = event.block.number;
}

export function handleCancelTransfer(event: CancelTransferEvent): void {
  let payment = Payment.load(
    `${event.address.toHexString()}-${event.params.id.toHexString()}`
  )!;
  payment.lastPaid = event.block.timestamp;
  payment.save();
}

export function handleWithdraw(event: WithdrawEvent): void {
  let payment = Payment.load(
    `${event.address.toHexString()}-${event.params.id.toHexString()}`
  )!;
  payment.lastPaid = event.params.lastPaid;
  payment.save();
}

export function handleSetRedirect(event: SetRedirectEvent): void {
  let payment = Payment.load(
    `${event.address.toHexString()}-${event.params.id.toHexString()}`
  )!;
  payment.redirects = event.params.redirectTo;
  payment.save();
}

export function handleChangeOracle(event: ChangeOracleEvent): void {
  const pool = Pool.load(event.address.toHexString())!;
  pool.oracle = event.params.newOracle;
  pool.save();
}

export function handleSetMaxPrice(event: SetMaxPriceEvent): void {
  const pool = Pool.load(event.address.toHexString())!;
  pool.maxPrice = event.params.newMaxprice;
  pool.save();
}
