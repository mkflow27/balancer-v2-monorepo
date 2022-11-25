import Task, { TaskMode } from '../../src/task';

export type EulerLinearPoolDeployment = {
  Vault: string;
  ProtocolFeePercentagesProvider: string;
  BalancerQueries: string;
  WETH: string;
  FactoryVersion: string;
  PoolVersion: string;
};

const Vault = new Task('20210418-vault', TaskMode.READ_ONLY);
const ProtocolFeePercentagesProvider = new Task('20220725-protocol-fee-percentages-provider', TaskMode.READ_ONLY);
const BalancerQueries = new Task('20220721-balancer-queries', TaskMode.READ_ONLY);
const WETH = new Task('00000000-tokens', TaskMode.READ_ONLY);
const BaseVersion = { version: 1, deployment: '20221113-euler-rebalanced-linear-pool' };



export default {
  Vault,
  ProtocolFeePercentagesProvider,
  BalancerQueries,
  WETH,
  FactoryVersion: JSON.stringify({ name: 'EulerLinearPoolFactory', ...BaseVersion }),
  PoolVersion: JSON.stringify({ name: 'EulerLinearPool', ...BaseVersion }),
};
