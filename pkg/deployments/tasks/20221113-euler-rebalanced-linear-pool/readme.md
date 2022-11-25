# 2022-11-15 - Aave Rebalanced Linear Pool

Deployment of the `EulerLinearPoolFactory`, for Linear Pools with a Euler Token (eToken). This new deployment includes:

- A fix for the `AaveLinearPool` being susceptible to spoofed revert data from the external call to fetch the wrapped token rate, potentially resulting in manipulation of the exchange rate used by `AaveLinearPoolRebalancer`.
- A fix for the `AaveLinearPoolRebalancer` to handle tokens which do not allow setting an approval without first setting the approval to zero.

## Useful Files

- [`EulerLinearPool` ABI](./abi/EulerLinearPool.json)
- [`EulerLinearPoolFactory` ABI](./abi/EulerLinearPoolFactory.json)
- [`EulerLinearPoolRebalancer` ABI](./abi/EulerLinearPoolRebalancer.json)
