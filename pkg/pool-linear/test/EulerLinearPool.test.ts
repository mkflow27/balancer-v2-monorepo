import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';

import { bn, fp } from '@balancer-labs/v2-helpers/src/numbers';
import { sharedBeforeEach } from '@balancer-labs/v2-common/sharedBeforeEach';
import * as expectEvent from '@balancer-labs/v2-helpers/src/test/expectEvent';

import Token from '@balancer-labs/v2-helpers/src/models/tokens/Token';
import TokenList from '@balancer-labs/v2-helpers/src/models/tokens/TokenList';
import LinearPool from '@balancer-labs/v2-helpers/src/models/pools/linear/LinearPool';

import { deploy } from '@balancer-labs/v2-helpers/src/contract';
import Vault from '@balancer-labs/v2-helpers/src/models/vault/Vault';
import { ZERO_ADDRESS } from '@balancer-labs/v2-helpers/src/constants';

describe('EulerLinearPool', function () {
  let vault: Vault;
  let pool: LinearPool, tokens: TokenList, mainToken: Token, wrappedToken: Token;
  let poolFactory: Contract;
  let mockLendingPool: Contract;
  let trader: SignerWithAddress, lp: SignerWithAddress, owner: SignerWithAddress;

  const POOL_SWAP_FEE_PERCENTAGE = fp(0.01);

  before('setup', async () => {
    [, lp, trader, owner] = await ethers.getSigners();
  });

  sharedBeforeEach('deploy tokens', async () => {
    mainToken = await Token.create('DAI');
    const wrappedTokenInstance = await deploy('MockEulerToken', { args: ['cDAI,', 'cDAI', 18, mainToken.address] });
    wrappedToken = await Token.deployedAt(wrappedTokenInstance.address);

    tokens = new TokenList([mainToken, wrappedToken]).sort();
    mockLendingPool = wrappedTokenInstance;

    await tokens.mint({ to: [lp, trader], amount: fp(100) });
  });

  sharedBeforeEach('deploy pool factory', async () => {
    vault = await Vault.create();
    const queries = await deploy('v2-standalone-utils/BalancerQueries', { args: [vault.address] });
    poolFactory = await deploy('EulerLinearPoolFactory', {
      args: [vault.address, vault.getFeesProvider().address, queries.address],
    });
  });

  sharedBeforeEach('deploy and initialize pool', async () => {
    const tx = await poolFactory.create(
      'Euler Balancer Pool Token',
      'EBPT',
      mainToken.address,
      wrappedToken.address,
      bn(0),
      POOL_SWAP_FEE_PERCENTAGE,
      owner.address
    );

    const receipt = await tx.wait();
    const event = expectEvent.inReceipt(receipt, 'PoolCreated');

    pool = await LinearPool.deployedAt(event.args.pool);
  });

  describe('asset managers', async () => {
    it('sets the same asset manager for main and wrapped token', async () => {
      const poolId = await pool.getPoolId();

      const { assetManager: firstAssetManager } = await vault.getPoolTokenInfo(poolId, tokens.first);
      const { assetManager: secondAssetManager } = await vault.getPoolTokenInfo(poolId, tokens.second);

      expect(firstAssetManager).to.equal(secondAssetManager);
    });

    it('sets the no asset manager for the BPT', async () => {
      const poolId = await pool.getPoolId();
      const { assetManager } = await vault.getPoolTokenInfo(poolId, pool.address);
      expect(assetManager).to.equal(ZERO_ADDRESS);
    });

    describe('getWrappedTokenRate', () => {
      it('returns the expected value', async () => {
        expect(await pool.getWrappedTokenRate()).to.be.eq(bn(1e18));

        // change exchangeRate at the EulerToken
        await mockLendingPool.setExchangeRateMultiplicator(2);
        expect(await pool.getWrappedTokenRate()).to.be.eq(bn(2e18));

        // change exchangeRate at the EulerToken
        await mockLendingPool.setExchangeRateMultiplicator(1);
        expect(await pool.getWrappedTokenRate()).to.be.eq(bn(1e18));
      });
    });

    describe('constructor', () => {
      it('reverts if the mainToken is not the ASSET of the wrappedToken', async () => {
        const otherToken = await Token.create('USDC');

        await expect(
          poolFactory.create(
            'Balancer Pool Token',
            'BPT',
            otherToken.address,
            wrappedToken.address,
            bn(0),
            POOL_SWAP_FEE_PERCENTAGE,
            owner.address
          )
        ).to.be.revertedWith('TOKENS_MISMATCH');
      });
    });
  });
});
