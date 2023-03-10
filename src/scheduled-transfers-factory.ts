import { PoolCreated as PoolCreatedEvent } from "../generated/ScheduledTransfersFactory/ScheduledTransfersFactory";
import { HistoryEvent, Pool, Token } from "../generated/schema";
import { ERC20 } from "../generated/ScheduledTransfersFactory/ERC20";
import { ScheduledTransfers } from "../generated/templates";

export function handlePoolCreated(event: PoolCreatedEvent): void {
  ScheduledTransfers.create(event.params.pool);
  let pool = new Pool(event.params.pool.toHexString());
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
  pool.poolContract = event.params.pool;
  pool.owner = event.params.owner;
  pool.oracle = event.params.oracle;
  pool.token = token.id;
  pool.maxPrice = event.params.maxPrice;
  pool.createdTimestamp = event.block.timestamp;
  pool.createdBlock = event.block.number;

  let history = new HistoryEvent(
    `${event.address.toHexString()}-${event.transaction.hash.toHexString()}-PoolCreated`
  );
  history.txHash = event.transaction.hash;
  history.eventType = "PoolCreated";
  history.token = token.id;
  history.price = event.params.maxPrice;
  history.pool = pool.id;
  history.createdTimestamp = event.block.timestamp;
  history.createdBlock = event.block.number;
  history.save();

  token.save();
  pool.save();
}
