import Task, { TaskMode } from '../../src/task';

export type EulerLinearPoolDeployment = {
  Vault: string;
  ProtocolFeePercentagesProvider: string;
  BalancerQueries: string;
  WETH: string;
  FactoryVersion: string;
  PoolVersion: string;
  EULER_PROTOCOL: string;
};

const Vault = new Task('20210418-vault', TaskMode.READ_ONLY);
const ProtocolFeePercentagesProvider = new Task('20220725-protocol-fee-percentages-provider', TaskMode.READ_ONLY);
const BalancerQueries = new Task('20220721-balancer-queries', TaskMode.READ_ONLY);
const WETH = new Task('00000000-tokens', TaskMode.READ_ONLY);
const BaseVersion = { version: 1, deployment: '20221113-euler-rebalanced-linear-pool' };
const EULER_PROTOCOL = '0x27182842E098f60e3D576794A5bFFb0777E025d3';



export default {
  Vault,
  ProtocolFeePercentagesProvider,
  BalancerQueries,
  WETH,
  FactoryVersion: JSON.stringify({ name: 'EulerLinearPoolFactory', ...BaseVersion }),
  PoolVersion: JSON.stringify({ name: 'EulerLinearPool', ...BaseVersion }),
  EULER_PROTOCOL,
};
