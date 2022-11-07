// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

interface IEulerTokenMinimal {
    function decimals() external view returns (uint256);

    function convertBalanceToUnderlying(uint256) external view returns (uint256);

    function deposit(uint256 subAccountId, uint256 amount) external;

    function withdraw(uint256 subAccountId, uint256 amount) external;

    function underlyingAsset() external view returns (address);
}