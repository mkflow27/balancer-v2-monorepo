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

// has many ERC20 and additional functions
import "@balancer-labs/v2-solidity-utils/contracts/test/TestToken.sol";
import "@balancer-labs/v2-pool-utils/contracts/test/MaliciousQueryReverter.sol";


contract MockMaliciousEulerToken is TestToken, MaliciousQueryReverter{
    // from Euler docs:
    // in order to invest an asset to earn interest, you need to `deposit` into an eToken

    // Since the LinearPool deposits into Euler it could technically also borrow? but this would lock
    // liquidity of the LinearPool

    // since this contracts is a TestToken is already has the approve method. Meaning, the caller
    // can approve the MockEulerToken

    // TestToken already has approve. Meaning: Euler Market
    // is able to transfer tokens from the vault

    uint256 public exchangeRateMultiplicator;

    address public immutable ASSET;
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals,
        address asset
    ) TestToken(name, symbol, decimals) {
        exchangeRateMultiplicator = 1;
        ASSET = asset;
    }

    function convertBalanceToUnderlying(uint balance) external view returns (uint) {
        maybeRevertMaliciously();
        return balance*exchangeRateMultiplicator;
    }

    function setExchangeRateMultiplicator(uint256 _exchangeRateMultiplicator) external {
        require(_exchangeRateMultiplicator < 3, "Cannot set exchangeRateMultiplicator bigger 3");
        exchangeRateMultiplicator = _exchangeRateMultiplicator;
    }

    function underlyingAsset() external view returns (address) {
        return ASSET;
    }
}