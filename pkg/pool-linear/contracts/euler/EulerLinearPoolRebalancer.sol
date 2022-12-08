// SPDX-License-Identifier: GPL-3.0-or-later
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@balancer-labs/v2-interfaces/contracts/pool-utils/ILastCreatedPoolFactory.sol";
import "@balancer-labs/v2-solidity-utils/contracts/openzeppelin/SafeERC20.sol";
import "./interfaces/IEulerTokenMinimal.sol";

import "../LinearPoolRebalancer.sol";

contract EulerLinearPoolRebalancer is LinearPoolRebalancer {
    using SafeERC20 for IERC20;

    //solhint-disable-next-line var-name-mixedcase
    address public immutable eulerProtocol;

    // These Rebalancers can only be deployed from a factory to work around a circular dependency: the Pool must know
    // the address of the Rebalancer in order to register it, and the Rebalancer must know the address of the Pool
    // during construction.
    constructor(
        IVault vault,
        IBalancerQueries queries,
        address _eulerProtocol
    ) LinearPoolRebalancer(ILinearPool(ILastCreatedPoolFactory(msg.sender).getLastCreatedPool()), vault, queries) {
        eulerProtocol = _eulerProtocol;
    }

    function _wrapTokens(uint256 amount) internal override {
        // No referral code, depositing from underlying (i.e. DAI, USDC, etc. instead of aDAI or aUSDC). Before we can
        // deposit however, we need to approve the wrapper in the underlying token.

        // approve eulerProtocol
        _mainToken.safeApprove(eulerProtocol, amount);
        IEulerTokenMinimal(address(_wrappedToken)).deposit(0, amount);
    }

    function _unwrapTokens(uint256 amount) internal override {
        // Withdrawing into underlying (i.e. DAI, USDC, etc. instead of aDAI or aUSDC). Approvals are not necessary here
        // as the wrapped token is simply burnt.

        uint256 underlyingAmount = IEulerTokenMinimal(address(_wrappedToken)).convertBalanceToUnderlying(amount);

        // Transfer underlying tokens from Euler pool to sender, and decrease account's eTokens
        // function withdraw(uint subAccountId, uint amount) external;
        // param: subAccountId: 0 for primary, 1-255 for a sub-account
        // param: amount: In underlying units (use max uint256 for full pool balance)
        // https://github.com/euler-xyz/euler-contracts/blob/master/contracts/modules/EToken.sol#L177
        IEulerTokenMinimal(address(_wrappedToken)).withdraw(0, underlyingAmount);
    }

    function _getRequiredTokensToWrap(uint256 wrappedAmount) internal view override returns (uint256) {
        // Convert an eToken balance to an underlying amount, taking into account current exchange rate
        // input: balance: eToken balance, in internal book-keeping units (18 decimals)
        // returns: Amount in underlying units, (same decimals as underlying token)
        // https://docs.euler.finance/developers/getting-started/contract-reference
        uint256 amnt = IEulerTokenMinimal(address(_wrappedToken)).convertBalanceToUnderlying(wrappedAmount);
        return amnt + 1;
    }
}
