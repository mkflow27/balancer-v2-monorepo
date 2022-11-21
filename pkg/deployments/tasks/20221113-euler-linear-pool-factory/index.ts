import Task from '../../src/task';
import { TaskRunOptions } from '../../src/types';
import { EulerLinearPoolDeployment } from './input';

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as EulerLinearPoolDeployment;
  const args = [input.Vault, input.ProtocolFeePercentagesProvider, input.BalancerQueries];

  await task.deployAndVerify('EulerLinearPoolFactory', args, from, force);
};
