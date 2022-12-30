import {
  ScheduleTransfer as ScheduleTransferEvent,
  CancelTransfer as CancelTransferEvent,
  Withdraw as WithdrawEvent,
  SetRedirect as SetRedirectEvent,
  ChangeOracle as ChangeOracleEvent,
  SetMaxPrice as SetMaxPriceEvent,
  WithdrawPayer as WithdrawPayerEvent,
} from "../generated/templates/ScheduledTransfers/ScheduledTransfers";
import { HistoryEvent, Payment, Pool, Token } from "../generated/schema";
import { ERC20 } from "../generated/ScheduledTransfersFactory/ERC20";

export function handleScheduleTransfer(event: ScheduleTransferEvent): void {
  let payment = new Payment(
    `${event.address.toHexString()}-${event.params.id.toHexString()}`
  );
  const pool = Pool.load(event.address.toHexString())!;
  payment.streamId = event.params.id;
  payment.token = pool.token;
  payment.usdAmount = event.params.usdAmount;
  payment.starts = event.params.starts;
  payment.ends = event.params.ends;
  payment.frequency = event.params.frequency;
  payment.lastPaid = event.params.starts;
  payment.pool = pool.id;
  payment.createdTimestamp = event.block.timestamp;
  payment.createdBlock = event.block.number;
  payment.save();

  let history = new HistoryEvent(
    `${event.address.toHexString()}-${event.params.id.toHexString()}-${event.transaction.hash.toHexString()}-ScheduleTransfer`
  );
  history.txHash = event.transaction.hash;
  history.eventType = "ScheduleTransfer";
  history.token = pool.token;
  history.usdAmount = event.params.usdAmount;
  history.to = event.params.to;
  history.pool = pool.id;
  history.payment = payment.id;
  history.createdTimestamp = event.block.timestamp;
  history.createdBlock = event.block.number;
  history.save();
}

export function handleCancelTransfer(event: CancelTransferEvent): void {
  let payment = Payment.load(
    `${event.address.toHexString()}-${event.params.id.toHexString()}`
  )!;
  payment.lastPaid = event.block.timestamp;
  payment.save();
  let history = new HistoryEvent(
    `${event.address.toHexString()}-${event.params.id.toHexString()}-${event.transaction.hash.toHexString()}-CancelTransfer`
  );
  history.txHash = event.transaction.hash;
  history.eventType = "CancelTransfer";
  history.pool = payment.pool;
  history.payment = payment.id;
  history.createdTimestamp = event.block.timestamp;
  history.createdBlock = event.block.number;
  history.save();
}

export function handleWithdraw(event: WithdrawEvent): void {
  let payment = Payment.load(
    `${event.address.toHexString()}-${event.params.id.toHexString()}`
  )!;
  payment.lastPaid = event.params.lastPaid;
  payment.save();
  let history = new HistoryEvent(
    `${event.address.toHexString()}-${event.params.id.toHexString()}-${event.transaction.hash.toHexString()}-Withdraw`
  );
  history.txHash = event.transaction.hash;
  history.eventType = "Withdraw";
  history.token = payment.token;
  history.usdAmount = payment.usdAmount;
  history.amount = event.params.owed;
  history.price = event.params.price;
  history.to = event.params.to;
  history.pool = payment.pool;
  history.payment = payment.id;
  history.createdTimestamp = event.block.timestamp;
  history.createdBlock = event.block.number;
  history.save();
}

export function handleSetRedirect(event: SetRedirectEvent): void {
  let payment = Payment.load(
    `${event.address.toHexString()}-${event.params.id.toHexString()}`
  )!;
  payment.redirects = event.params.redirectTo;
  payment.save();

  let history = new HistoryEvent(
    `${event.address.toHexString()}-${event.params.id.toHexString()}-${event.transaction.hash.toHexString()}-SetRedirect`
  );
  history.txHash = event.transaction.hash;
  history.eventType = "SetRedirect";
  history.to = event.params.redirectTo;
  history.pool = payment.pool;
  history.payment = payment.id;
  history.createdTimestamp = event.block.timestamp;
  history.createdBlock = event.block.number;
  history.save();
}

export function handleChangeOracle(event: ChangeOracleEvent): void {
  const pool = Pool.load(event.address.toHexString())!;
  pool.oracle = event.params.newOracle;
  pool.save();

  let history = new HistoryEvent(
    `${event.address.toHexString()}-${event.transaction.hash.toHexString()}-ChangeOracle`
  );
  history.txHash = event.transaction.hash;
  history.eventType = "ChangeOracle";
  history.pool = pool.id;
  history.to = event.params.newOracle;
  history.createdTimestamp = event.block.timestamp;
  history.createdBlock = event.block.number;
  history.save();
}

export function handleSetMaxPrice(event: SetMaxPriceEvent): void {
  const pool = Pool.load(event.address.toHexString())!;
  pool.maxPrice = event.params.newMaxprice;
  pool.save();

  let history = new HistoryEvent(
    `${event.address.toHexString()}-${event.transaction.hash.toHexString()}-SetMaxPrice`
  );
  history.txHash = event.transaction.hash;
  history.eventType = "SetMaxPrice";
  history.pool = pool.id;
  history.price = event.params.newMaxprice;
  history.createdTimestamp = event.block.timestamp;
  history.createdBlock = event.block.number;
  history.save();
}

export function handleWithdrawPayer(event: WithdrawPayerEvent): void {
  const pool = Pool.load(event.address.toHexString())!;
  let token = Token.load(event.params.token.toHexString());
  if (!token) {
    token = new Token(event.params.token.toHexString());
    token.address = event.params.token;
    const erc20 = ERC20.bind(event.params.token);
    const symbolCall = erc20.try_symbol();
    const nameCall = erc20.try_name();
    const decimalCall = erc20.try_decimals();
    if (!symbolCall.reverted) {
      token.symbol = symbolCall.value;
    }
    if (!nameCall.reverted) {
      token.name = nameCall.value;
    }
    if (!decimalCall.reverted) {
      token.decimals = decimalCall.value;
    }
  }
  token.save();
  let history = new HistoryEvent(
    `${event.address.toHexString()}-${event.transaction.hash.toHexString()}-WithdrawPayer`
  );
  history.txHash = event.transaction.hash;
  history.eventType = "WithdrawPayer";
  history.token = token.id;
  history.amount = event.params.amount;
  history.pool = pool.id;
  history.createdTimestamp = event.block.timestamp;
  history.createdBlock = event.block.number;
  history.save();
}
